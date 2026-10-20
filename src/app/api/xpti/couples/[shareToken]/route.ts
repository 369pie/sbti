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
import { coupleUnlockState } from '@/lib/member-access';
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
  const unlock = await coupleUnlockState(couple, { deviceId: req.nextUrl.searchParams.get('deviceId') });

  return NextResponse.json({
    couple: {
      shareToken: couple.share_token,
      pairCode: couple.pair_code,
      status: couple.status,
      inviter: {
        slug: couple.inviter_slug,
        dims: couple.inviter_dims,
        nickname: couple.inviter_nickname,
      },
      partner: couple.partner_slug
        ? {
            slug: couple.partner_slug,
            dims: couple.partner_dims,
            nickname: couple.partner_nickname,
          }
        : null,
      merged: couple.merged_payload,
      unlocked: unlock.unlocked,
      unlockedVia: unlock.via,
      unlockedSku: couple.unlocked_sku,
      unlockedAt: couple.unlocked_at,
      completedAt: couple.completed_at,
      expiresAt: couple.expires_at,
      history: couple.history ?? [],
      practiceChecklist: (couple.practice_checklist as Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }> | null) ?? {},
    },
  });
}
