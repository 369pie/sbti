'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { loadCard, getLitCount, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';

const emptySubscribe = () => () => {};

export function WtfCardBanner() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [lit, setLit] = useState(0);
  const [badges, setBadges] = useState<{ emoji: string; shortName: string }[]>([]);
  const total = CARD_UNIVERSE_IDS.length;

  useEffect(() => {
    if (!mounted) return;
    const card = loadCard();
    if (card) {
      setLit(getLitCount(card));
      // Collect lit badge emojis for visual display
      const b: { emoji: string; shortName: string }[] = [];
      for (const uid of CARD_UNIVERSE_IDS) {
        const r = card.results[uid];
        if (r) {
          const u = getUniverse(uid);
          const resolved = resolvePersonality(uid, r.slug);
          if (u) b.push({ emoji: resolved?.emoji || u.emoji, shortName: u.shortName });
        }
      }
      setBadges(b);
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section className="px-6 pb-4 pt-2">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/card/"
          className="group block rounded-2xl border border-border-subtle bg-bg-elevated hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl flex-shrink-0">🃏</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary text-base mb-1">
                  WTF Card — 你的多宇宙人格卡
                </h3>
                {lit > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden max-w-[160px]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(lit / total) * 100}%`,
                          background: 'linear-gradient(90deg, #ff4d6d, #e06088)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      已点亮 {lit}/{total} 个宇宙
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    集齐 {total} 个宇宙人格，解锁你的完整 WTF Card
                  </p>
                )}
              </div>
              <svg className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Mini badge strip */}
            {badges.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3 ml-14">
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-secondary text-sm"
                    title={b.shortName}
                  >
                    {b.emoji}
                  </span>
                ))}
                {lit < total && (
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg border border-dashed border-border text-xs text-text-muted">
                    +{total - lit}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
