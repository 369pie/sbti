import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/** POST /api/ugc/share — mark a creator result as shared */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const adminSupabase = createAdminSupabaseClient();
  const body = await request.json().catch(() => ({}));

  const universeId = typeof body.universeId === 'string' ? body.universeId : '';
  const personalitySlug = typeof body.personalitySlug === 'string' ? body.personalitySlug : '';
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';

  if (!universeId || !personalitySlug || !sessionId) {
    return NextResponse.json(
      { error: 'universeId, personalitySlug and sessionId are required' },
      { status: 400 },
    );
  }

  const { data: universe, error: universeError } = await supabase
    .from('creator_universes')
    .select('id')
    .eq('id', universeId)
    .eq('status', 'published')
    .maybeSingle();

  if (universeError) {
    return NextResponse.json({ error: universeError.message }, { status: 500 });
  }

  if (!universe) {
    return NextResponse.json({ error: 'Universe not found or not published' }, { status: 404 });
  }

  const { data: resultRow, error: resultLookupError } = await adminSupabase
    .from('creator_test_results')
    .select('id, shared')
    .eq('universe_id', universeId)
    .eq('personality_slug', personalitySlug)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (resultLookupError) {
    return NextResponse.json({ error: resultLookupError.message }, { status: 500 });
  }

  if (!resultRow) {
    return NextResponse.json({ ok: true, updated: false, pendingResult: true }, { status: 200 });
  }

  if (resultRow.shared) {
    return NextResponse.json({ ok: true, updated: false, alreadyShared: true }, { status: 200 });
  }

  const { error: updateError } = await adminSupabase
    .from('creator_test_results')
    .update({ shared: true })
    .eq('id', resultRow.id)
    .eq('shared', false);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: incrementError } = await adminSupabase.rpc('increment_universe_shares', {
    universe_id: universeId,
  });

  if (incrementError) {
    console.warn('[api/ugc/share] Failed to increment universe shares:', incrementError.message);
  }

  return NextResponse.json({ ok: true, updated: true }, { status: 200 });
}