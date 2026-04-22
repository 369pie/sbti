import { readApiJson } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { recordUnlock, type MystiSku } from '@/lib/mysti/unlock';

export interface RestoreMystiEntitlementResult {
  restored: boolean;
  pending?: boolean;
  orderId?: string;
  token?: string;
}

export async function restoreMystiEntitlement(input: {
  sku: MystiSku;
  resourceId: string;
  deviceId?: string;
}): Promise<RestoreMystiEntitlementResult> {
  if (typeof window === 'undefined') return { restored: false };

  const deviceId = input.deviceId || getOrCreateDeviceId();
  if (!deviceId) return { restored: false };

  const res = await fetch('/api/mysti/payment/entitlement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sku: input.sku,
      resourceId: input.resourceId,
      deviceId,
    }),
  });
  const data = await readApiJson<{
    unlocked?: boolean;
    pending?: boolean;
    orderId?: string;
    token?: string;
  }>(res);

  if (!res.ok || !data.unlocked || !data.orderId) {
    return { restored: false, pending: data.pending };
  }

  recordUnlock({
    sku: input.sku,
    resourceId: input.resourceId,
    orderId: data.orderId,
    unlockedAt: Date.now(),
    token: data.token,
  });

  return {
    restored: true,
    pending: false,
    orderId: data.orderId,
    token: data.token,
  };
}
