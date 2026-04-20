'use client';

/**
 * BigBangIntro · §7 ① — 3s 黑屏奇点爆炸 + 主神召唤词
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §7
 */

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/lib/wtfi/use-ritual-a11y';

interface Props {
  onComplete: () => void;
  /** 总时长，默认 3000ms */
  durationMs?: number;
}

export function BigBangIntro({ onComplete, durationMs = 3000 }: Props) {
  const reduced = useReducedMotion();
  const realDuration = reduced ? 600 : durationMs;
  const [stage, setStage] = useState<0 | 1 | 2>(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => onComplete(), realDuration);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setStage(1), realDuration * 0.18);
    const t2 = window.setTimeout(() => setStage(2), realDuration * 0.55);
    const t3 = window.setTimeout(() => onComplete(), realDuration);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [realDuration, onComplete, reduced]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="跳过仪式开场"
      onClick={onComplete}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onComplete();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020010',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: stage === 0 ? 4 : stage === 1 ? 320 : 1200,
          height: stage === 0 ? 4 : stage === 1 ? 320 : 1200,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(212,181,138,0.85) 0%, rgba(192,122,142,0.5) 35%, rgba(156,124,255,0.18) 60%, rgba(2,0,16,0) 100%)',
          opacity: stage === 2 ? 0.32 : 1,
          transition: 'all 1100ms cubic-bezier(.2,.7,.2,1)',
          filter: 'blur(4px)',
        }}
      />
      {stage >= 1 && (
        <p
          style={{
            position: 'relative',
            margin: 0,
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            color: '#F5F0E8',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textAlign: 'center',
            opacity: 1,
            transform: stage === 1 ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'transform 800ms ease',
            textShadow:
              '0 0 30px rgba(2,0,16,0.95), 0 0 12px rgba(2,0,16,0.95), 0 0 6px rgba(2,0,16,1)',
            padding: '0 24px',
          }}
        >
          众神在听 — <br />
          ✦ 一颗灵魂正在被点燃 ✦
        </p>
      )}
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
