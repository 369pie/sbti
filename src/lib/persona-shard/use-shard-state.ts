/**
 * Persona Shard — React hook.
 *
 * Subscribes to localStorage changes (storage events + an internal bus) and
 * returns a fully-derived shard state for a (universeId, slug) pair.
 *
 * Uses useSyncExternalStore to avoid setState-in-effect lint violations and
 * to keep SSR-safe defaults.
 */

'use client';

import { useSyncExternalStore, useMemo } from 'react';
import {
  snapshotShardState,
  shardInputsFor,
  type ShardSnapshot,
} from './state';
import { deriveShardTraits, type ShardTraits } from './traits';
import {
  deriveMood,
  deriveStage,
  toShardVisual,
  type ShardMood,
  type ShardStage,
  type ShardVisual,
} from './mood';
import { getDailyLine, type DailyLineResult } from './daily-line';

// ─── External store ──────────────────────────────────────────────────────────

let cachedSnapshot: ShardSnapshot | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  cachedSnapshot = snapshotShardState();
  listeners.forEach(l => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => notify();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
    window.addEventListener('persona-shard:refresh', onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('persona-shard:refresh', onStorage);
    }
  };
}

function getClientSnapshot(): ShardSnapshot {
  if (!cachedSnapshot) cachedSnapshot = snapshotShardState();
  return cachedSnapshot;
}

// Stable fallback for SSR — same reference every call.
const EMPTY_SNAPSHOT: ShardSnapshot = {
  card: null,
  totalTested: 0,
  testedInLast3Days: false,
  daysSinceLastSeen: 0,
  cardVisitsLast7Days: 0,
  dailyStreak: 0,
  gachaStreak: 0,
};
function getServerSnapshot(): ShardSnapshot {
  return EMPTY_SNAPSHOT;
}

/** Trigger all subscribers to re-read localStorage. */
export function refreshShardState(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('persona-shard:refresh'));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface ShardState {
  traits: ShardTraits;
  mood: ShardMood;
  stage: ShardStage;
  visual: ShardVisual;
  line: DailyLineResult;
  thisTested: boolean;
  totalTested: number;
}

export function useShardState(universeId: string, slug: string): ShardState {
  const snap = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return useMemo(() => {
    const traits = deriveShardTraits(universeId, slug);
    const { moodInputs, stageInputs, thisTested } = shardInputsFor(universeId, slug, snap);
    const mood = deriveMood(moodInputs);
    const stage = deriveStage(stageInputs);
    const visual = toShardVisual(stage, mood, traits);
    const line = getDailyLine({ universeId, slug, traits, mood });
    return {
      traits,
      mood,
      stage,
      visual,
      line,
      thisTested,
      totalTested: snap.totalTested,
    };
  }, [universeId, slug, snap]);
}
