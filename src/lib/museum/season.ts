/**
 * Museum Season System (W2)
 *
 * Maps the current date (UTC+8) to a season palette + sign line + frame style.
 * Used by:
 *   - Daily pick overlay  (palette + sign line)
 *   - Sealed (未解锁) cards (frame style)
 *   - Cover hero subtle background (palette accent)
 *
 * Pure / deterministic. Safe on server + client (no Date.now-dependent state).
 *
 * 24 节气 + 8 主要节日 + 4 月相. No backend, no config — date in, season out.
 */

export type SeasonId =
  | 'lichun' | 'yushui' | 'jingzhe' | 'chunfen' | 'qingming' | 'guyu'
  | 'lixia' | 'xiaoman' | 'mangzhong' | 'xiazhi' | 'xiaoshu' | 'dashu'
  | 'liqiu' | 'chushu' | 'bailu' | 'qiufen' | 'hanlu' | 'shuangjiang'
  | 'lidong' | 'xiaoxue' | 'daxue' | 'dongzhi' | 'xiaohan' | 'dahan';

export type FestivalId =
  | 'newyear' | 'springfest' | 'qixi' | 'midautumn'
  | 'doublenine' | 'doubleten' | 'halloween' | 'christmas';

export type MoonPhase = 'new' | 'waxing' | 'full' | 'waning';

export interface SeasonInfo {
  /** Internal ID — 节气 name */
  season: SeasonId;
  /** 中文显示名 */
  seasonLabel: string;
  /** 一句签语 (≤ 14 chars, no period) */
  signLine: string;
  /** Optional festival overlay (overrides default copy) */
  festival?: FestivalId;
  festivalLabel?: string;
  /** Current moon phase */
  moon: MoonPhase;
  moonLabel: string;
  /** Palette — used as subtle accent layered over cream */
  palette: SeasonPalette;
  /** Sealed (locked) card frame style */
  sealStyle: SealStyle;
  /** ISO date this was computed for */
  isoDate: string;
}

export interface SeasonPalette {
  /** Primary tint (used for borders, eyebrow color) */
  tint: string;
  /** Soft tint (for backgrounds, ≤ 18% alpha) */
  tintSoft: string;
  /** Accent (highlight pings) */
  accent: string;
  /** Quarter — spring/summer/autumn/winter/festival */
  quarter: 'spring' | 'summer' | 'autumn' | 'winter' | 'festival';
}

export type SealStyle = 'envelope' | 'scroll' | 'wax' | 'silk' | 'lantern';

// ── 24 节气 (approximate Gregorian start dates) ──────────────────────────────
// Each entry is the day-of-year (1-based, non-leap) when that 节气 begins.
// We pick the latest entry whose start <= today's day-of-year.
const SOLAR_TERMS: Array<{ id: SeasonId; label: string; startDoy: number }> = [
  { id: 'xiaohan',    label: '小寒',  startDoy:   5 }, // Jan 5
  { id: 'dahan',      label: '大寒',  startDoy:  20 }, // Jan 20
  { id: 'lichun',     label: '立春',  startDoy:  35 }, // Feb 4
  { id: 'yushui',     label: '雨水',  startDoy:  50 }, // Feb 19
  { id: 'jingzhe',    label: '惊蛰',  startDoy:  64 }, // Mar 5
  { id: 'chunfen',    label: '春分',  startDoy:  79 }, // Mar 20
  { id: 'qingming',   label: '清明',  startDoy:  95 }, // Apr 5
  { id: 'guyu',       label: '谷雨',  startDoy: 110 }, // Apr 20
  { id: 'lixia',      label: '立夏',  startDoy: 125 }, // May 5
  { id: 'xiaoman',    label: '小满',  startDoy: 141 }, // May 21
  { id: 'mangzhong',  label: '芒种',  startDoy: 157 }, // Jun 6
  { id: 'xiazhi',     label: '夏至',  startDoy: 172 }, // Jun 21
  { id: 'xiaoshu',    label: '小暑',  startDoy: 188 }, // Jul 7
  { id: 'dashu',      label: '大暑',  startDoy: 204 }, // Jul 23
  { id: 'liqiu',      label: '立秋',  startDoy: 219 }, // Aug 7
  { id: 'chushu',     label: '处暑',  startDoy: 235 }, // Aug 23
  { id: 'bailu',      label: '白露',  startDoy: 250 }, // Sep 7
  { id: 'qiufen',     label: '秋分',  startDoy: 266 }, // Sep 23
  { id: 'hanlu',      label: '寒露',  startDoy: 281 }, // Oct 8
  { id: 'shuangjiang',label: '霜降',  startDoy: 296 }, // Oct 23
  { id: 'lidong',     label: '立冬',  startDoy: 311 }, // Nov 7
  { id: 'xiaoxue',    label: '小雪',  startDoy: 326 }, // Nov 22
  { id: 'daxue',      label: '大雪',  startDoy: 341 }, // Dec 7
  { id: 'dongzhi',    label: '冬至',  startDoy: 356 }, // Dec 22
];

