import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchCreatorEarnings } from '@/lib/ugc/earnings';

/**
 * GET /api/creator/earnings — Creator's earnings summary across all universes.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: creator } = await supabase
    .from('creators')
    .select('id, tier')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: '未找到创作者账户' }, { status: 403 });
  }

  const earnings = await fetchCreatorEarnings(supabase, creator.id as string);

  return NextResponse.json({
    ...earnings,
    creatorTier: creator.tier,
  });
}
