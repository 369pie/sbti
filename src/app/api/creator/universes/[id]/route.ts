import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

/** GET /api/creator/universes/[id] — get full universe data (for editing) */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('*, creators!inner(user_id)')
    .eq('id', id)
    .single();

  if (!universe) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const creatorRow = universe.creators as unknown as { user_id: string };
  if (creatorRow.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch related data
  const [axesRes, questionsRes, personalitiesRes] = await Promise.all([
    supabase.from('creator_axes').select('*').eq('universe_id', id).order('sort_order'),
    supabase.from('creator_questions').select('*, creator_options(*)').eq('universe_id', id).order('sort_order'),
    supabase.from('creator_personalities').select('*').eq('universe_id', id).order('sort_order'),
  ]);

  return NextResponse.json({
    universe,
    axes: axesRes.data ?? [],
    questions: (questionsRes.data ?? []).map((q: Record<string, unknown>) => ({
      ...q,
      options: ((q.creator_options as Record<string, unknown>[]) ?? [])
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.sort_order as number) - (b.sort_order as number)),
    })),
    personalities: personalitiesRes.data ?? [],
  });
}

/** PATCH /api/creator/universes/[id] — update universe settings */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('creator_universes')
    .select('creator_id, creators!inner(user_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const creatorRow = existing.creators as unknown as { user_id: string };
  if (creatorRow.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  // Only allow safe fields to be updated
  const allowedFields = [
    'name', 'short_name', 'emoji', 'description', 'primary_color',
    'card_style', 'scoring_mode', 'questions_per_test',
    'hit_label', 'os_label', 'symptoms_label', 'status',
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  // Prevent direct publish — must go through review
  if (updates.status === 'published') {
    return NextResponse.json({ error: 'Cannot publish directly. Submit for review.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('creator_universes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ universe: data });
}

/** DELETE /api/creator/universes/[id] — delete a draft universe */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('creator_universes')
    .select('status, creators!inner(user_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const creatorRow = existing.creators as unknown as { user_id: string };
  if (creatorRow.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (existing.status === 'published') {
    return NextResponse.json({ error: 'Cannot delete a published universe. Archive it first.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('creator_universes')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
