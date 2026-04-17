import { UNIVERSES } from '@/lib/universes';

export const ASSET_KEYS = ['wtf-card', 'daily-gacha', 'daily-streak', 'mysti-gacha'] as const;

export type SyncedAssetKey = (typeof ASSET_KEYS)[number];

export const ASSET_SYNC_EVENT = 'wtfti:assets-synced';

export const ASSET_MODULE_IDS: Record<SyncedAssetKey, string> = {
  'wtf-card': 'asset_state:wtf-card',
  'daily-gacha': 'asset_state:daily-gacha',
  'daily-streak': 'asset_state:daily-streak',
  'mysti-gacha': 'asset_state:mysti-gacha',
};

export const ASSET_MODULE_KINDS: Record<SyncedAssetKey, 'independent_module' | 'temporal_module'> = {
  'wtf-card': 'independent_module',
  'daily-gacha': 'temporal_module',
  'daily-streak': 'temporal_module',
  'mysti-gacha': 'independent_module',
};

export const ASSET_MODULE_IDS_LIST = ASSET_KEYS.map((key) => ASSET_MODULE_IDS[key]);

const CARD_UNIVERSE_IDS = UNIVERSES.filter((universe) => universe.status === 'live').map((universe) => universe.id);

export interface SyncedUniverseResult {
  slug: string;
  testedAt: string;
}

export interface SyncedRelationshipRecord {
  slug: string;
  partnerNickname: string;
  mySlug: string;
  partnerSlug: string;
  compatibility: number;
  testedAt: string;
}

export interface SyncedWtfCardState {
  id: string;
  nickname: string;
  createdAt: string;
  results: Record<string, SyncedUniverseResult | null>;
  relationships?: SyncedRelationshipRecord[];
  pinnedUniverses?: string[];
}

export interface SyncedDailyGachaState {
  lastDrawDate: string;
  history: Array<{
    universeId: string;
    universeName: string;
    universeEmoji: string;
    slug: string;
    rarity: string;
    drawnAt: string;
  }>;
}

export interface SyncedDailyStreakState {
  lastCheckInDate: string;
  streak: number;
  totalDays: number;
}

export interface SyncedMystiState {
  seed: string;
  collection: string[];
  lastDrawDate: string;
  lastResult: unknown | null;
}

export interface AssetSummary {
  wtfCard: {
    lit: number;
    total: number;
    relationshipCount: number;
    pinnedCount: number;
  };
  dailyGacha: {
    draws: number;
    lastDrawDate: string | null;
  };
  dailyStreak: {
    streak: number;
    totalDays: number;
    lastCheckInDate: string | null;
  };
  mysti: {
    collected: number;
    lastDrawDate: string | null;
  };
}

