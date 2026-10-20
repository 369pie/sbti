/**
 * /api/her/archive — one-tap archive (anonymous OK).
 *
 * POST: create/refresh the archive. Body may carry the test that was just
 *   finished `{ test: { test_id, result_key, result_name? } }`; it is stored on
 *   the user's auth metadata (`wtfti_tests`, latest = `wtfti_persona`) so the
 *   archive holds「我是谁」without a schema change. Anonymous sessions are
 *   allowed; binding later via /auth/register carries the same auth user over.
 * GET: read-only archive summary for「我」(no writes).
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/supabase/with-auth';
import { upsertHerProfileFlags, type HerProfileFlagsRow } from '@/lib/her/profile-flags';
import { shanghaiDateISO } from '@/lib/today/date';
import { computeArchiveGaps, generateTodayCard } from '@/lib/today/today-card';

export const dynamic = 'force-dynamic';

const KEY_RE = /^[a-z0-9_-]{1,48}$/i;

export interface ArchivedTest {
  test_id: string;
  result_key: string;
  result_name?: string;
  at: string;
}

function parseTest(body: unknown): ArchivedTest | null {
  const t = (body as { test?: Record<string, unknown> } | null)?.test;
  if (!t || typeof t !== 'object') return null;
  const testId = typeof t.test_id === 'string' ? t.test_id : '';
  const key = typeof t.result_key === 'string' ? t.result_key : '';
  if (!KEY_RE.test(testId) || !KEY_RE.test(key)) return null;
  const name = typeof t.result_name === 'string' ? t.result_name.slice(0, 24) : undefined;
  return { test_id: testId, result_key: key, result_name: name, at: new Date().toISOString() };
}

function readTests(user: User): Record<string, ArchivedTest> {
  const raw = user.user_metadata?.wtfti_tests;
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, ArchivedTest>) : {};
}

function summarize(user: User, profile: HerProfileFlagsRow, tests: Record<string, ArchivedTest>) {
  const card = generateTodayCard({
    userId: user.id,
    dateISO: shanghaiDateISO(),
    birthYear: profile.birth_year,
    colorSeason: profile.has_color_season ? profile.color_season : null,
    hasPersona: profile.has_persona,
    hasPalm: profile.has_palm,
  });
  const archive = computeArchiveGaps(profile);
  const list = Object.values(tests).sort((a, b) => (a.at < b.at ? 1 : -1));
  return {
    ok: true,
    isAnonymous: !!user.is_anonymous,
    card: { fortune: card.fortune, luckyColor: card.luckyColor, makeup: card.makeup, dateISO: card.dateISO },
    archive: { completenessPct: archive.pct, gaps: archive.gaps },
    persona: list.find((t) => t.test_id === 'first_look') ?? list[0] ?? null,
    tests: list,
  };
}

export const POST = withAuth(async (req: NextRequest, _ctx, user: User) => {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from('her_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const body = await req.json().catch(() => null);
  const test = parseTest(body);

  const metaBirth =
    typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;

  // A finished test fills the 人格 slot.
  const result = await upsertHerProfileFlags(user.id, { has_persona: true }, { birthYear: metaBirth });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  let tests = readTests(user);
  if (test) {
    tests = { ...tests, [test.test_id]: test };
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...(user.user_metadata ?? {}), wtfti_tests: tests, wtfti_persona: test },
    });
    if (error) console.error('[her/archive] store test failed', error.message);
  }

  return NextResponse.json(
    { ...summarize(user, result.profile, tests), created: !existing },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
});

export const GET = withAuth(async (_req: NextRequest, _ctx, user: User) => {
  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from('her_profiles')
    .select('user_id, birth_year, nickname, completeness_pct, has_persona, has_color_season, has_palm, has_face, color_season, palm_summary')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ ok: true, exists: false, isAnonymous: !!user.is_anonymous, tests: Object.values(readTests(user)) }, { headers: { 'Cache-Control': 'private, no-store' } });
  }
  return NextResponse.json(
    { ...summarize(user, profile as HerProfileFlagsRow, readTests(user)), exists: true },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
});
