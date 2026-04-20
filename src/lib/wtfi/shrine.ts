/**
 * Personal Shrine · 个人神龛 · v0
 *
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §B4 杠杆 #2
 *
 * v0 设计原则（per D2 推荐 A）：
 * - 纯 localStorage，无后端、无登录
 * - 装饰物按访问次数解锁（1/3/7/14/30 各一）
 * - SVG 装饰物，零图片资产
 * - 神龛主键 = personality slug，公共可访问 /wtfti/shrine/<slug>/
 */

export type DecorationId =
  | 'candle'
  | 'rose'
  | 'laurel'
  | 'crystal'
  | 'phial'
  | 'tarot';

export interface Decoration {
  id: DecorationId;
  name: string;
  /** 解锁所需累计访问次数 */
  unlockAt: number;
  /** 解锁后的诗意一句话 */
  unlockNote: string;
  /** 单字符 glyph (fallback) */
  glyph: string;
  /** SVG 路径（24x24 viewBox 内的简笔风） */
  svg: string;
  /** 描边色 */
  color: string;
}

export const SHRINE_DECORATIONS: Decoration[] = [
  {
    id: 'candle',
    name: '蜜蜡蜡烛',
    unlockAt: 1,
    unlockNote: '神龛点亮的第一盏灯，是你自己的归来。',
    glyph: '🕯',
    color: '#C9A676',
    svg: 'M12 3 Q12 0 13 0 Q14 1 12 3 Z M10 5 H14 V18 Q14 20 12 20 Q10 20 10 18 Z M9 20 H15 V22 H9 Z',
  },
  {
    id: 'rose',
    name: '一支玫瑰',
    unlockAt: 3,
    unlockNote: '第三日，神龛知道你不是路过的客人。',
    glyph: '🌹',
    color: '#C07A8E',
    svg: 'M12 8 Q9 8 9 11 Q9 13 12 13 Q15 13 15 11 Q15 8 12 8 Z M12 13 V21 M10 16 Q8 14 7 16 M14 16 Q16 14 17 16',
  },
  {
    id: 'laurel',
    name: '月桂枝',
    unlockAt: 7,
    unlockNote: '满 7 日 — 你被神域加冕为「神域居民」。',
    glyph: '🌿',
    color: '#9DC9A6',
    svg: 'M4 20 Q12 14 20 4 M6 18 Q5 15 8 16 M9 15 Q8 12 11 13 M12 12 Q11 9 14 10 M15 9 Q14 6 17 7',
  },
  {
    id: 'crystal',
    name: '水晶簇',
    unlockAt: 14,
    unlockNote: '14 日 — 神龛把你的频率结晶成形。',
    glyph: '🔮',
    color: '#9C7CFF',
    svg: 'M12 3 L8 9 L12 21 L16 9 Z M8 9 H16 M10 12 L14 12',
  },
  {
    id: 'phial',
    name: '香脂瓶',
    unlockAt: 21,
    unlockNote: '21 日 — 主神留给你的香气，封在玻璃里。',
    glyph: '🧴',
    color: '#D4B58A',
    svg: 'M10 3 H14 V6 H10 Z M9 6 H15 L16 9 V19 Q16 21 14 21 H10 Q8 21 8 19 V9 Z M11 12 Q12 11 13 12',
  },
  {
    id: 'tarot',
    name: '塔罗牌',
    unlockAt: 30,
    unlockNote: '30 日 — 你被神域承认为「大祭司」附属位。',
    glyph: '🃏',
    color: '#F5F0E8',
    svg: 'M7 3 H17 V21 H7 Z M9 7 H15 M12 10 L10 14 H14 L12 10 Z M10 17 H14',
  },
];

export interface ShrineState {
  /** 累计访问次数（首次为 1） */
  visitCount: number;
  /** 最近一次访问 ISO date */
  lastVisitDate: string;
  /** 已解锁的装饰物 ids */
  unlocked: DecorationId[];
  /** 该神龛的留言（自留 + 访客） */
  candles: ShrineCandle[];
}

export interface ShrineCandle {
  id: string;
  /** 'self' 自己点的 / 'guest' 访客留下的 */
  by: 'self' | 'guest';
  /** 候选 nickname，可选 */
  nickname?: string;
  /** 一句话 ≤ 30 字 */
  note: string;
  /** ISO datetime */
  at: string;
}

export const SHRINE_STORAGE_KEY = 'wtfti:shrine';

interface PersistedShrines {
  /** key = planet slug */
  [slug: string]: ShrineState;
}

function safeParse(raw: string | null): PersistedShrines {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as PersistedShrines;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadShrine(slug: string): ShrineState | null {
  if (typeof window === 'undefined') return null;
  const all = safeParse(window.localStorage.getItem(SHRINE_STORAGE_KEY));
  return all[slug] ?? null;
}

function saveShrine(slug: string, state: ShrineState): void {
  if (typeof window === 'undefined') return;
  const all = safeParse(window.localStorage.getItem(SHRINE_STORAGE_KEY));
  all[slug] = state;
  try {
    window.localStorage.setItem(SHRINE_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore (private mode / quota)
  }
}

/**
 * 进入神龛时调用 — 累计访问、解锁新装饰物、返回最新状态。
 */
export function visitShrine(slug: string): ShrineState {
  const today = todayIso();
  const prev = loadShrine(slug);
  const isNewDay = !prev || prev.lastVisitDate !== today;

  const visitCount = prev ? prev.visitCount + (isNewDay ? 1 : 0) : 1;
  const unlocked = new Set(prev?.unlocked ?? []);
  for (const deco of SHRINE_DECORATIONS) {
    if (visitCount >= deco.unlockAt) unlocked.add(deco.id);
  }

  const next: ShrineState = {
    visitCount,
    lastVisitDate: today,
    unlocked: SHRINE_DECORATIONS.filter((d) => unlocked.has(d.id)).map((d) => d.id),
    candles: prev?.candles ?? [],
  };
  saveShrine(slug, next);
  return next;
}

/**
 * 留下一根蜡烛（留言）。
 */
export function lightCandle(
  slug: string,
  candle: Omit<ShrineCandle, 'id' | 'at'>,
): ShrineState | null {
  const prev = loadShrine(slug);
  if (!prev) return null;
  const trimmed = candle.note.trim().slice(0, 30);
  if (!trimmed) return prev;
  const next: ShrineState = {
    ...prev,
    candles: [
      ...prev.candles,
      {
        id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        by: candle.by,
        nickname: candle.nickname?.trim().slice(0, 12) || undefined,
        note: trimmed,
        at: new Date().toISOString(),
      },
    ].slice(-30),
  };
  saveShrine(slug, next);
  return next;
}

export function getNextUnlock(visitCount: number): Decoration | null {
  return SHRINE_DECORATIONS.find((d) => d.unlockAt > visitCount) ?? null;
}
