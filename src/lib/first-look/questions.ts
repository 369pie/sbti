/**
 * First Look · 10-question quiz
 *
 * Structure:
 *  - 8 "她 vs 她" binary thematic questions (Q1-Q8) — each adds to 3 axes
 *  - 1 scene-based triple-choice question (Q9) — disambiguator
 *  - 1 explicit deep-dive intent question (Q10) — final routing bias
 *
 * Axes:
 *  - edge    (→ WTF 毒舌)
 *  - emotion (→ SoulTI 灵魂)
 *  - mystery (→ Mysti 塔罗)
 *
 * Each option contributes a small vector delta.
 */

export type FirstLookAxis = 'edge' | 'emotion' | 'mystery';

export type AxisVector = Record<FirstLookAxis, number>;

export interface FirstLookOption {
  key: 'A' | 'B' | 'C';
  label: string;
  sublabel?: string;
  delta: AxisVector;
}

export interface FirstLookQuestion {
  id: number;
  /** Prompt shown above the options. Should NOT expose axis names. */
  prompt: string;
  /** Tiny eyebrow label (e.g. "Q1 · 直觉题") */
  eyebrow: string;
  /** Question style */
  variant: 'duo' | 'trio';
  options: FirstLookOption[];
}

// Helper to build a symmetric duo delta quickly.
const d = (edge: number, emotion: number, mystery: number): AxisVector => ({ edge, emotion, mystery });

export const FIRST_LOOK_QUESTIONS: FirstLookQuestion[] = [
  {
    id: 1,
    eyebrow: 'Q1 · 你更像',
    prompt: '同一张桌子上有两个人，你更像哪一个？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '说第一句的那个',
        sublabel: '先开口定调，话题归我带',
        delta: d(2, 0, 0),
      },
      {
        key: 'B',
        label: '观察全场的那个',
        sublabel: '先看再说，最后一句才亮底',
        delta: d(0, 1, 2),
      },
    ],
  },
  {
    id: 2,
    eyebrow: 'Q2 · 深夜题',
    prompt: '凌晨一点，你更可能在做什么？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '把今天重放一遍',
        sublabel: '复盘 · 打字 · 内心独白',
        delta: d(0, 3, 1),
      },
      {
        key: 'B',
        label: '把对面 emo 的朋友骂醒',
        sublabel: '毒舌但心软 · 是她就行',
        delta: d(3, 1, 0),
      },
    ],
  },
  {
    id: 3,
    eyebrow: 'Q3 · 气场题',
    prompt: '朋友形容你的气场，更接近哪种？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '像月光，安静但照得远',
        delta: d(0, 2, 2),
      },
      {
        key: 'B',
        label: '像火山，从不挑时候爆发',
        delta: d(3, 2, 0),
      },
    ],
  },
  {
    id: 4,
    eyebrow: 'Q4 · 符号题',
    prompt: '你会下意识收藏哪种东西？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '塔罗牌 · 月相表 · 星盘截图',
        sublabel: '读符号 · 看征兆',
        delta: d(0, 1, 3),
      },
      {
        key: 'B',
        label: '吵架金句 · 清醒语录 · 截图神评',
        sublabel: '留弹药 · 随时开火',
        delta: d(3, 1, 0),
      },
    ],
  },
  {
    id: 5,
    eyebrow: 'Q5 · 关系题',
    prompt: '被喜欢的人问"你在想什么"——',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '"没什么。"（其实想了一整夜）',
        sublabel: '嘴硬 · 护得紧 · 心里写长信',
        delta: d(1, 3, 0),
      },
      {
        key: 'B',
        label: '"我跟你讲，今天这个事……"（一口气讲完）',
        sublabel: '心里有就说 · 不耐烦藏',
        delta: d(2, 1, 1),
      },
    ],
  },
  {
    id: 6,
    eyebrow: 'Q6 · 场景题',
    prompt: '最让你放松的独处场景是？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '一杯花茶 + 一本书 + 没人打扰',
        sublabel: '给自己浇水',
        delta: d(0, 3, 1),
      },
      {
        key: 'B',
        label: '一副塔罗 + 一根蜡烛 + 一个问题',
        sublabel: '仪式感拉满',
        delta: d(0, 1, 3),
      },
    ],
  },
  {
    id: 7,
    eyebrow: 'Q7 · 节奏题',
    prompt: '别人急着往前冲时，你的节奏更像？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '走得慢，但我知道我在往哪走',
        sublabel: '主体性 · 不被催',
        delta: d(0, 2, 2),
      },
      {
        key: 'B',
        label: '谁急我骂谁，谁 PUA 我怼谁',
        sublabel: '讲台在我嘴上',
        delta: d(3, 1, 0),
      },
    ],
  },
  {
    id: 8,
    eyebrow: 'Q8 · 自我认知',
    prompt: '关于"情绪丰沛"这件事，你更认同哪句？',
    variant: 'duo',
    options: [
      {
        key: 'A',
        label: '那是我的语言，不是我的病。',
        sublabel: '接纳 · 文学化',
        delta: d(1, 3, 1),
      },
      {
        key: 'B',
        label: '那是我的弹药，不是我的弱点。',
        sublabel: '外放 · 火山式',
        delta: d(3, 2, 0),
      },
    ],
  },
  {
    id: 9,
    eyebrow: 'Q9 · 你在找',
    prompt: '如果做完这次测试只能带走一样东西，你想带哪一样？',
    variant: 'trio',
    options: [
      {
        key: 'A',
        label: '一句把我说透的狠话',
        sublabel: '被说中 · 想被骂醒 · 要觉醒感',
        delta: d(3, 0, 0),
      },
      {
        key: 'B',
        label: '一封只有我看得懂的长信',
        sublabel: '被看见 · 想被抚慰 · 要情绪厚度',
        delta: d(0, 3, 0),
      },
      {
        key: 'C',
        label: '一张我命定的那张牌',
        sublabel: '被指引 · 想被解读 · 要神秘感',
        delta: d(0, 0, 3),
      },
    ],
  },
  {
    id: 10,
    eyebrow: 'Q10 · 下一站',
    prompt: '今晚，你更想被哪一种声音接住？',
    variant: 'trio',
    options: [
      {
        key: 'A',
        label: '一个敢说真话的朋友',
        sublabel: '→ 毒舌',
        delta: d(3, 1, 0),
      },
      {
        key: 'B',
        label: '一个写给你自己的深夜树洞',
        sublabel: '→ 灵魂镜像',
        delta: d(0, 3, 1),
      },
      {
        key: 'C',
        label: '一个会洗牌的神秘学姐',
        sublabel: '→ 塔罗灵鉴',
        delta: d(0, 1, 3),
      },
    ],
  },
];

export const FIRST_LOOK_QUESTION_COUNT = FIRST_LOOK_QUESTIONS.length;
