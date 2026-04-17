/**
 * UGC database helpers — query and mutate creator universe data in Supabase.
 *
 * All functions accept a Supabase client (browser or server) so they work
 * in both client components and API routes.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  FlexAxis,
  FlexQuestion,
  FlexOption,
  FlexPersonalityProfile,
  ScoringMode,
} from './flexible-scoring';

// ─── Row types (matching Supabase schema) ────────────────────────────────────

export interface CreatorRow {
  id: string;
  user_id: string | null;
  name: string;
  avatar_url: string | null;
  social_link: string | null;
  bio: string | null;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  invite_code: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UniverseRow {
  id: string;
  slug: string;
  creator_id: string;
  name: string;
  short_name: string | null;
  emoji: string;
  description: string | null;
  primary_color: string;
  card_style: 'default' | 'dark' | 'neon' | 'pastel';
  scoring_mode: ScoringMode;
  questions_per_test: number | null;
  hit_label: string;
  os_label: string;
  symptoms_label: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  is_paid: boolean;
  price_cents: number;
  total_tests: number;
  total_shares: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  submitted_at: string | null;
  review_note: string | null;
}

export interface AxisRow {
  id: string;
  universe_id: string;
  axis_key: string;
  name: string;
  low_label: string;
  high_label: string;
  sort_order: number;
}

export interface QuestionRow {
  id: string;
  universe_id: string;
  text: string;
  sort_order: number;
  pool_tag: string | null;
  created_at: string;
}

export interface OptionRow {
  id: string;
  question_id: string;
  text: string;
  image_url: string | null;
  sort_order: number;
  scores: Record<string, number>;
  target_personality: string | null;
}

export interface PersonalityRow {
  id: string;
  universe_id: string;
  slug: string;
  number: string | null;
  name: string;
  code: string | null;
  emoji: string;
  tagline: string | null;
  color: string;
  quote: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  copy_hit: string | null;
  copy_os: string | null;
  copy_symptoms: string[];
  copy_closer: string | null;
  profile: Record<string, 'H' | 'L'>;
  sort_order: number;
}

// ─── Full universe bundle (for test/result rendering) ────────────────────────

export interface UniverseBundle {
  universe: UniverseRow;
  creator: CreatorRow;
  axes: AxisRow[];
  questions: (QuestionRow & { options: OptionRow[] })[];
  personalities: PersonalityRow[];
}

// ─── Read queries ────────────────────────────────────────────────────────────

/** Fetch a published universe by slug, with all related data. */
export async function fetchPublishedUniverse(
  supabase: SupabaseClient,
  slug: string,
): Promise<UniverseBundle | null> {
  // 1. Universe
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!universe) return null;

  // 2. Creator
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', universe.creator_id)
    .single();

  if (!creator) return null;

  // 3. Axes, questions, options, personalities — parallel fetch
  const [axesRes, questionsRes, personalitiesRes] = await Promise.all([
    supabase
      .from('creator_axes')
      .select('*')
      .eq('universe_id', universe.id)
      .order('sort_order'),
    supabase
      .from('creator_questions')
      .select('*, creator_options(*)')
      .eq('universe_id', universe.id)
      .order('sort_order'),
    supabase
      .from('creator_personalities')
      .select('*')
      .eq('universe_id', universe.id)
      .order('sort_order'),
  ]);

  const questions = (questionsRes.data ?? []).map((q: QuestionRow & { creator_options: OptionRow[] }) => ({
    ...q,
    options: (q.creator_options ?? []).sort((a: OptionRow, b: OptionRow) => a.sort_order - b.sort_order),
  }));

  return {
    universe: universe as UniverseRow,
    creator: creator as CreatorRow,
    axes: (axesRes.data ?? []) as AxisRow[],
    questions,
    personalities: (personalitiesRes.data ?? []) as PersonalityRow[],
  };
}

/** Fetch all universes owned by the current authenticated creator. */
export async function fetchMyUniverses(
  supabase: SupabaseClient,
): Promise<{ creator: CreatorRow; universes: UniverseRow[] } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!creator) return null;

  const { data: universes } = await supabase
    .from('creator_universes')
    .select('*')
    .eq('creator_id', creator.id)
    .order('updated_at', { ascending: false });

  return {
    creator: creator as CreatorRow,
    universes: (universes ?? []) as UniverseRow[],
  };
}

