/**
 * XPTI Couple — server-side persistence helpers.
 *
 * Wraps the `xpti_couples` table introduced in 2026-04-21 migration. Used by
 * both the API route handlers and the server entry of /xpti/couple/.
 *
 * Auth model (Phase 1, decision A): the share_token IS the access credential.
 * Anyone who holds the token can read the couple record and (after either
 * party pays) see the unlocked content. This matches the original `?inv=`
 * URL-as-credential model but moves storage server-side so inviters on a
 * separate device can poll for partner completion + unlock state.
 */

import { randomBytes } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { generatePairCode } from '@/lib/cpti/pair-code';
import { buildCoupleMerge, type CoupleMergeResult } from '@/lib/xpti/couple';

export type XptiCoupleStatus = 'active' | 'completed' | 'expired';

export interface XptiCoupleRow {
  id: string;
  pair_code: string;
  share_token: string;
  status: XptiCoupleStatus;
  inviter_user_id: string | null;
  inviter_device_id: string | null;
  inviter_slug: string;
  inviter_dims: number[];
  inviter_nickname: string | null;
  partner_user_id: string | null;
  partner_device_id: string | null;
  partner_slug: string | null;
  partner_dims: number[] | null;
  partner_nickname: string | null;
  merged_payload: CoupleMergeResult | null;
  unlocked_sku: string | null;
  unlocked_at: string | null;
  unlocked_by_user_id: string | null;
  unlocked_by_device_id: string | null;
  practice_checklist: unknown;
  history: unknown[];
  completed_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeChecklistEntry {
  inviter?: boolean;
  partner?: boolean;
  updatedAt: string;
}

export type PracticeChecklist = Record<string, PracticeChecklistEntry>;

export interface CreateCoupleInput {
  inviterSlug: string;
  inviterDims: number[];
  inviterNickname?: string | null;
  inviterUserId?: string | null;
  inviterDeviceId?: string | null;
}

export interface CompleteCoupleInput {
  partnerSlug: string;
  partnerDims: number[];
  partnerNickname?: string | null;
  partnerUserId?: string | null;
  partnerDeviceId?: string | null;
}

/** Generate a 32-byte url-safe token (base64url, ~43 chars). */
function generateShareToken(): string {
  return randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sanitizeNick(nick: string | null | undefined): string | null {
  if (!nick) return null;
  const cleaned = nick.slice(0, 12).replace(/[^\p{L}\p{N}\s_-]/gu, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function sanitizeDims(dims: number[]): number[] {
  return dims.slice(0, 9).map((d) => {
    const n = Math.round(Number(d));
    if (Number.isNaN(n)) return 2;
    return Math.max(1, Math.min(3, n));
  });
}

/**
 * Create a new couple record for an inviter. Generates a fresh share_token +
 * pair_code (with collision retry on the active partial-unique index).
 */
export async function createCouple(input: CreateCoupleInput): Promise<XptiCoupleRow> {
  const admin = createAdminSupabaseClient();
  const dims = sanitizeDims(input.inviterDims);
  const nickname = sanitizeNick(input.inviterNickname);

  // Collision retry on pair_code (the partial unique index protects us)
  for (let attempt = 0; attempt < 6; attempt++) {
    const pairCode = generatePairCode();
    const shareToken = generateShareToken();
    const { data, error } = await admin
      .from('xpti_couples')
      .insert({
        pair_code: pairCode,
        share_token: shareToken,
        status: 'active',
        inviter_user_id: input.inviterUserId ?? null,
        inviter_device_id: input.inviterDeviceId ?? null,
        inviter_slug: input.inviterSlug,
        inviter_dims: dims,
        inviter_nickname: nickname,
      })
      .select('*')
      .single();

    if (!error && data) {
      return data as XptiCoupleRow;
    }
    if (error && error.code !== '23505') {
      throw new Error(`createCouple failed: ${error.message}`);
    }
    // 23505 = unique violation, retry with new code
  }
  throw new Error('createCouple: exhausted pair_code generation attempts');
}

/** Resolve a couple by its share_token. Returns null if not found or expired. */
export async function getCoupleByShareToken(token: string): Promise<XptiCoupleRow | null> {
  if (!token || typeof token !== 'string') return null;
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('xpti_couples')
    .select('*')
    .eq('share_token', token)
    .maybeSingle();

  if (error) {
    console.error('[getCoupleByShareToken]', error);
    return null;
  }
  return (data as XptiCoupleRow | null) ?? null;
}

/**
 * Partner completes their 12-q quiz. Writes partner side + merged_payload,
 * flips status to 'completed'. Idempotent for repeated calls (last write wins).
 */
export async function completeCouplePartner(
  shareToken: string,
  input: CompleteCoupleInput
): Promise<XptiCoupleRow | null> {
  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) return null;

  const partnerDims = sanitizeDims(input.partnerDims);
  const partnerNickname = sanitizeNick(input.partnerNickname);
  const merge = buildCoupleMerge(
    { slug: couple.inviter_slug, dims: couple.inviter_dims },
    { slug: input.partnerSlug, dims: partnerDims }
  );

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('xpti_couples')
    .update({
      partner_user_id: input.partnerUserId ?? null,
      partner_device_id: input.partnerDeviceId ?? null,
      partner_slug: input.partnerSlug,
      partner_dims: partnerDims,
      partner_nickname: partnerNickname,
      merged_payload: merge,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('share_token', shareToken)
    .select('*')
    .single();

  if (error) {
    throw new Error(`completeCouplePartner failed: ${error.message}`);
  }
  return data as XptiCoupleRow;
}

/**
 * Mark a couple as unlocked (called from /api/mysti/payment/notify when an
 * xpti-couple-* SKU is paid). resourceId is `couple:<shareToken>`.
 */
export async function markCoupleUnlocked(
  shareToken: string,
  payload: { sku: string; userId?: string | null; deviceId?: string | null }
): Promise<XptiCoupleRow | null> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('xpti_couples')
    .update({
      unlocked_sku: payload.sku,
      unlocked_at: new Date().toISOString(),
      unlocked_by_user_id: payload.userId ?? null,
      unlocked_by_device_id: payload.deviceId ?? null,
    })
    .eq('share_token', shareToken)
    .select('*')
    .single();

  if (error) {
    console.error('[markCoupleUnlocked]', error);
    return null;
  }
  return data as XptiCoupleRow;
}

/**
 * Push a remeasure snapshot to the couple's history. Called when either party
 * retakes the test from inside the merged report. Snapshot stores per-side
 * dims + slug + timestamp + author flag so the UI can build a delta chart.
 */
export interface RemeasureInput {
  side: 'inviter' | 'partner';
  slug: string;
  dims: number[];
  nickname?: string | null;
}

export interface RemeasureSnapshot {
  side: 'inviter' | 'partner';
  slug: string;
  dims: number[];
  nickname: string | null;
  takenAt: string;
}

export async function recordRemeasure(
  shareToken: string,
  input: RemeasureInput,
): Promise<XptiCoupleRow | null> {
  const admin = createAdminSupabaseClient();
  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) return null;

  const dims = sanitizeDims(input.dims);
  const snapshot: RemeasureSnapshot = {
    side: input.side,
    slug: input.slug,
    dims,
    nickname: sanitizeNick(input.nickname),
    takenAt: new Date().toISOString(),
  };
  const nextHistory = [...(couple.history ?? []), snapshot];

  // Rebuild merged_payload using the new "current" dims for the remeasured side.
  const inviterCurrent =
    input.side === 'inviter'
      ? { slug: input.slug, dims }
      : { slug: couple.inviter_slug, dims: couple.inviter_dims };
  const partnerCurrent =
    input.side === 'partner'
      ? { slug: input.slug, dims }
      : couple.partner_slug && couple.partner_dims
        ? { slug: couple.partner_slug, dims: couple.partner_dims }
        : null;

  const updates: Record<string, unknown> = { history: nextHistory };
  if (input.side === 'inviter') {
    updates.inviter_slug = input.slug;
    updates.inviter_dims = dims;
    if (snapshot.nickname) updates.inviter_nickname = snapshot.nickname;
  } else {
    updates.partner_slug = input.slug;
    updates.partner_dims = dims;
    if (snapshot.nickname) updates.partner_nickname = snapshot.nickname;
  }

  if (partnerCurrent) {
    updates.merged_payload = buildCoupleMerge(inviterCurrent, partnerCurrent);
  }

  const { data, error } = await admin
    .from('xpti_couples')
    .update(updates)
    .eq('share_token', shareToken)
    .select('*')
    .single();

  if (error) {
    console.error('[recordRemeasure]', error);
    return null;
  }
  return data as XptiCoupleRow;
}

/** Bind a device to a logged-in user and backfill any anonymous orders. */
export async function bindDeviceToUser(deviceId: string, userId: string): Promise<{ backfilled: number }> {
  if (!deviceId || !userId) return { backfilled: 0 };
  const admin = createAdminSupabaseClient();
  await admin
    .from('device_user_bindings')
    .upsert(
      { device_id: deviceId, user_id: userId, last_seen_at: new Date().toISOString() },
      { onConflict: 'device_id' }
    );

  const { data, error } = await admin.rpc('backfill_mysti_orders_user', {
    p_device_id: deviceId,
    p_user_id: userId,
  });
  if (error) {
    console.error('[bindDeviceToUser] backfill rpc failed', error);
    return { backfilled: 0 };
  }
  return { backfilled: typeof data === 'number' ? data : 0 };
}

/**
 * Build the resourceId used by the payment pipeline for a couple SKU.
 * Anchors entitlement to the share_token so any holder can unlock.
 */
export function buildCoupleResourceId(shareToken: string): string {
  return `couple:${shareToken}`;
}

/** Inverse of buildCoupleResourceId. */
export function parseCoupleResourceId(resourceId: string | null | undefined): string | null {
  if (!resourceId || typeof resourceId !== 'string') return null;
  if (!resourceId.startsWith('couple:')) return null;
  const token = resourceId.slice('couple:'.length);
  return token.length > 0 ? token : null;
}

// ─── Practice checklist helpers ──────────────────────────────────────────

export interface TogglePracticeInput {
  side: 'inviter' | 'partner';
  day: number;
  done: boolean;
}

/** Toggle a day's practice entry for one side and persist to DB. */
export async function togglePracticeChecklist(
  shareToken: string,
  input: TogglePracticeInput,
): Promise<PracticeChecklist | null> {
  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) return null;

  const current: PracticeChecklist =
    (couple.practice_checklist as PracticeChecklist | null) ?? {};
  const dayKey = String(input.day);
  const entry: PracticeChecklistEntry = {
    ...current[dayKey],
    [input.side]: input.done,
    updatedAt: new Date().toISOString(),
  };
  const next: PracticeChecklist = { ...current, [dayKey]: entry };

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('xpti_couples')
    .update({ practice_checklist: next })
    .eq('share_token', shareToken)
    .select('practice_checklist')
    .single();

  if (error) {
    console.error('[togglePracticeChecklist]', error);
    return null;
  }
  return (data.practice_checklist as PracticeChecklist | null) ?? next;
}
