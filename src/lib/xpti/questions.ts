import { shuffleArray } from '../question-pool';
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

function opts(a: string, b: string, c: string): XptiAnswerOption[] {
  return [
    { value: 3, label: a, key: 'A' },
    { value: 2, label: b, key: 'B' },
    { value: 1, label: c, key: 'C' },
  ];
}

// ═══════════════════════════════════════════
// D1 · 主导欲 (Dominance)
// ═══════════════════════════════════════════
const DOMINANCE_QUESTIONS: XptiQuestion[] = [
  {
    id: 1,
    text: '两个人独处、气氛刚好的时候，你更想——',
    dimension: 'D1', model: 'dominance', reversed: false,
    options: opts('按住对方', '看谁先忍不住谁先动', '被按住'),
  },
  {
    id: 2,
    text: '如果亲密关系是一场戏，你更像——',
    dimension: 'D1', model: 'dominance', reversed: false,
    options: opts('总导演，从剧本到灯光全归我管', '联合导演，轮流来', '最佳女主角，全靠对手戏带'),
  },
  {
    id: 3,
    text: '"听我的"这三个字从你嘴里说出来的频率——',
    dimension: 'D1', model: 'dominance', reversed: false,
    options: opts('很高，而且我说了就要执行', '该说的时候说，不硬来', '几乎不说，我更喜欢听对方安排'),
  },
  {
    id: 4,
    text: '对方每次都让你做选择题，你的真实感受——',
    dimension: 'D1', model: 'dominance', reversed: false,
    options: opts('正合我意，我来拍板效率最高', '看情况，有时也想被安排一次', '赶紧你来决定吧，我决策疲劳了'),
  },
  {
    id: 5,
    text: '对方说"你说了算"的时候，你的内心状态——',
    dimension: 'D1', model: 'dominance', reversed: true,
    options: opts('挺好的，这就是我想要的', '偶尔这样还行', '反而有点不太自在，我更想听他说'),
  },
  {
    id: 6,
    text: '在亲密关系里，被带着走你会觉得——',
    dimension: 'D1', model: 'dominance', reversed: true,
    options: opts('很安心，完全放松', '偶尔挺好，但不能一直这样', '受不了，我需要自己掌握方向'),
  },
];

// ═══════════════════════════════════════════
// D2 · 情感裸露度 (Exposure)
// ═══════════════════════════════════════════
const EXPOSURE_QUESTIONS: XptiQuestion[] = [
  {
    id: 7,
    text: '"我想你了"这种话，你说出口的频率——',
    dimension: 'D2', model: 'exposure', reversed: false,
    options: opts('想了就说，有什么好忍的', '偶尔，得看关系走到哪一步', '基本不会先说'),
  },
  {
    id: 8,
    text: '在一段信任的关系里，你能接受被看到最狼狈的样子吗？',
    dimension: 'D2', model: 'exposure', reversed: false,
    options: opts('最狼狈才最真实，看吧', '特定时刻可以', '不行，我永远要保持一定的体面'),
  },
  {
    id: 9,
    text: '深夜聊天时对方问了一个很私密的问题，你会——',
    dimension: 'D2', model: 'exposure', reversed: false,
    options: opts('氛围到了就说了，没什么不能聊的', '看问什么，有些可以有些算了', '笑着岔开话题，私密的东西不会轻易说'),
  },
  {
    id: 10,
    text: '你最真实的那一面，展示给对方看过吗？',
    dimension: 'D2', model: 'exposure', reversed: false,
    options: opts('展示过，而且不后悔', '露出过一些，但保留了最核心的', '还没有人见过那一面'),
  },
  {
    id: 11,
    text: '你在对方面前哭过吗，或者能想象自己在对方面前哭？',
    dimension: 'D2', model: 'exposure', reversed: true,
    options: opts('不会，哭是我自己的事', '极端情况下可能，但平时不太会', '会的，哭完反而更亲近'),
  },
  {
    id: 12,
    text: '就算关系很近，有些话我也宁愿烂在肚子里。',
    dimension: 'D2', model: 'exposure', reversed: true,
    options: opts('对，有些东西不说比较好', '看情况，不是所有话都适合说', '不是，我觉得说出来才是真的亲密'),
  },
];

