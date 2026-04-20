'use client';

/**
 * SummonOverlay · §7 ⑧ — 4s 屏幕震动 + 暗化 + 「你的暗面正在苏醒」
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §7
 */

import { useEffect, useState } from 'react';

import { useHaptic, useReducedMotion } from '@/lib/wtfi/use-ritual-a11y';

interface Props {
  onComplete: () => void;
  durationMs?: number;
}

export function SummonOverlay({ onComplete, durationMs = 4000 }: Props) {
  const reduced = useReducedMotion();
  const realDuration = reduced ? 800 : durationMs;
  const [shake, setShake] = useState(false);
  const haptic = useHaptic();

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => onComplete(), realDuration);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => {
      setShake(true);
      haptic('summon');
    }, 600);
    const t2 = window.setTimeout(() => onComplete(), realDuration);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [realDuration, onComplete, reduced, haptic]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="跳过暗面召唤"
      onClick={onComplete}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onComplete();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'radial-gradient(ellipse at center, rgba(50,30,90,0.95) 0%, #050010 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        animation: shake ? 'wtfti-shake 0.32s ease-in-out 2' : undefined,
      }}
    >
      <style>{`
        @keyframes wtfti-shake {
          0%   { transform: translateX(0) }
          15%  { transform: translateX(-6px) }
          35%  { transform: translateX(7px) }
          55%  { transform: translateX(-4px) }
          75%  { transform: translateX(3px) }
          100% { transform: translateX(0) }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 30%, rgba(201,182,255,0.5) 0%, rgba(20,12,60,0.85) 65%, rgba(7,5,31,1) 100%)',
          boxShadow: '0 0 60px rgba(156,124,255,0.45), inset -10px -16px 30px rgba(0,0,0,0.6)',
          marginBottom: 24,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.42em',
          color: 'rgba(201,182,255,0.92)',
          textTransform: 'uppercase',
        }}
      >
        — Shadow Awakening —
      </p>
      <p
        style={{
          marginTop: 12,
          fontSize: 22,
          color: '#F5F0E8',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: 320,
          padding: '0 24px',
          textShadow: '0 0 24px rgba(156,124,255,0.5)',
        }}
      >
        你的暗面 — <br />
        正在苏醒…
      </p>
      <p
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 26px)',
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.42em',
          color: 'rgba(245,240,232,0.78)',
          textTransform: 'uppercase',
        }}
      >
        ✦ tap to skip ✦
      </p>
    </div>
  );
}
