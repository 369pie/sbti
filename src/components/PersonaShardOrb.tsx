'use client';

/**
 * PersonaShardOrb — a "living" circular shard that represents a user's
 * personality in one universe. Breathes, reveals a daily line on tap,
 * and visually differentiates by stage (dormant / awake / resonant)
 * and mood (calm / spark / shadow).
 *
 * Props-only: consumers use useShardState() to pass derived props. This keeps
 * the component pure and SSR-safe.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import type { ShardState } from '@/lib/persona-shard';

interface Props {
  state: ShardState;
  /** Accent colour — typically the universe or personality colour */
  accent: string;
  /** Emoji or short symbol shown at the orb centre */
  symbol?: string;
  /** Size in px (orb diameter) */
  size?: number;
  /** Called when the orb is tapped */
  onTap?: () => void;
  /** Whether the flavour line is shown initially (true after first hydration) */
  showLineInitially?: boolean;
  className?: string;
}

export function PersonaShardOrb({
  state,
  accent,
  symbol = '✦',
  size = 180,
  onTap,
  showLineInitially = true,
  className = '',
}: Props) {
  const [open, setOpen] = useState(showLineInitially);
  const { visual, stage, mood, traits, line, thisTested } = state;

  const handleTap = useCallback(() => {
    setOpen(v => !v);
    onTap?.();
  }, [onTap]);

  // Colour lanes (tuned per stage)
  const core = accent;
  const glow = `${accent}${stage === 'resonant' ? 'AA' : stage === 'awake' ? '77' : '33'}`;
  const ring = `${accent}${stage === 'resonant' ? '55' : '22'}`;

  const breatheKey = `${traits.voice}-${mood}`;

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* ── Orb ── */}
      <motion.button
        type="button"
        onClick={handleTap}
        className="relative focus:outline-none"
        style={{ width: size, height: size }}
        whileTap={{ scale: 0.96 }}
        aria-label={`人格碎片：${traits.keywords.join('·')}，状态 ${visual.stageLabel}，心绪 ${visual.moodLabel}`}
      >
        {/* Outer halo (only resonant) */}
        {visual.halo && (
          <motion.div
            key={`halo-${breatheKey}`}
            className="absolute inset-[-18%] rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${ring} 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: visual.breatheSeconds * 1.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Sparkles (spark mood only) */}
        {visual.sparkle && (
          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2, 3].map(i => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: core,
                  top: `${20 + (i * 17) % 60}%`,
                  left: `${15 + (i * 23) % 70}%`,
                }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}

        {/* Core orb — breathing */}
        <motion.div
          key={`core-${breatheKey}`}
          className="absolute inset-[12%] rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${core} 0%, ${core}CC 40%, ${core}55 75%, transparent 100%)`,
            boxShadow: `0 0 ${visual.glowRadius}px ${glow}, inset 0 0 ${visual.glowRadius / 2}px ${glow}`,
            opacity: visual.opacity,
          }}
          animate={{ scale: [1, 1 + traits.aura * 0.1, 1] }}
          transition={{ duration: visual.breatheSeconds, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Symbol centre */}
        <div
          className="absolute inset-0 flex items-center justify-center text-3xl select-none pointer-events-none"
          style={{
            color: stage === 'dormant' ? `${core}88` : '#fff',
            textShadow: stage === 'dormant' ? 'none' : `0 0 12px ${core}`,
            fontSize: size * 0.28,
          }}
        >
          {symbol}
        </div>

        {/* Stage ring (resonant gets a subtle stroke) */}
        {stage === 'resonant' && (
          <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke={core}
              strokeWidth="0.6"
              strokeDasharray="2 4"
              opacity="0.5"
            />
          </svg>
        )}
      </motion.button>

      {/* ── Labels row ── */}
      <div className="mt-3 flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase">
        <span className="text-text-muted">{visual.stageLabel}</span>
        <span className="w-1 h-1 rounded-full bg-text-muted/40" />
        <span style={{ color: core }}>{visual.moodLabel}</span>
        <span className="w-1 h-1 rounded-full bg-text-muted/40" />
        <span className="text-text-muted">{traits.voice}</span>
      </div>

      {/* ── Keywords ── */}
      <div className="mt-2 flex flex-wrap gap-1.5 justify-center max-w-[240px]">
        {traits.keywords.map(kw => (
          <span
            key={kw}
            className="text-[11px] px-2 py-0.5 rounded-full border"
            style={{
              borderColor: `${core}33`,
              background: `${core}0d`,
              color: core,
            }}
          >
            {kw}
          </span>
        ))}
      </div>

      {/* ── Daily flavor line ── */}
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key={line.line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="mt-4 max-w-[280px] text-center px-4 py-3 rounded-2xl"
            style={{
              background: `linear-gradient(180deg, ${core}10, transparent)`,
              border: `1px solid ${core}22`,
            }}
          >
            <p className="text-xs text-text-muted font-mono tracking-wider uppercase mb-1">
              碎片今日说
            </p>
            <p className="text-sm leading-relaxed text-text-primary">
              {thisTested ? line.line : '这枚碎片还没被你唤醒——去测一下这个宇宙，让它亮起来。'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hint ── */}
      {!open && (
        <button
          type="button"
          onClick={handleTap}
          className="mt-3 text-[11px] text-text-muted hover:text-text-primary transition-colors underline-offset-2 hover:underline"
        >
          点碎片听它今天说了什么
        </button>
      )}
    </div>
  );
}
