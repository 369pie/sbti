/**
 * GET /api/xpti/couples/[shareToken]
 *
 * Read the full couple state for the holder of the share_token.
 * share_token IS the credential — anyone with it sees the record (matches
 * the original `?inv=` URL-as-credential model from MVP).
 *
 * Returns: { couple: PublicCoupleView }
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildCoupleView } from '@/lib/xpti/couple-view';
import { getCoupleByShareToken } from '@/lib/xpti/couple-server';

interface RouteContext {
  params: Promise<{ shareToken: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { shareToken } = await ctx.params;
  if (!shareToken) {
    return NextResponse.json({ error: 'shareToken_required' }, { status: 400 });
  }

  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // 全站会员：「我和他」报告对会员免费（服务端按 session 判定，不信任客户端标记）。
  const view = await buildCoupleView(couple, { deviceId: req.nextUrl.searchParams.get('deviceId') });
  return NextResponse.json({ couple: view });
}
