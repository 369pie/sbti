/**
 * SoulTI purchase
 *
 * Records purchase intent. Unlock MUST go through `/api/soulti/verify` after
 * a real provider confirms payment. Stub checkout URLs are only allowed when
 * `isSoultiPaymentStubMode()` is true (non-production by default).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAvailabilityStatus, getPaymentBlockedPayload } from '@/lib/payment/availability';
import { isSoultiPaymentStubMode } from '@/lib/soulti/payment-mode';

interface PurchaseRequestBody {
  slug?: string;
  sku?: 'deep-letter' | 'full-report';
}

const SKU_CONFIG = {
  'deep-letter': { priceCny: 9.9, label: 'SoulTI 深度信件' },
  'full-report': { priceCny: 19.9, label: 'SoulTI 全维度报告' },
} as const;

export async function POST(req: NextRequest) {
  let body: PurchaseRequestBody = {};
  try {
    body = (await req.json()) as PurchaseRequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const sku = body.sku ?? 'deep-letter';
  const slug = typeof body.slug === 'string' ? body.slug.slice(0, 40) : '';
  if (!slug || !(sku in SKU_CONFIG)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const paymentAvailability = getPaymentAvailabilityStatus();
  if (paymentAvailability.blocked) {
    return NextResponse.json(getPaymentBlockedPayload(), { status: 403 });
  }

  const config = SKU_CONFIG[sku];
  const orderId = `so_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const isStub = isSoultiPaymentStubMode();

  if (!isStub) {
    // Live mode: refuse free unlock. Real Xunhupay wiring for SoulTI follows Mysti.
    return NextResponse.json(
      {
        error: 'payment_provider_required',
        message: 'SoulTI 付费已关闭假支付。请通过 Mysti 虎皮椒收款链路完成支付，或等待 SoulTI 正式下单接口上线。',
        orderId,
        slug,
        sku,
        priceCny: config.priceCny,
        label: config.label,
        status: 'blocked_stub',
        isStub: false,
        checkoutUrl: null,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    orderId,
    slug,
    sku,
    priceCny: config.priceCny,
    label: config.label,
    status: 'pending',
    isStub: true,
    checkoutUrl: `/api/soulti/verify?orderId=${orderId}&stub=1`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
}
