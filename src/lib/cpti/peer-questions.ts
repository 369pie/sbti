/**
 * 他评题库 — 12 道观察者视角问题 (Mode C: 帮ta答)
 * 每个维度 2-3 题，文案从"TA是怎样的"角度出发
 */
import type { CptiModelType } from './dimensions';

export interface CptiPeerQuestion {
  id: number;
  text: string;
  dimension: string;
  model: CptiModelType;
  reversed: boolean;
  options: { label: string; value: 1 | 2 | 3; key: string }[];
}

export const CPTI_PEER_QUESTIONS: CptiPeerQuestion[] = [
  // ══════════════════════════════════════
  //  主导力 (Power)  C1
  // ══════════════════════════════════════
  {
    id: 101, text: '你们一起出门，通常谁拿主意？', dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: 'TA来决定，安排得明明白白。', key: 'A' },
      { value: 2, label: '看情况，有时TA定有时我定。', key: 'B' },
      { value: 1, label: '基本是我决定，TA跟着就行。', key: 'C' },
    ],
  },
  {
    id: 102, text: '你们意见不合的时候，TA通常怎么做？', dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '坚持TA的想法，有理有据说服我。', key: 'A' },
      { value: 2, label: '谁有道理听谁的，不会硬来。', key: 'B' },
      { value: 1, label: 'TA一般让着我，不太爱争。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  表达力 (Express)  C2
  // ══════════════════════════════════════
  {
    id: 103, text: 'TA会经常对你说"我喜欢你"之类的话吗？', dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '天天说，嘴甜到腻。', key: 'A' },
      { value: 2, label: '偶尔说，不算多也不算少。', key: 'B' },
      { value: 1, label: '基本不说，TA不是那种类型。', key: 'C' },
    ],
  },
  {
    id: 104, text: 'TA想你的时候会怎么表现？', dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '直接说出来，打电话发消息不带犹豫。', key: 'A' },
      { value: 2, label: '发个表情包暗示一下。', key: 'B' },
      { value: 1, label: '默默等我联系TA，不太主动。', key: 'C' },
    ],
  },
  {
    id: 105, text: 'TA的朋友圈里会出现关于你们恋爱的内容吗？', dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '会，经常秀恩爱。', key: 'A' },
      { value: 2, label: '偶尔一条，纪念日什么的。', key: 'B' },
      { value: 1, label: '从来没有，TA的朋友圈看不出在恋爱。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  冲突力 (Conflict)  C3
  // ══════════════════════════════════════
  {
    id: 106, text: '你们吵架的时候TA通常什么反应？', dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '当场爆发，有什么说什么。', key: 'A' },
      { value: 2, label: '先冷静一会再来谈。', key: 'B' },
      { value: 1, label: '沉默、已读不回、冷处理。', key: 'C' },
    ],
  },
  {
    id: 107, text: 'TA不开心但你没察觉的时候会怎么做？', dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '直接告诉我哪里不对。', key: 'A' },
      { value: 2, label: '暗示一两句，等我反应。', key: 'B' },
      { value: 1, label: '闷着不说，等我自己发现。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  付出力 (Care)  C4
  // ══════════════════════════════════════
  {
    id: 108, text: '你生病的时候TA会怎么做？', dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '放下一切来照顾我，药粥全安排好。', key: 'A' },
      { value: 2, label: '会关心，但不至于放下手头的事。', key: 'B' },
      { value: 1, label: '嘴上说几句"多喝水"，不太有行动。', key: 'C' },
    ],
  },
  {
    id: 109, text: '你觉得TA在你们关系里更像什么角色？', dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '操心的老妈/老爸，什么都替我想好了。', key: 'A' },
      { value: 2, label: '平等的搭档，互相照顾。', key: 'B' },
      { value: 1, label: '被宠的小孩，等着我来安排。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  融合度 (Fusion)  C5
  // ══════════════════════════════════════
  {
    id: 110, text: 'TA的朋友圈子和你的重合度高吗？', dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '高，TA的朋友基本也是我朋友。', key: 'A' },
      { value: 2, label: '有交叉但各自也有独立圈子。', key: 'B' },
      { value: 1, label: '基本不重合，TA保持自己的社交圈。', key: 'C' },
    ],
  },
  {
    id: 111, text: '周末你有自己的安排不陪TA，TA的反应是？', dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '会失落，TA不太习惯我不在。', key: 'A' },
      { value: 2, label: '可以接受，但希望不要太频繁。', key: 'B' },
      { value: 1, label: '完全没问题，TA也正好有自己的事。', key: 'C' },
    ],
  },
  {
    id: 112, text: 'TA有要求你也喜欢TA喜欢的东西吗？', dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '有，TA很希望我们有共同爱好。', key: 'A' },
      { value: 2, label: '偶尔带我试试，但不强求。', key: 'B' },
      { value: 1, label: '从不，TA觉得各有各的挺好。', key: 'C' },
    ],
  },
];

export function shuffleCptiPeerQuestions(questions: CptiPeerQuestion[]): CptiPeerQuestion[] {
  // Simple Fisher-Yates shuffle
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
