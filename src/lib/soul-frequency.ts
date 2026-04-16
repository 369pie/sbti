/**
 * 每周灵魂频率 (Weekly Soul Frequency)
 *
 * Generates deterministic weekly personality-based content:
 * - 本周关键词 (weekly keywords)
 * - 幸运色 (lucky color)
 * - 灵魂状态 (soul state description)
 * - 能量指数 (energy index)
 *
 * Updates every Monday. Based on user's personality type + week seed.
 */

import { loadCard } from './wtf-card';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SoulFrequency {
  weekLabel: string;          // "2026-W16"
  weekStart: string;          // "2026-04-13"
  keywords: string[];         // 3 keywords
  luckyColor: LuckyColor;
  soulState: string;          // descriptive sentence
  energyIndex: number;        // 0-100
  vibe: string;               // short vibe label
  advice: string;             // one-line advice
}

export interface LuckyColor {
  name: string;
  hex: string;
}

// ─── Data pools ──────────────────────────────────────────────────────────────

const KEYWORD_POOL = [
  '突破', '沉淀', '连接', '释放', '创造', '冒险', '疗愈', '专注',
  '回归', '蜕变', '觉醒', '守护', '漫游', '共振', '绽放', '重启',
  '扎根', '飞跃', '臣服', '点燃', '凝聚', '出走', '修复', '爆发',
  '归零', '蓄力', '拥抱', '反转', '沉浸', '跃迁', '放手', '寻找',
  '直觉', '锚定', '流动', '碰撞', '升华', '解锁', '融合', '坚持',
];

const LUCKY_COLORS: LuckyColor[] = [
  { name: '珊瑚橘', hex: '#FF6F61' },
  { name: '薄荷绿', hex: '#98FB98' },
  { name: '星空紫', hex: '#7B68EE' },
  { name: '云雾蓝', hex: '#87CEEB' },
  { name: '琥珀金', hex: '#FFBF00' },
  { name: '樱花粉', hex: '#FFB7C5' },
  { name: '深海青', hex: '#008B8B' },
  { name: '落日红', hex: '#FF4500' },
  { name: '月光银', hex: '#C0C0C0' },
  { name: '松石蓝', hex: '#40E0D0' },
  { name: '焦糖棕', hex: '#D2691E' },
  { name: '极光绿', hex: '#00FF7F' },
  { name: '烟霞紫', hex: '#DDA0DD' },
  { name: '冰川白', hex: '#F0F8FF' },
  { name: '玫瑰金', hex: '#B76E79' },
  { name: '森林绿', hex: '#228B22' },
];

const VIBE_POOL = [
  '隐世修行', '满血出击', '温柔蓄力', '野蛮生长', '静默观察',
  '自在漫游', '全力冲刺', '内核重组', '慢热回温', '灵感井喷',
  '低调潜行', '高能输出', '躺平充电', '破茧蜕变', '随缘漂流',
  '硬核觉醒', '柔软着陆', '暗涌汹涌', '恣意绽放', '稳步前行',
];

// Soul state templates — {slug} will be replaced by personality-specific words
const SOUL_STATE_TEMPLATES = [
  '本周的你像一颗{adj}的星，在{scene}中{verb}',
  '灵魂频率进入{adj}模式，{scene}里的你正在{verb}',
  '你的能量场呈现{adj}的波动，适合在{scene}中{verb}',
  '这周的灵魂底色是{adj}，你会在{scene}里{verb}',
  '内心的频率调至{adj}，{scene}中的你将{verb}',
];

const SOUL_ADJECTIVES = [
  '沉静', '炽热', '轻盈', '坚韧', '柔软', '锋利', '温暖', '冷冽',
  '明亮', '深邃', '跳跃', '安稳', '狂野', '清澈', '朦胧', '灿烂',
];

const SOUL_SCENES = [
  '人群', '独处时光', '深夜', '清晨', '创作', '对话', '沉默',
  '旅途', '日常', '意外', '等待', '选择的路口', '熟悉的角落', '陌生的领域',
];

