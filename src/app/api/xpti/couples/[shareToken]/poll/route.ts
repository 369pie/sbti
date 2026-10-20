/**
 * GET /api/xpti/couples/[shareToken]/poll
 *
 * Lightweight endpoint for the inviter's SWR poller (~10s interval) to
 * detect when partner completes + unlock state changes — without re-sending
 * the full merged payload.
 *
 * Returns: { status, completedAt, unlocked, unlockedAt, partnerNickname }
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
    status: couple.status,
    completedAt: couple.completed_at,
    unlocked: unlock.unlocked,
      unlockedVia: unlock.via,
    unlockedAt: couple.unlocked_at,
    unlockedSku: couple.unlocked_sku,
    partnerNickname: couple.partner_nickname,
    practiceChecklist: (couple.practice_checklist as Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }> | null) ?? {},
  });
}
