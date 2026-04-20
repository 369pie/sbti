'use client';

/**
 * FreePathPanel (W4 — Free Path) — visual seasonal milestone track.
 *
 * - Pure decoration rewards (no content unlock)
 * - No countdown
 * - "Just-out-of-reach" framing only (no "差 X 张" pressure beyond next 1 milestone)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FreePathReport } from '@/lib/museum/free-path';
import { trackMuseum } from '@/lib/museum/analytics';

interface FreePathPanelProps {
  report: FreePathReport;
  accent: string;
}

const STORAGE_KEY = 'wtf-museum-freepath-claimed-v1';

export default function FreePathPanel({ report, accent }: FreePathPanelProps) {
  const seenRef = useRef(false);
  useEffect(() => {
    if (seenRef.current) return;
    seenRef.current = true;
    trackMuseum('free_path_seen', { total_unlocked: report.achievedCount, total_cards: report.totalCount });
  }, [report.achievedCount, report.totalCount]);

  // Detect newly-achieved decorations vs prior session.
  const [justEarned, setJustEarned] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => {
      let prior: string[] = [];
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) prior = JSON.parse(raw);
        if (!Array.isArray(prior)) prior = [];
      } catch { prior = []; }
      const earned = report.earnedDecorations;
      const fresh = earned.find((d) => !prior.includes(d));
      if (fresh) {
        const next = Array.from(new Set([...prior, ...earned]));
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* swallow */ }
        const m = report.milestones.find((x) => x.decoration === fresh);
        if (m) {
          trackMuseum('free_path_milestone_done', { slug: m.id, source: m.decoration });
          setJustEarned(`${m.title} · ${m.decorationLabel}`);
          window.setTimeout(() => setJustEarned(null), 4200);
        }
      }
    }, 30);
    return () => window.clearTimeout(t);
  }, [report]);

  const ordered = useMemo(() => {
    return [...report.milestones].sort((a, b) => {
      if (a.achieved && !b.achieved) return -1;
      if (!a.achieved && b.achieved) return 1;
      return b.progress - a.progress;
    });
  }, [report.milestones]);

  return (
    <section className="mb-5 sm:mb-7 animate-fade-up" style={{ animationDelay: '90ms' }}>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="serial-number text-xs">07 / Free Path</span>
          <h3 className="text-base sm:text-lg section-headline mt-0.5">
            {report.seasonLabel} · 装饰路径
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          {report.achievedCount} / {report.totalCount}
        </span>
      </div>

      <div
        className="rounded-2xl border bg-bg-elevated px-3 py-3 paper-texture"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="overflow-x-auto -mx-1 px-1">
          <ol className="flex gap-2 snap-x snap-mandatory">
            {ordered.map((m) => {
              const tint = m.achieved ? accent : 'var(--color-border-subtle)';
              return (
                <li
                  key={m.id}
                  className="snap-start shrink-0 rounded-xl border px-3 py-2.5 min-w-[170px] max-w-[210px] flex flex-col gap-1"
                  style={{
                    borderColor: m.achieved ? `${accent}55` : 'var(--color-border-subtle)',
                    background: m.achieved
                      ? `linear-gradient(160deg, ${accent}14, ${accent}04)`
                      : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                      {m.title}
                    </span>
                    {m.achieved && (
                      <span
                        className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded-full"
                        style={{ background: `${accent}22`, color: accent }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug truncate">{m.hint}</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: m.achieved ? accent : 'var(--color-text-muted)' }}>
                    🎁 {m.decorationLabel}
                  </p>
                  {!m.achieved && (
                    <div className="mt-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(m.progress * 100)}%`,
                          background: tint,
                        }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {justEarned && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[55] px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg animate-fade-up"
          style={{ background: accent }}
        >
          🎉 解锁装饰：{justEarned}
        </div>
      )}
    </section>
  );
}