const SOUL_VERBS = [
  '悄悄发光', '积蓄力量', '找到答案', '释放自己', '遇见惊喜',
  '重新出发', '慢慢靠近真相', '学会放手', '感受到安宁', '迎来转折',
  '收获共鸣', '发现新可能', '渐入佳境', '打破常规', '回到初心',
];

const ADVICE_POOL = [
  '试着对一个陌生人微笑',
  '给自己买一杯不常喝的饮料',
  '把手机放下 10 分钟，听听周围的声音',
  '写下三件让你感恩的小事',
  '这周可以对自己温柔一点',
  '允许自己慢下来',
  '找个人说说最近的心事',
  '做一件拖了很久的小事',
  '深呼吸，然后继续',
  '这周适合打破一个小习惯',
  '给很久没联系的朋友发条消息',
  '记住：不完美也是一种完整',
  '留点时间给无用的美好',
  '今天的烦恼交给明天的自己',
  '试试用左手做一件平时用右手做的事',
  '这周的幸运藏在某个意想不到的地方',
];

// ─── Hash function ───────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ─── Week calculation ────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getISOWeekLabel(date: Date): string {
  const weekStart = getWeekStart(date);
  const year = weekStart.getFullYear();
  const janFirst = new Date(year, 0, 1);
  const days = Math.floor((weekStart.getTime() - janFirst.getTime()) / 86400000);
  const weekNum = Math.ceil((days + janFirst.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ─── Main generation ─────────────────────────────────────────────────────────

function pickFromPool<T>(pool: T[], seed: string, salt: string): T {
  const h = hashString(`${seed}:${salt}`);
  return pool[h % pool.length];
}

function pickMultiple<T>(pool: T[], seed: string, salt: string, count: number): T[] {
  const results: T[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    const h = hashString(`${seed}:${salt}:${i}`);
    let idx = h % pool.length;
    while (used.has(idx)) {
      idx = (idx + 1) % pool.length;
    }
    used.add(idx);
    results.push(pool[idx]);
  }
  return results;
}

export function generateSoulFrequency(date?: Date): SoulFrequency {
  const now = date ?? new Date();
  const weekStart = getWeekStart(now);
  const weekLabel = getISOWeekLabel(now);

  // Build seed from week + user's primary personality (wtfti slug)
  const card = loadCard();
  const primarySlug = card?.results?.['wtfti']?.slug ?? 'unknown';
  const seed = `${weekLabel}:${primarySlug}`;

  // Generate content
  const keywords = pickMultiple(KEYWORD_POOL, seed, 'kw', 3);
  const luckyColor = pickFromPool(LUCKY_COLORS, seed, 'color');
  const vibe = pickFromPool(VIBE_POOL, seed, 'vibe');
  const advice = pickFromPool(ADVICE_POOL, seed, 'advice');

  // Soul state
  const template = pickFromPool(SOUL_STATE_TEMPLATES, seed, 'tpl');
  const adj = pickFromPool(SOUL_ADJECTIVES, seed, 'adj');
  const scene = pickFromPool(SOUL_SCENES, seed, 'scene');
  const verb = pickFromPool(SOUL_VERBS, seed, 'verb');
  const soulState = template
    .replace('{adj}', adj)
    .replace('{scene}', scene)
    .replace('{verb}', verb);

  // Energy index (40-95 range, deterministic)
  const energyHash = hashString(`${seed}:energy`);
  const energyIndex = 40 + (energyHash % 56);

  return {
    weekLabel,
    weekStart: formatDate(weekStart),
    keywords,
    luckyColor,
    soulState,
    energyIndex,
    vibe,
    advice,
  };
}

// ─── Time until next Monday ──────────────────────────────────────────────────

export function getTimeUntilNextWeek(): { days: number; hours: number } {
  const now = new Date();
  const nextMonday = getWeekStart(now);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return { days, hours };
}
