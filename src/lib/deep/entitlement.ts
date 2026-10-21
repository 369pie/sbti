/**
 * Server-side deep-content entitlement: active member (member-access.ts, incl.
 * legacy 暮光通行证) OR a paid single-purchase order for this sku + resource on
 * this device (incl. legacy stored SKUs via getMystiOrderSku). Never trusts a
 * client "unlocked" flag.
 */
import { memberUnlocksSku } from '@/lib/member-access';

export type DeepEntitlement = { unlocked: boolean; via: 'member' | 'order' | null };

export type DeepEntitlementDeps = {
  memberUnlocks: (sku: string, deviceId: string | null) => Promise<boolean>;
  paidOrder: (sku: string, resourceId: string, deviceId: string) => Promise<boolean>;
};

const defaultDeps: DeepEntitlementDeps = {
  async memberUnlocks(sku, deviceId) {
    return (await memberUnlocksSku(sku, { deviceId })).unlocked;
  },
  async paidOrder(sku, resourceId, deviceId) {
    const store = await import('@/lib/mysti/payment-store');
    const { reconcileMystiOrderFromProvider } = await import('@/lib/mysti/payment-reconcile');
    const existing = await store.findLatestMystiOrderForEntitlement({
      sku: sku as never,
      resourceId,
      deviceId,
    });
    if (!existing) return false;
    const order = existing.status === 'paid' ? existing : await reconcileMystiOrderFromProvider(existing);
    return order.status === 'paid' && store.getMystiOrderSku(order) === sku;
  },
};

let override: Partial<DeepEntitlementDeps> | null = null;
/** Test hook only. */
export function __setDeepEntitlementDepsForTests(d: Partial<DeepEntitlementDeps> | null): void {
  override = d;
}

export async function checkDeepEntitlement(input: {
  sku: string;
  resourceId: string;
  deviceId?: string | null;
}): Promise<DeepEntitlement> {
  const d = { ...defaultDeps, ...(override ?? {}) };
  const deviceId = (input.deviceId ?? '').slice(0, 64) || null;
  try {
    if (await d.memberUnlocks(input.sku, deviceId)) return { unlocked: true, via: 'member' };
    if (deviceId && (await d.paidOrder(input.sku, input.resourceId.slice(0, 64), deviceId))) {
      return { unlocked: true, via: 'order' };
    }
  } catch (err) {
    console.warn('[deep-entitlement] check failed — locked', err);
  }
  return { unlocked: false, via: null };
}
