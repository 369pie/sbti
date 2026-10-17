/**
 * Deterministic personalized Today Card (P1 · refocus §6.3).
 * Seed: userId + Shanghai date + birthYear (+ optional color season).
 * No LLM — same inputs ⇒ same card all day.
 *
 * Copy banks reuse / adapt lib/daily/fortune + mysti/daily-card tone,
 * rewritten for 闺蜜语气 (no 宇宙 / 神域).
 */

export interface TodayCardInput {
  userId: string;
  dateISO: string; // Asia/Shanghai YYYY-MM-DD
  birthYear?: number | null;
  /** e.g. 冷夏 — when her_profiles.has_color_season is true and known */
  colorSeason?: string | null;
  hasPersona?: boolean;
  hasPalm?: boolean;
}

export interface TodayCard {
  dateISO: string;
  fortune: string;
  luckyColor: { name: string; hex: string; tip: string };
  makeup: string;
  /** Soft index into the bank (debug / analytics). */
  seedKey: string;
}

// ── PRNG (same mulberry32 as lib/daily/fortune) ──

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(parts: string[]): number {
  let h = 0x811c9dc5;
  const joined = parts.join('|');
  for (let i = 0; i < joined.length; i++) {
    h ^= joined.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length) % arr.length];
}

// ── Copy banks ──

const FORTUNES = [
  '今天适合把话说清楚，别替别人想太多。',
  '今天宜慢一点，发呆也算完成任务。',
  '今天适合给自己一点小确幸，不必等理由。',
  '今天心会比脑子更准，先听心跳再决定。',
  '今天适合整理一点点——房间、相册、或者心里那点乱。',
  '今天别硬撑，累了就歇，歇完再走。',
  '今天适合说一句真心话，哪怕只对一个人。',
  '今天适合把拖延的小事做完，不用完美。',
  '今天宜独处充电，社交可以推到明天。',
  '今天适合跟在乎的人说「我想你了」。',
  '今天别内耗：别人的评价≠你的价值。',
  '今天适合试试新东西，迈一小步就够。',
  '今天宜温柔对待自己，像对待最好的朋友。',
  '今天适合把一件事说「不」，给自己留空。',
  '今天适合写三句今天的感受，不必发朋友圈。',
  '今天宜早睡一点，明天的你会谢你。',
  '今天适合把话说软一点，但立场可以硬。',
  '今天别急着给答案，先把问题问清楚。',
  '今天适合穿得舒服一点，好看其次。',
  '今天宜收一收期待，快乐会更容易进来。',
  '今天适合完成一件你一直逃避的小事。',
  '今天别比较，你的节奏不需要和任何人同频。',
] as const;

const LUCKY_COLORS = [
  { name: '雾霾蓝', hex: '#8FA3BF', tip: '冷调显白，避开亮橘' },
  { name: '豆沙玫', hex: '#B07A7A', tip: '低饱和，衬气色' },
  { name: '奶茶棕', hex: '#C4A77D', tip: '暖而不腻，日常好搭' },
  { name: '鼠尾草绿', hex: '#A9C5A0', tip: '柔和治愈，像日记胶带' },
  { name: '奶油杏', hex: '#E8D5B7', tip: '提亮面部，少用纯白' },
  { name: '薰衣灰紫', hex: '#A89BB8', tip: '冷夏友好，别配荧光' },
  { name: '焦糖橘', hex: '#D4916A', tip: '一点暖意就够，点缀用' },
  { name: '烟灰粉', hex: '#D4B5B0', tip: '温柔感，适合低调约会' },
  { name: '墨绿', hex: '#3D5C4A', tip: '沉稳有质感，配米白' },
  { name: '香槟金', hex: '#D9B77E', tip: '点缀饰品或内搭即可' },
  { name: '天空蓝', hex: '#7BA3C9', tip: '清爽，适合心情闷的日子' },
  { name: '玫瑰雾', hex: '#C9A9C6', tip: '温柔存在感，不怕撞衫' },
] as const;

