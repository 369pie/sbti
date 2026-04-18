import { hasBrowserSupabaseSession, tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';
import { getOrCreateAnonymousSession } from '@/lib/supabase/auth';
import { getApiPath, readApiJson } from '@/lib/api';
import {
  ASSET_KEYS,
  ASSET_SYNC_EVENT,
  type AssetSummary,
  type AssetSyncEventDetail,
  type SyncedAssetKey,
} from './asset-contract';

const WTF_CARD_STORAGE_KEY = 'wtf-card';
const DAILY_GACHA_STORAGE_KEY = 'daily-gacha-v1';
const DAILY_STREAK_STORAGE_KEY = 'daily-streak-v1';
const MYSTI_SEED_STORAGE_KEY = 'gacha-seed';
const MYSTI_COLLECTION_STORAGE_KEY = 'gacha-collection';
const MYSTI_DRAW_DATE_STORAGE_KEY = 'gacha-daily-draw';
const MYSTI_LAST_RESULT_STORAGE_KEY = 'gacha-last-result';

interface AssetsRouteResponse {
  assets: Partial<Record<SyncedAssetKey, unknown>>;
  summary?: AssetSummary;
}

let sessionPromise: Promise<boolean> | null = null;
let bootstrapPromise: Promise<void> | null = null;
const syncTimers = new Map<SyncedAssetKey, number>();

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLocalAssetState(assetKey: SyncedAssetKey): unknown | null {
  if (typeof window === 'undefined') return null;

  switch (assetKey) {
    case 'wtf-card':
      return parseJson(localStorage.getItem(WTF_CARD_STORAGE_KEY));
    case 'daily-gacha':
      return parseJson(localStorage.getItem(DAILY_GACHA_STORAGE_KEY));
    case 'daily-streak':
      return parseJson(localStorage.getItem(DAILY_STREAK_STORAGE_KEY));
    case 'mysti-gacha': {
      const seed = localStorage.getItem(MYSTI_SEED_STORAGE_KEY) ?? '';
      const collection = parseJson<{ collected?: string[] }>(localStorage.getItem(MYSTI_COLLECTION_STORAGE_KEY));
      const lastDrawDate = localStorage.getItem(MYSTI_DRAW_DATE_STORAGE_KEY) ?? '';
      const lastResult = parseJson(localStorage.getItem(MYSTI_LAST_RESULT_STORAGE_KEY));

      if (!seed && !(collection?.collected?.length) && !lastDrawDate && !lastResult) {
        return null;
      }

      return {
        seed,
        collection: collection?.collected ?? [],
        lastDrawDate,
        lastResult,
      };
    }
  }
}

function writeLocalAssetState(assetKey: SyncedAssetKey, payload: unknown): void {
  if (typeof window === 'undefined') return;

  switch (assetKey) {
    case 'wtf-card':
      localStorage.setItem(WTF_CARD_STORAGE_KEY, JSON.stringify(payload));
      break;
    case 'daily-gacha':
      localStorage.setItem(DAILY_GACHA_STORAGE_KEY, JSON.stringify(payload));
      break;
    case 'daily-streak':
      localStorage.setItem(DAILY_STREAK_STORAGE_KEY, JSON.stringify(payload));
      break;
    case 'mysti-gacha': {
      const state = (payload ?? {}) as {
        seed?: string;
        collection?: string[];
        lastDrawDate?: string;
        lastResult?: unknown;
      };

      if (state.seed) {
        localStorage.setItem(MYSTI_SEED_STORAGE_KEY, state.seed);
      } else {
        localStorage.removeItem(MYSTI_SEED_STORAGE_KEY);
      }

      localStorage.setItem(
        MYSTI_COLLECTION_STORAGE_KEY,
        JSON.stringify({ collected: Array.isArray(state.collection) ? state.collection : [] }),
      );

      if (state.lastDrawDate) {
        localStorage.setItem(MYSTI_DRAW_DATE_STORAGE_KEY, state.lastDrawDate);
      } else {
        localStorage.removeItem(MYSTI_DRAW_DATE_STORAGE_KEY);
      }

      if (state.lastResult) {
        localStorage.setItem(MYSTI_LAST_RESULT_STORAGE_KEY, JSON.stringify(state.lastResult));
      } else {
        localStorage.removeItem(MYSTI_LAST_RESULT_STORAGE_KEY);
      }
      break;
    }
  }
}

function applyServerAssets(
  assets: Partial<Record<SyncedAssetKey, unknown>>,
  summary?: AssetSummary,
): void {
  for (const assetKey of ASSET_KEYS) {
    const payload = assets[assetKey];
    if (payload == null) continue;
    writeLocalAssetState(assetKey, payload);
  }

  if (typeof window !== 'undefined') {
    const detail: AssetSyncEventDetail = { assets, summary };
    window.dispatchEvent(new CustomEvent(ASSET_SYNC_EVENT, { detail }));
  }
}

async function hasExistingSession(): Promise<boolean> {
  return hasBrowserSupabaseSession();
}

async function ensureSyncSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    const supabase = tryCreateBrowserSupabaseClient();
    if (!supabase) {
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;

    const result = await getOrCreateAnonymousSession(supabase);
    return result.success;
  })();

  try {
    return await sessionPromise;
  } catch {
    return false;
  } finally {
    sessionPromise = null;
  }
}

async function postAssets(assetKeys: SyncedAssetKey[]): Promise<void> {
  const assets = assetKeys
    .map((assetKey) => {
      const payload = readLocalAssetState(assetKey);
      if (payload == null) return null;
      return { assetKey, payload };
    })
    .filter(Boolean);

  if (assets.length === 0) return;

  const response = await fetch(getApiPath('/assets/me'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assets }),
  });

  if (!response.ok) return;

  const data = await readApiJson<AssetsRouteResponse>(response);
  applyServerAssets(data.assets ?? {}, data.summary);
}

export function queueAssetSync(assetKey: SyncedAssetKey, delayMs = 450): void {
  if (typeof window === 'undefined') return;

  const existingTimer = syncTimers.get(assetKey);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timer = window.setTimeout(() => {
    syncTimers.delete(assetKey);
    void (async () => {
      const ready = await ensureSyncSession();
      if (!ready) return;
      await postAssets([assetKey]);
    })().catch(() => {});
  }, delayMs);

  syncTimers.set(assetKey, timer);
}

export async function bootstrapPersistentAssets(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const hasSession = await hasExistingSession();
    if (!hasSession) return;

    const localAssetKeys = ASSET_KEYS.filter((assetKey) => readLocalAssetState(assetKey) != null);
    if (localAssetKeys.length > 0) {
      await postAssets(localAssetKeys);
      return;
    }

    const response = await fetch(getApiPath('/assets/me'), {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return;

    const data = await readApiJson<AssetsRouteResponse>(response);
    applyServerAssets(data.assets ?? {}, data.summary);
  })();

  try {
    await bootstrapPromise;
  } finally {
    bootstrapPromise = null;
  }
}
