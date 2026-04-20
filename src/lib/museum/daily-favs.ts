/**
 * Daily Pick Favourites (W2)
 *
 * Lightweight "I love this daily card" storage. localStorage-backed list of
 * `${isoDate}:${tabId}:${slug}` keys, capped at 60 entries (most recent kept).
 *
 * Used by:
 *  - DailyPickOverlay heart button
 *  - (W3) month recap to populate "your favourites this month"
 */

const FAVS_KEY = 'wtf-museum-daily-favs-v1';
const MAX = 60;

export interface DailyFavEntry {
  isoDate: string;
  tabId: string;
  slug: string;
  /** Stored timestamp ms */
  ts: number;
}

function readRaw(): DailyFavEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && typeof e.isoDate === 'string' && typeof e.tabId === 'string' && typeof e.slug === 'string',
    ) as DailyFavEntry[];
  } catch {
    return [];
  }
}

function writeRaw(list: DailyFavEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVS_KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent('wtf-museum-daily-favs:changed'));
  } catch {
    /* ignore */
  }
}

function entryKey(e: { isoDate: string; tabId: string; slug: string }): string {
  return `${e.isoDate}|${e.tabId}|${e.slug}`;
}

export function isFav(entry: { isoDate: string; tabId: string; slug: string }): boolean {
  const k = entryKey(entry);
  return readRaw().some((e) => entryKey(e) === k);
}

export function toggleFav(entry: { isoDate: string; tabId: string; slug: string }): boolean {
  const k = entryKey(entry);
  const list = readRaw();
  const idx = list.findIndex((e) => entryKey(e) === k);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeRaw(list);
    return false;
  }
  list.unshift({ ...entry, ts: Date.now() });
  writeRaw(list);
  return true;
}

export function listFavs(): DailyFavEntry[] {
  return readRaw();
}
