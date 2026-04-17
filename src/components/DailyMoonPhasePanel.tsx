'use client';

/**
 * Daily Moon Phase + Streak panel (E-11)
 *
 * Drops under the daily hero. Checks in automatically on mount (idempotent),
 * shows today's moon phase ritual prompt, and shows the streak progress.
 */

import { useEffect, useState } from 'react';
import { ASSET_SYNC_EVENT } from '@/lib/assets/asset-contract';
import {
  getMoonPhase, recordCheckIn, loadStreak,
  getStreakReward, getNextStreakMilestone,
  type MoonPhaseInfo, type StreakState,
} from '@/lib/daily/moon-phase';

export default function DailyMoonPhasePanel() {
  const [phase, setPhase] = useState<MoonPhaseInfo | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);

  useEffect(() => {
    const hydratePanel = () => {
      setPhase(getMoonPhase());
      const nextStreak = loadStreak();
      if (nextStreak.lastCheckInDate) {
        setStreak(nextStreak);
      }
    };

    setPhase(getMoonPhase());
    const s = recordCheckIn();
    setStreak(s.lastCheckInDate ? s : loadStreak());

    window.addEventListener(ASSET_SYNC_EVENT, hydratePanel);
    return () => window.removeEventListener(ASSET_SYNC_EVENT, hydratePanel);
  }, []);

  if (!phase || !streak) return null;

  const current = getStreakReward(streak.streak);
  const next = getNextStreakMilestone(streak.streak);

  return (
    <section className="max-w-3xl mx-auto px-6 pb-16">
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="text-5xl sm:text-6xl" aria-hidden>{phase.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono tracking-wider text-text-muted uppercase mb-1">
              月相 · {Math.round(phase.illumination * 100)}% 亮度
            </div>
            <div className="text-lg font-semibold text-text-primary">{phase.name}</div>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed italic">
              {phase.prompt}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border-subtle/60">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted uppercase mb-2">
            <span>连续签到 · {streak.streak} 天</span>
            <span>累计 · {streak.totalDays} 天</span>
          </div>
          {current && (
            <div className="text-sm text-text-primary mt-1">
              ✧ 已解锁：{current.label}
            </div>
          )}
          {next && (
            <div className="text-xs text-text-muted mt-2">
              再坚持 {next.day - streak.streak} 天 → {next.label}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
