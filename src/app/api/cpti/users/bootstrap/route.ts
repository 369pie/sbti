import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * POST /api/cpti/users/bootstrap
 *
 * Returns the current user's identity. If no session exists,
 * the client should call supabase.auth.signInAnonymously() first
 * — anonymous auth is a client-side operation.
 *
 * This endpoint ensures the user_profiles row exists (fallback if trigger missed).
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'No session found. Call supabase.auth.signInAnonymously() from the client first.',
          needsAnonymousSignIn: true,
        },
        { status: 401 }
      );
    }

    // Ensure user_profiles row exists (belt-and-suspenders with the DB trigger)
    const admin = createAdminSupabaseClient();
    const { error: upsertError } = await admin
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          identity_stage: user.is_anonymous ? 'anonymous' : 'claimed',
          nickname: (user.user_metadata as Record<string, unknown>)?.nickname as string ?? '',
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

    if (upsertError) {
      console.error('[bootstrap] Failed to ensure user_profiles:', upsertError.message);
      // Non-fatal — profile may already exist from trigger
    }

    return NextResponse.json(
      {
        userId: user.id,
        isAnonymous: user.is_anonymous ?? false,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[bootstrap] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
