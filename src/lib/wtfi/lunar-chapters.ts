/**
 * WTFTI · Lunar Chapters
 *
 * 12 题灵魂日课，按月相位（朔/上蛾眉/上弦/盈凸/望/亏凸/下弦/下蛾眉 × 1.5 朔望月）解锁。
 * 月相计算：从已知朔月（2026-01-19 21:53 UTC，新月）按 29.530589 天周期推算。
 * 不依赖外部 lib，误差 ±2 小时（足够 UI 用）。
 *
 * 战略：plan §B4 杠杆 #3 月相章节
 */

const SYNODIC_MONTH = 29.530588853; // days
// Reference new moon: 2026-01-19 21:53 UTC
const REFERENCE_NEW_MOON_MS = Date.UTC(2026, 0, 19, 21, 53);

export type LunarPhaseKey =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export interface LunarPhase {
  key: LunarPhaseKey;
  /** 0-1 of synodic month */
  fraction: number;
  /** illuminated fraction 0-1 */
  illumination: number;
  cnName: string;
  enName: string;
  /** 1-28 day in cycle */
  ageDay: number;
}

const PHASE_TABLE: Array<{ start: number; end: number; key: LunarPhaseKey; cnName: string; enName: string }> = [
  { start: 0.000, end: 0.0625, key: 'new', cnName: '朔月 · 新生', enName: 'New Moon' },
  { start: 0.0625, end: 0.1875, key: 'waxingCrescent', cnName: '上蛾眉月 · 萌发', enName: 'Waxing Crescent' },
  { start: 0.1875, end: 0.3125, key: 'firstQuarter', cnName: '上弦月 · 行动', enName: 'First Quarter' },
  { start: 0.3125, end: 0.4375, key: 'waxingGibbous', cnName: '盈凸月 · 完善', enName: 'Waxing Gibbous' },
  { start: 0.4375, end: 0.5625, key: 'full', cnName: '望月 · 巅峰', enName: 'Full Moon' },
  { start: 0.5625, end: 0.6875, key: 'waningGibbous', cnName: '亏凸月 · 释放', enName: 'Waning Gibbous' },
  { start: 0.6875, end: 0.8125, key: 'lastQuarter', cnName: '下弦月 · 放下', enName: 'Last Quarter' },
  { start: 0.8125, end: 0.9375, key: 'waningCrescent', cnName: '下蛾眉月 · 修复', enName: 'Waning Crescent' },
  { start: 0.9375, end: 1.0001, key: 'new', cnName: '朔月 · 新生', enName: 'New Moon' },
];

export function getLunarPhase(date: Date = new Date()): LunarPhase {
  const t = date.getTime();
  const elapsed = (t - REFERENCE_NEW_MOON_MS) / 86_400_000; // days
  let frac = (elapsed / SYNODIC_MONTH) % 1;
  if (frac < 0) frac += 1;
  const entry = PHASE_TABLE.find((p) => frac >= p.start && frac < p.end) ?? PHASE_TABLE[0];
  // illumination: roughly cos curve (peak at full=0.5 frac)
  const illum = Math.round((1 - Math.cos(frac * 2 * Math.PI)) / 2 * 100) / 100;
  const ageDay = Math.max(1, Math.round(frac * 28));
  return {
    key: entry.key,
    fraction: frac,
    illumination: illum,
    cnName: entry.cnName,
    enName: entry.enName,
    ageDay,
  };
}

// ───────────────────────── 12 灵魂日课 ─────────────────────────

export interface LunarChapter {
  index: number; // 1-12
  phaseKey: LunarPhaseKey;
  /** 章节标题 */
  title: string;
  /** 主问 */
  prompt: string;
  /** 提示句 */
  hint: string;
  /** 4 选项 — 不算分，只激活下一个 fragment */
  options: [string, string, string, string];
  /** 完成后解锁的小礼物（神龛装饰别名） */
  unlockGift: string;
  /** 微注脚 */
  poeticLine: string;
}

