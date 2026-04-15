import { sampleQuestionsByDimension } from '../question-pool';
import type { CptiModelType } from './dimensions';

export interface CptiAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface CptiQuestion {
  id: number;
  text: string;
  dimension: string;
  model: CptiModelType;
  reversed: boolean;
  options?: CptiAnswerOption[];
}

// ── 默认选项 ──
export const CPTI_DEFAULT_OPTIONS: CptiAnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const CPTI_QUESTIONS: CptiQuestion[] = [
  // ══════════════════════════════════════
  //  主导力 (Power)  C1
  // ══════════════════════════════════════
  {
    id: 1, text: '你和ta约会，地点通常谁来定？', dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '我来安排，我选的地方不会出错。', key: 'A' },
      { value: 2, label: '看谁先有想法，轮流来吧。', key: 'B' },
      { value: 1, label: '"你定吧"是我的口头禅。', key: 'C' },
    ],
  },
  {
    id: 2, text: '两个人意见不一致的时候，结局通常是？', dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '对方会被我说服，我的逻辑太强了。', key: 'A' },
      { value: 2, label: '谁说得有道理听谁的。', key: 'B' },
      { value: 1, label: '我嘴上说"都行"然后默默让步。', key: 'C' },
    ],
  },
  {
    id: 3, text: '吵完架之后的和好流程是？', dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '我来主导节奏——该冷静几天、什么时候谈，我心里有数。', key: 'A' },
      { value: 2, label: '看情况，谁先缓过来谁先开口。', key: 'B' },
      { value: 1, label: '等对方来哄我，我一般不会先低头。', key: 'C' },
    ],
  },
  {
    id: 16, text: '在这段关系里，我通常是\"被牵着走\"的那个人。', dimension: 'C1', model: 'power', reversed: true,
    options: [
      { value: 3, label: '是的，我基本跟着ta的节奏走。', key: 'A' },
      { value: 2, label: '有时候，但大事我也会拿主意。', key: 'B' },
      { value: 1, label: '不会，我自己有很强的主见。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  表达力 (Express)  C2
  // ══════════════════════════════════════
  {
    id: 4, text: '你多久会跟对方说一次"我爱你"或类似的话？', dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '每天都说，不说总觉得少了点什么。', key: 'A' },
      { value: 2, label: '偶尔说，重要时刻不缺席。', key: 'B' },
      { value: 1, label: '基本不说，行动比语言重要。', key: 'C' },
    ],
  },
  {
    id: 5, text: '对方做了一件让你感动的事，你会？', dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '当场说出来"你太好了我好幸福"然后发朋友圈。', key: 'A' },
      { value: 2, label: '会表达感谢，但不至于发社交媒体。', key: 'B' },
      { value: 1, label: '心里记着，但嘴上不太会说。', key: 'C' },
    ],
  },
  {
    id: 6, text: '你的朋友圈里有多少关于你们恋爱的内容？', dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '至少占一半，不秀恩爱等于没在谈。', key: 'A' },
      { value: 2, label: '偶尔一条，纪念日和特殊日子会发。', key: 'B' },
      { value: 1, label: '基本没有，对象可能都没出镜过。', key: 'C' },
    ],
  },
  {
    id: 17, text: '想念对方的时候，我更倾向于默默等TA来找我。', dimension: 'C2', model: 'express', reversed: true,
    options: [
      { value: 3, label: '对，我会等，不太好意思先说。', key: 'A' },
      { value: 2, label: '看心情，有时等有时主动。', key: 'B' },
      { value: 1, label: '不等，我会直接说"我想你了快来"。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  冲突力 (Conflict)  C3
  // ══════════════════════════════════════
  {
    id: 7, text: '你和ta吵架了，你的第一反应是？', dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '当场就炸，有话必须马上说清楚。', key: 'A' },
      { value: 2, label: '先冷静一下，过会再谈。', key: 'B' },
      { value: 1, label: '已读不回，等对方先来找我。', key: 'C' },
    ],
  },
  {
    id: 8, text: '吵架时你说过"那就分手吧"吗？', dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '经常挂嘴边，不是真心的但就是要说。', key: 'A' },
      { value: 2, label: '气到极点可能会说一次，但事后后悔。', key: 'B' },
      { value: 1, label: '从不说，这种话一出口就收不回来。', key: 'C' },
    ],
  },
  {
    id: 9, text: '冷战的时候你能坚持多久？', dimension: 'C3', model: 'conflict', reversed: true,
    options: [
      { value: 1, label: '顶多半小时，我忍不住会先开口。', key: 'A' },
      { value: 2, label: '半天到一天，看谁先撑不住。', key: 'B' },
      { value: 3, label: '三天起步，不TA先认错我绝不妥协。', key: 'C' },
    ],
  },
  {
    id: 18, text: '不开心但对方没察觉时，我会主动说出来而不是等TA猜。', dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '会，我不喜欢闷着。', key: 'A' },
      { value: 2, label: '看情况，小事可能不提。', key: 'B' },
      { value: 1, label: '很难，我更希望TA自己发现。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  付出力 (Care)  C4
  // ══════════════════════════════════════
  {
    id: 10, text: '你和ta之间谁更像"照顾人"的那个？', dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '我。操心是我的本能，从吃什么到穿什么。', key: 'A' },
      { value: 2, label: '差不多，互相照顾。', key: 'B' },
      { value: 1, label: 'ta。我更习惯被宠、被安排。', key: 'C' },
    ],
  },
  {
    id: 11, text: '对方生病了，你会？', dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '放下手头所有事冲过去，药买好粥熬好。', key: 'A' },
      { value: 2, label: '先问需要什么，能帮的就帮。', key: 'B' },
      { value: 1, label: '嘴上关心一下，但不至于打乱我的计划。', key: 'C' },
    ],
  },
  {
    id: 12, text: '你觉得自己在关系里更接近哪种？', dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '保姆型——对方的事就是我的事。', key: 'A' },
      { value: 2, label: '搭档型——各管各的偶尔互相搭把手。', key: 'B' },
      { value: 1, label: '小公主/小王子——被宠是理所当然的。', key: 'C' },
    ],
  },
  {
    id: 19, text: '我更享受\"被照顾\"而不是\"去照顾\"的感觉。', dimension: 'C4', model: 'care', reversed: true,
    options: [
      { value: 3, label: '是的，被宠是我恋爱的主旋律。', key: 'A' },
      { value: 2, label: '两者都需要，看场景切换。', key: 'B' },
      { value: 1, label: '不是，我更喜欢主动照顾对方。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  融合度 (Fusion)  C5
  // ══════════════════════════════════════
  {
    id: 13, text: '谈恋爱之后，你和对方的朋友圈重合度高吗？', dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '高，我的朋友就是ta的朋友，经常一起出去。', key: 'A' },
      { value: 2, label: '有一些交集，但各自也有只属于自己的圈子。', key: 'B' },
      { value: 1, label: '基本不重合，我的朋友是我的，ta的是ta的。', key: 'C' },
    ],
  },
  {
    id: 14, text: '周末只有你自己，对方不在，你会？', dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 1, label: '太好了，终于有自己的时间了。', key: 'A' },
      { value: 2, label: '可以接受，但希望不要太频繁。', key: 'B' },
      { value: 3, label: '觉得空落落的，不知道干什么好。', key: 'C' },
    ],
  },
  {
    id: 15, text: '你能接受两个人有完全不同的兴趣爱好吗？', dimension: 'C5', model: 'fusion', reversed: true,
    options: [
      { value: 3, label: '完全能，各玩各的也挺好。', key: 'A' },
      { value: 2, label: '能，但希望至少有一两个共同爱好。', key: 'B' },
      { value: 1, label: '很难，我觉得有共同爱好是在一起的基础。', key: 'C' },
    ],
  },
  {
    id: 20, text: '我经常会想\"如果ta也能喜欢我喜欢的东西就好了\"。', dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 1, label: '不会，ta有自己的喜好挺好的。', key: 'A' },
      { value: 2, label: '偶尔想过，但也尊重差异。', key: 'B' },
      { value: 3, label: '经常，同频才有话聊啊。', key: 'C' },
    ],
  },
];

export function shuffleCptiQuestions(questions: CptiQuestion[]): CptiQuestion[] {
  return sampleQuestionsByDimension(questions, 4);
}
