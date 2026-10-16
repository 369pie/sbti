'use client';

/**
 * WTFTI Time Assets · 云端同步层（Phase A · docs/01-strategy/wtfti-emotion-value-research-and-redesign-2026-08.md §4.3）
 *
 * 职责：把 localStorage 里的时间资产（星尘信 / 月相进度 / future letter / galaxy 结果）
 * 与 /api/wtfti/assets 做双向合并——本地即时写（离线可用），后台 debounce 推送，
 * 服务端返回 canonical 状态后回写本地。首次同步即完成旧本地数据的静默迁移。
 *
 * 约束：
 *  - 不 import 三个存储 lib（避免循环依赖），直接按既定 key 读写 localStorage；
 *  - 失败静默（本地模式照常可用）；无 Supabase env 时整层跳过；
 *  - 单飞（in-flight 复用）+ 冷却窗口（默认 60s，force 可越过）。
 */

import { getOrCreateAnonymousSession } from '@/lib/supabase/auth';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';
import type {
  WtftiAssetsState,
  WtftiDuetSessionPayload,
  WtftiGalaxySessionPayload,
  WtftiLetterPayload,
  WtftiMoonPayload,
} from '@/lib/wtfi/time-assets-types';

// 与 galaxy-session.ts / letters-archive.ts / lunar-chapters.ts 中的 key 保持一致
const GALAXY_LATEST_KEY = 'wtfti.galaxy.session.v1';
const GALAXY_RESULT_KEY_PREFIX = 'wtfti.galaxy.session.v1.';
const LETTERS_KEY = 'wtfti.letters.v1';
const MOON_KEY = 'wtfti:moon:chapters';
const FUTURE_LETTER_KEY = 'wtfti:future-letter';
const PENDING_DELETES_KEY = 'wtfti.sync.deletes.v1';
const DUET_KEY = 'wtfti.duet.sessions.v1';

const DEBOUNCE_MS = 2500;
const COOLDOWN_MS = 60_000;
const GALAXY_SYNC_CAP = 50;

