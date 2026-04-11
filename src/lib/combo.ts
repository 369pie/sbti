import type { PersonalityType } from './personalities';
import { PERSONALITY_TYPES } from './personalities';
import type { DimensionLevel } from './dimensions';
import { withBasePath } from './site';

// ─── MBTI ────────────────────────────────────────────────

export interface MBTIType {
  code: string;  // e.g. 'INFP'
  label: string; // e.g. '调停者'
  dims: { ei: 'E' | 'I'; sn: 'S' | 'N'; tf: 'T' | 'F'; jp: 'J' | 'P' };
}

export const MBTI_TYPES: MBTIType[] = [
  { code: 'ISTJ', label: '检查员', dims: { ei: 'I', sn: 'S', tf: 'T', jp: 'J' } },
  { code: 'ISFJ', label: '守护者', dims: { ei: 'I', sn: 'S', tf: 'F', jp: 'J' } },
  { code: 'INFJ', label: '提倡者', dims: { ei: 'I', sn: 'N', tf: 'F', jp: 'J' } },
  { code: 'INTJ', label: '建筑师', dims: { ei: 'I', sn: 'N', tf: 'T', jp: 'J' } },
  { code: 'ISTP', label: '鉴赏家', dims: { ei: 'I', sn: 'S', tf: 'T', jp: 'P' } },
  { code: 'ISFP', label: '探险家', dims: { ei: 'I', sn: 'S', tf: 'F', jp: 'P' } },
  { code: 'INFP', label: '调停者', dims: { ei: 'I', sn: 'N', tf: 'F', jp: 'P' } },
  { code: 'INTP', label: '逻辑学家', dims: { ei: 'I', sn: 'N', tf: 'T', jp: 'P' } },
  { code: 'ESTP', label: '企业家', dims: { ei: 'E', sn: 'S', tf: 'T', jp: 'P' } },
  { code: 'ESFP', label: '表演者', dims: { ei: 'E', sn: 'S', tf: 'F', jp: 'P' } },
  { code: 'ENFP', label: '竞选者', dims: { ei: 'E', sn: 'N', tf: 'F', jp: 'P' } },
  { code: 'ENTP', label: '辩论家', dims: { ei: 'E', sn: 'N', tf: 'T', jp: 'P' } },
  { code: 'ESTJ', label: '总经理', dims: { ei: 'E', sn: 'S', tf: 'T', jp: 'J' } },
  { code: 'ESFJ', label: '执政官', dims: { ei: 'E', sn: 'S', tf: 'F', jp: 'J' } },
  { code: 'ENFJ', label: '主人公', dims: { ei: 'E', sn: 'N', tf: 'F', jp: 'J' } },
  { code: 'ENTJ', label: '指挥官', dims: { ei: 'E', sn: 'N', tf: 'T', jp: 'J' } },
];

// ─── Zodiac ──────────────────────────────────────────────

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

export interface ZodiacSign {
  id: string;
  name: string;
  emoji: string;
  element: ZodiacElement;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries',       name: '白羊座', emoji: '♈️', element: 'fire' },
  { id: 'taurus',      name: '金牛座', emoji: '♉️', element: 'earth' },
  { id: 'gemini',      name: '双子座', emoji: '♊️', element: 'air' },
  { id: 'cancer',      name: '巨蟹座', emoji: '♋️', element: 'water' },
  { id: 'leo',         name: '狮子座', emoji: '♌️', element: 'fire' },
  { id: 'virgo',       name: '处女座', emoji: '♍️', element: 'earth' },
  { id: 'libra',       name: '天秤座', emoji: '♎️', element: 'air' },
  { id: 'scorpio',     name: '天蝎座', emoji: '♏️', element: 'water' },
  { id: 'sagittarius', name: '射手座', emoji: '♐️', element: 'fire' },
  { id: 'capricorn',   name: '摩羯座', emoji: '♑️', element: 'earth' },
  { id: 'aquarius',    name: '水瓶座', emoji: '♒️', element: 'air' },
  { id: 'pisces',      name: '双鱼座', emoji: '♓️', element: 'water' },
];

export const ELEMENT_LABELS: Record<ZodiacElement, string> = {
  fire: '火象',
  earth: '土象',
  air: '风象',
  water: '水象',
};

// ─── Trait analysis helpers ──────────────────────────────

