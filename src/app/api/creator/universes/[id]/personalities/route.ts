import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

/** GET /api/creator/universes/[id]/personalities — list all personalities */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('creator_personalities')
    .select('*')
    .eq('universe_id', id)
    .order('sort_order');

  return NextResponse.json(
    { personalities: data ?? [] },
    {
      headers: {
        // Public-shape data; safe to share at the edge across users.
        'Cache-Control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=600',
      },
    },
  );
}

/** POST /api/creator/universes/[id]/personalities — add a personality */
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
  const { slug, name } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
  }

  const { data: personality, error } = await supabase
    .from('creator_personalities')
    .insert({
      universe_id: id,
      slug,
      number: body.number ?? null,
      name,
      code: body.code ?? null,
      emoji: body.emoji ?? '✨',
      tagline: body.tagline ?? null,
      color: body.color ?? '#ff4d6d',
      quote: body.quote ?? null,
      image_url: body.imageUrl ?? null,
      copy_hit: body.copyHit ?? null,
      copy_os: body.copyOs ?? null,
      copy_symptoms: body.copySymptoms ?? [],
      copy_closer: body.copyCloser ?? null,
      profile: body.profile ?? {},
      sort_order: body.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'personality slug already exists in this universe' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ personality }, { status: 201 });
}