// ═══════════════════════════════════════════
// D3 · 感官灵敏度 (Sensory)
// ═══════════════════════════════════════════
const SENSORY_QUESTIONS: XptiQuestion[] = [
  {
    id: 13,
    text: '对方不经意碰到你手背的那一下——',
    dimension: 'D3', model: 'sensory', reversed: false,
    options: opts('整条手臂都过电了', '注意到了，但不会多想', '没什么特别的感觉'),
  },
  {
    id: 14,
    text: '某种特定的气味，能让你瞬间想起某个人吗？',
    dimension: 'D3', model: 'sensory', reversed: false,
    options: opts('经常，而且会被彻底拉回那个场景', '有一两种可能', '不太会'),
  },
  {
    id: 15,
    text: '灯光暗下来、音乐刚好对上的那种瞬间——',
    dimension: 'D3', model: 'sensory', reversed: false,
    options: opts('全身都在起反应，我太吃氛围了', '会心跳加速，但还hold得住', '氛围对我的影响不太大'),
  },
  {
    id: 16,
    text: '对方靠近你时身上的气息——',
    dimension: 'D3', model: 'sensory', reversed: false,
    options: opts('直接决定我对他感觉的50%', '加分项，但不至于决定性', '很少注意这种细节'),
  },
  {
    id: 17,
    text: '别人说"皮肤接触是一种语言"，你觉得——',
    dimension: 'D3', model: 'sensory', reversed: true,
    options: opts('有点夸张了', '理解但没那么强烈', '完全同意，有些话身体比嘴先说'),
  },
  {
    id: 18,
    text: '感官刺激对你来说，就像空气一样自然而然。',
    dimension: 'D3', model: 'sensory', reversed: true,
    options: opts('不至于，我更理性', '有时候是的', '太对了，我就是靠感官活的'),
  },
];

// ═══════════════════════════════════════════
// D4 · 节奏偏好 (Tempo)
// ═══════════════════════════════════════════
const TEMPO_QUESTIONS: XptiQuestion[] = [
  {
    id: 19,
    text: '你心目中的"来电了"到底有多快？',
    dimension: 'D4', model: 'tempo', reversed: false,
    options: opts('一个晚上，有时一个眼神', '几次接触就知道了', '几个月慢慢确认'),
  },
  {
    id: 20,
    text: '对方说"别急"的时候，你的真实反应——',
    dimension: 'D4', model: 'tempo', reversed: false,
    options: opts('我已经急了', '行吧……你说了算', '确实该慢一点'),
  },
  {
    id: 21,
    text: '暧昧期你更享受哪个阶段？',
    dimension: 'D4', model: 'tempo', reversed: false,
    options: opts('确认的那一刻，直接起飞', '不远不近的试探阶段', '从陌生到微妙的慢慢升温'),
  },
  {
    id: 22,
    text: '"水到渠成"这个词对你来说——',
    dimension: 'D4', model: 'tempo', reversed: false,
    options: opts('等水到渠成我都老了，直接开闸', '道理我懂，但有时候忍不住', '挺好的，自然的节奏最舒服'),
  },
  {
    id: 23,
    text: '你觉得"慢慢来"是亲密关系里最好的节奏。',
    dimension: 'D4', model: 'tempo', reversed: true,
    options: opts('是的，铺垫越久越好', '看情况，不能太快也不能太慢', '不是，太慢我会失去兴趣'),
  },
  {
    id: 24,
    text: '你享受那种慢慢走近、一点一点确认的过程。',
    dimension: 'D4', model: 'tempo', reversed: true,
    options: opts('非常享受，这才是关系的美', '可以接受，但也不想拖太久', '受不了，我需要更快的节奏'),
  },
];

