import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/middleware';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

const VALID_TYPES = ['soul_count', 'rare_count', 'collection_progress'] as const;
type LeaderboardType = (typeof VALID_TYPES)[number];

const COLUMN_MAP: Record<LeaderboardType, string> = {
  soul_count: 'soul_count',
  rare_count: 'rare_relationship_count',
  collection_progress: 'relationship_type_count',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') ?? 'soul_count') as LeaderboardType;
    const limitParam = parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 200);

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Optional auth — don't require it
    let userId: string | null = null;
    try {
      const { user } = await getAuthUser();
      userId = user?.id ?? null;
    } catch {
      // Unauthenticated is fine for viewing leaderboards
      userId = null;
    }

    const adminClient = createAdminSupabaseClient();
    const column = COLUMN_MAP[type];

    // Fetch leaderboard entries
    const { data, error } = await adminClient
      .from('user_atlas_stats')
      .select(`user_id, ${column}, user_profiles(nickname)`)
      .gt(column, 0)
      .order(column, { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[cpti/leaderboards GET] Failed to fetch leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as unknown as Array<{
      user_id: string;
      [key: string]: unknown;
      user_profiles: { nickname: string | null } | null;
    }>;

    const entries = rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      nickname: row.user_profiles?.nickname ?? '',
      score: (row[column] as number) ?? 0,
    }));

    // Calculate myRank if user is authenticated
    let myRank: number | null = null;
    if (userId) {
      const found = entries.find((e) => e.userId === userId);
      myRank = found?.rank ?? null;
    }

    // Fetch total participants count
    const { count, error: countError } = await adminClient
      .from('user_atlas_stats')
      .select('*', { count: 'exact', head: true })
      .gt(column, 0);

    if (countError) {
      console.error('[cpti/leaderboards GET] Failed to count participants:', countError);
      // Non-fatal — continue with entries
    }

    return NextResponse.json({
      type,
      entries,
      myRank,
      total: count ?? entries.length,
    });
  } catch (error) {
    console.error('[cpti/leaderboards GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
