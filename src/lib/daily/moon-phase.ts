/**
 * Moon Phase + Daily Ritual (E-11)
 *
 * Pure computation — no external API. Uses a simplified synodic-month model
 * (29.530588 days) relative to a known new moon epoch. Accuracy ±0.5 day,
 * more than sufficient for ritual UX ("月相 · 盈凸月").
 *
 * Also centralises the 7-day streak reward logic (read-only — callers persist
 * streak state via wtf-card localStorage or Supabase once accounts land).
 */

import { queueAssetSync } from '@/lib/assets/asset-sync';

// Known new moon: 2025-01-29 12:36 UTC (reference epoch for simplified model)
const NEW_MOON_EPOCH_MS = Date.UTC(2025, 0, 29, 12, 36, 0);
const SYNODIC_MONTH_MS = 29.530588 * 24 * 60 * 60 * 1000;

export type MoonPhaseKey =
  | 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous'
  | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';

export interface MoonPhaseInfo {
  key: MoonPhaseKey;
  /** 0..1 illuminated fraction (approximate). */
  illumination: number;
  /** 0..1 progress through synodic month (0=new, 0.5=full). */
  age: number;
  name: string;
  emoji: string;
  /** Women-first ritual prompt shown on daily page. */
  prompt: string;
}

const PHASE_DEFS: { key: MoonPhaseKey; name: string; emoji: string; prompt: string }[] = [
  { key: 'new',              name: '新月',   emoji: '🌑', prompt: '今晚可以写下一件"只说给自己"的事。' },
  { key: 'waxing-crescent',  name: '娥眉月', emoji: '🌒', prompt: '允许自己有一个还没成型的愿望。' },
  { key: 'first-quarter',    name: '上弦月', emoji: '🌓', prompt: '做一次你最近一直逃避的 10 分钟对话。' },
  { key: 'waxing-gibbous',   name: '盈凸月', emoji: '🌔', prompt: '今天可以为自己做一件别人看不见的事。' },
  { key: 'full',             name: '满月',   emoji: '🌕', prompt: '今晚写下你想"放下"的一件事，让它在满月里松开。' },
  { key: 'waning-gibbous',   name: '亏凸月', emoji: '🌖', prompt: '感谢自己这周顶住的那一次。' },
  { key: 'last-quarter',     name: '下弦月', emoji: '🌗', prompt: '今天允许自己对某件事"不做"。' },
  { key: 'waning-crescent',  name: '残月',   emoji: '🌘', prompt: '安静地坐五分钟，只听自己的呼吸。' },
];

export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const diff = date.getTime() - NEW_MOON_EPOCH_MS;
  const cycles = diff / SYNODIC_MONTH_MS;
  const age = ((cycles % 1) + 1) % 1; // 0..1
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * age));

  const idx = Math.floor(age * 8 + 0.5) % 8;
  const def = PHASE_DEFS[idx];
  return { ...def, age, illumination };
}

// ─── Streak reward ──────────────────────────────────────────────────────────

export interface StreakReward {
  day: number;
  label: string;
  unlocksLimitedCard: boolean;
}

export const STREAK_REWARDS: StreakReward[] = [
  { day: 1, label: '今天也愿意看一眼自己', unlocksLimitedCard: false },
  { day: 3, label: '连续 3 天 · 月相加持', unlocksLimitedCard: false },
  { day: 7, label: '连续 7 天 · 解锁限定仪式卡', unlocksLimitedCard: true },
  { day: 14, label: '连续 14 天 · 解锁"月亮书信"', unlocksLimitedCard: true },
  { day: 30, label: '连续 30 天 · 成为月相见证者', unlocksLimitedCard: true },
];

export function getStreakReward(streak: number): StreakReward | null {
  // return highest milestone at or below streak
  let hit: StreakReward | null = null;
  for (const r of STREAK_REWARDS) {
    if (r.day <= streak) hit = r;
  }
  return hit;
}

export function getNextStreakMilestone(streak: number): StreakReward | null {
  return STREAK_REWARDS.find(r => r.day > streak) ?? null;
}

// ─── Streak storage (localStorage) ──────────────────────────────────────────

const STREAK_KEY = 'daily-streak-v1';

export interface StreakState {
  lastCheckInDate: string; // YYYY-MM-DD
  streak: number;
  totalDays: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function loadStreak(): StreakState {
  if (typeof window === 'undefined') return { lastCheckInDate: '', streak: 0, totalDays: 0 };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { lastCheckInDate: '', streak: 0, totalDays: 0 };
    const parsed = JSON.parse(raw) as StreakState;
    return { lastCheckInDate: parsed.lastCheckInDate ?? '', streak: parsed.streak ?? 0, totalDays: parsed.totalDays ?? 0 };
  } catch {
    return { lastCheckInDate: '', streak: 0, totalDays: 0 };
  }
}

function saveStreak(state: StreakState, options?: { skipSync?: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(state));
  } catch {
    return;
  }

  if (!options?.skipSync) {
    queueAssetSync('daily-streak');
  }
}

/** Idempotent — calling multiple times on the same day is safe. */
export function recordCheckIn(): StreakState {
  if (typeof window === 'undefined') return { lastCheckInDate: '', streak: 0, totalDays: 0 };
  const t = today();
  const state = loadStreak();
  if (state.lastCheckInDate === t) return state;

  const continuing = state.lastCheckInDate === yesterday();
  const next: StreakState = {
    lastCheckInDate: t,
    streak: continuing ? state.streak + 1 : 1,
    totalDays: state.totalDays + 1,
  };
  saveStreak(next);
  return next;
}
