import type { DimensionLevel } from './dimensions';
import { DRUNK_DIMENSIONS } from './dimensions';
import { DRUNK_PERSONA_TYPES } from './personas';
import type { DrunkPersonaType } from './personas';
import type { DrunkQuestion } from './questions';
import { DRUNK_QUESTIONS } from './questions';
import { sampleQuestionsByDimension } from '../question-pool';
import { buildResultDiagnostics, type ResultDiagnostics } from '../result-diagnostics';

export type Answer = 1 | 2 | 3;

export interface DrunkDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface DrunkTestResult {
  persona: DrunkPersonaType;
  dimensions: DrunkDimensionScore[];
  diagnostics: ResultDiagnostics;
}

/* ── Seeded PRNG (mulberry32) ── */
function mulberry32(seed: number) {
  return () => {
    let a = seed;
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick 10 questions from the bank:
 *   2 per dimension, seeded by a random value per session.
 *   Seeded by a random value per session (not date-based).
 */
export function getDrunkQuestions(seed?: number): DrunkQuestion[] {
  const s = seed ?? Math.floor(Math.random() * 1_000_000);
  const rand = mulberry32(s);

  return sampleQuestionsByDimension(DRUNK_QUESTIONS, 2, { random: rand });
}

/* ── Scoring ── */
function getScore(answer: Answer, reversed: boolean): number {
  if (reversed) return 4 - answer;
  return answer;
}

function toLevel(score: number): DimensionLevel {
  if (score >= 2.34) return 'H';
  if (score >= 1.67) return 'M';
  return 'L';
}

export function calculateDrunkResult(
  answers: Map<number, Answer>,
  questions: DrunkQuestion[],
): DrunkTestResult {
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  const dimensions: DrunkDimensionScore[] = DRUNK_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  const persona = matchDrunkPersona(dimensions);
  const diagnostics = buildResultDiagnostics({
    answers,
    questions,
    dimensions: DRUNK_DIMENSIONS,
    dimensionScores: dimensions,
    candidates: DRUNK_PERSONA_TYPES,
    matchedSlug: persona.slug,
  });

  return { persona, dimensions, diagnostics };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchDrunkPersona(dimensions: DrunkDimensionScore[]): DrunkPersonaType {
  let bestMatch = DRUNK_PERSONA_TYPES[0];
  let bestDist = Infinity;

  for (const p of DRUNK_PERSONA_TYPES) {
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

export function normalizeDrunkScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