const SIGN_LINES: Record<SeasonId, string> = {
  lichun:     '宜醒来 · 忌焦虑',
  yushui:     '宜慢一拍',
  jingzhe:    '宜抖落旧梦',
  chunfen:    '宜对半分春色',
  qingming:   '宜静坐 · 宜远念',
  guyu:       '宜种花 · 忌内耗',
  lixia:      '宜出门见光',
  xiaoman:    '宜知足',
  mangzhong:  '宜把心收一收',
  xiazhi:     '宜放生焦躁',
  xiaoshu:    '宜挂一阵风',
  dashu:      '宜冰镇情绪',
  liqiu:      '宜整理夏天',
  chushu:     '宜深呼吸',
  bailu:      '宜温存',
  qiufen:     '宜对账自己',
  hanlu:      '宜留一盏灯',
  shuangjiang:'宜披一件外套',
  lidong:     '宜储存温度',
  xiaoxue:    '宜静音',
  daxue:      '宜窝在自己里',
  dongzhi:    '宜数到春天',
  xiaohan:    '宜慢热',
  dahan:      '宜对世界放假',
};

const PALETTES: Record<SeasonPalette['quarter'], SeasonPalette> = {
  spring: {
    tint:     '#7BAE82',
    tintSoft: 'rgba(123,174,130,0.10)',
    accent:   '#E5A1B5',
    quarter:  'spring',
  },
  summer: {
    tint:     '#5EA3C2',
    tintSoft: 'rgba(94,163,194,0.10)',
    accent:   '#E8B86E',
    quarter:  'summer',
  },
  autumn: {
    tint:     '#C68A5E',
    tintSoft: 'rgba(198,138,94,0.10)',
    accent:   '#A85A6E',
    quarter:  'autumn',
  },
  winter: {
    tint:     '#7B86AE',
    tintSoft: 'rgba(123,134,174,0.10)',
    accent:   '#A695C2',
    quarter:  'winter',
  },
  festival: {
    tint:     '#A85A6E',
    tintSoft: 'rgba(168,90,110,0.12)',
    accent:   '#D8A35E',
    quarter:  'festival',
  },
};

function quarterFor(season: SeasonId): SeasonPalette['quarter'] {
  if (['lichun', 'yushui', 'jingzhe', 'chunfen', 'qingming', 'guyu'].includes(season)) return 'spring';
  if (['lixia', 'xiaoman', 'mangzhong', 'xiazhi', 'xiaoshu', 'dashu'].includes(season)) return 'summer';
  if (['liqiu', 'chushu', 'bailu', 'qiufen', 'hanlu', 'shuangjiang'].includes(season)) return 'autumn';
  return 'winter';
}

