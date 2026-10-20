/**
 * Server-side member access check — the ONLY place API routes decide whether a
 * request is an active member for a member-covered SKU.
 *
 * Identity comes from the Supabase session (anonymous sessions included), never
 * from a client flag:
 *   1. her_profiles(user_id = session user).member_expires_at > now
 *   2. legacy 暮光通行证: active mysti_subscriptions on a device bound to the
 *      session user (device_user_bindings), or on the request deviceId — the
 *      same device-id bearer model the existing paid-order restore path uses.
 */
import { memberCoversSku } from '@/lib/entitlements';

export type MemberAccess = {
  userId: string | null;
  isMember: boolean;
  source: 'her_profiles' | 'legacy_pass' | null;
  expiresAt: string | null;
};

export type MemberAccessDeps = {
  getSessionUserId: () => Promise<string | null>;
  herMemberExpiry: (userId: string) => Promise<string | null>;
  boundDeviceIds: (userId: string) => Promise<string[]>;
  legacyPassExpiry: (deviceId: string) => Promise<string | null>;
  now: () => number;
};

const defaultDeps: MemberAccessDeps = {
  async getSessionUserId() {
    const { getAuthUser } = await import('@/lib/supabase/middleware');
    const { user } = await getAuthUser();
    return user?.id ?? null;
  },
  async herMemberExpiry(userId) {
    const { createAdminSupabaseClient } = await import('@/lib/supabase/admin');
    const { data } = await createAdminSupabaseClient()
      .from('her_profiles')
      .select('member_expires_at')
      .eq('user_id', userId)
      .maybeSingle();
    return (data?.member_expires_at as string | null | undefined) ?? null;
  },
  async boundDeviceIds(userId) {
    const { createAdminSupabaseClient } = await import('@/lib/supabase/admin');
    const { data } = await createAdminSupabaseClient()
      .from('device_user_bindings')
      .select('device_id')
      .eq('user_id', userId)
      .limit(10);
    return ((data ?? []) as Array<{ device_id: string }>).map((r) => r.device_id).filter(Boolean);
  },
  async legacyPassExpiry(deviceId) {
    const { findActiveSubscriptionByDevice } = await import('@/lib/mysti/payment-store');
    const { isMembershipSku } = await import('@/lib/her/membership');
    const sub = await findActiveSubscriptionByDevice(deviceId);
    if (!sub || !isMembershipSku(sub.sku)) return null;
    return new Date(sub.expiresAt).toISOString();
  },
  now: () => Date.now(),
};

let override: Partial<MemberAccessDeps> | null = null;
/** Test hook only. */
export function __setMemberAccessDepsForTests(d: Partial<MemberAccessDeps> | null): void {
  override = d;
}

function deps(): MemberAccessDeps {
  return { ...defaultDeps, ...(override ?? {}) };
}

function activeIso(iso: string | null | undefined, now: number): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t > now ? iso : null;
}

export async function resolveRequestMember(opts: { deviceId?: string | null } = {}): Promise<MemberAccess> {
  const d = deps();
  const now = d.now();
  let userId: string | null = null;
  try {
    userId = await d.getSessionUserId();
  } catch {
    userId = null;
  }
  try {
    if (userId) {
      const exp = activeIso(await d.herMemberExpiry(userId), now);
      if (exp) return { userId, isMember: true, source: 'her_profiles', expiresAt: exp };
    }
    const devices = new Set<string>();
    if (userId) for (const id of await d.boundDeviceIds(userId)) devices.add(id);
    const reqDevice = (opts.deviceId ?? '').slice(0, 64);
    if (reqDevice) devices.add(reqDevice);
    for (const id of devices) {
      const exp = activeIso(await d.legacyPassExpiry(id), now);
      if (exp) return { userId, isMember: true, source: 'legacy_pass', expiresAt: exp };
    }
  } catch (err) {
    console.warn('[member-access] resolve failed — treating as non-member', err);
  }
  return { userId, isMember: false, source: null, expiresAt: null };
}

/** True only when the SKU is member-covered AND the request is an active member. */
export async function memberUnlocksSku(
  sku: string | null | undefined,
  opts: { deviceId?: string | null } = {},
): Promise<{ unlocked: boolean; access: MemberAccess | null }> {
  if (!sku || !memberCoversSku(sku)) return { unlocked: false, access: null };
  const access = await resolveRequestMember(opts);
  return { unlocked: access.isMember, access };
}

/** 「我和他」报告: paid order OR active member (free for members, no order needed). */
export async function coupleUnlockState(
  couple: { unlocked_at?: string | null },
  opts: { deviceId?: string | null } = {},
): Promise<{ unlocked: boolean; via: 'order' | 'member' | null }> {
  if (couple.unlocked_at != null) return { unlocked: true, via: 'order' };
  const m = await memberUnlocksSku('xpti-couple-report', opts);
  return m.unlocked ? { unlocked: true, via: 'member' } : { unlocked: false, via: null };
}
