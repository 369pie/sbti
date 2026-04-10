import { DIMENSIONS, type Dimension, type DimensionLevel, type ModelType } from './dimensions';
import { PERSONALITY_TYPES, type PersonalityType } from './personalities';

type ExplanationBlock = {
  title: string;
  body: string;
};

export type SimilarPersonalityInsight = {
  personality: PersonalityType;
  sharedTraits: string[];
  differenceSummary: string[];
};

export type PersonalityGuide = {
  explanation: ExplanationBlock[];
  suitableFor: string[];
  similarTypes: SimilarPersonalityInsight[];
};

function levelToNumber(level: DimensionLevel): number {
  if (level === 'H') return 3;
  if (level === 'M') return 2;
  return 1;
}

function cleanSentence(text: string): string {
  return text.replace(/[。！？]+$/u, '');
}

function getDimension(id: string): Dimension {
  const dimension = DIMENSIONS.find((item) => item.id === id);
  if (!dimension) {
    throw new Error(`Unknown dimension: ${id}`);
  }
  return dimension;
}

function getSignatureDimension(personality: PersonalityType, model: ModelType): { dimension: Dimension; level: DimensionLevel } {
  const candidates = DIMENSIONS.filter((dimension) => dimension.model === model).map((dimension) => {
    const level = personality.profile[dimension.id] as DimensionLevel;
    return {
      dimension,
      level,
      weight: Math.abs(levelToNumber(level) - 2),
    };
  });

  candidates.sort((left, right) => right.weight - left.weight || levelToNumber(right.level) - levelToNumber(left.level));
  return { dimension: candidates[0].dimension, level: candidates[0].level };
}

function buildExplanation(personality: PersonalityType): ExplanationBlock[] {
  const selfDim = getSignatureDimension(personality, 'self');
  const attitudeDim = getSignatureDimension(personality, 'attitude');
  const emotionDim = getSignatureDimension(personality, 'emotion');
  const socialDim = getSignatureDimension(personality, 'social');
  const actionMotivation = getDimension('Ac1');
  const actionDecision = getDimension('Ac2');
  const actionExecution = getDimension('Ac3');

  const actionMotivationLevel = personality.profile[actionMotivation.id] as DimensionLevel;
  const actionDecisionLevel = personality.profile[actionDecision.id] as DimensionLevel;
  const actionExecutionLevel = personality.profile[actionExecution.id] as DimensionLevel;

  return [
    {
      title: '核心气质',
      body: `${personality.name} 这种结果，通常先体现在 ${selfDim.dimension.name} 和 ${attitudeDim.dimension.name} 上。你更容易表现出「${cleanSentence(selfDim.dimension.levels[selfDim.level])}」，同时在看待世界和规则时又会偏向「${cleanSentence(attitudeDim.dimension.levels[attitudeDim.level])}」。这也是为什么别人通常会先从你的判断方式、稳定感和气场里，感受到这个人格。`,
    },
    {
      title: '关系状态',
      body: `放到关系和社交场景里，这类人格更常见的状态是「${cleanSentence(emotionDim.dimension.levels[emotionDim.level])}」以及「${cleanSentence(socialDim.dimension.levels[socialDim.level])}」。你在意的往往不只是热闹不热闹，而是安全感、边界感和表达方式是不是舒服。`,
    },
    {
      title: '行动方式',
      body: `做事时，你通常会同时呈现出「${cleanSentence(actionMotivation.levels[actionMotivationLevel])}」、「${cleanSentence(actionDecision.levels[actionDecisionLevel])}」和「${cleanSentence(actionExecution.levels[actionExecutionLevel])}」这三种倾向。它们叠在一起，就构成了 ${personality.name} 最典型的推进节奏和行动风格。`,
    },
  ];
}

function buildSuitableFor(personality: PersonalityType): string[] {
  const selfDim = getSignatureDimension(personality, 'self');
  const emotionDim = getSignatureDimension(personality, 'emotion');
  const actionDim = getSignatureDimension(personality, 'action');
  const socialDim = getSignatureDimension(personality, 'social');

  return [
    `经常在「${selfDim.dimension.name}」上呈现出「${cleanSentence(selfDim.dimension.levels[selfDim.level])}」这种状态的人。`,
    `在关系里更接近「${cleanSentence(emotionDim.dimension.levels[emotionDim.level])}」，并且会很在意互动节奏的人。`,
    `做事时更像「${cleanSentence(actionDim.dimension.levels[actionDim.level])}」，容易在行动方式上露出鲜明个人风格的人。`,
    `社交中更贴近「${cleanSentence(socialDim.dimension.levels[socialDim.level])}」，不太喜欢用完全模板化方式待人的人。`,
  ];
}

function getProfileDistance(left: PersonalityType, right: PersonalityType): number {
  return DIMENSIONS.reduce((total, dimension) => {
    const leftValue = levelToNumber(left.profile[dimension.id] as DimensionLevel);
    const rightValue = levelToNumber(right.profile[dimension.id] as DimensionLevel);
    const difference = leftValue - rightValue;
    return total + difference * difference;
  }, 0);
}

function getClosestPersonalities(personality: PersonalityType, count = 2): PersonalityType[] {
  const sameTierCandidates = PERSONALITY_TYPES.filter(
    (candidate) => candidate.slug !== personality.slug && Boolean(candidate.isSpecial) === Boolean(personality.isSpecial),
  );

  const candidates = sameTierCandidates.length >= count
    ? sameTierCandidates
    : PERSONALITY_TYPES.filter((candidate) => candidate.slug !== personality.slug);

  return candidates
    .map((candidate) => ({ candidate, distance: getProfileDistance(personality, candidate) }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, count)
    .map((item) => item.candidate);
}

function getSharedTraits(left: PersonalityType, right: PersonalityType, count = 3): string[] {
  return DIMENSIONS
    .filter((dimension) => left.profile[dimension.id] === right.profile[dimension.id])
    .sort((a, b) => {
      const levelA = left.profile[a.id] as DimensionLevel;
      const levelB = left.profile[b.id] as DimensionLevel;
      return Math.abs(levelToNumber(levelB) - 2) - Math.abs(levelToNumber(levelA) - 2);
    })
    .slice(0, count)
    .map((dimension) => dimension.name);
}

function getDifferenceSummary(left: PersonalityType, right: PersonalityType, count = 2): string[] {
  return DIMENSIONS
    .map((dimension) => {
      const leftLevel = left.profile[dimension.id] as DimensionLevel;
      const rightLevel = right.profile[dimension.id] as DimensionLevel;
      return {
        dimension,
        leftLevel,
        rightLevel,
        distance: Math.abs(levelToNumber(leftLevel) - levelToNumber(rightLevel)),
      };
    })
    .filter((item) => item.distance > 0)
    .sort((a, b) => b.distance - a.distance)
    .slice(0, count)
    .map((item) => `${item.dimension.name}：你更像「${cleanSentence(item.dimension.levels[item.leftLevel])}」，${right.name} 更像「${cleanSentence(item.dimension.levels[item.rightLevel])}」`);
}

export function buildPersonalityGuide(personality: PersonalityType): PersonalityGuide {
  const similarTypes = getClosestPersonalities(personality).map((candidate) => ({
    personality: candidate,
    sharedTraits: getSharedTraits(personality, candidate),
    differenceSummary: getDifferenceSummary(personality, candidate),
  }));

  return {
    explanation: buildExplanation(personality),
    suitableFor: buildSuitableFor(personality),
    similarTypes,
  };
}