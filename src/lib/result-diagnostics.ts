export type DiagnosticAnswer = 1 | 2 | 3;

export interface DiagnosticDimension {
  id: string;
  name: string;
}

export interface DiagnosticQuestion {
  id: number;
  dimension: string;
  reversed: boolean;
}

export interface DiagnosticDimensionScore<Level extends string = string> {
  id: string;
  score: number;
  level: Level;
}

export interface DiagnosticCandidate<Level extends string = string> {
  slug: string;
  code: string;
  name: string;
  profile: Record<string, Level>;
}

export interface CandidateDistance {
  slug: string;
  code: string;
  name: string;
  distance: number;
}

export interface DimensionConsistency {
  id: string;
  name: string;
  answerCount: number;
  spread: number;
  average: number;
  score: number;
  label: '稳定' | '轻微波动' | '明显摇摆';
}

export interface ResultDiagnostics {
  topCandidates: CandidateDistance[];
  confidence: {
    score: number;
    label: '高' | '中' | '谨慎';
    summary: string;
    bestDistance: number;
    runnerUpDistance: number | null;
    gap: number | null;
  };
  consistency: {
    score: number;
    label: '稳定' | '有波动' | '波动较大';
    summary: string;
    comparedDimensions: number;
    dimensions: DimensionConsistency[];
    flaggedDimensionNames: string[];
  };
  nearMatch: {
    slug: string;
    code: string;
    name: string;
    distance: number;
    gapFromWinner: number;
    differingDimensions: string[];
    summary: string;
  } | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getScore(answer: DiagnosticAnswer, reversed: boolean): number {
  if (reversed) {
    return 4 - answer;
  }

  return answer;
}

function levelToNumber(level: string): number {
  if (level === 'H') return 3;
  if (level === 'M') return 2;
  return 1;
}

function buildConsistency(
  answers: Map<number, DiagnosticAnswer>,
  questions: readonly DiagnosticQuestion[],
  dimensions: readonly DiagnosticDimension[],
) {
  const answersByDimension = new Map<string, number[]>();

  for (const question of questions) {
    const answer = answers.get(question.id);
    if (answer === undefined) {
      continue;
    }

    const scoredAnswer = getScore(answer, question.reversed);
    const bucket = answersByDimension.get(question.dimension) ?? [];
    bucket.push(scoredAnswer);
    answersByDimension.set(question.dimension, bucket);
  }

  const dimensionMap = new Map(dimensions.map((dimension) => [dimension.id, dimension]));
  const consistencyDimensions: DimensionConsistency[] = [];

  for (const [dimensionId, scoredAnswers] of answersByDimension) {
    if (scoredAnswers.length < 2) {
      continue;
    }

    const spread = Math.max(...scoredAnswers) - Math.min(...scoredAnswers);
    const score = clamp(Math.round(100 - (spread / 2) * 100), 0, 100);
    const dimension = dimensionMap.get(dimensionId);

    consistencyDimensions.push({
      id: dimensionId,
      name: dimension?.name ?? dimensionId,
      answerCount: scoredAnswers.length,
      spread,
      average: scoredAnswers.reduce((total, item) => total + item, 0) / scoredAnswers.length,
      score,
      label: spread === 0 ? '稳定' : spread === 1 ? '轻微波动' : '明显摇摆',
    });
  }

  const consistencyScore = consistencyDimensions.length > 0
    ? Math.round(consistencyDimensions.reduce((total, item) => total + item.score, 0) / consistencyDimensions.length)
    : 50;
  const flaggedDimensionNames = consistencyDimensions
    .filter((item) => item.spread >= 1)
    .sort((left, right) => right.spread - left.spread || left.name.localeCompare(right.name, 'zh-Hans-CN'))
    .map((item) => item.name)
    .slice(0, 3);

  let label: ResultDiagnostics['consistency']['label'] = '稳定';
  if (consistencyScore < 65) {
    label = '波动较大';
  } else if (consistencyScore < 85) {
    label = '有波动';
  }

  let summary = '这次题量不足以判断回答一致性。';
  if (consistencyDimensions.length > 0) {
    if (flaggedDimensionNames.length === 0) {
      summary = '同维度题目的回答基本同向，这次结果不是靠随机点出来的。';
    } else if (consistencyScore >= 65) {
      summary = `大部分维度都比较稳定，${flaggedDimensionNames.join('、')} 上有一点摇摆，更像边界在动。`;
    } else {
      summary = `${flaggedDimensionNames.join('、')} 的回答拉得比较开，这次更像状态波动，不完全是固定画像。`;
    }
  }

  return {
    score: consistencyScore,
    label,
    summary,
    comparedDimensions: consistencyDimensions.length,
    dimensions: consistencyDimensions,
    flaggedDimensionNames,
  };
}

function getCandidateDistances<Level extends string>(
  dimensionScores: readonly DiagnosticDimensionScore<Level>[],
  candidates: readonly DiagnosticCandidate<Level>[],
): CandidateDistance[] {
  return candidates
    .map((candidate) => {
      let distance = 0;

      for (const dimensionScore of dimensionScores) {
        const targetLevel = candidate.profile[dimensionScore.id];
        if (!targetLevel) {
          continue;
        }

        const delta = dimensionScore.score - levelToNumber(targetLevel);
        distance += delta * delta;
      }

      return {
        slug: candidate.slug,
        code: candidate.code,
        name: candidate.name,
        distance,
      };
    })
    .sort((left, right) => left.distance - right.distance);
}

function buildNearMatch<Level extends string>(
  winner: CandidateDistance,
  runnerUp: CandidateDistance | null,
  dimensionScores: readonly DiagnosticDimensionScore<Level>[],
  dimensions: readonly DiagnosticDimension[],
  candidates: readonly DiagnosticCandidate<Level>[],
): ResultDiagnostics['nearMatch'] {
  if (!runnerUp) {
    return null;
  }

  const winnerCandidate = candidates.find((candidate) => candidate.slug === winner.slug);
  const runnerUpCandidate = candidates.find((candidate) => candidate.slug === runnerUp.slug);
  if (!winnerCandidate || !runnerUpCandidate) {
    return null;
  }

  const dimensionMap = new Map(dimensions.map((dimension) => [dimension.id, dimension]));
  const differingDimensions = dimensionScores
    .map((dimensionScore) => {
      const winnerLevel = winnerCandidate.profile[dimensionScore.id];
      const runnerUpLevel = runnerUpCandidate.profile[dimensionScore.id];
      if (!winnerLevel || !runnerUpLevel || winnerLevel === runnerUpLevel) {
        return null;
      }

      const winnerDelta = Math.abs(dimensionScore.score - levelToNumber(winnerLevel));
      const runnerDelta = Math.abs(dimensionScore.score - levelToNumber(runnerUpLevel));

      return {
        name: dimensionMap.get(dimensionScore.id)?.name ?? dimensionScore.id,
        advantage: runnerDelta - winnerDelta,
      };
    })
    .filter((item): item is { name: string; advantage: number } => Boolean(item))
    .sort((left, right) => right.advantage - left.advantage || left.name.localeCompare(right.name, 'zh-Hans-CN'))
    .slice(0, 3)
    .map((item) => item.name);

  const summary = differingDimensions.length > 0
    ? `离 ${runnerUp.code}（${runnerUp.name}）最近，但你在 ${differingDimensions.join('、')} 上更偏向当前结果。`
    : `${runnerUp.code}（${runnerUp.name}）是最靠近的备选结果，但这次还是当前结果更贴你。`;

  return {
    slug: runnerUp.slug,
    code: runnerUp.code,
    name: runnerUp.name,
    distance: runnerUp.distance,
    gapFromWinner: runnerUp.distance - winner.distance,
    differingDimensions,
    summary,
  };
}

function buildConfidence(
  winner: CandidateDistance,
  runnerUp: CandidateDistance | null,
  dimensionCount: number,
  consistencyScore: number,
): ResultDiagnostics['confidence'] {
  const runnerUpDistance = runnerUp?.distance ?? null;
  const gap = runnerUp ? runnerUp.distance - winner.distance : null;
  const maxDistance = Math.max(dimensionCount * 4, 1);
  const closeness = clamp(1 - winner.distance / maxDistance, 0, 1);
  const separation = runnerUp ? clamp((runnerUp.distance - winner.distance) / Math.max(dimensionCount * 0.8, 1), 0, 1) : 1;
  const score = clamp(
    Math.round(35 + closeness * 25 + separation * 35 + (consistencyScore / 100) * 25),
    18,
    98,
  );

  let label: ResultDiagnostics['confidence']['label'] = '高';
  if (score < 64) {
    label = '谨慎';
  } else if (score < 82) {
    label = '中';
  }

  let summary = '当前结果是最接近的落点。';
  if (!runnerUp) {
    summary = '候选结果不足，当前结果按最接近画像判定。';
  } else if (score >= 82) {
    summary = `${winner.code} 和第二近的 ${runnerUp.code} 已经拉开明显距离，这次结果相对扎实。`;
  } else if (score >= 64) {
    summary = `当前结果仍然领先，但 ${runnerUp.code} 也在附近，属于有主倾向、不是碾压型判定。`;
  } else {
    summary = `你和 ${runnerUp.code} 的距离比较接近，这次更像落在临界带上。`;
  }

  return {
    score,
    label,
    summary,
    bestDistance: winner.distance,
    runnerUpDistance,
    gap,
  };
}

export function buildResultDiagnostics<Level extends string>(params: {
  answers: Map<number, DiagnosticAnswer>;
  questions: readonly DiagnosticQuestion[];
  dimensions: readonly DiagnosticDimension[];
  dimensionScores: readonly DiagnosticDimensionScore<Level>[];
  candidates: readonly DiagnosticCandidate<Level>[];
  matchedSlug: string;
}): ResultDiagnostics {
  const consistency = buildConsistency(params.answers, params.questions, params.dimensions);
  const topCandidates = getCandidateDistances(params.dimensionScores, params.candidates).slice(0, 3);
  const winner = topCandidates.find((candidate) => candidate.slug === params.matchedSlug) ?? topCandidates[0];
  const runnerUp = topCandidates.find((candidate) => candidate.slug !== winner.slug) ?? null;
  const confidence = buildConfidence(winner, runnerUp, params.dimensionScores.length, consistency.score);
  const nearMatch = buildNearMatch(winner, runnerUp, params.dimensionScores, params.dimensions, params.candidates);

  return {
    topCandidates,
    confidence,
    consistency,
    nearMatch,
  };
}