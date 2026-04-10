import type { DimensionLevel } from './dimensions';
import { LOVE_DIMENSIONS } from './dimensions';
import { LOVE_PERSONALITY_TYPES } from './personalities';
import type { LovePersonalityType } from './personalities';
import type { LoveQuestion } from './questions';

export type Answer = 1 | 2 | 3;

export interface LoveDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface LoveTestResult {
  personality: LovePersonalityType;
  dimensions: LoveDimensionScore[];
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

export function calculateLoveResult(
  answers: Map<number, Answer>,
  questions: LoveQuestion[]
): LoveTestResult {
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  const dimensions: LoveDimensionScore[] = LOVE_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  const personality = matchLovePersonality(dimensions);

  return { personality, dimensions };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchLovePersonality(
  dimensions: LoveDimensionScore[]
): LovePersonalityType {
  let bestMatch = LOVE_PERSONALITY_TYPES[0];
  let bestDist = Infinity;

  for (const p of LOVE_PERSONALITY_TYPES) {
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

export function normalizeLoveScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
