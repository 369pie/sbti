import type { PersonalityType } from './personalities';
import type { DimensionLevel } from './dimensions';
import { DIMENSIONS, MODEL_NAMES } from './dimensions';
import type { ModelType } from './dimensions';

export interface DimensionComparison {
  dimensionId: string;
  dimensionName: string;
  model: ModelType;
  modelName: string;
  levelA: DimensionLevel;
  levelB: DimensionLevel;
  compatibility: number; // 0-100
  label: string; // 完全匹配 | 互补型 | 存在差异
}

export interface CPInsight {
  category: 'strength' | 'challenge' | 'advice' | 'fun';
  title: string;
  description: string;
  emoji: string;
}

export interface CPResult {
  typeA: PersonalityType;
  typeB: PersonalityType;
  overall: number; // 0-100
  tier: CPTier;
  comparisons: DimensionComparison[];
  modelScores: { model: ModelType; name: string; score: number }[];
  insights: CPInsight[];
  summary: string;
}

export type CPTier = '天造地设' | '灵魂伴侣' | '相辅相成' | '有趣碰撞' | '磨合进行时' | '互相折磨';

function levelToNum(l: DimensionLevel): number {
  if (l === 'H') return 3;
  if (l === 'M') return 2;
  return 1;
}

function getDimensionCompatibility(a: DimensionLevel, b: DimensionLevel): { score: number; label: string } {
  const diff = Math.abs(levelToNum(a) - levelToNum(b));
  if (diff === 0) return { score: 100, label: '完全匹配' };
  if (diff === 1) return { score: 65, label: '互补型' };
  return { score: 30, label: '存在差异' };
}

function getTier(score: number): CPTier {
  if (score >= 85) return '天造地设';
  if (score >= 75) return '灵魂伴侣';
  if (score >= 60) return '相辅相成';
  if (score >= 45) return '有趣碰撞';
  if (score >= 30) return '磨合进行时';
  return '互相折磨';
}

function getTierEmoji(tier: CPTier): string {
  const map: Record<CPTier, string> = {
    '天造地设': '💫',
    '灵魂伴侣': '🔮',
    '相辅相成': '🤝',
    '有趣碰撞': '⚡',
    '磨合进行时': '🔧',
    '互相折磨': '💥',
  };
  return map[tier];
}

function generateInsights(
  typeA: PersonalityType,
  typeB: PersonalityType,
  comparisons: DimensionComparison[],
  overall: number,
): CPInsight[] {
  const insights: CPInsight[] = [];

  // Best matching dimensions
  const perfect = comparisons.filter(c => c.compatibility === 100);
  if (perfect.length >= 2) {
    insights.push({
      category: 'strength',
      title: '高度契合点',
      description: `在${perfect.slice(0, 3).map(c => c.dimensionName).join('、')}上完全一致，你们天然就能互相理解。`,
      emoji: '🎯',
    });
  } else if (perfect.length === 1) {
    insights.push({
      category: 'strength',
      title: '默契所在',
      description: `在"${perfect[0].dimensionName}"上你们完全一致——这是你们最容易产生共鸣的地方。`,
      emoji: '🎯',
    });
  }

  // Biggest gaps
  const gaps = comparisons.filter(c => c.compatibility <= 30);
  if (gaps.length >= 2) {
    insights.push({
      category: 'challenge',
      title: '差异地带',
      description: `在${gaps.slice(0, 3).map(c => c.dimensionName).join('、')}上差异较大。不过差异不是问题，不理解才是。`,
      emoji: '⚠️',
    });
  } else if (gaps.length === 1) {
    insights.push({
      category: 'challenge',
      title: '需要磨合的地方',
      description: `在"${gaps[0].dimensionName}"上你们画风不太一样。试着站在对方的角度想想？`,
      emoji: '⚠️',
    });
  }

  // Fun chemistry observations
  const emoCompat = comparisons.filter(c => c.model === 'emotion');
  const emoAvg = emoCompat.reduce((s, c) => s + c.compatibility, 0) / emoCompat.length;
  const socCompat = comparisons.filter(c => c.model === 'social');
  const socAvg = socCompat.reduce((s, c) => s + c.compatibility, 0) / socCompat.length;

  if (emoAvg >= 80) {
    insights.push({
      category: 'fun',
      title: '情感同频',
      description: `在感情世界里你们几乎同频——${typeA.emoji} 和 ${typeB.emoji} 在一起的时候，不需要太多解释就能互相懂。`,
      emoji: '💗',
    });
  } else if (emoAvg <= 40) {
    insights.push({
      category: 'fun',
      title: '冰与火',
      description: `你们在情感模式上几乎是两个极端。一个全情投入一个保持距离？这种张力反而很有故事感。`,
      emoji: '🔥',
    });
  }

  if (socAvg >= 80) {
    insights.push({
      category: 'fun',
      title: '社交默契',
      description: `社交场合里你们是天然搭档——聚会上一个负责活跃气氛，另一个也在同一频道。`,
      emoji: '🎉',
    });
  } else if (socAvg <= 40) {
    insights.push({
      category: 'fun',
      title: '一个想出门一个想躺平',
      description: `社交习惯差距不小。记住：有时候最好的约会就是一起在沙发上各玩各的。`,
      emoji: '🛋️',
    });
  }

  // Advice based on overall
  if (overall >= 75) {
    insights.push({
      category: 'advice',
      title: '配对锦囊',
      description: `${typeA.code} × ${typeB.code} 是一对高契合的组合。你们的默契是天赋，但别因此忽略了沟通——再合拍的人也需要说出口。`,
      emoji: '💡',
    });
  } else if (overall >= 50) {
    insights.push({
      category: 'advice',
      title: '配对锦囊',
      description: `你们之间有共鸣也有碰撞，这正是有趣的地方。秘诀：在差异面前选择好奇而不是评判。`,
      emoji: '💡',
    });
  } else {
    insights.push({
      category: 'advice',
      title: '配对锦囊',
      description: `${typeA.code} × ${typeB.code} 差异很大——但别急着下结论。最好的关系往往是"我完全不理解你，但我愿意去学"。`,
      emoji: '💡',
    });
  }

  return insights;
}

