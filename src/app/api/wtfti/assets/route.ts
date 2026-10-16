import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/supabase/with-auth';
import {
  WTFTI_ASSETS_LIMITS,
  type WtftiAssetsState,
  type WtftiAssetsSyncRequest,
  type WtftiLetterPayload,
  type WtftiMoonPayload,
} from '@/lib/wtfi/time-assets-types';

export const dynamic = 'force-dynamic';

const LETTER_KINDS = new Set(['sealed', 'retest', 'future']);

function asString(v: unknown, max: number): string | null {
  if (typeof v !== 'string' || !v.trim()) return null;
  return v.slice(0, max);
}

function asIso(v: unknown): string | null {
  if (typeof v !== 'string' || !v.length) return null;
  const t = Date.parse(v);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

function sanitizeLetter(raw: unknown): WtftiLetterPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = asString(r.id, 64);
  const text = asString(r.text, WTFTI_ASSETS_LIMITS.letterTextMax);
  const kind = typeof r.kind === 'string' && LETTER_KINDS.has(r.kind) ? r.kind : null;
  const sealedAt = asIso(r.sealedAt);
  const dueAt = asIso(r.dueAt);
  if (!id || !text || !kind || !sealedAt || !dueAt) return null;
  return {
    id,
    kind: kind as WtftiLetterPayload['kind'],
    text,
    title: asString(r.title, WTFTI_ASSETS_LIMITS.letterTitleMax),
    sealedAt,
    dueAt,
    personalitySlug: asString(r.personalitySlug, 64),
    planetSlug: asString(r.planetSlug, 64),
    opened: r.opened === true,
  };
}

function sanitizeMoon(raw: unknown): WtftiMoonPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const max = WTFTI_ASSETS_LIMITS.moonChapterMax;
  const done = Array.isArray(r.done)
    ? [...new Set(r.done.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= max))].sort((a, b) => a - b)
    : [];
  const answers: Record<string, number> = {};
  if (r.answers && typeof r.answers === 'object') {
    for (const [k, v] of Object.entries(r.answers as Record<string, unknown>)) {
      const idx = Number(k);
      if (Number.isInteger(idx) && idx >= 1 && idx <= max && Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 3) {
        answers[String(idx)] = v as number;
      }
    }
  }
  return {
    done,
    answers,
    crownedAt: asIso(r.crownedAt),
    title: asString(r.title, 32),
  };
}