export const LUNAR_CHAPTERS: LunarChapter[] = [
  {
    index: 1,
    phaseKey: 'new',
    title: 'I · 新月 · 一颗未命名的种子',
    prompt: '今晚你愿意悄悄许的那个愿，是关于谁的？',
    hint: '不必说出口，只在心里写下名字。',
    options: ['我自己', '一个我没说出口的人', '所有想留住的瞬间', '一件还没敢做的事'],
    unlockGift: '一支白蜡烛',
    poeticLine: '种子不知春，仍向暗处去。',
  },
  {
    index: 2,
    phaseKey: 'waxingCrescent',
    title: 'II · 上蛾眉月 · 一把刚露脸的小弓',
    prompt: '这周让你最想往前一步的，是哪种感觉？',
    hint: '挑那个最像「悄悄长出来」的字。',
    options: ['好奇', '不甘', '心动', '直觉'],
    unlockGift: '一片月桂叶',
    poeticLine: '弓未满，光却已经有方向。',
  },
  {
    index: 3,
    phaseKey: 'firstQuarter',
    title: 'III · 上弦月 · 把意愿压到一半',
    prompt: '现在你愿意「做出一个小决定」吗？',
    hint: '哪怕是「今天先不回那条消息」也算。',
    options: ['做', '观望', '问朋友再说', '让月亮替我决定'],
    unlockGift: '一颗水晶子',
    poeticLine: '一半的月，已经能照见路。',
  },
  {
    index: 4,
    phaseKey: 'waxingGibbous',
    title: 'IV · 盈凸月 · 接近圆，但还在长',
    prompt: '你最近一次自我赞美是哪句？',
    hint: '不必骄傲，可以小声说。',
    options: ['「我撑过来了」', '「我还在尝试」', '「我没让自己变难看」', '「我替别人挡了一下」'],
    unlockGift: '一支玫瑰',
    poeticLine: '你已经比上一周更圆了。',
  },
  {
    index: 5,
    phaseKey: 'full',
    title: 'V · 望月 · 最圆的那一夜',
    prompt: '如果今晚必须去拥抱一个人，你想抱谁？',
    hint: '答完后再悄悄关掉这一页。',
    options: ['过去的我', '未来的我', '一直在身边的人', '一个已经走远的人'],
    unlockGift: '一束香脂瓶',
    poeticLine: '盈极而思缺，月也会想被人看见。',
  },
  {
    index: 6,
    phaseKey: 'waningGibbous',
    title: 'VI · 亏凸月 · 缓慢释放',
    prompt: '这一周你愿意主动放下哪一件事？',
    hint: '可以是想法，可以是物件，可以是一段对话。',
    options: ['一段没回的消息', '一个证明欲', '一种比较', '一件旧衣服'],
    unlockGift: '一片旧木',
    poeticLine: '不必赶 — 宇宙也在让自己慢慢瘦下来。',
  },
  {
    index: 7,
    phaseKey: 'lastQuarter',
    title: 'VII · 下弦月 · 重新分配',
    prompt: '你愿意给下半个月留出多少「空白时间」？',
    hint: '空白不是浪费，是月相留给你的留白。',
    options: ['每天 30 分钟', '一个完整下午', '一整天不安排', '我不需要空白'],
    unlockGift: '一盏夜灯',
    poeticLine: '把另一半月借给夜，自己留下白天。',
  },
  {
    index: 8,
    phaseKey: 'waningCrescent',
    title: 'VIII · 下蛾眉月 · 月最瘦的那几日',
    prompt: '哪句话最近让你哭过？',
    hint: '不用截图，只要说出关键词。',
    options: ['「你辛苦了」', '「不是你的错」', '「没事的，慢慢来」', '「我懂你」'],
    unlockGift: '一个塔罗牌',
    poeticLine: '最瘦的月里，最容易听见自己的声音。',
  },
  {
    index: 9,
    phaseKey: 'new',
    title: 'IX · 第二轮新月 · 复读神域',
    prompt: '回看上一个月，你觉得自己最像哪种「神侍」？',
    hint: '挑一种你自己也会暗暗喜欢的形象。',
    options: ['书写者', '观月者', '点灯人', '走夜路的'],
    unlockGift: '神域暗码 ※',
    poeticLine: '神不来一次就走，神是在你身上常驻。',
  },
  {
    index: 10,
    phaseKey: 'firstQuarter',
    title: 'X · 第二轮上弦 · 主动召唤',
    prompt: '你愿意主动告诉一位朋友 ta 像哪位主神吗？',
    hint: '可以是赞美，也可以是一句温柔的注脚。',
    options: ['今晚就发', '想一想再发', '只在心里说', '不告诉 ta 但记下来'],
    unlockGift: '一张主神侧脸',
    poeticLine: '替别人取一个神名 — 就是把光也分一束给 ta。',
  },
  {
    index: 11,
    phaseKey: 'full',
    title: 'XI · 第二轮望月 · 全镜映照',
    prompt: '如果你现在写一封信给 30 天后的自己，标题是什么？',
    hint: '一句话即可。',
    options: ['「记得你也曾发过光」', '「不必再向谁解释」', '「请继续慢慢来」', '「请替我照顾好那个人」'],
    unlockGift: '24 镜面全亮',
    poeticLine: '月圆两次，你也照见了自己两面。',
  },
  {
    index: 12,
    phaseKey: 'waningGibbous',
    title: 'XII · 第二轮亏凸 · 加冕大祭司',
    prompt: '完成 12 章后 — 你想怎么称呼自己的神域身份？',
    hint: '从今天起，你的 WTFTI 卡上会出现这个尊号。',
    options: ['月之祭司', '光之书写者', '潮汐管理员', '夜行神官'],
    unlockGift: '✦ 大祭司称号 ✦',
    poeticLine: '神不在远方，神在你愿意点亮自己的那一夜。',
  },
];

