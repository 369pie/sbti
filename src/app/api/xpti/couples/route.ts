/**
 * POST /api/xpti/couples
 *
 * Create a new XPTI couple share record. Body:
 *   { inviterSlug: string; inviterDims: number[]; inviterNickname?: string; deviceId?: string }
 *
 * Returns: { shareToken, pairCode, expiresAt }
 *
 * Auth model: optional. If a Supabase session exists (anon or claimed) we
 * record `inviter_user_id` so the inviter can see this record in /me/library/.
 * Anonymous (no session) creation is also allowed — the share_token alone
 * grants access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCouple } from '@/lib/xpti/couple-server';
import { getAuthUser } from '@/lib/supabase/middleware';

interface CreateCoupleBody {
  inviterSlug?: unknown;
  inviterDims?: unknown;
  inviterNickname?: unknown;
  deviceId?: unknown;
}

function isValidDims(value: unknown): value is number[] {
  if (!Array.isArray(value)) return false;
  if (value.length !== 9) return false;
  return value.every((n) => typeof n === 'number' && Number.isFinite(n));
}

export async function POST(req: NextRequest) {
  let body: CreateCoupleBody;
  try {
    body = (await req.json()) as CreateCoupleBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const inviterSlug = typeof body.inviterSlug === 'string' ? body.inviterSlug : null;
  if (!inviterSlug) {
    return NextResponse.json({ error: 'inviterSlug_required' }, { status: 400 });
  }
  if (!isValidDims(body.inviterDims)) {
    return NextResponse.json({ error: 'inviterDims_invalid' }, { status: 400 });
  }

  const inviterNickname =
    typeof body.inviterNickname === 'string' ? body.inviterNickname : null;
  const deviceId = typeof body.deviceId === 'string' && body.deviceId.length > 0
    ? body.deviceId
    : null;

  const { user } = await getAuthUser();

  try {
    const couple = await createCouple({
      inviterSlug,
      inviterDims: body.inviterDims,
      inviterNickname,
      inviterUserId: user?.id ?? null,
      inviterDeviceId: deviceId,
    });
    return NextResponse.json({
      shareToken: couple.share_token,
      pairCode: couple.pair_code,
      expiresAt: couple.expires_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('[POST /api/xpti/couples]', message);
    return NextResponse.json({ error: 'create_failed', message }, { status: 500 });
  }
}
