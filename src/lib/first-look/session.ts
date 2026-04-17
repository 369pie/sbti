/**
 * First Look · sessionStorage persistence.
 *
 * Stores the latest First Look result for the session so /test/result/[slug]/
 * can render without depending on query params. Falls back gracefully if no
 * result is present (redirects to /test/).
 */

import type { DeepDiveTarget } from './archetypes';
import type { AxisVector } from './questions';

const KEY = 'sbti:first-look:result';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

export interface StoredFirstLookResult {
  slug: string;
  code: string;
  vector: AxisVector;
  deepDive: Array<{ target: DeepDiveTarget; match: number }>;
  storedAt: number;
}

export function saveFirstLookResult(payload: Omit<StoredFirstLookResult, 'storedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const record: StoredFirstLookResult = { ...payload, storedAt: Date.now() };
    window.sessionStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // swallow (private mode / quota)
  }
}

export function loadFirstLookResult(): StoredFirstLookResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredFirstLookResult;
    if (!parsed || typeof parsed.slug !== 'string') return null;
    if (Date.now() - parsed.storedAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
