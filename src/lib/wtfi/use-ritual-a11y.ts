'use client';

/**
 * Shared a11y / haptic hooks for ritual quiz components.
 * Strategy: docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §10
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Detects `(prefers-reduced-motion: reduce)`. Server-render safe.
 * Returns true on initial mount when user has the OS setting enabled.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  return reduced;
}

/**
 * Returns a haptic trigger that respects:
 * - reduced-motion preference (silent)
 * - global throttle (max one vibration per 800ms)
 * - intensity tiers: 'tap' (silent), 'tick' (short), 'pulse' (medium), 'summon' (long pattern)
 *
 * Usage: only fire 'pulse' or 'summon' for ritual moments (Sanctum unlock,
 * SummonOverlay, Sealing). Default UI taps should remain silent.
 */
type HapticIntensity = 'tap' | 'tick' | 'pulse' | 'summon';

let lastFire = 0;

export function useHaptic() {
  const reduced = useReducedMotion();

  return useCallback(
    (intensity: HapticIntensity = 'tap') => {
      if (typeof navigator === 'undefined' || !navigator.vibrate) return;
      if (reduced) return;
      if (intensity === 'tap') return; // silent — no vibration for routine answers
      const now = Date.now();
      if (now - lastFire < 800) return;
      lastFire = now;
      const pattern: number | number[] =
        intensity === 'tick' ? 8 : intensity === 'pulse' ? [12, 30, 18] : [30, 50, 80, 50, 120];
      try {
        navigator.vibrate(pattern);
      } catch {
        // noop
      }
    },
    [reduced],
  );
}
