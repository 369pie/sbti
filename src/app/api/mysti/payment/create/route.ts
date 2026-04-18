/**
 * POST /api/mysti/payment/create
 * 用户在 Paywall 点击购买 → 创建虎皮椒订单 → 返回支付 URL
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createXunhupayOrder,
  readXunhupayConfig,
  type XunhupayPaymentChannel,
} from '@/lib/payment/xunhupay';
import { isMystiPaymentStubMode } from '@/lib/mysti/payment-mode';
import {
  createPendingMystiOrder,
  updateMystiOrderStatus,
  type MystiOrderAttach,
} from '@/lib/mysti/payment-store';
import { ALL_SKUS, SKU_PRICES, isSubscriptionSku, type MystiSku } from '@/lib/mysti/unlock';
import { GIFT_CARD_OPTIONS, type GiftCardGiftSku } from '@/lib/mysti/gift-card';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

interface CreateBody {
  sku?: MystiSku;
  resourceId?: string;
  paymentType?: XunhupayPaymentChannel;
  /** 创作者推荐码（可选） */
  ref?: string;
  /** 设备识别，用于跨设备订阅与购买历史查询 */
  deviceId?: string;
  /** 支付成功后业务回跳路径，例如 /mysti/monthly/ */
  redirect?: string;
  /** 礼品卡等业务扩展字段 */
  metadata?: {
    giftSku?: GiftCardGiftSku;
    fromName?: string;
    toName?: string;
    message?: string;
  };
}

const VALID_SKUS = new Set<MystiSku>(ALL_SKUS);

function isPaymentChannel(value: unknown): value is XunhupayPaymentChannel {
  return value === 'wechat' || value === 'alipay';
}

function safeRedirectPath(input: string | undefined): string {
  if (!input || !input.startsWith('/')) return '/mysti/';
  if (input.startsWith('//')) return '/mysti/';
  return input.slice(0, 200);
}

function sanitizeGiftMetadata(input: CreateBody['metadata']): CreateBody['metadata'] | undefined {
  if (!input) return undefined;
  const validGiftSkus = new Set(GIFT_CARD_OPTIONS.map(option => option.giftSku));
  const giftSku =
    typeof input.giftSku === 'string' && validGiftSkus.has(input.giftSku)
      ? input.giftSku
      : 'soul-letter';

  const pick = (value: unknown, max: number) =>
    typeof value === 'string' && value.trim()
      ? value.trim().slice(0, max)
      : undefined;

  return {
    giftSku,
    fromName: pick(input.fromName, 24),
    toName: pick(input.toName, 24),
    message: pick(input.message, 100),
  };
}

export async function POST(req: NextRequest) {
  let body: CreateBody = {};
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Rate-limit early so abusive clients can't drive Xunhupay round-trips.
  // 5 create attempts per device+IP per 10s window is well above any honest
  // user flow (paywall debounces clicks).
  maybeCleanup();
  const rl = rateLimit(
    `mysti:create:${resolveRateLimitKey(req, body.deviceId)}`,
    { limit: 5, windowMs: 10_000 },
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

  const sku = body.sku;
  // 订阅类 SKU 没有 resourceId 概念，统一兜底为 'subscription'
  const incomingResource = (body.resourceId ?? '').slice(0, 64);
  const resourceId =
    incomingResource || (sku && isSubscriptionSku(sku) ? 'subscription' : '');
  if (body.paymentType && !isPaymentChannel(body.paymentType)) {
    return NextResponse.json({ error: 'invalid_payment_type' }, { status: 400 });
  }
  const paymentType = body.paymentType ?? 'wechat';
  const ref = (body.ref ?? '').slice(0, 32);
  const deviceId = (body.deviceId ?? '').slice(0, 64) || undefined;
  const redirect = safeRedirectPath(body.redirect);
  const metadata = sanitizeGiftMetadata(body.metadata);
  const allowStub = isMystiPaymentStubMode();

  if (!sku || !VALID_SKUS.has(sku) || !resourceId) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const cfg = readXunhupayConfig(paymentType);
  const meta = SKU_PRICES[sku];
  const tradeOrderId = `my_${sku}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const origin = req.nextUrl.origin;
  const notifyUrl = `${origin}/api/mysti/payment/notify?channel=${paymentType}&sku=${encodeURIComponent(sku)}`;
  const returnUrl = `${origin}/mysti/payment/return?channel=${paymentType}&sku=${encodeURIComponent(sku)}&resourceId=${encodeURIComponent(resourceId)}&redirect=${encodeURIComponent(redirect)}`;
  const callbackUrl = `${origin}${redirect}`;

  // Stub 模式仅用于本地/开发；生产环境缺配置时必须 fail closed。
  if (!cfg) {
    if (!allowStub) {
      return NextResponse.json(
        {
          error: 'payment_channel_unavailable',
          paymentType,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      stub: true,
      orderId: tradeOrderId,
      sku,
      price: meta.price,
      label: meta.label,
      // 前端会识别 stub 标志直接走"假装支付成功"路径
      url: `/mysti/payment/return?stub=1&channel=${paymentType}&orderId=${tradeOrderId}&sku=${sku}&resourceId=${encodeURIComponent(resourceId)}&redirect=${encodeURIComponent(redirect)}`,
    });
  }

  const attachJson: MystiOrderAttach = {
    sku,
    resourceId,
    ref: ref || undefined,
    redirect,
    ...(metadata ? { metadata } : {}),
  };

  try {
    await createPendingMystiOrder({
      tradeOrderId,
      channel: paymentType,
      sku,
      resourceId,
      title: meta.label,
      amountCents: Math.round(meta.price * 100),
      redirectPath: redirect,
      referralCode: ref || undefined,
      deviceId,
      attachJson,
    });

    const order = await createXunhupayOrder(cfg, {
      tradeOrderId,
      totalFee: meta.price,
      title: meta.label,
      paymentType,
      notifyUrl,
      returnUrl,
      callbackUrl,
      attach: JSON.stringify({ sku, resourceId, ref, redirect }).slice(0, 256),
    });

    return NextResponse.json({
      stub: false,
      orderId: tradeOrderId,
      providerOrderId: order.orderId,
      sku,
      price: meta.price,
      label: meta.label,
      url: order.url,
      qrcode: order.qrcode,
    });
  } catch (err) {
    try {
      await updateMystiOrderStatus(tradeOrderId, 'failed');
    } catch {
      // noop
    }
    return NextResponse.json(
      { error: 'create_failed', message: String(err) },
      { status: 502 },
    );
  }
}
