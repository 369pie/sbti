/**
 * GET /api/mirror/payment/verify?orderId=xxx
 * 前端支付返回后轮询本接口，确认订单已支付后返回 credits 数量。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMirrorOrder } from '@/lib/mirror/order-store';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim();
  if (!orderId) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  }

  const order = getMirrorOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.tradeOrderId,
    status: order.status,
    credits: order.credits,
    pack: order.pack,
    paidAt: order.paidAt ?? null,
  });
}