// ═══════════════════════════════════════════
// D5 · 自我镜像 (Mirror)
// ═══════════════════════════════════════════
const MIRROR_QUESTIONS: XptiQuestion[] = [
  {
    id: 25,
    text: '对方说"你好好看"的时候，你——',
    dimension: 'D5', model: 'mirror', reversed: false,
    options: opts('那天我能高兴到晚上', '会开心一小会儿', '谢谢但我不太需要这个确认'),
  },
  {
    id: 26,
    text: '亲密互动后，对方的反应对你来说——',
    dimension: 'D5', model: 'mirror', reversed: false,
    options: opts('非常重要，我需要知道自己做得好不好', '希望得到反馈，但不是必须', '无所谓，我自己的感受更重要'),
  },
  {
    id: 27,
    text: '如果对方很久没夸过你，你会——',
    dimension: 'D5', model: 'mirror', reversed: false,
    options: opts('开始怀疑自己是不是不够好', '有一点在意但不会太深想', '完全不受影响，自信不需要外部供给'),
  },
  {
    id: 28,
    text: '你有没有因为对方的一句评价，反复对着镜子看自己？',
    dimension: 'D5', model: 'mirror', reversed: false,
    options: opts('有过，不止一次', '偶尔', '没有，别人的评价改变不了我对自己的看法'),
  },
  {
    id: 29,
    text: '你的自信完全来自自己，不太需要别人的反馈。',
    dimension: 'D5', model: 'mirror', reversed: true,
    options: opts('是的，我自己就是自己的来源', '大部分时候是，但偶尔也需要', '不是，我很需要对方的回应来确认自己'),
  },
  {
    id: 30,
    text: '对方在人前夸你、在亲密时回应你，你觉得——',
    dimension: 'D5', model: 'mirror', reversed: true,
    options: opts('加分但不是必需', '会更投入、更放松', '这是我能持续投入一段关系的核心燃料'),
  },
];

// ═══════════════════════════════════════════
// D6 · 边界弹性 (Boundary)
// ═══════════════════════════════════════════
const BOUNDARY_QUESTIONS: XptiQuestion[] = [
  {
    id: 31,
    text: '如果对方提出一个你从没想过的要求——',
    dimension: 'D6', model: 'boundary', reversed: false,
    options: opts('试一次看看呢？', '想想看，要看具体是什么', '不行就是不行'),
  },
  {
    id: 32,
    text: '在亲密关系里，你可以接受的尺度——',
    dimension: 'D6', model: 'boundary', reversed: false,
    options: opts('可聊的范围比大多数人想象的宽', '有明确边界，但不是完全不能谈', '我的底线非常清晰，不要试图挑战'),
  },
  {
    id: 33,
    text: '对方说"我们试试不一样的"，你的第一反应——',
    dimension: 'D6', model: 'boundary', reversed: false,
    options: opts('有点期待', '先听听是什么再说', '本能地有点紧张和抵触'),
  },
  {
    id: 34,
    text: '"没有什么是不能聊的"这句话你同意吗？',
    dimension: 'D6', model: 'boundary', reversed: false,
    options: opts('完全同意', '大部分情况下同意', '不同意，有些事就是不应该被提起'),
  },
  {
    id: 35,
    text: '我的边界一旦画好，就不太会因为对方的要求而改变。',
    dimension: 'D6', model: 'boundary', reversed: true,
    options: opts('是的，底线就是底线', '要看我有多信任对方', '边界本来就是弹性的，在合适的人面前我会松动'),
  },
  {
    id: 36,
    text: '在亲密时刻，你会因为信任而愿意跨出自己的舒适区。',
    dimension: 'D6', model: 'boundary', reversed: true,
    options: opts('不会，舒适区就是我的安全区', '有可能，但需要时间', '会的，信任感到了我什么都愿意试'),
  },
];

