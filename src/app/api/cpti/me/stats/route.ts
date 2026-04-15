import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';

interface AtlasStatsRow {
  user_id: string;
  total_collectible_unlocks: number;
  shared_universe_count: number;
  independent_module_count: number;
  relationship_type_count: number;
  temporal_unlock_count: number;
  achievement_count: number;
  soul_count: number;
  rare_relationship_count: number;
  last_relationship_at: string | null;
  last_unlock_at: string | null;
  updated_at: string;
}

const ZERO_STATS = {
  totalCollectibleUnlocks: 0,
  sharedUniverseCount: 0,
  independentModuleCount: 0,
  relationshipTypeCount: 0,
  temporalUnlockCount: 0,
  achievementCount: 0,
  soulCount: 0,
  rareRelationshipCount: 0,
  lastRelationshipAt: null,
  lastUnlockAt: null,
};

function mapStats(row: AtlasStatsRow | null) {
  if (!row) return ZERO_STATS;
  return {
    totalCollectibleUnlocks: row.total_collectible_unlocks,
    sharedUniverseCount: row.shared_universe_count,
    independentModuleCount: row.independent_module_count,
    relationshipTypeCount: row.relationship_type_count,
    temporalUnlockCount: row.temporal_unlock_count,
    achievementCount: row.achievement_count,
    soulCount: row.soul_count,
    rareRelationshipCount: row.rare_relationship_count,
    lastRelationshipAt: row.last_relationship_at,
    lastUnlockAt: row.last_unlock_at,
  };
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const adminClient = createAdminSupabaseClient();

    const { data, error } = await adminClient
      .from('user_atlas_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine — return zeros
      console.error('[cpti/me/stats GET] Failed to fetch stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stats: mapStats((data as AtlasStatsRow | null) ?? null),
    });
  } catch (error) {
    console.error('[cpti/me/stats GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
