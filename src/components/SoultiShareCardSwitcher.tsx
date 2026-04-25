'use client';

/**
 * SoulTI Share Card Switcher · 日/夜版分享卡切换
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E3)
 *
 * Renders two 9:16 share cards (day/night) and a small toggle. Defaults to
 * the night variant when the user is currently in night-mode hours
 * (22:00–06:00 local), otherwise day. Persists user choice for the session
 * via sessionStorage so a screenshot session feels coherent.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { SoultiPortraitShareCard } from './SoultiPortraitShareCard';
import { SoultiNightShareCard } from './SoultiNightShareCard';

interface Props {
  personality: SoultiPersonalityType;
  tearRate?: number;
  daySelfName?: string;
  nightSelfName?: string;
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const STORAGE_KEY = 'soulti-share-variant';

export function SoultiShareCardSwitcher({
  personality,
  tearRate,
  daySelfName,
  nightSelfName,
}: Props) {
  // Use 'day' by default for SSR consistency
  const [variant, setVariantState] = useState<'day' | 'night'>('day');

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'day' || stored === 'night') {
      setVariantState(stored);
      return;
    }
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      setVariantState('night');
    }
  }, []);

  const setVariant = (v: 'day' | 'night') => {
    setVariantState(v);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, v);
    }
  };

  const accent = personality.color;
  const canShowNight =
    typeof tearRate === 'number' && Number.isFinite(tearRate) && tearRate >= 0;

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-1 mb-5">
        <div
          className="inline-flex p-1 rounded-full"
          role="tablist"
          aria-label="选择分享卡风格"
          style={{
            background: 'var(--color-bg-secondary)',
            border: `1px solid ${accent}20`,
          }}
        >
          {(
            [
              { id: 'day', label: '日 · Day' },
              { id: 'night', label: '夜 · Night' },
            ] as const
          ).map((opt) => {
            const active = variant === opt.id;
            const disabled = opt.id === 'night' && !canShowNight;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => setVariant(opt.id)}
                className="px-4 py-1.5 rounded-full text-[11px] tracking-[0.18em] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: serifFont,
                  background: active ? '#fff' : 'transparent',
                  color: active ? accent : '#7A6A5A',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <motion.div
        key={variant}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {variant === 'night' && canShowNight ? (
          <SoultiNightShareCard
            personality={personality}
            tearRate={tearRate as number}
            daySelfName={daySelfName}
            nightSelfName={nightSelfName}
          />
        ) : (
          <SoultiPortraitShareCard personality={personality} tearRate={tearRate} />
        )}
      </motion.div>
    </div>
  );
}
