/**
 * POST /api/mirror/payment/notify
 * 虎皮椒异步回调 — 验签后标记订单为已支付。
 *
 * 虎皮椒回调参数：
 * - amount, trade_order_id, open_order_id, status(OD=成功),
 *   plugins(wechat/alipay), hash, appid, time, nonce_str 等。
 */

import { NextRequest, NextResponse } from 'next/server';
import { readXunhupayConfig, verifyXunhupayCallback } from '@/lib/payment/xunhupay';
import { markMirrorOrderPaid, markMirrorOrderFailed, getMirrorOrder } from '@/lib/mirror/order-store';

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    const formData = await req.formData();
    body = Object.fromEntries(formData.entries()) as Record<string, string>;
  } catch {
    try {
      body = (await req.json()) as Record<string, string>;
    } catch {
      return new NextResponse('invalid body', { status: 400 });
    }
  }

  const tradeOrderId = body.trade_order_id ?? body.out_trade_order ?? '';
  const status = (body.status ?? '').toUpperCase();
  const channel = req.nextUrl.searchParams.get('channel') as 'wechat' | 'alipay' | null;

  if (!tradeOrderId) {
    return new NextResponse('missing trade_order_id', { status: 400 });
  }

  // 验签
  const paymentChannel = channel === 'alipay' ? 'alipay' : 'wechat';
  const cfg = readXunhupayConfig(paymentChannel);
  if (!cfg) {
    console.error('[mirror-payment-notify] no config for channel', paymentChannel);
    return new NextResponse('config error', { status: 500 });
  }

  const valid = verifyXunhupayCallback(body, cfg.appsecret);
  if (!valid) {
    console.warn('[mirror-payment-notify] signature mismatch', { tradeOrderId });
    return new NextResponse('sign error', { status: 400 });
  }

  // 查询内存订单
  const order = getMirrorOrder(tradeOrderId);
  if (!order) {
    console.warn('[mirror-payment-notify] order not found', { tradeOrderId });
    // 虎皮椒要求返回 success，否则会重试
    return new NextResponse('success', { status: 200 });
  }

  if (status === 'OD') {
    // 支付成功
    const result = markMirrorOrderPaid(tradeOrderId);
    if (result) {
      console.info('[mirror-payment-notify] order paid', {
        tradeOrderId,
        credits: result.credits,
        channel: result.channel,
      });
    }
  } else {
    // 其他状态视为失败/取消
    markMirrorOrderFailed(tradeOrderId);
    console.info('[mirror-payment-notify] order failed/cancelled', { tradeOrderId, status });
  }

  // 虎皮椒要求返回 success
  return new NextResponse('success', { status: 200 });
}
