/**
 * Relationship matching algorithm — takes two CPTI dimension profiles and returns a relationship type.
 *
 * Algorithm:
 *   1. For each dimension, compute per-dimension gap and pattern (双高/双低/互补/一般)
 *   2. Aggregate pattern signals across 5 dimensions
 *   3. Rule tree → relationship slug
 *   4. Fallback: Euclidean distance to a relationship "signature" table
 */

import type { DimensionLevel } from './dimensions';
import type { CptiDimensionScore } from './scoring';
import { CPTI_RELATIONSHIP_TYPES, type CptiRelationshipType } from './relationships';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DimensionPair {
  id: string;              // C1..C5
  levelA: DimensionLevel;
  levelB: DimensionLevel;
  pattern: 'both-high' | 'both-mid' | 'both-low' | 'complement' | 'gap';
  gap: number;             // 0, 1, or 2
}

export interface RelationshipResult {
  relationship: CptiRelationshipType;
  pairs: DimensionPair[];
  compatibility: number;   // 0-100
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function levelNum(l: DimensionLevel): number {
  return l === 'H' ? 3 : l === 'M' ? 2 : 1;
}

function scoreToLevel(score: number): DimensionLevel {
  if (score >= 2.34) return 'H';
  if (score >= 1.67) return 'M';
  return 'L';
}

function classifyPair(a: DimensionLevel, b: DimensionLevel): DimensionPair['pattern'] {
  if (a === b) {
    if (a === 'H') return 'both-high';
    if (a === 'M') return 'both-mid';
    return 'both-low';
  }
  const diff = Math.abs(levelNum(a) - levelNum(b));
  if (diff === 2) return 'gap';       // H vs L = big gap
  return 'complement';                 // H-M or M-L = mild complement
}

// ─── Build dimension pairs ───────────────────────────────────────────────────

export function buildPairs(
  dimsA: CptiDimensionScore[],
  dimsB: CptiDimensionScore[],
): DimensionPair[] {
  const mapB = new Map(dimsB.map(d => [d.id, d]));

  return dimsA.map(da => {
    const db = mapB.get(da.id);
    const levelA = da.level;
    const levelB = db?.level ?? 'M';
    return {
      id: da.id,
      levelA,
      levelB,
      pattern: classifyPair(levelA, levelB),
      gap: Math.abs(levelNum(levelA) - levelNum(levelB)),
    };
  });
}

// ─── Signal aggregation ──────────────────────────────────────────────────────

interface Signals {
  bothHigh: string[];   // dimension ids where both are H
  bothLow: string[];    // dimension ids where both are L
  bothMid: string[];    // dimension ids where both are M
  complement: string[]; // mild complement (1 step)
  bigGap: string[];     // H vs L (2 steps)
  totalGap: number;     // sum of all gaps
}

function extractSignals(pairs: DimensionPair[]): Signals {
  const signals: Signals = {
    bothHigh: [], bothLow: [], bothMid: [], complement: [], bigGap: [], totalGap: 0,
  };
  for (const p of pairs) {
    if (p.pattern === 'both-high') signals.bothHigh.push(p.id);
    else if (p.pattern === 'both-low') signals.bothLow.push(p.id);
    else if (p.pattern === 'both-mid') signals.bothMid.push(p.id);
    else if (p.pattern === 'complement') signals.complement.push(p.id);
    else if (p.pattern === 'gap') signals.bigGap.push(p.id);
    signals.totalGap += p.gap;
  }
  return signals;
}

// ─── Rule tree ───────────────────────────────────────────────────────────────

type Rule = (pairs: DimensionPair[], sig: Signals) => string | null;

function dim(pairs: DimensionPair[], id: string): DimensionPair | undefined {
  return pairs.find(p => p.id === id);
}

const RULES: Rule[] = [
  // SOUL — 灵魂伴侣: ≥4 dims same level (at least 2 both-high)
  (_p, s) => (s.bothHigh.length + s.bothMid.length + s.bothLow.length >= 4 && s.bothHigh.length >= 2) ? 'soul' : null,

  // TWINS — 双子星: all 5 dims same level
  (_p, s) => (s.bothHigh.length + s.bothMid.length + s.bothLow.length === 5) ? 'twins' : null,

  // RIVALS — 相爱相杀: C1 both-high + C3 both-high + C5 complement/both-high
  (p, _s) => {
    const c1 = dim(p, 'C1'), c3 = dim(p, 'C3'), c5 = dim(p, 'C5');
    if (c1?.pattern === 'both-high' && c3?.pattern === 'both-high' &&
        (c5?.pattern === 'both-high' || c5?.pattern === 'complement')) return 'rivals';
    return null;
  },

  // ENEMIES — 塑料死敌: C1 both-high + C3 both-high + C5 low/gap
  (p, _s) => {
    const c1 = dim(p, 'C1'), c3 = dim(p, 'C3'), c5 = dim(p, 'C5');
    if (c1?.pattern === 'both-high' && c3?.pattern === 'both-high' &&
        (c5?.pattern === 'both-low' || c5?.pattern === 'gap')) return 'enemies';
    return null;
  },

  // LOVERS — 欢喜冤家: C3 both-high + C4 complement/both-high
  (p, _s) => {
    const c3 = dim(p, 'C3'), c4 = dim(p, 'C4');
    if (c3?.pattern === 'both-high' && (c4?.pattern === 'both-high' || c4?.pattern === 'complement')) return 'lovers';
    return null;
  },

  // VOLCANO — 活火山: C2 both-high + C3 both-high
  (p, _s) => {
    const c2 = dim(p, 'C2'), c3 = dim(p, 'C3');
    if (c2?.pattern === 'both-high' && c3?.pattern === 'both-high') return 'volcano';
    return null;
  },

  // PLASTIC — 塑料姐妹: C2 both-high + C5 both-low/gap
  (p, _s) => {
    const c2 = dim(p, 'C2'), c5 = dim(p, 'C5');
    if (c2?.pattern === 'both-high' && (c5?.pattern === 'both-low' || c5?.pattern === 'gap')) return 'plastic';
    return null;
  },

  // GLUED — 连体婴儿: C5 both-high + (C4 both-high || C2 both-high)
  (p, _s) => {
    const c5 = dim(p, 'C5'), c4 = dim(p, 'C4'), c2 = dim(p, 'C2');
    if (c5?.pattern === 'both-high' && (c4?.pattern === 'both-high' || c2?.pattern === 'both-high')) return 'glued';
    return null;
  },

  // SYNC — 心灵同步: C2 both-high + C5 both-high
  (p, _s) => {
    const c2 = dim(p, 'C2'), c5 = dim(p, 'C5');
    if (c2?.pattern === 'both-high' && c5?.pattern === 'both-high') return 'sync';
    return null;
  },

  // PARENT — 妈系恋人: C4 gap (one H one L)
  (p, _s) => {
    const c4 = dim(p, 'C4');
    if (c4?.pattern === 'gap') return 'parent';
    return null;
  },

  // MENTOR — 师徒恋人: C1 gap + C4 complement/gap
  (p, _s) => {
    const c1 = dim(p, 'C1'), c4 = dim(p, 'C4');
    if (c1?.pattern === 'gap' && (c4?.pattern === 'gap' || c4?.pattern === 'complement')) return 'mentor';
    return null;
  },

  // SHIELD — 铜墙铁壁: C1 gap + C4 gap (one is high-C1+high-C4, other low-C1+low-C4)
  (p, _s) => {
    const c1 = dim(p, 'C1'), c4 = dim(p, 'C4');
    if (c1?.pattern === 'gap' && c4?.pattern === 'gap') return 'shield';
    return null;
  },

  // MIRROR — 镜像CP: ≥3 complement/gap dimensions
  (_p, s) => (s.complement.length + s.bigGap.length >= 3) ? 'mirror' : null,

  // ALLIES — 战略同盟: C3 both-low + C1 complement + C4 complement
  (p, _s) => {
    const c3 = dim(p, 'C3'), c1 = dim(p, 'C1'), c4 = dim(p, 'C4');
    if (c3?.pattern === 'both-low' && c1?.pattern === 'complement' && c4?.pattern === 'complement') return 'allies';
    return null;
  },

  // SETTLED — 老夫老妻: C2 both-low + C3 both-low
  (p, _s) => {
    const c2 = dim(p, 'C2'), c3 = dim(p, 'C3');
    if (c2?.pattern === 'both-low' && c3?.pattern === 'both-low') return 'settled';
    return null;
  },

  // ICEBERG — 冰山组合: C2 both-low + C3 both-low (alternative: gap in C5)
  (p, _s) => {
    const c2 = dim(p, 'C2'), c3 = dim(p, 'C3'), c5 = dim(p, 'C5');
    if ((c2?.pattern === 'both-low' || c2?.pattern === 'complement') &&
        (c3?.pattern === 'both-low') && c5?.pattern === 'gap') return 'iceberg';
    return null;
  },

  // FREE — 自由联邦: C5 both-low
  (p, _s) => {
    const c5 = dim(p, 'C5');
    if (c5?.pattern === 'both-low') return 'free';
    return null;
  },

  // PARTY — 酒肉朋友: C2 complement/both-high + C4 both-low + C5 low/complement
  (p, _s) => {
    const c2 = dim(p, 'C2'), c4 = dim(p, 'C4'), c5 = dim(p, 'C5');
    if ((c2?.pattern === 'both-high' || c2?.pattern === 'complement') &&
        c4?.pattern === 'both-low' &&
        (c5?.pattern === 'both-low' || c5?.pattern === 'complement')) return 'party';
    return null;
  },

  // INMATE — 狱友: C3 complement + C4 complement + low C5
  (p, _s) => {
    const c3 = dim(p, 'C3'), c4 = dim(p, 'C4'), c5 = dim(p, 'C5');
    if (c3?.pattern === 'complement' && c4?.pattern === 'complement' &&
        (c5?.pattern === 'both-low' || c5?.pattern === 'complement')) return 'inmate';
    return null;
  },

  // HOMIES — 铁磁兄弟: C4 both-high + C5 both-low
  (p, _s) => {
    const c4 = dim(p, 'C4'), c5 = dim(p, 'C5');
    if (c4?.pattern === 'both-high' && c5?.pattern === 'both-low') return 'homies';
    return null;
  },

  // UNITED — 命运共同体: C4 both-high + C5 both-high
  (p, _s) => {
    const c4 = dim(p, 'C4'), c5 = dim(p, 'C5');
    if (c4?.pattern === 'both-high' && c5?.pattern === 'both-high') return 'united';
    return null;
  },

  // KEEPER — 宝藏搭档: C4 both-high + C3 both-low
  (p, _s) => {
    const c4 = dim(p, 'C4'), c3 = dim(p, 'C3');
    if (c4?.pattern === 'both-high' && c3?.pattern === 'both-low') return 'keeper';
    return null;
  },

  // WEIRDOS — 怪咖联盟: many big gaps (≥2 gap dims)
  (_p, s) => (s.bigGap.length >= 2) ? 'weirdos' : null,

  // PARADOX — 矛盾体情侣: total gap ≥6
  (_p, s) => (s.totalGap >= 6) ? 'paradox' : null,

  // ROOKIE — 恋爱新手村: ≥3 both-mid
  (_p, s) => (s.bothMid.length >= 3) ? 'rookie' : null,
];

// ─── Fallback: Euclidean distance matching ───────────────────────────────────

/** Relationship type "signatures" — typical dimension pattern */
const RELATIONSHIP_SIGNATURES: Record<string, { A: DimensionLevel[]; B: DimensionLevel[] }> = {
  soul:    { A: ['H', 'H', 'M', 'H', 'H'], B: ['H', 'H', 'M', 'H', 'H'] },
  plastic: { A: ['M', 'H', 'L', 'L', 'L'], B: ['M', 'H', 'L', 'L', 'L'] },
  settled: { A: ['M', 'L', 'L', 'M', 'M'], B: ['M', 'L', 'L', 'M', 'M'] },
  party:   { A: ['M', 'H', 'M', 'L', 'L'], B: ['M', 'H', 'M', 'L', 'L'] },
  inmate:  { A: ['M', 'M', 'M', 'M', 'L'], B: ['L', 'M', 'H', 'M', 'L'] },
  lovers:  { A: ['H', 'H', 'H', 'H', 'M'], B: ['H', 'H', 'H', 'M', 'M'] },
  enemies: { A: ['H', 'M', 'H', 'L', 'L'], B: ['H', 'M', 'H', 'L', 'L'] },
  rivals:  { A: ['H', 'H', 'H', 'M', 'H'], B: ['H', 'H', 'H', 'M', 'H'] },
  rookie:  { A: ['M', 'M', 'M', 'M', 'M'], B: ['M', 'M', 'M', 'M', 'M'] },
};

function euclideanDist(
  dimsA: CptiDimensionScore[],
  dimsB: CptiDimensionScore[],
  sigA: DimensionLevel[],
  sigB: DimensionLevel[],
): number {
  let dist = 0;
  for (let i = 0; i < 5; i++) {
    const a = dimsA[i]?.score ?? 2;
    const b = dimsB[i]?.score ?? 2;
    const sa = levelNum(sigA[i]);
    const sb = levelNum(sigB[i]);
    dist += (a - sa) ** 2 + (b - sb) ** 2;
  }
  return dist;
}

// ─── Main matching function ──────────────────────────────────────────────────

export function matchRelationship(
  dimsA: CptiDimensionScore[],
  dimsB: CptiDimensionScore[],
): RelationshipResult {
  const pairs = buildPairs(dimsA, dimsB);
  const signals = extractSignals(pairs);

  // Try rule tree first
  for (const rule of RULES) {
    const slug = rule(pairs, signals);
    if (slug) {
      const relationship = CPTI_RELATIONSHIP_TYPES.find(r => r.slug === slug);
      if (relationship) {
        return {
          relationship,
          pairs,
          compatibility: calculateCompatibility(pairs),
        };
      }
    }
  }

  // Fallback: Euclidean distance to signatures
  let bestSlug = 'rookie';
  let bestDist = Infinity;
  for (const [slug, sig] of Object.entries(RELATIONSHIP_SIGNATURES)) {
    const d = euclideanDist(dimsA, dimsB, sig.A, sig.B);
    if (d < bestDist) {
      bestDist = d;
      bestSlug = slug;
    }
  }

  const relationship = CPTI_RELATIONSHIP_TYPES.find(r => r.slug === bestSlug) ?? CPTI_RELATIONSHIP_TYPES[0];
  return {
    relationship,
    pairs,
    compatibility: calculateCompatibility(pairs),
  };
}

// ─── Compatibility score ─────────────────────────────────────────────────────

function calculateCompatibility(pairs: DimensionPair[]): number {
  let total = 0;
  for (const p of pairs) {
    // Same level: 100 pts, 1-step diff: 60 pts, 2-step diff: 20 pts
    if (p.gap === 0) total += 100;
    else if (p.gap === 1) total += 60;
    else total += 20;
  }
  return Math.round(total / 5);
}