function generateSummary(typeA: PersonalityType, typeB: PersonalityType, overall: number, tier: CPTier): string {
  const tierEmoji = getTierEmoji(tier);

  if (overall >= 80) {
    return `${typeA.emoji} ${typeA.code} 和 ${typeB.emoji} ${typeB.code} 的契合度高达 ${overall}%！${tierEmoji} 你们就像是被同一个算法匹配出来的——不是完全一样，而是刚好互补。在一起的时候大概率是那种别人看了都想酸的组合。`;
  }
  if (overall >= 65) {
    return `${typeA.emoji} ${typeA.code} × ${typeB.emoji} ${typeB.code} 契合度 ${overall}%。${tierEmoji} 你们之间有足够多的共同点让彼此舒服，也有足够多的不同让关系不无聊。这种平衡感，很多人求都求不来。`;
  }
  if (overall >= 50) {
    return `${typeA.emoji} ${typeA.code} × ${typeB.emoji} ${typeB.code} 契合度 ${overall}%。${tierEmoji} 不高不低，恰好在"有趣"的区间。你们不会因为太像而无聊，也不会因为太不同而崩溃。关键看你们愿不愿意在差异面前多走一步。`;
  }
  if (overall >= 35) {
    return `${typeA.emoji} ${typeA.code} × ${typeB.emoji} ${typeB.code} 契合度 ${overall}%。${tierEmoji} 说实话差异不小——但历史上最有名的 CP 往往都是反差大的。你们要么吵得天翻地覆，要么因为不同而疯狂互补。没有中间地带。`;
  }
  return `${typeA.emoji} ${typeA.code} × ${typeB.emoji} ${typeB.code} 契合度 ${overall}%。${tierEmoji} 行走的矛盾体组合！你们大概率会在同一件事上得出完全相反的结论。但换个角度想：至少每天都不会无聊。友情提示：吵架的时候深呼吸。`;
}

export function calculateCP(typeA: PersonalityType, typeB: PersonalityType): CPResult {
  const comparisons: DimensionComparison[] = DIMENSIONS.map(dim => {
    const levelA = typeA.profile[dim.id] ?? 'M';
    const levelB = typeB.profile[dim.id] ?? 'M';
    const { score, label } = getDimensionCompatibility(levelA, levelB);

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      model: dim.model,
      modelName: MODEL_NAMES[dim.model],
      levelA,
      levelB,
      compatibility: score,
      label,
    };
  });

  // Calculate model-level averages
  const modelGroups = new Map<ModelType, number[]>();
  for (const c of comparisons) {
    const arr = modelGroups.get(c.model) ?? [];
    arr.push(c.compatibility);
    modelGroups.set(c.model, arr);
  }

  const modelScores = (['self', 'emotion', 'attitude', 'action', 'social'] as ModelType[]).map(model => ({
    model,
    name: MODEL_NAMES[model],
    score: Math.round(
      (modelGroups.get(model) ?? []).reduce((a, b) => a + b, 0) /
      (modelGroups.get(model)?.length ?? 1)
    ),
  }));

  const overall = Math.round(
    comparisons.reduce((s, c) => s + c.compatibility, 0) / comparisons.length
  );

  const tier = getTier(overall);
  const insights = generateInsights(typeA, typeB, comparisons, overall);
  const summary = generateSummary(typeA, typeB, overall, tier);

  return { typeA, typeB, overall, tier, comparisons, modelScores, insights, summary };
}

export function getTierColor(tier: CPTier): string {
  const map: Record<CPTier, string> = {
    '天造地设': '#22c55e',
    '灵魂伴侣': '#a78bfa',
    '相辅相成': '#eab308',
    '有趣碰撞': '#f97316',
    '磨合进行时': '#f59e0b',
    '互相折磨': '#ef4444',
  };
  return map[tier];
}

export { getTierEmoji };
