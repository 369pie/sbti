/**
 * Persona Shard — Mood & Stage calculation (client-only, pure given inputs).
 *
 * Mood inputs all live in localStorage; this module takes a snapshot to keep
 * the derivation easy to unit-test.
 */

import type { ShardTraits } from './traits';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShardMood = 'calm' | 'spark' | 'shadow';
export type ShardStage = 'dormant' | 'awake' | 'resonant';

export interface MoodInputs {
  /** ISO date (YYYY-MM-DD) that this universe was tested */
  thisTestedAt?: string;
  /** Total distinct universes tested (including this one) */
  totalTested: number;
  /** Any universe tested in the last 3 days? */
  testedInLast3Days: boolean;
  /** Daily gacha streak (lib/gacha) */
  gachaStreak: number;
  /** Daily signin streak (daily-streak-v1) */
  dailyStreak: number;
  /** Days since last ANY interaction (visited card or any universe) */
  daysSinceLastSeen: number;
}

// ─── Mood ────────────────────────────────────────────────────────────────────

export function deriveMood(inputs: MoodInputs): ShardMood {
  // Shadow: hasn't come back in a while — framed as "碎片在等你回来"
  if (inputs.daysSinceLastSeen >= 7) return 'shadow';
  // Spark: recent fresh activity
  if (inputs.testedInLast3Days || inputs.gachaStreak >= 3 || inputs.dailyStreak >= 3) return 'spark';
  return 'calm';
}

// ─── Stage ───────────────────────────────────────────────────────────────────

export interface StageInputs {
  /** Has THIS universe been tested? */
  thisTested: boolean;
  /** Total distinct universes tested (including this one) */
  totalTested: number;
  /** Number of card page visits in last 7 days */
  cardVisitsLast7Days: number;
}

export function deriveStage(inputs: StageInputs): ShardStage {
  if (!inputs.thisTested) return 'dormant';
  if (inputs.totalTested >= 3 && inputs.cardVisitsLast7Days >= 2) return 'resonant';
  if (inputs.totalTested >= 2) return 'awake';
  return 'dormant';
}

// ─── Visual mapping ──────────────────────────────────────────────────────────

export interface ShardVisual {
  /** Base opacity of the orb body */
  opacity: number;
  /** Animation duration seconds for breathing loop */
  breatheSeconds: number;
  /** Outer glow blur radius */
  glowRadius: number;
  /** Whether to show a secondary halo ring */
  halo: boolean;
  /** Whether to show sparkle particles */
  sparkle: boolean;
  /** Label shown under the orb (optional) */
  moodLabel: string;
  stageLabel: string;
}

export function toShardVisual(
  stage: ShardStage,
  mood: ShardMood,
  traits: ShardTraits,
): ShardVisual {
  const stageBase = {
    dormant: { opacity: 0.35, glowRadius: 12, halo: false },
    awake: { opacity: 0.85, glowRadius: 28, halo: false },
    resonant: { opacity: 1, glowRadius: 48, halo: true },
  }[stage];

  const moodMod = {
    calm:   { breatheSeconds: 4.2, sparkle: false, moodLabel: '平静' },
    spark:  { breatheSeconds: 2.6, sparkle: true, moodLabel: '兴奋' },
    shadow: { breatheSeconds: 6.4, sparkle: false, moodLabel: '沉眠' },
  }[mood];

  const stageLabel = stage === 'dormant' ? '沉睡' : stage === 'awake' ? '苏醒' : '共鸣';

  // Tempo from traits slightly modulates breathing
  const breatheSeconds = moodMod.breatheSeconds / (0.75 + traits.tempo * 0.5);

  return {
    opacity: stageBase.opacity,
    glowRadius: stageBase.glowRadius,
    halo: stageBase.halo,
    sparkle: moodMod.sparkle,
    breatheSeconds,
    moodLabel: moodMod.moodLabel,
    stageLabel,
  };
}