type ModelStrength = 'high' | 'mid' | 'low';

interface SBTITraits {
  self: ModelStrength;
  emotion: ModelStrength;
  attitude: ModelStrength;
  action: ModelStrength;
  social: ModelStrength;
}

const MODEL_DIM_IDS: Record<keyof SBTITraits, string[]> = {
  self: ['S1', 'S2', 'S3'],
  emotion: ['E1', 'E2', 'E3'],
  attitude: ['A1', 'A2', 'A3'],
  action: ['Ac1', 'Ac2', 'Ac3'],
  social: ['So1', 'So2', 'So3'],
};

const LEVEL_SCORE: Record<DimensionLevel, number> = { H: 3, M: 2, L: 1 };

function analyzeProfile(profile: Record<string, DimensionLevel>): SBTITraits {
  const result = {} as SBTITraits;
  for (const [model, ids] of Object.entries(MODEL_DIM_IDS)) {
    const avg = ids.reduce((sum, id) => sum + LEVEL_SCORE[profile[id] ?? 'M'], 0) / ids.length;
    result[model as keyof SBTITraits] = avg >= 2.34 ? 'high' : avg >= 1.67 ? 'mid' : 'low';
  }
  return result;
}

// ─── Combo title generation ──────────────────────────────

interface TitleFragment {
  weight: number;
  text: string;
}

type TraitPredicate = (t: SBTITraits, m: MBTIType['dims'], e: ZodiacElement) => boolean;

interface TitleRule {
  match: TraitPredicate;
  fragments: TitleFragment[];
}

// Prefixes — zodiac element + personality energy
const PREFIX_RULES: TitleRule[] = [
  // Fire combinations
  { match: (_t, _m, e) => e === 'fire', fragments: [
    { weight: 1, text: '冲动型' }, { weight: 1, text: '暴走型' }, { weight: 1, text: '热血型' }, { weight: 1, text: '满血型' },
  ]},
  // Water combinations
  { match: (_t, _m, e) => e === 'water', fragments: [
    { weight: 1, text: '深海型' }, { weight: 1, text: '闷骚型' }, { weight: 1, text: '水逆型' }, { weight: 1, text: '暗涌型' },
  ]},
  // Air combinations
  { match: (_t, _m, e) => e === 'air', fragments: [
    { weight: 1, text: '飘忽型' }, { weight: 1, text: '量子态' }, { weight: 1, text: '电波系' }, { weight: 1, text: '话题制造型' },
  ]},
  // Earth combinations
  { match: (_t, _m, e) => e === 'earth', fragments: [
    { weight: 1, text: '稳定型' }, { weight: 1, text: '钉子户型' }, { weight: 1, text: '务实型' }, { weight: 1, text: '扎根型' },
  ]},
  // Introvert amplifiers
  { match: (t, m) => m.ei === 'I' && t.social === 'low', fragments: [
    { weight: 2, text: '隐居型' }, { weight: 2, text: '人间蒸发型' }, { weight: 2, text: '社恐晚期' },
  ]},
  // Extrovert amplifiers
  { match: (t, m) => m.ei === 'E' && t.social === 'high', fragments: [
    { weight: 2, text: '社牛天花板' }, { weight: 2, text: '人形派对' }, { weight: 2, text: '氛围核弹' },
  ]},
];

