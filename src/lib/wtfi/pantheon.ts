/**
 * WTFTI · Pantheon Layer
 *
 * 词汇升维：把 home/moons/shadow 的工程师味词汇映射为
 * 主神化身 / 随侍三神 / 暗面化身（异能者）。
 *
 * 此层不动 schema/slug/数学，只提供 UI 渲染的「神性面纱」。
 *
 * 战略文档：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §1-4
 */

import type { HomePlanetSlug } from './constellation-anchors';
import type { ShadowBucket } from './s-axis';

// ───────────────────────── Types ─────────────────────────

export interface DeityIncarnation {
  /** 西方神祇（已逝古典神话，非活态宗教） */
  western: { name: string; latin: string; epithet: string };
  /** 东方神祇 */
  eastern: { name: string; pinyin: string; epithet: string };
  /** 异能者副形 — 奇幻文学母本 */
  occult: { name: string; archetype: string; oneLiner: string };
  /** 主神 sigil 单字符（在 Sigil 中心位） */
  sigilGlyph: string;
  /** 主神域职权一句话 */
  domain: string;
  /** 性格内核四字 */
  coreFour: string;
}

export interface CompanionDeity {
  /** 复用现有 moon slug — 数据底层不动 */
  moonSlug: string;
  /** 神侍名 · 中英 */
  name: string;
  latinName: string;
  /** 母本：希腊 + 中国双锚 */
  mythicSource: string;
  /** 何种用户会召唤她 */
  callerProfile: string;
  /** 她对你做的事 */
  whatSheDoes: string;
  /** SVG 图标字符（手势/法器单 unicode） */
  iconGlyph: string;
}

export interface ShadowAvatar {
  /** 复用现有 shadow bucket — 数据底层不动 */
  bucket: ShadowBucket;
  /** 异能者名 · 中英 */
  name: string;
  latinName: string;
  /** 奇幻母本 */
  archetype: string;
  /** 暗面能量描述 */
  power: string;
  /** Le Guin 式一句话设定（不超过 25 字） */
  oneLiner: string;
  /** SVG 图标字符 */
  iconGlyph: string;
}

// ───────────────────────── 8 主神化身 ─────────────────────────

