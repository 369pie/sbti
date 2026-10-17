/**
 * Upsert her_profiles beauty/palm/face flags + recompute completeness (P2).
 * Photos are never stored — only flags, season label, optional palm_summary JSON.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type HerProfileFlagPatch = {
  has_palm?: boolean;
  has_color_season?: boolean;
  has_persona?: boolean;
  has_face?: boolean;
  /** e.g. 冷夏 — persisted for Today Card lucky color */
  color_season?: string | null;
  /** Structured palm reading (no photo); includes fingerprint for replay */
  palm_summary?: Record<string, unknown> | null;
};

export interface HerProfileFlagsRow {
  user_id: string;
  birth_year: number | null;
  nickname: string | null;
  completeness_pct: number;
  has_persona: boolean;
  has_color_season: boolean;
  has_palm: boolean;
  has_face: boolean;
  color_season: string | null;
  palm_summary: Record<string, unknown> | null;
}

const SELECT_COLS =
  'user_id, birth_year, nickname, completeness_pct, has_persona, has_color_season, has_palm, has_face, color_season, palm_summary';

/** Five archive slots: persona · color · palm · face · birth_year */
export function computeCompletenessPct(row: {
  birth_year?: number | null;
  has_persona?: boolean | null;
  has_color_season?: boolean | null;
  has_palm?: boolean | null;
  has_face?: boolean | null;
}): number {
  let filled = 0;
  if (row.has_persona) filled += 1;
  if (row.has_color_season) filled += 1;
  if (row.has_palm) filled += 1;
  if (row.has_face) filled += 1;
  if (row.birth_year) filled += 1;
  return Math.min(100, Math.max(10, Math.round((filled / 5) * 100)));
}

export async function upsertHerProfileFlags(
  userId: string,
  patch: HerProfileFlagPatch,
  opts?: { birthYear?: number | null; nickname?: string | null },
): Promise<{ ok: true; profile: HerProfileFlagsRow } | { ok: false; error: string }> {
  const admin = createAdminSupabaseClient();

  const { data: existing, error: selectError } = await admin
    .from('her_profiles')
    .select(SELECT_COLS)
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError && selectError.code !== 'PGRST116') {
    // Column may not exist yet (migration pending) — soft fail
    console.error('[her/profile-flags] select failed', selectError.message);
    return { ok: false, error: 'profile_load_failed' };
  }

  const base = (existing as HerProfileFlagsRow | null) ?? {
    user_id: userId,
    birth_year: opts?.birthYear ?? null,
    nickname: opts?.nickname ?? null,
    completeness_pct: 10,
    has_persona: false,
    has_color_season: false,
    has_palm: false,
    has_face: false,
    color_season: null,
    palm_summary: null,
  };

  const next: HerProfileFlagsRow = {
    user_id: userId,
    birth_year: base.birth_year ?? opts?.birthYear ?? null,
    nickname: base.nickname ?? opts?.nickname ?? null,
    has_persona: patch.has_persona ?? base.has_persona ?? false,
    has_color_season: patch.has_color_season ?? base.has_color_season ?? false,
    has_palm: patch.has_palm ?? base.has_palm ?? false,
    has_face: patch.has_face ?? base.has_face ?? false,
    color_season:
      patch.color_season !== undefined ? patch.color_season : (base.color_season ?? null),
    palm_summary:
      patch.palm_summary !== undefined ? patch.palm_summary : (base.palm_summary ?? null),
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
        has_face: next.has_face,
        color_season: next.color_season,
        palm_summary: next.palm_summary,
        completeness_pct: next.completeness_pct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select(SELECT_COLS)
    .maybeSingle();

  if (upsertError) {
    console.error('[her/profile-flags] upsert failed', upsertError.message);
    return { ok: false, error: 'profile_save_failed' };
  }

  return { ok: true, profile: (saved as HerProfileFlagsRow) ?? next };
}

/** Load palm_summary for same-hand replay (no photo). */
export async function loadPalmSummary(
  userId: string,
): Promise<Record<string, unknown> | null> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin.from('her_profiles').select('palm_summary').eq('user_id', userId).maybeSingle();
  const raw = data?.palm_summary;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>;
  return null;
}
