import type { DimensionLevel } from './dimensions';
import { SOULTI_DIMENSIONS } from './dimensions';
import { SOULTI_PERSONALITY_TYPES } from './personalities';
import type { SoultiPersonalityType } from './personalities';
import type { SoultiQuestion } from './questions';

export type Answer = 1 | 2 | 3;

export interface SoultiDimensionScore {
  id: string;
  score: number;
  level: DimensionLevel;
}

export interface SoultiTestResult {
  personality: SoultiPersonalityType;
  dimensions: SoultiDimensionScore[];
}

/** Per-act (layered) personality result for the "three mirrors" feature */
export interface SoultiLayeredResult {
  /** Overall result (same as SoultiTestResult) */
  overall: { slug: string; code: string; dimensions: SoultiDimensionScore[] };
  /** Act 1 — 白天的你 */
  daySelf: { slug: string; code: string; dimensions: SoultiDimensionScore[] };
  /** Act 2 — 深夜的你 */
  nightSelf: { slug: string; code: string; dimensions: SoultiDimensionScore[] };
  /** Act 3 — 梦里的你 (fewer questions, used as tendency signal) */
  dreamTendency: { slug: string; code: string; dimensions: SoultiDimensionScore[] };
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
 * Build a 5-letter axis code from dimension averages.
 *   J1 >= 2.0 → T (涌), else S (静)
 *   J2 >= 2.0 → R (根), else W (风)
 *   J3 >= 2.0 → O (融), else B (壁)
 *   J4 >= 2.0 → F (焰), else E (烬)
 *   J5 >= 2.0 → G (生), else K (矿)
 */
function buildCode(dimAvg: Map<string, number>): string {
  const j1 = dimAvg.get('J1') ?? 2;
  const j2 = dimAvg.get('J2') ?? 2;
  const j3 = dimAvg.get('J3') ?? 2;
  const j4 = dimAvg.get('J4') ?? 2;
  const j5 = dimAvg.get('J5') ?? 2;

  return (
    (j1 >= 2.0 ? 'T' : 'S') +
    (j2 >= 2.0 ? 'R' : 'W') +
    (j3 >= 2.0 ? 'O' : 'B') +
    (j4 >= 2.0 ? 'F' : 'E') +
    (j5 >= 2.0 ? 'G' : 'K')
  );
}

function codeDistance(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

export function calculateSoultiResult(
  answers: Map<number, Answer>,
  questions: SoultiQuestion[],
): SoultiTestResult {
  // Collect scores per dimension
  const dimScores = new Map<string, number[]>();
  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);
    const arr = dimScores.get(q.dimension) ?? [];
    arr.push(s);
    dimScores.set(q.dimension, arr);
  }

  // Average per dimension
  const dimAvg = new Map<string, number>();
  const dimensions: SoultiDimensionScore[] = SOULTI_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    dimAvg.set(d.id, avg);
    return { id: d.id, score: avg, level: toLevel(avg) };
  });

  // Build code and try exact match
  const code = buildCode(dimAvg);
  let personality = SOULTI_PERSONALITY_TYPES.find(p => p.code === code);

  // Fallback: find nearest code by Hamming distance
  if (!personality) {
    let bestDist = Infinity;
    for (const p of SOULTI_PERSONALITY_TYPES) {
      const dist = codeDistance(code, p.code);
      if (dist < bestDist) {
        bestDist = dist;
        personality = p;
      }
    }
  }

  return { personality: personality ?? SOULTI_PERSONALITY_TYPES[0], dimensions };
}

export function normalizeSoultiScore(score: number): number {
  return Math.round(((score - 1) / 2) * 100);
}

// ── Helpers shared by layered scoring ──────────────────────────────────

function computeDimensions(
  dimScores: Map<string, number[]>,
): { dimensions: SoultiDimensionScore[]; dimAvg: Map<string, number> } {
  const dimAvg = new Map<string, number>();
  const dimensions: SoultiDimensionScore[] = SOULTI_DIMENSIONS.map(d => {
    const scores = dimScores.get(d.id) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    dimAvg.set(d.id, avg);
    return { id: d.id, score: avg, level: toLevel(avg) };
  });
  return { dimensions, dimAvg };
}

function resolveSlug(dimAvg: Map<string, number>): string {
  const code = buildCode(dimAvg);
  let personality = SOULTI_PERSONALITY_TYPES.find(p => p.code === code);
  if (!personality) {
    let bestDist = Infinity;
    for (const p of SOULTI_PERSONALITY_TYPES) {
      const dist = codeDistance(code, p.code);
      if (dist < bestDist) {
        bestDist = dist;
        personality = p;
      }
    }
  }
  return (personality ?? SOULTI_PERSONALITY_TYPES[0]).slug;
}

/**
 * Calculate per-act (layered) results alongside the overall result.
 * This powers the "three mirrors" feature: 白天 / 深夜 / 梦里.
 */
