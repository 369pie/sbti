/**
 * POST /api/mysti/payment/notify
 * 虎皮椒异步回调（重要：所有解锁的最终事实来源）
 *
 * 当前 W4 阶段：仅做日志 + 验签 + 返回 success；
 * 将来接入 Supabase orders 表后，在此 upsert order_status='paid' 并写入 unlock_token。
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  readXunhupayConfig,
  verifyXunhupayCallback,
  type XunhupayConfig,
  type XunhupayPaymentChannel,
} from '@/lib/payment/xunhupay';
import {
  markMystiOrderPaid,
  updateMystiOrderStatus,
  type MystiOrderAttach,
} from '@/lib/mysti/payment-store';

function parseAttach(raw: string | undefined): MystiOrderAttach | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MystiOrderAttach;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const channelParam = req.nextUrl.searchParams.get('channel');
  const candidates: XunhupayPaymentChannel[] =
    channelParam === 'wechat' || channelParam === 'alipay'
      ? [channelParam]
      : ['wechat', 'alipay'];

  const cfgs = candidates
    .map(channel => readXunhupayConfig(channel))
    .filter((cfg): cfg is XunhupayConfig => cfg !== null);

  if (cfgs.length === 0) {
    return new NextResponse('xunhupay_not_configured', { status: 200 });
  }

  let payload: Record<string, string> = {};
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      payload = (await req.json()) as Record<string, string>;
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      payload = Object.fromEntries(params.entries());
    }
  } catch {
    return new NextResponse('invalid_payload', { status: 400 });
  }

  const matchedCfg = cfgs.find(cfg => verifyXunhupayCallback(payload, cfg.appsecret));
  if (!matchedCfg) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[mysti.payment.notify] hash mismatch', payload);
    }
    return new NextResponse('invalid_hash', { status: 401 });
  }

  const status = String(payload.status ?? '');
  const tradeOrderId = String(payload.trade_order_id ?? '');
  if (!tradeOrderId) {
    return new NextResponse('success', { status: 200 });
  }

  if (status === 'CD') {
    try {
      await updateMystiOrderStatus(tradeOrderId, 'refunded');
    } catch (error) {
      console.warn('[mysti.payment.notify] refund update failed', error);
    }
    return new NextResponse('success', { status: 200 });
  }

  if (status !== 'OD') {
    // 未支付 / 状态不对 — 仍然回 success 防止重发风暴
    return new NextResponse('success', { status: 200 });
  }

  const attach = parseAttach(payload.attach);

  try {
    await markMystiOrderPaid({
      tradeOrderId,
      providerOrderId:
        String(payload.open_order_id ?? '') ||
        String(payload.transaction_id ?? '') ||
        null,
      channel: matchedCfg.channel,
      totalFee: Number(payload.total_fee ?? 0),
      orderTitle: String(payload.order_title ?? ''),
      attach,
      notifyPayload: payload,
    });
  } catch (error) {
    console.error('[mysti.payment.notify] persist failed', error);
    return new NextResponse('persist_failed', { status: 500 });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      '[mysti.payment.notify] order paid',
      tradeOrderId,
      matchedCfg.channel,
      payload.attach,
    );
  }

  // 虎皮椒约定：返回字符串 "success" 表示已收单
  return new NextResponse('success', { status: 200 });
}
