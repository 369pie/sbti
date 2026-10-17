/**
 * Visit streak for her_profiles (reward only — never decreases mid-day).
 */

export interface StreakState {
  lastVisitDate: string | null;
  streakCount: number;
}

export interface StreakUpdate {
  lastVisitDate: string;
  streakCount: number;
  /** True when we need to persist (first visit of the day or new user). */
  changed: boolean;
}

/**
 * @param todayISO Asia/Shanghai YYYY-MM-DD
 * @param yesterdayISO Asia/Shanghai YYYY-MM-DD for yesterday
 */
export function nextStreak(
  current: StreakState,
  todayISO: string,
  yesterdayISO: string,
): StreakUpdate {
  const prev = Math.max(0, current.streakCount | 0);

  if (current.lastVisitDate === todayISO) {
    return {
      lastVisitDate: todayISO,
      streakCount: prev > 0 ? prev : 1,
      changed: prev === 0,
    };
  }

  if (current.lastVisitDate === yesterdayISO) {
    return {
      lastVisitDate: todayISO,
      streakCount: prev + 1,
      changed: true,
    };
  }

  return {
    lastVisitDate: todayISO,
    streakCount: 1,
    changed: true,
  };
}
