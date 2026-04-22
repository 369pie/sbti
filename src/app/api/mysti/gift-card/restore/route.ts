/**
 * POST /api/mysti/gift-card/restore
 * Recovers the latest paid gift-card order for this browser/device.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ensureGiftCardIssued,
  findLatestMystiGiftOrderForDevice,
} from '@/lib/mysti/payment-store';
import { reconcileMystiOrderFromProvider } from '@/lib/mysti/payment-reconcile';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export async function POST(req: NextRequest) {
  let body: { deviceId?: string } = {};
  try {
    body = (await req.json()) as { deviceId?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const deviceId = typeof body.deviceId === 'string'
    ? body.deviceId.slice(0, 64)
    : '';

  if (!deviceId) {
    return NextResponse.json({ error: 'invalid_params', restored: false }, { status: 400 });
  }

  maybeCleanup();
  const rl = rateLimit(
    `mysti:gift-restore:${resolveRateLimitKey(req, deviceId)}`,
    { limit: 8, windowMs: 60_000 },
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterMs: rl.resetMs, restored: false },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) },
      },
    );
  }

  try {
    const existing = await findLatestMystiGiftOrderForDevice(deviceId);
    if (!existing) {
      return NextResponse.json({ restored: false, pending: false });
    }

    const order = await reconcileMystiOrderFromProvider(existing);
    if (order.status !== 'paid') {
      return NextResponse.json({
        restored: false,
        pending: order.status === 'pending',
        orderStatus: order.status,
      });
    }

    const card = await ensureGiftCardIssued(order);
    if (!card) {
      return NextResponse.json({ restored: false, pending: false });
    }

    return NextResponse.json({
      restored: true,
      pending: false,
      card,
      orderId: order.trade_order_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'gift_restore_failed', message: String(error), restored: false },
      { status: 500 },
    );
  }
}