export const DEITY_INCARNATIONS: Record<HomePlanetSlug, DeityIncarnation> = {
  'home-storm-harbor': {
    western: { name: 'Persephone', latin: 'Persephone Tutela', epithet: '冥后 · 春之回归者' },
    eastern: { name: '湘夫人', pinyin: 'Xiang Furen', epithet: '楚辞水神 · 等不归人' },
    occult: {
      name: '塞壬 · 海妖',
      archetype: 'Siren',
      oneLiner: '我唱的不是歌，是你听不见的那部分自己。',
    },
    sigilGlyph: '⚜',
    domain: '渡口与归途、风暴里的安静',
    coreFour: '内有海 外是港',
  },
  'home-aurora-parlour': {
    western: { name: 'Aphrodite', latin: 'Aphrodite Tutela', epithet: '爱与美的女神' },
    eastern: { name: '嫦娥', pinyin: 'Chang E', epithet: '广寒宫主 · 美的中心' },
    occult: {
      name: '高位狐妖',
      archetype: 'Vulpine Noble',
      oneLiner: '我让每个进门的人都记得自己曾被款待。',
    },
    sigilGlyph: '✿',
    domain: '美的房间、被注视的中心',
    coreFour: '自负而温柔',
  },
  'home-gilded-loom': {
    western: { name: 'Athena', latin: 'Athena Tutela', epithet: '智慧与织造之神' },
    eastern: { name: '女娲', pinyin: 'Nü Wa', epithet: '炼五色石以补苍天' },
    occult: {
      name: '女巫长老',
      archetype: 'Sorceress Elder',
      oneLiner: '我用最旧的针，缝最新的世界。',
    },
    sigilGlyph: '✦',
    domain: '用手修补世界、把碎片缝成神器',
    coreFour: '长情手艺',
  },
  'home-silent-lighthouse': {
    western: { name: 'Hestia', latin: 'Hestia Tutela', epithet: '炉火与家宅守护' },
    eastern: { name: '常羲', pinyin: 'Chang Xi', epithet: '生十二月 · 时间之母' },
    occult: {
      name: '守序德鲁伊',
      archetype: 'Lawful Druid',
      oneLiner: '我不动，所以你能找到回家的方向。',
    },
    sigilGlyph: '☉',
    domain: '不动而被环绕、所有航海者的锚',
    coreFour: '在场即是答',
  },
  'home-slow-galaxy': {
    western: { name: 'Selene', latin: 'Selene Tutela', epithet: '月之女神' },
    eastern: { name: '西王母', pinyin: 'Xi Wangmu', epithet: '昆仑慈母 · 慢而广阔' },
    occult: {
      name: '时之精灵',
      archetype: 'Chronos Sprite',
      oneLiner: '别急，宇宙还有 138 亿年陪你。',
    },
    sigilGlyph: '☾',
    domain: '缓慢、广阔、慈母',
    coreFour: '一切都来得及',
  },
  'home-drift-glacier': {
    western: { name: 'Calypso', latin: 'Calypso Tutela', epithet: '远岛仙女 · 不愿停泊者' },
    eastern: { name: '凌波仙子', pinyin: 'Ling Bo Xianzi', epithet: '洛神 · 漂而清' },
    occult: {
      name: '冰族半精灵',
      archetype: 'Frost Half-Elf',
      oneLiner: '我寄愁心与明月，从不替谁停下。',
    },
    sigilGlyph: '❅',
    domain: '远而清、不主动停泊',
    coreFour: '漂着不会沉',
  },
  'home-obsidian-belfry': {
    western: { name: 'Hecate', latin: 'Hecate Tutela', epithet: '夜之女王 · 守门者' },
    eastern: { name: '酆都大帝', pinyin: 'Fengdu Dadi', epithet: '幽冥 · 计时人' },
    occult: {
      name: '高贵吸血鬼',
      archetype: 'Vampyr Comte',
      oneLiner: '我活了三百年，所以我有耐心等你犯错。',
    },
    sigilGlyph: '☽',
    domain: '守门、计时、黑暗里很清醒',
    coreFour: '少话即预言',
  },
  'home-mars-rose-garden': {
    western: { name: 'Venus & Mars', latin: 'Venus-Mars Tutela', epithet: '战神与爱神同位' },
    eastern: { name: '女娇', pinyin: 'Nü Jiao', epithet: '大禹之妻 · 烈而柔' },
    occult: {
      name: '红魔女',
      archetype: 'Red Sorceress',
      oneLiner: '我的爱和怒火本来就是同一个温度。',
    },
    sigilGlyph: '⚭',
    domain: '战神与爱神共一片园',
    coreFour: '又烈又柔',
  },
};

// ───────────────────────── 6 神侍池 ─────────────────────────
// 复用 6 个现有 moon slug，补「神侍」面纱
export const COMPANION_DEITIES: CompanionDeity[] = [
  {
    moonSlug: 'moon-romance-spring',
    name: '茶神 · 山茶圣女',
    latinName: 'Camellia Sage',
    mythicSource: '陆羽 · 茶经 + Hestia 炉火',
    callerProfile: '高 F · 关怀型',
    whatSheDoes: '在你疲惫时为你温一壶刚好的茶。',
    iconGlyph: '🍵',
  },
  {
    moonSlug: 'moon-romance-tide',
    name: '引力孪神 · 双子星',
    latinName: 'Twin Star',
    mythicSource: 'Castor & Pollux + 二郎神',
    callerProfile: '高同温配对者',
    whatSheDoes: '在你和 ta 之间维持引力和距离的精确平衡。',
    iconGlyph: '⚭',
  },
  {
    moonSlug: 'moon-work-laser',
    name: '墨灵 · 文笔之灵',
    latinName: 'Inkmuse',
    mythicSource: '文昌帝君 + Calliope',
    callerProfile: '高 T · 思辨型',
    whatSheDoes: '帮你把混乱的念头排成可执行的句子。',
    iconGlyph: '✒',
  },
  {
    moonSlug: 'moon-work-greenhouse',
    name: '晨之证神 · 黎明见证',
    latinName: 'Eos Witness',
    mythicSource: 'Eos 黎明女神 + 羲和御日',
    callerProfile: '高 W · 温暖型',
    whatSheDoes: '在每一个清早记得你存在，并替你点亮第一盏灯。',
    iconGlyph: '☀',
  },
  {
    moonSlug: 'moon-late-velvet-radio',
    name: '夜信使 · 暗夜邮差',
    latinName: 'Nyx Courier',
    mythicSource: 'Nyx 夜之女神 + 泰山府君',
    callerProfile: '高 I · 内观型',
    whatSheDoes: '把你深夜不敢说出口的话，悄悄寄给应该收到的人。',
    iconGlyph: '✉',
  },
  {
    moonSlug: 'moon-late-still-water',
    name: '典藏神 · 记忆守护',
    latinName: 'Mnemosyne Keep',
    mythicSource: 'Mnemosyne 记忆女神 + 史皇仓颉',
    callerProfile: '高 S · 沉默档案型',
    whatSheDoes: '替你保存所有不愿丢但又不敢翻的记忆碎片。',
    iconGlyph: '☄',
  },
];

