/**
 * POST /api/xpti/couples/[shareToken]/complete
 *
 * Partner finishes the 12-q quiz and submits dims. Server runs buildCoupleMerge
 * and writes merged_payload + flips status to 'completed'.
 *
 * Body: { partnerSlug: string; partnerDims: number[]; partnerNickname?: string; deviceId?: string }
 * Returns: { couple: PublicCoupleView }
 */

import { NextRequest, NextResponse } from 'next/server';
import { completeCouplePartner } from '@/lib/xpti/couple-server';
import { getAuthUser } from '@/lib/supabase/middleware';

interface CompleteBody {
  partnerSlug?: unknown;
  partnerDims?: unknown;
  partnerNickname?: unknown;
  deviceId?: unknown;
}

interface RouteContext {
  params: Promise<{ shareToken: string }>;
}

function isValidDims(value: unknown): value is number[] {
  if (!Array.isArray(value)) return false;
  if (value.length !== 9) return false;
  return value.every((n) => typeof n === 'number' && Number.isFinite(n));
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { shareToken } = await ctx.params;
  if (!shareToken) {
    return NextResponse.json({ error: 'shareToken_required' }, { status: 400 });
  }

  let body: CompleteBody;
  try {
    body = (await req.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const partnerSlug = typeof body.partnerSlug === 'string' ? body.partnerSlug : null;
  if (!partnerSlug) {
    return NextResponse.json({ error: 'partnerSlug_required' }, { status: 400 });
  }
  if (!isValidDims(body.partnerDims)) {
    return NextResponse.json({ error: 'partnerDims_invalid' }, { status: 400 });
  }

  const partnerNickname =
    typeof body.partnerNickname === 'string' ? body.partnerNickname : null;
  const deviceId = typeof body.deviceId === 'string' && body.deviceId.length > 0
    ? body.deviceId
    : null;

  const { user } = await getAuthUser();

  try {
    const couple = await completeCouplePartner(shareToken, {
      partnerSlug,
      partnerDims: body.partnerDims,
      partnerNickname,
      partnerUserId: user?.id ?? null,
      partnerDeviceId: deviceId,
    });
    if (!couple) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
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
        partner: {
          slug: couple.partner_slug!,
          dims: couple.partner_dims!,
          nickname: couple.partner_nickname,
        },
        merged: couple.merged_payload,
        unlocked: couple.unlocked_at != null,
        unlockedSku: couple.unlocked_sku,
        unlockedAt: couple.unlocked_at,
        completedAt: couple.completed_at,
        expiresAt: couple.expires_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('[POST /api/xpti/couples/[shareToken]/complete]', message);
    return NextResponse.json({ error: 'complete_failed', message }, { status: 500 });
  }
}
