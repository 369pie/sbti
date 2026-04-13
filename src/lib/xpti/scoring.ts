import type { DimensionLevel } from './dimensions';
import { XPTI_DIMENSIONS } from './dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiPersonalityByCode } from './personalities';
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

/**
 * XPTI uses a 4-axis binary system:
 * - Each axis average >= 2.0 → pole A letter, else → pole B letter
 * - Concatenate the 4 letters → personality code (e.g. DSPF)
 * - Look up the personality by code
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

  const dimensions: XptiDimensionScore[] = XPTI_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  // Build 4-letter code from axis scores
  const code = XPTI_DIMENSIONS.map(dim => {
    const ds = dimensions.find(d => d.id === dim.id);
    const avg = ds?.score ?? 2;
    return avg >= 2.0 ? dim.poleA : dim.poleB;
  }).join('');

  // Look up personality by code, fallback to distance matching
  const personality = getXptiPersonalityByCode(code) ?? matchXptiPersonality(dimensions);

  return { personality, dimensions, code };
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
