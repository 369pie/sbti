/**
 * F4 · Tarot Pull 抽签
 * 5 张反扣的塔罗扇形展开 → 用户抽 1 张 → 翻面 → 才显示选项。
 */
'use client';

import { useCallback, useState } from 'react';

export interface TarotCard {
  key: string;
  /** 反面图案（金箔几何） */
  back?: string;
  /** 正面 emoji/glyph */
  faceGlyph: string;
  /** 卡牌名（如 The Tower、The Lovers） */
  cardName: string;
  /** 翻面后显示的题目变体 */
  promptVariant: string;
  /** 三个回答 */
  options: { key: string; label: string; blurb?: string }[];
}

interface Props {
  prompt: string;
  hint?: string;
  cards: TarotCard[];
  onPick: (cardKey: string, optionKey: string) => void;
}

export function TarotPull({ prompt, hint, cards, onPick }: Props) {
  const [pulled, setPulled] = useState<string | null>(null);
  const [pickedOpt, setPickedOpt] = useState<string | null>(null);
  const card = cards.find((c) => c.key === pulled) ?? null;

  const handlePull = useCallback((key: string) => {
    setPulled(key);
    if (typeof navigator !== 'undefined') navigator.vibrate?.([6, 30, 12]);
  }, []);

  const handleOption = useCallback(
    (optKey: string) => {
      if (!pulled) return;
      setPickedOpt(optKey);
      onPick(pulled, optKey);
    },
    [pulled, onPick],
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

      {!card ? (
        <div
          style={{
            marginTop: 28,
            position: 'relative',
            height: 200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {cards.map((c, i) => {
            const span = cards.length - 1;
            const angle = (i - span / 2) * 12;
            const offset = (i - span / 2) * 28;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => handlePull(c.key)}
                aria-label={`抽第 ${i + 1} 张牌`}
                style={{
                  position: 'absolute',
                  width: 90,
                  height: 144,
                  borderRadius: 8,
                  border: '1px solid rgba(201,166,118,.55)',
                  background:
                    'linear-gradient(155deg, #2a1e4a 0%, #1a1530 60%, #0f0c1f 100%)',
                  boxShadow:
                    '0 8px 28px rgba(0,0,0,.55), inset 0 0 0 4px rgba(201,166,118,.10), inset 0 0 18px rgba(201,166,118,.18)',
                  transform: `translateX(${offset}px) rotate(${angle}deg)`,
                  transition: 'transform .35s cubic-bezier(.22,1,.36,1)',
                  cursor: 'pointer',
                  zIndex: i,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  color: '#C9A676',
                  fontSize: 28,
                  letterSpacing: 2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `translateX(${offset}px) translateY(-12px) rotate(${angle}deg)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `translateX(${offset}px) rotate(${angle}deg)`;
                }}
              >
                <span aria-hidden>{c.back ?? '✦'}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ marginTop: 24, display: 'grid', justifyItems: 'center', gap: 14 }}>
          <article
            style={{
              width: 160,
              height: 248,
              borderRadius: 10,
              border: '1px solid rgba(201,166,118,.55)',
              background:
                'linear-gradient(180deg, #FCF7EC 0%, #E8DEC4 100%)',
              color: '#1a1530',
              padding: '14px 12px',
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              boxShadow:
                '0 12px 40px rgba(201,166,118,.35), 0 4px 14px rgba(0,0,0,.35), inset 0 0 0 4px rgba(201,166,118,.18)',
              animation: 'tarot-flip-in .6s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 9,
                letterSpacing: 4,
                textAlign: 'center',
                color: '#9C6B4F',
                textTransform: 'uppercase',
              }}
            >
              ✦ The Card
            </p>
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                fontSize: 56,
                fontFamily: 'Cormorant Garamond, serif',
              }}
            >
              {card.faceGlyph}
            </div>
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 13,
                fontStyle: 'italic',
                fontFamily: 'Cormorant Garamond, serif',
                color: '#1a1530',
                letterSpacing: 1,
              }}
            >
              {card.cardName}
            </p>
          </article>

          <p
            style={{
              margin: 0,
              maxWidth: 320,
              textAlign: 'center',
              fontSize: 13.5,
              color: '#F5F0E8',
              fontFamily: 'Noto Serif SC, serif',
              lineHeight: 1.55,
            }}
          >
            {card.promptVariant}
          </p>

          <div
            style={{
              display: 'grid',
              gap: 6,
              width: '100%',
              maxWidth: 360,
            }}
          >
            {card.options.map((opt) => {
              const isPicked = pickedOpt === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleOption(opt.key)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: isPicked
                      ? '1px solid #C9A676'
                      : '1px solid rgba(245,240,232,.12)',
                    background: isPicked
                      ? 'rgba(201,166,118,.14)'
                      : 'rgba(245,240,232,.04)',
                    color: '#F5F0E8',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: isPicked ? '#C9A676' : '#F5F0E8' }}>
                    {opt.label}
                  </div>
                  {opt.blurb ? (
                    <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(245,240,232,.55)' }}>
                      {opt.blurb}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setPulled(null);
              setPickedOpt(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(245,240,232,.5)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ↺ 重新抽一张
          </button>
        </div>
      )}

      <style>{`
        @keyframes tarot-flip-in {
          0% { transform: rotateY(180deg) scale(.85); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
      `}</style>
    </fieldset>
  );
}
