/**
 * Server-side featured selection.
 *
 * Picks N "today" cards from the FEATURED_POOL deterministically based on
 * the ISO date — so the cover changes daily but is the same for everyone,
 * which makes Xiaohongshu screenshots gather around the same daily artifact.
 */

import type { GalleryItem, GalleryTab } from '@/app/types/gallery-data';
import { FEATURED_POOL, getFeaturedCopy, type FeaturedCopy } from './featured-slogans';

export interface FeaturedCard {
  tabId: string;
  tabLabel: string;
  tabAccent: string;
  tabEmoji: string;
  testHref: string;
  item: GalleryItem;
  copy: FeaturedCopy;
}

// 32-bit FNV-1a hash → uniform integer
function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function todayISO(): string {
  // Use Asia/Shanghai approximate boundary so all CN users see the same daily
  // pick around midnight local time. UTC+8 = +8 hours from UTC.
  const now = new Date(Date.now() + 8 * 3600_000);
  return now.toISOString().slice(0, 10);
}

interface Lookup {
  tabsById: Map<string, GalleryTab>;
  itemsByKey: Map<string, GalleryItem>;
}

function buildLookup(allTabs: GalleryTab[]): Lookup {
  const tabsById = new Map<string, GalleryTab>();
  const itemsByKey = new Map<string, GalleryItem>();
  for (const tab of allTabs) {
    tabsById.set(tab.id, tab);
    for (const item of tab.items) {
      itemsByKey.set(`${tab.id}:${item.slug}`, item);
    }
  }
  return { tabsById, itemsByKey };
}

/**
 * Pick `count` featured cards for today. Returns fewer if pool is small or
 * referenced slugs don't exist in current data.
 */
export function getDailyFeatured(allTabs: GalleryTab[], count = 3, dateOverride?: string): FeaturedCard[] {
  const date = dateOverride ?? todayISO();
  const { tabsById, itemsByKey } = buildLookup(allTabs);

  // Filter pool to keys actually present in current gallery data
  const eligible = FEATURED_POOL.filter((key) => itemsByKey.has(key));
  if (eligible.length === 0) return [];

  // Deterministic shuffle: rank by hash(date|key)
  const ranked = eligible
    .map((key) => ({ key, r: fnv1a(`${date}|${key}`) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, count);

  const featured: FeaturedCard[] = [];
  for (const { key } of ranked) {
    const [tabId, slug] = key.split(':');
    const tab = tabsById.get(tabId);
    const item = itemsByKey.get(key);
    const copy = getFeaturedCopy(tabId, slug);
    if (!tab || !item || !copy) continue;

    featured.push({
      tabId,
      tabLabel: tab.label,
      tabAccent: tab.accent,
      tabEmoji: tab.emoji,
      testHref: tab.testHref,
      item,
      copy,
    });
  }
  return featured;
}