const COMPANION_BY_MOON = new Map(COMPANION_DEITIES.map((c) => [c.moonSlug, c]));

export function getCompanionForMoon(moonSlug: string): CompanionDeity | null {
  return COMPANION_BY_MOON.get(moonSlug) ?? null;
}

// ───────────────────────── 5 异能者池（暗面化身） ─────────────────────────

export const SHADOW_AVATARS: ShadowAvatar[] = [
  {
    bucket: 'SHADOW-DRIFT-A',
    name: '塞壬歌姬',
    latinName: 'Siren Diva',
    archetype: '希腊海妖 + 湘君',
    power: '致命的吸引与孤独',
    oneLiner: '我唱的不是歌，是你听不见的那部分自己。',
    iconGlyph: '♪',
  },
  {
    bucket: 'SHADOW-DRIFT-B',
    name: '狐仙隐者',
    latinName: 'Vulpine Hermit',
    archetype: '玉藻前 + 苏妲己',
    power: '千年修炼的洞察与顽皮',
    oneLiner: '你以为是我在试探你？是你在试探你自己。',
    iconGlyph: '✺',
  },
  {
    bucket: 'SHADOW-NEUTRAL',
    name: '女巫学徒',
    latinName: 'Sorceress Apprentice',
    archetype: 'Macbeth 三女巫 + 蒲松龄笔下精怪',
    power: '未授勋的力量与好奇',
    oneLiner: '我还没决定要救你，还是把你变成一棵树。',
    iconGlyph: '✦',
  },
  {
    bucket: 'SHADOW-ANCHOR-B',
    name: '狼人长老',
    latinName: 'Lupus Senior',
    archetype: '北欧狼神 + 山海经狍鸮',
    power: '月圆时的失控与忠诚',
    oneLiner: '我不咬陌生人，只咬选择我的人。',
    iconGlyph: '☾',
  },
  {
    bucket: 'SHADOW-ANCHOR-A',
    name: '吸血鬼伯爵',
    latinName: 'Vampyr Comte',
    archetype: '中世纪欧洲贵族 + 聊斋夜行',
    power: '永夜中的优雅与饥渴',
    oneLiner: '我活了三百年，所以我有耐心等你犯错。',
    iconGlyph: '☽',
  },
];

const AVATAR_BY_BUCKET = new Map(SHADOW_AVATARS.map((a) => [a.bucket, a]));

export function getShadowAvatar(bucket: ShadowBucket): ShadowAvatar | null {
  return AVATAR_BY_BUCKET.get(bucket) ?? null;
}

// ───────────────────────── Convenience ─────────────────────────

export function getDeity(slug: string): DeityIncarnation | null {
  return DEITY_INCARNATIONS[slug as HomePlanetSlug] ?? null;
}

/** 一行总结某主神的「神性身份」用于 OG / share copy */
export function deityShareLine(slug: string): string {
  const d = getDeity(slug);
  if (!d) return '';
  return `${d.eastern.name} · ${d.western.name} · ${d.occult.name}`;
}
