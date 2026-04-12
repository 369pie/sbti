import type { AnswerOption, Question } from '../questions';

export const BANTI_DEFAULT_OPTIONS: AnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const BANTI_QUESTIONS: Question[] = [
  {
    id: 101,
    text: '周会上，你的方案被连续追问了三句“为什么这么做”，你心里第一反应更像？',
    dimension: 'S1',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '完了，是不是我真的不太行。', key: 'A' },
      { value: 2, label: '先慌一下，再边答边稳住。', key: 'B' },
      { value: 3, label: '好啊，正好让我把逻辑说完整。', key: 'C' },
    ],
  },
  {
    id: 102,
    text: '领导突然问“你最适合在团队里扮演什么角色？”你会？',
    dimension: 'S2',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '脑子空白，临场编一个听起来还行的。', key: 'A' },
      { value: 2, label: '能说个大概，但总觉得还不够准。', key: 'B' },
      { value: 3, label: '这题我熟，我连自己的短板都能一起讲。', key: 'C' },
    ],
  },
  {
    id: 103,
    text: '有个项目钱多、功劳大，但你从心底不认同它的方向。你更可能？',
    dimension: 'S3',
    model: 'self',
    reversed: false,
    options: [
      { value: 1, label: '先接了再说，打工人哪有那么多讲究。', key: 'A' },
      { value: 2, label: '会犹豫，边做边看自己能不能说服自己。', key: 'B' },
      { value: 3, label: '不认同就是不认同，加钱也很难买到我点头。', key: 'C' },
    ],
  },
  {
    id: 104,
    text: '你把重要材料发给领导，对方 6 小时没回。你的脑内弹幕更接近？',
    dimension: 'E1',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '完了，是不是我写得太烂了。', key: 'A' },
      { value: 2, label: '有点虚，但还能劝自己先别想太多。', key: 'B' },
      { value: 3, label: '大概率只是忙，回头自然会看。', key: 'C' },
    ],
  },
  {
    id: 105,
    text: '项目刚立项，你的投入状态通常是？',
    dimension: 'E2',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '先观望，别还没开始就把心搭进去。', key: 'A' },
      { value: 2, label: '会投入，但还留着一部分理智。', key: 'B' },
      { value: 3, label: '我已经开始替它操心到下个季度了。', key: 'C' },
    ],
  },
  {
    id: 106,
    text: '晚上十点，同事还在群里连发十几条消息催你看。你会怎么想？',
    dimension: 'E3',
    model: 'emotion',
    reversed: false,
    options: [
      { value: 1, label: '回啊，既然看到就顺手解决了。', key: 'A' },
      { value: 2, label: '回一点，但会暗暗希望对方赶紧收手。', key: 'B' },
      { value: 3, label: '已读都嫌多，下班后请退出我的领地。', key: 'C' },
    ],
  },
  {
    id: 107,
    text: '新同事第一天就来找你求助，你的默认判断更接近？',
    dimension: 'A1',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '先留个心眼，别是把我当免费劳动力。', key: 'A' },
      { value: 2, label: '看情况，先帮一点再观察。', key: 'B' },
      { value: 3, label: '能来问就说明信任我，先帮了再说。', key: 'C' },
    ],
  },
  {
    id: 108,
    text: '流程还没完全走完，但 deadline 已经贴脸。你通常会？',
    dimension: 'A2',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '先干再说，流程是给有空的人走的。', key: 'A' },
      { value: 2, label: '能补的流程先补，补不上的边做边解释。', key: 'B' },
      { value: 3, label: '再急也得把规矩对齐，不然迟早返工。', key: 'C' },
    ],
  },
  {
    id: 109,
    text: '“打工对我来说到底意味着什么？”你更接近哪句？',
    dimension: 'A3',
    model: 'attitude',
    reversed: false,
    options: [
      { value: 1, label: '发工资就行，别给我加上什么崇高意义。', key: 'A' },
      { value: 2, label: '既是赚钱，也是顺便把自己过明白一点。', key: 'B' },
      { value: 3, label: '我确实想在工作里做成点什么，留点东西。', key: 'C' },
    ],
  },
  {
    id: 110,
    text: '看到同龄同事升职了，你的第一反应通常是？',
    dimension: 'Ac1',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '与我无关，我先把今天混过去。', key: 'A' },
      { value: 2, label: '会被刺激一下，但不至于立刻开卷。', key: 'B' },
      { value: 3, label: '行，我也得往上挪一格了。', key: 'C' },
    ],
  },
  {
    id: 111,
    text: '老板说“下午三点前从 A/B 两版里给我拍一个”，你大概率会？',
    dimension: 'Ac2',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '先反复横跳，恨不得开三轮内心评审会。', key: 'A' },
      { value: 2, label: '快速权衡一下，再给一个能交代的答案。', key: 'B' },
      { value: 3, label: '十分钟内拍板，错了再修。', key: 'C' },
    ],
  },
  {
    id: 112,
    text: '会前 30 分钟才收到“顺手帮我润色下这 10 页 PPT”，你的执行模式更像？',
    dimension: 'Ac3',
    model: 'action',
    reversed: false,
    options: [
      { value: 1, label: '先崩五分钟，然后边骂边拖。', key: 'A' },
      { value: 2, label: '挑关键的救一遍，能交差就交。', key: 'B' },
      { value: 3, label: '立刻进入战斗模式，能救多少救多少。', key: 'C' },
    ],
  },
  {
    id: 113,
    text: '茶水间遇到第一次见面的新同事，你更像？',
    dimension: 'So1',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '假装接水很忙，尽量减少眼神接触。', key: 'A' },
      { value: 2, label: '对上眼就点头，没对上就算了。', key: 'B' },
      { value: 3, label: '我会顺手接一句“你是新来的吧？”', key: 'C' },
    ],
  },
  {
    id: 114,
    text: '刚熟一点的同事突然问你工资、感情和私生活近况，你的身体反应是？',
    dimension: 'So2',
    model: 'social',
    reversed: false,
    options: [
      { value: 1, label: '能聊就聊，反正没什么不能说的。', key: 'A' },
      { value: 2, label: '会打哈哈糊过去，不太想展开。', key: 'B' },
      { value: 3, label: '警报大作：咱们关系还没到这一步。', key: 'C' },
    ],
  },
  {
    id: 115,
    text: '在领导面前的你，和在熟同事面前的你，通常差很多。',
    dimension: 'So3',
    model: 'social',
    reversed: true,
    options: [
      { value: 3, label: '差很多，简直像在切换两个操作系统。', key: 'A' },
      { value: 2, label: '会微调，但核心人格没换。', key: 'B' },
      { value: 1, label: '差不多，我在哪都不太演。', key: 'C' },
    ],
  },
  {
    id: 131,
    text: '公司聚餐你最期待的环节通常是？',
    dimension: 'S1',
    model: 'self',
    reversed: false,
    isDrinkTrigger: true,
    options: [
      { value: 1, label: '吃完就撤，别整后半场。', key: 'A' },
      { value: 2, label: '正常聊天就行，别太闹。', key: 'B' },
      { value: 3, label: '上酒上歌上夜场，最好还能再续一摊。', key: 'C' },
    ],
  },
  {
    id: 132,
    text: '一旦喝了点酒，你在团建 / 年会上的发言风格通常会？',
    dimension: 'So3',
    model: 'social',
    reversed: true,
    isDrinkBranch: true,
    options: [
      { value: 3, label: '判若两人，平时不敢说的全给我端上来。', key: 'A' },
      { value: 2, label: '会更松一点，但还算知道自己在说什么。', key: 'B' },
      { value: 1, label: '喝不喝都差不多，我这人主打一个前后一致。', key: 'C' },
    ],
  },
];

export function shuffleBantiQuestions(questions: Question[]): Question[] {
  const main = questions.filter(q => !q.isDrinkBranch);
  const shuffled = [...main];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }
  return shuffled;
}