// ───────────────────────── 进度 / 持久化 ─────────────────────────

const STORAGE_KEY = 'wtfti:moon:chapters';

export interface MoonProgress {
  /** 已答章节序号 */
  done: number[];
  /** 序号 → 选项 idx (0-3) */
  answers: Record<number, number>;
  /** 加冕时间 ISO，可空 */
  crownedAt?: string;
  /** 加冕时选的尊号 */
  title?: string;
}

export function loadMoonProgress(): MoonProgress {
  if (typeof window === 'undefined') return { done: [], answers: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { done: [], answers: {} };
    const parsed = JSON.parse(raw) as MoonProgress;
    return {
      done: Array.isArray(parsed.done) ? parsed.done : [],
      answers: parsed.answers ?? {},
      crownedAt: parsed.crownedAt,
      title: parsed.title,
    };
  } catch {
    return { done: [], answers: {} };
  }
}

export function saveMoonProgress(p: MoonProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function answerChapter(index: number, optionIdx: number): MoonProgress {
  const p = loadMoonProgress();
  const done = p.done.includes(index) ? p.done : [...p.done, index].sort((a, b) => a - b);
  const next: MoonProgress = {
    ...p,
    done,
    answers: { ...p.answers, [index]: optionIdx },
  };
  // crown when 12 complete and crowning chapter (XII) provides title via answer
  if (done.length === 12 && index === 12 && !p.crownedAt) {
    next.crownedAt = new Date().toISOString();
    next.title = LUNAR_CHAPTERS[11].options[optionIdx];
  }
  saveMoonProgress(next);
  return next;
}

/** 选今日推荐章节：优先未答的、phase 匹配的章节 */
export function recommendTodayChapter(progress: MoonProgress, phase: LunarPhase): LunarChapter {
  const remaining = LUNAR_CHAPTERS.filter((c) => !progress.done.includes(c.index));
  if (!remaining.length) return LUNAR_CHAPTERS[LUNAR_CHAPTERS.length - 1];
  const matched = remaining.find((c) => c.phaseKey === phase.key);
  return matched ?? remaining[0];
}

// ───────────────────────── Future Letter (30 天) ─────────────────────────

const LETTER_KEY = 'wtfti:future-letter';

export interface FutureLetter {
  /** 写信时间 ISO */
  sealedAt: string;
  /** 30 天后揭封 ISO */
  revealAt: string;
  /** 标题 */
  title: string;
  /** 正文（用户自填，可空 — 默认存模板） */
  body: string;
  /** 主星 slug（可空） */
  planetSlug?: string;
}

export function loadFutureLetter(): FutureLetter | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LETTER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FutureLetter;
  } catch {
    return null;
  }
}

export function sealFutureLetter(title: string, body: string, planetSlug?: string): FutureLetter {
  const sealedAt = new Date();
  const revealAt = new Date(sealedAt.getTime() + 30 * 86_400_000);
  const letter: FutureLetter = {
    sealedAt: sealedAt.toISOString(),
    revealAt: revealAt.toISOString(),
    title: title.slice(0, 60),
    body: body.slice(0, 400),
    planetSlug,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LETTER_KEY, JSON.stringify(letter));
    } catch {
      /* ignore */
    }
  }
  return letter;
}

export function isLetterReady(letter: FutureLetter, now: Date = new Date()): boolean {
  return new Date(letter.revealAt).getTime() <= now.getTime();
}

export function daysUntilReveal(letter: FutureLetter, now: Date = new Date()): number {
  const ms = new Date(letter.revealAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function clearFutureLetter() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LETTER_KEY);
  } catch {
    /* ignore */
  }
}
