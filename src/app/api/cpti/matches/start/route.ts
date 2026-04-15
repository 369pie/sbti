import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface StartMatchBody {
  pairCodeId?: string;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    const body = await req.json();
    const { pairCodeId } = body as StartMatchBody;

    if (!pairCodeId) {
      return NextResponse.json(
        { error: 'pairCodeId is required to start a backend CPTI match' },
        { status: 400 },
      );
    }

    const adminClient = createAdminSupabaseClient();

    const { data: pairCode, error: pairCodeError } = await adminClient
      .from('cpti_pair_codes')
      .select('id, code, creator_user_id, creator_snapshot_id, status, used_count, max_uses, expires_at')
      .eq('id', pairCodeId)
      .single();

    if (pairCodeError || !pairCode) {
      return NextResponse.json(
        { error: 'Pair code not found' },
        { status: 404 },
      );
    }

    if (pairCode.status !== 'active' || isExpired(pairCode.expires_at)) {
      return NextResponse.json(
        { error: 'Pair code is no longer active' },
        { status: 410 },
      );
    }

    if (pairCode.used_count >= pairCode.max_uses) {
      return NextResponse.json(
        { error: 'Pair code has reached its usage limit' },
        { status: 409 },
      );
    }

    if (pairCode.creator_user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot use your own pair code to start a match' },
        { status: 400 },
      );
    }

    const { data: match, error: insertError } = await adminClient
      .from('cpti_matches')
      .insert({
        pair_code_id: pairCode.id,
        initiator_user_id: pairCode.creator_user_id,
        participant_user_id: user.id,
        initiator_snapshot_id: pairCode.creator_snapshot_id,
        submit_source: 'code_entry',
        status: 'started',
        metadata_json: {
          pairCode: pairCode.code,
        },
      })
      .select('id, status, initiator_user_id, participant_user_id')
      .single();

    if (insertError) {
      console.error('[matches/start POST] Failed to insert match:', insertError);
      return NextResponse.json(
        { error: 'Failed to start match' },
        { status: 500 },
      );
    }

    const nextUsedCount = pairCode.used_count + 1;
    const nextStatus = nextUsedCount >= pairCode.max_uses ? 'consumed' : 'active';

    await adminClient
      .from('cpti_pair_codes')
      .update({
        used_count: nextUsedCount,
        status: nextStatus,
      })
      .eq('id', pairCode.id);

    return NextResponse.json(
      {
        matchId: match.id,
        status: match.status,
        initiatorUserId: match.initiator_user_id,
        participantUserId: match.participant_user_id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[matches/start POST] Failed to start match:', error);
    return NextResponse.json(
      { error: 'Failed to start match' },
      { status: 500 },
    );
  }
});
