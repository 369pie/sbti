/**
 * Unified rarity inference for the gallery (W3).
 *
 * Source of truth for SBTI slugs is `personalities.getRarity()` (legendary/epic/...).
 * Other tabs (WTFTI, IP universes, theme tests) only carry the lightweight
 * `item.rarity = { label, color, bgColor }`. We map both into a 5-tier scale:
 *
 *   N → R → SR → SSR → UR
 *
 * Used for:
 *   - rarity sort order in Binder/Pile/Reel views
 *   - "Holo Hunter" set-bonus check
 *   - UR-only ambient holo glow
 */

export type RarityTier = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export const RARITY_ORDER: RarityTier[] = ['N', 'R', 'SR', 'SSR', 'UR'];

export const RARITY_LABEL: Record<RarityTier, string> = {
  N: '常见',
  R: '稀有',
  SR: '高稀有',
  SSR: '超稀有',
  UR: '传说',
};

export const RARITY_COLOR: Record<RarityTier, { fg: string; bg: string; border: string }> = {
  N:   { fg: '#9A908A', bg: 'rgba(154,144,138,0.10)', border: 'rgba(154,144,138,0.30)' },
  R:   { fg: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.35)' },
  SR:  { fg: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)' },
  SSR: { fg: '#a78bfa', bg: 'rgba(167,139,250,0.14)', border: 'rgba(167,139,250,0.40)' },
  UR:  { fg: '#fbbf24', bg: 'rgba(251,191,36,0.16)',  border: 'rgba(251,191,36,0.45)' },
};

/** Rough mapping from the legacy `personalities.RarityTier` to the unified 5-tier. */
const LEGACY_TIER_MAP: Record<string, RarityTier> = {
  legendary: 'UR',
  epic:      'SSR',
  rare:      'SR',
  uncommon:  'R',
  common:    'N',
};

/** Map an item's `rarity.label` (e.g. "SR", "UR", "SSR") to a tier. */
function inferFromLabel(label?: string): RarityTier | null {
  if (!label) return null;
  const upper = label.toUpperCase().replace(/[^A-Z]/g, '');
  if (upper.includes('UR')) return 'UR';
  if (upper.includes('SSR')) return 'SSR';
  if (upper.includes('SR')) return 'SR';
  if (upper === 'R' || upper === 'RARE') return 'R';
  if (upper === 'N' || upper === 'COMMON') return 'N';
  return null;
}

/** Resolve a unified rarity tier for any GalleryItem. */
export function getItemRarityTier(item: { slug: string; rarity?: { label: string }; isSpecial?: boolean }): RarityTier {
  // Hidden specials default to UR if nothing better.
  const fromLabel = inferFromLabel(item.rarity?.label);
  if (fromLabel) return fromLabel;
  if (item.isSpecial) return 'SSR';
  return 'N';
}

/** Map a legacy `personalities.RarityTier` ('legendary' | …) to a unified tier. */
export function fromLegacy(legacy: string): RarityTier {
  return LEGACY_TIER_MAP[legacy] ?? 'N';
}

/** Sort comparator: higher rarity first, then lexicographic by slug. */
export function compareRarityDesc(
  a: { slug: string; rarity?: { label: string }; isSpecial?: boolean },
  b: { slug: string; rarity?: { label: string }; isSpecial?: boolean },
): number {
  const ai = RARITY_ORDER.indexOf(getItemRarityTier(a));
  const bi = RARITY_ORDER.indexOf(getItemRarityTier(b));
  if (ai !== bi) return bi - ai;
  return a.slug.localeCompare(b.slug);
}

/** Whether a tier should get the "holo" treatment (animated foil + glow). */
export function isHoloTier(tier: RarityTier): boolean {
  return tier === 'SR' || tier === 'SSR' || tier === 'UR';
}
