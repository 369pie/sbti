/**
 * C1 · Sanctum Gate 神殿之门
 * 双手按 1.5s 解锁 + 金线一笔写出 "WTFTI"。
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useHaptic } from '@/lib/wtfi/use-ritual-a11y';

interface Props {
  /** 解锁完成回调 */
  onUnlock: () => void;
  /** 解锁所需毫秒，默认 800 */
  holdMs?: number;
  /** 门内的诗句 */
  invocation?: string;
}

export function SanctumGate({
  onUnlock,
  holdMs = 800,
  invocation = '请双手按住屏幕，让神殿认出你的频率。',
}: Props) {
  const haptic = useHaptic();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const startedRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdMsRef = useRef(holdMs);
  const onUnlockRef = useRef(onUnlock);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    holdMsRef.current = holdMs;
    onUnlockRef.current = onUnlock;
  }, [holdMs, onUnlock]);

  useEffect(() => {
    const tick = () => {
      if (!startedRef.current) return;
      const elapsed = performance.now() - startedRef.current;
      const p = Math.min(1, elapsed / holdMsRef.current);
      setProgress(p);
      if (p >= 1) {
        setUnlocked(true);
        haptic('pulse');
        window.setTimeout(() => onUnlockRef.current(), 1100);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick;
  }, [haptic]);

  const handleDown = useCallback(() => {
    if (unlocked) return;
    setPressing(true);
    startedRef.current = performance.now();
    rafRef.current = requestAnimationFrame(() => tickRef.current());
  }, [unlocked]);

  const handleUp = useCallback(() => {
    if (unlocked) return;
    setPressing(false);
    startedRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }, [unlocked]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <section
      role="button"
      aria-label="按住进入神殿"
      tabIndex={0}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
      onPointerCancel={handleUp}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleDown();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleUp();
        }
      }}
      style={{
        position: 'relative',
        minHeight: 420,
        borderRadius: 20,
        padding: '48px 24px',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(60,40,110,.7) 0%, rgba(20,12,40,.95) 60%, #06030f 100%)',
        border: '1px solid rgba(201,166,118,.25)',
        cursor: unlocked ? 'default' : 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 双门扇 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,.65) 0%, rgba(20,12,40,.0) 100%)',
            transform: unlocked ? 'translateX(-100%)' : `translateX(${-progress * 22}%)`,
            transition: 'transform 1s cubic-bezier(.22,1,.36,1)',
            borderRight: '1px solid rgba(201,166,118,.18)',
          }}
        />
        <div
          style={{
            background:
              'linear-gradient(270deg, rgba(0,0,0,.65) 0%, rgba(20,12,40,.0) 100%)',
            transform: unlocked ? 'translateX(100%)' : `translateX(${progress * 22}%)`,
            transition: 'transform 1s cubic-bezier(.22,1,.36,1)',
            borderLeft: '1px solid rgba(201,166,118,.18)',
          }}
        />
      </div>

      {/* 金线写字 */}
      <svg
        viewBox="0 0 200 60"
        width="220"
        aria-hidden
        style={{ position: 'relative', zIndex: 2 }}
      >
        <defs>
          <linearGradient id="goldStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#C9A676" />
            <stop offset="50%" stopColor="#F5E1B4" />
            <stop offset="100%" stopColor="#C9A676" />
          </linearGradient>
        </defs>
        <text
          x="100"
          y="40"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Noto Serif SC, serif"
          fontStyle="italic"
          fontSize="34"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.8"
          strokeDasharray="280"
          strokeDashoffset={Math.max(0, 280 - progress * 280)}
          style={{ transition: 'stroke-dashoffset .15s linear' }}
        >
          WTFTI
        </text>
      </svg>

      <p
        style={{
          position: 'relative',
          marginTop: 28,
          maxWidth: 320,
          textAlign: 'center',
          fontSize: 13.5,
          color: 'rgba(245,240,232,.78)',
          fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          fontStyle: 'italic',
          lineHeight: 1.7,
          zIndex: 2,
        }}
      >
        {unlocked ? '✦ 门已开启…' : invocation}
      </p>

      <p
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 9.5,
          letterSpacing: 5,
          color: pressing ? '#C9A676' : 'rgba(245,240,232,.4)',
          textTransform: 'uppercase',
          zIndex: 2,
        }}
      >
        {unlocked
          ? '✦ Sanctum Open'
          : pressing
          ? `Hold · ${Math.round(progress * 100)}%`
          : '✦ Press & Hold to enter'}
      </p>
    </section>
  );
}
