import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

type ResultRow = {
  personality_slug: string;
  shared: boolean;
  created_at: string;
  referrer: string | null;
  session_id: string | null;
};

function normalizeReferrerLabel(referrer: string | null): string {
  const ref = referrer ?? '直接访问';
  try {
    if (ref.startsWith('http')) {
      return new URL(ref).hostname;
    }
  } catch {
    return ref;
  }

  return ref;
}

/** GET /api/creator/universes/[id]/stats — analytics data */
export async function GET(_request: Request, { params }: Params) {
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

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const last7Boundary = new Date();
  last7Boundary.setDate(last7Boundary.getDate() - 7);

  const previous7Boundary = new Date();
  previous7Boundary.setDate(previous7Boundary.getDate() - 14);

  const { data: results } = await supabase
    .from('creator_test_results')
    .select('personality_slug, shared, created_at, referrer, session_id')
    .eq('universe_id', id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  const rows = (results ?? []) as ResultRow[];
  const totalTests = rows.length;
  const totalShares = rows.filter((r) => r.shared).length;
  const uniqueSessionIds = new Set(rows.map((row) => row.session_id).filter((value): value is string => Boolean(value)));
  const uniqueSessions = uniqueSessionIds.size > 0 ? uniqueSessionIds.size : totalTests;

  // Top personalities
  const slugCounts = new Map<string, number>();
  for (const r of rows) {
    const slug = r.personality_slug;
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }
  const topPersonalities = [...slugCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, count]) => ({ slug, count }));

  // Daily breakdown
  const dailyMap = new Map<string, number>();
  for (const r of rows) {
    const date = r.created_at.slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }
  const dailyTests = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  const bestDay = dailyTests.reduce<{ date: string; count: number } | null>((best, current) => {
    if (!best || current.count > best.count) return current;
    return best;
  }, null);

  const activeDays = dailyTests.length;
  const avgTestsPerActiveDay = activeDays > 0 ? Number((totalTests / activeDays).toFixed(1)) : 0;

  // Referrer breakdown
  const referrerMap = new Map<string, number>();
  for (const r of rows) {
    const label = normalizeReferrerLabel(r.referrer);
    referrerMap.set(label, (referrerMap.get(label) ?? 0) + 1);
  }
  const topReferrers = [...referrerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }));

  const testsLast7Days = rows.filter((row) => new Date(row.created_at) >= last7Boundary).length;
  const testsPrevious7Days = rows.filter((row) => {
    const createdAt = new Date(row.created_at);
    return createdAt >= previous7Boundary && createdAt < last7Boundary;
  }).length;

  const topPersonalityShare = topPersonalities[0] && totalTests > 0
    ? Number(((topPersonalities[0].count / totalTests) * 100).toFixed(1))
    : 0;

  const recentResults = rows
    .slice(-8)
    .reverse()
    .map((row) => ({
      createdAt: row.created_at,
      personalitySlug: row.personality_slug,
      source: normalizeReferrerLabel(row.referrer),
      shared: row.shared,
    }));

  return NextResponse.json({
    totalTests,
    totalShares,
    uniqueSessions,
    activeDays,
    avgTestsPerActiveDay,
    testsLast7Days,
    testsPrevious7Days,
    topPersonalityShare,
    bestDay,
    uniqueSources: referrerMap.size,
    topPersonalities,
    dailyTests,
    topReferrers,
    recentResults,
  });
}
