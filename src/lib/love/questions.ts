import type { LoveModelType } from './dimensions';

export interface LoveAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface LoveQuestion {
  id: number;
  text: string;
  dimension: string;
  model: LoveModelType;
  reversed: boolean;
  options?: LoveAnswerOption[];
}

// ── 默认选项 ──
export const LOVE_DEFAULT_OPTIONS: LoveAnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const LOVE_QUESTIONS: LoveQuestion[] = [
  // ══════════════════════════════════════
  //  依赖度 (Depend)  L1
  // ══════════════════════════════════════
  {
    id: 1, text: '对方一小时没回消息，你的第一反应是？', dimension: 'L1', model: 'depend', reversed: false,
    options: [
      { value: 1, label: '没注意到，我也在忙自己的事。', key: 'A' },
      { value: 2, label: '看到了，但不至于焦虑。', key: 'B' },
      { value: 3, label: '已经检查了三遍网络连接和对方在线状态。', key: 'C' },
    ],
  },
  {
    id: 2, text: '周末对方有自己的安排不能陪你，你会？', dimension: 'L1', model: 'depend', reversed: false,
    options: [
      { value: 1, label: '太好了，我正好也想自己待着。', key: 'A' },
      { value: 2, label: '有点可惜，但也能理解。', key: 'B' },
      { value: 3, label: '开始怀疑是不是不爱我了。', key: 'C' },
    ],
  },
  {
    id: 3, text: '你能接受和对象一整天不联系吗？', dimension: 'L1', model: 'depend', reversed: false,
    options: [
      { value: 1, label: '完全没问题，各过各的很正常。', key: 'A' },
      { value: 2, label: '可以，但至少得说声晚安。', key: 'B' },
      { value: 3, label: '不行，那跟没在谈恋爱有什么区别？', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  吃醋指数 (Jealous)  L2
  // ══════════════════════════════════════
  {
    id: 4, text: '对象的异性朋友给TA发了一个"😊"，你的反应？', dimension: 'L2', model: 'jealous', reversed: false,
    options: [
      { value: 1, label: '一个表情而已，不至于。', key: 'A' },
      { value: 2, label: '会多看一眼，但不会说什么。', key: 'B' },
      { value: 3, label: '截图放大分析这个表情的深层含义。', key: 'C' },
    ],
  },
  {
    id: 5, text: '对象夸别人"好看"，你的内心戏是？', dimension: 'L2', model: 'jealous', reversed: false,
    options: [
      { value: 1, label: '审美正常，我也觉得好看。', key: 'A' },
      { value: 2, label: '嗯……行吧，但不要夸太多次。', key: 'B' },
      { value: 3, label: '那你和好看的人在一起吧！', key: 'C' },
    ],
  },
  {
    id: 6, text: '对象手机收到一条消息，TA笑了一下但没给你看，你会？', dimension: 'L2', model: 'jealous', reversed: false,
    options: [
      { value: 1, label: '人家有自己的社交很正常。', key: 'A' },
      { value: 2, label: '好奇会问一嘴，但不强求看。', key: 'B' },
      { value: 3, label: '开始在脑子里上演完整的出轨剧情。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  恋爱脑等级 (Brain)  L3
  // ══════════════════════════════════════
  {
    id: 7, text: '恋爱和升职加薪冲突了，你选？', dimension: 'L3', model: 'brain', reversed: false,
    options: [
      { value: 1, label: '升职加薪，爱情又不能当饭吃。', key: 'A' },
      { value: 2, label: '看具体情况，尝试两个都要。', key: 'B' },
      { value: 3, label: '选爱情！有爱饮水饱！', key: 'C' },
    ],
  },
  {
    id: 8, text: '谈恋爱之后，你的朋友圈画风变化大吗？', dimension: 'L3', model: 'brain', reversed: false,
    options: [
      { value: 1, label: '完全没变，对象可能都没出镜过。', key: 'A' },
      { value: 2, label: '偶尔秀一下，但不会腻到刷屏。', key: 'B' },
      { value: 3, label: '全是两个人的合影和日常，单身朋友已经屏蔽我了。', key: 'C' },
    ],
  },
  {
    id: 9, text: '对象一句"你不爱我了"就能让你？', dimension: 'L3', model: 'brain', reversed: false,
    options: [
      { value: 1, label: '觉得对方在无理取闹。', key: 'A' },
      { value: 2, label: '认真解释一番，但不会太上头。', key: 'B' },
      { value: 3, label: '立刻放下手里所有事去哄。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  安全感 (Secure)  L4
  // ══════════════════════════════════════
  {
    id: 10, text: '对象出差三天没怎么联系你，你会？', dimension: 'L4', model: 'secure', reversed: false,
    options: [
      { value: 3, label: '忙就忙吧，回来请我吃顿好的就行。', key: 'A' },
      { value: 2, label: '能理解，但如果能多说两句会更好。', key: 'B' },
      { value: 1, label: '三天？？每一秒都在想是不是出事了。', key: 'C' },
    ],
  },
  {
    id: 11, text: '你相信对象说的"TA只是普通朋友"吗？', dimension: 'L4', model: 'secure', reversed: false,
    options: [
      { value: 3, label: '信，我对我们的关系有信心。', key: 'A' },
      { value: 2, label: '嘴上信了，心里还是要观察一下。', key: 'B' },
      { value: 1, label: '普通朋友需要凌晨聊天吗？？', key: 'C' },
    ],
  },
  {
    id: 12, text: '对象没有主动说"我爱你"的习惯，你能接受吗？', dimension: 'L4', model: 'secure', reversed: false,
    options: [
      { value: 3, label: '行动比语言重要，不说也没关系。', key: 'A' },
      { value: 2, label: '能接受，但偶尔还是想听到。', key: 'B' },
      { value: 1, label: '不说=不爱，每天都想确认。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  作妖指数 (Drama)  L5
  // ══════════════════════════════════════
  {
    id: 13, text: '你会故意不回消息来"考验"对方吗？', dimension: 'L5', model: 'drama', reversed: false,
    options: [
      { value: 1, label: '不会，有话直说。', key: 'A' },
      { value: 2, label: '偶尔吧，但不经常。', key: 'B' },
      { value: 3, label: '是的，看TA急不急就知道爱不爱了。', key: 'C' },
    ],
  },
  {
    id: 14, text: '吵架的时候你会说"那我们分手吧"吗？', dimension: 'L5', model: 'drama', reversed: false,
    options: [
      { value: 1, label: '不会，分手这种话不能随便说。', key: 'A' },
      { value: 2, label: '气到极点可能会说，但不是真心的。', key: 'B' },
      { value: 3, label: '经常挂在嘴边，看谁先服软。', key: 'C' },
    ],
  },
  {
    id: 15, text: '感情太平淡的时候，你会——', dimension: 'L5', model: 'drama', reversed: false,
    options: [
      { value: 1, label: '享受平淡，细水长流很好。', key: 'A' },
      { value: 2, label: '偶尔制造点小惊喜或小摩擦。', key: 'B' },
      { value: 3, label: '必须搞点事情，不闹不是爱情。', key: 'C' },
    ],
  },
];

export function shuffleLoveQuestions(questions: LoveQuestion[]): LoveQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
