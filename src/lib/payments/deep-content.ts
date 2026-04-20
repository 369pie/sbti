/**
 * Shared deterministic helpers used by module deep-result pages
 * (CPTI / XPTI / etc.) to synthesise rich content from a stable slug
 * without authoring 25 × 30 × 12 lines of bespoke copy.
 *
 * Pure functions — same input always returns same output. No DOM / IO.
 */

export function hashString(input: string): number {
  let h = 2166136261 >>> 0; // FNV-1a 32-bit
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Deterministic 0–1 generator seeded by slug + index. */
export function seedRandom(slug: string, index: number): number {
  const h = hashString(`${slug}:${index}`);
  return (h % 10000) / 10000;
}

/** Pick `n` items from `pool` deterministically (no repeats unless pool < n). */
export function pickN<T>(pool: readonly T[], slug: string, n: number, salt = ''): T[] {
  if (pool.length === 0) return [];
  const indexed = pool.map((item, i) => ({
    item,
    rank: hashString(`${slug}:${salt}:${i}`),
  }));
  indexed.sort((a, b) => a.rank - b.rank);
  return indexed.slice(0, Math.min(n, pool.length)).map(({ item }) => item);
}

/** Deterministic H/M/L bucket from slug + axis. */
export function pickLevel(slug: string, axis: string): 'H' | 'M' | 'L' {
  const v = hashString(`${slug}:${axis}`) % 100;
  if (v < 33) return 'L';
  if (v < 66) return 'M';
  return 'H';
}

export function levelToScore(level: 'H' | 'M' | 'L'): number {
  return level === 'H' ? 2.7 : level === 'M' ? 2.0 : 1.3;
}
