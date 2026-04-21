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
import { getCoupleByShareToken } from '@/lib/xpti/couple-server';

interface RouteContext {
  params: Promise<{ shareToken: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { shareToken } = await ctx.params;
  if (!shareToken) {
    return NextResponse.json({ error: 'shareToken_required' }, { status: 400 });
  }

  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({
    status: couple.status,
    completedAt: couple.completed_at,
    unlocked: couple.unlocked_at != null,
    unlockedAt: couple.unlocked_at,
    unlockedSku: couple.unlocked_sku,
    partnerNickname: couple.partner_nickname,
    practiceChecklist: (couple.practice_checklist as Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }> | null) ?? {},
  });
}
