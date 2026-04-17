'use client';

/**
 * Museum progress card — shows unlocked/total + progress bar + nudge.
 * Reads from useMuseumUnlocked() (SSR-safe via useSyncExternalStore).
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMuseumUnlocked } from '@/lib/museum/unlocked';
import { trackMuseum } from '@/lib/museum/analytics';

interface MuseumProgressProps {
  totalCards: number;
  totalSeries: number;
}

export default function MuseumProgress({ totalCards, totalSeries }: MuseumProgressProps) {
  const summary = useMuseumUnlocked();
  const seenRef = useRef(false);

  useEffect(() => {
    if (seenRef.current) return;
    if (summary.totalUnlocked === 0) return; // empty state — don't fire impression
    seenRef.current = true;
    trackMuseum('museum_progress_seen', {
      total_unlocked: summary.totalUnlocked,
      total_cards: totalCards,
      unlocked_tabs: summary.unlockedTabs,
    });
  }, [summary.totalUnlocked, summary.unlockedTabs, totalCards]);

  const ratio = Math.min(1, summary.totalUnlocked / totalCards);
  const pct = Math.round(ratio * 100);

  // Empty state — first-time visitors
  if (summary.totalUnlocked === 0) {
    return (
      <section
        className="my-8 sm:my-10 p-5 sm:p-7 rounded-2xl border animate-fade-up"
        style={{
          borderColor: 'var(--color-rule-soft)',
          background: 'linear-gradient(135deg, rgba(232,114,156,0.06), rgba(232,114,156,0.01))',
        }}
        aria-labelledby="museum-progress-empty"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <span className="eyebrow text-[10px] mb-2 block">Your Collection</span>
            <h2 id="museum-progress-empty" className="section-headline text-xl sm:text-2xl mb-1.5">
              您的图鉴还是空的
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              做完任何一个测试，对应人设卡就会从剪影里浮出来。{totalCards} 张正在等您。
            </p>
          </div>
          <Link href="/test/" prefetch={false} className="btn btn-ink shrink-0">
            做第一个测试
            <span className="opacity-60">→</span>
          </Link>
        </div>
      </section>
    );
  }

  // Has-progress state
  const remaining = totalCards - summary.totalUnlocked;
  const hello = summary.nickname ? `${summary.nickname}，` : '';

  return (
    <section
      className="my-8 sm:my-10 p-5 sm:p-7 rounded-2xl border animate-fade-up"
      style={{
        borderColor: 'var(--color-rule-soft)',
        background: 'linear-gradient(135deg, rgba(232,114,156,0.07), rgba(168,85,247,0.04))',
      }}
      aria-labelledby="museum-progress-heading"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4 sm:mb-5">
        <div className="min-w-0 flex-1">
          <span className="eyebrow text-[10px] mb-2 block">Your Collection</span>
          <h2 id="museum-progress-heading" className="section-headline text-xl sm:text-2xl mb-1">
            {hello}已解锁 <span className="stat-value text-2xl sm:text-3xl mx-1" style={{ color: 'var(--color-rose-deep)' }}>{summary.totalUnlocked}</span>
            <span className="text-text-muted">/</span>
            <span className="stat-value text-base sm:text-lg ml-1 text-text-muted">{totalCards}</span>
          </h2>
          <p className="text-sm text-text-secondary leading-snug">
            集齐了 {summary.unlockedTabs} / {totalSeries} 个系列。再差 {remaining} 张就把这间博物馆刷完
          </p>
        </div>
        <Link
          href="/card/"
          prefetch={false}
          className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg border border-rule-soft hover:border-ink transition-colors shrink-0"
          style={{ borderColor: 'var(--color-rule-soft)' }}
        >
          查看完整收藏 →
        </Link>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.06)' }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalCards}
        aria-valuenow={summary.totalUnlocked}
        aria-label={`已解锁 ${summary.totalUnlocked} / ${totalCards} 张人设卡`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-rose), #a855f7)',
          }}
        />
      </div>

      <div className="flex items-baseline justify-between mt-2.5">
        <span className="serial-number text-xs text-text-muted">{pct}% complete</span>
        <span className="eyebrow text-[10px] text-text-muted">
          {summary.totalUnlocked >= totalCards * 0.5 ? '· 已过半 ·' : summary.totalUnlocked >= 10 ? '· 资深收藏家 ·' : '· 刚开始 ·'}
        </span>
      </div>
    </section>
  );
}
