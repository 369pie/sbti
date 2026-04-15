export interface DailyCardInterpretation {
  /** 大阿卡纳牌名（英文） */
  arcanaName: string;
  /** 大阿卡纳牌名（中文） */
  arcanaNameCN: string;
  /** 牌面关键词 */
  keywords: string[];
  /** 今日解读（2-3 句，针对「今天的能量」而非人格） */
  dailyReading: string;
  /** 今日行动建议（1 句，可执行） */
  action: string;
  /** 幸运色 */
  luckyColor: string;
  /** 幸运数字 */
  luckyNumber: number;
}

/**
 * Use date (YYYY-MM-DD) to deterministically select one of 22 cards.
 * Same card for everyone on the same day (creates shared experience).
 * Formula: hash the date string (sum of char codes) % 22
 */
export function getDailyCardIndex(date?: Date): number {
  const d = date ?? new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash += dateStr.charCodeAt(i);
  }
  return hash % 22;
}

/**
 * Format date in Chinese style: 2025年4月16日
 */
export function formatDateCN(date?: Date): string {
  const d = date ?? new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 22 Major Arcana daily interpretations */
const DAILY_CARDS: DailyCardInterpretation[] = [
  {
    arcanaName: 'The Fool',
    arcanaNameCN: '愚者',
    keywords: ['冒险', '新开始', '信任直觉'],
    dailyReading: '今天适合做一个小小的冒险。不需要很大的勇气，只需要迈出第一步。宇宙在对你说：别想太多，去做就对了。',
    action: '今天做一件你一直想做但没做的事，哪怕只是很小的一步。',
    luckyColor: '#E8D5B7',
    luckyNumber: 0,
  },
  {
    arcanaName: 'The Magician',
    arcanaNameCN: '魔术师',
    keywords: ['显化', '行动', '创造力'],
    dailyReading: '今天是把想法变成现实的日子。你手边的资源比你以为的多得多。现在不是犹豫的时候，是施展魔法的时候。',
    action: '今天把你搁置很久的一个想法，写下第一步行动计划。',
    luckyColor: '#C9A86C',
    luckyNumber: 1,
  },
  {
    arcanaName: 'The High Priestess',
    arcanaNameCN: '女祭司',
    keywords: ['直觉', '内观', '倾听内心'],
    dailyReading: '今天适合安静下来。你内心深处有一个声音正在试图告诉你什么——但你需要把外界的噪音调小，才能听见它。',
    action: '今天给自己10分钟的独处时间，什么都不做，只是安静地待着。',
    luckyColor: '#7B68AE',
    luckyNumber: 2,
  },
  {
    arcanaName: 'The Empress',
    arcanaNameCN: '女皇',
    keywords: ['丰饶', '创造', '滋养'],
    dailyReading: '今天是滋养自己的一天。去吃一顿好饭，见一个温暖的人，做一件让自己感到被爱的事。丰盛不是外在的，是你允许自己享受当下的能力。',
    action: '今天用一种感官享受犒劳自己——美食、音乐、或者一个热水澡。',
    luckyColor: '#D4A574',
    luckyNumber: 3,
  },
  {
    arcanaName: 'The Emperor',
    arcanaNameCN: '皇帝',
    keywords: ['秩序', '结构', '掌控'],
    dailyReading: '今天适合整理和规划。混乱让你焦虑，但秩序可以成为你的力量。给今天列一个小清单，你会发现掌控感回来了。',
    action: '今天整理一个你一直没收拾的角落——书桌、手机相册、或者脑海里的计划。',
    luckyColor: '#8B4513',
    luckyNumber: 4,
  },
  {
    arcanaName: 'The Hierophant',
    arcanaNameCN: '教皇',
    keywords: ['传统', '规则', '学习'],
    dailyReading: '今天是向有经验的人请教的好日子。有些路前人走过，有些坑不必亲自踩。虚心请教不是软弱，是智慧的捷径。',
    action: '今天向一个你尊敬的人请教一个问题，哪怕只是发一条消息。',
    luckyColor: '#DAA520',
    luckyNumber: 5,
  },
  {
    arcanaName: 'The Lovers',
    arcanaNameCN: '恋人',
    keywords: ['连接', '选择', '跟随心'],
    dailyReading: '今天心会比脑子更准确。面对选择时，问自己「哪一个让我心跳加速」而不是「哪一个更安全」。爱是一切答案的起点。',
    action: '今天给一个你在乎的人发一条消息，告诉TA你有多在意。',
    luckyColor: '#FF6B8A',
    luckyNumber: 6,
  },
  {
    arcanaName: 'The Chariot',
    arcanaNameCN: '战车',
    keywords: ['意志力', '推进', '克服障碍'],
    dailyReading: '今天是你冲破阻力的日子。那件你拖延了很久的事，现在是时候硬着头皮上了。动力不会自己来，但你可以创造它。',
    action: '今天完成一件你一直逃避的任务，不需要完美，只需要完成。',
    luckyColor: '#2C3E50',
    luckyNumber: 7,
  },
  {
    arcanaName: 'Strength',
    arcanaNameCN: '力量',
    keywords: ['温柔的力量', '耐心', '情绪管理'],
    dailyReading: '真正的力量不是爆发，是温柔地坚持。今天遇到的挑战不需要你硬碰硬，耐心和柔软反而是最好的武器。',
    action: '今天用温柔的方式处理一件让你烦躁的事——深呼吸，微笑，然后继续。',
    luckyColor: '#E6B980',
    luckyNumber: 8,
  },
  {
    arcanaName: 'The Hermit',
    arcanaNameCN: '隐士',
    keywords: ['独处', '反思', '内在智慧'],
    dailyReading: '今天答案不在外面，在里面。当你不再向外寻找答案的时候，答案会自己来找你。给自己一段安静的时光吧。',
    action: '今天拒绝一个社交邀请，把时间留给自己。',
    luckyColor: '#5D6D7E',
    luckyNumber: 9,
  },
  {
    arcanaName: 'Wheel of Fortune',
    arcanaNameCN: '命运之轮',
    keywords: ['转变', '机遇', '顺势而为'],
    dailyReading: '命运之轮正在转动，今天可能有意想不到的变化。不用紧张——变化未必是坏事。最好的策略是不抵抗，顺势而为，看看轮子要把你带到哪里。',
    action: '今天对一个计划外的机会说"好"，而不是本能地拒绝。',
    luckyColor: '#9B59B6',
    luckyNumber: 10,
  },
  {
    arcanaName: 'Justice',
    arcanaNameCN: '正义',
    keywords: ['公平', '因果', '正确选择'],
    dailyReading: '今天是做正确的事的日子，即使没人看到。因果的账本从不出错，你今天种下的善意，会在未来某一天开花结果。',
    action: '今天做一件不需要回报的善事——帮一个忙，或者给一个真诚的赞美。',
    luckyColor: '#C0392B',
    luckyNumber: 11,
  },
  {
    arcanaName: 'The Hanged Man',
    arcanaNameCN: '倒吊人',
    keywords: ['暂停', '新视角', '放下执念'],
    dailyReading: '有时候前进的方式是先停下来。今天试着换个角度看那个困扰你的问题——当你不再执着于"应该怎样"，答案会自己浮现。',
    action: '今天主动暂停一件你正在纠结的事，放下一天，明天再看。',
    luckyColor: '#34495E',
    luckyNumber: 12,
  },
  {
    arcanaName: 'Death',
    arcanaNameCN: '死神',
    keywords: ['结束与开始', '放下旧的', '迎接新生'],
    dailyReading: '这不是真正的死亡，是旧我的消融。今天适合做一个告别——放下一个不再适合你的习惯、关系或想法。结束之后，空间就打开了，新的东西才能进来。',
    action: '今天清理一样旧东西——一条旧消息、一件旧物、或者一段旧关系。',
    luckyColor: '#1A1A2E',
    luckyNumber: 13,
  },
  {
    arcanaName: 'Temperance',
    arcanaNameCN: '节制',
    keywords: ['平衡', '耐心', '调和'],
    dailyReading: '今天是调和的一天。快与慢、工作与休息、给予与接受——找到中间点，你就找到了今天的节奏。不极端，不偏执，刚刚好。',
    action: '今天在做任何事之前先问自己："这样做是否平衡？"然后调整。',
    luckyColor: '#87CEEB',
    luckyNumber: 14,
  },
  {
    arcanaName: 'The Devil',
    arcanaNameCN: '恶魔',
    keywords: ['欲望', '诱惑', '审视束缚'],
    dailyReading: '今天诱惑会特别强——刷手机、暴饮暴食、或者沉溺在某种快感里。不评判自己，但试着觉察：是什么在背后推动你？觉察本身就是自由的开始。',
    action: '今天找到一个让你上瘾的小习惯，试着觉察它而不是立刻戒掉。',
    luckyColor: '#8B0000',
    luckyNumber: 15,
  },
  {
    arcanaName: 'The Tower',
    arcanaNameCN: '高塔',
    keywords: ['突变', '打破', '崩塌后重建'],
    dailyReading: '今天可能有些"地震"——计划被打乱、消息让你震惊、或者某个信念突然崩塌。别怕，高塔倒塌是为了让地基重新长出更好的东西。深呼吸，接受突变。',
    action: '今天接受一件"不按计划"发生的事，看看它会把你带向哪里。',
    luckyColor: '#FF4500',
    luckyNumber: 16,
  },
  {
    arcanaName: 'The Star',
    arcanaNameCN: '星星',
    keywords: ['希望', '疗愈', '在黑暗中找到光'],
    dailyReading: '在所有牌里，星星是最治愈的一张。今天不管经历了什么，记住：黑暗中总有光在等你。你不需要很亮，只需要不熄灭。',
    action: '今天给自己一个"小希望"——写下你期待的一件事，或者做一件让你感到未来可期的事。',
    luckyColor: '#87CEFA',
    luckyNumber: 17,
  },
  {
    arcanaName: 'The Moon',
    arcanaNameCN: '月亮',
    keywords: ['潜意识', '不确定', '直觉'],
    dailyReading: '今天水面之下有暗流。你看不清全貌，直觉告诉你有些东西不太对——但你又说不上来是什么。没关系，月亮牌的建议是：相信你的直觉，即使证据还不充分。',
    action: '今天注意你做的梦或脑中突然冒出的念头，把它们记下来。',
    luckyColor: '#C0C0C0',
    luckyNumber: 18,
  },
  {
    arcanaName: 'The Sun',
    arcanaNameCN: '太阳',
    keywords: ['活力', '快乐', '发光发热'],
    dailyReading: '今天是好日子！阳光牌是大阿卡纳里最明亮的一张——今天适合做任何让你开心的事。笑出声来，跑起来，大声说话。你的快乐会感染所有人。',
    action: '今天做一件纯粹让你快乐的事，不需要任何"意义"，只需要开心。',
    luckyColor: '#FFD700',
    luckyNumber: 19,
  },
  {
    arcanaName: 'Judgement',
    arcanaNameCN: '审判',
    keywords: ['召唤', '觉醒', '倾听内心'],
    dailyReading: '今天是觉醒的日子。某个一直在你心里的召唤正在变得清晰——可能是某个被忽略的梦想，可能是某个被压抑的真相。今天试着认真听一听。',
    action: '今天问自己一个严肃的问题："如果明天就是最后一天，我今天会做什么？"然后照着答案去做。',
    luckyColor: '#B8860B',
    luckyNumber: 20,
  },
  {
    arcanaName: 'The World',
    arcanaNameCN: '世界',
    keywords: ['完成', '圆满', '庆祝终点'],
    dailyReading: '今天的能量是圆满。你完成了一段旅程——不管是一个项目、一段关系的阶段、还是内心的某种成长。给自己一个庆祝，你值得。',
    action: '今天认真庆祝你最近完成的一件事，哪怕是很小的成就。',
    luckyColor: '#228B22',
    luckyNumber: 21,
  },
];

export function getDailyCard(date?: Date): DailyCardInterpretation {
  const index = getDailyCardIndex(date);
  return DAILY_CARDS[index];
}
