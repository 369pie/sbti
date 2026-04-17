/**
 * 心情记录（W5）— 每日翻牌后引导用户用 5 个 emoji 记录情绪
 *
 * 30 天滚动窗口；每日仅保留一次记录（覆盖式更新当日）。
 * 用于：① 月报数据源 ② 日活留存指标
 */

const STORAGE_KEY = 'mysti-mood-log';
const MAX_DAYS = 60; // 留出一些缓冲，月报最多用 30

export const MOOD_OPTIONS = [
  { id: 'glow', emoji: '✨', label: '心如莲开', tone: '舒展' },
  { id: 'calm', emoji: '🌊', label: '波澜不惊', tone: '平静' },
  { id: 'shadow', emoji: '🌑', label: '坠入暗面', tone: '压抑' },
  { id: 'fire', emoji: '🔥', label: '火光跃动', tone: '燃烧' },
  { id: 'mist', emoji: '🌫️', label: '迷雾未散', tone: '困惑' },
] as const;

export type MoodId = (typeof MOOD_OPTIONS)[number]['id'];

export interface MoodEntry {
  /** YYYY-MM-DD */
  date: string;
  mood: MoodId;
  /** 可选短语 */
  note?: string;
  recordedAt: number;
}

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function load(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as MoodEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(entries: MoodEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_DAYS)),
    );
  } catch {
    /* swallow */
  }
}

export function recordMood(mood: MoodId, note?: string): MoodEntry {
  const entry: MoodEntry = {
    date: todayKey(),
    mood,
    note,
    recordedAt: Date.now(),
  };
  const list = load().filter(e => e.date !== entry.date);
  list.unshift(entry);
  save(list);
  return entry;
}

export function getTodayMood(): MoodEntry | null {
  const today = todayKey();
  return load().find(e => e.date === today) ?? null;
}

export function getMoodHistory(days: number = 30): MoodEntry[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return load()
    .filter(e => e.recordedAt >= cutoff)
    .sort((a, b) => b.recordedAt - a.recordedAt);
}

export function getMoodStats(days: number = 30): Record<MoodId, number> {
  const stats: Record<string, number> = {};
  for (const opt of MOOD_OPTIONS) stats[opt.id] = 0;
  for (const e of getMoodHistory(days)) {
    stats[e.mood] = (stats[e.mood] ?? 0) + 1;
  }
  return stats as Record<MoodId, number>;
}

/** 当月（YYYY-MM）的所有记录 */
export function getMoodEntriesForMonth(yyyymm: string): MoodEntry[] {
  return load().filter(e => e.date.startsWith(yyyymm));
}

/** 当前月份 key（YYYY-MM） */
export function currentMonthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
