import { createHash } from 'node:crypto';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

import {
  ASSET_MODULE_IDS,
  ASSET_MODULE_IDS_LIST,
  getAssetKeyFromModuleId,
  type SyncedAssetKey,
} from './asset-contract';

const ASSET_STATE_ROW_ID_NAMESPACE = 'wtfti:asset-state-row:v1';

function hexToUuidV5(hex: string): string {
  const normalized = hex.slice(0, 32).padEnd(32, '0');
  const variant = ((Number.parseInt(normalized[16] ?? '0', 16) & 0x3) | 0x8).toString(16);

  return [
    normalized.slice(0, 8),
    normalized.slice(8, 12),
    `5${normalized.slice(13, 16)}`,
    `${variant}${normalized.slice(17, 20)}`,
    normalized.slice(20, 32),
  ].join('-');
}

export function getAssetStateRowId(userId: string, assetKey: SyncedAssetKey): string {
  const moduleId = ASSET_MODULE_IDS[assetKey];
  const hash = createHash('sha1')
    .update(`${ASSET_STATE_ROW_ID_NAMESPACE}:${userId}:${moduleId}`, 'utf8')
    .digest('hex');

  return hexToUuidV5(hash);
}

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
    .is('expires_at', null)
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