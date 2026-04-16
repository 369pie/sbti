/**
 * UGC Universe registry — loads and indexes all UGC universe configs.
 *
 * Phase 0: Configs are imported statically from ./universes/.
 * Phase 1+: Will also load from Supabase.
 */

import type { UgcUniverseConfig, UgcPersonality } from './types';

// ─── Static imports (Phase 0: add new KOL universes here) ───────────────────

import { ZHENHUAN_UNIVERSE } from './universes/zhenhuan';

/** All registered UGC universe configs. Add new entries as they're created. */
export const UGC_UNIVERSES: UgcUniverseConfig[] = [
  ZHENHUAN_UNIVERSE,
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

const _universeMap = new Map<string, UgcUniverseConfig>();
const _personalityMaps = new Map<string, Map<string, UgcPersonality>>();

function ensureIndex() {
  if (_universeMap.size > 0) return;
  for (const u of UGC_UNIVERSES) {
    _universeMap.set(u.id, u);
    const pMap = new Map<string, UgcPersonality>();
    for (const p of u.personalities) {
      pMap.set(p.slug, p);
    }
    _personalityMaps.set(u.id, pMap);
  }
}

/** Get a UGC universe config by id. */
export function getUgcUniverse(id: string): UgcUniverseConfig | undefined {
  ensureIndex();
  return _universeMap.get(id);
}

/** Get a personality within a UGC universe. */
export function getUgcPersonality(universeId: string, slug: string): UgcPersonality | undefined {
  ensureIndex();
  return _personalityMaps.get(universeId)?.get(slug);
}

/** Get all personality slugs for a UGC universe. */
export function getUgcSlugs(universeId: string): string[] {
  ensureIndex();
  const u = _universeMap.get(universeId);
  return u ? u.personalities.map(p => p.slug) : [];
}

/** Get all UGC universe IDs. */
export function getUgcUniverseIds(): string[] {
  return UGC_UNIVERSES.map(u => u.id);
}
