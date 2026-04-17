/**
 * Limited-window universe support (E-08)
 *
 * A universe marked `status: 'limited'` is visible + testable ONLY between
 * `windowStart` and `windowEnd` (UTC ISO strings). Outside the window:
 *   - UniverseSwitcher / preview cards: show as "已收档" + still linkable if
 *     user has already tested it (kept in their WTF Card)
 *   - Landing page: shows countdown or "已结束"
 *   - Test page: 302 to landing
 *
 * Registry owners flip live → limited via `src/lib/universes.ts` entries.
 */

import { UNIVERSES, type Universe } from './universes';

export interface LimitedWindow {
  startMs: number;
  endMs: number;
}

export interface LimitedUniverseStatus {
  isLimited: boolean;
  isOpen: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  window?: LimitedWindow;
  countdownMs?: number;
  label: string;
}

/** Optional per-universe limited window. Add entries here when running events. */
export const LIMITED_WINDOWS: Record<string, LimitedWindow> = {
  // Example (commented for now):
  // 'weekly-witch': {
  //   startMs: Date.UTC(2026, 3, 17, 0, 0, 0),
  //   endMs:   Date.UTC(2026, 3, 20, 0, 0, 0),
  // },
};

export function getLimitedStatus(universeId: string, now: Date = new Date()): LimitedUniverseStatus {
  const universe = UNIVERSES.find(u => u.id === universeId);
  const win = LIMITED_WINDOWS[universeId];
  if (!universe || (universe.status !== 'limited' && !win)) {
    return { isLimited: false, isOpen: true, hasStarted: true, hasEnded: false, label: '' };
  }
  if (!win) {
    return { isLimited: true, isOpen: false, hasStarted: false, hasEnded: false, label: '限定 · 未开启' };
  }

  const nowMs = now.getTime();
  const hasStarted = nowMs >= win.startMs;
  const hasEnded = nowMs >= win.endMs;
  const isOpen = hasStarted && !hasEnded;

  let label = '';
  let countdownMs: number | undefined;
  if (!hasStarted) {
    label = '限定 · 即将开启';
    countdownMs = win.startMs - nowMs;
  } else if (isOpen) {
    label = '限定 · 开启中';
    countdownMs = win.endMs - nowMs;
  } else {
    label = '限定 · 已收档';
  }

  return { isLimited: true, isOpen, hasStarted, hasEnded, window: win, countdownMs, label };
}

export function getOpenUniverses(now: Date = new Date()): Universe[] {
  return UNIVERSES.filter(u => {
    if (u.status === 'coming-soon') return false;
    if (u.status === 'limited') return getLimitedStatus(u.id, now).isOpen;
    return true;
  });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return d > 0 ? `${d}天 ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
