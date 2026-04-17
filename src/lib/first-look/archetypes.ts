/**
 * First Look Universe · 初见宇宙
 *
 * 9 female-first archetypes for the 3-4 minute default first-run experience.
 * Each archetype carries:
 *  - A 3-axis psychographic vector (edge / emotion / mystery) that decides scoring fit
 *  - A rarity tier (S/A/B/C) driving scarcity framing in share cards
 *  - A target hold-rate for self-reporting "你是 X%" social currency
 *  - A deep-dive recommendation mapping to WTF / SoulTI / Mysti
 *
 * Design principles:
 *  - Women-first (imagery + copy favour the female gaze)
 *  - No MBTI-style 4-letter codes; every card is a named image
 *  - Desaturated clay-rose + gold + gem palette (matches globals.css v4)
 */

export type DeepDiveTarget = 'wtf' | 'soulti' | 'mysti';

export type Rarity = 'S' | 'A' | 'B' | 'C';

export interface FirstLookArchetype {
  /** Stable 3-digit id, matches "#001..#009" */
  code: string;
  /** URL slug (lowercase, hyphen) */
  slug: string;
  /** Display name (CN) */
  name: string;
  /** Short English title for secondary display */
  nameEn: string;
  /** One-line essence, serif-style ≤ 16 chars */
  essence: string;
  /** ≤ 60 char tagline for card back / share subtitle */
  tagline: string;
  /** Longer prose body (80-130 chars), the "首测散文" moment */
  prose: string;
  /** Archetype vector (0-3 each). Higher = stronger on that axis. */
  vector: { edge: number; emotion: number; mystery: number };
  /** Rarity tier (informs share-card presentation) */
  rarity: Rarity;
  /** Target hold-rate percentage (display-only; seeded, may be adjusted from live data later) */
  holdRate: number;
  /** Primary deep-dive recommendation target */
  primaryDeepDive: DeepDiveTarget;
  /** Secondary deep-dive (for "also try") */
  secondaryDeepDive: DeepDiveTarget;
  /** Accent HEX used for card chrome */
  accent: string;
  /** Secondary accent for gradient */
  accentSoft: string;
  /** Emoji (subtle decorative use only; not the primary visual) */
  emoji: string;
  /** Symbol glyph (∎ ✦ ☾ ⟡ ✧ …) used as card crest */
  glyph: string;
  /** Keywords shown as pill labels */
  keywords: [string, string, string];
  /** 2-line intro when advancing to deep-dive */
  deepDiveInvite: string;
}

// ─── Registry ────────────────────────────────────────────────────────────────

