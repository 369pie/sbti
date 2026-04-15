import { NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const identityStage = user.is_anonymous ? 'anonymous' : 'claimed';
    const nowIso = new Date().toISOString();
    const adminClient = createAdminSupabaseClient();

    const { data: existingProfile } = await adminClient
      .from('user_profiles')
      .select('identity_stage, claimed_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error: profileError } = await adminClient
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          identity_stage: identityStage,
          claimed_at:
            identityStage === 'claimed'
              ? existingProfile?.claimed_at ?? nowIso
              : existingProfile?.claimed_at ?? null,
          last_seen_at: nowIso,
          updated_at: nowIso,
        },
        { onConflict: 'user_id' },
      );

    if (profileError) {
      console.error('[cpti/upgrade POST] Failed to upsert user profile:', profileError);
      return json(
        { error: 'Failed to update identity stage' },
        { status: 500 },
      );
    }

    if (identityStage === 'claimed' && existingProfile?.identity_stage !== 'claimed') {
      await adminClient.from('user_identity_events').insert({
        user_id: user.id,
        event_type: 'upgrade_confirmed',
        from_stage: existingProfile?.identity_stage ?? 'anonymous',
        to_stage: 'claimed',
        source: 'cpti_upgrade_route',
        event_payload: {},
      });
    }

    return json({
      ok: true,
      userId: user.id,
      identityStage,
      isAnonymous: user.is_anonymous ?? false,
    });
  } catch (error) {
    console.error('[cpti/upgrade POST] Unexpected error:', error);
    return json(
      { error: 'Failed to upgrade identity' },
      { status: 500 },
    );
  }
}
