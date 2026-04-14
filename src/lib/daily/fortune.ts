/**
 * Daily Fortune — date + slug seeded fortune generation.
 * 
 * Same user + same day + same status = same fortune.
 * Different day = completely different fortune.
 * Pure functions, no side effects.
 */

// ── Seeded PRNG ──
function mulberry32(seed: number) {
  return () => {
    let a = seed;
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Fortune data pools ──

const LUCKY_COLORS = [
  { name: '珊瑚红', hex: '#FF6B6B' },
  { name: '薄荷绿', hex: '#4ECDC4' },
  { name: '奶茶棕', hex: '#C4A77D' },
  { name: '薰衣紫', hex: '#A78BFA' },
  { name: '天空蓝', hex: '#60A5FA' },
  { name: '蜜桃粉', hex: '#F9A8D4' },
  { name: '柠檬黄', hex: '#FCD34D' },
  { name: '鼠尾草绿', hex: '#86EFAC' },
  { name: '雾霾蓝', hex: '#93C5FD' },
  { name: '焦糖橘', hex: '#FB923C' },
  { name: '烟灰白', hex: '#E5E7EB' },
  { name: '深海墨', hex: '#1E3A5F' },
] as const;

const MOTTOS = [
  '今天适合给自己买点好的',
  '发呆也是一种修行',
  '不必每天都高效，活着就很了不起',
  '你比你以为的更有力量',
  '允许自己慢一点',
  '今天的疲惫，明天的故事',
  '偶尔摆烂是精神充电',
  '你正走在对的路上，只是弯道多了点',
  '降低期待，提高快乐',
  '不想回消息就不回，天塌不下来',
  '你今天的努力，未来的自己会感谢',
  '少内耗，多干饭',
  '别人的评价≠你的价值',
  '想做的事情就去做，别等准备好',
  '今天允许自己做个普通人',
  '先活着，再优雅',
  '你的节奏不需要和任何人同频',
  '不完美也挺好的',
  '今天唯一的任务：好好吃饭',
  '所有的低谷都在酝酿下一个高峰',
  '睡一觉说不定就想通了',
  '你已经够努力了，别太逼自己',
  '什么都不想做也是一种选择',
  '今天只需要照顾好自己',
] as const;

const KEYWORDS = [
  '放松', '冲刺', '独处', '社交', '创造', '反思',
  '偷懒', '冒险', '治愈', '清理', '表达', '等待',
  '享受', '合作', '蜕变', '简化', '感恩', '试错',
] as const;

const ADVICE_TEMPLATES = [
  '今天适合{action}，不适合{avoid}',
  '保持{mood}，远离{toxic}',
  '今天你的超能力是{power}',
  '今天最适合做的事：{todo}',
] as const;

const ACTIONS = ['发呆', '散步', '跟猫待着', '一个人吃火锅', '早睡', '看日落', '整理房间', '给朋友发消息', '买一束花给自己', '刷老照片'];
const AVOIDS = ['查工作消息', '跟人争论', '深夜emo', '过度计划', '看前任朋友圈', '纠结选择', '自我批评'];
const MOODS = ['好奇心', '钝感力', '不在乎', '优雅的摆烂', '沉默的力量', '温柔的固执'];
const TOXICS = ['过度期待', '无效社交', '反复纠结', 'emo循环', '别人的节奏', '完美主义'];
const POWERS = ['让时间变慢', '屏蔽噪音', '无意识说出金句', '精准避雷', '磁场吸引好运', '心想事成'];
const TODOS = ['写三句话总结今天', '删掉一个不用的APP', '学一个新词', '给过去的自己写封信', '拍一张天空的照片', '跟陌生人微笑'];

export interface DailyFortune {
  luckyColor: { name: string; hex: string };
  luckyNumber: number;
  keyword: string;
  motto: string;
  advice: string;
  compatibleStatus: string; // another status slug
}

export function generateDailyFortune(dateStr: string, statusSlug: string, allSlugs: string[]): DailyFortune {
  // Create a unique seed from date + slug
  const seedBase = dateStr.replace(/\D/g, '');
  let hash = 0;
  for (const ch of statusSlug) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  const seed = parseInt(seedBase, 10) + Math.abs(hash);
  const rand = mulberry32(seed);

  const luckyColor = pick(LUCKY_COLORS, rand);
  const luckyNumber = Math.floor(rand() * 99) + 1;
  const keyword = pick(KEYWORDS, rand);
  const motto = pick(MOTTOS, rand);

  // Compatible status — pick someone different
  const otherSlugs = allSlugs.filter(s => s !== statusSlug);
  const compatibleStatus = pick(otherSlugs, rand);

  // Build advice from templates
  const template = pick(ADVICE_TEMPLATES, rand);
  const advice = template
    .replace('{action}', pick(ACTIONS, rand))
    .replace('{avoid}', pick(AVOIDS, rand))
    .replace('{mood}', pick(MOODS, rand))
    .replace('{toxic}', pick(TOXICS, rand))
    .replace('{power}', pick(POWERS, rand))
    .replace('{todo}', pick(TODOS, rand));

  return { luckyColor, luckyNumber, keyword, motto, advice, compatibleStatus };
}

// ── Daily result caching ──

const DAILY_CACHE_KEY = 'daily-result';

interface DailyCacheEntry {
  date: string;  // YYYY-MM-DD
  slug: string;
}

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function cacheDailyResult(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: DailyCacheEntry = { date: getTodayStr(), slug };
    localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify(entry));
  } catch { /* ok */ }
}

/** Returns today's cached result slug, or null if not tested today */
export function loadTodayResult(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DAILY_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as DailyCacheEntry;
    if (entry.date !== getTodayStr()) return null;
    return entry.slug;
  } catch {
    return null;
  }
}

/** Milliseconds until midnight (next day) */
export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
