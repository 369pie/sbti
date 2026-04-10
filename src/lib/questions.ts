import type { ModelType } from './dimensions';

export interface AnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface Question {
  id: number;
  text: string;
  dimension: string;
  model: ModelType;
  reversed: boolean;
  options?: AnswerOption[];
  isDrinkTrigger?: boolean;
  isDrinkBranch?: boolean;
}

// ── 默认选项（没有自定义 options 的题目回退使用） ──
export const DEFAULT_OPTIONS: AnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const QUESTIONS: Question[] = [
  // ══════════════════════════════════════
  //  自我模型 (Self)
  // ══════════════════════════════════════

  // S1 · 自尊自信
  {
    id: 1, text: '我不够好，周围的人都比我优秀。', dimension: 'S1', model: 'self', reversed: true,
    options: [
      { value: 3, label: '确实，我经常这么觉得。', key: 'A' },
      { value: 2, label: '偶尔吧，看状态。', key: 'B' },
      { value: 1, label: '谁说的？我觉得我还挺行的。', key: 'C' },
    ],
  },
  {
    id: 2, text: '外人的评价对我来说无所吊谓。', dimension: 'S1', model: 'self', reversed: false,
    options: [
      { value: 1, label: '我会被评价影响很久。', key: 'A' },
      { value: 2, label: '看谁说的吧。', key: 'B' },
      { value: 3, label: '无所吊谓，真的无所吊谓。', key: 'C' },
    ],
  },

  // S2 · 自我清晰度
  {
    id: 3, text: '我很清楚真正的自己是什么样的。', dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '不太清楚，我也在找。', key: 'A' },
      { value: 2, label: '大致知道，但有时候也迷糊。', key: 'B' },
      { value: 3, label: '门儿清，简直比照镜子还清楚。', key: 'C' },
    ],
  },
  {
    id: 4, text: '被问「你是什么样的人」时——', dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '我需要想很久，可能最后也说不清。', key: 'A' },
      { value: 2, label: '能说两句，但总觉得不够准。', key: 'B' },
      { value: 3, label: '三秒内就能给你一段自我介绍。', key: 'C' },
    ],
  },

  // S3 · 核心价值
  {
    id: 5, text: '我内心有真正追求的东西。', dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '活着就行，佛系到底。', key: 'A' },
      { value: 2, label: '有想要的东西，但不至于拼命。', key: 'B' },
      { value: 3, label: '有，而且我愿意为它吃苦。', key: 'C' },
    ],
  },
  {
    id: 6, text: '我一定要不断往上爬、变得更厉害。', dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '不想爬了，躺平真香。', key: 'A' },
      { value: 2, label: '偶尔有劲头，偶尔躺。', key: 'B' },
      { value: 3, label: '必须的，生命不息卷不止。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  情感模型 (Emotion)
  // ══════════════════════════════════════

  // E1 · 依恋安全感
  {
    id: 7, text: '对象超过5小时没回消息，说自己窜稀了，你会怎么想？', dimension: 'E1', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '拉稀不可能5小时，也许 ta 隐瞒了我。', key: 'A' },
      { value: 2, label: '在信任和怀疑之间摇摆。', key: 'B' },
      { value: 3, label: '也许今天 ta 真的不太舒服。', key: 'C' },
    ],
  },
  {
    id: 8, text: '我在感情里经常担心被对方抛弃。', dimension: 'E1', model: 'emotion', reversed: true,
    options: [
      { value: 3, label: '是的，每次 ta 不回消息都在脑补分手场景。', key: 'A' },
      { value: 2, label: '偶尔吧，但不至于经常。', key: 'B' },
      { value: 1, label: '不会，我对关系还挺有安全感的。', key: 'C' },
    ],
  },

  // E2 · 情感投入度
  {
    id: 9, text: '我对天发誓，我对待每一份感情都是认真的！', dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '并没有。', key: 'A' },
      { value: 2, label: '也许？', key: 'B' },
      { value: 3, label: '是的！（问心无愧骄傲脸）', key: 'C' },
    ],
  },
  {
    id: 10, text: '你的恋爱对象是一个尊老爱幼、温柔敦厚、洁身自好、玉树临风/国色天香的人，此时你会？', dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '就算 ta 再优秀我也不会陷入太深。', key: 'A' },
      { value: 2, label: '会心动，但还是保持理性。', key: 'B' },
      { value: 3, label: '非常珍惜 ta，也许会变成恋爱脑。', key: 'C' },
    ],
  },

  // E3 · 边界与依赖
  {
    id: 11, text: '恋爱后，对象非常黏人，你作何感想？', dimension: 'E3', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '那很爽了，我也黏回去。', key: 'A' },
      { value: 2, label: '都行，无所谓。', key: 'B' },
      { value: 3, label: '我更喜欢保留独立空间。', key: 'C' },
    ],
  },
  {
    id: 12, text: '我在任何关系里都很重视个人空间。', dimension: 'E3', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '我更喜欢依赖与被依赖。', key: 'A' },
      { value: 2, label: '看情况。', key: 'B' },
      { value: 3, label: '是的！（斩钉截铁地说道）', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  态度模型 (Attitude)
  // ══════════════════════════════════════

  // A1 · 世界观倾向
  {
    id: 13, text: '大多数人是善良的。', dimension: 'A1', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '其实邪恶的人心比世界上的痔疮更多。', key: 'A' },
      { value: 2, label: '也许吧。', key: 'B' },
      { value: 3, label: '是的，我愿相信好人更多。', key: 'C' },
    ],
  },
  {
    id: 14, text: '你走在街上，一位萌萌的小女孩递给你一根棒棒糖，此时你作何感想？', dimension: 'A1', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '这也许是一种新型诈骗？还是走开为好。', key: 'A' },
      { value: 2, label: '一脸懵逼，作挠头状。', key: 'B' },
      { value: 3, label: '呜呜她真好真可爱！居然给我棒棒糖！', key: 'C' },
    ],
  },

  // A2 · 规则与灵活度
  {
    id: 15, text: '快考试了，学校规定必须上晚自习，请假会扣分，但今晚你约了男/女神一起玩《绝地求生》，你怎么办？', dimension: 'A2', model: 'attitude', reversed: true,
    options: [
      { value: 3, label: '翘了！反正就一次！', key: 'A' },
      { value: 2, label: '干脆请个假吧。', key: 'B' },
      { value: 1, label: '都快考试了还去啥。', key: 'C' },
    ],
  },
  {
    id: 16, text: '我做事常常有计划，____', dimension: 'A2', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '然而计划不如变化快。', key: 'A' },
      { value: 2, label: '有时能完成，有时不能。', key: 'B' },
      { value: 3, label: '我讨厌被打破计划。', key: 'C' },
    ],
  },

  // A3 · 人生意义感
  {
    id: 17, text: '突然某一天，我意识到人生哪有什么意义，人不过跟动物一样被各种欲望支配着，纯纯被激素控制的东西。', dimension: 'A3', model: 'attitude', reversed: true,
    options: [
      { value: 3, label: '是这样的。', key: 'A' },
      { value: 2, label: '也许是，也许不是。', key: 'B' },
      { value: 1, label: '这简直是胡扯。', key: 'C' },
    ],
  },
  {
    id: 18, text: '我觉得人活着总得有点为之奋斗的东西。', dimension: 'A3', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '活着已经很累了，别再加码。', key: 'A' },
      { value: 2, label: '有最好，没有也行。', key: 'B' },
      { value: 3, label: '当然！有目标才有灵魂。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  行动驱力模型 (Action)
  // ══════════════════════════════════════

  // Ac1 · 动机导向
  {
    id: 19, text: '我做事主要为了取得成果和进步，而不是避免麻烦和风险。', dimension: 'Ac1', model: 'action', reversed: false,
    options: [
      { value: 1, label: '不出错就是胜利，我主打一个苟。', key: 'A' },
      { value: 2, label: '看情况，有时候冲有时候苟。', key: 'B' },
      { value: 3, label: '比起苟活，我更想追求极致。', key: 'C' },
    ],
  },
  {
    id: 20, text: '看到别人做得好，你的第一反应是？', dimension: 'Ac1', model: 'action', reversed: false,
    options: [
      { value: 1, label: '跟我有什么关系？继续摸鱼。', key: 'A' },
      { value: 2, label: '有点酸，但也有点佩服。', key: 'B' },
      { value: 3, label: '被点燃了！我也要变得更强。', key: 'C' },
    ],
  },

  // Ac2 · 决策风格
  {
    id: 21, text: '做决定的时候——', dimension: 'Ac2', model: 'action', reversed: false,
    options: [
      { value: 1, label: '我能纠结到宇宙热寂。', key: 'A' },
      { value: 2, label: '小事纠结，大事果断。', key: 'B' },
      { value: 3, label: '三秒决定，绝不回头。', key: 'C' },
    ],
  },
  {
    id: 22, text: '此题没有题目，请盲选。', dimension: 'Ac2', model: 'action', reversed: false,
    options: [
      { value: 1, label: '反复思考后感觉应该选 A？', key: 'A' },
      { value: 2, label: '啊，要不选 B？', key: 'B' },
      { value: 3, label: '不会就选 C，闭眼冲了。', key: 'C' },
    ],
  },

  // Ac3 · 执行模式
  {
    id: 23, text: '别人说你"执行力强"，你内心更接近哪句？', dimension: 'Ac3', model: 'action', reversed: false,
    options: [
      { value: 1, label: '我被逼到最后确实执行力超强……', key: 'A' },
      { value: 2, label: '啊，有时候吧。', key: 'B' },
      { value: 3, label: '是的，事情本来就该被推进。', key: 'C' },
    ],
  },
  {
    id: 24, text: '你因便秘坐在马桶上已长达30分钟，拉不出来很难受，此时你更像——', dimension: 'Ac3', model: 'action', reversed: false,
    options: [
      { value: 1, label: '再坐三十分钟看看，说不定就有了。', key: 'A' },
      { value: 2, label: '用力拍打自己的屁股并说：「死屁股，快拉啊！」', key: 'B' },
      { value: 3, label: '使用开塞露，快点解决才好。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  社交模型 (Social)
  // ══════════════════════════════════════

  // So1 · 社交主动性
  {
    id: 25, text: '朋友带了 ta 的朋友一起来玩，你最可能的状态是？', dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '对"朋友的朋友"天然有点距离感。', key: 'A' },
      { value: 2, label: '看对方，能玩就玩。', key: 'B' },
      { value: 3, label: '朋友的朋友就是我的朋友！热情聊天。', key: 'C' },
    ],
  },
  {
    id: 26, text: '你因玩《第五人格》而结识许多网友，并被邀请线下见面，你的想法是？', dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '网上口嗨就算了，真见面还是有点忐忑。', key: 'A' },
      { value: 2, label: '见网友也行，反正谁来聊我就聊两句。', key: 'B' },
      { value: 3, label: '我会打扮一番并热情赴约，万一呢？', key: 'C' },
    ],
  },

  // So2 · 人际边界感
  {
    id: 27, text: '我和人相处主打一个电子围栏，靠太近会自动报警。', dimension: 'So2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '不会，我巴不得和大家黏在一起。', key: 'A' },
      { value: 2, label: '看关系亲疏。', key: 'B' },
      { value: 3, label: '是的，请保持一米以上安全距离。', key: 'C' },
    ],
  },
  {
    id: 28, text: '我渴望和我信任的人关系密切，熟得像失散多年的亲戚。', dimension: 'So2', model: 'social', reversed: true,
  },

  // So3 · 表达与真实度
  {
    id: 29, text: '我在不同人面前会表现出不一样的自己。', dimension: 'So3', model: 'social', reversed: true,
    options: [
      { value: 3, label: '是的，见人说人话见鬼说鬼话。', key: 'A' },
      { value: 2, label: '会微调，但核心没变。', key: 'B' },
      { value: 1, label: '不会，我在谁面前都一个样。', key: 'C' },
    ],
  },
  {
    id: 30, text: '有时候你对一件事有不同的、负面的看法，但最后没说出来。多数情况下原因是：', dimension: 'So3', model: 'social', reversed: true,
    options: [
      { value: 3, label: '不想让别人知道自己是个阴暗的人。', key: 'A' },
      { value: 2, label: '可能碍于情面或者关系。', key: 'B' },
      { value: 1, label: '这种情况很少，我有话直说。', key: 'C' },
    ],
  },

  // ── 隐藏触发题 ──
  {
    id: 31, text: '您平时有什么爱好？', dimension: 'S1', model: 'self', reversed: false, isDrinkTrigger: true,
    options: [
      { value: 1, label: '吃喝拉撒', key: 'A' },
      { value: 2, label: '艺术 / 健身 / 其他', key: 'B' },
      { value: 3, label: '饮酒 🍺', key: 'C' },
    ],
  },

  // ── 饮酒分支 ──
  {
    id: 32, text: '喝了酒之后，我会变成完全不同的一个人。', dimension: 'So3', model: 'social', reversed: true, isDrinkBranch: true,
    options: [
      { value: 3, label: '酒后判若两人，连我自己都怕。', key: 'A' },
      { value: 2, label: '会放开一些，但还是我。', key: 'B' },
      { value: 1, label: '喝不喝都一样，谁还不是酒后吐真言。', key: 'C' },
    ],
  },
];

export function shuffleQuestions(questions: Question[]): Question[] {
  const main = questions.filter(q => !q.isDrinkBranch);
  const shuffled = [...main];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
