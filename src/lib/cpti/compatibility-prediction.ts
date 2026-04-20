/**
 * CPTI compatibility prediction (E7 lite).
 * ─────────────────────────────────────────────────────────────
 * Sprint 2 polish (2026-04-19).
 *
 * Given the user's own dimension profile, predict which other CPTI
 * personality types they're most likely to form a high-compatibility
 * relationship with, and which relationship type that would be.
 *
 * Used on the result page to drive curiosity:
 *   "你最容易和「妈系大女主（mama）」组成「妈系恋人（PARENT）」 →"
 */

import { CPTI_PERSONALITY_TYPES } from './personalities';
import { CPTI_DIMENSIONS } from './dimensions';
import type { DimensionLevel } from './dimensions';
import { matchRelationship } from './relationship-matching';
import type { RelationshipResult } from './relationship-matching';
import type { CptiDimensionScore } from './scoring';
import type { CptiPersonalityType } from './personalities';

export interface CompatibilityPrediction {
  partner: CptiPersonalityType;
  result: RelationshipResult;
}

function levelToScore(l: DimensionLevel): number {
  return l === 'H' ? 3 : l === 'M' ? 2 : 1;
}

function profileToDims(profile: Record<string, DimensionLevel>): CptiDimensionScore[] {
  return CPTI_DIMENSIONS.map((d) => {
    const level = profile[d.id] ?? 'M';
    return {
      id: d.id,
      score: levelToScore(level),
      level,
    };
  });
}

/**
 * Compute the top-N personalities the user is most compatible with.
 * Excludes the user's own personality slug.
 */
export function predictTopCompatible(
  userDims: CptiDimensionScore[],
  options: { limit?: number; excludeSlug?: string } = {},
): CompatibilityPrediction[] {
  const limit = options.limit ?? 3;
  const exclude = options.excludeSlug;

  const candidates = CPTI_PERSONALITY_TYPES.filter((p) => p.slug !== exclude);

  const scored = candidates.map((partner) => {
    const partnerDims = profileToDims(partner.profile);
    const result = matchRelationship(userDims, partnerDims);
    return { partner, result };
  });

  scored.sort((a, b) => b.result.compatibility - a.result.compatibility);

  return scored.slice(0, limit);
}
