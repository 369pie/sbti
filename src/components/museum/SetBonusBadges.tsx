'use client';

/**
 * SetBonusBadges (W3) — horizontal scrollable strip of achievement badges.
 *
 * Non-prescriptive: only nearest milestones are shown when not yet
 * achieved (computed in `set-bonus.ts`); achieved Edition badges are
 * pinned to the front.
 */

import { useEffect, useMemo, useRef } from 'react';
import type { Badge } from '@/lib/museum/set-bonus';
import { trackMuseum } from '@/lib/museum/analytics';

interface SetBonusBadgesProps {
  badges: Badge[];
  accent: string;
}

export default function SetBonusBadges({ badges, accent }: SetBonusBadgesProps) {
  const sorted = useMemo(() => {
    // Achieved first, then nearest-to-achievement first.
    return [...badges].sort((a, b) => {
      if (a.achieved !== b.achieved) return a.achieved ? -1 : 1;
      const aProg = a.progress ? a.progress.current / Math.max(1, a.progress.target) : 0;
      const bProg = b.progress ? b.progress.current / Math.max(1, b.progress.target) : 0;
      return bProg - aProg;
    });
  }, [badges]);

  const seenRef = useRef(false);
  useEffect(() => {
    if (seenRef.current) return;
    seenRef.current = true;
    const achieved = badges.filter((b) => b.achieved).length;
    trackMuseum('set_bonus_seen', { total: badges.length, achieved });
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <section className="mb-5 sm:mb-6 animate-fade-up" style={{ animationDelay: '110ms' }}>
      <div className="flex items-baseline gap-3 mb-2.5">
        <span className="serial-number text-xs">06</span>
        <span className="eyebrow">Set Bonus · 套装徽章</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sorted.map((b) => {
          const isOn = b.achieved;
          const pct = b.progress ? Math.min(1, b.progress.current / Math.max(1, b.progress.target)) : 0;
          return (
            <div
              key={b.id}
              className="relative flex-shrink-0 rounded-xl border px-3 py-2.5 min-w-[148px] transition-all"
              style={{
                background: isOn ? `linear-gradient(135deg, ${accent}10, ${accent}04)` : 'var(--color-bg-elevated)',
                borderColor: isOn ? `${accent}55` : 'var(--color-border-subtle)',
                opacity: isOn ? 1 : 0.78,
              }}
              title={b.hint}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none" style={{ color: isOn ? accent : 'var(--color-text-muted)' }}>
                  {b.glyph}
                </span>
                <div className="min-w-0">
                  <div className={`text-[12px] font-semibold leading-tight truncate ${isOn ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {b.label}
                  </div>
                  <div className="text-[10px] text-text-muted truncate">
                    {b.hint}
                  </div>
                </div>
              </div>
              {b.progress && !isOn && (
                <div className="mt-2 h-0.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-border-subtle)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct * 100}%`, background: accent }}
                  />
                </div>
              )}
              {isOn && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: accent, color: '#fff' }}
                >
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
