'use client';

/**
 * ShardSection — client-only wrapper around the Persona Shard orb.
 *
 * Loaded via next/dynamic(ssr: false) so it never runs during static generation.
 * This keeps the rest of the result page prerenderable and avoids any
 * SSR-only edge cases in useSyncExternalStore / localStorage probing.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { PersonaShardOrb } from './PersonaShardOrb';
import { useShardState, recordCardVisit } from '@/lib/persona-shard';

interface Props {
  currentUniverse: string;
  personalitySlug: string;
  personalityName: string;
  accent: string;
  isXpti?: boolean;
}

export default function ShardSection({
  currentUniverse,
  personalitySlug,
  personalityName,
  accent,
  isXpti,
}: Props) {
  useEffect(() => {
    recordCardVisit();
  }, []);

  const shardState = useShardState(currentUniverse, personalitySlug);

  // `isXpti` kept for API compatibility — visual differentiation is now handled
  // by the shared editorial paper vocabulary so the section reads as part of
  // the same museum spread as the rest of the result page.
  void isXpti;

  return (
    <section className="max-w-2xl mx-auto px-6 pb-8 pt-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated shadow-sm px-6 py-9">
          <div
            aria-hidden
            className="mx-auto mb-5 h-px w-12"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-leaf, #C9A676), transparent)' }}
          />
          <p
            className="text-[11px] font-mono tracking-[0.32em] uppercase text-center mb-1.5"
            style={{ color: 'var(--color-gold, #B8905A)' }}
          >
            Persona Shard · 人格碎片
          </p>
          <p className="text-xs text-text-secondary text-center mb-6 italic">
            {personalityName} 在这个宇宙的碎片
          </p>
          <PersonaShardOrb
            state={shardState}
            accent={accent}
            symbol="✦"
            size={180}
          />
          <div className="mt-6 text-center">
            <Link
              href={`/card/shard/?universe=${encodeURIComponent(currentUniverse)}&slug=${encodeURIComponent(personalitySlug)}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:brightness-110"
              style={{ color: accent }}
            >
              查看这枚碎片的完整档案
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
