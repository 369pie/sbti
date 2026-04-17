import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { buildAssetSummary } from '@/lib/assets/asset-contract';
import { loadAssetStateMap } from '@/lib/assets/asset-server';
import { CPTI_RELATIONSHIP_TYPES } from '@/lib/cpti/relationships';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/supabase/with-auth';

interface UserProfileRow {
  nickname: string | null;
  avatar_url: string | null;
  headline: string | null;
  identity_stage: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserAtlasStatsRow {
  total_collectible_unlocks: number | null;
  relationship_type_count: number | null;
  soul_count: number | null;
  rare_relationship_count: number | null;
}

interface UserAtlasUnlockRow {
  item_key: string;
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    const adminClient = createAdminSupabaseClient();

    const [profileResult, atlasStatsResult, unlocksResult, assetState] = await Promise.all([
      adminClient
        .from('user_profiles')
        .select('nickname, avatar_url, headline, identity_stage, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      adminClient
        .from('user_atlas_stats')
        .select('total_collectible_unlocks, relationship_type_count, soul_count, rare_relationship_count')
        .eq('user_id', user.id)
        .maybeSingle(),
      adminClient
        .from('user_atlas_unlocks')
        .select('item_key')
        .eq('user_id', user.id)
        .eq('series_id', 'cpti_relationships')
        .eq('status', 'unlocked'),
      loadAssetStateMap(user.id),
    ]);

    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      console.error('[me/summary GET] Failed to fetch profile:', profileResult.error);
      return json({ error: 'Failed to fetch profile summary' }, { status: 500 });
    }

    if (atlasStatsResult.error && atlasStatsResult.error.code !== 'PGRST116') {
      console.error('[me/summary GET] Failed to fetch atlas stats:', atlasStatsResult.error);
      return json({ error: 'Failed to fetch CPTI summary' }, { status: 500 });
    }

    if (unlocksResult.error) {
      console.error('[me/summary GET] Failed to fetch unlocks:', unlocksResult.error);
      return json({ error: 'Failed to fetch CPTI collection summary' }, { status: 500 });
    }

    const profile = (profileResult.data ?? null) as UserProfileRow | null;
    const atlasStats = (atlasStatsResult.data ?? null) as UserAtlasStatsRow | null;
    const unlocks = (unlocksResult.data ?? []) as UserAtlasUnlockRow[];
    const assetSummary = buildAssetSummary(assetState.assets);
    const uniqueUnlockedKeys = new Set(unlocks.map((unlock) => unlock.item_key));
    const meta = user.user_metadata ?? {};

    return json({
      profile: {
        userId: user.id,
        username: (meta.username as string) || '',
        nickname: profile?.nickname ?? (meta.nickname as string) ?? '',
        displayName:
          (meta.nickname as string) ||
          (meta.display_name as string) ||
          (meta.username as string) ||
          '旅行者',
        avatarUrl: profile?.avatar_url ?? (meta.avatar_url as string) ?? null,
        headline: profile?.headline ?? (meta.headline as string) ?? '',
        identityStage: profile?.identity_stage ?? 'anonymous',
        createdAt: profile?.created_at ?? user.created_at,
        updatedAt: profile?.updated_at ?? null,
      },
      assets: assetState.assets,
      assetSummary,
      stats: {
        wtfCard: assetSummary.wtfCard,
        cpti: {
          relationshipTypeCount: atlasStats?.relationship_type_count ?? 0,
          collected: uniqueUnlockedKeys.size,
          total: CPTI_RELATIONSHIP_TYPES.length,
          totalCollectibleUnlocks: atlasStats?.total_collectible_unlocks ?? 0,
          soulCount: atlasStats?.soul_count ?? 0,
          rareRelationshipCount: atlasStats?.rare_relationship_count ?? 0,
        },
      },
    });
  } catch (error) {
    console.error('[me/summary GET] Unexpected error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
});