import type { XptiModelType } from './dimensions';

export interface XptiAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface XptiQuestion {
  id: number;
  text: string;
  dimension: string;
  model: XptiModelType;
  reversed: boolean;
  options?: XptiAnswerOption[];
}

export const XPTI_DEFAULT_OPTIONS: XptiAnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const XPTI_QUESTIONS: XptiQuestion[] = [
  // ══════════════════════════════════════
  //  权力轴 (Power) X1 — D(主导) ↔ A(配合)
  //  高分 → D(主导), 低分 → A(配合)
  // ══════════════════════════════════════
  {
    id: 1, text: '约会地点通常谁定？', dimension: 'X1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '我来安排，我的品味比你靠谱。', key: 'A' },
      { value: 2, label: '你选我选都行，看心情。', key: 'B' },
      { value: 1, label: '"你说了算"——但其实这句话本身就是一种掌控。', key: 'C' },
    ],
  },
  {
    id: 2, text: '恋爱中遇到分歧，你的第一反应是？', dimension: 'X1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '先讲道理说服对方，毕竟我有理的概率大。', key: 'A' },
      { value: 2, label: '各退一步，谁也别太强势。', key: 'B' },
      { value: 1, label: '算了算了你开心就好。', key: 'C' },
    ],
  },
  {
    id: 3, text: '以下哪种恋爱模式更适合你？', dimension: 'X1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '我负责拿主意，对方负责执行。', key: 'A' },
      { value: 2, label: '轮流做主，谁擅长谁来。', key: 'B' },
      { value: 1, label: '对方做计划我跟着就好，省心。', key: 'C' },
    ],
  },
  {
    id: 4, text: '对方给你准备了一个你完全不喜欢的惊喜，你会？', dimension: 'X1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '直说"下次听我的"，不然资源浪费。', key: 'A' },
      { value: 2, label: '先谢谢，之后委婉提一下自己的喜好。', key: 'B' },
      { value: 1, label: '无所谓，心意到了就行。', key: 'C' },
    ],
  },
  {
    id: 5, text: '你觉得理想关系里，你的角色更像——', dimension: 'X1', model: 'power', reversed: false,
    options: [
      { value: 3, label: '导演。我来定剧本和节奏。', key: 'A' },
      { value: 2, label: '搭档。各有分工。', key: 'B' },
      { value: 1, label: '观众。坐好看戏就很开心了。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  感知轴 (Sense) X2 — S(氛围) ↔ I(直觉)
  //  高分 → S(氛围感), 低分 → I(直觉型)
  // ══════════════════════════════════════
  {
    id: 6, text: '让你瞬间心动的是？', dimension: 'X2', model: 'sense', reversed: false,
    options: [
      { value: 3, label: '他精心准备的生日惊喜，蜡烛摆成了爱心。', key: 'A' },
      { value: 2, label: '都可以吧，主要看他这个人。', key: 'B' },
      { value: 1, label: '他随口一句话突然戳中了你，你自己都没想到会心动。', key: 'C' },
    ],
  },
  {
    id: 7, text: '约会时你更在意什么？', dimension: 'X2', model: 'sense', reversed: false,
    options: [
      { value: 3, label: '餐厅氛围、灯光、音乐、摆盘——每个细节都是分数。', key: 'A' },
      { value: 2, label: '环境和人都重要吧。', key: 'B' },
      { value: 1, label: '路边摊也行，聊得来就是最好的约会。', key: 'C' },
    ],
  },
  {
    id: 8, text: '哪个瞬间让你觉得"我被爱着"？', dimension: 'X2', model: 'sense', reversed: false,
    options: [
      { value: 3, label: '收到一束在特定日子送的、刚好是你喜欢的花。', key: 'A' },
      { value: 2, label: '看情况，不一定非要具体的东西。', key: 'B' },
      { value: 1, label: '他无意间说了一句"你今天看起来不太开心"——一下就被看见了。', key: 'C' },
    ],
  },
  {
    id: 9, text: '如果对方想给你准备礼物，你更希望是？', dimension: 'X2', model: 'sense', reversed: false,
    options: [
      { value: 3, label: '一本手写的恋爱日记/一段精心剪辑的视频。', key: 'A' },
      { value: 2, label: '啥都行，心意最重要。', key: 'B' },
      { value: 1, label: '不用礼物，跟我说句真心话就够了。', key: 'C' },
    ],
  },
  {
    id: 10, text: '你觉得"浪漫"的定义是？', dimension: 'X2', model: 'sense', reversed: false,
    options: [
      { value: 3, label: '被精心设计的、充满仪式感的瞬间。', key: 'A' },
      { value: 2, label: '两种都有吧。', key: 'B' },
      { value: 1, label: '两个人自然而然地相视一笑，什么都不用说。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  专注轴 (Focus) X3 — P(纯爱) ↔ C(反转/混沌)
  //  高分 → P(纯爱), 低分 → C(混沌)
  // ══════════════════════════════════════
  {
    id: 11, text: '刷到前任和新对象的合照，你的内心OS：', dimension: 'X3', model: 'focus', reversed: false,
    options: [
      { value: 3, label: '"我的人怎么能跟别人在一起" (即使分手了也要心梗一下)', key: 'A' },
      { value: 2, label: '有点酸但很快翻走了。', key: 'B' },
      { value: 1, label: '"哦，新的来了" *继续划*', key: 'C' },
    ],
  },
  {
    id: 12, text: '你对"暧昧期"的态度是？', dimension: 'X3', model: 'focus', reversed: false,
    options: [
      { value: 3, label: '暧昧让人受尽委屈，赶紧确定关系！', key: 'A' },
      { value: 2, label: '暧昧嘛……看情况。', key: 'B' },
      { value: 1, label: '暧昧是恋爱里最好吃的部分，确定了反而没意思。', key: 'C' },
    ],
  },
  {
    id: 13, text: '你能同时对两个人产生好感吗？', dimension: 'X3', model: 'focus', reversed: false,
    options: [
      { value: 3, label: '不可能。喜欢一个人的时候根本看不到别人。', key: 'A' },
      { value: 2, label: '理论上可以但我不太会这样。', key: 'B' },
      { value: 1, label: '人类的感情本就复杂，同时被两个人吸引很正常吧。', key: 'C' },
    ],
  },
  {
    id: 14, text: '恋爱里让你最受不了的是？', dimension: 'X3', model: 'focus', reversed: false,
    options: [
      { value: 3, label: '对方跟别人暧昧。其他我都能忍，这个不行。', key: 'A' },
      { value: 2, label: '都挺受不了的。', key: 'B' },
      { value: 1, label: '一成不变、毫无新鲜感。无聊比被背叛更可怕。', key: 'C' },
    ],
  },
  {
    id: 15, text: '你理想中爱情的保质期是？', dimension: 'X3', model: 'focus', reversed: false,
    options: [
      { value: 3, label: '永远。真正的爱不会过期。', key: 'A' },
      { value: 2, label: '尽量久吧，但也不强求。', key: 'B' },
      { value: 1, label: '每一段都有终点，精彩就够了。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  想象轴 (Imagine) X4 — F(幻想) ↔ R(务实)
  //  高分 → F(脑补), 低分 → R(务实)
  // ══════════════════════════════════════
  {
    id: 16, text: '闺蜜问你"你理想型什么样"，你说：', dimension: 'X4', model: 'imagine', reversed: false,
    options: [
      { value: 3, label: '"眼睛里有光、笑起来像少年、最好还会弹吉他。"', key: 'A' },
      { value: 2, label: '"看感觉吧，没有特别具体的标准。"', key: 'B' },
      { value: 1, label: '"有正经工作、情绪稳定、身高别太矮就行。"', key: 'C' },
    ],
  },
  {
    id: 17, text: '你更容易被什么样的故事感动？', dimension: 'X4', model: 'imagine', reversed: false,
    options: [
      { value: 3, label: '隔着人海相视一笑、命中注定的浪漫爱情。', key: 'A' },
      { value: 2, label: '两种都会感动吧。', key: 'B' },
      { value: 1, label: '一起还完房贷、携手走过柴米油盐的平凡婚姻。', key: 'C' },
    ],
  },
  {
    id: 18, text: '你会因为一个人"有趣但没钱"而心动吗？', dimension: 'X4', model: 'imagine', reversed: false,
    options: [
      { value: 3, label: '有趣就够了！有钱的人那么多但无聊的也多。', key: 'A' },
      { value: 2, label: '有点纠结，两个都想要。', key: 'B' },
      { value: 1, label: '有趣不能当饭吃，现实条件很重要。', key: 'C' },
    ],
  },
  {
    id: 19, text: '如果对方说"我们私奔吧"，你的反应是？', dimension: 'X4', model: 'imagine', reversed: false,
    options: [
      { value: 3, label: '我已经在收拾行李了！', key: 'A' },
      { value: 2, label: '浪漫是浪漫，但得考虑一下实际问题。', key: 'B' },
      { value: 1, label: '钱呢？计划呢？去哪里？想清楚再说。', key: 'C' },
    ],
  },
  {
    id: 20, text: '你对恋爱最大的期待是？', dimension: 'X4', model: 'imagine', reversed: false,
    options: [
      { value: 3, label: '一个让我觉得"这世界真美好"的人出现。', key: 'A' },
      { value: 2, label: '一段不委屈自己的关系就好。', key: 'B' },
      { value: 1, label: '找一个聊得来、靠得住、能一起解决问题的队友。', key: 'C' },
    ],
  },
];

export function shuffleXptiQuestions(questions: XptiQuestion[]): XptiQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
