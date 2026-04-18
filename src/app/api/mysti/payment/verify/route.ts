/**
 * GET /api/mysti/payment/verify?orderId=xxx
 * 前端从 /mysti/payment/return 跳回后调用本接口确认订单已支付
 *
 * Stub 模式（仅显式 stub）—— 直接返回 paid:true，方便开发。
 * Live 模式 —— 直接查询服务端 mysti_orders；gift-card 会在首次 verify 成功时签发服务端礼品卡。
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasAnyXunhupayConfig } from '@/lib/payment/xunhupay';
import { isMystiPaymentStubMode } from '@/lib/mysti/payment-mode';
import {
  ensureGiftCardIssued,
  ensureSubscriptionFromOrder,
  findMystiOrder,
  markMystiOrderVerified,
} from '@/lib/mysti/payment-store';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export async function GET(req: NextRequest) {
  // Verify is hit on every payment-return. Limit to 30 polls per IP per
  // minute so a stuck client can't hammer the supabase lookup.
  maybeCleanup();
  const rl = rateLimit(
    `mysti:verify:${resolveRateLimitKey(req)}`,
    { limit: 30, windowMs: 60_000 },
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterMs: rl.resetMs },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) },
      },
    );
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId') || '';
  const stub = url.searchParams.get('stub') === '1';
  const allowStub = isMystiPaymentStubMode();

  if (!orderId) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  if (stub) {
    if (!allowStub) {
      return NextResponse.json({ error: 'stub_disabled' }, { status: 403 });
    }

    // 颁发本地解锁 token（不安全，仅 W4 阶段）
    return NextResponse.json({
      paid: true,
      orderId,
      token: `stub_${Date.now().toString(36)}`,
      stub: true,
    });
  }

  if (!hasAnyXunhupayConfig()) {
    return NextResponse.json(
      {
        error: 'payment_not_configured',
        paid: false,
        pending: false,
        orderId,
        stub: false,
      },
      { status: 503 },
    );
  }

  try {
    const order = await findMystiOrder(orderId);
    if (!order) {
      return NextResponse.json({
        paid: false,
        pending: true,
        orderId,
        stub: false,
      });
    }

    if (order.status !== 'paid') {
      return NextResponse.json({
        paid: false,
        pending: order.status === 'pending',
        orderId,
        orderStatus: order.status,
        stub: false,
      });
    }

    await markMystiOrderVerified(orderId);
    const giftCard = await ensureGiftCardIssued(order);
    const subscription = await ensureSubscriptionFromOrder(order);

    return NextResponse.json({
      paid: true,
      pending: false,
      orderId,
      orderStatus: order.status,
      token: `mysti_${order.id}`,
      stub: false,
      giftCard,
      subscription,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'verify_failed', message: String(error) },
      { status: 500 },
    );
  }
}
