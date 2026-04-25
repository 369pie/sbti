/**
 * POST /api/mirror/payment/create
 * 灵镜充值 — 创建虎皮椒支付订单
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createXunhupayOrder,
  maskXunhupayAppId,
  readXunhupayConfig,
  type XunhupayPaymentChannel,
} from '@/lib/payment/xunhupay';
import { getPaymentAvailabilityStatus, getPaymentBlockedPayload } from '@/lib/payment/availability';
import { isMirrorPaymentStubMode } from '@/lib/mirror/payment-mode';
import { createMirrorOrder, cleanupExpiredMirrorOrders } from '@/lib/mirror/order-store';
import { rateLimit, resolveRateLimitKey, maybeCleanup } from '@/lib/perf/rate-limit';

/** 灵镜充值档位 */
const MIRROR_PACKS: Record<string, { credits: number; price: number; label: string }> = {
  'mirror-10': { credits: 10, price: 10, label: '灵镜 10 次 · ¥10' },
  'mirror-30': { credits: 30, price: 30, label: '灵镜 30 次 · ¥30' },
};

function isPaymentChannel(value: unknown): value is XunhupayPaymentChannel {
  return value === 'wechat' || value === 'alipay';
}

function buildTradeOrderId(): string {
  return `mr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  let body: { pack?: string; paymentType?: string; deviceId?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const allowStub = isMirrorPaymentStubMode();

  // 支付窗口检查 (02:00-06:00)
  if (!allowStub) {
    const paymentAvailability = getPaymentAvailabilityStatus();
    if (paymentAvailability.blocked) {
      return NextResponse.json(getPaymentBlockedPayload(), { status: 403 });
    }
  }

  // 限流
  maybeCleanup();
  const rl = rateLimit(
    `mirror:create:${resolveRateLimitKey(req, body.deviceId)}`,
    { limit: 5, windowMs: 10_000 },
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterMs: rl.resetMs },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  const pack = body.pack ?? '';
  const meta = MIRROR_PACKS[pack];
  if (!meta) {
    return NextResponse.json({ error: 'invalid_pack', validPacks: Object.keys(MIRROR_PACKS) }, { status: 400 });
  }

  if (!isPaymentChannel(body.paymentType)) {
    return NextResponse.json({ error: 'invalid_payment_type' }, { status: 400 });
  }
  const paymentType = body.paymentType;

  cleanupExpiredMirrorOrders();

  const cfg = readXunhupayConfig(paymentType);
  const tradeOrderId = buildTradeOrderId();
  const origin = req.nextUrl.origin;
  const userAgent = req.headers.get('user-agent') ?? undefined;
  const siteName = req.nextUrl.hostname;
  const notifyUrl = `${origin}/api/mirror/payment/notify?channel=${paymentType}`;
  const returnUrl = `${origin}/mirror/?paid=1&orderId=${encodeURIComponent(tradeOrderId)}`;
  const callbackUrl = `${origin}/mirror/`;

  // 写入内存订单
  createMirrorOrder({
    tradeOrderId,
    channel: paymentType,
    pack,
    credits: meta.credits,
    amountYuan: meta.price,
  });

  // 无配置时 stub 或 fail
  if (!cfg) {
    if (!allowStub) {
      return NextResponse.json(
        { error: 'payment_channel_unavailable', paymentType },
        { status: 503 },
      );
    }
    return NextResponse.json({
      stub: true,
      orderId: tradeOrderId,
      pack,
      credits: meta.credits,
      price: meta.price,
      label: meta.label,
      url: `/mirror/?stub=1&channel=${paymentType}&orderId=${tradeOrderId}&pack=${pack}`,
    });
  }

  try {
    const order = await createXunhupayOrder(cfg, {
      tradeOrderId,
      totalFee: meta.price,
      title: meta.label,
      paymentType,
      userAgent,
      siteName,
      notifyUrl,
      returnUrl,
      callbackUrl,
      attach: JSON.stringify({ pack, credits: meta.credits }).slice(0, 256),
    });

    return NextResponse.json({
      stub: false,
      orderId: tradeOrderId,
      providerOrderId: order.orderId,
      pack,
      credits: meta.credits,
      price: meta.price,
      label: meta.label,
      url: order.url,
      qrcode: order.qrcode,
    });
  } catch (err) {
    console.error('[mirror-payment-create] create failed', {
      tradeOrderId,
      pack,
      paymentType,
      cfgSource: cfg?.source ?? null,
      cfgAppId: cfg ? maskXunhupayAppId(cfg.appid) : null,
      error: err instanceof Error ? err.message : String(err),
    });
    const msg = err instanceof Error ? err.message : '';
    const isProviderErr = msg.includes('xunhupay_');
    return NextResponse.json(
      {
        error: isProviderErr ? 'payment_provider_unavailable' : 'create_failed',
        message: '支付渠道暂时不可用，请稍后再试。',
        ...(process.env.NODE_ENV !== 'production' && err instanceof Error ? { debug: err.message } : {}),
      },
      { status: 500 },
    );
  }
}
