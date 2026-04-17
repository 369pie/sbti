import { NextRequest, NextResponse } from 'next/server';
import { getGiftCardByCode } from '@/lib/mysti/payment-store';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || '';
  if (!code) {
    return NextResponse.json({ error: 'code_required' }, { status: 400 });
  }

  try {
    const card = await getGiftCardByCode(code);
    if (!card) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, card }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'gift_lookup_failed', message: String(error) },
      { status: 500 },
    );
  }
}