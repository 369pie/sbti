/**
 * F2 · Polaroid Stack 拍立得叠
 * 4 张拍立得叠在一起，用户上滑丢掉不要的，最后留一张就是答案。
 * 简化交互：每张可点"丢掉"按钮 → 卡片飞出；剩最后一张时自动选定。
 */
'use client';

import { useCallback, useMemo, useState } from 'react';

export interface PolaroidOption {
  key: string;
  caption: string;
  /** 拍立得"照片"内容 — emoji/glyph 或短诗一句 */
  imageGlyph: string;
  /** 角度倾斜随机感 */
  tilt?: number;
}

interface Props {
  prompt: string;
  hint?: string;
  options: PolaroidOption[];
  initial?: string;
  onPick: (key: string) => void;
}

export function PolaroidStack({ prompt, hint, options, initial, onPick }: Props) {
  const [discarded, setDiscarded] = useState<string[]>(
    initial ? options.filter((o) => o.key !== initial).map((o) => o.key) : [],
  );
  const remaining = useMemo(
    () => options.filter((o) => !discarded.includes(o.key)),
    [options, discarded],
  );
  const finalPick = remaining.length === 1 ? remaining[0].key : undefined;

  const handleDiscard = useCallback(
    (key: string) => {
      setDiscarded((prev) => {
        if (prev.includes(key)) return prev;
        const next = [...prev, key];
        const left = options.filter((o) => !next.includes(o.key));
        if (left.length === 1) {
          if (typeof navigator !== 'undefined') navigator.vibrate?.(12);
          onPick(left[0].key);
        }
        return next;
      });
    },
    [options, onPick],
  );

  const handlePickDirectly = useCallback(
    (key: string) => {
      setDiscarded(options.filter((o) => o.key !== key).map((o) => o.key));
      onPick(key);
    },
    [options, onPick],
  );

  const handleReset = useCallback(() => {
    setDiscarded([]);
  }, []);

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ width: '100%' }}>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 15.5,
            color: '#F5F0E8',
            lineHeight: 1.55,
            fontFamily: 'Noto Serif SC, serif',
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
            {hint ?? '把不像你的拍立得"丢掉"，留下最舍不得的那张。'}
          </p>
        ) : null}
      </legend>

      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {options.map((opt, i) => {
          const isDiscarded = discarded.includes(opt.key);
          const isFinal = finalPick === opt.key;
          const tilt = opt.tilt ?? (i % 2 === 0 ? -2.4 : 2.6);
          return (
            <div
              key={opt.key}
              style={{
                position: 'relative',
                padding: '14px 12px 22px',
                background: isFinal
                  ? 'linear-gradient(180deg, #FCF7EC 0%, #F2EAD8 100%)'
                  : isDiscarded
                  ? 'rgba(245,240,232,.06)'
                  : 'linear-gradient(180deg, #F8F2E2 0%, #E8DEC4 100%)',
                color: isDiscarded ? 'rgba(245,240,232,.4)' : '#1a1530',
                borderRadius: 4,
                boxShadow: isDiscarded
                  ? 'none'
                  : isFinal
                  ? '0 12px 40px rgba(201,166,118,.45), 0 2px 6px rgba(0,0,0,.35)'
                  : '0 6px 18px rgba(0,0,0,.35)',
                transform: isDiscarded
                  ? `rotate(${tilt * 4}deg) translateY(40px) scale(.85)`
                  : isFinal
                  ? 'rotate(0deg) scale(1.04)'
                  : `rotate(${tilt}deg)`,
                opacity: isDiscarded ? 0.35 : 1,
                transition: 'all .6s cubic-bezier(.22,1,.36,1)',
                pointerEvents: isDiscarded ? 'none' : 'auto',
              }}
            >
              <div
                aria-hidden
                style={{
                  height: 96,
                  background: '#1a1530',
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 38,
                  color: '#F5F0E8',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  marginBottom: 10,
                  filter: isDiscarded ? 'grayscale(.6) brightness(.6)' : 'none',
                }}
              >
                {opt.imageGlyph}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  textAlign: 'center',
                  fontFamily: 'Noto Serif SC, serif',
                  letterSpacing: 0.5,
                  lineHeight: 1.4,
                  minHeight: 32,
                }}
              >
                {opt.caption}
              </p>
              {!isDiscarded && !isFinal ? (
                <div
                  style={{
                    marginTop: 10,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handlePickDirectly(opt.key)}
                    style={{
                      fontSize: 10.5,
                      padding: '5px 0',
                      borderRadius: 999,
                      border: '1px solid rgba(26,21,48,.3)',
                      background: 'rgba(26,21,48,.06)',
                      color: '#1a1530',
                      letterSpacing: 1,
                      cursor: 'pointer',
                    }}
                  >
                    ✦ 留下
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiscard(opt.key)}
                    style={{
                      fontSize: 10.5,
                      padding: '5px 0',
                      borderRadius: 999,
                      border: '1px dashed rgba(26,21,48,.25)',
                      background: 'transparent',
                      color: 'rgba(26,21,48,.65)',
                      letterSpacing: 1,
                      cursor: 'pointer',
                    }}
                  >
                    × 丢掉
                  </button>
                </div>
              ) : null}
              {isFinal ? (
                <p
                  style={{
                    margin: '10px 0 0',
                    textAlign: 'center',
                    fontSize: 9.5,
                    letterSpacing: 4,
                    color: '#9C6B4F',
                    textTransform: 'uppercase',
                  }}
                >
                  ✦ Kept
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {discarded.length > 0 ? (
        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'block',
            margin: '14px auto 0',
            background: 'rgba(245,240,232,0.06)',
            border: '1px solid rgba(245,240,232,0.18)',
            color: 'rgba(245,240,232,0.82)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.06em',
            padding: '6px 16px',
            borderRadius: 999,
            cursor: 'pointer',
          }}
        >
          ↺ 撤销 · 重新洗牌
        </button>
      ) : null}
    </fieldset>
  );
}
