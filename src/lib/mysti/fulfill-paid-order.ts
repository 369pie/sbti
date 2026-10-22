/**
 * Shared, idempotent post-payment fulfillment for a mysti_orders row that is
 * already `paid` (only ever called after Xunhupay OD confirmation):
 *  1. issue / extend mysti_subscriptions for pass SKUs (idempotent via source_order_id)
 *  2. align her_profiles.member_expires_at to the subscription expiry (absolute max → no double extend)
 *  3. unlock the 「我和他」 pairing by share token for couple SKUs (re-run keeps it unlocked)
 * Used by the notify webhook and reconcile (cron + status polling).
 */
import { getMystiOrderDeviceId, getMystiOrderSku, type MystiOrderRow } from './payment-store';

export interface FulfillDeps {
  ensureSubscriptionFromOrder(order: MystiOrderRow): Promise<{ expiresAt: number } | null>;
  syncHerMembership(o: { user_id: string | null; device_id: string | null; sku: string | null; expiresAtMs: number }): Promise<unknown>;
  markCoupleUnlocked(token: string, p: { sku: string; userId: string | null; deviceId: string | null }): Promise<unknown>;
  parseCoupleResourceId(resourceId: string | null | undefined): string | null;
  getSku(order: MystiOrderRow): string | null;
  getDeviceId(order: MystiOrderRow): string | null;
}

const defaultDeps: FulfillDeps = {
  async ensureSubscriptionFromOrder(order) {
    const { ensureSubscriptionFromOrder } = await import('./payment-store');
    return ensureSubscriptionFromOrder(order);
  },
  async syncHerMembership(o) {
    const { syncHerMembershipFromPaidOrder } = await import('@/lib/her/membership');
    return syncHerMembershipFromPaidOrder(o);
  },
  async markCoupleUnlocked(token, p) {
    const { markCoupleUnlocked } = await import('@/lib/xpti/couple-server');
    return markCoupleUnlocked(token, p);
  },
  parseCoupleResourceId(r) {
    // Mirrors couple-server's parser; kept sync for tests.
    if (!r || !r.startsWith('couple:')) return null;
    const t = r.slice('couple:'.length);
    return t || null;
  },
  getSku: (order) => getMystiOrderSku(order) ?? null,
  getDeviceId: (order) => getMystiOrderDeviceId(order) ?? order.device_id ?? null,
};

let override: Partial<FulfillDeps> | null = null;
/** Test hook only. */
export function __setFulfillDepsForTests(d: Partial<FulfillDeps> | null) { override = d; }

export interface FulfillResult { subscriptionExpiresAt: number | null; membershipSynced: boolean; coupleUnlocked: boolean; notes: string[] }

export async function fulfillPaidOrder(order: MystiOrderRow): Promise<FulfillResult> {
  const d: FulfillDeps = { ...defaultDeps, ...(override ?? {}) };
  const res: FulfillResult = { subscriptionExpiresAt: null, membershipSynced: false, coupleUnlocked: false, notes: [] };
  if (order.status !== 'paid') { res.notes.push('not_paid'); return res; }
  const sku = d.getSku(order);
  const deviceId = d.getDeviceId(order);

  try {
    const sub = await d.ensureSubscriptionFromOrder(order);
    if (sub?.expiresAt) res.subscriptionExpiresAt = sub.expiresAt;
  } catch (e) {
    res.notes.push('subscription_failed');
    console.warn('[fulfillPaidOrder] subscription ensure failed', e instanceof Error ? e.message : e);
  }

  // Only sync with an absolute expiry: activateHerMembership takes max(), so re-runs never extend.
  if (res.subscriptionExpiresAt) {
    try {
      await d.syncHerMembership({ user_id: order.user_id ?? null, device_id: deviceId, sku, expiresAtMs: res.subscriptionExpiresAt });
      res.membershipSynced = true;
    } catch (e) {
      res.notes.push('membership_failed');
      console.warn('[fulfillPaidOrder] her membership sync failed', e instanceof Error ? e.message : e);
    }
  }

  if (sku === 'xpti-couple-report' || sku === 'xpti-couple-half') {
    const token = d.parseCoupleResourceId(order.resource_id);
    if (!token) res.notes.push('couple_no_token');
    else {
      try {
        const row = await d.markCoupleUnlocked(token, { sku, userId: order.user_id ?? null, deviceId: order.device_id ?? null });
        res.coupleUnlocked = !!row;
        if (!row) res.notes.push('couple_not_found');
      } catch (e) {
        res.notes.push('couple_failed');
        console.warn('[fulfillPaidOrder] couple unlock failed', e instanceof Error ? e.message : e);
      }
    }
  }
  return res;
}
