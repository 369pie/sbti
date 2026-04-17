/**
 * WTFTI W-T-F-I 计分核心
 *
 * 输入：用户对每题选了哪个 option
 * 输出：4 轴归一化画像（-3..+3）+ 匹配人格 + 反差/触发标记
 */

import type { WtfiAxis } from './axes';
import {
  WTFI_SCENARIO_QUESTIONS,
  type ScenarioOption,
  type ScenarioQuestion,
  type AxisVector,
} from './questions';
import {
  matchWtfiPersonality,
  type WtfiPersonality,
} from './personalities';

export interface WtfiAnswer {
  questionId: number;
  optionKey: 'A' | 'B' | 'C';
}

export interface WtfiResult {
  axes: Record<WtfiAxis, number>;
  /** 每轴的"原始累加分" */
  raw: Record<WtfiAxis, number>;
  /** 每轴有多少题贡献了向量（用于归一化分母） */
  axisHitCount: Record<WtfiAxis, number>;
  personality: WtfiPersonality;
  /** 反差 / 触发标记（用于隐藏卡机制） */
  flags: {
    contrastSelf: boolean;
    drunkTrigger: boolean;
  };
}

const AXES: WtfiAxis[] = ['W', 'T', 'F', 'I'];

/**
 * 把 -3..+3 的 axis 上下限做软裁剪（先用 tanh 形状压缩，再放大到 ±3）
 * 让累加值不至于因为题数多而爆轴。
 */
function squash(raw: number): number {
  // tanh(x/3) ∈ (-1, 1)，再 ×3
  const v = Math.tanh(raw / 3) * 3;
  return Math.round(v * 100) / 100;
}

export function scoreWtfi(
  answers: WtfiAnswer[],
  pool: ScenarioQuestion[] = WTFI_SCENARIO_QUESTIONS,
): WtfiResult {
  const raw: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };
  const hits: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };

  let contrastSelf = false;
  let drunkTrigger = false;

  for (const { questionId, optionKey } of answers) {
    const q = pool.find((p) => p.id === questionId);
    if (!q) continue;
    const opt = q.options.find((o) => o.key === optionKey);
    if (!opt) continue;
    accumulate(opt.vector, raw, hits);

    // 隐藏触发：26/27 题选 A（F:+ 高反差），25 题选 A（醉酒大反差）
    if (q.category === 'contrast' && optionKey === 'A') contrastSelf = true;
    if (q.id === 25 && optionKey === 'A') drunkTrigger = true;
  }

  const axes: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };
  for (const a of AXES) {
    axes[a] = squash(raw[a]);
  }

  const personality = matchWtfiPersonality(axes);

  return {
    axes,
    raw,
    axisHitCount: hits,
    personality,
    flags: { contrastSelf, drunkTrigger },
  };
}

function accumulate(
  v: AxisVector,
  sum: Record<WtfiAxis, number>,
  hits: Record<WtfiAxis, number>,
): void {
  for (const a of AXES) {
    const w = v[a];
    if (typeof w === 'number') {
      sum[a] += w;
      hits[a] += 1;
    }
  }
}

/**
 * Stub for forwards compatibility:
 * 当 quiz 跑在"经典 SBTI 模式"时，universe 自带 theory='classic-15'，
 * scoring 走老 calculateResult；
 * 当 quiz 跑在"WTFI 模式"时，universe 自带 theory='wtfi-4'，
 * scoring 走 scoreWtfi。
 */
export type TheoryMode = 'classic-15' | 'wtfi-4';

export interface UniverseTheoryConfig {
  theory: TheoryMode;
  /** 是否同时投影到另一套模型（用于 hybrid 展示） */
  projectAlias?: boolean;
  /**
   * 此宇宙"主要点亮"的 W/T/F/I 轴。
   * 用于 <TheoryAnchorCard /> 上方的"此宇宙激活情境维度"标签。
   * 不影响计分，只影响展示与 CCI 权重。
   */
  activatedAxes?: WtfiAxis[];
  /** 锚点卡上的人话注脚，例如"修仙宇宙主要看你的「触发反应 + 应对弹性」" */
  axisNote?: string;
}

/**
 * 默认配置：标准入口走 wtfi-4，经典宇宙走 classic-15
 * activatedAxes 来自 docs/01-strategy/wtfti-theory-and-brand-moat-2026-04-18.md §8.5
 */
