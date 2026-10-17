/**
 * Upsert her_profiles beauty/palm flags + recompute completeness (P2).
 * Photos are never stored — only boolean stubs / optional season label later.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type HerProfileFlagPatch = {
  has_palm?: boolean;
  has_color_season?: boolean;
  has_persona?: boolean;
  /** Optional season label for Today Card; not a DB column yet — reserved. */
  color_season?: string | null;
};

interface HerProfileFlagsRow {
  user_id: string;
  birth_year: number | null;
  nickname: string | null;
  completeness_pct: number;
  has_persona: boolean;
  has_color_season: boolean;
  has_palm: boolean;
}

export function computeCompletenessPct(row: {
  birth_year?: number | null;
  has_persona?: boolean | null;
  has_color_season?: boolean | null;
  has_palm?: boolean | null;
}): number {
  let filled = 0;
  if (row.has_persona) filled += 1;
  if (row.has_color_season) filled += 1;
  if (row.has_palm) filled += 1;
  if (row.birth_year) filled += 1;
  // Floor at 10 to match register stub; ceiling 100.
  return Math.min(100, Math.max(10, Math.round((filled / 4) * 100)));
}

/**
 * Merge flag patches onto her_profiles for a claimed user.
 * Returns updated flags + completeness. Soft-fails if table missing.
 */
export async function upsertHerProfileFlags(
  userId: string,
  patch: HerProfileFlagPatch,
  opts?: { birthYear?: number | null; nickname?: string | null },
): Promise<{ ok: true; profile: HerProfileFlagsRow } | { ok: false; error: string }> {
  const admin = createAdminSupabaseClient();

  const { data: existing, error: selectError } = await admin
    .from('her_profiles')
    .select('user_id, birth_year, nickname, completeness_pct, has_persona, has_color_season, has_palm')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[her/profile-flags] select failed', selectError.message);
    return { ok: false, error: 'profile_load_failed' };
  }

  const base: HerProfileFlagsRow = existing
    ? (existing as HerProfileFlagsRow)
    : {
        user_id: userId,
        birth_year: opts?.birthYear ?? null,
        nickname: opts?.nickname ?? null,
        completeness_pct: 10,
        has_persona: false,
        has_color_season: false,
        has_palm: false,
      };

  const next: HerProfileFlagsRow = {
    user_id: userId,
    birth_year: base.birth_year ?? opts?.birthYear ?? null,
    nickname: base.nickname ?? opts?.nickname ?? null,
    has_persona: patch.has_persona ?? base.has_persona,
    has_color_season: patch.has_color_season ?? base.has_color_season,
    has_palm: patch.has_palm ?? base.has_palm,
    completeness_pct: 10,
  };
  next.completeness_pct = computeCompletenessPct(next);

  const { data: saved, error: upsertError } = await admin
    .from('her_profiles')
    .upsert(
      {
        user_id: next.user_id,
        birth_year: next.birth_year,
        nickname: next.nickname,
        has_persona: next.has_persona,
        has_color_season: next.has_color_season,
        has_palm: next.has_palm,
        completeness_pct: next.completeness_pct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('user_id, birth_year, nickname, completeness_pct, has_persona, has_color_season, has_palm')
    .maybeSingle();

  if (upsertError) {
    console.error('[her/profile-flags] upsert failed', upsertError.message);
    return { ok: false, error: 'profile_save_failed' };
  }

  return { ok: true, profile: (saved as HerProfileFlagsRow) ?? next };
}
