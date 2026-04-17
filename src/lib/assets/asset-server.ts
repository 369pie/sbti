import { createAdminSupabaseClient } from '@/lib/supabase/admin';

import {
  ASSET_MODULE_IDS_LIST,
  getAssetKeyFromModuleId,
  type SyncedAssetKey,
} from './asset-contract';

export interface AssetStateRow {
  id: string;
  module_id: string;
  source_payload: Record<string, unknown> | null;
}

export function extractStatePayload(row: AssetStateRow | null | undefined): unknown {
  if (!row?.source_payload) return null;
  return 'state' in row.source_payload ? row.source_payload.state : row.source_payload;
}

export async function loadAssetStateMap(userId: string) {
  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from('user_module_results')
    .select('id, module_id, source_payload')
    .eq('user_id', userId)
    .eq('is_current', true)
    .in('module_id', ASSET_MODULE_IDS_LIST);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as AssetStateRow[];
  const assets: Partial<Record<SyncedAssetKey, unknown>> = {};
  for (const row of rows) {
    const assetKey = getAssetKeyFromModuleId(row.module_id);
    if (!assetKey) continue;
    assets[assetKey] = extractStatePayload(row);
  }

  return { rows, assets };
}