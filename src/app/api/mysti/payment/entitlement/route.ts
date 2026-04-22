/**
 * POST /api/mysti/payment/entitlement
 * Restore a paid single-purchase entitlement for the same browser/device.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ALL_SKUS, isSubscriptionSku, type MystiSku } from '@/lib/mysti/unlock';
import {
  findLatestMystiOrderForEntitlement,
  getMystiOrderRedirectPath,
  getMystiOrderSku,
  markMystiOrderVerified,
} from '@/lib/mysti/payment-store';
import { reconcileMystiOrderFromProvider } from '@/lib/mysti/payment-reconcile';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

interface EntitlementBody {
  sku?: string;
  resourceId?: string;
  deviceId?: string;
}

const VALID_SKUS = new Set<MystiSku>(ALL_SKUS);

export async function POST(req: NextRequest) {
  let body: EntitlementBody = {};
  try {
    body = (await req.json()) as EntitlementBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const sku = typeof body.sku === 'string' ? body.sku : '';
  const resourceId = typeof body.resourceId === 'string'
    ? body.resourceId.slice(0, 64)
    : '';
  const deviceId = typeof body.deviceId === 'string'
    ? body.deviceId.slice(0, 64)
    : '';

  if (!VALID_SKUS.has(sku as MystiSku) || isSubscriptionSku(sku) || !resourceId || !deviceId) {
    return NextResponse.json({ error: 'invalid_params', unlocked: false }, { status: 400 });
  }

  maybeCleanup();
  const rl = rateLimit(
    `mysti:entitlement:${resolveRateLimitKey(req, deviceId)}:${sku}:${resourceId}`,
    { limit: 12, windowMs: 60_000 },
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterMs: rl.resetMs, unlocked: false },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) },
      },
    );
  }

  try {
    const existing = await findLatestMystiOrderForEntitlement({
      sku: sku as MystiSku,
      resourceId,
      deviceId,
    });

    if (!existing) {
      return NextResponse.json({ unlocked: false, pending: false });
    }

    const order = await reconcileMystiOrderFromProvider(existing);

    if (order.status !== 'paid' || getMystiOrderSku(order) !== sku) {
      return NextResponse.json({
        unlocked: false,
        pending: order.status === 'pending',
        orderStatus: order.status,
      });
    }

    await markMystiOrderVerified(order.trade_order_id);

    return NextResponse.json({
      unlocked: true,
      pending: false,
      orderId: order.trade_order_id,
      sku: getMystiOrderSku(order),
      resourceId: order.resource_id,
      redirect: getMystiOrderRedirectPath(order),
      token: `mysti_${order.id}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'entitlement_failed', message: String(error), unlocked: false },
      { status: 500 },
    );
  }
}
