import type { WorkModelType } from './dimensions';

export interface WorkAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface WorkQuestion {
  id: number;
  text: string;
  dimension: string;
  model: WorkModelType;
  reversed: boolean;
  options?: WorkAnswerOption[];
}

// ── 默认选项 ──
export const WORK_DEFAULT_OPTIONS: WorkAnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const WORK_QUESTIONS: WorkQuestion[] = [
  // ══════════════════════════════════════
  //  工作驱动力 (Drive)  W1
  // ══════════════════════════════════════
  {
    id: 1, text: '上班第一件事你通常是？', dimension: 'W1', model: 'drive', reversed: false,
    options: [
      { value: 1, label: '先打开外卖 App 想想中午吃啥。', key: 'A' },
      { value: 2, label: '泡杯咖啡缓缓再说。', key: 'B' },
      { value: 3, label: '打开待办清单，挨个划掉。', key: 'C' },
    ],
  },
  {
    id: 2, text: '就算没人催我也会主动推进手头的工作。', dimension: 'W1', model: 'drive', reversed: false,
    options: [
      { value: 1, label: '不催等于不急，不急等于不做。', key: 'A' },
      { value: 2, label: '看心情，状态好的时候会。', key: 'B' },
      { value: 3, label: '是的，闲着反而浑身难受。', key: 'C' },
    ],
  },
  {
    id: 3, text: '看到同事比你效率高，你内心戏是？', dimension: 'W1', model: 'drive', reversed: false,
    options: [
      { value: 1, label: '效率高活就多，谢谢，不必。', key: 'A' },
      { value: 2, label: '有点佩服，但不至于较劲。', key: 'B' },
      { value: 3, label: '暗暗跟自己较劲，必须追上。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  职场社交 (Social)  W2
  // ══════════════════════════════════════
  {
    id: 4, text: '茶水间遇到不太熟的同事，你会？', dimension: 'W2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '假装看手机，避免眼神接触。', key: 'A' },
      { value: 2, label: '点头微笑，礼貌但不展开。', key: 'B' },
      { value: 3, label: '主动搭话，「哟，今天喝什么？」', key: 'C' },
    ],
  },
  {
    id: 5, text: '公司组织团建，你的第一反应是？', dimension: 'W2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '算了吧，我想把假期留给自己。', key: 'A' },
      { value: 2, label: '看是什么活动再决定。', key: 'B' },
      { value: 3, label: '冲！认识新朋友的好机会！', key: 'C' },
    ],
  },
  {
    id: 6, text: '你能叫出隔壁部门同事的名字吗？', dimension: 'W2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '我连自己部门有几个人都数不清。', key: 'A' },
      { value: 2, label: '认识几个常打照面的。', key: 'B' },
      { value: 3, label: '大部分都能叫出来，社交达人不是白叫的。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  抗压能力 (Stress)  W3
  // ══════════════════════════════════════
  {
    id: 7, text: '被领导当着全组的面批评了，五分钟后你的状态是？', dimension: 'W3', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '已经在心里写了三封辞职信。', key: 'A' },
      { value: 2, label: '有点不爽，但还能继续干活。', key: 'B' },
      { value: 3, label: '调整好了，该改改该干干。', key: 'C' },
    ],
  },
  {
    id: 8, text: '同时处理三件加急的事，你更接近？', dimension: 'W3', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '系统崩溃，蓝屏中……', key: 'A' },
      { value: 2, label: '有点紧张，但还能排序。', key: 'B' },
      { value: 3, label: '三件？小意思，我能同时开五个线程。', key: 'C' },
    ],
  },
  {
    id: 9, text: '工作压力再大，也不太会影响我晚上的睡眠。', dimension: 'W3', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '影响巨大，凌晨三点还在复盘白天的事。', key: 'A' },
      { value: 2, label: '偶尔会失眠，但不至于经常。', key: 'B' },
      { value: 3, label: '出了公司门就把工作忘了，沾枕头就睡。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  摸鱼指数 (Slack)  W4
  // ══════════════════════════════════════
  {
    id: 10, text: '上班摸手机这件事——', dimension: 'W4', model: 'slack', reversed: false,
    options: [
      { value: 1, label: '从不摸，我是工作机器。', key: 'A' },
      { value: 2, label: '会摸，但有分寸。', key: 'B' },
      { value: 3, label: '我有一套不被发现的完整方法论。', key: 'C' },
    ],
  },
  {
    id: 11, text: '离 deadline 超过三天的任务，你会？', dimension: 'W4', model: 'slack', reversed: false,
    options: [
      { value: 1, label: '提前完成，多出来的时间摸鱼。', key: 'A' },
      { value: 2, label: '第二天开始做。', key: 'B' },
      { value: 3, label: '最后一天，启动！', key: 'C' },
    ],
  },
  {
    id: 12, text: '只要结果交得出来，过程怎么摸都无所谓。', dimension: 'W4', model: 'slack', reversed: false,
    options: [
      { value: 1, label: '不行，过程也得对得起良心。', key: 'A' },
      { value: 2, label: '有道理但不完全同意。', key: 'B' },
      { value: 3, label: '完全同意，打工人的核心奥义。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  野心指数 (Ambition)  W5
  // ══════════════════════════════════════
  {
    id: 13, text: '你经常在想三年后自己要做到什么位置吗？', dimension: 'W5', model: 'ambition', reversed: false,
    options: [
      { value: 1, label: '三年后？我连下周吃啥都没想。', key: 'A' },
      { value: 2, label: '有个大概方向，但没精确规划。', key: 'B' },
      { value: 3, label: '有，而且精确到季度OKR。', key: 'C' },
    ],
  },
  {
    id: 14, text: '有升职机会的时候，你会？', dimension: 'W5', model: 'ambition', reversed: false,
    options: [
      { value: 1, label: '升职=更多活，谢谢下一位。', key: 'A' },
      { value: 2, label: '如果条件合适会考虑。', key: 'B' },
      { value: 3, label: '第一个冲上去争取！', key: 'C' },
    ],
  },
  {
    id: 15, text: '打工只是暂时的，我迟早会自己干一番事业。', dimension: 'W5', model: 'ambition', reversed: false,
    options: [
      { value: 1, label: '打工挺好的，稳定万岁。', key: 'A' },
      { value: 2, label: '偶尔想想，但没认真行动。', key: 'B' },
      { value: 3, label: '必须的，老板椅迟早是我的。', key: 'C' },
    ],
  },
];

export function shuffleWorkQuestions(questions: WorkQuestion[]): WorkQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
