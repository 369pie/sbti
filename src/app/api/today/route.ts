/**
 * GET /api/today — personalized Today Card + streak bump (P1 slice A).
 * Claimed (non-anonymous) session required.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withClaimedAuth } from '@/lib/supabase/with-auth';
import { getUserDisplayName } from '@/lib/supabase/auth';
import {
  formatShanghaiDateCN,
  greetingForHour,
  shanghaiDateISO,
  shanghaiHour,
  shanghaiYesterdayISO,
} from '@/lib/today/date';
import { nextStreak } from '@/lib/today/streak';
import { computeArchiveGaps, generateTodayCard } from '@/lib/today/today-card';

export const dynamic = 'force-dynamic';

interface HerProfileRow {
  user_id: string;
  birth_year: number | null;
  nickname: string | null;
  completeness_pct: number;
  has_persona: boolean;
  has_color_season: boolean;
  has_palm: boolean;
  last_visit_date: string | null;
  streak_count: number;
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

export const GET = withClaimedAuth(async (_req: NextRequest, _ctx, user: User) => {
  const admin = createAdminSupabaseClient();
  const todayISO = shanghaiDateISO();
  const yesterdayISO = shanghaiYesterdayISO();

  const { data: existing, error: selectError } = await admin
    .from('her_profiles')
    .select(
      'user_id, birth_year, nickname, completeness_pct, has_persona, has_color_season, has_palm, last_visit_date, streak_count',
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[api/today] select failed', selectError.message);
    return json({ error: 'profile_load_failed' }, { status: 500 });
  }

  const metaBirth =
    typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;
  const displayFallback = getUserDisplayName(user);

  let profile: HerProfileRow = existing
    ? (existing as HerProfileRow)
    : {
        user_id: user.id,
        birth_year: metaBirth,
        nickname: displayFallback === '旅行者' ? null : displayFallback,
        completeness_pct: 10,
        has_persona: false,
        has_color_season: false,
        has_palm: false,
        last_visit_date: null,
        streak_count: 0,
      };

  const streak = nextStreak(
    { lastVisitDate: profile.last_visit_date, streakCount: profile.streak_count ?? 0 },
    todayISO,
    yesterdayISO,
  );

  if (streak.changed || !existing) {
    const upsertPayload = {
      user_id: user.id,
      birth_year: profile.birth_year ?? metaBirth,
      nickname: profile.nickname ?? (displayFallback === '旅行者' ? null : displayFallback),
      completeness_pct: profile.completeness_pct ?? 10,
      has_persona: profile.has_persona ?? false,
      has_color_season: profile.has_color_season ?? false,
      has_palm: profile.has_palm ?? false,
      last_visit_date: streak.lastVisitDate,
      streak_count: streak.streakCount,
      updated_at: new Date().toISOString(),
    };

    const { data: saved, error: upsertError } = await admin
      .from('her_profiles')
      .upsert(upsertPayload, { onConflict: 'user_id' })
      .select(
        'user_id, birth_year, nickname, completeness_pct, has_persona, has_color_season, has_palm, last_visit_date, streak_count',
      )
      .maybeSingle();

    if (upsertError) {
      // Non-fatal for card render: return computed streak even if persist fails
      // (e.g. migration not applied yet). Log for ops.
      console.error('[api/today] streak upsert failed', upsertError.message);
    } else if (saved) {
      profile = saved as HerProfileRow;
    } else {
      profile = { ...profile, ...upsertPayload };
    }
  }

  const nickname =
    (profile.nickname && profile.nickname.trim()) ||
    (displayFallback !== '旅行者' ? displayFallback : '') ||
    '你';

  // color_season label is not stored on her_profiles yet (only has_color_season bool).
  // Seed still varies by userId + date + birthYear + persona/palm flags.
  const card = generateTodayCard({
    userId: user.id,
    dateISO: todayISO,
    birthYear: profile.birth_year ?? metaBirth,
    colorSeason: null,
    hasPersona: profile.has_persona,
    hasPalm: profile.has_palm,
  });

  const archive = computeArchiveGaps(profile);
  const hour = shanghaiHour();

  return json({
    ok: true,
    greeting: greetingForHour(hour),
    nickname,
    dateLabel: formatShanghaiDateCN(todayISO),
    streak: {
      count: profile.streak_count ?? streak.streakCount,
      lastVisitDate: profile.last_visit_date ?? streak.lastVisitDate,
    },
    card: {
      fortune: card.fortune,
      luckyColor: card.luckyColor,
      makeup: card.makeup,
      dateISO: card.dateISO,
    },
    archive: {
      completenessPct: archive.pct,
      gaps: archive.gaps,
    },
  });
});
