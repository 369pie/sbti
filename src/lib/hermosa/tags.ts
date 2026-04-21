/**
 * HERMOSA · 共建标签
 *
 * 6 个结构化标签，让"留言"同时变成产品改进信号。
 * 顺序即 UI 默认展示顺序。
 */

export const HERMOSA_TAGS = [
  'want',     // 想要新宇宙 / 新功能（聚合后变产品 backlog）
  'feedback', // 体验吐槽（聚合后变体验优化 ticket）
  'voice',    // 价值观点（女性视角的态度，可入精选墙）
  'declare',  // 同型号宣言（说给同人格姐妹的话）
  'feature',  // 想要新内容（新人格 / 新塔罗 / 新文案）
  'thanks',   // 感谢 / 共鸣（情感性，不需要 ticket）
  'rant',     // 吐槽宣泄（安全的情绪出口）
  'story',    // 她的故事（个人经历分享）
  'solidarity', // 共鸣声援（"我也是"、"你不是一个人"）
] as const;

export type HermosaTag = (typeof HERMOSA_TAGS)[number];

export const HERMOSA_TAG_LABELS: Record<HermosaTag, string> = {
  want: '想要',
  feedback: '体验吐槽',
  voice: '价值观点',
  declare: '同型号宣言',
  feature: '想要新内容',
  thanks: '感谢',
  rant: '吐槽宣泄',
  story: '她的故事',
  solidarity: '共鸣声援',
};

export const HERMOSA_TAG_HINTS: Record<HermosaTag, string> = {
  want: '希望 WTFTI 增加什么',
  feedback: '哪里让你卡住、不顺畅',
  voice: '女性视角的一句话观点',
  declare: '说给同型号姐妹的话',
  feature: '希望出现的塔罗 / 人格 / 文案',
  thanks: '想说的一声谢谢',
  rant: '安全的情绪出口，尽情说',
  story: '分享你的故事和经历',
  solidarity: '告诉她：你不是一个人',
};

export function isHermosaTag(value: unknown): value is HermosaTag {
  return typeof value === 'string' && (HERMOSA_TAGS as readonly string[]).includes(value);
}

export function sanitizeTags(input: unknown): HermosaTag[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<HermosaTag>();
  for (const v of input) {
    if (isHermosaTag(v)) seen.add(v);
    if (seen.size >= 3) break; // cap 3
  }
  return Array.from(seen);
}

export const HERMOSA_UNIVERSES = [
  'wtfti',
  'soulti',
  'cpti',
  'xpti',
  'hogti',
  'fanrenti',
  'mysti',
  'wtfcard',
  'meta', // 不绑定任何宇宙的纯品牌留言
] as const;

export type HermosaUniverse = (typeof HERMOSA_UNIVERSES)[number];

export function isHermosaUniverse(value: unknown): value is HermosaUniverse {
  return typeof value === 'string' && (HERMOSA_UNIVERSES as readonly string[]).includes(value);
}

export const HERMOSA_UNIVERSE_LABELS: Record<HermosaUniverse, string> = {
  wtfti: 'WTFTI',
  soulti: 'SoulTI',
  cpti: 'CPTI',
  xpti: 'XPTI',
  hogti: 'HOGTI',
  fanrenti: '凡人修仙TI',
  mysti: 'MystiTI',
  wtfcard: '人格卡集',
  meta: '关于 WTFTI',
};

export const HERMOSA_STATUS_LABELS: Record<string, string> = {
  heard: '已收到 · Heard',
  planned: '排期中 · Planned',
  shipped: '已上线 · Shipped',
};
