import type { DimensionLevel } from './dimensions';
import { IDENTIFY_DIMENSIONS } from './dimensions';
import { IDENTIFY_PERSONA_TYPES } from './personas';
import type { IdentifyPersonaType } from './personas';
import type { IdentifyQuestion } from './questions';
import { IDENTIFY_QUESTIONS } from './questions';
import { sampleQuestionsByDimension } from '../question-pool';
import { buildResultDiagnostics, type ResultDiagnostics } from '../result-diagnostics';

export type Answer = 1 | 2 | 3;

export interface IdentifyDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface IdentifyTestResult {
  persona: IdentifyPersonaType;
  dimensions: IdentifyDimensionScore[];
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
 * Pick 10 questions (2 per dimension) from the bank of 20.
 */
export function getIdentifyQuestions(seed?: number): IdentifyQuestion[] {
  const s = seed ?? Math.floor(Math.random() * 1_000_000);
  const rand = mulberry32(s);
  return sampleQuestionsByDimension(IDENTIFY_QUESTIONS, 2, { random: rand });
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

export function calculateIdentifyResult(
  answers: Map<number, Answer>,
  questions: IdentifyQuestion[],
): IdentifyTestResult {
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  const dimensions: IdentifyDimensionScore[] = IDENTIFY_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  const persona = matchIdentifyPersona(dimensions);
  const diagnostics = buildResultDiagnostics({
    answers,
    questions,
    dimensions: IDENTIFY_DIMENSIONS,
    dimensionScores: dimensions,
    candidates: IDENTIFY_PERSONA_TYPES,
    matchedSlug: persona.slug,
  });

  return { persona, dimensions, diagnostics };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchIdentifyPersona(dimensions: IdentifyDimensionScore[]): IdentifyPersonaType {
  let bestMatch = IDENTIFY_PERSONA_TYPES[0];
  let bestDist = Infinity;

  for (const candidate of IDENTIFY_PERSONA_TYPES) {
    let dist = 0;
    for (const dim of dimensions) {
      const expected = levelToNum(candidate.profile[dim.id] as DimensionLevel);
      const actual = dim.score;
      dist += (expected - actual) ** 2;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = candidate;
    }
  }
  return bestMatch;
}
