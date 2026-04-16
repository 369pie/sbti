import { NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getUserNickname } from '@/lib/supabase/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ClaimReceivedBody {
  shareToken?: string;
  markViewed?: boolean;
}

interface IdentifyClaimRow {
  id: string;
  actor_user_id: string;
  subject_user_id: string | null;
  challenge_opened_at: string | null;
  subject_viewed_at: string | null;
  subject_claimed_at: string | null;
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

async function ensureUserProfile(userId: string, isAnonymous: boolean, nickname: string) {
  const adminClient = createAdminSupabaseClient();
  await adminClient.from('user_profiles').upsert(
    {
      user_id: userId,
      identity_stage: isAnonymous ? 'anonymous' : 'claimed',
      nickname,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    },
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json(
        {
          error: 'Authentication required',
          needsAnonymousSignIn: true,
        },
        { status: 401 },
      );
    }

    const { shareToken, markViewed = false } = (await request.json()) as ClaimReceivedBody;

    if (!shareToken || typeof shareToken !== 'string') {
      return json({ error: 'shareToken is required' }, { status: 400 });
    }

    await ensureUserProfile(
      user.id,
      user.is_anonymous ?? false,
      getUserNickname(user).slice(0, 32),
    );

    const adminClient = createAdminSupabaseClient();
    const { data, error } = await adminClient
      .from('identify_assessments')
      .select('id, actor_user_id, subject_user_id, challenge_opened_at, subject_viewed_at, subject_claimed_at')
      .eq('share_token', shareToken)
      .single();

    if (error || !data) {
      return json({ error: 'Assessment not found' }, { status: 404 });
    }

    const row = data as IdentifyClaimRow;
    if (row.actor_user_id === user.id) {
      return json({ ok: true, claimed: false, markedViewed: false });
    }

    if (row.subject_user_id && row.subject_user_id !== user.id) {
      return json({ error: 'Assessment already claimed by another user' }, { status: 409 });
    }

    const nowIso = new Date().toISOString();
    const { error: updateError } = await adminClient
      .from('identify_assessments')
      .update({
        subject_user_id: user.id,
        challenge_opened_at: row.challenge_opened_at ?? nowIso,
        subject_claimed_at: row.subject_claimed_at ?? nowIso,
        subject_viewed_at: markViewed ? nowIso : row.subject_viewed_at,
        updated_at: nowIso,
      })
      .eq('id', row.id);

    if (updateError) {
      console.error('[identify/claim-received POST] Failed to update assessment:', updateError);
      return json({ error: 'Failed to claim assessment' }, { status: 500 });
    }

    return json({
      ok: true,
      claimed: true,
      markedViewed: !!markViewed,
    });
  } catch (error) {
    console.error('[identify/claim-received POST] Unexpected error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}