'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadCard, getLitCount, getTotalCount, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';

/**
 * Inline CTA shown on result pages to guide users to their WTF Card.
 * Shows a mini progress bar + the most recently lit badges as visual hook.
 */
export function WtfCardCTA() {
  const [lit, setLit] = useState<number | null>(null);
  const [recentBadges, setRecentBadges] = useState<{ emoji: string; name: string }[]>([]);
  const total = getTotalCount();

  useEffect(() => {
    const card = loadCard();
    if (!card) return;

    const count = getLitCount(card);
    setLit(count);

    // Collect up to 3 most recent badges for visual display
    const badges: { emoji: string; name: string; date: string }[] = [];
    for (const uid of CARD_UNIVERSE_IDS) {
      const r = card.results[uid];
      if (r) {
        const u = getUniverse(uid);
        const resolved = resolvePersonality(uid, r.slug);
        if (u && resolved) {
          badges.push({ emoji: resolved.emoji || u.emoji, name: resolved.name, date: r.testedAt });
        }
      }
    }
    // Sort by testedAt desc and take top 3
    badges.sort((a, b) => b.date.localeCompare(a.date));
    setRecentBadges(badges.slice(0, 3));
  }, []);

  return (
    <section className="max-w-2xl mx-auto px-6 pb-8">
      <Link
        href="/card/"
        className="group block rounded-2xl border border-border-subtle hover:border-accent/30 bg-bg-secondary/40 hover:bg-accent-dim transition-all p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🃏</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">我的 WTF Card</p>
            {lit != null && lit > 0 ? (
              <p className="text-xs text-text-muted">
                已点亮 {lit} / {total} 个宇宙 · {lit < total ? '继续收集' : '🎉 全部点亮'}
              </p>
            ) : (
              <p className="text-xs text-text-muted">
                集齐所有宇宙测试，解锁你的多面人格卡
              </p>
            )}
          </div>
          <svg className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Mini progress bar */}
        {lit != null && lit > 0 && (
          <div className="mb-3">
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(lit / total) * 100}%`,
                  background: 'linear-gradient(90deg, #ff4d6d, #e06088)',
                }}
              />
            </div>
          </div>
        )}

        {/* Recent badges preview */}
        {recentBadges.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {recentBadges.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-elevated text-xs"
              >
                <span>{b.emoji}</span>
                <span className="text-text-secondary font-medium">{b.name}</span>
              </span>
            ))}
            {lit != null && lit > recentBadges.length && (
              <span className="text-[11px] text-text-muted">
                +{lit - recentBadges.length} 更多
              </span>
            )}
          </div>
        )}
      </Link>
    </section>
  );
}
