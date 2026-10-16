/**
 * SoulTI purchase verify (E-09 · stub)
 *
 * Confirms an order. In stub mode (SOULTI_PAYMENT_PROVIDER != 'live'), any
 * order with `stub=1` is accepted. Real implementation should verify against
 * provider webhook / server-to-server API.
 *
 * Side effect on success: when `sku=full-report` and we know the buyer's
 * email + slug (passed through query params), we record a
 * `soul_letter_unlocks` row so the cron dispatcher releases D+3 / D+7 letters.
 * Recording is best-effort and never blocks the verify response.
 */

import { NextRequest, NextResponse } from 'next/server';

async function recordUnlock(opts: {
  orderId: string;
  email: string;
  slug: string;
  sku: string;
}): Promise<void> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const res = await fetch(
      `${url}/rest/v1/soul_letter_unlocks?on_conflict=order_id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          order_id: opts.orderId,
          email: opts.email.toLowerCase(),
          slug: opts.slug,
          sku: opts.sku,
          unlocked_at: new Date().toISOString(),
          expires_at: expiresAt,
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[soulti/verify] unlock upsert non-ok', res.status, body.slice(0, 200));
    }
  } catch (err) {
    console.warn('[soulti/verify] unlock upsert threw', err);
  }
}

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId') ?? '';
  const stub = req.nextUrl.searchParams.get('stub') === '1';
  const email = req.nextUrl.searchParams.get('email') ?? '';
  const slug = req.nextUrl.searchParams.get('slug') ?? '';
  const sku = req.nextUrl.searchParams.get('sku') ?? '';
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

  // Best-effort unlock side effect (Soul Letter D+3/D+7).
  if (email && slug && sku === 'full-report') {
    await recordUnlock({ orderId, email, slug, sku });
  }

  return NextResponse.json({
    orderId,
    status: 'paid',
    paidAt: new Date().toISOString(),
    provider: 'stub',
    unlocked: Boolean(email && slug && sku === 'full-report'),
  });
}

export const dynamic = 'force-dynamic';
