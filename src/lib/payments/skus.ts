/**
 * Module-level light-paywall SKU helpers (2026-04-20).
 *
 * The 5 module deep SKUs live inside the existing `MystiSku` union (extended
 * in `lib/mysti/unlock.ts`) so they reuse the entire payment + entitlement
 * pipeline (xunhupay, ALL_SKUS whitelist, recordUnlock, isUnlocked). This
 * file just adds typed convenience helpers and a uniform `${universe}:${id}`
 * resourceId format.
 */

import type { MystiSku } from '@/lib/mysti/unlock';

/** Module-prefixed deep SKUs introduced 2026-04-20. */
export type ModuleDeepSku =
  | 'wtfti-deep-pantheon'
  | 'soulti-deep-mirror'
  | 'cpti-deep-relationship'
  | 'xpti-deep-xp'
  | 'wtfcard-collector';

/** Universe namespace used for resourceId prefixes + analytics. */
export type ModuleUniverse =
  | 'wtfti'
  | 'soulti'
  | 'cpti'
  | 'xpti'
  | 'wtfcard';

/** Each universe's primary deep SKU. */
export const DEEP_SKU_BY_UNIVERSE: Record<ModuleUniverse, ModuleDeepSku> = {
  wtfti: 'wtfti-deep-pantheon',
  soulti: 'soulti-deep-mirror',
  cpti: 'cpti-deep-relationship',
  xpti: 'xpti-deep-xp',
  wtfcard: 'wtfcard-collector',
};

/** Full ordered list of module deep SKUs. */
export const MODULE_DEEP_SKUS: ModuleDeepSku[] = [
  'wtfti-deep-pantheon',
  'soulti-deep-mirror',
  'cpti-deep-relationship',
  'xpti-deep-xp',
  'wtfcard-collector',
];

/** Build a stable resourceId — `${universe}:${slug}`. */
export function buildResourceId(universe: ModuleUniverse, slug: string): string {
  const safe = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 48);
  return `${universe}:${safe || 'default'}`;
}

/** Type guard so callers can narrow MystiSku into a deep-module SKU. */
export function isModuleDeepSku(sku: MystiSku | string): sku is ModuleDeepSku {
  return MODULE_DEEP_SKUS.includes(sku as ModuleDeepSku);
}
