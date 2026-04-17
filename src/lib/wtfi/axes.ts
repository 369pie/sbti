/**
 * WTFTI 情境人格理论 · 4 轴定义 (W-T-F-I)
 *
 * 基于 Mischel & Shoda (1995) CAPS 框架的本土化实现。
 * 详见 docs/01-strategy/wtfti-theory-and-brand-moat-2026-04-18.md
 */

export type WtfiAxis = 'W' | 'T' | 'F' | 'I';

export interface AxisDefinition {
  id: WtfiAxis;
  /** 英文全名 */
  english: string;
  /** 中文短名（一个词） */
  name: string;
  /** 中文长描述（"测什么"） */
  testing: string;
  /** CAPS 学术对应（用于白皮书 / 锚点卡片） */
  capsUnit: string;
  /** 高极（+3 端） */
  high: { label: string; description: string };
  /** 低极（-3 端） */
  low: { label: string; description: string };
  /** 主调色（用于 axis bar / 雷达图） */
  color: string;
}

export const WTFI_AXES: AxisDefinition[] = [
  {
    id: 'W',
    english: 'Wired',
    name: '触发反应',
    testing: '你被什么样的刺激点燃？反应阈值是高还是低？',
    capsUnit: 'Encoding strategies',
    high: {
      label: '易点燃',
      description: '任何刺激都能引起明显反应，行动派，第一时间冲出去。',
    },
    low: {
      label: '钝感',
      description: '强刺激才有反应，先观察后行动，外人看你"很稳"。',
    },
    color: '#C07A8E', // clay rose
  },
  {
    id: 'T',
    english: 'Tilt',
    name: '情绪倾斜',
    testing: '在压力 / 关系 / 不确定下，你的情绪向哪边倾斜？',
    capsUnit: 'Affects',
    high: {
      label: '外倾',
      description: '情绪向外释放——倾诉、抱怨、行动、发动态。',
    },
    low: {
      label: '内倾',
      description: '情绪向内消化——反刍、自责、沉默、深夜想三小时。',
    },
    color: '#B8905A', // gold
  },
  {
    id: 'F',
    english: 'Flex',
    name: '应对弹性',
    testing: '当反应模式不奏效时，你切换的速度有多快？',
    capsUnit: 'Self-regulatory plans',
    high: {
      label: '可塑型',
      description: '快速切换策略，不死磕，B 不行就 C，C 不行换思路。',
    },
    low: {
      label: '稳定型',
      description: '认准一种打法用到底，外人看你"轴"，自己叫"坚持"。',
    },
    color: '#7B9E89', // sage
  },
  {
    id: 'I',
    english: 'Imprint',
    name: '印记锚点',
    testing: '你的"对/错/值得"参照系来自哪里？',
    capsUnit: 'Beliefs / Values',
    high: {
      label: '自洽型',
      description: '参照系在自己内部，外界评价权重低，"我觉得行就行"。',
    },
    low: {
      label: '关系型',
      description: '参照系在重要他人 / 群体，"ta 们怎么看"是第一反应。',
    },
    color: '#7A6FA8', // soft purple
  },
];

export function getAxis(id: WtfiAxis): AxisDefinition {
  return WTFI_AXES.find((a) => a.id === id)!;
}

/**
 * 把 -3..+3 的连续值归类为 5 档显示标签
 * 用于结果页"显著高 / 略高 / 居中 / 略低 / 显著低"的中文渲染
 */
export type AxisBand = 'strong-high' | 'high' | 'mid' | 'low' | 'strong-low';

export function bandOf(score: number): AxisBand {
  if (score >= 2) return 'strong-high';
  if (score >= 0.6) return 'high';
  if (score > -0.6) return 'mid';
  if (score > -2) return 'low';
  return 'strong-low';
}

export const BAND_LABEL: Record<AxisBand, string> = {
  'strong-high': '显著',
  high: '偏',
  mid: '居中',
  low: '偏',
  'strong-low': '显著',
};
