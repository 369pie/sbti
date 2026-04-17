/**
 * WTFTI 4 轴场景投射题（30 题样本）
 *
 * 题源 / 设计原则见 docs/01-strategy/wtfti-sample-questions-wtfi-2026-04-18.md
 *
 * 每个选项给 1-2 个轴贡献向量，最终累加 / 归一化到 -3..+3。
 */

import type { WtfiAxis } from './axes';

export type AxisVector = Partial<Record<WtfiAxis, number>>;

export interface ScenarioOption {
  key: 'A' | 'B' | 'C';
  label: string;
  vector: AxisVector;
}

export type QuestionCategory = 'main' | 'contrast' | 'trigger';

export interface ScenarioQuestion {
  id: number;
  text: string;
  scene: string;
  category: QuestionCategory;
  primaryAxis: WtfiAxis;
  options: ScenarioOption[];
}

export const WTFI_SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  // ── W 轴 · 触发反应（6 题） ────────────────────────────
  {
    id: 1,
    primaryAxis: 'W',
    category: 'main',
    scene: '凌晨 1 点群消息',
    text: '你已经躺下，凌晨 1 点工作群突然 @ 你说"明早 9 点要交一版方案"。第一反应是？',
    options: [
      { key: 'A', label: '立刻坐起来打开电脑，反正是被点名了', vector: { W: 3, F: 1 } },
      { key: 'B', label: '心里咯噔一下，刷半小时手机才睡', vector: { W: 1, T: -1 } },
      { key: 'C', label: '看一眼，关消息提醒，原计划睡觉', vector: { W: -2, I: 2 } },
    ],
  },
  {
    id: 2,
    primaryAxis: 'W',
    category: 'main',
    scene: '地铁陌生人凝视',
    text: '地铁里你抬头，一个陌生人正盯着你看了大概 3 秒。',
    options: [
      { key: 'A', label: '直接对视回去，看谁先撤', vector: { W: 2, I: 2 } },
      { key: 'B', label: '低头看手机，但开始想"我哪里有问题"', vector: { W: 1, T: -2 } },
      { key: 'C', label: '没什么感觉，可能 ta 在发呆', vector: { W: -3 } },
    ],
  },
  {
    id: 3,
    primaryAxis: 'W',
    category: 'main',
    scene: '朋友突然消失三天',
    text: '很要好的朋友连续三天没回消息。',
    options: [
      { key: 'A', label: '直接打电话过去："你死了吗？"', vector: { W: 2, T: 2 } },
      { key: 'B', label: '默默想这事一整天，但不主动联系', vector: { W: 1, T: -2 } },
      { key: 'C', label: 'ta 大概在忙，不至于的', vector: { W: -2, F: -1 } },
    ],
  },
  {
    id: 4,
    primaryAxis: 'W',
    category: 'main',
    scene: '外卖出错',
    text: '点的麻辣香锅送来是麻辣烫，价格还多扣了 5 块。',
    options: [
      { key: 'A', label: '立刻投诉 + 申请退款 + 给差评', vector: { W: 3 } },
      { key: 'B', label: '心里骂一句，但懒得弄', vector: { W: 1, F: -1 } },
      { key: 'C', label: '5 块就 5 块，将就吃了', vector: { W: -3, I: 1 } },
    ],
  },
  {
    id: 5,
    primaryAxis: 'W',
    category: 'main',
    scene: '久违的朋友圈点赞',
    text: '暗恋对象 / 前任突然给你 3 个月前的朋友圈点了一个赞。',
    options: [
      { key: 'A', label: '立刻分析这个赞背后的潜台词，截图发闺蜜群', vector: { W: 3, T: 2 } },
      { key: 'B', label: '假装平静，但反复回看自己那条朋友圈', vector: { W: 1, T: -2 } },
      { key: 'C', label: '哦，可能手滑', vector: { W: -2, I: 2 } },
    ],
  },
  {
    id: 6,
    primaryAxis: 'W',
    category: 'main',
    scene: '让你不舒服的新闻',
    text: '刷到一条让你不舒服的社会新闻。',
    options: [
      { key: 'A', label: '立刻转发 + 写长评', vector: { W: 2, T: 2 } },
      { key: 'B', label: '难受一下午，但什么都不发', vector: { W: 1, T: -2 } },
      { key: 'C', label: '划走，世界本来就这样', vector: { W: -2 } },
    ],
  },

  // ── T 轴 · 情绪倾斜（6 题） ────────────────────────────
  {
    id: 7,
    primaryAxis: 'T',
    category: 'main',
    scene: '被批评后的 24 小时',
    text: '今天被领导 / 老师 / 在乎的人不留情面地批评了一次。接下来 24 小时你最可能？',
    options: [
      { key: 'A', label: '立刻找朋友吐槽，喝两杯，吐完就好了', vector: { T: 3, W: 1 } },
      { key: 'B', label: '在心里反复回放那段对话，分析自己哪里错了', vector: { T: -3 } },
      { key: 'C', label: '吃顿大的，明天继续', vector: { T: 1, F: 1 } },
    ],
  },
  {
    id: 8,
    primaryAxis: 'T',
    category: 'main',
    scene: '周日晚上 10 点',
    text: '周日晚上 10 点，明天要上班 / 上课。',
    options: [
      { key: 'A', label: '已经在朋友圈发"周一恐惧"段子了', vector: { T: 2, W: 1 } },
      { key: 'B', label: '默默躺在床上想人生意义', vector: { T: -3 } },
      { key: 'C', label: '列好明天 to-do，洗漱睡觉', vector: { F: 2, I: 1 } },
    ],
  },
  {
    id: 9,
    primaryAxis: 'T',
    category: 'main',
    scene: '随机到一首老歌',
    text: '耳机里随机到一首跟前任有关的歌。',
    options: [
      { key: 'A', label: '立刻发动态："这首歌真应景"', vector: { T: 2, W: 1 } },
      { key: 'B', label: '切歌，但 ta 的影子在脑子里转一晚', vector: { T: -2, F: -1 } },
      { key: 'C', label: '听完了下一首继续', vector: { I: 1 } },
    ],
  },
  {
    id: 10,
    primaryAxis: 'T',
    category: 'main',
    scene: '陌生人的善意',
    text: '早高峰，前面陌生人帮你按住了电梯门。',
    options: [
      { key: 'A', label: '笑着说谢谢 + 觉得今天会顺', vector: { T: 2, I: -1 } },
      { key: 'B', label: '谢谢之后开始想"我是不是应该也帮别人"', vector: { T: -1, I: -1 } },
      { key: 'C', label: '点头进电梯，没什么特别的', vector: { I: 2 } },
    ],
  },
  {
    id: 11,
    primaryAxis: 'T',
    category: 'main',
    scene: '朋友的喜事',
    text: '朋友升职 / 恋爱 / 出书 / 搬新家。',
    options: [
      { key: 'A', label: '真心高兴，张罗一顿庆祝', vector: { T: 2, W: 1 } },
      { key: 'B', label: '嘴上恭喜，心里有一点说不清的复杂', vector: { T: -2 } },
      { key: 'C', label: '发个红包 / 礼物，不刻意凑热闹', vector: { I: 1 } },
    ],
  },
  {
    id: 12,
    primaryAxis: 'T',
    category: 'main',
    scene: '雨天等人',
    text: '约好的人迟到 30 分钟还没到，外面在下雨。',
    options: [
      { key: 'A', label: '一边发信息催 ta，一边发朋友圈"等人 ing"', vector: { T: 2, W: 2 } },
      { key: 'B', label: '静静站着，想"是不是 ta 不想来"', vector: { T: -2, W: 1 } },
      { key: 'C', label: '找个咖啡店坐下，ta 来了再说', vector: { F: 1 } },
    ],
  },

  // ── F 轴 · 应对弹性（6 题） ────────────────────────────
  {
    id: 13,
    primaryAxis: 'F',
    category: 'main',
    scene: '方案被全否',
    text: '花了两周做的方案，被一句话全否。',
    options: [
      { key: 'A', label: '立刻问"那您觉得方向应该是什么"，下午就改', vector: { F: 3, W: 1 } },
      { key: 'B', label: '嘴上同意，回去原方案改个标题再交', vector: { F: -2, I: 1 } },
      { key: 'C', label: '接受，但需要一晚消化情绪后才能动', vector: { F: 1, T: -1 } },
    ],
  },
  {
    id: 14,
    primaryAxis: 'F',
    category: 'main',
    scene: '健身计划第 7 天',
    text: '你立了 30 天健身 flag，第 7 天突然不想去。',
    options: [
      { key: 'A', label: '换一种运动，今天去跳 keep', vector: { F: 2 } },
      { key: 'B', label: '硬着头皮也去，flag 不能倒', vector: { F: -3, I: 1 } },
      { key: 'C', label: '直接放弃，下个月再立新 flag', vector: { F: 1, W: -1 } },
    ],
  },
  {
    id: 15,
    primaryAxis: 'F',
    category: 'main',
    scene: '关系反复',
    text: '跟伴侣 / 暧昧对象，吵架→和好→吵架→和好，已经第 5 轮。',
    options: [
      { key: 'A', label: '第 5 轮后开始想"是不是该换个相处方式"', vector: { F: 2 } },
      { key: 'B', label: '反正每次都和好，下次还会和好', vector: { F: -2, I: -1 } },
      { key: 'C', label: '第 5 轮直接断，没必要再循环', vector: { F: 2, I: 2 } },
    ],
  },
  {
    id: 16,
    primaryAxis: 'F',
    category: 'main',
    scene: '通勤路堵死',
    text: '通勤路上突发事故，导航说要堵 1 小时。',
    options: [
      { key: 'A', label: '立刻下车，换地铁 / 共享单车', vector: { F: 3, W: 1 } },
      { key: 'B', label: '算了认命堵着，反正下车也未必快', vector: { F: -2 } },
      { key: 'C', label: '边堵边在车里开线上会议', vector: { F: 2, W: 1 } },
    ],
  },
  {
    id: 17,
    primaryAxis: 'F',
    category: 'main',
    scene: '学了一半的东西',
    text: '你买课 / 报班学的某项技能，学到一半发现没那么有用。',
    options: [
      { key: 'A', label: '立刻停损，转去学别的', vector: { F: 2, I: 1 } },
      { key: 'B', label: '既然花了钱，硬学完再说', vector: { F: -3, I: 1 } },
      { key: 'C', label: '学一半就放着，以后说不定用得上', vector: { W: -1 } },
    ],
  },
  {
    id: 18,
    primaryAxis: 'F',
    category: 'main',
    scene: '旅行计划被打乱',
    text: '旅行第二天，原计划景点临时关门。',
    options: [
      { key: 'A', label: '立刻打开小红书重排路线', vector: { F: 3 } },
      { key: 'B', label: '那今天就酒店躺一天', vector: { W: -2 } },
      { key: 'C', label: '还是去，至少在门口拍张照', vector: { F: -2, I: 1 } },
    ],
  },

  // ── I 轴 · 印记锚点（6 题） ────────────────────────────
  {
    id: 19,
    primaryAxis: 'I',
    category: 'main',
    scene: '父母不同意你的选择',
    text: '你想做的事（换工作 / 恋爱对象 / 搬城市），父母强烈反对。',
    options: [
      { key: 'A', label: '还是会做，但内心会愧疚很久', vector: { T: -2 } },
      { key: 'B', label: '重新考虑一下，ta 们也是为我好', vector: { I: -3 } },
      { key: 'C', label: '听完，按原计划继续', vector: { I: 3 } },
    ],
  },
  {
    id: 20,
    primaryAxis: 'I',
    category: 'main',
    scene: '朋友圈点赞数',
    text: '你刚发的朋友圈，1 小时只有 3 个赞。',
    options: [
      { key: 'A', label: '删了重新发', vector: { I: -3, T: -1 } },
      { key: 'B', label: '心里有点失落，但不删', vector: { I: -1, T: -1 } },
      { key: 'C', label: '没注意，本来发了就忘', vector: { I: 3 } },
    ],
  },
  {
    id: 21,
    primaryAxis: 'I',
    category: 'main',
    scene: '一个人吃火锅',
    text: '周末想吃火锅，没人陪。',
    options: [
      { key: 'A', label: '一个人去吃，根本无所谓别人怎么看', vector: { I: 3, W: 1 } },
      { key: 'B', label: '一个人去吃，但选个角落不显眼的位置', vector: {} },
      { key: 'C', label: '点外卖在家吃，避免那个场面', vector: { I: -2, T: -1 } },
    ],
  },
  {
    id: 22,
    primaryAxis: 'I',
    category: 'main',
    scene: '三个人的群里',
    text: '三个人的小群里，另外两个人在聊一件你完全不感兴趣的事。',
    options: [
      { key: 'A', label: '直接说"换个话题吧"', vector: { I: 3, W: 2 } },
      { key: 'B', label: '默默看完，刷别的', vector: {} },
      { key: 'C', label: '跟着附和几句，不想被排除在外', vector: { I: -3, T: -1 } },
    ],
  },
  {
    id: 23,
    primaryAxis: 'I',
    category: 'main',
    scene: '"反潮流"的心动',
    text: '身边所有人都在做 A，你心里其实想做 B。',
    options: [
      { key: 'A', label: '做 B，并且很坦然地说出来', vector: { I: 3 } },
      { key: 'B', label: '做 B，但对外说在做 A', vector: { I: -1, F: 1 } },
      { key: 'C', label: '跟着做 A，毕竟大家都这样', vector: { I: -3, F: -1 } },
    ],
  },
  {
    id: 24,
    primaryAxis: 'I',
    category: 'main',
    scene: '镜子里的你',
    text: '早上出门前最后照一次镜子，发现今天状态不太行。',
    options: [
      { key: 'A', label: '算了，反正自己舒服最重要', vector: { I: 3 } },
      { key: 'B', label: '换件衣服，不能让别人看到这个状态', vector: { I: -2, F: 1 } },
      { key: 'C', label: '一边出门一边想"今天会不会被吐槽"', vector: { I: -2, T: -2 } },
    ],
  },

  // ── 反差 / 触发题（6 题） ─────────────────────────────
  {
    id: 25,
    primaryAxis: 'T',
    category: 'trigger',
    scene: '醉酒后的你',
    text: '你喝了点酒，跟刚认识的人聊天 1 小时后。',
    options: [
      { key: 'A', label: '已经开始讲自己的童年', vector: { T: 3, I: -2 } },
      { key: 'B', label: '比平时话多了一倍，但内容差不多', vector: { T: 1 } },
      { key: 'C', label: '跟没喝一样', vector: { F: -2, I: 2 } },
    ],
  },
  {
    id: 26,
    primaryAxis: 'F',
    category: 'contrast',
    scene: '独处 vs 群体',
    text: '你一个人在家时的状态，和你跟 5+ 朋友在一起时的状态。',
    options: [
      { key: 'A', label: '几乎是两个不同的人', vector: { F: 2 } },
      { key: 'B', label: '状态有变化，但内核一致', vector: { I: 2 } },
      { key: 'C', label: '一模一样，从不掩饰', vector: { I: 3, F: -2 } },
    ],
  },
  {
    id: 27,
    primaryAxis: 'F',
    category: 'contrast',
    scene: '工作 vs 生活',
    text: '工作中的你和私底下的你。',
    options: [
      { key: 'A', label: '工作我是另一个皮肤，下班立刻切回来', vector: { F: 3 } },
      { key: 'B', label: '工作严肃一点，私下放松一点，差别不大', vector: {} },
      { key: 'C', label: '没区别，工作就是我', vector: { I: 3, F: -2 } },
    ],
  },
  {
    id: 28,
    primaryAxis: 'T',
    category: 'main',
    scene: '最近一次破防',
    text: '最近一次哭 / 失控 / 情绪崩塌的触发点。',
    options: [
      { key: 'A', label: '一件小事，但勾起了一连串旧账', vector: { T: -2, W: 2 } },
      { key: 'B', label: '真的发生了大事', vector: { T: -1 } },
      { key: 'C', label: '想不起来，已经很久没破防过', vector: { F: 1, I: 2 } },
    ],
  },
  {
    id: 29,
    primaryAxis: 'I',
    category: 'main',
    scene: '你最讨厌的那种人',
    text: '你最受不了哪种人？',
    options: [
      { key: 'A', label: '没主见、看人下菜碟的', vector: { I: 3 } },
      { key: 'B', label: '太有主见、不顾别人感受的', vector: { I: -2, T: -1 } },
      { key: 'C', label: '没什么特别讨厌的，每个人都有理由', vector: { F: 2 } },
    ],
  },
  {
    id: 30,
    primaryAxis: 'F',
    category: 'main',
    scene: '五年后的你',
    text: '5 年后的你，最可能在做什么？',
    options: [
      { key: 'A', label: '完全不同的事，到时候再看', vector: { F: 3, W: 1 } },
      { key: 'B', label: '跟现在差不多，把现在的事做更好', vector: { F: -2, I: 2 } },
      { key: 'C', label: '不敢想，怕想完就更焦虑', vector: { T: -3, F: -1 } },
    ],
  },
];
