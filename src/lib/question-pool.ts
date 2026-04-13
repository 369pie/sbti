type RandomFn = () => number;

export function shuffleArray<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }
  return shuffled;
}

export function sampleQuestionsByDimension<T extends { dimension: string }>(
  questions: readonly T[],
  perDimension: number,
  options: {
    keep?: (question: T) => boolean;
    random?: RandomFn;
  } = {},
): T[] {
  if (perDimension <= 0) {
    return [];
  }

  const random = options.random ?? Math.random;
  const keep = options.keep ?? (() => false);
  const kept: T[] = [];
  const buckets = new Map<string, T[]>();

  for (const question of questions) {
    if (keep(question)) {
      kept.push(question);
      continue;
    }

    const bucket = buckets.get(question.dimension) ?? [];
    bucket.push(question);
    buckets.set(question.dimension, bucket);
  }

  const sampled = [...kept];
  for (const bucket of buckets.values()) {
    sampled.push(...shuffleArray(bucket, random).slice(0, perDimension));
  }

  return shuffleArray(sampled, random);
}