async function loadState(userId: string): Promise<WtftiAssetsState> {
  const supabase = await createServerSupabaseClient();

  const [galaxyRes, lettersRes, moonRes, duetRes] = await Promise.all([
    supabase
      .from('wtfti_galaxy_results')
      .select('result_id, created_at, personality_slug, home_planet_slug')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(WTFTI_ASSETS_LIMITS.galaxySessionsPerSync),
    supabase
      .from('wtfti_letters')
      .select('id, kind, text, title, sealed_at, due_at, personality_slug, planet_slug, opened')
      .eq('user_id', userId)
      .order('due_at', { ascending: true })
      .limit(WTFTI_ASSETS_LIMITS.lettersPerSync),
    supabase.from('wtfti_moon_progress').select('done, answers, crowned_at, title').eq('user_id', userId).maybeSingle(),
    supabase
      .from('wtfti_duet_sessions')
      .select('id, my_slug, partner_slug, pair_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return {
    galaxySessions: (galaxyRes.data ?? []).map((row) => ({
      resultId: row.result_id,
      createdAt: row.created_at,
      personalitySlug: row.personality_slug,
      homePlanetSlug: row.home_planet_slug ?? null,
    })),
    letters: (lettersRes.data ?? []).map((row) => ({
      id: row.id,
      kind: row.kind,
      text: row.text,
      title: row.title ?? null,
      sealedAt: row.sealed_at,
      dueAt: row.due_at,
      personalitySlug: row.personality_slug ?? null,
      planetSlug: row.planet_slug ?? null,
      opened: row.opened,
    })),
    moon: moonRes.data
      ? {
          done: (moonRes.data.done as number[]) ?? [],
          answers: (moonRes.data.answers as Record<string, number>) ?? {},
          crownedAt: moonRes.data.crowned_at ?? null,
          title: moonRes.data.title ?? null,
        }
      : null,
    duetSessions: (duetRes.data ?? []).map((row) => ({
      id: row.id,
      mySlug: row.my_slug,
      partnerSlug: row.partner_slug,
      pairData: (row.pair_data as Record<string, unknown>) ?? {},
      createdAt: row.created_at,
    })),
  };
}

export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  const supabase = await createServerSupabaseClient();

  // ?resultId= → 完整 galaxy 结果（换设备回访结果页用）
  const resultId = req.nextUrl.searchParams.get('resultId');
  if (resultId) {
    const { data, error } = await supabase
      .from('wtfti_galaxy_results')
      .select('result_id, created_at, personality_slug, result, soul_answers')
      .eq('user_id', user.id)
      .eq('result_id', resultId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      session: {
        resultId: data.result_id,
        createdAt: data.created_at,
        personalitySlug: data.personality_slug,
        result: data.result,
        soulAnswers: data.soul_answers ?? undefined,
      },
    });
  }

  const state = await loadState(user.id);
  return NextResponse.json(state);
});

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  let body: WtftiAssetsSyncRequest;
  try {
    body = (await req.json()) as WtftiAssetsSyncRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // ── letters：按 id 合并（opened 单调递增），再处理删除 ──
  const incomingLetters = (body.letters ?? [])
    .map(sanitizeLetter)
    .filter((l): l is WtftiLetterPayload => l !== null)
    .slice(0, WTFTI_ASSETS_LIMITS.lettersPerSync);

  if (incomingLetters.length > 0) {
    const ids = incomingLetters.map((l) => l.id);
    const { data: existing } = await supabase
      .from('wtfti_letters')
      .select('id, opened')
      .eq('user_id', user.id)
      .in('id', ids);
    const openedMap = new Map((existing ?? []).map((row) => [row.id, row.opened]));

    const rows = incomingLetters.map((l) => ({
      id: l.id,
      user_id: user.id,
      kind: l.kind,
      text: l.text,
      title: l.title ?? null,
      sealed_at: l.sealedAt,
      due_at: l.dueAt,
      personality_slug: l.personalitySlug ?? null,
      planet_slug: l.planetSlug ?? null,
      opened: l.opened || (openedMap.get(l.id) ?? false),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('wtfti_letters').upsert(rows, { onConflict: 'id' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const deleteIds = (body.deleteLetterIds ?? []).filter((id) => typeof id === 'string').slice(0, WTFTI_ASSETS_LIMITS.lettersPerSync);
  if (deleteIds.length > 0) {
    await supabase.from('wtfti_letters').delete().eq('user_id', user.id).in('id', deleteIds);
  }

  // ── galaxy：按 (user_id, result_id) upsert，created_at 保留客户端时间（迁移语义）──
  const incomingGalaxy = (body.galaxySessions ?? [])
    .filter(
      (s): s is { resultId: string; createdAt: string; personalitySlug: string; homePlanetSlug?: string | null; result: unknown; soulAnswers?: unknown } =>
        !!s &&
        asString(s.resultId, 64) !== null &&
        asString(s.personalitySlug, 64) !== null &&
        s.result != null &&
        asIso(s.createdAt) !== null,
    )
    .slice(0, WTFTI_ASSETS_LIMITS.galaxySessionsPerSync);

  if (incomingGalaxy.length > 0) {
    const rows = incomingGalaxy.map((s) => ({
      user_id: user.id,
      result_id: s.resultId.slice(0, 64),
      personality_slug: s.personalitySlug.slice(0, 64),
      home_planet_slug: asString(s.homePlanetSlug, 64),
      result: s.result,
      soul_answers: (s.soulAnswers ?? null) as object | null,
      created_at: asIso(s.createdAt) ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('wtfti_galaxy_results')
      .upsert(rows, { onConflict: 'user_id,result_id' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // ── moon：单行合并（done 并集 / answers 覆盖合并 / 加冕单调）──
  const incomingMoon = body.moon ? sanitizeMoon(body.moon) : null;
  if (incomingMoon) {
    const { data: existing } = await supabase
      .from('wtfti_moon_progress')
      .select('done, answers, crowned_at, title')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const done = [
        ...new Set([...((existing.done as number[]) ?? []), ...incomingMoon.done]),
      ].sort((a, b) => a - b);
      const answers = { ...((existing.answers as Record<string, number>) ?? {}), ...incomingMoon.answers };
      const { error } = await supabase
        .from('wtfti_moon_progress')
        .update({
          done,
          answers,
          crowned_at: (existing.crowned_at as string | null) ?? incomingMoon.crownedAt,
          title: (existing.title as string | null) ?? incomingMoon.title,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from('wtfti_moon_progress').insert({
        user_id: user.id,
        done: incomingMoon.done,
        answers: incomingMoon.answers,
        crowned_at: incomingMoon.crownedAt,
        title: incomingMoon.title,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  // ── duet：确定性 id upsert（同一对双方重复 reveal 不产生重复行）──
  const incomingDuet = (body.duetSessions ?? [])
    .filter(
      (d): d is { id: string; mySlug: string; partnerSlug: string; pairData: Record<string, unknown>; createdAt: string } =>
        !!d &&
        asString(d.id, 80) !== null &&
        asString(d.mySlug, 64) !== null &&
        asString(d.partnerSlug, 64) !== null &&
        d.pairData != null &&
        typeof d.pairData === 'object' &&
        asIso(d.createdAt) !== null,
    )
    .slice(0, 20);

  if (incomingDuet.length > 0) {
    const rows = incomingDuet.map((d) => ({
      id: d.id.slice(0, 80),
      user_id: user.id,
      my_slug: d.mySlug.slice(0, 64),
      partner_slug: d.partnerSlug.slice(0, 64),
      pair_data: d.pairData,
      created_at: asIso(d.createdAt) ?? new Date().toISOString(),
    }));
    const { error } = await supabase.from('wtfti_duet_sessions').upsert(rows, { onConflict: 'id' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const state = await loadState(user.id);
  return NextResponse.json(state);
});
