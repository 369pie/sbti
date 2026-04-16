'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loadCard, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';

interface Props {
  /** Currently active universe (to highlight) */
  currentUniverseId?: string;
}

/**
 * Compact "你已解锁 X/N 个宇宙" progress bar for result pages.
 * Shows universe icons in a scrollable row with lit/unlit states.
 */
export function UniverseProgressBar({ currentUniverseId }: Props) {
  const [lit, setLit] = useState(0);
  const [universeStates, setUniverseStates] = useState<
    { id: string; emoji: string; shortName: string; isLit: boolean; testPath: string; resultPath: string | null }[]
  >([]);

  const total = CARD_UNIVERSE_IDS.length;

  useEffect(() => {
    const card = loadCard();
    let litCount = 0;
    const states = CARD_UNIVERSE_IDS.map(uid => {
      const u = getUniverse(uid);
      const result = card?.results[uid];
      const resolved = result?.slug ? resolvePersonality(uid, result.slug) : null;
      const isLit = !!resolved;
      if (isLit) litCount++;
      return {
        id: uid,
        emoji: u?.emoji || '❓',
        shortName: u?.shortName || uid,
        isLit,
        testPath: u?.testPath || '/test/',
        resultPath: result?.slug && u ? `${u.resultPrefix}/result/${result.slug}/` : null,
      };
    });
    setLit(litCount);
    setUniverseStates(states);
  }, []);

  if (universeStates.length === 0) return null;

  const pct = total > 0 ? (lit / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="max-w-2xl mx-auto px-6 pb-8"
    >
      <Link
        href="/card/"
        className="group block rounded-2xl border border-border-subtle bg-bg-secondary/40 hover:bg-accent-dim hover:border-accent/20 transition-all p-4"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🃏</span>
            <span className="text-xs font-semibold text-text-primary">
              人格衣橱
            </span>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {lit} / {total} 个宇宙
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #ff4d6d, #e06088, #a855f7)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Universe icon row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {universeStates.map(u => {
            const isCurrent = u.id === currentUniverseId;
            return (
              <div
                key={u.id}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                  u.isLit
                    ? isCurrent
                      ? 'bg-accent/20 ring-1 ring-accent/40 scale-110'
                      : 'bg-bg-elevated'
                    : 'bg-bg-tertiary/50 opacity-40'
                }`}
                title={u.isLit ? `${u.shortName} ✓` : `${u.shortName} — 未测试`}
              >
                {u.isLit ? u.emoji : '?'}
              </div>
            );
          })}
        </div>

        {/* Subtitle */}
        <p className="text-[10px] text-text-muted mt-2 text-center group-hover:text-accent/80 transition-colors">
          {lit === 0 && '开始探索你的多面人格 →'}
          {lit > 0 && lit < total && `还有 ${total - lit} 个宇宙等你解锁 →`}
          {lit === total && '🎉 已集齐所有宇宙！查看你的图鉴 →'}
        </p>
      </Link>
    </motion.div>
  );
}