// ═══════════════════════════════════════════
// D7 · 想象纵深 (Fantasy)
// ═══════════════════════════════════════════
const FANTASY_QUESTIONS: XptiQuestion[] = [
  {
    id: 37,
    text: '你有过"这件事在脑子里比实际发生还精彩"的经历吗？',
    dimension: 'D7', model: 'fantasy', reversed: false,
    options: opts('经常，脑子里的版本有8K画质', '偶尔', '没太有'),
  },
  {
    id: 38,
    text: '深夜一个人的时候，你的脑子在放什么？',
    dimension: 'D7', model: 'fantasy', reversed: false,
    options: opts('已经自动编好了完整的场景和对白', '偶尔会闪过几个画面', '基本在想明天的安排'),
  },
  {
    id: 39,
    text: '你会给某个人脑补一段根本没发生过的"剧情"吗？',
    dimension: 'D7', model: 'fantasy', reversed: false,
    options: opts('会，而且剧情已经更新好几季了', '偶尔想想，但知道不是真的', '不太会，我分得清想象和现实'),
  },
  {
    id: 40,
    text: '如果幻想也分级，你脑子里的内容大概是——',
    dimension: 'D7', model: 'fantasy', reversed: false,
    options: opts('至少18+，画面很完整', '偶尔越界，大部分时候还好', '基本在PG-13以内'),
  },
  {
    id: 41,
    text: '你觉得想象力是亲密关系里的一种能力。',
    dimension: 'D7', model: 'fantasy', reversed: true,
    options: opts('不觉得，真实比想象重要', '有一点道理', '完全是，好的想象力是最高级的前戏'),
  },
  {
    id: 42,
    text: '脑子里的场景有时候比真实经历更让你"余震"。',
    dimension: 'D7', model: 'fantasy', reversed: true,
    options: opts('不太能理解这种感觉', '偶尔有过', '太对了，脑子里的回放功能太强大了'),
  },
];

// ═══════════════════════════════════════════
// D8 · 依附模式 (Attachment)
// ═══════════════════════════════════════════
const ATTACHMENT_QUESTIONS: XptiQuestion[] = [
  {
    id: 43,
    text: '对方出差一周不联系，你的状态——',
    dimension: 'D8', model: 'attachment', reversed: false,
    options: opts('第三天就开始编对方出事的剧本了', '会想但能忍', '挺好的，终于有自己的时间了'),
  },
  {
    id: 44,
    text: '你对"秒回"这件事的真实态度——',
    dimension: 'D8', model: 'attachment', reversed: false,
    options: opts('我也想要，而且我也能做到', '希望但不强求', '谁有空谁回就行，不用太在意'),
  },
  {
    id: 45,
    text: '亲密关系里，你最受不了的是——',
    dimension: 'D8', model: 'attachment', reversed: false,
    options: opts('感觉不到连接、不被需要', '说不清楚，但就是偶尔会空', '对方太黏反而让我窒息'),
  },
  {
    id: 46,
    text: '见完面之后的那个晚上，你通常——',
    dimension: 'D8', model: 'attachment', reversed: false,
    options: opts('一直在回味详细的过程和细节', '偶尔想想，但很快做自己的事了', '切换回独处模式，充电完毕'),
  },
  {
    id: 47,
    text: '我一个人也能过得很好，恋爱是加分不是必需。',
    dimension: 'D8', model: 'attachment', reversed: true,
    options: opts('完全同意，独处是一种能力', '理性上同意，但有时还是会想', '不太同意，我需要那种被连接的感觉'),
  },
  {
    id: 48,
    text: '你有没有觉得"空窗期太长了我可能会疯"？',
    dimension: 'D8', model: 'attachment', reversed: true,
    options: opts('不会，我享受一个人', '时间太长了可能有点', '有过这种感觉，我怀疑自己是不是黏人体质'),
  },
];

