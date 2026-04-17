/**
 * CPTI Profile — persist the current user's own CPTI dimension scores
 * in localStorage so they can be reused for invite links and stealth mode
 * without re-taking the test.
 *
 * Also syncs to Supabase via cptiApi.saveProfile() for cross-device persistence.
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

  // Background sync to Supabase — fire-and-forget
  syncProfileToSupabase(slug, dimensions);
}

/** Sync to Supabase in the background. Never throws. */
function syncProfileToSupabase(slug: string, dimensions: CptiDimensionScore[]): void {
  import('./cpti-api').then(({ cptiApi }) => {
    cptiApi.saveProfile({
      personalitySlug: slug,
      dimensionScores: dimensions.map(d => ({ id: d.id, score: d.score, level: d.level })),
      source: 'self_test',
    }).catch(() => {
      // Swallow — localStorage is the fallback
    });
  }).catch(() => {});
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

/**
 * Hydrate localStorage from Supabase if local is empty.
 * Call this on app mount or auth state change.
 */
export async function hydrateCptiProfileFromServer(): Promise<CptiProfile | null> {
  if (typeof window === 'undefined') return null;

  // Skip if we already have a local profile
  const local = loadCptiProfile();
  if (local) return local;

  try {
    const { cptiApi } = await import('./cpti-api');
    const data = await cptiApi.getProfile();
    if (data && typeof data === 'object' && 'personalitySlug' in data && data.personalitySlug) {
      const slug = data.personalitySlug as string;
      const dims = (data.dimensionScores ?? []) as CptiDimensionScore[];
      const testedAt = (data.testedAt as string) ?? new Date().toISOString().slice(0, 10);
      const profile: CptiProfile = { slug, dimensions: dims, testedAt };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
      return profile;
    }
  } catch {
    // Network error — use localStorage fallback
  }
  return null;
}
