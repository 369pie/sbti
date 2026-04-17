/**
 * Persona Shard — Runtime state snapshot.
 *
 * Reads localStorage and composes the inputs needed for mood/stage derivation.
 * Kept as a pure "snapshot" call so components can memoise and re-derive.
 *
 * Also exposes a tiny "card visit" tracker so we can count visits over 7 days.
 */

import { loadCard, type WtfCardData } from '../wtf-card';
import { loadStreak } from '../daily/moon-phase';
import type { MoodInputs, StageInputs } from './mood';

const VISIT_LOG_KEY = 'persona-shard-visits-v1';
const LAST_SEEN_KEY = 'persona-shard-last-seen-v1';

interface VisitLog {
  /** ISO date strings, newest-first; capped at 14 */
  dates: string[];
}

function loadVisitLog(): VisitLog {
  if (typeof window === 'undefined') return { dates: [] };
  try {
    const raw = localStorage.getItem(VISIT_LOG_KEY);
    if (!raw) return { dates: [] };
    const parsed = JSON.parse(raw) as VisitLog;
    return { dates: Array.isArray(parsed.dates) ? parsed.dates : [] };
  } catch {
    return { dates: [] };
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(aIso: string, bIso: string): number {
  const a = Date.parse(aIso);
  const b = Date.parse(bIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

/**
 * Record that the user visited the card / shard surface today.
 * Idempotent per day.
 */
export function recordCardVisit(): void {
  if (typeof window === 'undefined') return;
  const t = today();
  const log = loadVisitLog();
  if (log.dates[0] === t) {
    writeLastSeen(t);
    return;
  }
  const next = { dates: [t, ...log.dates.filter(d => d !== t)].slice(0, 14) };
  try {
    localStorage.setItem(VISIT_LOG_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  writeLastSeen(t);
}

function writeLastSeen(iso: string): void {
  try {
    localStorage.setItem(LAST_SEEN_KEY, iso);
  } catch {
    // ignore
  }
}

function readLastSeen(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_SEEN_KEY);
  } catch {
    return null;
  }
}

// ─── Snapshot ────────────────────────────────────────────────────────────────

export interface ShardSnapshot {
  card: WtfCardData | null;
  totalTested: number;
  testedInLast3Days: boolean;
  daysSinceLastSeen: number;
  cardVisitsLast7Days: number;
  dailyStreak: number;
  /** Placeholder until gacha exposes a streak — 0 is a safe default. */
  gachaStreak: number;
}

export function snapshotShardState(): ShardSnapshot {
  const card = loadCard();
  const t = today();

  let totalTested = 0;
  let testedInLast3Days = false;
  if (card) {
    for (const r of Object.values(card.results)) {
      if (!r) continue;
      totalTested += 1;
      if (r.testedAt && daysBetween(r.testedAt, t) <= 3) testedInLast3Days = true;
    }
  }

  const log = loadVisitLog();
  const cardVisitsLast7Days = log.dates.filter(d => daysBetween(d, t) <= 7).length;

  const lastSeen = readLastSeen() ?? (log.dates[0] ?? null);
  const daysSinceLastSeen = lastSeen ? Math.max(0, daysBetween(lastSeen, t)) : 0;

  const streakState = loadStreak();

  return {
    card,
    totalTested,
    testedInLast3Days,
    daysSinceLastSeen,
    cardVisitsLast7Days,
    dailyStreak: streakState.streak ?? 0,
    gachaStreak: 0,
  };
}

/**
 * Build MoodInputs & StageInputs for a specific universe+slug from a snapshot.
 */
export function shardInputsFor(universeId: string, slug: string, snap: ShardSnapshot): {
  moodInputs: MoodInputs;
  stageInputs: StageInputs;
  thisTested: boolean;
} {
  const result = snap.card?.results?.[universeId] ?? null;
  const thisTested = !!result && result.slug === slug;

  return {
    thisTested,
    moodInputs: {
      thisTestedAt: result?.testedAt,
      totalTested: snap.totalTested,
      testedInLast3Days: snap.testedInLast3Days,
      gachaStreak: snap.gachaStreak,
      dailyStreak: snap.dailyStreak,
      daysSinceLastSeen: snap.daysSinceLastSeen,
    },
    stageInputs: {
      thisTested,
      totalTested: snap.totalTested,
      cardVisitsLast7Days: snap.cardVisitsLast7Days,
    },
  };
}
