'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import type { PersonalityType } from '@/lib/personalities';
import { getTypeImage } from '@/lib/personalities';

interface Props {
  personality: PersonalityType;
  index?: number;
  compact?: boolean;
}

export function PersonalityCard({ personality, index = 0, compact = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link
        href={`/result/${personality.slug}`}
        className="group block rounded-2xl border border-border-subtle hover:border-border bg-bg-secondary/40 hover:bg-bg-secondary/80 transition-all duration-300 overflow-hidden"
      >
        {/* Image area — large, centered */}
        <div
          className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${personality.color}08, ${personality.color}15)` }}
        >
          <NextImage
            src={getTypeImage(personality.slug)}
            alt={personality.name}
            width={280}
            height={280}
            className="w-[75%] h-[75%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
          {personality.isSpecial && (
            <span className="absolute top-3 right-3 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-accent-dim text-accent backdrop-blur-sm">
              特殊
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-4 py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0">
              <span
                className="text-[11px] font-mono tracking-widest block mb-0.5"
                style={{ color: personality.color }}
              >
                {personality.code}
              </span>
              <h3 className="text-base font-medium text-text-primary group-hover:text-white transition-colors truncate">
                {personality.name}
              </h3>
            </div>
            <svg
              className="w-4 h-4 flex-shrink-0 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {!compact && (
            <p className="text-xs text-text-muted leading-relaxed line-clamp-1 mt-1">
              {personality.tagline}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
