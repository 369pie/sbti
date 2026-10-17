/**
 * P3 her membership (refocus §4 / §7).
 * ¥19/mo via existing monthly-pass + xunhupay.
 * Benefits: full 今日 · N 美我额度 · deep reports 8折.
 * No dark-pattern auto-renew — user must actively renew.
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { SUBSCRIPTION_DURATION_DAYS, type SubscriptionSku } from '@/lib/mysti/unlock';

/** Reuse live Mysti monthly-pass SKU (already wired to xunhupay). */
export const HER_MEMBERSHIP_MONTHLY_SKU = 'monthly-pass' as const;

/** Member static try-on free uses / Asia/Shanghai month (plan §4 「N 次」). */
export const MEMBER_TRY_ON_CAP = 10;

/** Deep-report member discount: 8折 → take off 0.2. */
export const DEEP_REPORT_MEMBER_DISCOUNT = 0.2;

const MEMBERSHIP_SKUS = new Set<string>([
  'monthly-pass',
  'monthly-pass-intro',
  'quarterly-pass',
  'yearly-pass',
]);

export function isMembershipSku(sku: string | null | undefined): boolean {
  return !!sku && MEMBERSHIP_SKUS.has(sku);
}

export function membershipDaysForSku(sku: string): number {
  if (sku in SUBSCRIPTION_DURATION_DAYS) {
    return SUBSCRIPTION_DURATION_DAYS[sku as SubscriptionSku];
  }
  return 30;
}

export type HerMembershipRow = {
  is_member?: boolean | null;
  member_expires_at?: string | null;
};

export function isHerMemberActive(
  row: HerMembershipRow | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!row?.member_expires_at) return false;
  const exp = Date.parse(row.member_expires_at);
  if (!Number.isFinite(exp) || exp <= nowMs) return false;
  // Prefer expires_at as source of truth; is_member is a cache flag.
  return true;
}

export type HerMembershipStatus = {
  isMember: boolean;
  expiresAt: string | null;
  expiresAtMs: number | null;
  tryOnCap: number;
  deepDiscount: number;
  /** Copy for UI — never implies auto-renew. */
  renewHint: string;
};

export function statusFromRow(row: HerMembershipRow | null | undefined): HerMembershipStatus {
  const active = isHerMemberActive(row);
  const expiresAt = active ? row?.member_expires_at ?? null : null;
  const expiresAtMs = expiresAt ? Date.parse(expiresAt) : null;
  return {
    isMember: active,
    expiresAt,
    expiresAtMs: Number.isFinite(expiresAtMs) ? expiresAtMs : null,
    tryOnCap: active ? MEMBER_TRY_ON_CAP : 3,
    deepDiscount: active ? DEEP_REPORT_MEMBER_DISCOUNT : 0,
    renewHint: active
      ? '到期后需手动续费，我们不会自动扣款'
      : '开通后 30 天权益 · 到期不自动续费',
  };
}

export async function loadHerMembership(userId: string): Promise<HerMembershipStatus> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('her_profiles')
    .select('is_member, member_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[her/membership] load failed', error.message);
  }

  return statusFromRow((data as HerMembershipRow | null) ?? null);
}

/**
 * Activate / extend membership on her_profiles.
 * Stacks from max(now, current expiry) + days — never auto-charges.
 */
export async function activateHerMembership(
  userId: string,
  opts: { sku: string; expiresAtMs?: number; days?: number },
): Promise<HerMembershipStatus> {
  const admin = createAdminSupabaseClient();
  const now = Date.now();
  const days = opts.days ?? membershipDaysForSku(opts.sku);

  const { data: existing } = await admin
    .from('her_profiles')
    .select('is_member, member_expires_at, completeness_pct')
    .eq('user_id', userId)
    .maybeSingle();

  const currentExp = existing?.member_expires_at
    ? Date.parse(existing.member_expires_at as string)
    : 0;
  const basis = Math.max(now, Number.isFinite(currentExp) ? currentExp : 0);
  const expiresAtMs =
    opts.expiresAtMs && opts.expiresAtMs > now
      ? Math.max(opts.expiresAtMs, basis)
      : basis + days * 86_400_000;
  const expiresIso = new Date(expiresAtMs).toISOString();

  const payload = {
    user_id: userId,
    is_member: true,
    member_expires_at: expiresIso,
    completeness_pct: (existing as { completeness_pct?: number } | null)?.completeness_pct ?? 10,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from('her_profiles').upsert(payload, { onConflict: 'user_id' });
  if (error) {
    console.error('[her/membership] activate failed', error.message);
    throw new Error(`her_membership_activate_failed:${error.message}`);
  }

  return statusFromRow({ is_member: true, member_expires_at: expiresIso });
}

/** Resolve logged-in user for an order (direct user_id or device binding). */
export async function resolveOrderUserId(order: {
  user_id?: string | null;
  device_id?: string | null;
}): Promise<string | null> {
  if (order.user_id) return order.user_id;
  const deviceId = order.device_id;
  if (!deviceId) return null;

  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from('device_user_bindings')
    .select('user_id')
    .eq('device_id', deviceId)
    .maybeSingle();

  return (data?.user_id as string | undefined) ?? null;
}

/**
 * After a paid membership order: write her_profiles when we can resolve a user.
 * Safe no-op when anonymous / unbound.
 */
export async function syncHerMembershipFromPaidOrder(order: {
  user_id?: string | null;
  device_id?: string | null;
  sku?: string | null;
  expiresAtMs?: number | null;
}): Promise<HerMembershipStatus | null> {
  const sku = order.sku ?? null;
  if (!isMembershipSku(sku)) return null;

  const userId = await resolveOrderUserId(order);
  if (!userId) return null;

  return activateHerMembership(userId, {
    sku: sku!,
    expiresAtMs: order.expiresAtMs ?? undefined,
  });
}
