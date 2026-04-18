import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { getAssetStateRowId, loadAssetStateMap } from '@/lib/assets/asset-server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/supabase/with-auth';
import {
  ASSET_KEYS,
  ASSET_MODULE_IDS,
  ASSET_MODULE_KINDS,
  buildAssetSummary,
  mergeAssetPayload,
  type SyncedAssetKey,
} from '@/lib/assets/asset-contract';

interface AssetsRouteBody {
  assets?: Array<{
    assetKey?: string;
    payload?: unknown;
  }>;
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

async function upsertAssetState(user: User, assetKey: SyncedAssetKey, payload: unknown) {
  const adminClient = createAdminSupabaseClient();
  const moduleId = ASSET_MODULE_IDS[assetKey];
  const rowId = getAssetStateRowId(user.id, assetKey);
  const nowIso = new Date().toISOString();

  const nextPayload = {
    assetKey,
    schemaVersion: 1,
    state: payload,
  };

  const updatePayload = {
    module_kind: ASSET_MODULE_KINDS[assetKey],
    result_slug: 'asset_state_v1',
    comparability_group: 'asset_sync',
    source_version: 'asset-sync-v1',
    source_payload: nextPayload,
    observed_at: nowIso,
    updated_at: nowIso,
    is_current: true,
    is_ephemeral: false,
    expires_at: null,
  };

  const updateExisting = async () => {
    const { data, error } = await adminClient
      .from('user_module_results')
      .update(updatePayload)
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .eq('is_current', true)
      .is('expires_at', null)
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return Array.isArray(data) && data.length > 0;
  };

  if (await updateExisting()) {
    return;
  }

  const { error } = await adminClient
    .from('user_module_results')
    .upsert(
      {
        id: rowId,
        user_id: user.id,
        module_kind: ASSET_MODULE_KINDS[assetKey],
        module_id: moduleId,
        result_slug: 'asset_state_v1',
        comparability_group: 'asset_sync',
        source_version: 'asset-sync-v1',
        source_payload: nextPayload,
        is_current: true,
        is_ephemeral: false,
        observed_at: nowIso,
        updated_at: nowIso,
        expires_at: null,
      },
      {
        onConflict: 'id',
        ignoreDuplicates: false,
      },
    );

  if (error?.code === '23505') {
    if (await updateExisting()) {
      return;
    }
  }

  if (error) {
    throw error;
  }
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    const { assets } = await loadAssetStateMap(user.id);
    return json({
      assets,
      summary: buildAssetSummary(assets),
    });
  } catch (error) {
    console.error('[assets/me GET] Failed to load assets:', error);
    return json({ error: 'Failed to load asset state' }, { status: 500 });
  }
});

export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    const body = (await req.json().catch(() => ({}))) as AssetsRouteBody;
    const { assets: existingAssets } = await loadAssetStateMap(user.id);

    const incomingAssets = Array.isArray(body.assets) ? body.assets : [];
    for (const item of incomingAssets) {
      if (!item?.assetKey || !ASSET_KEYS.includes(item.assetKey as SyncedAssetKey)) {
        continue;
      }

      const assetKey = item.assetKey as SyncedAssetKey;
      const merged = mergeAssetPayload(assetKey, existingAssets[assetKey], item.payload);
      if (!merged) continue;

      await upsertAssetState(user, assetKey, merged);
      existingAssets[assetKey] = merged;
    }

    const { assets } = await loadAssetStateMap(user.id);
    return json({
      assets,
      summary: buildAssetSummary(assets),
    });
  } catch (error) {
    console.error('[assets/me POST] Failed to sync assets:', error);
    return json({ error: 'Failed to sync asset state' }, { status: 500 });
  }
});