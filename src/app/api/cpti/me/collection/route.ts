import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { CPTI_RELATIONSHIP_TYPES } from '@/lib/cpti/relationships';
import type { User } from '@supabase/supabase-js';

const TOTAL_RELATIONSHIP_TYPES = CPTI_RELATIONSHIP_TYPES.length;

interface AtlasUnlockRow {
  item_key: string;
  unlocked_at: string;
  source_kind: string;
  wtf_atlas_items: {
    item_key: string;
    rarity: string | null;
    metadata_json: Record<string, unknown>;
  } | null;
}

interface RelationshipRow {
  id: string;
  relationship_slug: string;
  relationship_tier: string;
  compatibility: number;
  initiator_user_id: string;
  participant_user_id: string;
  initiator_snapshot_id: string | null;
  participant_snapshot_id: string | null;
  created_at: string;
}

interface ProfileSnapshotRow {
  id: string;
  personality_slug: string;
}

interface UserAtlasStatsRow {
  total_collectible_unlocks: number | null;
  relationship_type_count: number | null;
  soul_count: number | null;
  rare_relationship_count: number | null;
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const adminClient = createAdminSupabaseClient();
    const userId = user.id;

    // Fetch atlas unlocks joined with atlas items
    const { data: unlocksData, error: unlocksError } = await adminClient
      .from('user_atlas_unlocks')
      .select(`
        item_key,
        unlocked_at,
        source_kind,
        wtf_atlas_items (
          item_key,
          rarity,
          metadata_json
        )
      `)
      .eq('user_id', userId)
      .eq('series_id', 'cpti_relationships')
      .eq('status', 'unlocked')
      .order('unlocked_at', { ascending: false });

    if (unlocksError) {
      console.error('[cpti/me/collection GET] Failed to fetch unlocks:', unlocksError);
      return NextResponse.json(
        { error: 'Failed to fetch collection unlocks' },
        { status: 500 }
      );
    }

    const atlasUnlocks = (unlocksData ?? []) as unknown as AtlasUnlockRow[];

    // Fetch user atlas stats
    const { data: statsData, error: statsError } = await adminClient
      .from('user_atlas_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      console.error('[cpti/me/collection GET] Failed to fetch stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch collection stats' },
        { status: 500 }
      );
    }

    const typedStats = (statsData ?? null) as UserAtlasStatsRow | null;

    // Fetch recent valid relationships
    const { data: relationshipsData, error: relationshipsError } = await adminClient
      .from('cpti_relationships')
      .select(`
        id,
        relationship_slug,
        relationship_tier,
        compatibility,
        initiator_user_id,
        participant_user_id,
        initiator_snapshot_id,
        participant_snapshot_id,
        created_at
      `)
      .or(`initiator_user_id.eq.${userId},participant_user_id.eq.${userId}`)
      .eq('is_valid', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (relationshipsError) {
      console.error('[cpti/me/collection GET] Failed to fetch relationships:', relationshipsError);
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      );
    }

    // For each relationship, fetch the "other person" snapshot to get their personality type
    const recentRelationships = await Promise.all(
      ((relationshipsData ?? []) as RelationshipRow[]).map(async (rel) => {
        const isInitiator = rel.initiator_user_id === userId;
        const otherSnapshotId = isInitiator
          ? rel.participant_snapshot_id
          : rel.initiator_snapshot_id;

        let otherPersonality = 'UNKNOWN';
        if (otherSnapshotId) {
          const { data: snapshot } = await adminClient
            .from('cpti_profile_snapshots')
            .select('personality_slug')
            .eq('id', otherSnapshotId)
            .single();

          if (snapshot) {
            otherPersonality = (snapshot as ProfileSnapshotRow).personality_slug.toUpperCase();
          }
        }

        return {
          id: rel.id,
          slug: rel.relationship_slug,
          tier: rel.relationship_tier,
          compatibility: rel.compatibility,
          otherPersonality,
          createdAt: rel.created_at,
        };
      })
    );

    // Build unlocks list
    const unlocks = atlasUnlocks.map((unlock) => ({
      itemKey: unlock.item_key,
      unlockedAt: unlock.unlocked_at,
      sourceKind: unlock.source_kind,
    }));

    // Compute stats
    const totalCollectibleUnlocks = typedStats?.total_collectible_unlocks ?? 0;
    const relationshipTypeCount = typedStats?.relationship_type_count ?? 0;
    const soulCount = typedStats?.soul_count ?? 0;
    const rareRelationshipCount = typedStats?.rare_relationship_count ?? 0;

    // Collection progress: unique item keys unlocked vs total types
    const uniqueUnlockedKeys = new Set(unlocks.map((u) => u.itemKey));
    const collected = uniqueUnlockedKeys.size;

    return NextResponse.json({
      stats: {
        totalCollectibleUnlocks,
        relationshipTypeCount,
        soulCount,
        rareRelationshipCount,
      },
      unlocks,
      recentRelationships,
      collectionProgress: {
        collected,
        total: TOTAL_RELATIONSHIP_TYPES,
        percentage: TOTAL_RELATIONSHIP_TYPES > 0
          ? Math.round((collected / TOTAL_RELATIONSHIP_TYPES) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('[cpti/me/collection GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
