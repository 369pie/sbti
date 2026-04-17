import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string; personalityId: string }> };

/** PATCH /api/creator/universes/[id]/personalities/[personalityId] */
export async function PATCH(request: Request, { params }: Params) {
  const { id, personalityId } = await params;
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

  const body = await request.json();
  const allowedFields: Record<string, string> = {
    name: 'name',
    number: 'number',
    code: 'code',
    emoji: 'emoji',
    tagline: 'tagline',
    color: 'color',
    quote: 'quote',
    imageUrl: 'image_url',
    thumbnailUrl: 'thumbnail_url',
    copyHit: 'copy_hit',
    copyOs: 'copy_os',
    copySymptoms: 'copy_symptoms',
    copyCloser: 'copy_closer',
    profile: 'profile',
    sortOrder: 'sort_order',
  };

  const updates: Record<string, unknown> = {};
  for (const [jsKey, dbKey] of Object.entries(allowedFields)) {
    if (jsKey in body) updates[dbKey] = body[jsKey];
  }

  const { data, error } = await supabase
    .from('creator_personalities')
    .update(updates)
    .eq('id', personalityId)
    .eq('universe_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ personality: data });
}

/** DELETE /api/creator/universes/[id]/personalities/[personalityId] */
export async function DELETE(_request: Request, { params }: Params) {
  const { id, personalityId } = await params;
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

  const { error } = await supabase
    .from('creator_personalities')
    .delete()
    .eq('id', personalityId)
    .eq('universe_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
