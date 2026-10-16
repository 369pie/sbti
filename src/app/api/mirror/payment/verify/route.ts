/**
 * GET /api/mirror/payment/verify?orderId=xxx
 * 前端支付返回后轮询本接口，确认订单已支付后返回 credits 数量。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMirrorOrder } from '@/lib/mirror/order-store';
import { creditMirrorOrderToWallet } from '@/lib/mirror/wallet-credit';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim();
  if (!orderId) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  }

  let order = await getMirrorOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  if (order.status === 'paid' && order.userId) {
    try {
      order = await creditMirrorOrderToWallet(order);
    } catch (error) {
      console.error('[mirror-payment-verify] wallet credit failed', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({
    orderId: order.tradeOrderId,
    status: order.status,
    credits: order.credits,
    pack: order.pack,
    paidAt: order.paidAt ?? null,
    serverWalletEligible: Boolean(order.userId),
    serverWalletCredited: Boolean(order.walletCredit),
    serverBalance: order.walletCredit?.balance ?? null,
    walletApplied: order.walletCredit?.applied ?? null,
  });
}
