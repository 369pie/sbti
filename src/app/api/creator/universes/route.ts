import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getStarterTemplate, seedUniverseFromStarterTemplate } from '@/lib/ugc/starter-templates';

/** GET /api/creator/universes — list my universes */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  const { data: universes } = await supabase
    .from('creator_universes')
    .select('*')
    .eq('creator_id', creator.id)
    .order('updated_at', { ascending: false });

  return NextResponse.json({ universes: universes ?? [] });
}

/** POST /api/creator/universes — create a universe */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  const body = await request.json();
  const { slug, name, shortName, emoji, description, scoringMode, primaryColor, cardStyle, templateId } = body;
  const template = getStarterTemplate(typeof templateId === 'string' ? templateId : null);

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
  }

  if (templateId && !template) {
    return NextResponse.json({ error: 'invalid templateId' }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'slug must be lowercase alphanumeric with hyphens' }, { status: 400 });
  }

  const { data: universe, error } = await supabase
    .from('creator_universes')
    .insert({
      slug,
      creator_id: creator.id,
      name,
      short_name: shortName ?? null,
      emoji: emoji ?? template?.emoji ?? '🌟',
      description: description ?? template?.description ?? null,
      scoring_mode: scoringMode ?? template?.scoringMode ?? 'dimension',
      primary_color: primaryColor ?? template?.primaryColor ?? '#ff4d6d',
      card_style: cardStyle ?? 'default',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (template) {
    const seeded = await seedUniverseFromStarterTemplate(supabase, universe.id, template.id);

    if (!seeded) {
      await supabase.from('creator_universes').delete().eq('id', universe.id);
      return NextResponse.json({ error: 'starter template seed failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ universe, seededFromTemplate: template?.id ?? null }, { status: 201 });
}
