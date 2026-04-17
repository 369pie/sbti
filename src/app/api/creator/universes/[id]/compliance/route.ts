import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateUniverse, type ValidatorPersonalityInput } from '@/lib/ugc/feminist-validator';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/creator/universes/[id]/compliance
 *
 * Runs the feminist-copy validator against the universe's current draft content
 * and returns a structured report. The Studio UI calls this whenever an editor
 * panel saves — acts as an always-on review mirror for clauses 1-10 of the
 * feminist copy checklist.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: universe } = await supabase
    .from('creator_universes')
    .select('id, name, description, creators!inner(user_id)')
    .eq('id', id)
    .single();

  if (!universe) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const creatorRow = universe.creators as unknown as { user_id: string };
  if (creatorRow.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: personalities } = await supabase
    .from('creator_personalities')
    .select('slug, name, tagline, quote, copy_hit, copy_os, copy_closer, copy_symptoms')
    .eq('universe_id', id);

  const report = validateUniverse({
    id: universe.id as string,
    name: universe.name as string | null,
    description: universe.description as string | null,
    personalities: ((personalities ?? []) as unknown as Array<Record<string, unknown>>).map(p => ({
      slug: String(p.slug ?? ''),
      name: (p.name as string | null) ?? null,
      tagline: (p.tagline as string | null) ?? null,
      quote: (p.quote as string | null) ?? null,
      hit: (p.copy_hit as string | null) ?? null,
      os: (p.copy_os as string | null) ?? null,
      closer: (p.copy_closer as string | null) ?? null,
      symptoms: (p.copy_symptoms as string[] | null) ?? null,
    } satisfies ValidatorPersonalityInput)),
  });

  return NextResponse.json(report);
}
