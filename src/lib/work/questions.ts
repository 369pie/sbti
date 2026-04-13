import { sampleQuestionsByDimension } from '../question-pool';
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
  {
    id: 16, text: '没有明确 deadline 的事，我很容易先往后放。', dimension: 'W1', model: 'drive', reversed: true,
    options: [
      { value: 3, label: '是，没截止就像没开始。', key: 'A' },
      { value: 2, label: '偶尔会拖一下，但不会拖太久。', key: 'B' },
      { value: 1, label: '不会，我通常会先推一点把它启动。', key: 'C' },
    ],
  },
  {
    id: 17, text: '就算没人看见，我也想把手上的东西做得像回事。', dimension: 'W1', model: 'drive', reversed: false,
    options: [
      { value: 1, label: '能交就行，别上升成作品。', key: 'A' },
      { value: 2, label: '重要的事会，普通活看情况。', key: 'B' },
      { value: 3, label: '会，我对自己交出去的东西还是有要求。', key: 'C' },
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
  {
    id: 18, text: '如果开会前要和一屋子不熟的人寒暄，我心里会先叹口气。', dimension: 'W2', model: 'social', reversed: true,
    options: [
      { value: 3, label: '会，光想想就累。', key: 'A' },
      { value: 2, label: '分场合，熟一点还好。', key: 'B' },
      { value: 1, label: '不会，这种场面对我不算难。', key: 'C' },
    ],
  },
  {
    id: 19, text: '跨部门拉群、约人碰口径这种事，我通常不太怵。', dimension: 'W2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '挺怵的，能躲就想躲。', key: 'A' },
      { value: 2, label: '能做，但要先做点心理建设。', key: 'B' },
      { value: 3, label: '不太怵，有时候我还会顺手把场子带起来。', key: 'C' },
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
  {
    id: 20, text: '白天挨完一顿说，晚上我很难真的下班。', dimension: 'W3', model: 'stress', reversed: true,
    options: [
      { value: 3, label: '是，脑子会一直回放。', key: 'A' },
      { value: 2, label: '偶尔会带回家，但不至于每次。', key: 'B' },
      { value: 1, label: '不会太久，我通常能把情绪慢慢放下。', key: 'C' },
    ],
  },
  {
    id: 21, text: '事情一多，我反而更容易先把轻重缓急捋出来。', dimension: 'W3', model: 'stress', reversed: false,
    options: [
      { value: 1, label: '不太行，我会先乱。', key: 'A' },
      { value: 2, label: '能捋一点，但偶尔还是会卡住。', key: 'B' },
      { value: 3, label: '是，越乱我越想先排序。', key: 'C' },
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
  {
    id: 22, text: '只要流程能自己跑一会儿，我会给自己争取点喘气时间。', dimension: 'W4', model: 'slack', reversed: false,
    options: [
      { value: 1, label: '不会，我闲下来就会找下一个活。', key: 'A' },
      { value: 2, label: '偶尔会，看今天忙不忙。', key: 'B' },
      { value: 3, label: '会，能省出来的空我一般不会白白放过。', key: 'C' },
    ],
  },
  {
    id: 23, text: '手头一空，我反而会本能找点正事把自己塞满。', dimension: 'W4', model: 'slack', reversed: true,
    options: [
      { value: 3, label: '是，闲着我会不自在。', key: 'A' },
      { value: 2, label: '看状态，有时想歇有时想补活。', key: 'B' },
      { value: 1, label: '不会，有空我当然先透口气。', key: 'C' },
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
  {
    id: 24, text: '比起往上爬，我更在意这份工作能不能让我安稳睡觉。', dimension: 'W5', model: 'ambition', reversed: true,
    options: [
      { value: 3, label: '是，稳定对我更重要。', key: 'A' },
      { value: 2, label: '两边都重要，要看阶段。', key: 'B' },
      { value: 1, label: '不太是，我还是会盯着更高的位置。', key: 'C' },
    ],
  },
  {
    id: 25, text: '看到更高的位置空出来，我会认真想自己能不能去坐。', dimension: 'W5', model: 'ambition', reversed: false,
    options: [
      { value: 1, label: '第一反应是别找我加活。', key: 'A' },
      { value: 2, label: '会想，但不一定真上。', key: 'B' },
      { value: 3, label: '会，而且通常会盘一盘怎么争。', key: 'C' },
    ],
  },
];

export function shuffleWorkQuestions(questions: WorkQuestion[]): WorkQuestion[] {
  return sampleQuestionsByDimension(questions, 4);
}
