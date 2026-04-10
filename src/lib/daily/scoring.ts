import type { DimensionLevel } from './dimensions';
import { DAILY_DIMENSIONS } from './dimensions';
import { DAILY_STATUS_TYPES } from './statuses';
import type { DailyStatusType } from './statuses';
import type { DailyQuestion } from './questions';
import { DAILY_QUESTIONS } from './questions';

export type Answer = 1 | 2 | 3;

export interface DailyDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface DailyTestResult {
  status: DailyStatusType;
  dimensions: DailyDimensionScore[];
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

/** Turn a Date into a deterministic integer seed (same day = same seed) */
function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * Pick today's 6 questions from the full bank:
 *   1 per dimension (5), then 1 bonus from the remaining pool.
 *   Order is shuffled with the same daily seed.
 */
export function getDailyQuestions(date?: Date): DailyQuestion[] {
  const seed = dateSeed(date ?? new Date());
  const rand = mulberry32(seed);

  // Group by dimension
  const byDim = new Map<string, DailyQuestion[]>();
  for (const q of DAILY_QUESTIONS) {
    const arr = byDim.get(q.dimension) ?? [];
    arr.push(q);
    byDim.set(q.dimension, [...arr]);
  }

  const dims = ['D1', 'D2', 'D3', 'D4', 'D5'];
  const picked: DailyQuestion[] = [];

  // 1 per dimension
  for (const dim of dims) {
    const pool = byDim.get(dim) ?? [];
    const idx = Math.floor(rand() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
    byDim.set(dim, pool);
  }

  // 1 bonus from remaining pool
  const remaining = dims.flatMap(d => byDim.get(d) ?? []);
  if (remaining.length > 0) {
    const idx = Math.floor(rand() * remaining.length);
    picked.push(remaining[idx]);
  }

  // Shuffle picked questions
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked;
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

export function calculateDailyResult(
  answers: Map<number, Answer>,
  questions: DailyQuestion[],
): DailyTestResult {
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  const dimensions: DailyDimensionScore[] = DAILY_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  const status = matchDailyStatus(dimensions);
  return { status, dimensions };
}

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function matchDailyStatus(dimensions: DailyDimensionScore[]): DailyStatusType {
  let bestMatch = DAILY_STATUS_TYPES[0];
  let bestDist = Infinity;

  for (const s of DAILY_STATUS_TYPES) {
    let dist = 0;
    for (const d of dimensions) {
      const targetLevel = s.profile[d.id];
      if (!targetLevel) continue;
      const targetNum = levelToNum(targetLevel);
      const diff = d.score - targetNum;
      dist += diff * diff;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = s;
    }
  }

  return bestMatch;
}

export function normalizeDailyScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