export function calculateSoultiLayeredResult(
  answers: Map<number, Answer>,
  questions: SoultiQuestion[],
): SoultiLayeredResult {
  // Bucket scores by act AND dimension
  const actDimScores = new Map<number, Map<string, number[]>>(); // act → dim → scores
  const allDimScores = new Map<string, number[]>();

  for (const q of questions) {
    const a = answers.get(q.id);
    if (a === undefined) continue;
    const s = getScore(a, q.reversed);

    // Per-act bucket
    if (!actDimScores.has(q.act)) actDimScores.set(q.act, new Map());
    const actBucket = actDimScores.get(q.act)!;
    const arr = actBucket.get(q.dimension) ?? [];
    arr.push(s);
    actBucket.set(q.dimension, arr);

    // Overall bucket
    const allArr = allDimScores.get(q.dimension) ?? [];
    allArr.push(s);
    allDimScores.set(q.dimension, allArr);
  }

  function buildLayer(bucket: Map<string, number[]>) {
    const { dimensions, dimAvg } = computeDimensions(bucket);
    const code = buildCode(dimAvg);
    const slug = resolveSlug(dimAvg);
    return { slug, code, dimensions };
  }

  const overall = buildLayer(allDimScores);
  const daySelf = buildLayer(actDimScores.get(1) ?? new Map());
  const nightSelf = buildLayer(actDimScores.get(2) ?? new Map());
  const dreamTendency = buildLayer(actDimScores.get(3) ?? new Map());

  return { overall, daySelf, nightSelf, dreamTendency };
}

// ── Tear Rate (撕裂度) ──────────────────────────────────────────────────
//
// 计算 "白天的你" 和 "深夜的你" 之间的距离。
// 基于两个维度向量的欧氏距离归一化到 [0, 100]。
//
// 语义：
//   - 0-20%   高度一致 · "白天和深夜的你几乎是同一个人"
//   - 20-50%  局部错位 · "在某些轴上你白天和深夜判若两人"
//   - 50-80%  明显撕裂 · "你的白天和深夜是两种不同的保护模式"
//   - 80-100% 极度撕裂 · "你在白天和深夜之间反复横跳"

export interface TearRateInfo {
  percent: number;              // 0-100 integer
  level: 'aligned' | 'partial' | 'split' | 'extreme';
  label: string;                // 一致 / 局部错位 / 明显撕裂 / 极度撕裂
  narrative: string;            // 一句话描述
  divergentAxes: string[];      // 日夜向量差异最大的轴 ID（J1-J5），用于高亮
}

export function calculateTearRate(layered: SoultiLayeredResult): TearRateInfo {
  const day = layered.daySelf.dimensions;
  const night = layered.nightSelf.dimensions;

  // 按 id 取值
  const dayMap = new Map(day.map(d => [d.id, d.score]));
  const nightMap = new Map(night.map(d => [d.id, d.score]));

  // 每轴差值（绝对值）
  const diffs: { id: string; delta: number }[] = [];
  let sumSq = 0;
  const allIds = new Set([...dayMap.keys(), ...nightMap.keys()]);
  for (const id of allIds) {
    const a = dayMap.get(id) ?? 2;
    const b = nightMap.get(id) ?? 2;
    const delta = Math.abs(a - b);
    diffs.push({ id, delta });
    sumSq += delta * delta;
  }

  // 归一化到 0-100
  // 每轴最大差距=2（从1到3），5轴 → sqrt(5*4)=sqrt(20)≈4.47
  const maxEuclid = Math.sqrt(allIds.size * 4);
  const euclid = Math.sqrt(sumSq);
  const percent = Math.round((euclid / maxEuclid) * 100);

  // 取差异最大的 2 个轴
  const divergentAxes = diffs
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2)
    .filter(d => d.delta > 0.4)
    .map(d => d.id);

  let level: TearRateInfo['level'];
  let label: string;
  let narrative: string;

  if (percent < 20) {
    level = 'aligned';
    label = '高度一致';
    narrative = '白天的你和深夜的你几乎是同一个人——这份完整性，本身就很珍贵。';
  } else if (percent < 50) {
    level = 'partial';
    label = '局部错位';
    narrative = '在大多数时刻你是稳定的，但某些轴上，白天和深夜的你有着不同的答案。';
  } else if (percent < 80) {
    level = 'split';
    label = '明显撕裂';
    narrative = '白天和深夜的你，是两种不同的保护模式在轮班。你不是分裂——你是在用不同的方式活过每一天。';
  } else {
    level = 'extreme';
    label = '极度撕裂';
    narrative = '白天和深夜的你判若两人。这种撕裂一定很累，但它也是你最真实的样子——你从来不是单一的。';
  }

  return { percent, level, label, narrative, divergentAxes };
}