/** Fetch full editable universe data (for Creator Studio). */
export async function fetchEditableUniverse(
  supabase: SupabaseClient,
  universeId: string,
): Promise<UniverseBundle | null> {
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('*')
    .eq('id', universeId)
    .single();

  if (!universe) return null;

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', universe.creator_id)
    .single();

  if (!creator) return null;

  const [axesRes, questionsRes, personalitiesRes] = await Promise.all([
    supabase
      .from('creator_axes')
      .select('*')
      .eq('universe_id', universeId)
      .order('sort_order'),
    supabase
      .from('creator_questions')
      .select('*, creator_options(*)')
      .eq('universe_id', universeId)
      .order('sort_order'),
    supabase
      .from('creator_personalities')
      .select('*')
      .eq('universe_id', universeId)
      .order('sort_order'),
  ]);

  const questions = (questionsRes.data ?? []).map((q: QuestionRow & { creator_options: OptionRow[] }) => ({
    ...q,
    options: (q.creator_options ?? []).sort((a: OptionRow, b: OptionRow) => a.sort_order - b.sort_order),
  }));

  return {
    universe: universe as UniverseRow,
    creator: creator as CreatorRow,
    axes: (axesRes.data ?? []) as AxisRow[],
    questions,
    personalities: (personalitiesRes.data ?? []) as PersonalityRow[],
  };
}

// ─── Conversion helpers (DB rows → scoring engine types) ─────────────────────

export function toFlexAxes(rows: AxisRow[]): FlexAxis[] {
  return rows.map(r => ({
    key: r.axis_key,
    name: r.name,
    lowLabel: r.low_label,
    highLabel: r.high_label,
  }));
}

export function toFlexQuestions(
  questions: (QuestionRow & { options: OptionRow[] })[],
): FlexQuestion[] {
  return questions.map(q => ({
    id: q.id,
    text: q.text,
    poolTag: q.pool_tag ?? undefined,
    options: q.options.map((o: OptionRow): FlexOption => ({
      id: o.id,
      text: o.text,
      imageUrl: o.image_url ?? undefined,
      scores: o.scores,
      targetPersonality: o.target_personality ?? undefined,
    })),
  }));
}

export function toFlexPersonalities(rows: PersonalityRow[]): FlexPersonalityProfile[] {
  return rows.map(r => ({
    slug: r.slug,
    profile: r.profile,
  }));
}

// ─── Write helpers ───────────────────────────────────────────────────────────

/** Create a new universe (draft). Returns the new universe row. */
export async function createUniverse(
  supabase: SupabaseClient,
  creatorId: string,
  data: {
    slug: string;
    name: string;
    shortName?: string;
    emoji?: string;
    description?: string;
    scoringMode?: ScoringMode;
    primaryColor?: string;
    cardStyle?: 'default' | 'dark' | 'neon' | 'pastel';
  },
): Promise<UniverseRow | null> {
  const { data: row, error } = await supabase
    .from('creator_universes')
    .insert({
      slug: data.slug,
      creator_id: creatorId,
      name: data.name,
      short_name: data.shortName ?? null,
      emoji: data.emoji ?? '🌟',
      description: data.description ?? null,
      scoring_mode: data.scoringMode ?? 'dimension',
      primary_color: data.primaryColor ?? '#ff4d6d',
      card_style: data.cardStyle ?? 'default',
    })
    .select()
    .single();

  if (error) {
    console.error('createUniverse error:', error);
    return null;
  }
  return row as UniverseRow;
}

/** Upsert axes for a universe (replaces all). */
export async function upsertAxes(
  supabase: SupabaseClient,
  universeId: string,
  axes: { axisKey: string; name: string; lowLabel: string; highLabel: string }[],
): Promise<boolean> {
  // Delete existing
  await supabase.from('creator_axes').delete().eq('universe_id', universeId);
  if (axes.length === 0) return true;

  const { error } = await supabase.from('creator_axes').insert(
    axes.map((a, i) => ({
      universe_id: universeId,
      axis_key: a.axisKey,
      name: a.name,
      low_label: a.lowLabel,
      high_label: a.highLabel,
      sort_order: i,
    })),
  );
  return !error;
}

