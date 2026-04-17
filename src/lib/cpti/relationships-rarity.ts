/**
 * CPTI Relationship Rarity (E-06)
 *
 * Adds a persistence-rate dimension on top of the tier system so the result
 * page, WTF Card v2, and pair-share cards can show a "S/A/B/C" badge.
 *
 * Distribution design (targets):
 *   S (legendary, 1-3% each): soul, twins, rivals, keeper         — 4 types → ~8%
 *   A (rare, 3-6% each):      united, sync, volcano, weirdos,
 *                             mirror, paradox, shield, glued       — 8 types → ~35%
 *   B (uncommon, 6-10% each): allies, mentor, parent, lovers,
 *                             homies, iceberg, free                — 7 types → ~50%
 *   C (common):                plastic, settled, party, inmate,
 *                              enemies, rookie                     — 6 types → balance
 */

import { CPTI_RELATIONSHIP_TYPES } from './relationships';

export type CptiRelationshipRarity = 'S' | 'A' | 'B' | 'C';

export interface CptiRelationshipRarityInfo {
  tier: CptiRelationshipRarity;
  label: string;
  color: string;
  bgColor: string;
  /** Estimated population share (%). */
  populationPct: number;
}

const RARITY_CONFIG: Record<CptiRelationshipRarity, Omit<CptiRelationshipRarityInfo, 'tier' | 'populationPct'>> = {
  S: { label: 'S · 极稀有', color: '#c9a96e', bgColor: 'rgba(201,169,110,0.14)' },
  A: { label: 'A · 稀有',   color: '#a855f7', bgColor: 'rgba(168,85,247,0.14)' },
  B: { label: 'B · 少见',   color: '#3b82f6', bgColor: 'rgba(59,130,246,0.14)' },
  C: { label: 'C · 常见',   color: '#64748b', bgColor: 'rgba(100,116,139,0.14)' },
};

/** Slug → rarity map. Rebalance carefully; copy changes flow to PairShare cards. */
const RARITY_MAP: Record<string, { tier: CptiRelationshipRarity; pct: number }> = {
  // S · 4 types
  soul:    { tier: 'S', pct: 2.0 },
  twins:   { tier: 'S', pct: 1.5 },
  rivals:  { tier: 'S', pct: 2.5 },
  keeper:  { tier: 'S', pct: 2.0 },

  // A · 8 types
  united:  { tier: 'A', pct: 3.5 },
  sync:    { tier: 'A', pct: 4.0 },
  volcano: { tier: 'A', pct: 4.5 },
  weirdos: { tier: 'A', pct: 4.0 },
  mirror:  { tier: 'A', pct: 4.5 },
  paradox: { tier: 'A', pct: 3.8 },
  shield:  { tier: 'A', pct: 4.2 },
  glued:   { tier: 'A', pct: 5.5 },

  // B · 7 types
  allies:  { tier: 'B', pct: 6.5 },
  mentor:  { tier: 'B', pct: 6.0 },
  parent:  { tier: 'B', pct: 7.5 },
  lovers:  { tier: 'B', pct: 8.5 },
  homies:  { tier: 'B', pct: 7.0 },
  iceberg: { tier: 'B', pct: 6.5 },
  free:    { tier: 'B', pct: 6.0 },

  // C · 6 types
  plastic: { tier: 'C', pct: 9.5 },
  settled: { tier: 'C', pct: 10.0 },
  party:   { tier: 'C', pct: 10.5 },
  inmate:  { tier: 'C', pct: 9.0 },
  enemies: { tier: 'C', pct: 8.5 },
  rookie:  { tier: 'C', pct: 11.0 },
};

export function getRelationshipRarity(slug: string): CptiRelationshipRarityInfo {
  const entry = RARITY_MAP[slug] ?? { tier: 'C' as CptiRelationshipRarity, pct: 10.0 };
  return { tier: entry.tier, populationPct: entry.pct, ...RARITY_CONFIG[entry.tier] };
}

/** Sanity check covered in unit context: every type has a rarity entry. */
export function auditRarityCoverage(): { covered: number; missing: string[] } {
  const missing = CPTI_RELATIONSHIP_TYPES
    .filter(r => !(r.slug in RARITY_MAP))
    .map(r => r.slug);
  return { covered: CPTI_RELATIONSHIP_TYPES.length - missing.length, missing };
}
