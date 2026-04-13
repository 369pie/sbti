import { sampleQuestionsByDimension } from '../question-pool';
import type { AnswerOption, Question } from '../questions';

export const BIRD_DEFAULT_OPTIONS: AnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const BIRD_QUESTIONS: Question[] = [
  // ══════════════════════════════════════
  //  自我模型 (Self)
  // ══════════════════════════════════════

  // S1 · 自尊自信 — 情景题
  {
    id: 201,
    text: '一群鸟在讨论谁飞得最高，突然全场安静看向你。你的反应？',
    dimension: 'S1',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '往后缩，感觉自己翅膀不够硬。', key: 'A' },
      { value: 2, label: '有点紧张，但还是试着扇两下。', key: 'B' },
      { value: 3, label: '这不就等着我表演呢？起飞。', key: 'C' },
    ],
  },
  // S1 · 自尊自信 — 玩梗题
  {
    id: 202,
    text: '"你只是一只普通的鸟，不配站在最高的树枝上。"看到这句话你——',
    dimension: 'S1',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '确实，我还是站地上吧。', key: 'A' },
      { value: 2, label: '被戳到了但装没看见。', key: 'B' },
      { value: 3, label: '笑了，打开翅膀飞给他看。', key: 'C' },
    ],
  },
  {
    id: 233,
    text: '别的鸟夸你飞得稳时，你心里反而会想：「这也算稳吗？」',
    dimension: 'S1',
    model: 'self',
    reversed: true,
    options: [
      { value: 3, label: '会，我对自己一向比别人苛。', key: 'A' },
      { value: 2, label: '偶尔会怀疑一下，但不至于一直卡住。', key: 'B' },
      { value: 1, label: '不会，夸到了我就收下。', key: 'C' },
    ],
  },

  // S2 · 自我清晰度 — 填空题
  {
    id: 203,
    text: '如果让你用一种鸟来形容自己，你____',
    dimension: 'S2',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '完全想不出来，我到底像什么鸟？', key: 'A' },
      { value: 2, label: '能说个大概，但总觉得不完全对。', key: 'B' },
      { value: 3, label: '三秒内锁定，连理由都给你准备好了。', key: 'C' },
    ],
  },
  // S2 · 自我清晰度 — 情景题
  {
    id: 204,
    text: '朋友说你"特别像一只鸽子"，你下意识的反应是？',
    dimension: 'S2',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '真的吗？那我到底是什么样的鸟啊……', key: 'A' },
      { value: 2, label: '哈？也不是完全不对吧。', key: 'B' },
      { value: 3, label: '不，我非常清楚自己是什么鸟，你说错了。', key: 'C' },
    ],
  },
  {
    id: 234,
    text: '如果要给自己写一张“鸟生说明书”，你会？',
    dimension: 'S2',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '写不出来，我自己都还在猜。', key: 'A' },
      { value: 2, label: '能写个大概，但总觉得差点意思。', key: 'B' },
      { value: 3, label: '我连自己的迁徙习惯和脾气都能写明白。', key: 'C' },
    ],
  },

  // S3 · 核心价值 — 荒诞场景题
  {
    id: 205,
    text: '有人告诉你：只要放弃飞行，就能拥有全世界的虫子。你的选择？',
    dimension: 'S3',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '虫子管够就行啊，飞不飞无所谓。', key: 'A' },
      { value: 2, label: '纠结一下，但虫子真的很诱人。', key: 'B' },
      { value: 3, label: '不飞的话我还是鸟吗？拒绝。', key: 'C' },
    ],
  },
  // S3 · 核心价值 — 情景题
  {
    id: 206,
    text: '你在林子里遇到一群鸟都在往南飞，但你内心想往北。你会？',
    dimension: 'S3',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '跟着大家走吧，飞哪不是飞。', key: 'A' },
      { value: 2, label: '纠结半天，但还是跟上了大部队。', key: 'B' },
      { value: 3, label: '我有我的方向，他们飞他们的。', key: 'C' },
    ],
  },
  {
    id: 235,
    text: '大部队都往更暖的地方飞，你却更想守住熟悉的那片湖。你会？',
    dimension: 'S3',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '跟着飞吧，去哪不是过冬。', key: 'A' },
      { value: 2, label: '纠结一下，最后多半还是随大流。', key: 'B' },
      { value: 3, label: '我想留就留，有些方向不是热闹就对。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  情感模型 (Emotion)
  // ══════════════════════════════════════

  // E1 · 依恋安全感 — 情景题
  {
    id: 207,
    text: '和你一起筑巢的鸟说"我出去觅食"，然后三天没回来。你的脑内弹幕是？',
    dimension: 'E1',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '它是不是已经在别的树上安家了？！', key: 'A' },
      { value: 2, label: '有点虚但告诉自己可能是路远了。', key: 'B' },
      { value: 3, label: '可能找到了特别远的虫源地吧，等着就好。', key: 'C' },
    ],
  },
  // E1 · 依恋安全感 — 玩梗题
  {
    id: 208,
    text: '"已读不回的鸟是不是都有了新的枝头？"这条朋友圈你的反应是？',
    dimension: 'E1',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '截图发给对象并开始质问。', key: 'A' },
      { value: 2, label: '偷偷收藏但不说话。', key: 'B' },
      { value: 3, label: '笑了，这不至于吧。', key: 'C' },
    ],
  },
  {
    id: 236,
    text: '搭档出去觅食久一点，你就容易脑补它是不是换了新巢。',
    dimension: 'E1',
    model: 'emotion',
    reversed: true,
    options: [
      { value: 3, label: '是，越想越像真的。', key: 'A' },
      { value: 2, label: '会闪过一下，但还能把自己劝住。', key: 'B' },
      { value: 1, label: '不会，我通常先信它真有事。', key: 'C' },
    ],
  },

  // E2 · 情感投入度 — 填空题
  {
    id: 209,
    text: '当我真的喜欢一只鸟的时候，我会____',
    dimension: 'E2',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '保持安全距离，别让自己太上头。', key: 'A' },
      { value: 2, label: '认真对待但保留退路。', key: 'B' },
      { value: 3, label: '把我所有的羽毛都给它，不带犹豫。', key: 'C' },
    ],
  },
  // E2 · 情感投入度 — 情景题
  {
    id: 210,
    text: '你精心叼来的小虫对方看都不看就飞走了，你会？',
    dimension: 'E2',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '正好自己吃了，不亏。', key: 'A' },
      { value: 2, label: '有点受伤但算了。', key: 'B' },
      { value: 3, label: '追上去，然后一口一口喂它！', key: 'C' },
    ],
  },
  {
    id: 237,
    text: '真喜欢一只鸟的时候，我会把最好看的羽毛也叼过去。',
    dimension: 'E2',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '不至于，我还是会先给自己留一点。', key: 'A' },
      { value: 2, label: '看情况，喜欢归喜欢也要保留一点余地。', key: 'B' },
      { value: 3, label: '会，喜欢这事对我来说很难半吊子。', key: 'C' },
    ],
  },

  // E3 · 边界与依赖 — 荒诞场景题
  {
    id: 211,
    text: '另一只鸟要求和你 24 小时共享一个巢，连睡觉翅膀都要搭在一起，你——',
    dimension: 'E3',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '好甜哦，翅膀给你搭！', key: 'A' },
      { value: 2, label: '白天可以，晚上让我翻个身行不行？', key: 'B' },
      { value: 3, label: '不行，我需要自己的巢，隔壁也不行。', key: 'C' },
    ],
  },
  // E3 · 边界与依赖 — 情景题
  {
    id: 212,
    text: '你平时喜欢一个人站在树枝上发呆。另一半飞过来说"你怎么又一个人"，你——',
    dimension: 'E3',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '好吧，一起站着也行。', key: 'A' },
      { value: 2, label: '聊聊可以但等下我还是需要独处。', key: 'B' },
      { value: 3, label: '因为我就是需要自己待一会啊。', key: 'C' },
    ],
  },
  {
    id: 238,
    text: '就算和很亲近的鸟一起住，我也需要一根谁都别碰的树枝。',
    dimension: 'E3',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '不用，贴在一起也挺好。', key: 'A' },
      { value: 2, label: '看状态，偶尔需要。', key: 'B' },
      { value: 3, label: '很需要，那是我的结界。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  态度模型 (Attitude)
  // ══════════════════════════════════════

  // A1 · 世界观倾向 — 情景题
  {
    id: 213,
    text: '一只陌生鸟跑过来对你说"我帮你把虫子放到巢里了"，你的第一反应？',
    dimension: 'A1',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '它该不会在虫子里下了毒吧……', key: 'A' },
      { value: 2, label: '先看看虫子再说。', key: 'B' },
      { value: 3, label: '谢谢！世上还是好鸟多。', key: 'C' },
    ],
  },
  // A1 · 世界观倾向 — 盲选题
  {
    id: 214,
    text: '这个森林里的鸟，大部分是____',
    dimension: 'A1',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '各怀鬼胎的', key: 'A' },
      { value: 2, label: '好坏各半的', key: 'B' },
      { value: 3, label: '挺友善的', key: 'C' },
    ],
  },
  {
    id: 239,
    text: '陌生鸟突然热情，我第一反应往往不是开心，而是先怀疑。',
    dimension: 'A1',
    model: 'attitude',
    reversed: true,
    options: [
      { value: 3, label: '对，太热情反而让我警觉。', key: 'A' },
      { value: 2, label: '会看一眼，但不至于立刻收起翅膀。', key: 'B' },
      { value: 1, label: '不太会，我一般愿意先接住善意。', key: 'C' },
    ],
  },

  // A2 · 规则与灵活度 — 情景题
  {
    id: 215,
    text: '候鸟迁徙有既定路线，但有只鸟说"我知道一条更快的"。你更倾向？',
    dimension: 'A2',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '走！试试新路有什么不好的！', key: 'A' },
      { value: 2, label: '了解一下新路的信息再说。', key: 'B' },
      { value: 3, label: '走老路，靠谱比快重要。', key: 'C' },
    ],
  },
  // A2 · 规则与灵活度 — 玩梗题
  {
    id: 216,
    text: '"正确的打猎方式是先俯冲、再抓、再吃。"你遵守这个流程吗？',
    dimension: 'A2',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '吃到就行，管它什么流程。', key: 'A' },
      { value: 2, label: '大体跟着来，偶尔变通。', key: 'B' },
      { value: 3, label: '必须按步骤来，否则心里不舒服。', key: 'C' },
    ],
  },
  {
    id: 240,
    text: '迁徙这件事，我更信老路线和老经验。',
    dimension: 'A2',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '谁知道新路线会不会更好，试了再说。', key: 'A' },
      { value: 2, label: '看情况，有把握我会改一点。', key: 'B' },
      { value: 3, label: '老路能活命，我还是先按规矩飞。', key: 'C' },
    ],
  },

  // A3 · 思考深度 — 填空题
  {
    id: 217,
    text: '对我来说，飞翔这件事____',
    dimension: 'A3',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '能飞就行啊，又不是参加比赛。', key: 'A' },
      { value: 2, label: '飞着飞着偶尔也会想想为什么要飞。', key: 'B' },
      { value: 3, label: '每一次振翅我都在思考——飞翔的意义到底是什么。', key: 'C' },
    ],
  },
  // A3 · 思考深度 — 情景题
  {
    id: 218,
    text: '你看到别的鸟在为了一条虫子打架，你在旁边想什么？',
    dimension: 'A3',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '反正没我的事。', key: 'A' },
      { value: 2, label: '略微感慨一下鸟间百态。', key: 'B' },
      { value: 3, label: '开始反思虫子稀缺性与鸟类社会结构的关系。', key: 'C' },
    ],
  },
  {
    id: 241,
    text: '飞到很高的地方时，你会不会突然想：我这么飞，到底是为了什么？',
    dimension: 'A3',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '不会，飞就是飞，别给鸟生上价值。', key: 'A' },
      { value: 2, label: '偶尔会想两秒，然后继续飞。', key: 'B' },
      { value: 3, label: '会，我这种鸟连发呆都带一点哲学味。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  行动驱力模型 (Action)
  // ══════════════════════════════════════

  // Ac1 · 内驱力 — 情景题
  {
    id: 219,
    text: '隔壁树上的鸟已经叼到了今天第十条虫子，你的反应是？',
    dimension: 'Ac1',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '跟我有什么关系，它吃它的。', key: 'A' },
      { value: 2, label: '有点被刺激到但不至于亲自出动。', key: 'B' },
      { value: 3, label: '好，那我今天要叼到第十一条。', key: 'C' },
    ],
  },
  // Ac1 · 内驱力 — 荒诞场景题
  {
    id: 220,
    text: '森林举办"飞行大赛"，冠军奖品是一棵完美的树。你？',
    dimension: 'Ac1',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '我在下面围观加油就好。', key: 'A' },
      { value: 2, label: '先报名，到时候看心情要不要参加。', key: 'B' },
      { value: 3, label: '已经在训练了，那棵树是我的。', key: 'C' },
    ],
  },
  {
    id: 242,
    text: '看到别的鸟已经叼到过冬第一根树枝，你会？',
    dimension: 'Ac1',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '继续发呆，它忙它的。', key: 'A' },
      { value: 2, label: '被提醒一下，但不一定立刻动。', key: 'B' },
      { value: 3, label: '立刻起飞，我也得开始准备了。', key: 'C' },
    ],
  },

  // Ac2 · 决策速度 — 情景题
  {
    id: 221,
    text: '面前有两条虫子，一条肥的一条瘦的，你怎么选？',
    dimension: 'Ac2',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '先看看有没有第三条……', key: 'A' },
      { value: 2, label: '稍微对比一下然后挑一条。', key: 'B' },
      { value: 3, label: '肥的，下嘴快准狠。', key: 'C' },
    ],
  },
  // Ac2 · 决策速度 — 玩梗题
  {
    id: 222,
    text: '"选恐鸟"和"秒杀鸟"之间你更接近哪一种？',
    dimension: 'Ac2',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '选恐鸟，严重的那种。', key: 'A' },
      { value: 2, label: '看情况，平时选恐偶尔果断。', key: 'B' },
      { value: 3, label: '秒杀鸟，下手贼快绝不犹豫。', key: 'C' },
    ],
  },
  {
    id: 243,
    text: '树上位置很多的时候，我反而会挑来挑去，最后迟迟不落。',
    dimension: 'Ac2',
    model: 'action',
    reversed: true,
    options: [
      { value: 3, label: '对，越能选越难落脚。', key: 'A' },
      { value: 2, label: '会纠结一下，但还不至于卡太久。', key: 'B' },
      { value: 1, label: '不太会，我通常看准就下去。', key: 'C' },
    ],
  },

  // Ac3 · 执行力 — 情景题
  {
    id: 223,
    text: '暴风雨突然来了！巢还没建完！你的反应是？',
    dimension: 'Ac3',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '先找个地方躲着吧……等雨停了再说。', key: 'A' },
      { value: 2, label: '挑最重要的修补一下应个急。', key: 'B' },
      { value: 3, label: '顶着风也要把巢补完，拖到明天更惨。', key: 'C' },
    ],
  },
  // Ac3 · 执行力 — 填空题
  {
    id: 224,
    text: '决定要做一件事之后，我通常____',
    dimension: 'Ac3',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '计划列了一堆但迟迟不动。', key: 'A' },
      { value: 2, label: '会启动但速度看心情。', key: 'B' },
      { value: 3, label: '想完就干，执行力拉满。', key: 'C' },
    ],
  },
  {
    id: 244,
    text: '决定筑巢之后，我更像哪种鸟？',
    dimension: 'Ac3',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '先想布局，想着想着天就黑了。', key: 'A' },
      { value: 2, label: '先搭一点，剩下慢慢补。', key: 'B' },
      { value: 3, label: '边想边叼树枝，今天就得起个框。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  社交模型 (Social)
  // ══════════════════════════════════════

  // So1 · 社交主动性 — 情景题
  {
    id: 225,
    text: '你落在一棵新的树上，发现已经有一群鸟在那了。你的第一步是？',
    dimension: 'So1',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '找最远的那根树枝默默站好。', key: 'A' },
      { value: 2, label: '在旁边先观察一下氛围。', key: 'B' },
      { value: 3, label: '直接飞过去打招呼："大家好！"', key: 'C' },
    ],
  },
  // So1 · 社交主动性 — 荒诞场景题
  {
    id: 226,
    text: '你意外飞进了一场鸟界社交晚宴，发现一只鸟都不认识。你会？',
    dimension: 'So1',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '找到食物台然后假装在吃东西。', key: 'A' },
      { value: 2, label: '等有鸟主动过来聊就聊。', key: 'B' },
      { value: 3, label: '挨个自我介绍，认识完全场我再走。', key: 'C' },
    ],
  },
  {
    id: 245,
    text: '落到一棵新树上，我通常会先——',
    dimension: 'So1',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '安静待着，等别人发现我。', key: 'A' },
      { value: 2, label: '观察一圈再决定开不开口。', key: 'B' },
      { value: 3, label: '先叫一声，当作打过招呼。', key: 'C' },
    ],
  },

  // So2 · 自我暴露度 — 情景题
  {
    id: 227,
    text: '一只刚认识的鸟问你"你的巢在哪？和谁住？"你的在意程度是？',
    dimension: 'So2',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '随便说呗，有什么不能说的。', key: 'A' },
      { value: 2, label: '模糊带过，不说细节。', key: 'B' },
      { value: 3, label: '谁啊？我家地址你也想知道？', key: 'C' },
    ],
  },
  // So2 · 自我暴露度 — 玩梗题
  {
    id: 228,
    text: '你的朋友圈设置是？',
    dimension: 'So2',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '全部可见，欢迎收看我的鸟生直播。', key: 'A' },
      { value: 2, label: '三天可见或部分可见。', key: 'B' },
      { value: 3, label: '仅自己可见 / 关了 / 什么朋友圈？', key: 'C' },
    ],
  },
  {
    id: 246,
    text: '刚认识的鸟问东问西，我通常会——',
    dimension: 'So2',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '聊呗，枝头八卦我也能顺便讲两句。', key: 'A' },
      { value: 2, label: '挑能说的说，不太往深处去。', key: 'B' },
      { value: 3, label: '先把翅膀收紧一点，没那么熟别问太细。', key: 'C' },
    ],
  },

  // So3 · 人格一致性 — 情景题（reversed）
  {
    id: 229,
    text: '在鸟群大佬面前和在自己小圈子里，你的表现差多少？',
    dimension: 'So3',
    model: 'social',
    reversed: true,
    options: [
      { value: 3, label: '判若两鸟，完全两个版本。', key: 'A' },
      { value: 2, label: '会调整但本鸟没换。', key: 'B' },
      { value: 1, label: '差不多，我在谁面前都是同一只鸟。', key: 'C' },
    ],
  },
  // So3 · 人格一致性 — 盲选题（reversed）
  {
    id: 230,
    text: '你觉得"见鸟说鸟话"是____',
    dimension: 'So3',
    model: 'social',
    reversed: true,
    options: [
      { value: 3, label: '必备生存技能，谁不会啊。', key: 'A' },
      { value: 2, label: '偶尔为之，大多数时候做自己。', key: 'B' },
      { value: 1, label: '做不到也不想做，太累了。', key: 'C' },
    ],
  },
  {
    id: 247,
    text: '不管是在鸟群头领面前，还是和熟悉的小圈子待着，我装出来的版本都撑不久。',
    dimension: 'So3',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '不太对，我多少还是会换个样子。', key: 'A' },
      { value: 2, label: '会调一点，但不至于变成另一只鸟。', key: 'B' },
      { value: 3, label: '对，装一会儿可以，装久了我会累。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  酒精触发 + 分支
  // ══════════════════════════════════════

  // 触发题
  {
    id: 231,
    text: '森林开派对！有虫子汁、浆果酒、花蜜特调。你最期待的环节是？',
    dimension: 'S1',
    model: 'self',
    reversed: false,
    isDrinkTrigger: true,
    options: [
      { value: 1, label: '吃两口就回巢了，受不了太闹。', key: 'A' },
      { value: 2, label: '正常参加但不至于喝嗨。', key: 'B' },
      { value: 3, label: '浆果酒上！不醉不归！', key: 'C' },
    ],
  },
  // 分支题
  {
    id: 232,
    text: '喝了两杯浆果酒之后，你的鸟格变化通常是？',
    dimension: 'So3',
    model: 'social',
    reversed: true,
    isDrinkBranch: true,
    options: [
      { value: 3, label: '判若两鸟——平时闷的现在满场乱飞。', key: 'A' },
      { value: 2, label: '放松一点但还知道自己在干嘛。', key: 'B' },
      { value: 1, label: '喝不喝都差不多，本鸟前后如一。', key: 'C' },
    ],
  },
];

export function shuffleBirdQuestions(questions: Question[]): Question[] {
  return sampleQuestionsByDimension(questions, 2, {
    keep: (question) => Boolean(question.isDrinkTrigger),
  });
}
