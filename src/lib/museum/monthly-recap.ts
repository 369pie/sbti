/**
 * Monthly recap (W3) — aggregates a user's daily-favs + daily-pick history
 * for a given YYYY-MM into a 4×3 grid summary.
 *
 * Pure on input, but `loadFavsForMonth` reads localStorage so call from
 * the client only.
 */

import type { GalleryItem, GalleryTab } from '@/app/types/gallery-data';
import { lookupItem } from './cp-pair';

const FAVS_KEY = 'wtf-museum-daily-favs-v1';

export interface MonthEntry {
  isoDate: string;
  tabId: string;
  slug: string;
  ts: number;
  resolved?: { tab: GalleryTab; item: GalleryItem };
}

export interface MonthlyRecap {
  ym: string;                 // "2026-04"
  entries: MonthEntry[];      // sorted asc by ts
  topColor: string;           // dominant card color
  uniqueTabIds: string[];     // distinct series visited that month
  cardCount: number;
}

export function isValidYm(ym: string): boolean {
  return /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(ym);
}

export function currentYm(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function loadFavsForMonth(ym: string, allTabs: GalleryTab[]): MonthlyRecap | null {
  if (typeof window === 'undefined' || !isValidYm(ym)) return null;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(FAVS_KEY); } catch { return null; }
  if (!raw) return { ym, entries: [], topColor: '#C07A8E', uniqueTabIds: [], cardCount: 0 };

  let parsed: { isoDate: string; tabId: string; slug: string; ts: number }[];
  try {
    parsed = JSON.parse(raw) as { isoDate: string; tabId: string; slug: string; ts: number }[];
    if (!Array.isArray(parsed)) return null;
  } catch { return null; }

  const filtered: MonthEntry[] = parsed
    .filter((e) => typeof e.isoDate === 'string' && e.isoDate.startsWith(ym))
    .sort((a, b) => a.ts - b.ts)
    .map((e) => {
      const found = lookupItem(allTabs, e.tabId, e.slug);
      return {
        ...e,
        resolved: found ?? undefined,
      };
    });

  const colorCount = new Map<string, number>();
  const uniqueTabs = new Set<string>();
  for (const e of filtered) {
    if (e.resolved) {
      const c = e.resolved.item.color;
      colorCount.set(c, (colorCount.get(c) ?? 0) + 1);
      uniqueTabs.add(e.tabId);
    }
  }
  let topColor = '#C07A8E';
  let topVal = 0;
  for (const [c, n] of colorCount) {
    if (n > topVal) { topVal = n; topColor = c; }
  }

  return {
    ym,
    entries: filtered,
    topColor,
    uniqueTabIds: Array.from(uniqueTabs),
    cardCount: filtered.length,
  };
}

/** Pretty title — "2026 / 4 月" */
export function formatYmTitle(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y} / ${parseInt(m, 10)} 月`;
}

/** Previous and next ym (for navigation links). */
export function adjacentYm(ym: string): { prev: string; next: string } {
  const [yStr, mStr] = ym.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const prevDate = new Date(y, m - 2, 1);
  const nextDate = new Date(y, m, 1);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { prev: fmt(prevDate), next: fmt(nextDate) };
}
