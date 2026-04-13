import type { DimensionLevel } from './dimensions';
import { DIMENSIONS } from './dimensions';
import { PERSONALITY_TYPES } from './personalities';
import type { PersonalityType } from './personalities';
import type { Question } from './questions';

export type Answer = 1 | 2 | 3; // 不认同 | 中立 | 认同

export interface DimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface TestResult {
  personality: PersonalityType;
  dimensions: DimensionScore[];
  drinkTriggered: boolean;
}

function getScore(answer: Answer, reversed: boolean): number {
  if (reversed) return 4 - answer;
  return answer;
}

function toLevel(score: number): DimensionLevel {
  if (score >= 2.5) return 'H';
  if (score >= 1.5) return 'M';
  return 'L';
}

export function calculateResult(
  answers: Map<number, Answer>,
  questions: Question[]
): TestResult {
  const drinkTrigger = questions.find(q => q.isDrinkTrigger);
  const drinkTriggered = drinkTrigger
    ? (answers.get(drinkTrigger.id) ?? 0) >= 3
    : false;

  // Aggregate scores by dimension
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    if (q.isDrinkBranch && !drinkTriggered) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  // Calculate average per dimension
  const dimensions: DimensionScore[] = DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  // Match to personality type
  const personality = matchPersonality(dimensions, drinkTriggered);

  return { personality, dimensions, drinkTriggered };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchPersonality(
  dimensions: DimensionScore[],
  drinkTriggered: boolean
): PersonalityType {
  let bestMatch = PERSONALITY_TYPES[0];
  let bestDist = Infinity;

  const candidates = drinkTriggered
    ? PERSONALITY_TYPES
    : PERSONALITY_TYPES.filter(p => !p.isSpecial || p.slug !== 'drunk');

  for (const p of candidates) {
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

// Normalize score for radar chart (0-100)
export function normalizeScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