export const DEFAULT_THEORY_FOR_UNIVERSE: Record<string, UniverseTheoryConfig> = {
  // 默认入口（4 轴全开）
  default: {
    theory: 'wtfi-4',
    activatedAxes: ['W', 'T', 'F', 'I'],
    axisNote: 'WTFTI 标准入口同时点亮 4 条轴：触发反应 · 情绪倾斜 · 应对弹性 · 印记锚点。',
  },
  wtfti: {
    theory: 'wtfi-4',
    activatedAxes: ['W', 'T', 'F', 'I'],
    axisNote: 'WTFTI 标准入口同时点亮 4 条轴。',
  },
  // 经典 SBTI 风格保留
  classic: {
    theory: 'classic-15',
    activatedAxes: ['W', 'T', 'F', 'I'],
    axisNote: '经典 27 型保留旧维度，结果会同步映射到 WTFI 4 轴。',
  },
  // 老宇宙：保留 classic-15，但开 alias 投影 + 标注主激活轴
  banti: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['F', 'I'],
    axisNote: '班 TI 主要测「应对弹性 + 印记锚点」——你在班级关系里怎么切换 / 参照系是谁。',
  },
  xiuxian: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'F'],
    axisNote: '修仙宇宙主要测「触发反应 + 应对弹性」——你被什么点燃，遇阻时怎么换招。',
  },
  drunk: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'T'],
    axisNote: 'Drunk 宇宙主要测「触发反应 + 情绪倾斜」——卸下控制后你向哪边倒。',
  },
  daily: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W'],
    axisNote: '日常宇宙主要测「触发反应」——日常微刺激下你的反应阈值。',
  },
  love: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['T', 'I'],
    axisNote: '恋爱宇宙主要测「情绪倾斜 + 印记锚点」——亲密关系里你向谁倒、参照谁。',
  },
  work: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['F', 'I'],
    axisNote: '职场宇宙主要测「应对弹性 + 印记锚点」——KPI 下你切换策略 / 参照谁。',
  },
  soulti: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['I', 'T'],
    axisNote: 'SoulTI 主要测「印记锚点 + 情绪倾斜」——你的"对/错"参照系来自哪里。',
  },
  // 已自有维度的宇宙
  xpti: {
    theory: 'wtfi-4',
    activatedAxes: ['T', 'F'],
    axisNote: 'XPTI 主要测「情绪倾斜 + 应对弹性」——高敏感人群的情绪走向 + 缓冲策略。',
  },
  cpti: {
    theory: 'wtfi-4',
    activatedAxes: ['T', 'I'],
    axisNote: 'CPTI 主要测「情绪倾斜 + 印记锚点」——CP 关系里你怎么倾斜 / 参照谁。',
  },
  mysti: {
    theory: 'wtfi-4',
    activatedAxes: ['I'],
    axisNote: 'Mysti 灵鉴主要测「印记锚点」——你的人生意义参照系来自哪里。',
  },
  kings: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'F'],
    axisNote: '王者 TI 主要测「触发反应 + 应对弹性」——团战开局你怎么响应 / 怎么换打法。',
  },
  identify: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['T'],
    axisNote: 'WTF 鉴定主要测「情绪倾斜」——一句吐槽里你的真实情绪走向。',
  },
  firstlook: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'T'],
    axisNote: '初见 3 分钟主要测「触发反应 + 情绪倾斜」——3 分钟里你被什么点燃 + 向哪倒。',
  },
  feng: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'F'],
    axisNote: '风元素宇宙主要测「触发反应 + 应对弹性」——气流中你的反应速度 + 切换。',
  },
  hogti: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['T', 'I'],
    axisNote: 'HogTI 主要测「情绪倾斜 + 印记锚点」——熟人圈里你向谁倒 / 参照谁。',
  },
  herti: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['T', 'I'],
    axisNote: 'HerTI 主要测「情绪倾斜 + 印记锚点」——女性视角下情绪走向与参照系。',
  },
  flower: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['I', 'T'],
    axisNote: '花语宇宙主要测「印记锚点 + 情绪倾斜」——你被哪种"美"安静地点中。',
  },
  bird: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'F'],
    axisNote: '鸟类宇宙主要测「触发反应 + 应对弹性」——你警觉、起飞、落地的节奏。',
  },
  delta: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['T', 'F'],
    axisNote: 'Δ 反差宇宙主要测「情绪倾斜 + 应对弹性」——你的"两个我"差距在哪。',
  },
  fanrenti: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['F', 'I'],
    axisNote: '凡人 TI 主要测「应对弹性 + 印记锚点」——平凡日子里的切换 + 自我参照。',
  },
  cp: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['T', 'I'],
    axisNote: 'CP 配对主要测「情绪倾斜 + 印记锚点」——亲密互动里你向谁倒、参照谁。',
  },
  sbti: {
    theory: 'classic-15',
    projectAlias: true,
    activatedAxes: ['W', 'T', 'F', 'I'],
    axisNote: '经典 SBTI 27 型保留旧维度，结果会同步映射到 WTFI 4 轴画像。',
  },
};

export function theoryFor(universe: string): UniverseTheoryConfig {
  return DEFAULT_THEORY_FOR_UNIVERSE[universe] ?? DEFAULT_THEORY_FOR_UNIVERSE.default;
}
