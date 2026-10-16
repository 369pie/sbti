/**
 * Star Spirit · 星灵引擎（V0 · docs/01-strategy/star-spirit-nurture-strategy-2026-08.md）
 *
 * 护栏（提案 §2.1 修订版，2026-08-16 裁决）：
 *  - 不设死亡/饥饿：缺席只是不成长，无任何惩罚语义
 *  - 成长不与付费挂钩：主线阶段完全由浇灌与时间驱动
 *  - 数字可以有，但长得像星象不像仪表盘（客户端呈现职责）
 *
 * 本文件为共享类型 + 纯函数；Supabase 读写见同目录 star-spirit-server.ts。
 */

export type StarDustSource = 'today' | 'card' | 'mood' | 'letter' | 'moon' | 'duet' | 'bonus';

/** 各来源单次星尘（提案 §3.2a） */
export const STAR_DUST_AMOUNT: Record<StarDustSource, number> = {
  today: 1,
  card: 1,
  mood: 2,
  letter: 3,
  moon: 5,
  duet: 5,
  bonus: 0,
};

/** 每日获取上限（防刷 + 防任务清单化——「今晚的星空满了」） */
export const DAILY_EARN_CAP = 10;

/** 每次浇灌消耗 1 星尘、+2 成长 */
export const WATER_COST = 1;
export const WATER_GROWTH = 2;

/** once-daily 来源：同一天重复触发只记一次 */
const ONCE_DAILY_SOURCES = new Set<StarDustSource>(['today', 'card']);

export function isOnceDailySource(source: StarDustSource): boolean {
  return ONCE_DAILY_SOURCES.has(source);
}

/** 成长阶段（提案 §3.2b：茧 → 幼灵 → 成灵 → 共生体） */
export interface StarSpiritStage {
  key: 'cocoon' | 'juvenile' | 'adult' | 'symbiont';
  label: string;
  enLabel: string;
  minGrowth: number;
}

export const STAGES: StarSpiritStage[] = [
  { key: 'cocoon', label: '茧', enLabel: 'Cocoon', minGrowth: 0 },
  { key: 'juvenile', label: '幼灵', enLabel: 'Juvenile', minGrowth: 10 },
  { key: 'adult', label: '成灵', enLabel: 'Radiant', minGrowth: 40 },
  { key: 'symbiont', label: '共生体', enLabel: 'Symbiont', minGrowth: 100 },
];

export function stageForGrowth(growth: number): StarSpiritStage {
  let stage = STAGES[0];
  for (const s of STAGES) {
    if (growth >= s.minGrowth) stage = s;
  }
  return stage;
}

/** 连续夜数 → 亮度 0..1（7 夜满辉；断签自然回落后重亮，无惩罚文案） */
export function brightnessForStreak(streakNights: number): number {
  return Math.max(0, Math.min(1, streakNights / 7));
}

/** 人格 slug → 品牌色相家族（rose / gold / violet；确定性） */
export type SpiritHue = 'rose' | 'gold' | 'violet';

export function hueForPersonality(slug: string | null | undefined): SpiritHue {
  if (!slug) return 'violet';
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (['rose', 'gold', 'violet'] as const)[(h >>> 0) % 3];
}

export interface StarSpiritState {
  exists: boolean;
  name: string | null;
  personalitySlug: string | null;
  growth: number;
  stardust: number;
  streakNights: number;
  /** 今天是否还能浇灌（每日 1 次 + 余额 ≥ 1） */
  canWater: boolean;
  alreadyWateredToday: boolean;
  earnedToday: number;
  earnCap: number;
  stage: StarSpiritStage;
  brightness: number;
  hue: SpiritHue;
  bornAt: string | null;
}

export const EMPTY_SPIRIT_STATE: StarSpiritState = {
  exists: false,
  name: null,
  personalitySlug: null,
  growth: 0,
  stardust: 0,
  streakNights: 0,
  canWater: false,
  alreadyWateredToday: false,
  earnedToday: 0,
  earnCap: DAILY_EARN_CAP,
  stage: STAGES[0],
  brightness: 0,
  hue: 'violet',
  bornAt: null,
};
