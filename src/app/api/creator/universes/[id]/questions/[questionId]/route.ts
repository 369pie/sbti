import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string; questionId: string }> };

/** PATCH /api/creator/universes/[id]/questions/[questionId] — update a question */
export async function PATCH(request: Request, { params }: Params) {
  const { id, questionId } = await params;
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

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if ('text' in body) updates.text = body.text;
  if ('sortOrder' in body) updates.sort_order = body.sortOrder;
  if ('poolTag' in body) updates.pool_tag = body.poolTag;

  const { data, error } = await supabase
    .from('creator_questions')
    .update(updates)
    .eq('id', questionId)
    .eq('universe_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If options are provided, replace all options
  if (Array.isArray(body.options)) {
    await supabase.from('creator_options').delete().eq('question_id', questionId);
    if (body.options.length > 0) {
      await supabase.from('creator_options').insert(
        body.options.map((o: { text: string; imageUrl?: string; scores?: Record<string, number>; targetPersonality?: string }, i: number) => ({
          question_id: questionId,
          text: o.text,
          image_url: o.imageUrl ?? null,
          sort_order: i,
          scores: o.scores ?? {},
          target_personality: o.targetPersonality ?? null,
        })),
      );
    }
  }

  return NextResponse.json({ question: data });
}

/** DELETE /api/creator/universes/[id]/questions/[questionId] */
export async function DELETE(_request: Request, { params }: Params) {
  const { id, questionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  // CASCADE will delete options
  const { error } = await supabase
    .from('creator_questions')
    .delete()
    .eq('id', questionId)
    .eq('universe_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
