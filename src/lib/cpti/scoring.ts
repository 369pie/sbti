import type { DimensionLevel } from './dimensions';
import { CPTI_DIMENSIONS } from './dimensions';
import { CPTI_PERSONALITY_TYPES } from './personalities';
import type { CptiPersonalityType } from './personalities';
import type { CptiQuestion } from './questions';

export type Answer = 1 | 2 | 3;

/** Minimum shape needed for score calculation. Works with both CptiQuestion and CptiPeerQuestion. */
export type ScoreableQuestion = Pick<CptiQuestion, 'id' | 'dimension' | 'reversed'>;

export interface CptiDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface CptiTestResult {
  personality: CptiPersonalityType;
  dimensions: CptiDimensionScore[];
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

export function calculateCptiResult(
  answers: Map<number, Answer>,
  questions: readonly ScoreableQuestion[]
): CptiTestResult {
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  const dimensions: CptiDimensionScore[] = CPTI_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  const personality = matchCptiPersonality(dimensions);

  return { personality, dimensions };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchCptiPersonality(
  dimensions: CptiDimensionScore[]
): CptiPersonalityType {
  let bestMatch = CPTI_PERSONALITY_TYPES[0];
  let bestDist = Infinity;

  for (const p of CPTI_PERSONALITY_TYPES) {
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

export function normalizeCptiScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
