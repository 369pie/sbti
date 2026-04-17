/**
 * Flexible scoring engine for UGC creator universes.
 *
 * Supports two scoring modes:
 *  - "dimension": Creator defines 3-8 custom axes. Each option scores on axes.
 *    Personality match uses Euclidean distance (same algo as PGC scoring.ts).
 *  - "direct": Each option votes for a personality. Most-voted wins.
 *
 * The PGC scoring.ts is left untouched — this module is independent.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type FlexAnswer = number; // 1-based option index

export interface FlexAxis {
  key: string;      // e.g. 'E_I'
  name: string;     // e.g. '内向-外向'
  lowLabel: string;  // low-end label
  highLabel: string; // high-end label
}

export interface FlexOptionScore {
  /** For dimension mode: mapping axis_key → delta (e.g. { E_I: 2, S_N: -1 }) */
  scores?: Record<string, number>;
  /** For direct mode: target personality slug */
  targetPersonality?: string;
}

export interface FlexQuestion {
  id: string;
  text: string;
  options: FlexOption[];
  poolTag?: string; // for random sampling
}

export interface FlexOption {
  id: string;
  text: string;
  imageUrl?: string;
  /** Dimension mode scores */
  scores?: Record<string, number>;
  /** Direct mode target */
  targetPersonality?: string;
}

export interface FlexPersonalityProfile {
  slug: string;
  /** For dimension mode: expected axis levels { axis_key: 'H' | 'L' } */
  profile?: Record<string, 'H' | 'L'>;
}

export type ScoringMode = 'dimension' | 'direct';

// ─── Result types ────────────────────────────────────────────────────────────

export interface FlexAxisScore {
  key: string;
  score: number;  // raw average
  level: 'H' | 'L';
  normalized: number; // 0-100 for display
}

export interface FlexTestResult {
  matchedSlug: string;
  axisScores: FlexAxisScore[];
  confidence: number; // 0-1, how close the match is
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Calculate test result using dimension-based scoring.
 *
 * Each answer contributes to axis scores via option.scores.
 * Final personality = closest profile by Euclidean distance.
 */
export function calculateDimensionResult(
  answers: Map<string, string>,   // questionId → optionId
  questions: FlexQuestion[],
  axes: FlexAxis[],
  personalities: FlexPersonalityProfile[],
): FlexTestResult {
  // Aggregate scores per axis
  const axisTotals = new Map<string, number[]>();
  for (const ax of axes) axisTotals.set(ax.key, []);

  for (const q of questions) {
    const chosenOptionId = answers.get(q.id);
    if (!chosenOptionId) continue;
    const option = q.options.find(o => o.id === chosenOptionId);
    if (!option?.scores) continue;

    for (const [axisKey, delta] of Object.entries(option.scores)) {
      const arr = axisTotals.get(axisKey);
      if (arr) arr.push(delta);
    }
  }

  // Calculate average per axis
  const axisScores: FlexAxisScore[] = axes.map(ax => {
    const vals = axisTotals.get(ax.key) ?? [];
    const avg = vals.length > 0
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : 0;
    const level: 'H' | 'L' = avg >= 0 ? 'H' : 'L';
    // Normalize to 0-100: map [-3, 3] → [0, 100]
    const normalized = Math.round(Math.min(100, Math.max(0, ((avg + 3) / 6) * 100)));
    return { key: ax.key, score: avg, level, normalized };
  });

  // Match personality via Euclidean distance
  let bestSlug = personalities[0]?.slug ?? '';
  let bestDist = Infinity;

  for (const p of personalities) {
    if (!p.profile) continue;
    let dist = 0;
    for (const as of axisScores) {
      const targetLevel = p.profile[as.key];
      if (!targetLevel) continue;
      const targetNum = targetLevel === 'H' ? 1.5 : -1.5;
      const diff = as.score - targetNum;
      dist += diff * diff;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestSlug = p.slug;
    }
  }

  // Confidence: inverse of distance, clamped to [0, 1]
  const maxPossibleDist = axes.length * 9; // max diff per axis = 3, squared = 9
  const confidence = maxPossibleDist > 0
    ? Math.max(0, Math.min(1, 1 - bestDist / maxPossibleDist))
    : 1;

  return { matchedSlug: bestSlug, axisScores, confidence };
}

/**
 * Calculate test result using direct matching.
 *
 * Each option votes for a personality. Most-voted personality wins.
 * Ties broken by first occurrence.
 */
export function calculateDirectResult(
  answers: Map<string, string>,   // questionId → optionId
  questions: FlexQuestion[],
  personalitySlugs: string[],
): FlexTestResult {
  const votes = new Map<string, number>();
  for (const slug of personalitySlugs) votes.set(slug, 0);

  for (const q of questions) {
    const chosenOptionId = answers.get(q.id);
    if (!chosenOptionId) continue;
    const option = q.options.find(o => o.id === chosenOptionId);
    if (!option?.targetPersonality) continue;
    votes.set(option.targetPersonality, (votes.get(option.targetPersonality) ?? 0) + 1);
  }

  let bestSlug = personalitySlugs[0] ?? '';
  let bestVotes = 0;
  for (const [slug, count] of votes) {
    if (count > bestVotes) {
      bestVotes = count;
      bestSlug = slug;
    }
  }

  const totalAnswered = answers.size;
  const confidence = totalAnswered > 0 ? bestVotes / totalAnswered : 0;

  return {
    matchedSlug: bestSlug,
    axisScores: [], // No axis scores in direct mode
    confidence,
  };
}

/**
 * Unified entry point — delegates to the right scoring function.
 */
export function calculateFlexResult(
  mode: ScoringMode,
  answers: Map<string, string>,
  questions: FlexQuestion[],
  axes: FlexAxis[],
  personalities: FlexPersonalityProfile[],
): FlexTestResult {
  if (mode === 'direct') {
    return calculateDirectResult(answers, questions, personalities.map(p => p.slug));
  }
  return calculateDimensionResult(answers, questions, axes, personalities);
}

// ─── Question sampling ───────────────────────────────────────────────────────

/**
 * Sample questions from a pool, optionally stratified by poolTag.
 * If totalCount is undefined or >= questions.length, returns all (shuffled).
 */
export function sampleQuestions(
  questions: FlexQuestion[],
  totalCount?: number,
): FlexQuestion[] {
  if (!totalCount || totalCount >= questions.length) {
    return shuffleArray([...questions]);
  }

  // Group by poolTag
  const pools = new Map<string, FlexQuestion[]>();
  const untagged: FlexQuestion[] = [];
  for (const q of questions) {
    if (q.poolTag) {
      const arr = pools.get(q.poolTag) ?? [];
      arr.push(q);
      pools.set(q.poolTag, arr);
    } else {
      untagged.push(q);
    }
  }

  // If no pools, just random sample
  if (pools.size === 0) {
    return shuffleArray([...questions]).slice(0, totalCount);
  }

  // Stratified: take proportional from each pool
  const result: FlexQuestion[] = [];
  const poolKeys = [...pools.keys()];
  const perPool = Math.max(1, Math.floor(totalCount / poolKeys.length));
  for (const key of poolKeys) {
    const poolQs = shuffleArray(pools.get(key)!);
    result.push(...poolQs.slice(0, perPool));
  }

  // Fill remainder from untagged or remaining pool items
  const remaining = totalCount - result.length;
  if (remaining > 0) {
    const extras = shuffleArray([...untagged, ...questions.filter(q => !result.includes(q))]);
    result.push(...extras.slice(0, remaining));
  }

  return shuffleArray(result).slice(0, totalCount);
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
