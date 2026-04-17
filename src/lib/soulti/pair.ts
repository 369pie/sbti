/**
 * S-03 · SoulTI 双人共振
 *
 * 给定两个 SoulTI slug，计算它们在 5 轴上的组合 label + relational pattern。
 * 纯函数，Deterministic，复用 CPTI relationship 的叙事模板思路。
 */

import { SOULTI_DIMENSIONS } from './dimensions';
import type { DimensionLevel } from './dimensions';
import { getSoultiPersonalityBySlug, getSoultiResonance } from './personalities';
import type { SoultiPersonalityType } from './personalities';

export interface PairDimensionReading {
  id: string;
  name: string;
  aLevel: DimensionLevel;
  bLevel: DimensionLevel;
  distance: 'same' | 'near' | 'far';
  poleA: string;
  poleB: string;
  commentary: string;
}

export interface SoultiPairResult {
  a: SoultiPersonalityType;
  b: SoultiPersonalityType;
  label: string;
  tagline: string;
  resonanceScore: number;   // 0–100
  dimensions: PairDimensionReading[];
  narrative: {
    bestChapter: string;
    shadowChapter: string;
    growthChapter: string;
  };
}

function levelGap(a: DimensionLevel, b: DimensionLevel): number {
  const map: Record<DimensionLevel, number> = { L: 0, M: 1, H: 2 };
  return Math.abs(map[a] - map[b]);
}

function classifyDistance(a: DimensionLevel, b: DimensionLevel): 'same' | 'near' | 'far' {
  const gap = levelGap(a, b);
  if (gap === 0) return 'same';
  if (gap === 1) return 'near';
  return 'far';
}

function dimensionCommentary(dimId: string, aLevel: DimensionLevel, bLevel: DimensionLevel): string {
  const d = classifyDistance(aLevel, bLevel);
  const axisCopy: Record<string, { same: string; near: string; far: string }> = {
    J1: {
      same: '你们的潮汐是同频的——一起涌或一起静。人群里容易被误认成双胞胎。',
      near: '一个涨得比另一个快一点，但方向一致。日常没摩擦，累的时候容易一起透支。',
      far: '一个涌向世界，一个退回自己。冲突点常在"你为什么不出门/不说话"。彼此是最好的遥控器。',
    },
    J2: {
      same: '都需要锚点 / 都爱风。计划风格匹配，选择题省很多时间。',
      near: '一个稍稳一个稍野，但彼此能互相提供缺的那半。',
      far: '根遇到风。磨合期会很长，但过了之后两人都会扩展出自己原本没有的那一半。',
    },
    J3: {
      same: '边界气质相同——要么都融，要么都筑墙。亲密感来得快，但容易缺一个"说停"的人。',
      near: '一个边界更清一点，足够给两人撑出呼吸。',
      far: '一个融化一个筑墙。最容易出现"我为什么一直在妥协/逃"的时刻，也最能互相看见对方的防御。',
    },
    J4: {
      same: '火焰节奏匹配——都持续或都间歇。爆发点和冷却点都在同一天。',
      near: '一个稳一点，一个跳一点，节奏互补。',
      far: '恒火遇到间歇泉。最大的误会是"你怎么突然冷了/热了"。学会读对方的节奏，是这段关系的必修课。',
    },
    J5: {
      same: '受伤后都以同样的方式复原——都生长或都结晶。',
      near: '一个会长新芽，一个会凝成矿。差别不大但恢复期的需求不一样。',
      far: '生长型遇上结晶型。最难翻译的差异——一个想继续软，一个要先硬。翻译过之后，你们成为彼此身上最稀缺的那一半。',
    },
  };
  return axisCopy[dimId]?.[d] ?? '';
}

export function getSoultiPair(slugA: string, slugB: string): SoultiPairResult | null {
  const a = getSoultiPersonalityBySlug(slugA);
  const b = getSoultiPersonalityBySlug(slugB);
  if (!a || !b) return null;

  const dims: PairDimensionReading[] = SOULTI_DIMENSIONS.map(d => {
    const aLevel = (a.profile[d.id] ?? 'M') as DimensionLevel;
    const bLevel = (b.profile[d.id] ?? 'M') as DimensionLevel;
    return {
      id: d.id,
      name: d.name,
      aLevel,
      bLevel,
      distance: classifyDistance(aLevel, bLevel),
      poleA: d.poleALabel,
      poleB: d.poleBLabel,
      commentary: dimensionCommentary(d.id, aLevel, bLevel),
    };
  });

  // Resonance score: same = 20, near = 12, far = 6 (per axis); max 100
  const score = Math.round(
    dims.reduce((sum, d) => sum + (d.distance === 'same' ? 20 : d.distance === 'near' ? 12 : 6), 0)
  );

  const sameCount = dims.filter(d => d.distance === 'same').length;
  const farCount = dims.filter(d => d.distance === 'far').length;

  let label: string;
  let tagline: string;
  if (sameCount >= 4) {
    label = '双生镜像';
    tagline = '五轴里有四轴同频——你们几乎是对方的另一面。';
  } else if (sameCount >= 3) {
    label = '共振频率';
    tagline = '大方向一致，细节彼此补齐。一起做事最舒服。';
  } else if (farCount >= 3) {
    label = '极性共舞';
    tagline = '你们在三个或以上的维度处于极性两端——强烈、有张力、也最能互相照亮。';
  } else if (farCount >= 2) {
    label = '张力共振';
    tagline = '两个维度拉开了距离，但这正是你们之间的味道。';
  } else {
    label = '温柔共振';
    tagline = '不完全重合也不针锋——你们是慢火型的关系。';
  }

  const aR = getSoultiResonance(a.slug);
  const bR = getSoultiResonance(b.slug);
  const aWoman = aR?.soulOrigin?.zhName ?? a.name;
  const bWoman = bR?.soulOrigin?.zhName ?? b.name;

  const sameDims = dims.filter(d => d.distance === 'same');
  const farDims = dims.filter(d => d.distance === 'far');

  const bestChapter = sameDims.length
    ? `在${sameDims.map(d => d.name).join('、')}上，你们几乎不用翻译。${aWoman} 和 ${bWoman} 站在同一个节奏里，能静也能燃。`
    : `你们没有一个完全同频的维度——但这意味着你们每一次同步，都是真正的同步。`;

  const shadowChapter = farDims.length
    ? `最容易擦出火花也最容易误会的是${farDims.map(d => d.name).join('、')}：一个靠近${farDims[0].poleA}，一个靠近${farDims[0].poleB}。${aWoman} 和 ${bWoman} 曾在历史的不同角落独自面对过这个差异——你们可以不一样。`
    : `你们没有显著的拉扯——关系的张力要从日常生活里慢慢长出来。`;

  const growthChapter = `「${a.name}」+「${b.name}」的组合告诉你们一件事：你们不是要把对方变得像自己，而是允许这个组合本身成为第三种自然力——在彼此身上长出原本不属于自己的那一部分。`;

  return {
    a,
    b,
    label,
    tagline,
    resonanceScore: Math.min(100, score),
    dimensions: dims,
    narrative: { bestChapter, shadowChapter, growthChapter },
  };
}

export function normalizePairSlugs(a: string, b: string): [string, string] {
  // Canonical order — alphabetical. Makes /soulti/pair/a/b and /b/a produce same result.
  return a < b ? [a, b] : [b, a];
}
