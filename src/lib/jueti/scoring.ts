import type { DimensionLevel } from './dimensions';
import { JUETI_DIMENSIONS } from './dimensions';
import { JUETI_PERSONALITY_TYPES } from './personalities';
import type { JuetiPersonalityType } from './personalities';
import type { JuetiQuestion } from './questions';

export type Answer = 1 | 2 | 3;

export interface JuetiDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface JuetiTestResult {
  personality: JuetiPersonalityType;
  dimensions: JuetiDimensionScore[];
}

function toLevel(score: number): DimensionLevel {
  if (score >= 2.34) return 'H';
  if (score >= 1.67) return 'M';
  return 'L';
}

/**
 * Build a 4-letter axis code from dimension averages.
 *   J1 >= 2.0 → T (涌), else S (静)
 *   J2 >= 2.0 → R (根), else W (风)
 *   J3 >= 2.0 → O (融), else B (壁)
 *   J4 >= 2.0 → F (焰), else E (烬)
 */
function buildCode(dimAvg: Map<string, number>): string {
  const j1 = dimAvg.get('J1') ?? 2;
  const j2 = dimAvg.get('J2') ?? 2;
  const j3 = dimAvg.get('J3') ?? 2;
  const j4 = dimAvg.get('J4') ?? 2;

  return (
    (j1 >= 2.0 ? 'T' : 'S') +
    (j2 >= 2.0 ? 'R' : 'W') +
    (j3 >= 2.0 ? 'O' : 'B') +
    (j4 >= 2.0 ? 'F' : 'E')
  );
}

function codeDistance(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

export function calculateJuetiResult(
  answers: Map<number, Answer>,
  questions: JuetiQuestion[],
): JuetiTestResult {
  // Collect scores per dimension
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(a);
    dimScores.set(q.dimension, arr);
  }

  // Average per dimension
  const dimAvg = new Map<string, number>();
  const dimensions: JuetiDimensionScore[] = JUETI_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    dimAvg.set(d.id, avg);
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  // Build code and try exact match
  const code = buildCode(dimAvg);
  let personality = JUETI_PERSONALITY_TYPES.find(p => p.code === code);

  // Fallback: find nearest code by Hamming distance
  if (!personality) {
    let bestDist = Infinity;
    for (const p of JUETI_PERSONALITY_TYPES) {
      const dist = codeDistance(code, p.code);
      if (dist < bestDist) {
        bestDist = dist;
        personality = p;
      }
    }
  }

  return { personality: personality ?? JUETI_PERSONALITY_TYPES[0], dimensions };
}

export function normalizeJuetiScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}
