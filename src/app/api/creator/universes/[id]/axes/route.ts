import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

/** PUT /api/creator/universes/[id]/axes — replace all axes */
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('creator_universes')
    .select('creators!inner(user_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const creatorRow = existing.creators as unknown as { user_id: string };
  if (creatorRow.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { axes } = await request.json();

  if (!Array.isArray(axes) || axes.length > 8) {
    return NextResponse.json({ error: 'axes must be an array with max 8 items' }, { status: 400 });
  }

  // Delete then re-insert
  await supabase.from('creator_axes').delete().eq('universe_id', id);

  if (axes.length > 0) {
    const { error } = await supabase.from('creator_axes').insert(
      axes.map((a: { axisKey: string; name: string; lowLabel: string; highLabel: string }, i: number) => ({
        universe_id: id,
        axis_key: a.axisKey,
        name: a.name,
        low_label: a.lowLabel,
        high_label: a.highLabel,
        sort_order: i,
      })),
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
