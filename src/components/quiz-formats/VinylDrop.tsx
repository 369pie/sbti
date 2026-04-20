/**
 * F6 · Vinyl Drop 唱片
 * 4 张黑胶唱片，把唱针拖到一张上 → 静态封面 + 频谱 → 选择。
 * 简化交互：点击一张唱片 → 它"开始旋转"3s + 显示选项；可以再换。
 */
'use client';

import { useCallback, useState } from 'react';

export interface VinylOption {
  key: string;
  /** 唱片名 */
  label: string;
  /** 副描述 / 艺术家 */
  blurb?: string;
  /** 中央 glyph / emoji */
  centerGlyph?: string;
  /** 唱片颜色 */
  accent?: string;
}

interface Props {
  prompt: string;
  hint?: string;
  options: VinylOption[];
  initial?: string;
  onPick: (key: string) => void;
  /** When provided, each disc shows a ⏵ button that triggers preview audio without selecting. */
  onPreview?: (key: string) => void;
  /** Currently-playing preview key (for showing ◼ stop state). */
  playingKey?: string | null;
}

export function VinylDrop({
  prompt,
  hint,
  options,
  initial,
  onPick,
  onPreview,
  playingKey,
}: Props) {
  const [picked, setPicked] = useState<string | undefined>(initial);
  const [hovering, setHovering] = useState<string | null>(null);

  const handle = useCallback(
    (key: string) => {
      setPicked(key);
      if (typeof navigator !== 'undefined') navigator.vibrate?.([4, 20, 8]);
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
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          justifyItems: 'center',
        }}
      >
        {options.map((opt) => {
          const isPicked = picked === opt.key;
          const isHover = hovering === opt.key;
          const accent = opt.accent ?? '#C07A8E';
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handle(opt.key)}
              onMouseEnter={() => setHovering(opt.key)}
              onMouseLeave={() => setHovering(null)}
              aria-pressed={isPicked}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                display: 'grid',
                gap: 8,
                justifyItems: 'center',
                opacity: picked && !isPicked ? 0.45 : 1,
                transition: 'opacity .35s',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'relative',
                  width: 124,
                  height: 124,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at center, #1a1530 0%, #0a0816 60%, #000 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow:
                    isPicked || isHover
                      ? `0 0 24px ${accent}88, 0 12px 30px rgba(0,0,0,.55)`
                      : '0 8px 22px rgba(0,0,0,.5)',
                  animation: isPicked ? 'vinyl-spin 2.4s linear infinite' : undefined,
                }}
              >
                {/* concentric grooves */}
                {[44, 56, 68].map((r) => (
                  <span
                    key={r}
                    aria-hidden
                    style={{
                      position: 'absolute',
                      width: r,
                      height: r,
                      borderRadius: '50%',
                      border: '1px solid rgba(245,240,232,.06)',
                    }}
                  />
                ))}
                {/* center label */}
                <span
                  style={{
                    position: 'absolute',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: accent,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#F5F0E8',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    fontSize: 16,
                    boxShadow: `0 0 8px ${accent}`,
                  }}
                >
                  {opt.centerGlyph ?? '♫'}
                </span>
                {/* tonearm hint when hovering */}
                {isHover && !isPicked ? (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -10,
                      width: 60,
                      height: 4,
                      background: 'linear-gradient(90deg, #C9A676 0%, transparent 100%)',
                      transformOrigin: 'left center',
                      transform: 'rotate(28deg)',
                      borderRadius: 2,
                    }}
                  />
                ) : null}
              </div>
              <span
                style={{
                  fontSize: 12.5,
                  color: '#F5F0E8',
                  fontFamily: 'Noto Serif SC, serif',
                  fontWeight: isPicked ? 600 : 400,
                }}
              >
                {opt.label}
              </span>
              {opt.blurb ? (
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(245,240,232,.5)',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    maxWidth: 130,
                    lineHeight: 1.4,
                  }}
                >
                  {opt.blurb}
                </span>
              ) : null}
              {isPicked ? (
                <span
                  style={{
                    fontSize: 9.5,
                    letterSpacing: 4,
                    color: '#C9A676',
                    textTransform: 'uppercase',
                  }}
                >
                  ✦ Now Playing
                </span>
              ) : null}
              {onPreview ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(opt.key);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onPreview(opt.key);
                    }
                  }}
                  aria-label={
                    playingKey === opt.key
                      ? `停止试听 ${opt.label}`
                      : `试听 ${opt.label}`
                  }
                  style={{
                    marginTop: 2,
                    fontSize: 10,
                    letterSpacing: 3,
                    color: playingKey === opt.key ? '#1a1530' : '#C9A676',
                    background:
                      playingKey === opt.key
                        ? '#C9A676'
                        : 'rgba(201,166,118,0.12)',
                    border: '1px solid #C9A676',
                    borderRadius: 999,
                    padding: '3px 12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    userSelect: 'none',
                  }}
                >
                  {playingKey === opt.key ? '◼ 停止' : '⏵ 试听 6s'}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </fieldset>
  );
}