export const FIRST_LOOK_ARCHETYPES: FirstLookArchetype[] = [
  {
    code: '001',
    slug: 'moon-messenger',
    name: '月光信使',
    nameEn: 'Moonlit Messenger',
    essence: '观察者 · 灯塔',
    tagline: '你不抢话，但你的沉默比所有发言都像答案。',
    prose:
      '你像月光——不刺眼，却在黑暗里照到最远的地方。你见过太多人急着表演，所以你决定做那个在岸上等船靠过来的人。',
    vector: { edge: 1, emotion: 2, mystery: 2 },
    rarity: 'A',
    holdRate: 12,
    primaryDeepDive: 'soulti',
    secondaryDeepDive: 'mysti',
    accent: '#8C3E3E',
    accentSoft: '#E6D1D6',
    emoji: '🌙',
    glyph: '☾',
    keywords: ['温柔', '观察', '迟答'],
    deepDiveInvite: '如果你想再被温柔地看一次——\nSoulTI 的灵魂镜像已经在等你。',
  },
  {
    code: '002',
    slug: 'salt-witch',
    name: '盐之女巫',
    nameEn: 'Salt Witch',
    essence: '毒舌 · 清醒',
    tagline: '你不刻薄，你只是把糖衣一层一层抠掉了。',
    prose:
      '你讲话像海盐——入口咸，回味却是海。别人觉得你毒，其实是你拒绝陪谁演戏。你的温柔只给你看得起的人。',
    vector: { edge: 3, emotion: 1, mystery: 1 },
    rarity: 'B',
    holdRate: 18,
    primaryDeepDive: 'wtf',
    secondaryDeepDive: 'soulti',
    accent: '#5B6E6A',
    accentSoft: '#C9D4CF',
    emoji: '🧂',
    glyph: '✦',
    keywords: ['毒舌', '清醒', '边界感'],
    deepDiveInvite: '你还没被骂醒过？——\nWTF 毒舌版准备好咸度升级。',
  },
  {
    code: '003',
    slug: 'midnight-storyteller',
    name: '深夜说书人',
    nameEn: 'Midnight Storyteller',
    essence: '文学 · 内省',
    tagline: '你在睡前把白天重讲一遍，才能真的放下它。',
    prose:
      '你的世界有两层：白天那层给别人，深夜那层才写给自己。你不是情绪化，你只是比大多数人多做了一道工序——复盘。',
    vector: { edge: 1, emotion: 3, mystery: 2 },
    rarity: 'A',
    holdRate: 10,
    primaryDeepDive: 'soulti',
    secondaryDeepDive: 'mysti',
    accent: '#6A4DBB',
    accentSoft: '#D4CAEA',
    emoji: '🕯️',
    glyph: '⟡',
    keywords: ['文学', '内省', '夜型'],
    deepDiveInvite: '你的深夜值得一封长信——\nSoulTI 灵魂镜像写给你。',
  },
  {
    code: '004',
    slug: 'volcano-girl',
    name: '火山少女',
    nameEn: 'Volcano Girl',
    essence: '激烈 · 外放',
    tagline: '你不是情绪化，你是情绪丰沛，这是两回事。',
    prose:
      '你活得浓，爱得烈，吵架也真。别人以为你在发火，其实你在保护。火山没错，错的是只让人种花的时代。',
    vector: { edge: 3, emotion: 2, mystery: 0 },
    rarity: 'B',
    holdRate: 14,
    primaryDeepDive: 'wtf',
    secondaryDeepDive: 'soulti',
    accent: '#C07A8E',
    accentSoft: '#F2D9DF',
    emoji: '🌋',
    glyph: '✧',
    keywords: ['热烈', '真诚', '不收'],
    deepDiveInvite: '敢不敢把话说到头？——\nWTF 毒舌版把你的火接住。',
  },
  {
    code: '005',
    slug: 'tarot-translator',
    name: '塔罗翻译官',
    nameEn: 'Tarot Translator',
    essence: '神秘 · 直觉',
    tagline: '你不迷信塔罗，是你天生在读符号。',
    prose:
      '你看人先看气场，看事先看征兆。别人叫它玄学，你知道那只是一种更古老的数据——用图像、颜色、沉默记录的那种。',
    vector: { edge: 1, emotion: 1, mystery: 3 },
    rarity: 'A',
    holdRate: 11,
    primaryDeepDive: 'mysti',
    secondaryDeepDive: 'soulti',
    accent: '#7A8A82',
    accentSoft: '#D6DED8',
    emoji: '🔮',
    glyph: '☉',
    keywords: ['直觉', '神秘', '读图'],
    deepDiveInvite: '把你的牌翻开看看——\nMysti 灵鉴的塔罗为你备好了。',
  },
  {
    code: '006',
    slug: 'stubborn-softie',
    name: '嘴硬信徒',
    nameEn: 'Stubborn Softie',
    essence: '嘴硬 · 心软',
    tagline: '你说的"不在乎"，每个字都在乎。',
    prose:
      '你第一句总是挡回去的那句，第二句才是真话。你不擅长示弱，是因为从没人教过你示弱是安全的。现在可以重新学。',
    vector: { edge: 2, emotion: 3, mystery: 0 },
    rarity: 'C',
    holdRate: 22,
    primaryDeepDive: 'wtf',
    secondaryDeepDive: 'soulti',
    accent: '#B8905A',
    accentSoft: '#EADFC9',
    emoji: '🔒',
    glyph: '∎',
    keywords: ['嘴硬', '心软', '不习惯示弱'],
    deepDiveInvite: '不如让毒舌替你把真话说完——\nWTF 毒舌版在此候命。',
  },
  {
    code: '007',
    slug: 'mist-traveler',
    name: '晨雾旅人',
    nameEn: 'Mist Traveler',
    essence: '迷茫 · 温柔',
    tagline: '你不是没方向，是你拒绝把方向交给错的人。',
    prose:
      '你走得慢，不是懒，是你一直在找一条只为你铺的路。你知道有方向不够，方向还要是自己的。这比任何人都清醒。',
    vector: { edge: 0, emotion: 2, mystery: 2 },
    rarity: 'B',
    holdRate: 16,
    primaryDeepDive: 'soulti',
    secondaryDeepDive: 'mysti',
    accent: '#9A908A',
    accentSoft: '#E3DCD1',
    emoji: '🌫️',
    glyph: '⟁',
    keywords: ['慢', '主体性', '找路中'],
    deepDiveInvite: '雾里也可以被看见——\nSoulTI 为你写一封长信。',
  },
  {
    code: '008',
    slug: 'sigil-collector',
    name: '符咒收藏家',
    nameEn: 'Sigil Collector',
    essence: '神秘 · 学术',
    tagline: '你把玄学活成了一门独立学科。',
    prose:
      '你信符号，但你也查文献。你身上有一种稀缺的组合——一半是巫，一半是学者。别人用塔罗解闷，你用塔罗做注脚。',
    vector: { edge: 2, emotion: 1, mystery: 3 },
    rarity: 'S',
    holdRate: 4,
    primaryDeepDive: 'mysti',
    secondaryDeepDive: 'wtf',
    accent: '#8C3E3E',
    accentSoft: '#E5C9C9',
    emoji: '🔯',
    glyph: '✺',
    keywords: ['学者', '神秘', '稀有'],
    deepDiveInvite: '你该看一眼完整的牌阵——\nMysti 的深度塔罗等你。',
  },
  {
    code: '009',
    slug: 'wildfire-lecturer',
    name: '野火讲师',
    nameEn: 'Wildfire Lecturer',
    essence: '清醒 · 激进',
    tagline: '你骂人的时候，其实在讲一堂没人敢开的课。',
    prose:
      '你是那种"一句话点破"的人。你不是刻薄，你是把别人不敢说的社会学常识，用嘴砸到桌面上。你值得一个属于你的讲台。',
    vector: { edge: 3, emotion: 2, mystery: 1 },
    rarity: 'S',
    holdRate: 3,
    primaryDeepDive: 'wtf',
    secondaryDeepDive: 'soulti',
    accent: '#1F1A16',
    accentSoft: '#B8905A',
    emoji: '🔥',
    glyph: '☲',
    keywords: ['清醒', '讲台', '稀有'],
    deepDiveInvite: '把你的讲义写长一点——\nWTF 毒舌 + SoulTI 都在等你的观点。',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getArchetypeBySlug(slug: string): FirstLookArchetype | undefined {
  return FIRST_LOOK_ARCHETYPES.find(a => a.slug === slug);
}

export function getArchetypeByCode(code: string): FirstLookArchetype | undefined {
  return FIRST_LOOK_ARCHETYPES.find(a => a.code === code);
}

export const RARITY_LABEL: Record<Rarity, string> = {
  S: '稀有',
  A: '中等',
  B: '常见',
  C: '最常见',
};

export const DEEP_DIVE_META: Record<DeepDiveTarget, {
  label: string;
  tagline: string;
  emoji: string;
  href: string;
  accent: string;
}> = {
  wtf: {
    label: 'WTF · 毒舌版',
    tagline: '敢听真话吗？直接骂醒你。',
    emoji: '🤯',
    href: '/wtfti/test/',
    accent: '#C07A8E',
  },
  soulti: {
    label: 'SoulTI · 灵魂镜像',
    tagline: '安静地看见真正的你。',
    emoji: '🌙',
    href: '/soulti/test/',
    accent: '#6A4DBB',
  },
  mysti: {
    label: 'Mysti · 灵鉴塔罗',
    tagline: '翻开你的那张牌。',
    emoji: '🔮',
    href: '/mysti/',
    accent: '#5B6E6A',
  },
};
