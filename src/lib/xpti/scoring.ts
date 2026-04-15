import type { DimensionLevel } from './dimensions';
import { XPTI_PERSONALITY_TYPES } from './personalities';
import type { XptiPersonalityType } from './personalities';
import type { XptiQuestion } from './questions';

export type Answer = 1 | 2 | 3;

export interface XptiDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface XptiTestResult {
  personality: XptiPersonalityType;
  dimensions: XptiDimensionScore[];
  code: string;
}

function getScore(answer: Answer, reversed: boolean): number {
  if (reversed) return 4 - answer;
  return answer;
}

function toLevel(score: number): DimensionLevel {
  if (score >= 2.34) return 'H';
  if (score >= 1.67) return 'M';
  return 'L';
}

const XPTI_DIM_ORDER = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'] as const;

/**
 * 9-dimension scoring + distance-based personality matching.
 * No more 4-letter binary codes; we compute the average per dimension
 * then find the personality prototype with minimum Euclidean distance.
 */
export function calculateXptiResult(
  answers: Map<number, Answer>,
  questions: XptiQuestion[]
): XptiTestResult {
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  const dimensions: XptiDimensionScore[] = XPTI_DIM_ORDER.map(dimId => {
    const scores = dimScores.get(dimId) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: dimId, score: avg, level: toLevel(avg) };
  });

  const personality = matchXptiPersonality(dimensions);

  return { personality, dimensions, code: personality.code };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchXptiPersonality(
  dimensions: XptiDimensionScore[]
): XptiPersonalityType {
  let bestMatch = XPTI_PERSONALITY_TYPES[0];
  let bestDist = Infinity;

  for (const p of XPTI_PERSONALITY_TYPES) {
    let dist = 0;
    for (const d of dimensions) {
      const targetLevel = p.profile[d.id];
      if (!targetLevel) continue;
      const targetNum = levelToNum(targetLevel);
      const diff = d.score - targetNum;
      dist += diff * diff;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = p;
    }
  }

  return bestMatch;
}

export function normalizeXptiScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