function sealStyleFor(quarter: SeasonPalette['quarter']): SealStyle {
  if (quarter === 'spring') return 'silk';
  if (quarter === 'summer') return 'envelope';
  if (quarter === 'autumn') return 'wax';
  if (quarter === 'winter') return 'scroll';
  return 'lantern';
}

// ── Festivals (Gregorian only — no Lunar lookup, keeps zero deps) ────────────
const FIXED_FESTIVALS: Array<{ id: FestivalId; label: string; month: number; day: number }> = [
  { id: 'newyear',    label: '新年',     month: 1,  day: 1  },
  { id: 'halloween',  label: '万圣',     month: 10, day: 31 },
  { id: 'christmas',  label: '圣诞',     month: 12, day: 25 },
  { id: 'doubleten',  label: '双十',     month: 10, day: 10 },
];

function festivalFor(month: number, day: number): { id: FestivalId; label: string } | null {
  for (const f of FIXED_FESTIVALS) {
    if (f.month === month && f.day === day) return { id: f.id, label: f.label };
  }
  return null;
}

// ── Moon phase (approximate, Conway-style 30-day cycle) ─────────────────────
// Reference new moon: 2000-01-06 18:14 UTC. Synodic month ≈ 29.530588.
function moonPhaseFor(date: Date): { phase: MoonPhase; label: string } {
  const refMs = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (date.getTime() - refMs) / 86_400_000;
  const synodic = 29.530588;
  const cycle = ((days % synodic) + synodic) % synodic; // 0..29.53
  const norm = cycle / synodic; // 0..1
  if (norm < 0.05 || norm > 0.95) return { phase: 'new', label: '新月' };
  if (norm < 0.45) return { phase: 'waxing', label: '盈月' };
  if (norm < 0.55) return { phase: 'full', label: '满月' };
  return { phase: 'waning', label: '亏月' };
}

// ── Day-of-year helper ──────────────────────────────────────────────────────
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86_400_000);
}

// ── Public ──────────────────────────────────────────────────────────────────

/** Convert any Date to a UTC+8 wall-clock Date object (for stable CN day boundary). */
function toShanghai(date: Date): Date {
  return new Date(date.getTime() + 8 * 3600_000);
}

/**
 * Compute season info for the given date (defaults to "now"). Pure.
 */
export function getSeasonInfo(date: Date = new Date()): SeasonInfo {
  const sh = toShanghai(date);
  const doy = dayOfYear(sh);

  // Find latest 节气 whose startDoy <= doy. Fallback to 大雪/冬至 wraparound.
  let term = SOLAR_TERMS[0];
  for (const t of SOLAR_TERMS) {
    if (t.startDoy <= doy) term = t;
  }

  const quarter = quarterFor(term.id);
  let palette = PALETTES[quarter];

  const month = sh.getUTCMonth() + 1;
  const day = sh.getUTCDate();
  const fest = festivalFor(month, day);
  if (fest) palette = PALETTES.festival;

  const moonInfo = moonPhaseFor(sh);
  const isoDate = sh.toISOString().slice(0, 10);

  return {
    season: term.id,
    seasonLabel: term.label,
    signLine: SIGN_LINES[term.id],
    festival: fest?.id,
    festivalLabel: fest?.label,
    moon: moonInfo.phase,
    moonLabel: moonInfo.label,
    palette,
    sealStyle: sealStyleFor(palette.quarter),
    isoDate,
  };
}

/**
 * Pretty header line for daily pick / cover. Format: "2026.04.19 · 谷雨 · 上弦月".
 */
export function formatSeasonHeader(info: SeasonInfo): string {
  const [y, m, d] = info.isoDate.split('-');
  const left = `${y}.${m}.${d}`;
  const middle = info.festivalLabel ? `${info.festivalLabel} · ${info.seasonLabel}` : info.seasonLabel;
  return `${left} · ${middle} · ${info.moonLabel}`;
}
