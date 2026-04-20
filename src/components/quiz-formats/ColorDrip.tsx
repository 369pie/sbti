/**
 * F7 · Color Drip 滴墨
 * 4 个色块漂浮，点选 → 该色滴入水中扩散 1.2s → 整个组件背景被这个色染上。
 */
'use client';

import { useCallback, useState } from 'react';

export interface ColorOption {
  key: string;
  label: string;
  hex: string;
  /** 短描述 */
  blurb?: string;
}

interface Props {
  prompt: string;
  hint?: string;
  options: ColorOption[];
  initial?: string;
  onPick: (key: string) => void;
}

export function ColorDrip({ prompt, hint, options, initial, onPick }: Props) {
  const [picked, setPicked] = useState<string | undefined>(initial);
  const pickedHex = options.find((o) => o.key === picked)?.hex;

  const handle = useCallback(
    (key: string) => {
      setPicked(key);
      if (typeof navigator !== 'undefined') navigator.vibrate?.(6);
      onPick(key);
    },
    [onPick],
  );

  return (
    <fieldset
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 14,
        transition: 'background .9s ease',
        background: pickedHex
          ? `radial-gradient(circle at 50% 60%, ${pickedHex}3a 0%, transparent 70%)`
          : 'transparent',
      }}
    >
      <legend style={{ width: '100%' }}>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 15,
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
          marginTop: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          padding: '12px 8px',
        }}
      >
        {options.map((opt) => {
          const isPicked = picked === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handle(opt.key)}
              aria-pressed={isPicked}
              aria-label={`${opt.label} ${opt.hex}`}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                display: 'grid',
                gap: 6,
                justifyItems: 'center',
                opacity: picked && !isPicked ? 0.45 : 1,
                transform: isPicked ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'opacity .3s, transform .3s',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: opt.hex,
                  boxShadow: isPicked
                    ? `0 0 30px ${opt.hex}cc, 0 0 60px ${opt.hex}66`
                    : `0 4px 14px ${opt.hex}88`,
                  position: 'relative',
                  animation: isPicked ? 'color-ripple 1.2s ease-out' : undefined,
                }}
              />
              <span
                style={{
                  fontSize: 11.5,
                  color: '#F5F0E8',
                  fontFamily: 'Noto Serif SC, serif',
                  textAlign: 'center',
                  fontWeight: isPicked ? 600 : 400,
                  lineHeight: 1.3,
                }}
              >
                {opt.label}
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  color: 'rgba(245,240,232,.45)',
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                }}
              >
                {opt.hex.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {picked ? (
        <p
          style={{
            margin: '6px 0 0',
            textAlign: 'center',
            fontSize: 11.5,
            color: pickedHex,
            fontStyle: 'italic',
            fontFamily: 'Cormorant Garamond, serif',
            letterSpacing: 0.5,
          }}
        >
          {options.find((o) => o.key === picked)?.blurb ?? ''}
        </p>
      ) : null}

      <style>{`
        @keyframes color-ripple {
          0% { transform: scale(.6); filter: blur(0); opacity: 1; }
          60% { transform: scale(1.6); filter: blur(8px); opacity: .35; }
          100% { transform: scale(1); filter: blur(0); opacity: 1; }
        }
      `}</style>
    </fieldset>
  );
}