/** Add a question with options. */
export async function addQuestion(
  supabase: SupabaseClient,
  universeId: string,
  data: {
    text: string;
    sortOrder: number;
    poolTag?: string;
    options: {
      text: string;
      imageUrl?: string;
      scores?: Record<string, number>;
      targetPersonality?: string;
    }[];
  },
): Promise<string | null> {
  const { data: q, error } = await supabase
    .from('creator_questions')
    .insert({
      universe_id: universeId,
      text: data.text,
      sort_order: data.sortOrder,
      pool_tag: data.poolTag ?? null,
    })
    .select('id')
    .single();

  if (error || !q) return null;

  if (data.options.length > 0) {
    await supabase.from('creator_options').insert(
      data.options.map((o, i) => ({
        question_id: q.id,
        text: o.text,
        image_url: o.imageUrl ?? null,
        sort_order: i,
        scores: o.scores ?? {},
        target_personality: o.targetPersonality ?? null,
      })),
    );
  }

  return q.id;
}

/** Add a personality type. */
export async function addPersonality(
  supabase: SupabaseClient,
  universeId: string,
  data: {
    slug: string;
    number?: string;
    name: string;
    code?: string;
    emoji?: string;
    tagline?: string;
    color?: string;
    quote?: string;
    imageUrl?: string;
    copyHit?: string;
    copyOs?: string;
    copySymptoms?: string[];
    copyCloser?: string;
    profile?: Record<string, 'H' | 'L'>;
    sortOrder?: number;
  },
): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('creator_personalities')
    .insert({
      universe_id: universeId,
      slug: data.slug,
      number: data.number ?? null,
      name: data.name,
      code: data.code ?? null,
      emoji: data.emoji ?? '✨',
      tagline: data.tagline ?? null,
      color: data.color ?? '#ff4d6d',
      quote: data.quote ?? null,
      image_url: data.imageUrl ?? null,
      copy_hit: data.copyHit ?? null,
      copy_os: data.copyOs ?? null,
      copy_symptoms: data.copySymptoms ?? [],
      copy_closer: data.copyCloser ?? null,
      profile: data.profile ?? {},
      sort_order: data.sortOrder ?? 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('addPersonality error:', error);
    return null;
  }
  return row.id;
}

/** Record a test result for analytics. */
export async function recordTestResult(
  supabase: SupabaseClient,
  data: {
    universeId: string;
    personalitySlug: string;
    sessionId?: string;
    scores?: Record<string, number>;
    referrer?: string;
  },
): Promise<void> {
  await supabase.from('creator_test_results').insert({
    universe_id: data.universeId,
    personality_slug: data.personalitySlug,
    session_id: data.sessionId ?? null,
    scores: data.scores ?? null,
    referrer: data.referrer ?? null,
  });
}

/** Submit universe for review. */
export async function submitForReview(
  supabase: SupabaseClient,
  universeId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('creator_universes')
    .update({ status: 'review' })
    .eq('id', universeId);
  return !error;
}

/** Publish a universe (admin action). */
export async function publishUniverse(
  supabase: SupabaseClient,
  universeId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('creator_universes')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', universeId);
  return !error;
}

// ─── Analytics queries ───────────────────────────────────────────────────────

export interface UniverseStats {
  totalTests: number;
  totalShares: number;
  completionRate: number;
  topPersonalities: { slug: string; count: number }[];
  dailyTests: { date: string; count: number }[];
}

/** Fetch analytics for a universe. */
export async function fetchUniverseStats(
  supabase: SupabaseClient,
  universeId: string,
  days: number = 30,
): Promise<UniverseStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: results } = await supabase
    .from('creator_test_results')
    .select('personality_slug, shared, created_at')
    .eq('universe_id', universeId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  const rows = results ?? [];
  const totalTests = rows.length;
  const totalShares = rows.filter((r: { shared: boolean }) => r.shared).length;

  // Top personalities
  const slugCounts = new Map<string, number>();
  for (const r of rows) {
    const slug = (r as { personality_slug: string }).personality_slug;
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }
  const topPersonalities = [...slugCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, count]) => ({ slug, count }));

  // Daily breakdown
  const dailyMap = new Map<string, number>();
  for (const r of rows) {
    const date = (r as { created_at: string }).created_at.slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }
  const dailyTests = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  return {
    totalTests,
    totalShares,
    completionRate: 0, // TODO: needs separate session tracking
    topPersonalities,
    dailyTests,
  };
}
