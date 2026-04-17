import { NextRequest, NextResponse } from 'next/server';
import { redeemGiftCard } from '@/lib/mysti/payment-store';

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
  let body: { code?: string; giftSku?: string; resourceId?: string } = {};
  try {
    body = (await req.json()) as { code?: string; giftSku?: string; resourceId?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code : '';
  const requestedResourceId =
    typeof body.resourceId === 'string' && body.resourceId.trim()
      ? body.resourceId.trim().slice(0, 64)
      : undefined;
  const fallbackResourceId =
    body.giftSku === 'monthly-report'
      ? currentMonthKey()
      : `gift-${code.trim().toUpperCase().slice(0, 24)}`;

  if (!code) {
    return NextResponse.json({ error: 'code_required' }, { status: 400 });
  }

  try {
    const card = await redeemGiftCard({
      code,
      resourceId: requestedResourceId ?? fallbackResourceId,
    });

    if (!card) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        ok: true,
        card,
        resourceId: card.redeemedResourceId ?? requestedResourceId ?? fallbackResourceId,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'gift_redeem_failed', message: String(error) },
      { status: 500 },
    );
  }
}