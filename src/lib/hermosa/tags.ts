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

export const HERMOSA_KINDS = [
  'voice',
  'book',
  'ai_question',
  'concept',
  'feedback',
] as const;

export type HermosaKind = (typeof HERMOSA_KINDS)[number];

export const HERMOSA_WRITE_KINDS = ['voice', 'book', 'ai_question'] as const satisfies readonly HermosaKind[];

export const HERMOSA_KIND_LABELS: Record<HermosaKind, string> = {
  voice: '一句话',
  book: '她的书',
  ai_question: 'AI 问题',
  concept: '概念困惑',
  feedback: '产品建议',
};

export const HERMOSA_KIND_HINTS: Record<HermosaKind, string> = {
  voice: '写下一句女性视角的态度、宣言或提醒。',
  book: '推荐一本正在读、想共读、或让你重新认识自己的书。',
  ai_question: '记录一个你想用 AI 学会、解决、验证的问题。',
  concept: '把女性主义、AI、价值创造里尚未想通的概念说出来。',
  feedback: '告诉我们 Her Voice 或 WTFTI 哪里需要更好。',
};

export function isHermosaKind(value: unknown): value is HermosaKind {
  return typeof value === 'string' && (HERMOSA_KINDS as readonly string[]).includes(value);
}

export const HERMOSA_CURATION_STATUSES = [
  'new',
  'shortlisted',
  'selected',
  'published',
  'rejected',
] as const;

export type HermosaCurationStatus = (typeof HERMOSA_CURATION_STATUSES)[number];

export const HERMOSA_CURATION_STATUS_LABELS: Record<HermosaCurationStatus, string> = {
  new: '新提交',
  shortlisted: '候选',
  selected: '已选入',
  published: '已发布',
  rejected: '不采用',
};

export function isHermosaCurationStatus(value: unknown): value is HermosaCurationStatus {
  return typeof value === 'string' && (HERMOSA_CURATION_STATUSES as readonly string[]).includes(value);
}

export const HERMOSA_SAFETY_LEVELS = ['safe', 'review', 'blocked'] as const;

export type HermosaSafetyLevel = (typeof HERMOSA_SAFETY_LEVELS)[number];

export const HERMOSA_SAFETY_LEVEL_LABELS: Record<HermosaSafetyLevel, string> = {
  safe: '安全',
  review: '待复核',
  blocked: '阻止公开',
};

export function isHermosaSafetyLevel(value: unknown): value is HermosaSafetyLevel {
  return typeof value === 'string' && (HERMOSA_SAFETY_LEVELS as readonly string[]).includes(value);
}

export const HERMOSA_ATTRIBUTION_MODES = ['anonymous', 'signature', 'profile'] as const;

export type HermosaAttributionMode = (typeof HERMOSA_ATTRIBUTION_MODES)[number];

export const HERMOSA_ATTRIBUTION_LABELS: Record<HermosaAttributionMode, string> = {
  anonymous: '匿名',
  signature: '昵称署名',
  profile: '个人主页',
};

export function isHermosaAttributionMode(value: unknown): value is HermosaAttributionMode {
  return typeof value === 'string' && (HERMOSA_ATTRIBUTION_MODES as readonly string[]).includes(value);
}

export type HermosaContributionMetadata = Partial<Record<
  | 'prompt'
  | 'book_title'
  | 'book_author'
  | 'book_quote'
  | 'book_note'
  | 'ai_question'
  | 'ai_context'
  | 'ai_tool'
  | 'concept'
  | 'confusion'
  | 'feedback_target'
  | 'feedback_detail',
  string
>>;

function metadataSource(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  return input as Record<string, unknown>;
}

function clampMetadataValue(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function assignMetadataValue(
  output: HermosaContributionMetadata,
  source: Record<string, unknown>,
  key: keyof HermosaContributionMetadata,
  max: number,
) {
  const value = clampMetadataValue(source[key], max);
  if (value) output[key] = value;
}

export function sanitizeContributionMetadata(
  kind: HermosaKind,
  input: unknown,
): HermosaContributionMetadata {
  const source = metadataSource(input);
  const output: HermosaContributionMetadata = {};
  assignMetadataValue(output, source, 'prompt', 120);

  if (kind === 'voice') {
    assignMetadataValue(output, source, 'prompt', 120);
  } else if (kind === 'book') {
    assignMetadataValue(output, source, 'book_title', 80);
    assignMetadataValue(output, source, 'book_author', 60);
    assignMetadataValue(output, source, 'book_quote', 160);
    assignMetadataValue(output, source, 'book_note', 180);
  } else if (kind === 'ai_question') {
    assignMetadataValue(output, source, 'ai_question', 180);
    assignMetadataValue(output, source, 'ai_context', 120);
    assignMetadataValue(output, source, 'ai_tool', 40);
  } else if (kind === 'concept') {
    assignMetadataValue(output, source, 'concept', 80);
    assignMetadataValue(output, source, 'confusion', 180);
  } else if (kind === 'feedback') {
    assignMetadataValue(output, source, 'feedback_target', 80);
    assignMetadataValue(output, source, 'feedback_detail', 180);
  }

  return output;
}

export function isHermosaTopicWeek(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-W\d{2}$/.test(value);
}

export function getHermosaTopicWeek(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
