/**
 * ITC · Intimacy Tension Coordinates (亲密张力坐标系)
 * ─────────────────────────────────────────────────────────────
 * v3.0 理论 IP 基石（2026-04-20）。
 *
 * 把扁平的 9 维（D1-D9）组织为 3 条上层张力轴：
 *   - CONTROL  控制 ↔ 臣服   (D1 主导欲 · D6 边界弹性 · D9 节奏控制度)
 *   - DISTANCE 距离 ↔ 沉浸   (D2 情感裸露 · D5 自我镜像 · D8 依附模式)
 *   - NOVELTY  重复 ↔ 新鲜   (D3 感官灵敏 · D4 节奏 · D7 想象纵深)
 *
 * 输入：9 维分数（1-3 平均分）
 * 输出：3 条张力的归一化向量（-1 ~ +1）+ 6 个张力标签
 *
 * 维度可被竞品 30 天内复制；张力体系（命名 + 组合 + 配对模型）
 * 是 XPTI 的护城河，所有上层叙事 / 报告 / 配对模型都建立在 ITC 之上。
 */

import type { XptiDimensionScore } from './scoring';

/** 三条上层张力轴。 */
export type ItcAxis = 'control' | 'distance' | 'novelty';

export interface ItcAxisConfig {
  id: ItcAxis;
  /** 学术化英文名，用于白皮书 / SEO / 引用。 */
  english: string;
  /** 中文张力名。 */
  zh: string;
  /** 高极（+1 端）。 */
  poleHigh: { en: string; zh: string; oneLine: string };
  /** 低极（-1 端）。 */
  poleLow: { en: string; zh: string; oneLine: string };
  /** 主调色（与品牌枯玫瑰 / 金箔 / 暮紫呼应）。 */
  color: string;
  /** 9 维中归属此张力的子维度（带权重）。 */
  contributors: { dimensionId: string; weight: number; reversed?: boolean }[];
  /** 一段长解释，用于理论页 / 白皮书。 */
  description: string;
}

export const ITC_AXES: ItcAxisConfig[] = [
  {
    id: 'control',
    english: 'CONTROL ↔ SURRENDER',
    zh: '控制 — 臣服',
    poleHigh: {
      en: 'CONTROL',
      zh: '掌舵',
      oneLine: '我安排节奏，对方负责感受。',
    },
    poleLow: {
      en: 'SURRENDER',
      zh: '交付',
      oneLine: '把方向盘给对方，自己更放松。',
    },
    color: '#9B2C3F',
    contributors: [
      { dimensionId: 'D1', weight: 0.5 },                 // 主导欲
      { dimensionId: 'D6', weight: 0.25, reversed: true },// 边界弹性高 = 倾向交付
      { dimensionId: 'D9', weight: 0.25 },                // 节奏的固定性 = 控制
    ],
    description:
      '控制–臣服张力描述你在亲密互动里更倾向掌握方向，还是把方向盘交出去。' +
      '它不只是「谁说了算」，更是一种关于安全感来源的偏好——' +
      '是「我安排时我才放松」（CONTROL），还是「我被安排时我才放松」（SURRENDER）。',
  },
  {
    id: 'distance',
    english: 'DISTANCE ↔ IMMERSION',
    zh: '距离 — 沉浸',
    poleHigh: {
      en: 'IMMERSION',
      zh: '沉浸',
      oneLine: '愿意被看见全貌，也需要持续连接。',
    },
    poleLow: {
      en: 'DISTANCE',
      zh: '距离',
      oneLine: '保留全貌，独处比连接更安心。',
    },
    color: '#A85A6E',
    contributors: [
      { dimensionId: 'D2', weight: 0.4 },  // 情感裸露
      { dimensionId: 'D5', weight: 0.3 },  // 镜像需要
      { dimensionId: 'D8', weight: 0.3 },  // 依附
    ],
    description:
      '距离–沉浸张力描述你在亲密关系里愿意暴露多少自我、需要多频繁的连接。' +
      'IMMERSION 端的人把暴露当作信任的证据，DISTANCE 端的人把保留当作自我完整的边界。' +
      '没有谁更健康——只有匹配与不匹配。',
  },
  {
    id: 'novelty',
    english: 'REPETITION ↔ NOVELTY',
    zh: '重复 — 新鲜',
    poleHigh: {
      en: 'NOVELTY',
      zh: '新鲜',
      oneLine: '永远在追下一个高峰。',
    },
    poleLow: {
      en: 'REPETITION',
      zh: '回味',
      oneLine: '同一件事反复打磨，越深越上头。',
    },
    color: '#C9A676',
    contributors: [
      { dimensionId: 'D3', weight: 0.25 }, // 感官灵敏
      { dimensionId: 'D4', weight: 0.35 }, // 节奏（快=新鲜）
      { dimensionId: 'D7', weight: 0.4 },  // 想象纵深 → 编剧型偏新鲜剧本
    ],
    description:
      '重复–新鲜张力描述你的快感来源。' +
      'NOVELTY 端的人靠新鲜刺激供电，REPETITION 端的人靠对同一件事的反复深挖供电。' +
      '这条张力直接决定一段关系到了一年、三年、七年时，你会不会觉得「不够了」。',
  },
];

