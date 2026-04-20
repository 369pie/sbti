/**
 * F1 · Either/Or 双行星
 * 二元对立题。点击一颗行星 → 它放大 + 对方淡出。
 */
'use client';

import { useCallback, useState } from 'react';

export interface PlanetOption {
  key: string;
  label: string;
  /** 简短副描述 */
  blurb?: string;
  /** 单 emoji / glyph 作为行星图样 */
  glyph?: string;
  /** Tailwind-like accent color for this planet */
  accent?: string;
}

interface Props {
  prompt: string;
  hint?: string;
  left: PlanetOption;
  right: PlanetOption;
  initial?: string;
  onPick: (key: string) => void;
}

function vibrate(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate?.(ms);
    } catch {
      // noop
    }
  }
}

export function EitherOrPlanets({ prompt, hint, left, right, initial, onPick }: Props) {
  const [picked, setPicked] = useState<string | undefined>(initial);

  const handle = useCallback(
    (key: string) => {
      setPicked(key);
      vibrate(8);
      onPick(key);
    },
    [onPick],
  );

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ width: '100%' }}>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 16,
            color: '#F5F0E8',
            fontFamily: 'Noto Serif SC, serif',
            lineHeight: 1.55,
          }}
        >
          {prompt}
        </p>
        {hint ? (
          <p
            style={{
              margin: '6px 0 0',
              textAlign: 'center',
              fontSize: 11.5,
              color: 'rgba(245,240,232,.5)',
            }}
          >
            {hint}
          </p>
        ) : null}
      </legend>

      <div
        style={{
          marginTop: 26,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 10,
          minHeight: 220,
        }}
      >
        <Planet side="left" opt={left} picked={picked === left.key} faded={picked === right.key} onPick={handle} />
        <span
          aria-hidden
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 22,
            color: 'rgba(201,166,118,.7)',
            letterSpacing: 2,
          }}
        >
          ⚭
        </span>
        <Planet side="right" opt={right} picked={picked === right.key} faded={picked === left.key} onPick={handle} />
      </div>

      {picked ? (
        <p
          aria-live="polite"
          style={{
            marginTop: 16,
            textAlign: 'center',
            fontSize: 11,
            color: 'rgba(201,166,118,.85)',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          ✦ 已对齐 · {picked === left.key ? left.label : right.label}
        </p>
      ) : null}
    </fieldset>
  );
}

function Planet({
  side,
  opt,
  picked,
  faded,
  onPick,
}: {
  side: 'left' | 'right';
  opt: PlanetOption;
  picked: boolean;
  faded: boolean;
  onPick: (key: string) => void;
}) {
  const accent = opt.accent ?? (side === 'left' ? '#C07A8E' : '#9C7CFF');
  return (
    <button
      type="button"
      onClick={() => onPick(opt.key)}
      aria-pressed={picked}
      style={{
        appearance: 'none',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: faded ? 0.32 : 1,
        transform: picked ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform .55s cubic-bezier(.22,1,.36,1), opacity .35s',
      }}
    >
      <span
        aria-hidden
        style={{
          width: picked ? 124 : 108,
          height: picked ? 124 : 108,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: picked ? 44 : 38,
          color: '#F5F0E8',
          background: `radial-gradient(circle at 35% 30%, ${accent}cc 0%, ${accent}55 38%, rgba(8,5,18,1) 80%)`,
          boxShadow: picked
            ? `0 0 36px ${accent}aa, 0 0 80px ${accent}55, inset 0 0 18px rgba(0,0,0,.5)`
            : `0 0 18px ${accent}55, inset 0 0 14px rgba(0,0,0,.45)`,
          transition: 'all .5s cubic-bezier(.22,1,.36,1)',
          fontFamily: 'Cormorant Garamond, serif',
        }}
      >
        {opt.glyph ?? '✦'}
      </span>
      <span
        style={{
          fontSize: 13,
          color: picked ? '#F5F0E8' : 'rgba(245,240,232,.78)',
          fontWeight: picked ? 600 : 400,
          letterSpacing: 1,
          fontFamily: 'Noto Serif SC, serif',
        }}
      >
        {opt.label}
      </span>
      {opt.blurb ? (
        <span
          style={{
            fontSize: 11,
            color: 'rgba(245,240,232,.5)',
            maxWidth: 130,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {opt.blurb}
        </span>
      ) : null}
    </button>
  );
}
