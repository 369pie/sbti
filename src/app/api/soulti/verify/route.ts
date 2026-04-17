/**
 * SoulTI purchase verify (E-09 · stub)
 *
 * Confirms an order. In stub mode (SOULTI_PAYMENT_PROVIDER != 'live'), any
 * order with `stub=1` is accepted. Real implementation should verify against
 * provider webhook / server-to-server API.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId') ?? '';
  const stub = req.nextUrl.searchParams.get('stub') === '1';
  const isLive = process.env.SOULTI_PAYMENT_PROVIDER === 'live';

  if (!orderId) {
    return NextResponse.json({ error: 'missing_orderId' }, { status: 400 });
  }
  if (isLive) {
    // Real provider check would happen here.
    return NextResponse.json({ orderId, status: 'pending', provider: 'live' });
  }
  if (!stub) {
    return NextResponse.json({ orderId, status: 'pending' });
  }
  return NextResponse.json({
    orderId,
    status: 'paid',
    paidAt: new Date().toISOString(),
    provider: 'stub',
  });
}
