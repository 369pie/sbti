import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/** POST /api/ugc/result — record a test result (public endpoint) */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const adminSupabase = createAdminSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();

  const { universeId, personalitySlug, sessionId, scores, referrer } = body;

  if (!universeId || !personalitySlug) {
    return NextResponse.json({ error: 'universeId and personalitySlug are required' }, { status: 400 });
  }

  // Verify universe exists and is published
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('id, status')
    .eq('id', universeId)
    .single();

  if (!universe || universe.status !== 'published') {
    return NextResponse.json({ error: 'Universe not found or not published' }, { status: 404 });
  }

  const { error } = await adminSupabase.from('creator_test_results').insert({
    universe_id: universeId,
    personality_slug: personalitySlug,
    session_id: sessionId ?? null,
    user_id: user?.id ?? null,
    scores: scores ?? null,
    referrer: referrer ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment total_tests counter (best-effort)
  const { error: incrementError } = await adminSupabase.rpc('increment_universe_tests', {
    universe_id: universeId,
  });
  if (incrementError) {
    console.warn('[api/ugc/result] Failed to increment universe tests:', incrementError.message);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