// ═══════════════════════════════════════════
// D9 · 新鲜vs回味 (Repetition)
// ═══════════════════════════════════════════
const REPETITION_QUESTIONS: XptiQuestion[] = [
  {
    id: 49,
    text: '找到了一个特别好的"方式"，你倾向——',
    dimension: 'D9', model: 'repetition', reversed: false,
    options: opts('就这个，反复确认，越来越深', '一半保留一半尝新', '继续探索新的可能性'),
  },
  {
    id: 50,
    text: '你更享受哪种亲密感？',
    dimension: 'D9', model: 'repetition', reversed: false,
    options: opts('和同一个人在熟悉的模式里越来越默契', '稳定中偶尔来点新花样', '每次都有新东西才有意思'),
  },
  {
    id: 51,
    text: '对方说"我们每次好像都一样"，你会觉得——',
    dimension: 'D9', model: 'repetition', reversed: false,
    options: opts('那说明我们找到了最好的方式啊', '可以换一换，但核心不用变', '确实该变变了'),
  },
  {
    id: 52,
    text: '"越熟悉越有味道"这句话你同意吗？',
    dimension: 'D9', model: 'repetition', reversed: false,
    options: opts('完全同意，默契就是最大的调味料', '一定程度上同意', '不太同意，熟悉了就少了心跳'),
  },
  {
    id: 53,
    text: '你会因为"太熟了、没有新鲜感"而想换一种方式。',
    dimension: 'D9', model: 'repetition', reversed: true,
    options: opts('会，新鲜感对我很重要', '偶尔会这样想', '不会，我更享受在确定感中深入'),
  },
  {
    id: 54,
    text: '重复是无聊的开始——你认同吗？',
    dimension: 'D9', model: 'repetition', reversed: true,
    options: opts('认同，我需要不断探索', '看情况', '不认同，重复里有安全感和深度'),
  },
];

export const XPTI_QUESTIONS: XptiQuestion[] = [
  ...DOMINANCE_QUESTIONS,
  ...EXPOSURE_QUESTIONS,
  ...SENSORY_QUESTIONS,
  ...TEMPO_QUESTIONS,
  ...MIRROR_QUESTIONS,
  ...BOUNDARY_QUESTIONS,
  ...FANTASY_QUESTIONS,
  ...ATTACHMENT_QUESTIONS,
  ...REPETITION_QUESTIONS,
];

/** Sample ~27 questions: 3 per dimension (2 forward + 1 reversed) */
const XPTI_QUESTIONS_PER_DIMENSION = 3;
const XPTI_REVERSED_PER_DIMENSION = 1;

function sampleXptiDimension(questions: readonly XptiQuestion[], random: () => number): XptiQuestion[] {
  const reversed = questions.filter(q => q.reversed);
  const forward = questions.filter(q => !q.reversed);
  const sampled: XptiQuestion[] = [];
  const sampledIds = new Set<number>();

  const reversedTarget = Math.min(XPTI_REVERSED_PER_DIMENSION, reversed.length, XPTI_QUESTIONS_PER_DIMENSION);
  const forwardTarget = Math.min(XPTI_QUESTIONS_PER_DIMENSION - reversedTarget, forward.length);

  for (const question of shuffleArray(forward, random).slice(0, forwardTarget)) {
    sampled.push(question);
    sampledIds.add(question.id);
  }

  for (const question of shuffleArray(reversed, random).slice(0, reversedTarget)) {
    sampled.push(question);
    sampledIds.add(question.id);
  }

  if (sampled.length < XPTI_QUESTIONS_PER_DIMENSION) {
    const remainder = shuffleArray(
      questions.filter(q => !sampledIds.has(q.id)),
      random
    ).slice(0, XPTI_QUESTIONS_PER_DIMENSION - sampled.length);
    sampled.push(...remainder);
  }

  return shuffleArray(sampled, random);
}

export function shuffleXptiQuestions(questions: XptiQuestion[]): XptiQuestion[] {
  const dimensionBuckets = new Map<string, XptiQuestion[]>();

  for (const question of questions) {
    const bucket = dimensionBuckets.get(question.dimension) ?? [];
    bucket.push(question);
    dimensionBuckets.set(question.dimension, bucket);
  }

  const sampled: XptiQuestion[] = [];
  for (const bucket of dimensionBuckets.values()) {
    sampled.push(...sampleXptiDimension(bucket, Math.random));
  }

  return shuffleArray(sampled, Math.random);
}