// Cores — the main identity label, from SBTI × MBTI cross
const CORE_RULES: TitleRule[] = [
  // High emotion + Feeling
  { match: (t, m) => t.emotion === 'high' && m.tf === 'F', fragments: [
    { weight: 3, text: '精神内耗' }, { weight: 2, text: '情绪过山车' }, { weight: 2, text: '感情过载' },
  ]},
  // Low emotion + Thinking
  { match: (t, m) => t.emotion === 'low' && m.tf === 'T', fragments: [
    { weight: 3, text: '冷血处理器' }, { weight: 2, text: '理性核心' }, { weight: 2, text: '无情计算器' },
  ]},
  // High action + Judging
  { match: (t, m) => t.action === 'high' && m.jp === 'J', fragments: [
    { weight: 3, text: '执行力怪物' }, { weight: 2, text: '人形推土机' }, { weight: 2, text: '使命必达' },
  ]},
  // Low action + Perceiving
  { match: (t, m) => t.action === 'low' && m.jp === 'P', fragments: [
    { weight: 3, text: '拖延症晚期' }, { weight: 2, text: '灵魂摆烂' }, { weight: 2, text: '精神躺平' },
  ]},
  // High self + Introvert
  { match: (t, m) => t.self === 'high' && m.ei === 'I', fragments: [
    { weight: 3, text: '暗处王者' }, { weight: 2, text: '闷声大佬' }, { weight: 2, text: '低调狠人' },
  ]},
  // High self + Extrovert
  { match: (t, m) => t.self === 'high' && m.ei === 'E', fragments: [
    { weight: 3, text: '人形聚光灯' }, { weight: 2, text: '全场焦点' }, { weight: 2, text: '自信核爆' },
  ]},
  // Low self + Feeling
  { match: (t, m) => t.self === 'low' && m.tf === 'F', fragments: [
    { weight: 3, text: '玻璃心战士' }, { weight: 2, text: '自我怀疑循环' }, { weight: 2, text: '内耗发电机' },
  ]},
  // High social + Intuition
  { match: (t, m) => t.social === 'high' && m.sn === 'N', fragments: [
    { weight: 2, text: '社交幻想家' }, { weight: 2, text: '人脉永动机' },
  ]},
  // Low social + Sensing
  { match: (t, m) => t.social === 'low' && m.sn === 'S', fragments: [
    { weight: 2, text: '独处手艺人' }, { weight: 2, text: '社恐工匠' },
  ]},
  // High attitude + Intuition
  { match: (t, m) => t.attitude === 'high' && m.sn === 'N', fragments: [
    { weight: 2, text: '理想主义狂人' }, { weight: 2, text: '宇宙级白日梦' },
  ]},
  // Low attitude + Sensing
  { match: (t, m) => t.attitude === 'low' && m.sn === 'S', fragments: [
    { weight: 2, text: '现实主义泥石流' }, { weight: 2, text: '脚踏实地摆烂' },
  ]},
  // Fallback — everything moderate
  { match: () => true, fragments: [
    { weight: 1, text: '量子叠加态' }, { weight: 1, text: '中庸修炼者' }, { weight: 1, text: '薛定谔人格' },
  ]},
];

// Suffixes — the funny identity tag
const SUFFIX_RULES: TitleRule[] = [
  { match: (t, m) => t.emotion === 'high' && m.tf === 'F', fragments: [
    { weight: 2, text: '终身会员' }, { weight: 2, text: '钉子户' }, { weight: 1, text: '代言人' },
  ]},
  { match: (t, m) => t.action === 'high' && m.jp === 'J', fragments: [
    { weight: 2, text: '永动机' }, { weight: 1, text: '施工队队长' },
  ]},
  { match: (t, m) => t.action === 'low' && m.jp === 'P', fragments: [
    { weight: 2, text: '预备役' }, { weight: 2, text: '持证上岗' }, { weight: 1, text: '协会会长' },
  ]},
  { match: (t) => t.self === 'high', fragments: [
    { weight: 1, text: '代言人' }, { weight: 1, text: '天花板' },
  ]},
  { match: (t, m, e) => e === 'fire' && m.ei === 'E', fragments: [
    { weight: 2, text: '核弹头' }, { weight: 1, text: '发射器' },
  ]},
  { match: (t, m, e) => e === 'water' && m.ei === 'I', fragments: [
    { weight: 2, text: '深潜员' }, { weight: 2, text: '潜水艇' },
  ]},
  { match: () => true, fragments: [
    { weight: 1, text: '选手' }, { weight: 1, text: '编外人员' }, { weight: 1, text: '体验官' },
  ]},
];

