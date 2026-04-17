import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

/** GET /api/creator/universes/[id]/questions — list all questions with options */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: questions } = await supabase
    .from('creator_questions')
    .select('*, creator_options(*)')
    .eq('universe_id', id)
    .order('sort_order');

  return NextResponse.json({
    questions: (questions ?? []).map((q: Record<string, unknown>) => ({
      ...q,
      options: ((q.creator_options as Record<string, unknown>[]) ?? [])
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.sort_order as number) - (b.sort_order as number)),
    })),
  });
}

/** POST /api/creator/universes/[id]/questions — add a question */
export async function POST(request: Request, { params }: Params) {
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

  const body = await request.json();
  const { text, sortOrder, poolTag, options } = body;

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  const { data: question, error } = await supabase
    .from('creator_questions')
    .insert({
      universe_id: id,
      text,
      sort_order: sortOrder ?? 0,
      pool_tag: poolTag ?? null,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert options if provided
  if (Array.isArray(options) && options.length > 0) {
    await supabase.from('creator_options').insert(
      options.map((o: { text: string; imageUrl?: string; scores?: Record<string, number>; targetPersonality?: string }, i: number) => ({
        question_id: question.id,
        text: o.text,
        image_url: o.imageUrl ?? null,
        sort_order: i,
        scores: o.scores ?? {},
        target_personality: o.targetPersonality ?? null,
      })),
    );
  }

  return NextResponse.json({ question: { id: question.id } }, { status: 201 });
}
