/**
 * Birthday utility (W4) — local-only, optional opt-in.
 *
 * The user types MM-DD once; we store it under `wtf-museum-birthday-v1`
 * and the daily-pick / season layer can query `isBirthdayToday()` to
 * upgrade the day's signature card with golden trim.
 *
 * No backend, no PII transmitted.
 */

const KEY = 'wtf-museum-birthday-v1';

export interface BirthdayMd {
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

export function loadBirthday(): BirthdayMd | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed && typeof parsed.month === 'number' && typeof parsed.day === 'number'
      && parsed.month >= 1 && parsed.month <= 12
      && parsed.day >= 1 && parsed.day <= 31
    ) {
      return { month: parsed.month, day: parsed.day };
    }
  } catch { /* swallow */ }
  return null;
}

export function saveBirthday(b: BirthdayMd): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(b));
  } catch { /* swallow */ }
}

export function clearBirthday(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch { /* swallow */ }
}

export function isBirthdayToday(now: Date = new Date()): boolean {
  const b = loadBirthday();
  if (!b) return false;
  return now.getMonth() + 1 === b.month && now.getDate() === b.day;
}

/** Parse "MM-DD" or "M-D" string into BirthdayMd, or null if invalid. */
export function parseBirthdayInput(s: string): BirthdayMd | null {
  const m = s.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day };
}

export function formatBirthday(b: BirthdayMd): string {
  return `${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`;
}
