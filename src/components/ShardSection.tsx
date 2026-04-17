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

  return (
    <section className="max-w-2xl mx-auto px-6 pb-8 pt-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div
          className={`rounded-3xl border px-6 py-8 ${
            isXpti ? 'border-[#A3526E]/20 bg-[#1A0C11]' : 'border-border-subtle bg-bg-secondary/30'
          }`}
        >
          <p className={`text-[11px] font-mono tracking-[0.3em] uppercase text-center mb-1 ${isXpti ? 'text-[#A38A90]' : 'text-text-muted'}`}>
            Persona Shard
          </p>
          <p className={`text-xs text-center mb-6 ${isXpti ? 'text-[#A38A90]/70' : 'text-text-muted/70'}`}>
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
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
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
