'use client';

/**
 * SoulTI Tonight's Small Action — 今晚的小动作
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E9)
 *
 * One concrete action keyed by personality + tear level. Free, no paywall.
 * Designed as the user's first "completable thing" after reading the report —
 * builds the habit that SoulTI is not just description, but next-step.
 */

import { motion } from 'framer-motion';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { pickTonightAction } from '@/lib/soulti/tonight-actions';

interface Props {
  personality: Pick<SoultiPersonalityType, 'code' | 'slug' | 'color'>;
  tearLevel?: 'aligned' | 'partial' | 'split' | 'extreme';
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

export function SoultiTonightAction({ personality, tearLevel }: Props) {
  const action = pickTonightAction(personality, tearLevel);
  const accent = personality.color;

  return (
    <motion.section
      className="max-w-2xl mx-auto px-6 pb-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.32 }}
      aria-label="今晚的小动作"
    >
      <div
        data-soulti-surface="cream"
        className="rounded-2xl border p-6 sm:p-7"
        style={{ borderColor: `${accent}22`, background: 'var(--color-bg-secondary)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ fontFamily: serifFont, color: accent }}
          >
            TONIGHT · 今晚的小动作
          </p>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border"
            style={{
              borderColor: `${accent}30`,
              color: accent,
              background: `${accent}08`,
              fontFamily: serifFont,
            }}
          >
            {action.tag}
          </span>
        </div>
        <p
          className="text-base leading-[1.9] mb-3"
          style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}
        >
          {action.instruction}
        </p>
        <p
          className="text-[12px] leading-[1.9]"
          style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}
        >
          {action.reason}
        </p>
        <p
          className="mt-5 text-[10px] tracking-[0.2em]"
          style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}
        >
          · 不是治疗，只是一件你今晚可以做的小事 ·
        </p>
      </div>
    </motion.section>
  );
}