export interface AssetSyncEventDetail {
  assets?: Partial<Record<SyncedAssetKey, unknown>>;
  summary?: AssetSummary;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeDay(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function normalizeIso(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toTimestamp(value: string): number {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function earlierDay(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

function laterDay(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

function uniqueStrings(values: string[], limit?: number): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
    if (typeof limit === 'number' && unique.length >= limit) break;
  }
  return unique;
}

function normalizeUniverseResult(value: unknown): SyncedUniverseResult | null {
  if (!isRecord(value)) return null;
  if (typeof value.slug !== 'string' || value.slug.length === 0) return null;
  return {
    slug: value.slug,
    testedAt: normalizeDay(value.testedAt),
  };
}

function normalizeRelationshipRecord(value: unknown): SyncedRelationshipRecord | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.slug !== 'string' ||
    typeof value.partnerNickname !== 'string' ||
    typeof value.mySlug !== 'string' ||
    typeof value.partnerSlug !== 'string'
  ) {
    return null;
  }
  return {
    slug: value.slug,
    partnerNickname: value.partnerNickname,
    mySlug: value.mySlug,
    partnerSlug: value.partnerSlug,
    compatibility: typeof value.compatibility === 'number' ? value.compatibility : 0,
    testedAt: normalizeDay(value.testedAt),
  };
}

export function normalizeWtfCardState(input: unknown): SyncedWtfCardState | null {
  if (!isRecord(input)) return null;

  const rawResults = isRecord(input.results) ? input.results : {};
  const universeIds = uniqueStrings([...CARD_UNIVERSE_IDS, ...Object.keys(rawResults)]);
  const results: Record<string, SyncedUniverseResult | null> = {};
  for (const universeId of universeIds) {
    results[universeId] = normalizeUniverseResult(rawResults[universeId]);
  }

  const relationships = Array.isArray(input.relationships)
    ? input.relationships.map(normalizeRelationshipRecord).filter(Boolean) as SyncedRelationshipRecord[]
    : [];

  const pinnedUniverses = Array.isArray(input.pinnedUniverses)
    ? uniqueStrings(input.pinnedUniverses.filter((value): value is string => typeof value === 'string'), 5)
    : [];

  return {
    id: typeof input.id === 'string' ? input.id : '',
    nickname: typeof input.nickname === 'string' ? input.nickname : '',
    createdAt: normalizeDay(input.createdAt),
    results,
    relationships: relationships.length > 0 ? relationships : undefined,
    pinnedUniverses: pinnedUniverses.length > 0 ? pinnedUniverses : undefined,
  };
}

export function normalizeDailyGachaState(input: unknown): SyncedDailyGachaState | null {
  if (!isRecord(input)) return null;
  const history = Array.isArray(input.history)
    ? input.history.filter(isRecord).map((entry) => ({
        universeId: typeof entry.universeId === 'string' ? entry.universeId : '',
        universeName: typeof entry.universeName === 'string' ? entry.universeName : '',
        universeEmoji: typeof entry.universeEmoji === 'string' ? entry.universeEmoji : '',
        slug: typeof entry.slug === 'string' ? entry.slug : '',
        rarity: typeof entry.rarity === 'string' ? entry.rarity : '',
        drawnAt: normalizeIso(entry.drawnAt),
      })).filter((entry) => entry.universeId && entry.slug && entry.drawnAt)
    : [];

  return {
    lastDrawDate: normalizeDay(input.lastDrawDate),
    history,
  };
}

export function normalizeDailyStreakState(input: unknown): SyncedDailyStreakState | null {
  if (!isRecord(input)) return null;
  return {
    lastCheckInDate: normalizeDay(input.lastCheckInDate),
    streak: typeof input.streak === 'number' ? input.streak : 0,
    totalDays: typeof input.totalDays === 'number' ? input.totalDays : 0,
  };
}

export function normalizeMystiState(input: unknown): SyncedMystiState | null {
  if (!isRecord(input)) return null;
  return {
    seed: typeof input.seed === 'string' ? input.seed : '',
    collection: Array.isArray(input.collection)
      ? uniqueStrings(input.collection.filter((value): value is string => typeof value === 'string'))
      : [],
    lastDrawDate: normalizeDay(input.lastDrawDate),
    lastResult: input.lastResult ?? null,
  };
}

export function normalizeAssetPayload(assetKey: SyncedAssetKey, input: unknown) {
  switch (assetKey) {
    case 'wtf-card':
      return normalizeWtfCardState(input);
    case 'daily-gacha':
      return normalizeDailyGachaState(input);
    case 'daily-streak':
      return normalizeDailyStreakState(input);
    case 'mysti-gacha':
      return normalizeMystiState(input);
  }
}

function pickNewerUniverseResult(
  current: SyncedUniverseResult | null | undefined,
  incoming: SyncedUniverseResult | null | undefined,
): SyncedUniverseResult | null {
  if (!current) return incoming ?? null;
  if (!incoming) return current;
  return current.testedAt >= incoming.testedAt ? current : incoming;
}

function mergeRelationshipRecords(
  current: SyncedRelationshipRecord[] = [],
  incoming: SyncedRelationshipRecord[] = [],
): SyncedRelationshipRecord[] {
  const merged = new Map<string, SyncedRelationshipRecord>();
  for (const relationship of [...current, ...incoming]) {
    const key = [relationship.slug, relationship.partnerNickname, relationship.mySlug, relationship.partnerSlug].join('|');
    const existing = merged.get(key);
    if (!existing || relationship.testedAt >= existing.testedAt) {
      merged.set(key, relationship);
    }
  }
  return [...merged.values()].sort((a, b) => b.testedAt.localeCompare(a.testedAt)).slice(0, 50);
}

export function mergeWtfCardState(
  currentInput: unknown,
  incomingInput: unknown,
): SyncedWtfCardState | null {
  const current = normalizeWtfCardState(currentInput);
  const incoming = normalizeWtfCardState(incomingInput);
  if (!current && !incoming) return null;

  const universeIds = uniqueStrings([
    ...CARD_UNIVERSE_IDS,
    ...Object.keys(current?.results ?? {}),
    ...Object.keys(incoming?.results ?? {}),
  ]);
  const results: Record<string, SyncedUniverseResult | null> = {};
  for (const universeId of universeIds) {
    results[universeId] = pickNewerUniverseResult(current?.results[universeId], incoming?.results[universeId]);
  }

  const relationships = mergeRelationshipRecords(current?.relationships, incoming?.relationships);
  const pinnedUniverses = uniqueStrings([
    ...(current?.pinnedUniverses ?? []),
    ...(incoming?.pinnedUniverses ?? []),
  ], 5);

  return {
    id: current?.id || incoming?.id || '',
    nickname: current?.nickname || incoming?.nickname || '',
    createdAt: earlierDay(current?.createdAt ?? '', incoming?.createdAt ?? ''),
    results,
    relationships: relationships.length > 0 ? relationships : undefined,
    pinnedUniverses: pinnedUniverses.length > 0 ? pinnedUniverses : undefined,
  };
}

export function mergeDailyGachaState(
  currentInput: unknown,
  incomingInput: unknown,
): SyncedDailyGachaState | null {
  const current = normalizeDailyGachaState(currentInput);
  const incoming = normalizeDailyGachaState(incomingInput);
  if (!current && !incoming) return null;

  const historyMap = new Map<string, SyncedDailyGachaState['history'][number]>();
  for (const entry of [...(current?.history ?? []), ...(incoming?.history ?? [])]) {
    historyMap.set([entry.drawnAt, entry.universeId, entry.slug].join('|'), entry);
  }
  const history = [...historyMap.values()].sort((a, b) => toTimestamp(b.drawnAt) - toTimestamp(a.drawnAt)).slice(0, 60);

  return {
    lastDrawDate: laterDay(current?.lastDrawDate ?? '', incoming?.lastDrawDate ?? ''),
    history,
  };
}

export function mergeDailyStreakState(
  currentInput: unknown,
  incomingInput: unknown,
): SyncedDailyStreakState | null {
  const current = normalizeDailyStreakState(currentInput);
  const incoming = normalizeDailyStreakState(incomingInput);
  if (!current && !incoming) return null;
  if (!current) return incoming;
  if (!incoming) return current;

  if (current.lastCheckInDate === incoming.lastCheckInDate) {
    return {
      lastCheckInDate: current.lastCheckInDate,
      streak: Math.max(current.streak, incoming.streak),
      totalDays: Math.max(current.totalDays, incoming.totalDays),
    };
  }

  const latest = current.lastCheckInDate > incoming.lastCheckInDate ? current : incoming;
  return {
    lastCheckInDate: latest.lastCheckInDate,
    streak: latest.streak,
    totalDays: Math.max(current.totalDays, incoming.totalDays),
  };
}

function getMystiResultDate(result: unknown): string {
  if (!isRecord(result)) return '';
  return normalizeDay(result.date);
}

export function mergeMystiState(
  currentInput: unknown,
  incomingInput: unknown,
): SyncedMystiState | null {
  const current = normalizeMystiState(currentInput);
  const incoming = normalizeMystiState(incomingInput);
  if (!current && !incoming) return null;

  const currentResultDate = getMystiResultDate(current?.lastResult);
  const incomingResultDate = getMystiResultDate(incoming?.lastResult);

  return {
    seed: current?.seed || incoming?.seed || '',
    collection: uniqueStrings([...(current?.collection ?? []), ...(incoming?.collection ?? [])]),
    lastDrawDate: laterDay(current?.lastDrawDate ?? '', incoming?.lastDrawDate ?? ''),
    lastResult: currentResultDate >= incomingResultDate ? current?.lastResult ?? null : incoming?.lastResult ?? null,
  };
}

export function mergeAssetPayload(assetKey: SyncedAssetKey, currentInput: unknown, incomingInput: unknown) {
  switch (assetKey) {
    case 'wtf-card':
      return mergeWtfCardState(currentInput, incomingInput);
    case 'daily-gacha':
      return mergeDailyGachaState(currentInput, incomingInput);
    case 'daily-streak':
      return mergeDailyStreakState(currentInput, incomingInput);
    case 'mysti-gacha':
      return mergeMystiState(currentInput, incomingInput);
  }
}

export function getAssetKeyFromModuleId(moduleId: string): SyncedAssetKey | null {
  for (const assetKey of ASSET_KEYS) {
    if (ASSET_MODULE_IDS[assetKey] === moduleId) {
      return assetKey;
    }
  }
  return null;
}

export function buildAssetSummary(assets: Partial<Record<SyncedAssetKey, unknown>>): AssetSummary {
  const wtfCard = normalizeWtfCardState(assets['wtf-card']);
  const dailyGacha = normalizeDailyGachaState(assets['daily-gacha']);
  const dailyStreak = normalizeDailyStreakState(assets['daily-streak']);
  const mysti = normalizeMystiState(assets['mysti-gacha']);

  const lit = CARD_UNIVERSE_IDS.filter((universeId) => wtfCard?.results[universeId] != null).length;

  return {
    wtfCard: {
      lit,
      total: CARD_UNIVERSE_IDS.length,
      relationshipCount: wtfCard?.relationships?.length ?? 0,
      pinnedCount: wtfCard?.pinnedUniverses?.length ?? 0,
    },
    dailyGacha: {
      draws: dailyGacha?.history.length ?? 0,
      lastDrawDate: dailyGacha?.lastDrawDate || null,
    },
    dailyStreak: {
      streak: dailyStreak?.streak ?? 0,
      totalDays: dailyStreak?.totalDays ?? 0,
      lastCheckInDate: dailyStreak?.lastCheckInDate || null,
    },
    mysti: {
      collected: mysti?.collection.length ?? 0,
      lastDrawDate: mysti?.lastDrawDate || null,
    },
  };
}