let inFlight: Promise<WtftiAssetsState | null> | null = null;
let lastSyncAt = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function safeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(ls: Storage, key: string): T | null {
  try {
    const raw = ls.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// ─── 本地资产收集 ──────────────────────────────────────────────

function gatherLocalGalaxy(ls: Storage): WtftiGalaxySessionPayload[] {
  const sessions: WtftiGalaxySessionPayload[] = [];
  const seen = new Set<string>();
  const latest = readJson<WtftiGalaxySessionPayload & { result: unknown }>(ls, GALAXY_LATEST_KEY);
  if (latest?.resultId) {
    sessions.push(toGalaxyPayload(latest));
    seen.add(latest.resultId);
  }
  for (let i = 0; i < ls.length; i += 1) {
    const key = ls.key(i);
    if (!key || !key.startsWith(GALAXY_RESULT_KEY_PREFIX)) continue;
    const session = readJson<WtftiGalaxySessionPayload & { result: unknown }>(ls, key);
    if (session?.resultId && !seen.has(session.resultId)) {
      sessions.push(toGalaxyPayload(session));
      seen.add(session.resultId);
    }
  }
  return sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, GALAXY_SYNC_CAP);
}

function toGalaxyPayload(s: {
  resultId?: unknown;
  createdAt?: unknown;
  personalitySlug?: unknown;
  result?: unknown;
  soulAnswers?: unknown;
}): WtftiGalaxySessionPayload {
  const homePlanet = (s.result as { homePlanet?: { slug?: string } } | null)?.homePlanet?.slug;
  return {
    resultId: String(s.resultId ?? ''),
    createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date().toISOString(),
    personalitySlug: String(s.personalitySlug ?? ''),
    homePlanetSlug: typeof homePlanet === 'string' ? homePlanet : null,
    result: s.result ?? null,
    soulAnswers: s.soulAnswers ?? undefined,
  };
}

function gatherLocalLetters(ls: Storage): WtftiLetterPayload[] {
  const raw = readJson<Array<Record<string, unknown>>>(ls, LETTERS_KEY);
  const letters: WtftiLetterPayload[] = (Array.isArray(raw) ? raw : [])
    .filter((l) => typeof l.id === 'string' && typeof l.text === 'string' && typeof l.sealedAt === 'string' && typeof l.dueAt === 'string')
    .map((l) => ({
      id: l.id as string,
      kind: l.kind === 'retest' ? 'retest' : 'sealed',
      text: String(l.text).slice(0, 480),
      title: null,
      sealedAt: l.sealedAt as string,
      dueAt: l.dueAt as string,
      personalitySlug: (l.personalitySlug as string | undefined) ?? null,
      planetSlug: null,
      opened: l.opened === true,
    }));

  const future = readJson<Record<string, unknown>>(ls, FUTURE_LETTER_KEY);
  if (future && typeof future.sealedAt === 'string' && typeof future.revealAt === 'string' && typeof future.body === 'string') {
    letters.push({
      id: `future:${future.sealedAt}`,
      kind: 'future',
      text: String(future.body).slice(0, 480),
      title: typeof future.title === 'string' ? future.title : null,
      sealedAt: future.sealedAt,
      dueAt: future.revealAt,
      personalitySlug: null,
      planetSlug: (future.planetSlug as string | undefined) ?? null,
      opened: false,
    });
  }
  return letters;
}

function gatherLocalMoon(ls: Storage): WtftiMoonPayload | null {
  const moon = readJson<Record<string, unknown>>(ls, MOON_KEY);
  if (!moon) return null;
  return {
    done: Array.isArray(moon.done) ? (moon.done as number[]) : [],
    answers: (moon.answers as Record<string, number>) ?? {},
    crownedAt: (moon.crownedAt as string | null) ?? null,
    title: (moon.title as string | null) ?? null,
  };
}

function gatherLocalDuets(ls: Storage): WtftiDuetSessionPayload[] {
  const raw = readJson<Array<Record<string, unknown>>>(ls, DUET_KEY);
  return (Array.isArray(raw) ? raw : [])
    .filter(
      (d) =>
        typeof d?.id === 'string' &&
        typeof d?.mySlug === 'string' &&
        typeof d?.partnerSlug === 'string' &&
        d?.pairData != null &&
        typeof d?.pairData === 'object' &&
        typeof d?.createdAt === 'string',
    )
    .map((d) => d as unknown as WtftiDuetSessionPayload)
    .slice(0, 20);
}

function takePendingDeletes(ls: Storage): string[] {
  const raw = readJson<string[]>(ls, PENDING_DELETES_KEY);
  const ids = Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [];
  if (ids.length > 0) {
    try {
      ls.removeItem(PENDING_DELETES_KEY);
    } catch {
      /* ignore */
    }
  }
  return ids;
}

// ─── canonical 回写 ────────────────────────────────────────────

function writeBackState(ls: Storage, state: WtftiAssetsState): void {
  // letters：服务端 sealed/retest 与本地按 id 并集（防止同步期间的新写入被覆盖）
  const localLetters = gatherLocalLetters(ls);
  const serverLetters = state.letters.filter((l) => l.kind !== 'future');
  const serverIds = new Set(serverLetters.map((l) => l.id));
  const merged = [
    ...serverLetters.map((l) => ({
      id: l.id,
      text: l.text,
      sealedAt: l.sealedAt,
      dueAt: l.dueAt,
      personalitySlug: l.personalitySlug ?? undefined,
      opened: l.opened,
      kind: l.kind === 'retest' ? ('retest' as const) : ('sealed' as const),
    })),
    ...localLetters.filter((l) => !serverIds.has(l.id) && l.kind !== 'future'),
  ];
  if (merged.length > 0) {
    try {
      ls.setItem(LETTERS_KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
  }

  // future letter：服务端有则回写（本地无或更旧时）
  const serverFuture = state.letters.find((l) => l.kind === 'future');
  if (serverFuture) {
    const local = readJson<Record<string, unknown>>(ls, FUTURE_LETTER_KEY);
    const localSealed = typeof local?.sealedAt === 'string' ? Date.parse(local.sealedAt) : 0;
    if (Date.parse(serverFuture.sealedAt) > localSealed) {
      try {
        ls.setItem(
          FUTURE_LETTER_KEY,
          JSON.stringify({
            sealedAt: serverFuture.sealedAt,
            revealAt: serverFuture.dueAt,
            title: serverFuture.title ?? '',
            body: serverFuture.text,
            planetSlug: serverFuture.planetSlug ?? undefined,
          }),
        );
      } catch {
        /* ignore */
      }
    }
  }

  // moon：并集合并，加冕单调
  if (state.moon) {
    const local = gatherLocalMoon(ls);
    const done = [...new Set([...(state.moon.done ?? []), ...(local?.done ?? [])])].sort((a, b) => a - b);
    const answers = { ...(state.moon.answers ?? {}), ...(local?.answers ?? {}) };
    try {
      ls.setItem(
        MOON_KEY,
        JSON.stringify({
          done,
          answers,
          crownedAt: state.moon.crownedAt ?? local?.crownedAt ?? undefined,
          title: state.moon.title ?? local?.title ?? undefined,
        }),
      );
    } catch {
      /* ignore */
    }
  }
  // duet：服务端与本地按 id 并集，保最近 20 条
  if (state.duetSessions && state.duetSessions.length > 0) {
    const localDuets = gatherLocalDuets(ls);
    const serverIds = new Set(state.duetSessions.map((d) => d.id));
    const merged = [
      ...state.duetSessions,
      ...localDuets.filter((d) => !serverIds.has(d.id)),
    ].slice(0, 20);
    try {
      ls.setItem(DUET_KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
  }
}

// ─── 对外 API ──────────────────────────────────────────────────

export async function syncWtftiTimeAssets(opts?: { force?: boolean }): Promise<WtftiAssetsState | null> {
  if (typeof window === 'undefined') return null;

  const supabase = tryCreateBrowserSupabaseClient();
  if (!supabase) return null;

  const now = Date.now();
  if (!opts?.force && now - lastSyncAt < COOLDOWN_MS) return null;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const auth = await getOrCreateAnonymousSession(supabase);
      if (!auth.success) return null;

      const ls = safeLocalStorage();
      if (!ls) return null;

      const body = {
        galaxySessions: gatherLocalGalaxy(ls),
        letters: gatherLocalLetters(ls),
        moon: gatherLocalMoon(ls),
        duetSessions: gatherLocalDuets(ls),
        deleteLetterIds: takePendingDeletes(ls),
      };

      const res = await fetch('/api/wtfti/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;

      const state = (await res.json()) as WtftiAssetsState;
      lastSyncAt = Date.now();
      writeBackState(ls, state);
      return state;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** 写路径调用：debounce 后强制同步（绕过冷却，因为本地刚发生变化） */
export function scheduleWtftiCloudSync(): void {
  if (typeof window === 'undefined') return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void syncWtftiTimeAssets({ force: true });
  }, DEBOUNCE_MS);
}

/** 删除信件的跨端传播：记入待删队列，下次同步消费 */
export function queueLetterDeletion(letterId: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    const raw = readJson<string[]>(ls, PENDING_DELETES_KEY) ?? [];
    const next = [...new Set([...raw, letterId])].slice(0, 200);
    ls.setItem(PENDING_DELETES_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** duet 完成点写入：本地存档（幂等，同 id 去重）+ 触发云同步 */
export function saveDuetSessionLocal(session: WtftiDuetSessionPayload): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    const existing = gatherLocalDuets(ls).filter((d) => d.id !== session.id);
    ls.setItem(DUET_KEY, JSON.stringify([session, ...existing].slice(0, 20)));
  } catch {
    /* ignore */
  }
  scheduleWtftiCloudSync();
}

/** 换设备回访结果页：按 resultId 拉完整 galaxy session（本地 miss 时） */
export async function fetchGalaxySessionFromCloud(
  resultId: string,
): Promise<WtftiGalaxySessionPayload | null> {
  try {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) return null;
    const auth = await getOrCreateAnonymousSession(supabase);
    if (!auth.success) return null;

    const res = await fetch(`/api/wtfti/assets?resultId=${encodeURIComponent(resultId)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { session?: WtftiGalaxySessionPayload };
    return data.session ?? null;
  } catch {
    return null;
  }
}

/** 封缄后订阅「到期拆信邮件提醒」（Phase B 触达） */
export async function subscribeLetterReminder(letterId: string, email: string): Promise<boolean> {
  try {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) return false;
    const auth = await getOrCreateAnonymousSession(supabase);
    if (!auth.success) return false;

    const res = await fetch('/api/wtfti/letter-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letterId, email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
