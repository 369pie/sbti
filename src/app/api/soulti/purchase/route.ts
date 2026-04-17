/**
 * SoulTI purchase stub (E-09)
 *
 * Creates a pending order and returns a mock checkout URL. Wire a real
 * provider (微信/支付宝/Stripe) by replacing `createMockOrder` and wiring
 * `/api/soulti/verify` to the provider's webhook.
 *
 * Security: this endpoint records intent only; actual unlock must be gated by
 * `/api/soulti/verify` after provider confirms payment.
 */

import { NextRequest, NextResponse } from 'next/server';

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

  const config = SKU_CONFIG[sku];
  const orderId = `so_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const isStub = process.env.SOULTI_PAYMENT_PROVIDER !== 'live';

  return NextResponse.json({
    orderId,
    slug,
    sku,
    priceCny: config.priceCny,
    label: config.label,
    status: 'pending',
    isStub,
    // In stub mode we return an immediate-unlock path for dev testing.
    checkoutUrl: isStub ? `/api/soulti/verify?orderId=${orderId}&stub=1` : null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
}
