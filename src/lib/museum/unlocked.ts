/**
 * Museum unlocked state — reads `wtf-card` localStorage, maps gallery tab id
 * to universe id, and exposes a SSR-safe React hook returning unlocked keys.
 *
 * Key format: `${tabId}:${slug}` (matches GalleryItem.slug + tab.id from
 * gallery-data.ts). Some tabs (sbti, sbti-xiuxian) share a universe; some
 * tabs (cpti-relationship) are derived and don't unlock individually.
 */
'use client';

import { useSyncExternalStore } from 'react';
import { loadCard, type WtfCardData } from '@/lib/wtf-card';

/**
 * Map: gallery tab id → universe id (in `wtf-card` results).
 * Tabs not in this map are treated as "always visible, never lock".
 *
 * sbti and sbti-xiuxian both unlock from the `standard` universe result;
 * if user took xiuxian skin we also accept `xiuxian` universe id.
 */
export const TAB_TO_UNIVERSE_IDS: Record<string, string[]> = {
  sbti: ['standard', 'xiuxian'],
  xiuxian: ['xiuxian', 'standard'],
  wtfti: ['wtfti'],
  banti: ['banti'],
  kings: ['kings'],
  delta: ['delta'],
  bird: ['bird'],
  hogti: ['hogti'],
  fanrenti: ['fanrenti'],
  soulti: ['soulti'],
  cpti: ['cpti'],
  xpti: ['xpti'],
  flower: ['flower'],
  love: ['love'],
  work: ['work'],
  daily: ['daily'],
  drunk: ['drunk'],
  mysti: ['mysti'],
  // 'cpti-relationship' is derived; we treat it as always-unlocked when CPTI
  // has any result (handled separately in buildUnlockedKeys).
};

export interface UnlockedSummary {
  /** Set of `${tabId}:${slug}` keys that the user has unlocked. */
  keys: Set<string>;
  /** Number of distinct tabs (universes) with at least one unlocked slug. */
  unlockedTabs: number;
  /** Total unlocked count across all tabs. */
  totalUnlocked: number;
  /** Card nickname if set. */
  nickname: string;
  /** When the wtf-card was created (ISO date). */
  createdAt?: string;
  /** True if user has no card yet at all. */
  isEmpty: boolean;
}

const EMPTY: UnlockedSummary = {
  keys: new Set(),
  unlockedTabs: 0,
  totalUnlocked: 0,
  nickname: '',
  isEmpty: true,
};

function buildSummary(card: WtfCardData | null): UnlockedSummary {
  if (!card) return EMPTY;

  const keys = new Set<string>();
  const tabsWithUnlocks = new Set<string>();

  for (const [tabId, universeIds] of Object.entries(TAB_TO_UNIVERSE_IDS)) {
    for (const uid of universeIds) {
      const result = card.results?.[uid];
      if (result?.slug) {
        keys.add(`${tabId}:${result.slug}`);
        tabsWithUnlocks.add(tabId);
      }
    }
  }

  // Derived tab: cpti-relationship — unlocked entries come from card.relationships
  if (card.relationships?.length) {
    let added = false;
    for (const rel of card.relationships) {
      if (rel.slug) {
        keys.add(`cpti-relationship:${rel.slug}`);
        added = true;
      }
    }
    if (added) tabsWithUnlocks.add('cpti-relationship');
  }

  const totalUnlocked = keys.size;
  const isEmpty = totalUnlocked === 0 && !card.nickname;

  return {
    keys,
    unlockedTabs: tabsWithUnlocks.size,
    totalUnlocked,
    nickname: card.nickname ?? '',
    createdAt: card.createdAt,
    isEmpty,
  };
}

// ── External store (SSR-safe) ────────────────────────────────────────────────

const STORAGE_KEY = 'wtf-card';
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSummary: UnlockedSummary = EMPTY;

function readFromStorage(): void {
  if (typeof window === 'undefined') {
    cachedRaw = null;
    cachedSummary = EMPTY;
    return;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return;
  cachedRaw = raw;
  cachedSummary = buildSummary(loadCard());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  if (typeof window !== 'undefined' && listeners.size === 1) {
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined' && listeners.size === 0) {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    }
  };
}

function onStorage(e: StorageEvent): void {
  if (e.key && e.key !== STORAGE_KEY) return;
  readFromStorage();
  listeners.forEach((l) => l());
}

function onFocus(): void {
  readFromStorage();
  listeners.forEach((l) => l());
}

function getSnapshot(): UnlockedSummary {
  readFromStorage();
  return cachedSummary;
}

function getServerSnapshot(): UnlockedSummary {
  return EMPTY;
}

/**
 * SSR-safe hook returning unlocked summary. Initial render returns EMPTY; the
 * hydrated client read happens in the store, not via setState-in-effect.
 */
export function useMuseumUnlocked(): UnlockedSummary {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
