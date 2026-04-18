/**
 * GET /api/mysti/subscription?deviceId=xxx
 * Returns the active subscription for the device, or { active: false }.
 *
 * Used by the client on app boot to sync the local entitlement envelope
 * with the server truth (which survives clearing localStorage / new device).
 */

import { NextRequest, NextResponse } from 'next/server';
import { findActiveSubscriptionByDevice } from '@/lib/mysti/payment-store';
import { isMystiPaymentStubMode } from '@/lib/mysti/payment-mode';
import { hasAnyXunhupayConfig } from '@/lib/payment/xunhupay';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const deviceId = (url.searchParams.get('deviceId') || '').slice(0, 64);

  if (!deviceId) {
    return NextResponse.json({ active: false, reason: 'no_device' });
  }

  // 没配 Supabase 时直接返回 inactive，让前端走纯本地判定
  if (!hasAnyXunhupayConfig() && !isMystiPaymentStubMode()) {
    return NextResponse.json({ active: false, reason: 'not_configured' });
  }

  try {
    const sub = await findActiveSubscriptionByDevice(deviceId);
    if (!sub) {
      return NextResponse.json({ active: false });
    }
    return NextResponse.json({
      active: true,
      sku: sub.sku,
      startsAt: sub.startsAt,
      expiresAt: sub.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { active: false, error: String(error) },
      { status: 500 },
    );
  }
}
