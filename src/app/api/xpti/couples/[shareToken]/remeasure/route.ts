import { NextRequest, NextResponse } from 'next/server';
import { recordRemeasure } from '@/lib/xpti/couple-server';

export const dynamic = 'force-dynamic';

interface Ctx {
  params: Promise<{ shareToken: string }>;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { shareToken } = await ctx.params;
  if (!shareToken) {
    return NextResponse.json({ error: 'Missing shareToken' }, { status: 400 });
  }
  let body: { side?: 'inviter' | 'partner'; slug?: string; dims?: number[]; nickname?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const side = body.side;
  const slug = body.slug?.trim();
  const dims = Array.isArray(body.dims) ? body.dims : null;
  if ((side !== 'inviter' && side !== 'partner') || !slug || !dims || dims.length !== 9) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const updated = await recordRemeasure(shareToken, {
    side,
    slug,
    dims,
    nickname: body.nickname ?? null,
  });
  if (!updated) {
    return NextResponse.json({ error: 'Couple not found or update failed' }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    history: updated.history,
    merged: updated.merged_payload,
  });
}
