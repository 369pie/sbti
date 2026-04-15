/**
 * CPTI Profile — persist the current user's own CPTI dimension scores
 * in localStorage so they can be reused for invite links and stealth mode
 * without re-taking the test.
 */

import type { CptiDimensionScore } from './scoring';

const STORAGE_KEY = 'cpti-my-profile';

export interface CptiProfile {
  slug: string;
  dimensions: CptiDimensionScore[];
  testedAt: string; // ISO date
}

export function saveCptiProfile(slug: string, dimensions: CptiDimensionScore[]): void {
  if (typeof window === 'undefined') return;
  try {
    const profile: CptiProfile = {
      slug,
      dimensions,
      testedAt: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch { /* storage full / private mode */ }
}

export function loadCptiProfile(): CptiProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CptiProfile;
    if (!parsed || !parsed.slug || !Array.isArray(parsed.dimensions)) return null;
    return parsed;
  } catch {
    return null;
  }
}
