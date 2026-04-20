/**
 * Daily Pick (W2) — pick today's card deterministically.
 *
 * Rules:
 *  - hash(`${YYYY-MM-DD}|${userSeed}`) % poolSize → today's index
 *  - poolSize = all gallery items across all tabs
 *  - 60/40 bias: among ranked top, prefer unlocked-or-equal-weight, but never
 *    *exclude* unlocked or locked cards entirely. We sort by hash, then keep
 *    the first whose status matches a 60% chance "unlocked" / 40% "locked".
 *  - userSeed is a stable random value stored in localStorage; falls back to
 *    'guest' if storage is unavailable. Two devices = two pick streams (OK
 *    for now; multi-device sync would need backend).
 *  - One pick per UTC+8 day. Cached in localStorage so flip / share doesn't
 *    re-roll. Expires automatically next day.
 *
 * Pure where possible; storage helpers are guarded for SSR.
 */

import type { GalleryItem, GalleryTab } from '@/app/types/gallery-data';

export interface DailyPick {
  /** `${tabId}:${slug}` */
  key: string;
  tabId: string;
  slug: string;
  item: GalleryItem;
  tab: Pick<GalleryTab, 'id' | 'label' | 'emoji' | 'accent' | 'testHref'>;
  isUnlocked: boolean;
  /** ISO date this pick is for (UTC+8) */
  isoDate: string;
}

const SEED_KEY = 'wtf-museum-daily-seed';
const PICK_CACHE_KEY = 'wtf-museum-daily-pick-v1';

// 32-bit FNV-1a
function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function todayShanghaiISO(now: Date = new Date()): string {
  return new Date(now.getTime() + 8 * 3600_000).toISOString().slice(0, 10);
}

/**
 * Get / create a stable per-device seed. Stored in localStorage.
 * Falls back to a session-stable value if storage is blocked.
 */
let memorySeed: string | null = null;
export function getOrCreateUserSeed(): string {
  if (typeof window === 'undefined') return 'ssr';
  if (memorySeed) return memorySeed;
  try {
    const existing = window.localStorage.getItem(SEED_KEY);
    if (existing) {
      memorySeed = existing;
      return existing;
    }
    const seed = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(SEED_KEY, seed);
    memorySeed = seed;
    return seed;
  } catch {
    memorySeed = `mem_${Math.random().toString(36).slice(2, 12)}`;
    return memorySeed;
  }
}

interface CachedPick {
  isoDate: string;
  key: string;
}

function readCachedPick(): CachedPick | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PICK_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPick;
    if (parsed?.isoDate && parsed?.key) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCachedPick(pick: CachedPick): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PICK_CACHE_KEY, JSON.stringify(pick));
  } catch {
    /* ignore */
  }
}

interface PickContext {
  allTabs: GalleryTab[];
  unlockedKeys: Set<string>;
  /** Override seed (for testing / reroll preview). Production uses local seed. */
  seedOverride?: string;
  /** Override date (for testing). Production uses today UTC+8. */
  dateOverride?: string;
}

/**
 * Pick today's card. Deterministic for a given (date, seed) pair.
 *
 * Bias logic: rank all items by hash(`${date}|${seed}|${key}`). Walk the
 * sorted list; with 60% probability take the first unlocked match, with 40%
 * take the first locked match. If the chosen pool is empty, fall back to the
 * other.
 */
export function pickDailyCard(ctx: PickContext): DailyPick | null {
  const { allTabs, unlockedKeys, seedOverride, dateOverride } = ctx;
  if (allTabs.length === 0) return null;

  const isoDate = dateOverride ?? todayShanghaiISO();
  const seed = seedOverride ?? getOrCreateUserSeed();

  // Cache hit?
  if (!seedOverride && !dateOverride) {
    const cached = readCachedPick();
    if (cached && cached.isoDate === isoDate) {
      const found = locateByKey(allTabs, cached.key);
      if (found) {
        return {
          key: cached.key,
          tabId: found.tab.id,
          slug: found.item.slug,
          item: found.item,
          tab: pickTabSubset(found.tab),
          isUnlocked: unlockedKeys.has(cached.key),
          isoDate,
        };
      }
    }
  }

  // Build all candidate keys
  const candidates: Array<{ key: string; rank: number; tab: GalleryTab; item: GalleryItem }> = [];
  for (const tab of allTabs) {
    for (const item of tab.items) {
      const key = `${tab.id}:${item.slug}`;
      const rank = fnv1a(`${isoDate}|${seed}|${key}`);
      candidates.push({ key, rank, tab, item });
    }
  }
  candidates.sort((a, b) => a.rank - b.rank);

  // Bias decision derived from the same date-seed (so it's deterministic)
  const biasRoll = fnv1a(`${isoDate}|${seed}|bias`) % 100;
  const preferUnlocked = biasRoll < 60;

  let chosen: typeof candidates[number] | undefined;
  for (const c of candidates) {
    const isU = unlockedKeys.has(c.key);
    if (preferUnlocked ? isU : !isU) {
      chosen = c;
      break;
    }
  }
  if (!chosen) chosen = candidates[0];

  if (!seedOverride && !dateOverride) {
    writeCachedPick({ isoDate, key: chosen.key });
  }

  return {
    key: chosen.key,
    tabId: chosen.tab.id,
    slug: chosen.item.slug,
    item: chosen.item,
    tab: pickTabSubset(chosen.tab),
    isUnlocked: unlockedKeys.has(chosen.key),
    isoDate,
  };
}

function locateByKey(allTabs: GalleryTab[], key: string): { tab: GalleryTab; item: GalleryItem } | null {
  const [tabId, slug] = key.split(':');
  if (!tabId || !slug) return null;
  const tab = allTabs.find((t) => t.id === tabId);
  if (!tab) return null;
  const item = tab.items.find((i) => i.slug === slug);
  if (!item) return null;
  return { tab, item };
}

function pickTabSubset(tab: GalleryTab): DailyPick['tab'] {
  return {
    id: tab.id,
    label: tab.label,
    emoji: tab.emoji,
    accent: tab.accent,
    testHref: tab.testHref,
  };
}

/**
 * Read whether the user has already opened today's pick. Used by overlay
 * to decide auto-open vs. badge.
 */
const SEEN_KEY = 'wtf-museum-daily-seen-v1';
export function markDailyPickSeen(isoDate: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SEEN_KEY, isoDate);
  } catch {
    /* ignore */
  }
}
export function hasSeenDailyPick(isoDate: string): boolean {
  if (typeof window === 'undefined') return true; // no auto-open on server
  try {
    return window.localStorage.getItem(SEEN_KEY) === isoDate;
  } catch {
    return false;
  }
}
