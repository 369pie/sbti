'use client';

/**
 * DeityRollCall · §7 ② — 5s 8 主神剪影流过 + 幽默尾句
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §7
 */

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/lib/wtfi/use-ritual-a11y';

const DEITIES: Array<{ glyph: string; name: string }> = [
  { glyph: '☽', name: 'Hecate · 黑曜钟楼' },
  { glyph: '⚜', name: 'Persephone · 暴雨港湾' },
  { glyph: '✦', name: 'Athena · 镀金缝纫机' },
  { glyph: '☉', name: 'Hestia · 沉默灯塔' },
  { glyph: '☾', name: 'Selene · 慢银河' },
  { glyph: '✿', name: 'Aphrodite · 极光客厅' },
  { glyph: '❅', name: 'Calypso · 漂流冰川' },
  { glyph: '⚭', name: 'Venus & Mars · 火星玫瑰园' },
];

interface Props {
  onComplete: () => void;
  durationMs?: number;
}

export function DeityRollCall({ onComplete, durationMs = 5000 }: Props) {
  const reduced = useReducedMotion();
  const realDuration = reduced ? 800 : durationMs;
  const [activeIdx, setActiveIdx] = useState(reduced ? DEITIES.length - 1 : 0);
  const [showPunchline, setShowPunchline] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => onComplete(), realDuration);
      return () => window.clearTimeout(t);
    }
    const perDeity = realDuration * 0.08;
    const timers: number[] = [];
    DEITIES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setActiveIdx(i), perDeity * (i + 1)));
    });
    timers.push(window.setTimeout(() => setShowPunchline(true), realDuration * 0.7));
    timers.push(window.setTimeout(() => onComplete(), realDuration));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [realDuration, onComplete, reduced]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="跳过众神点名"
      onClick={onComplete}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onComplete();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'radial-gradient(ellipse at center, rgba(20,12,60,0.95) 0%, #020010 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.42em',
          color: 'rgba(212,181,138,0.92)',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}
      >
        — Pantheon Roll Call —
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
          gap: 14,
          maxWidth: 360,
          width: '100%',
        }}
      >
        {DEITIES.map((d, i) => {
          const isActive = i === activeIdx;
          const isPast = i < activeIdx;
          return (
            <div
              key={d.glyph + i}
              style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: isActive
                  ? 'radial-gradient(circle, rgba(212,181,138,0.45) 0%, rgba(20,12,60,0) 75%)'
                  : 'rgba(245,240,232,0.04)',
                border: isActive
                  ? '1px solid rgba(212,181,138,0.6)'
                  : '1px solid rgba(245,240,232,0.1)',
                color: isActive
                  ? '#F5F0E8'
                  : isPast
                  ? 'rgba(212,181,138,0.55)'
                  : 'rgba(245,240,232,0.25)',
                fontSize: 24,
                transition: 'all 240ms ease',
                transform: isActive ? 'scale(1.18)' : 'scale(1)',
              }}
            >
              {d.glyph}
            </div>
          );
        })}
      </div>
      <p
        style={{
          marginTop: 26,
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(245,240,232,0.92)',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          minHeight: 22,
          textAlign: 'center',
          letterSpacing: '0.04em',
          textShadow: '0 0 18px rgba(2,0,16,0.95)',
        }}
      >
        {DEITIES[activeIdx]?.name}
      </p>
      {showPunchline && (
        <p
          style={{
            marginTop: 24,
            fontSize: 16,
            color: '#F5F0E8',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: 360,
            opacity: 1,
            textShadow: '0 0 20px rgba(2,0,16,0.95)',
          }}
        >
          ✦ 今天 — 哪一位会认领你？
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