const MAKEUP_TIPS = [
  '今天试试低饱和豆沙唇，腮红扫在颧骨偏外。',
  '今天少一点眼线，让皮肤自己说话。',
  '今天用奶油肌底妆，别追求全遮瑕。',
  '今天唇色选雾面裸粉，比亮色更耐看。',
  '今天眉毛画淡一点，柔软比锋利更友好。',
  '今天试试单色眼影：暖棕扫满眼窝就够。',
  '今天高光留给鼻尖和唇峰，别大面积扫。',
  '今天用腮红当口红：拍一点在唇上很自然。',
  '今天眼下少涂粉，浮粉会显疲惫。',
  '今天发尾喷一点香水，比手腕更持久。',
  '今天发型选低马尾或随意半扎，省时间也干净。',
  '今天美甲如果要补，选裸粉或奶茶就好。',
] as const;

const SEASON_COLOR_HINT: Record<string, { name: string; hex: string; tip: string }> = {
  冷夏: { name: '雾霾蓝', hex: '#8FA3BF', tip: '你是冷夏型，穿它显白，避开亮橘' },
  暖春: { name: '蜜桃杏', hex: '#E8B48A', tip: '你是暖春型，柔暖色最衬你' },
  冷冬: { name: '酒红色', hex: '#8B3A4A', tip: '你是冷冬型，高对比更有精神' },
  暖秋: { name: '焦糖棕', hex: '#A67C52', tip: '你是暖秋型，大地色很稳' },
};

/**
 * Build today's card. Pure — safe in RSC or API.
 */
export function generateTodayCard(input: TodayCardInput): TodayCard {
  const birth = input.birthYear ?? 0;
  const seedKey = `${input.userId}|${input.dateISO}|${birth}`;
  const rand = mulberry32(hashSeed([seedKey, input.colorSeason ?? '', String(!!input.hasPersona)]));

  const fortune = pick(FORTUNES, rand);
  const makeup = pick(MAKEUP_TIPS, rand);

  const seasonKey = input.colorSeason?.trim() ?? '';
  const seasonHit = seasonKey && SEASON_COLOR_HINT[seasonKey];
  // When season known, bias toward it ~50% of days (still deterministic).
  const luckyColor =
    seasonHit && rand() < 0.55
      ? seasonHit
      : (() => {
          const c = pick(LUCKY_COLORS, rand);
          return { name: c.name, hex: c.hex, tip: c.tip };
        })();

  return {
    dateISO: input.dateISO,
    fortune,
    luckyColor,
    makeup,
    seedKey,
  };
}

export interface ArchiveGap {
  key: 'persona' | 'color_season' | 'palm' | 'face' | 'birth_year';
  label: string;
  href: string;
}

export function computeArchiveGaps(profile: {
  birth_year?: number | null;
  has_persona?: boolean | null;
  has_color_season?: boolean | null;
  has_palm?: boolean | null;
  has_face?: boolean | null;
  completeness_pct?: number | null;
}): { pct: number; gaps: ArchiveGap[] } {
  const gaps: ArchiveGap[] = [];
  if (!profile.has_persona) gaps.push({ key: 'persona', label: '人格类型', href: '/start/' });
  if (!profile.has_color_season) gaps.push({ key: 'color_season', label: '色彩季型', href: '/mirror/color/' });
  if (!profile.has_palm) gaps.push({ key: 'palm', label: '掌纹', href: '/mirror/palm/' });
  if (!profile.has_face) gaps.push({ key: 'face', label: '脸型妆容', href: '/mirror/face/' });
  if (!profile.birth_year) gaps.push({ key: 'birth_year', label: '出生年份', href: '/auth/register/' });

  const stored = profile.completeness_pct;
  const pct =
    typeof stored === 'number' && stored >= 0
      ? stored
      : Math.min(100, Math.round(((5 - gaps.length) / 5) * 100));

  return { pct, gaps };
}
