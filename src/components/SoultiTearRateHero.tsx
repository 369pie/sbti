'use client';

/**
 * SoulTI Tear Rate Hero — 撕裂度首屏组件
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E1)
 *
 * Renders an above-the-fold, screenshot-optimized tear rate display:
 *   - Big number (the hook)
 *   - One-line label
 *   - One-line "白天 X / 深夜 Y" diagnosis
 *   - Soft narrative (never clinical)
 *
 * Used at the very top of the result page, before Three Mirrors.
 * Designed to be the first thing a user sees → the thing they screenshot
 * for Xiaohongshu / WeChat groups.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SoultiLayeredResult } from '@/lib/soulti/scoring';
import { calculateTearRate } from '@/lib/soulti/scoring';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_NAMES } from '@/lib/soulti/dimensions';
import { getSoultiPersonalityBySlug } from '@/lib/soulti/personalities';

interface Props {
  layered: SoultiLayeredResult;
  /** Optional accent override; falls back to tear-level-based color */
  accent?: string;
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

export function SoultiTearRateHero({ layered, accent }: Props) {
  const tear = useMemo(() => calculateTearRate(layered), [layered]);

  const dayP = getSoultiPersonalityBySlug(layered.daySelf.slug);
  const nightP = getSoultiPersonalityBySlug(layered.nightSelf.slug);

  const ringColor =
    accent ??
    (tear.level === 'aligned'
      ? '#5b8a72'
      : tear.level === 'partial'
        ? '#8b7355'
        : tear.level === 'split'
          ? '#b07850'
          : '#7a6b8a');

  const circ = 2 * Math.PI * 56;
  const offset = circ * (1 - tear.percent / 100);

  const divergentNames = tear.divergentAxes
    .map((id) => {
      const dim = SOULTI_DIMENSIONS.find((d) => d.id === id);
      return dim ? SOULTI_MODEL_NAMES[dim.model] : null;
    })
    .filter(Boolean)
    .join(' × ');

  return (
    <motion.section
      className="max-w-2xl mx-auto px-6 pt-6 pb-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      aria-label="撕裂度 · Tear Rate"
    >
      <div
        className="relative rounded-3xl border overflow-hidden"
        style={{
          borderColor: `${ringColor}25`,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(253,252,250,0.95) 60%, #FDFCFA 100%)',
          boxShadow: `0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 40px ${ringColor}10`,
        }}
      >
        {/* Subtle backdrop pulse */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `radial-gradient(60% 50% at 50% 0%, ${ringColor}10 0%, transparent 70%)`,
          }}
        />

        <div className="relative px-6 sm:px-8 pt-7 pb-6 sm:pb-8 text-center">
          <p
            className="text-[10px] tracking-[0.4em] uppercase mb-1"
            style={{ fontFamily: serifFont, color: ringColor, opacity: 0.85 }}
          >
            TEAR RATE · 撕裂度
          </p>
          <p
            className="text-[11px] tracking-[0.18em] mb-5"
            style={{ fontFamily: serifFont, color: '#8a7f72' }}
          >
            白天的你 与 深夜的你 · 之间的距离
          </p>

          {/* Big number ring */}
          <div className="relative inline-block">
            <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden>
              <circle
                cx="74"
                cy="74"
                r="56"
                fill="none"
                stroke="#EDE8E2"
                strokeWidth="5"
              />
              <motion.circle
                cx="74"
                cy="74"
                r="56"
                fill="none"
                stroke={ringColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ delay: 0.25, duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            {/* Number is rendered as DOM text (not <text>) so screenshots render
                with the user's serif fallbacks consistently across browsers */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ color: ringColor }}
            >
              <span
                className="block leading-none"
                style={{
                  fontFamily: serifFont,
                  fontSize: '44px',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                }}
              >
                {tear.percent}
                <span
                  style={{
                    fontSize: '20px',
                    marginLeft: '2px',
                    opacity: 0.7,
                  }}
                >
                  %
                </span>
              </span>
              <span
                className="mt-1 text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: serifFont, opacity: 0.7 }}
              >
                {tear.label}
              </span>
            </div>
          </div>

          {/* Day vs night diagnosis line — the screenshot-able quote */}
          {dayP && nightP && layered.daySelf.slug !== layered.nightSelf.slug && (
            <p
              className="mt-6 text-[15px] sm:text-base leading-[2] max-w-sm mx-auto"
              style={{ fontFamily: serifFont, color: '#2D2A26' }}
            >
              白天你是<span style={{ color: ringColor }}>{dayP.name}</span>，
              <br className="sm:hidden" />
              深夜你变成<span style={{ color: ringColor }}>{nightP.name}</span>。
            </p>
          )}
          {dayP && nightP && layered.daySelf.slug === layered.nightSelf.slug && (
            <p
              className="mt-6 text-[15px] sm:text-base leading-[2] max-w-sm mx-auto"
              style={{ fontFamily: serifFont, color: '#2D2A26' }}
            >
              白天和深夜的你都是<span style={{ color: ringColor }}>{dayP.name}</span>。
              <br />
              这份完整，本身就很珍贵。
            </p>
          )}

          {divergentNames && (
            <p
              className="mt-3 text-[11px] tracking-[0.2em]"
              style={{ fontFamily: serifFont, color: '#8a7f72' }}
            >
              差异最大 · {divergentNames}
            </p>
          )}

          <p
            className="mt-5 text-[13px] leading-[1.95] max-w-md mx-auto"
            style={{ fontFamily: serifFont, color: '#6A6054', fontStyle: 'italic' }}
          >
            {tear.narrative}
          </p>

          {/* Anti-clinical disclaimer — always present, soft */}
          <p
            className="mt-5 text-[10px] tracking-[0.18em]"
            style={{ fontFamily: serifFont, color: '#a89f93' }}
          >
            · 你不是有问题，你是在适应 ·
          </p>
        </div>
      </div>
    </motion.section>
  );
}
