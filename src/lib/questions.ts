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

  // ══════════════════════════════════════
  //  扩展题目（每维度 +2，共 30 道，id 33-62）
  // ══════════════════════════════════════

  // ── S1 · 自尊自信 ──
  {
    id: 33, text: '拍了一张自拍，你的下一步操作是？', dimension: 'S1', model: 'self', reversed: false,
    options: [
      { value: 1, label: '开十级美颜+三层滤镜，还是觉得不行。', key: 'A' },
      { value: 2, label: '修一修，差不多就发了。', key: 'B' },
      { value: 3, label: '直接发，真实就是最好的滤镜。', key: 'C' },
    ],
  },
  {
    id: 34, text: '朋友说"你今天状态不太好"，你内心：', dimension: 'S1', model: 'self', reversed: false,
    options: [
      { value: 1, label: '崩了，是不是我真的很差？', key: 'A' },
      { value: 2, label: '嗯？可能吧，不太确定。', key: 'B' },
      { value: 3, label: '哦，可能没睡好，无所谓。', key: 'C' },
    ],
  },

  // ── S2 · 自我清晰度 ──
  {
    id: 35, text: '如果有人给你贴了一个你完全不认同的标签，你会？', dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '开始怀疑是不是自己没认清自己。', key: 'A' },
      { value: 2, label: '想想看，也许有一点道理？', key: 'B' },
      { value: 3, label: '一笑而过，我比谁都了解自己。', key: 'C' },
    ],
  },
  {
    id: 36, text: '你能清楚说出"什么事会让你真的生气"吗？', dimension: 'S2', model: 'self', reversed: false,
    options: [
      { value: 1, label: '好像什么都能让我不爽又好像都还行……', key: 'A' },
      { value: 2, label: '大概知道几个雷区。', key: 'B' },
      { value: 3, label: '太清楚了，雷区清单随时能报给你。', key: 'C' },
    ],
  },

  // ── S3 · 核心价值 ──
  {
    id: 37, text: '身边的人都在"整顿职场/考公/润"你的第一反应是？', dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '他们自己折腾去吧，我活着就行。', key: 'A' },
      { value: 2, label: '有点心动但也不至于立刻跟。', key: 'B' },
      { value: 3, label: '我有自己的路，他们走他们的。', key: 'C' },
    ],
  },
  {
    id: 38, text: '你有没有那种"为了它可以放弃其他东西"的执念？', dimension: 'S3', model: 'self', reversed: false,
    options: [
      { value: 1, label: '没有，万物皆可放弃。', key: 'A' },
      { value: 2, label: '有，但执念来得快去得也快。', key: 'B' },
      { value: 3, label: '有，而且非常坚定。', key: 'C' },
    ],
  },

  // ── E1 · 依恋安全感 ──
  {
    id: 39, text: '恋人突然说"我跟你说个事"，你的心率变化：', dimension: 'E1', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '血压飙升，开始脑补分手场景。', key: 'A' },
      { value: 2, label: '有点紧张但还好。', key: 'B' },
      { value: 3, label: '嗯你说，心态平稳。', key: 'C' },
    ],
  },
  {
    id: 40, text: '你的好朋友最近和另一个人走得很近，你：', dimension: 'E1', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '难受，感觉自己被替代了。', key: 'A' },
      { value: 2, label: '有一点点酸但说不上来。', key: 'B' },
      { value: 3, label: '挺好的，朋友多开心嘛。', key: 'C' },
    ],
  },

  // ── E2 · 情感投入度 ──
  {
    id: 41, text: '喜欢上一个人之后，你手机的使用方式会？', dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '该干嘛干嘛，不至于因为谁改变节奏。', key: 'A' },
      { value: 2, label: '会多看几眼聊天框。', key: 'B' },
      { value: 3, label: '每30秒检查一次消息，顺便翻完对方全部朋友圈。', key: 'C' },
    ],
  },
  {
    id: 42, text: '正在追的剧大结局/喜欢的偶像塌房，你的反应是？', dimension: 'E2', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '哦，这样啊。切到下一个。', key: 'A' },
      { value: 2, label: '有点遗憾但过几天就好了。', key: 'B' },
      { value: 3, label: '心碎了，需要好几天恢复。', key: 'C' },
    ],
  },

  // ── E3 · 边界与依赖 ──
  {
    id: 43, text: '对象想跟你共享手机密码/定位，你觉得：', dimension: 'E3', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '没问题，恋爱不就是坦诚相见嘛。', key: 'A' },
      { value: 2, label: '可以商量，但有点膈应。', key: 'B' },
      { value: 3, label: '不行，这是我的领地。', key: 'C' },
    ],
  },
  {
    id: 44, text: '一个人吃火锅你觉得：', dimension: 'E3', model: 'emotion', reversed: false,
    options: [
      { value: 1, label: '太惨了，必须拉人一起。', key: 'A' },
      { value: 2, label: '偶尔可以，但总感觉差点意思。', key: 'B' },
      { value: 3, label: 'VIP包间，爽翻了。', key: 'C' },
    ],
  },

  // ── A1 · 世界观倾向 ──
  {
    id: 45, text: '网上看到"好人有好报"的故事，你的反应是？', dimension: 'A1', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '假的，又是营销号编的。', key: 'A' },
      { value: 2, label: '希望是真的吧。', key: 'B' },
      { value: 3, label: '感动了，世界还是美好的！', key: 'C' },
    ],
  },
  {
    id: 46, text: '陌生人突然对你微笑，你的第一反应：', dimension: 'A1', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '背后非奸即盗，提高警惕。', key: 'A' },
      { value: 2, label: '不太确定什么意思。', key: 'B' },
      { value: 3, label: '笑回去！今天运气不错。', key: 'C' },
    ],
  },

  // ── A2 · 规则与灵活度 ──
  {
    id: 47, text: '排队等餐，有人插队，你会？', dimension: 'A2', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '换我也想插但算了。', key: 'A' },
      { value: 2, label: '心里骂两句但不说。', key: 'B' },
      { value: 3, label: '不可以！必须说！规矩就是规矩。', key: 'C' },
    ],
  },
  {
    id: 48, text: '你桌面的文件夹命名风格最接近：', dimension: 'A2', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '全在桌面上，找文件靠缘分。', key: 'A' },
      { value: 2, label: '大体分个类，细节随缘。', key: 'B' },
      { value: 3, label: '按日期+类型+版本号严格归档。', key: 'C' },
    ],
  },

  // ── A3 · 人生意义感 ──
  {
    id: 49, text: '如果突然多了一百万，你最可能：', dimension: 'A3', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '存起来吃利息，不折腾了。', key: 'A' },
      { value: 2, label: '一半存一半浪，享受一下。', key: 'B' },
      { value: 3, label: '拿去做我一直想做的事！', key: 'C' },
    ],
  },
  {
    id: 50, text: '"你五年后想成为什么样的人？"你的回答：', dimension: 'A3', model: 'attitude', reversed: false,
    options: [
      { value: 1, label: '活着就行，别问这种焦虑问题。', key: 'A' },
      { value: 2, label: '大概有个方向但说不太清。', key: 'B' },
      { value: 3, label: '我已经做好规划了，你要听吗？', key: 'C' },
    ],
  },

  // ── Ac1 · 动机导向 ──
  {
    id: 51, text: '游戏里你更喜欢哪种玩法？', dimension: 'Ac1', model: 'action', reversed: false,
    options: [
      { value: 1, label: '挂机/自动战斗——别让我操作。', key: 'A' },
      { value: 2, label: '跟着主线推就行。', key: 'B' },
      { value: 3, label: '打最难的副本/全成就解锁！', key: 'C' },
    ],
  },
  {
    id: 52, text: '看到"限时挑战/打卡活动"，你：', dimension: 'Ac1', model: 'action', reversed: false,
    options: [
      { value: 1, label: '关了，别给我压力。', key: 'A' },
      { value: 2, label: '看奖品有没有吸引力再说。', key: 'B' },
      { value: 3, label: '冲！不管奖品是什么先报名再说。', key: 'C' },
    ],
  },

  // ── Ac2 · 决策风格 ──
  {
    id: 53, text: '点外卖的时候你一般花多长时间选？', dimension: 'Ac2', model: 'action', reversed: false,
    options: [
      { value: 1, label: '翻了半小时最后还是没选。', key: 'A' },
      { value: 2, label: '五分钟左右。', key: 'B' },
      { value: 3, label: '30秒，直接翻最近一次的重新下单。', key: 'C' },
    ],
  },
  {
    id: 54, text: '后悔上一秒做的决定，你的操作是？', dimension: 'Ac2', model: 'action', reversed: false,
    options: [
      { value: 1, label: '反复复盘到天荒地老。', key: 'A' },
      { value: 2, label: '想一下然后翻篇。', key: 'B' },
      { value: 3, label: '不后悔，做都做了。', key: 'C' },
    ],
  },

  // ── Ac3 · 执行模式 ──
  {
    id: 55, text: '你的"明天再做"承诺兑现率大概是：', dimension: 'Ac3', model: 'action', reversed: false,
    options: [
      { value: 1, label: '10%以下，明天的我不是我。', key: 'A' },
      { value: 2, label: '一半一半吧。', key: 'B' },
      { value: 3, label: '90%+，说了就做。', key: 'C' },
    ],
  },
  {
    id: 56, text: '列了一个to-do list，到晚上你大概率：', dimension: 'Ac3', model: 'action', reversed: false,
    options: [
      { value: 1, label: '一项都没做但把列表存好了。', key: 'A' },
      { value: 2, label: '做了一两项关键的。', key: 'B' },
      { value: 3, label: '全部打勾，爽。', key: 'C' },
    ],
  },

  // ── So1 · 社交主动性 ──
  {
    id: 57, text: '到了一个谁都不认识的新环境，你：', dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '默默找个角落坐下来刷手机。', key: 'A' },
      { value: 2, label: '看谁先跟我搭话我就接。', key: 'B' },
      { value: 3, label: '主动介绍自己，认识新朋友。', key: 'C' },
    ],
  },
  {
    id: 58, text: '一个月没联系的朋友突然找你出来吃饭，你：', dimension: 'So1', model: 'social', reversed: false,
    options: [
      { value: 1, label: '有点抵触，为什么突然联系我？', key: 'A' },
      { value: 2, label: '看自己有没有时间再说。', key: 'B' },
      { value: 3, label: '好啊好啊！好久不见！', key: 'C' },
    ],
  },

  // ── So2 · 人际边界感 ──
  {
    id: 59, text: '刚认识的人热情地给你一个拥抱，你的身体反应：', dimension: 'So2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '打开双臂热情回抱！', key: 'A' },
      { value: 2, label: '有点僵但还是回应了。', key: 'B' },
      { value: 3, label: '全身肌肉紧绷到石化。', key: 'C' },
    ],
  },
  {
    id: 60, text: '朋友未经允许翻你手机，你：', dimension: 'So2', model: 'social', reversed: false,
    options: [
      { value: 1, label: '没啥好藏的，随便看。', key: 'A' },
      { value: 2, label: '有一点不爽但不好意思说。', key: 'B' },
      { value: 3, label: '当场变脸，这是底线。', key: 'C' },
    ],
  },

  // ── So3 · 表达与真实度 ──
  {
    id: 61, text: '线上聊天的你和线下面对面的你，别人的评价是？', dimension: 'So3', model: 'social', reversed: true,
    options: [
      { value: 3, label: '简直判若两人，像在cosplay对方。', key: 'A' },
      { value: 2, label: '差不多，只是线上更放得开。', key: 'B' },
      { value: 1, label: '完全一样，我就是活在真实里的人。', key: 'C' },
    ],
  },
  {
    id: 62, text: '你不喜欢一个人但对方对你很热情，你：', dimension: 'So3', model: 'social', reversed: true,
    options: [
      { value: 3, label: '先处着呗，面子功夫还是得做。', key: 'A' },
      { value: 2, label: '保持礼貌距离，不热也不冷。', key: 'B' },
      { value: 1, label: '我态度上直接就表现出来了。', key: 'C' },
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
