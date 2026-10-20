/**
 * POST /api/her/archive — one-tap archive creation (anonymous OK).
 *
 * The caller must hold a Supabase session; anonymous sessions are allowed so
 * first-look finishers can save「她的档案」without registering. Binding a real
 * account later goes through /auth/register, which carries the anon archive over.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/supabase/with-auth';
import { upsertHerProfileFlags } from '@/lib/her/profile-flags';
import { shanghaiDateISO } from '@/lib/today/date';
import { computeArchiveGaps, generateTodayCard } from '@/lib/today/today-card';

export const dynamic = 'force-dynamic';

export const POST = withAuth(async (_req: NextRequest, _ctx, user: User) => {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from('her_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const metaBirth =
    typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;

  // Finishing /start fills the 人格 slot.
  const result = await upsertHerProfileFlags(user.id, { has_persona: true }, { birthYear: metaBirth });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const profile = result.profile;
  const card = generateTodayCard({
    userId: user.id,
    dateISO: shanghaiDateISO(),
    birthYear: profile.birth_year,
    colorSeason: profile.has_color_season ? profile.color_season : null,
    hasPersona: profile.has_persona,
    hasPalm: profile.has_palm,
  });
  const archive = computeArchiveGaps(profile);

  return NextResponse.json(
    {
      ok: true,
      created: !existing,
      isAnonymous: !!user.is_anonymous,
      card: { fortune: card.fortune, luckyColor: card.luckyColor, makeup: card.makeup, dateISO: card.dateISO },
      archive: { completenessPct: archive.pct, gaps: archive.gaps },
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
});
