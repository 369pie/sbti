/**
 * 暗恋观察题库 — 12 道「偷偷测CP感」专用题目
 *
 * 与普通他评不同，这套题从"观察者/暗恋者"视角出发，
 * 不假设你们已经在一起，而是根据你对TA的观察和了解来推测。
 *
 * 每个维度 2-3 题，文案用"你观察到的TA"角度。
 */
import type { CptiModelType } from './dimensions';
import type { CptiPeerQuestion } from './peer-questions';

export const CPTI_STEALTH_QUESTIONS: CptiPeerQuestion[] = [
  // ══════════════════════════════════════
  //  主导力 (Power)  C1
  // ══════════════════════════════════════
  {
    id: 201, text: '在朋友聚会或者小组活动里，TA通常是什么角色？',
    dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '自然而然就是组织者，大家都听TA的。', key: 'A' },
      { value: 2, label: '不会主动安排，但关键时刻会拿主意。', key: 'B' },
      { value: 1, label: '跟着走就好，不太爱操心这些。', key: 'C' },
    ],
  },
  {
    id: 202, text: '如果你们一起点外卖，你觉得TA会怎样？',
    dimension: 'C1', model: 'power', reversed: false,
    options: [
      { value: 3, label: 'TA已经选好了，甚至帮你也选了。', key: 'A' },
      { value: 2, label: '各自选，但TA会提建议。', key: 'B' },
      { value: 1, label: '"随便，你定就行。"', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  表达力 (Express)  C2
  // ══════════════════════════════════════
  {
    id: 203, text: '你观察到TA和朋友/恋人的互动，TA的情感表达算什么水平？',
    dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '很外放，夸人、撒娇、说想你都不带犹豫。', key: 'A' },
      { value: 2, label: '正常水平，开心了会表现但不会太腻。', key: 'B' },
      { value: 1, label: '闷葫芦型，喜欢谁也看不太出来。', key: 'C' },
    ],
  },
  {
    id: 204, text: 'TA发朋友圈/社交媒体的风格是？',
    dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '频率高、内容丰富，能看出TA的心情。', key: 'A' },
      { value: 2, label: '偶尔发，但内容质量还不错。', key: 'B' },
      { value: 1, label: '几乎不发，朋友圈三天可见或者空白。', key: 'C' },
    ],
  },
  {
    id: 205, text: '你觉得TA是那种收到礼物/帮忙后会怎么回应的人？',
    dimension: 'C2', model: 'express', reversed: false,
    options: [
      { value: 3, label: '当面就开始感动+一串谢谢，特别真诚。', key: 'A' },
      { value: 2, label: '会说谢谢，但不至于太夸张。', key: 'B' },
      { value: 1, label: '默默记在心里，不太会当面表达。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  冲突力 (Conflict)  C3
  // ══════════════════════════════════════
  {
    id: 206, text: '据你观察，TA跟别人产生分歧的时候一般怎么处理？',
    dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '直接说出来，有什么就摊开讲。', key: 'A' },
      { value: 2, label: '委婉表达，不会硬杠但也不会忍着。', key: 'B' },
      { value: 1, label: '能忍就忍，实在不行悄悄远离。', key: 'C' },
    ],
  },
  {
    id: 207, text: '如果你做了让TA不舒服的事，你觉得TA会？',
    dimension: 'C3', model: 'conflict', reversed: false,
    options: [
      { value: 3, label: '直接告诉我哪里不对，TA不憋着。', key: 'A' },
      { value: 2, label: '可能会暗示，看我自己能不能接收到。', key: 'B' },
      { value: 1, label: '大概率笑笑带过，什么也不说。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  付出力 (Care)  C4
  // ══════════════════════════════════════
  {
    id: 208, text: '你感觉TA对身边亲近的人是什么风格？',
    dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '特别操心，谁生病了TA比本人还着急。', key: 'A' },
      { value: 2, label: '关心但有分寸，不会过度参与。', key: 'B' },
      { value: 1, label: '比较独立，不太管别人的闲事。', key: 'C' },
    ],
  },
  {
    id: 209, text: '如果你遇到麻烦找TA帮忙，你觉得TA会？',
    dimension: 'C4', model: 'care', reversed: false,
    options: [
      { value: 3, label: '二话不说就来了，比我自己还上心。', key: 'A' },
      { value: 2, label: '会帮，但也会看一下自己方不方便。', key: 'B' },
      { value: 1, label: '嘴上答应，但实际到位率不太稳定。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  融合度 (Fusion)  C5
  // ══════════════════════════════════════
  {
    id: 210, text: '你觉得TA的社交风格是？',
    dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '喜欢跟亲近的人绑在一起，走哪带哪。', key: 'A' },
      { value: 2, label: '有自己的圈子也乐意合群，看场合。', key: 'B' },
      { value: 1, label: '独立型，一个人也乐在其中。', key: 'C' },
    ],
  },
  {
    id: 211, text: '如果你们在一起了，你猜TA会希望？',
    dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '天天腻在一起，连爱好都要同步。', key: 'A' },
      { value: 2, label: '有各自空间，但重要时刻一起。', key: 'B' },
      { value: 1, label: '保持各自独立，"不打扰是我的温柔"。', key: 'C' },
    ],
  },
  {
    id: 212, text: '据你了解，TA对恋爱里的"边界感"是什么态度？',
    dimension: 'C5', model: 'fusion', reversed: false,
    options: [
      { value: 3, label: '恋爱了就是一体的，查手机也没问题。', key: 'A' },
      { value: 2, label: '尊重隐私，但重要的事要共享。', key: 'B' },
      { value: 1, label: '边界感很强，TA的世界不太会全部敞开。', key: 'C' },
    ],
  },
];

export function shuffleCptiStealthQuestions(questions: CptiPeerQuestion[]): CptiPeerQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
