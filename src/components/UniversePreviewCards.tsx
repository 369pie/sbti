'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loadCard, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';

/**
 * Teaser copy for each universe — shown on result pages to lure users
 * into testing another universe they haven't tried yet.
 */
const UNIVERSE_TEASERS: Record<string, string> = {
  standard: '你的人格基线是什么？',
  xiuxian: '你在修仙宇宙是什么体质？',
  wtfti: '毒舌版会怎么骂你？',
  banti: '你在办公室是什么角色？',
  kings: '你在峡谷是什么英雄？',
  bird: '你是什么鸟？',
  flower: '你像哪朵花？',
  delta: '你在战场是什么人设？',
  soulti: '向内看见你是什么？',
  xpti: '你的靠近方式是什么？',
};

interface Props {
  /** Current universe ID — will be excluded from recommendations */
  currentUniverse: string;
  /** Max number of preview cards to show */
  max?: number;
  /** Optional visual variant for universe-specific pages */
  variant?: 'default' | 'xpti';
}

/**
 * Shows 2-3 untested universe preview cards on result pages.
 * Reads localStorage to find which universes the user hasn't tested yet,
 * then shows the most enticing ones with themed styling.
 * Falls back to random universes if all are tested.
 */
export function UniversePreviewCards({ currentUniverse, max = 3, variant = 'default' }: Props) {
  const [cards, setCards] = useState<string[]>([]);
  const isXpti = variant === 'xpti';

  useEffect(() => {
    const card = loadCard();
    const tested = new Set<string>();
    if (card) {
      for (const uid of CARD_UNIVERSE_IDS) {
        if (card.results[uid]) tested.add(uid);
      }
    }

    // Get untested universes (excluding current)
    let candidates = CARD_UNIVERSE_IDS.filter(
      uid => uid !== currentUniverse && !tested.has(uid)
    );

    // If all tested, show random others (excluding current) as "see your result"
    if (candidates.length === 0) {
      candidates = CARD_UNIVERSE_IDS.filter(uid => uid !== currentUniverse);
    }

    // Shuffle and pick top N
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    setCards(candidates.slice(0, max));
  }, [currentUniverse, max]);

  if (cards.length === 0) return null;

  return (
    <section className="max-w-2xl mx-auto px-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className={`text-sm font-mono tracking-wider uppercase text-center mb-4 ${isXpti ? 'text-[#A38A90]' : 'text-text-muted'}`}>
          解锁更多宇宙
        </h2>
        <div className="grid gap-3">
          {cards.map((uid, i) => {
            const u = getUniverse(uid);
            if (!u) return null;
            const teaser = UNIVERSE_TEASERS[uid] ?? `去${u.name}看看`;

            return (
              <motion.div
                key={uid}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.35 }}
              >
                <Link
                  href={u.testPath}
                  className="group flex items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md"
                  style={{
                    borderColor: isXpti ? `${u.accent}35` : `${u.accent}25`,
                    background: isXpti ? `linear-gradient(140deg, ${u.accent}10 0%, rgba(26,12,17,0.92) 65%)` : `${u.accent}06`,
                  }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${u.accent}12` }}
                  >
                    {u.emoji || '✨'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold group-hover:brightness-110 transition-colors"
                      style={{ color: u.accent }}
                    >
                      {teaser}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {u.name}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
