import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateUniverse, type ValidatorPersonalityInput } from '@/lib/ugc/feminist-validator';

type Params = { params: Promise<{ id: string }> };

/** POST /api/creator/universes/[id]/submit — submit for review */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: universe } = await supabase
    .from('creator_universes')
    .select('status, name, description, creators!inner(user_id)')
    .eq('id', id)
    .single();

  if (!universe) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const creatorRow = universe.creators as unknown as { user_id: string };
  if (creatorRow.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (universe.status !== 'draft') {
    return NextResponse.json({ error: 'Only draft universes can be submitted' }, { status: 400 });
  }

  // Validate: must have at least 5 questions and 2 personalities
  const [questionsRes, personalitiesRes] = await Promise.all([
    supabase.from('creator_questions').select('id', { count: 'exact', head: true }).eq('universe_id', id),
    supabase.from('creator_personalities').select('id', { count: 'exact', head: true }).eq('universe_id', id),
  ]);

  const qCount = questionsRes.count ?? 0;
  const pCount = personalitiesRes.count ?? 0;

  if (qCount < 5) {
    return NextResponse.json({ error: `Need at least 5 questions (have ${qCount})` }, { status: 400 });
  }
  if (pCount < 2) {
    return NextResponse.json({ error: `Need at least 2 personalities (have ${pCount})` }, { status: 400 });
  }

  // ─── Feminist copy checklist gate (铁律 1 & 7) ────────────────────────────
  const { data: personalitiesData } = await supabase
    .from('creator_personalities')
    .select('slug, name, tagline, quote, copy_hit, copy_os, copy_closer, copy_symptoms')
    .eq('universe_id', id);

  const report = validateUniverse({
    id,
    name: universe.name as string | null,
    description: universe.description as string | null,
    personalities: ((personalitiesData ?? []) as unknown as Array<Record<string, unknown>>).map(p => ({
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

  if (!report.ok) {
    return NextResponse.json(
      { error: report.summary, compliance: report },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('creator_universes')
    .update({
      status: 'review',
      submitted_at: new Date().toISOString(),
      review_note: null,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: 'review' });
}
