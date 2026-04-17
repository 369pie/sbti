/**
 * First Look · Scoring
 *
 * Aggregates AxisVector deltas from answers, normalises, picks best archetype
 * via euclidean distance against each archetype's vector, then computes deep-dive
 * match percentages for the three routing targets (WTF / SoulTI / Mysti).
 */

import { FIRST_LOOK_ARCHETYPES, type DeepDiveTarget, type FirstLookArchetype } from './archetypes';
import { FIRST_LOOK_QUESTIONS, type AxisVector, type FirstLookAxis } from './questions';

export type FirstLookAnswerMap = Map<number, 'A' | 'B' | 'C'>;

export interface FirstLookResult {
  archetype: FirstLookArchetype;
  /** Normalised 0-3 axis scores for the user */
  vector: AxisVector;
  /** Ranked deep-dive matches with 0-100 percentages */
  deepDive: Array<{ target: DeepDiveTarget; match: number }>;
  /** ISO timestamp for sessionStorage freshness */
  completedAt: string;
}

const AXES: FirstLookAxis[] = ['edge', 'emotion', 'mystery'];

function zeroVector(): AxisVector {
  return { edge: 0, emotion: 0, mystery: 0 };
}

/** Aggregate all answer deltas into a raw vector (uncapped). */
export function aggregateVector(answers: FirstLookAnswerMap): AxisVector {
  const v = zeroVector();
  for (const q of FIRST_LOOK_QUESTIONS) {
    const key = answers.get(q.id);
    if (!key) continue;
    const option = q.options.find(o => o.key === key);
    if (!option) continue;
    for (const axis of AXES) {
      v[axis] += option.delta[axis];
    }
  }
  return v;
}

/** Normalise axes to 0-3 for comparison with archetype vectors. */
function normalise(raw: AxisVector): AxisVector {
  const max = Math.max(1, raw.edge, raw.emotion, raw.mystery);
  return {
    edge: (raw.edge / max) * 3,
    emotion: (raw.emotion / max) * 3,
    mystery: (raw.mystery / max) * 3,
  };
}

function distance(a: AxisVector, b: AxisVector): number {
  return Math.sqrt(
    (a.edge - b.edge) ** 2 + (a.emotion - b.emotion) ** 2 + (a.mystery - b.mystery) ** 2,
  );
}

/** Pick best-matching archetype (smallest euclidean distance). Rarity used as tiebreaker — prefer rarer when tied. */
function pickArchetype(vec: AxisVector): FirstLookArchetype {
  const rarityRank: Record<'S' | 'A' | 'B' | 'C', number> = { S: 3, A: 2, B: 1, C: 0 };
  let best: FirstLookArchetype = FIRST_LOOK_ARCHETYPES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const a of FIRST_LOOK_ARCHETYPES) {
    const dist = distance(vec, a.vector);
    if (
      dist < bestDist - 1e-9 ||
      (Math.abs(dist - bestDist) < 1e-9 && rarityRank[a.rarity] > rarityRank[best.rarity])
    ) {
      best = a;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * Compute a 0-100 match percentage per deep-dive target.
 * Each target aligns with one dominant axis:
 *  - WTF     → edge
 *  - SoulTI  → emotion
 *  - Mysti   → mystery
 * We normalise the user's axis magnitude (0-3 range) against its maximum, then
 * stretch the score across 45-98 so every user sees a primary (>70%) and two
 * supporting options (>30%).
 */
function computeDeepDive(vec: AxisVector): Array<{ target: DeepDiveTarget; match: number }> {
  const rawByTarget: Record<DeepDiveTarget, number> = {
    wtf: vec.edge,
    soulti: vec.emotion,
    mysti: vec.mystery,
  };
  const maxRaw = Math.max(1, rawByTarget.wtf, rawByTarget.soulti, rawByTarget.mysti);

  const results = (Object.keys(rawByTarget) as DeepDiveTarget[]).map(target => {
    const ratio = rawByTarget[target] / maxRaw; // 0..1
    const pct = Math.round(45 + ratio * 53); // 45..98
    return { target, match: Math.max(32, Math.min(98, pct)) };
  });

  results.sort((a, b) => b.match - a.match);
  return results;
}

export function computeFirstLookResult(answers: FirstLookAnswerMap): FirstLookResult {
  const raw = aggregateVector(answers);
  const normalised = normalise(raw);
  const archetype = pickArchetype(normalised);
  const deepDive = computeDeepDive(normalised);
  return {
    archetype,
    vector: normalised,
    deepDive,
    completedAt: new Date().toISOString(),
  };
}