// Deterministic seed from three inputs
function hashSeed(sbtiSlug: string, mbtiCode: string, zodiacId: string): number {
  const str = `${sbtiSlug}:${mbtiCode}:${zodiacId}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickFragment(fragments: TitleFragment[], seed: number): string {
  // Weighted random selection using deterministic seed
  const totalWeight = fragments.reduce((sum, f) => sum + f.weight, 0);
  let target = seed % totalWeight;
  for (const f of fragments) {
    target -= f.weight;
    if (target < 0) return f.text;
  }
  return fragments[0].text;
}

function generateTitle(
  traits: SBTITraits,
  mbti: MBTIType,
  zodiac: ZodiacSign,
  seed: number,
): string {
  const dims = mbti.dims;
  const el = zodiac.element;

  const matchedPrefixes = PREFIX_RULES.flatMap(r => r.match(traits, dims, el) ? r.fragments : []);
  const matchedCores = CORE_RULES.flatMap(r => r.match(traits, dims, el) ? r.fragments : []);
  const matchedSuffixes = SUFFIX_RULES.flatMap(r => r.match(traits, dims, el) ? r.fragments : []);

  const prefix = pickFragment(matchedPrefixes.length > 0 ? matchedPrefixes : [{ weight: 1, text: '未分类' }], seed);
  const core = pickFragment(matchedCores, seed >> 3);
  const suffix = pickFragment(matchedSuffixes, seed >> 6);

  return `${prefix} · ${core}${suffix}`;
}

// ─── Roast lines (3 sentences) ───────────────────────────

interface RoastRule {
  match: TraitPredicate;
  lines: string[];
}

const ROAST_POOL: RoastRule[] = [
  // Emotion × MBTI-F
  { match: (t, m) => t.emotion === 'high' && m.tf === 'F', lines: [
    '你的情绪能给整栋楼供暖，可惜暖的只有别人。',
    '每天内耗三次，堪称情绪界的永动机。',
    '别人一句话能让你emo到下周二。',
    '共情能力拉满，情绪垃圾桶也拉满了。',
  ]},
  // Emotion × MBTI-T
  { match: (t, m) => t.emotion === 'low' && m.tf === 'T', lines: [
    '你的心跳曲线比心电图还平。',
    '别人跟你倾诉失恋，你在心算分手成本。',
    '你不是没感情，只是感情需要排队审批。',
    '所有人觉得你冷漠，你觉得大家太吵了。',
  ]},
  // Social × Introvert
  { match: (t, m) => t.social === 'low' && m.ei === 'I', lines: [
    '你的社交电量永远显示 3%，但你觉得刚刚好。',
    '「在吗？」是你最恐惧的两个字。',
    '聚餐的快乐不如回家路上的沉默。',
    '你的朋友圈更新频率堪比哈雷彗星回归。',
  ]},
  // Social × Extrovert
  { match: (t, m) => t.social === 'high' && m.ei === 'E', lines: [
    '你进门三分钟就跟保安称兄道弟了。',
    '你的微信好友数是个谜，连你自己都数不清。',
    '独处超过两小时你会产生存在危机。',
    '安静对你来说不是享受，是惩罚。',
  ]},
  // Action × Judging
  { match: (t, m) => t.action === 'high' && m.jp === 'J', lines: [
    '你的 to-do list 比别人的人生规划还详细。',
    '你去旅游带的攻略打印出来能当枕头。',
    '别人还在纠结选A还是选B，你已经做完C在写复盘了。',
    '你的执行力让 AI 都自愧不如。',
  ]},
  // Action × Perceiving
  { match: (t, m) => t.action === 'low' && m.jp === 'P', lines: [
    'ddl 是你唯一的生产力，而且还经常失效。',
    '你的计划停留在计划制定计划的阶段。',
    '灵感来了就行动——但灵感一年来一次。',
    '你不是懒，你只是在等宇宙给你发信号。',
  ]},
  // Self × zodiac element
  { match: (t, _m, e) => t.self === 'high' && e === 'fire', lines: [
    '自信到发光，走哪都像自带BGM。',
    '你的自我评价和外界评价之间隔了一个太阳系，但你选择相信自己。',
  ]},
  { match: (t, _m, e) => t.self === 'low' && e === 'water', lines: [
    '别人说你好看你能怀疑三天，生怕是客气话。',
    '你的自信需要每天浇水施肥，还经常枯萎。',
  ]},
  // Attitude × Intuition
  { match: (t, m) => t.attitude === 'high' && m.sn === 'N', lines: [
    '你活在一个只有你能看到的平行宇宙里，偶尔回来吃饭。',
    '你的脑内小剧场比Netflix还精彩。',
    '白日梦是你的主线任务，现实是支线。',
  ]},
  // Attitude × Sensing
  { match: (t, m) => t.attitude === 'low' && m.sn === 'S', lines: [
    '你的座右铭：差不多就行了，人生苦短。',
    '理想？有的，就是今天晚饭吃什么。',
    '别人在追梦，你在追外卖。',
  ]},
  // Fire × Extrovert combo
  { match: (_t, m, e) => e === 'fire' && m.ei === 'E', lines: [
    '你和安静两个字之间大概隔了十个宇宙。',
    '你的能量场能点燃一整个KTV包厢。',
  ]},
  // Water × Introvert combo
  { match: (_t, m, e) => e === 'water' && m.ei === 'I', lines: [
    '你的内心世界比马里亚纳海沟还深，而且不对外开放。',
    '表面风平浪静，底下暗流涌动——经典水象内人。',
  ]},
  // Earth × T combo
  { match: (_t, m, e) => e === 'earth' && m.tf === 'T', lines: [
    '你是朋友圈里最靠谱、最无聊的那个人（褒义）。',
    '别人觉得你无趣，你觉得他们不成熟。',
  ]},
  // Air × P combo
  { match: (_t, m, e) => e === 'air' && m.jp === 'P', lines: [
    '你的兴趣爱好换得比天气还勤。',
    '三分钟热度是你送给世界的温柔。',
  ]},
  // Universal fallbacks
  { match: () => true, lines: [
    '你这个组合放在RPG里，可能是个隐藏角色——就是那种大家不知道怎么解锁的。',
    '你的人格拼盘比自助餐还丰富，老板亏了。',
    '你这三件套组合出来，连算命先生都得想一会儿。',
    '恭喜你，你的人格组合在全宇宙可能独一无二——因为没人试过这么拼。',
  ]},
];

function generateRoasts(
  traits: SBTITraits,
  mbti: MBTIType,
  zodiac: ZodiacSign,
  seed: number,
): string[] {
  const dims = mbti.dims;
  const el = zodiac.element;

  const matchedLines: string[] = [];
  for (const rule of ROAST_POOL) {
    if (rule.match(traits, dims, el)) {
      matchedLines.push(...rule.lines);
    }
  }

  // Deterministic pick of 3 unique lines
  const picked: string[] = [];
  const available = [...matchedLines];
  for (let i = 0; i < 3 && available.length > 0; i++) {
    const idx = ((seed >> (i * 4)) + i * 7) % available.length;
    picked.push(available[idx]);
    available.splice(idx, 1);
  }

  return picked;
}

// ─── Easter eggs ─────────────────────────────────────────

interface EasterEgg {
  sbtiSlug: string;
  mbtiCode: string;
  zodiacId: string;
  title: string;
  roasts: string[];
}

const EASTER_EGGS: EasterEgg[] = [
  {
    sbtiSlug: 'dior-s', mbtiCode: 'INFP', zodiacId: 'pisces',
    title: '人间蒸发预备队队长',
    roasts: [
      '你是那种被全世界温柔以待之后依然觉得自己不配的人。',
      '你的生存策略：不争不抢不出头，做一条安静的咸鱼。',
      '恭喜集齐"精神内耗三件套"，可以召唤一整周的不想出门。',
    ],
  },
  {
    sbtiSlug: 'boss', mbtiCode: 'ENTJ', zodiacId: 'leo',
    title: '宇宙级控制面板',
    roasts: [
      '你的控制欲已经溢出屏幕了，有人报警了吗？',
      '太阳都得排在你后面发光。',
      '你不是在安排别人的人生，你是在优化整个银河系的运转效率。',
    ],
  },
  {
    sbtiSlug: 'emo', mbtiCode: 'INFP', zodiacId: 'cancer',
    title: '眼泪永动机哭哭株式会社社长',
    roasts: [
      '你哭的频率比上海下雨还高。',
      '你的泪腺比你的嘴更诚实。',
      '你看一条狗粮广告都能感动到写小作文。',
    ],
  },
  {
    sbtiSlug: 'party', mbtiCode: 'ESFP', zodiacId: 'sagittarius',
    title: '快乐永动机本机',
    roasts: [
      '你一个人能撑起一整个综艺节目的笑点。',
      '安静？那是什么？能吃吗？',
      '你的快乐会传染，CDC 应该来研究一下。',
    ],
  },
  {
    sbtiSlug: 'solo', mbtiCode: 'INTJ', zodiacId: 'aquarius',
    title: '人形防火墙 · 终极形态',
    roasts: [
      '你的社交防御值比银行金库还高。',
      '你不是不合群，你是已经进化到不需要群了。',
      '朋友找你聚餐，你的第一反应是算逃跑路线。',
    ],
  },
  {
    sbtiSlug: 'simp', mbtiCode: 'ESFJ', zodiacId: 'cancer',
    title: '感情ATM · 无限透支版',
    roasts: [
      '你对暗恋对象的关注度比FBI还高。',
      '你的付出感动了所有人，除了你付出的那个人。',
      '你的人生格言：只要我舔得够快，心碎就追不上我。',
    ],
  },
  {
    sbtiSlug: 'nerd', mbtiCode: 'INTP', zodiacId: 'virgo',
    title: '知识黑洞 · 吞噬一切版',
    roasts: [
      '你觉得看论文是一种娱乐活动，别人觉得你有病。',
      '你聊天的引用率比学术期刊还高。',
      '你的快乐很简单——搞明白一个别人根本不关心的问题。',
    ],
  },
  {
    sbtiSlug: 'drunk', mbtiCode: 'ENFP', zodiacId: 'sagittarius',
    title: '人间烟火气满级选手',
    roasts: [
      '你的人生信条：没有什么是一顿酒解决不了的，如果有，那就两顿。',
      '你的朋友圈里一半是酒局合影，另一半是酒后感悟。',
      '你是那种喝完酒跟全世界告白，醒来全不记得的人。',
    ],
  },
];

// ─── Combo Personality (Fusion Type) ─────────────────────

export interface ComboPersonality {
  code: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
}

const COMBO_PERSONALITIES: ComboPersonality[] = [
  { code: 'INFERNO', name: '爆燃体', tagline: '一点就着，烧完整条街', emoji: '🔥', color: '#ef4444' },
  { code: 'ABYSS',   name: '深渊体', tagline: '外表平静，内心是马里亚纳海沟', emoji: '🌊', color: '#3b82f6' },
  { code: 'GLITCH',  name: '故障体', tagline: '逻辑自洽但人类不理解', emoji: '⚡', color: '#8b5cf6' },
  { code: 'FROST',   name: '冰封体', tagline: '冷到结霜但里面是岩浆', emoji: '❄️', color: '#06b6d4' },
  { code: 'BLOOM',   name: '绽放体', tagline: '走到哪里哪里就是花田', emoji: '🌸', color: '#ec4899' },
  { code: 'VOID',    name: '虚空体', tagline: '存在感为零但能量无限', emoji: '🕳️', color: '#6366f1' },
  { code: 'STORM',   name: '风暴体', tagline: '安静十分钟已是极限', emoji: '🌪️', color: '#f59e0b' },
  { code: 'MIRROR',  name: '镜像体', tagline: '你看到的永远不是真实的我', emoji: '🪞', color: '#a78bfa' },
  { code: 'ANCHOR',  name: '锚定体', tagline: '全世界在动只有我不动', emoji: '⚓', color: '#059669' },
  { code: 'SPARK',   name: '火花体', tagline: '灵光一闪然后就忘了', emoji: '✨', color: '#f97316' },
  { code: 'PHANTOM', name: '幻影体', tagline: '在场但已经精神离席', emoji: '👻', color: '#94a3b8' },
  { code: 'NOVA',    name: '超新星', tagline: '能量爆发后归于沉寂', emoji: '💫', color: '#eab308' },
];

function classifyComboPersonality(
  traits: SBTITraits,
  mbti: MBTIType,
  zodiac: ZodiacSign,
  seed: number,
): ComboPersonality {
  const dims = mbti.dims;
  const el = zodiac.element;

  // Fire + high emotion + E → INFERNO
  if (el === 'fire' && traits.emotion === 'high' && dims.ei === 'E') {
    return COMBO_PERSONALITIES.find(p => p.code === 'INFERNO')!;
  }
  // Water + high emotion + I → ABYSS
  if (el === 'water' && traits.emotion !== 'low' && dims.ei === 'I') {
    return COMBO_PERSONALITIES.find(p => p.code === 'ABYSS')!;
  }
  // High self + I + N → GLITCH (confident introvert dreamer)
  if (traits.self === 'high' && dims.ei === 'I' && dims.sn === 'N') {
    return COMBO_PERSONALITIES.find(p => p.code === 'GLITCH')!;
  }
  // Low emotion + T + earth → FROST
  if (traits.emotion === 'low' && dims.tf === 'T' && el === 'earth') {
    return COMBO_PERSONALITIES.find(p => p.code === 'FROST')!;
  }
  // High social + E + F → BLOOM
  if (traits.social === 'high' && dims.ei === 'E' && dims.tf === 'F') {
    return COMBO_PERSONALITIES.find(p => p.code === 'BLOOM')!;
  }
  // Low social + I + low self → VOID
  if (traits.social === 'low' && dims.ei === 'I' && traits.self === 'low') {
    return COMBO_PERSONALITIES.find(p => p.code === 'VOID')!;
  }
  // High action + E + fire → STORM
  if (traits.action === 'high' && dims.ei === 'E' && el === 'fire') {
    return COMBO_PERSONALITIES.find(p => p.code === 'STORM')!;
  }
  // High attitude + N + water → MIRROR
  if (traits.attitude === 'high' && dims.sn === 'N' && el === 'water') {
    return COMBO_PERSONALITIES.find(p => p.code === 'MIRROR')!;
  }
  // Low action + J + earth → ANCHOR
  if (traits.action !== 'high' && dims.jp === 'J' && el === 'earth') {
    return COMBO_PERSONALITIES.find(p => p.code === 'ANCHOR')!;
  }
  // Air + N + P → SPARK
  if (el === 'air' && dims.sn === 'N' && dims.jp === 'P') {
    return COMBO_PERSONALITIES.find(p => p.code === 'SPARK')!;
  }
  // Low action + P + low social → PHANTOM
  if (traits.action === 'low' && dims.jp === 'P' && traits.social === 'low') {
    return COMBO_PERSONALITIES.find(p => p.code === 'PHANTOM')!;
  }
  // High action + high emotion → NOVA
  if (traits.action === 'high' && traits.emotion === 'high') {
    return COMBO_PERSONALITIES.find(p => p.code === 'NOVA')!;
  }

  // Fallback: pick by seed
  const fallbacks = [
    COMBO_PERSONALITIES.find(p => p.code === 'GLITCH')!,
    COMBO_PERSONALITIES.find(p => p.code === 'SPARK')!,
    COMBO_PERSONALITIES.find(p => p.code === 'MIRROR')!,
    COMBO_PERSONALITIES.find(p => p.code === 'NOVA')!,
  ];
  return fallbacks[seed % fallbacks.length];
}

export function getComboPersonalityImage(code: string): string {
  return withBasePath(`/images/types/combo-${code.toLowerCase()}.png`);
}

// ─── Main combo result ───────────────────────────────────

export interface ComboResult {
  personality: PersonalityType;
  mbti: MBTIType;
  zodiac: ZodiacSign;
  comboPersonality: ComboPersonality;
  title: string;
  roasts: string[];
  isEasterEgg: boolean;
}

export function generateCombo(
  sbtiSlug: string,
  mbtiCode: string,
  zodiacId: string,
): ComboResult | null {
  const personality = PERSONALITY_TYPES.find(p => p.slug === sbtiSlug);
  const mbti = MBTI_TYPES.find(m => m.code === mbtiCode);
  const zodiac = ZODIAC_SIGNS.find(z => z.id === zodiacId);

  if (!personality || !mbti || !zodiac) return null;

  // Check easter eggs first
  const egg = EASTER_EGGS.find(
    e => e.sbtiSlug === sbtiSlug && e.mbtiCode === mbtiCode && e.zodiacId === zodiacId,
  );

  const traits = analyzeProfile(personality.profile);
  const seed = hashSeed(sbtiSlug, mbtiCode, zodiacId);
  const comboPersonality = classifyComboPersonality(traits, mbti, zodiac, seed);

  if (egg) {
    return {
      personality, mbti, zodiac,
      comboPersonality,
      title: egg.title,
      roasts: egg.roasts,
      isEasterEgg: true,
    };
  }

  return {
    personality, mbti, zodiac,
    comboPersonality,
    title: generateTitle(traits, mbti, zodiac, seed),
    roasts: generateRoasts(traits, mbti, zodiac, seed),
    isEasterEgg: false,
  };
}

export function getMBTIByCode(code: string): MBTIType | undefined {
  return MBTI_TYPES.find(m => m.code === code);
}

export function getZodiacById(id: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find(z => z.id === id);
}
