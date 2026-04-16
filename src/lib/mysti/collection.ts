/**
 * 图鉴墙 (Collection Wall) — localStorage-based personality collection tracking
 *
 * Storage key: `mysti-collection`
 * Format: `universeId:slug` pairs as Set<string>
 */

const STORAGE_KEY = 'mysti-collection';

function load(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function save(collection: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...collection]));
  } catch {
    // storage full or blocked
  }
}

function makeKey(universeId: string, slug: string): string {
  return `${universeId}:${slug}`;
}

/** Mark a personality as collected (call this on result page mount) */
export function markCollected(universeId: string, slug: string): void {
  const collection = load();
  const key = makeKey(universeId, slug);
  if (collection.has(key)) return; // already collected, no write needed
  collection.add(key);
  save(collection);
}

/** Check if a specific personality has been collected */
export function isCollected(universeId: string, slug: string): boolean {
  return load().has(makeKey(universeId, slug));
}

/** Get total collection count across all universes */
export function getCollectionCount(): number {
  return load().size;
}

/** Get all collected slugs for a specific universe */
export function getCollectionByUniverse(universeId: string): string[] {
  const prefix = `${universeId}:`;
  return [...load()]
    .filter(key => key.startsWith(prefix))
    .map(key => key.slice(prefix.length));
}

/** Get the full set of collected keys (for bulk operations) */
export function getAllCollected(): Set<string> {
  return load();
}

/** Clear all collection data */
export function clearCollection(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