/**
 * 把单维分数（1-3）映射到 -1 ~ +1。
 *   1 → -1（低极）
 *   2 →  0
 *   3 → +1（高极）
 */
function dimToSigned(score: number): number {
  return Math.max(-1, Math.min(1, (score - 2)));
}

/** 单条张力轴的归一化分数（-1 ~ +1）。 */
export interface ItcAxisScore {
  id: ItcAxis;
  /** -1 ~ +1。正向 = 高极（如 CONTROL / IMMERSION / NOVELTY）。 */
  signed: number;
  /** 0-100，便于可视化。 */
  pct: number;
  /** 高/低极标签（取强势侧），例如 'CONTROL' / 'SURRENDER'。 */
  pole: string;
  poleZh: string;
  /** 强度 |signed| 的语义标签。 */
  strength: 'flat' | 'mild' | 'strong';
  oneLine: string;
}

/** 计算 3 张力分。 */
export function computeItcAxes(dimensions: XptiDimensionScore[]): ItcAxisScore[] {
  const dimMap = new Map(dimensions.map((d) => [d.id, d.score]));
  return ITC_AXES.map((axis) => {
    let acc = 0;
    let totalWeight = 0;
    for (const c of axis.contributors) {
      const raw = dimMap.get(c.dimensionId);
      if (raw === undefined) continue;
      const signed = dimToSigned(raw);
      acc += (c.reversed ? -signed : signed) * c.weight;
      totalWeight += c.weight;
    }
    const signed = totalWeight > 0 ? acc / totalWeight : 0;
    const pct = Math.round(((signed + 1) / 2) * 100);
    const high = axis.poleHigh;
    const low = axis.poleLow;
    const pole = signed >= 0 ? high.en : low.en;
    const poleZh = signed >= 0 ? high.zh : low.zh;
    const oneLine = signed >= 0 ? high.oneLine : low.oneLine;
    const abs = Math.abs(signed);
    const strength: ItcAxisScore['strength'] =
      abs < 0.18 ? 'flat' : abs < 0.5 ? 'mild' : 'strong';
    return { id: axis.id, signed, pct, pole, poleZh, strength, oneLine };
  });
}

/**
 * 张力签名（每个原型在三条张力上的固定签名），便于：
 *   - 12 原型在结果页 / 分享卡显示「张力签名」段
 *   - 6 类配对模型（见 itc-pairing.ts）的输入
 *
 * 推导自 personalities.profile 的 D1/D6/D9 (control)
 *                                D2/D5/D8 (distance)
 *                                D3/D4/D7 (novelty)
 */
export interface ItcSignature {
  control: 'CONTROL' | 'NEUTRAL' | 'SURRENDER';
  distance: 'IMMERSION' | 'NEUTRAL' | 'DISTANCE';
  novelty: 'NOVELTY' | 'NEUTRAL' | 'REPETITION';
  /** 一行 signature，例如 "CONTROL · IMMERSION · NOVELTY"。 */
  label: string;
}

function profileToScore(level: 'L' | 'M' | 'H'): number {
  return level === 'H' ? 3 : level === 'L' ? 1 : 2;
}

/**
 * 从 personality.profile（D1-D9 各 H/M/L）反推 ITC 签名。
 * 这是一个纯函数，运行时无副作用。
 */
export function deriveItcSignature(
  profile: Record<string, 'L' | 'M' | 'H'>,
): ItcSignature {
  const dims: XptiDimensionScore[] = Object.entries(profile).map(([id, lv]) => ({
    id,
    score: profileToScore(lv),
    level: lv,
  }));
  const [control, distance, novelty] = computeItcAxes(dims);
  const cTier = control.signed >= 0.25
    ? 'CONTROL'
    : control.signed <= -0.25
      ? 'SURRENDER'
      : 'NEUTRAL';
  const dTier = distance.signed >= 0.25
    ? 'IMMERSION'
    : distance.signed <= -0.25
      ? 'DISTANCE'
      : 'NEUTRAL';
  const nTier = novelty.signed >= 0.25
    ? 'NOVELTY'
    : novelty.signed <= -0.25
      ? 'REPETITION'
      : 'NEUTRAL';
  return {
    control: cTier as ItcSignature['control'],
    distance: dTier as ItcSignature['distance'],
    novelty: nTier as ItcSignature['novelty'],
    label: `${cTier} · ${dTier} · ${nTier}`,
  };
}
