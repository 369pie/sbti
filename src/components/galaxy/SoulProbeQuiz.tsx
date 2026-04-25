'use client';

/**
 * SoulProbeQuiz · 6 题灵魂探针 — 试玩界面
 *
 * 用户答完 6 题后，把答案传给配对模块计算 S。
 * 单人结果上不显示分数，只显示「你已收齐 6 道灵魂签」。
 *
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §5
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColorDrip, VinylDrop } from '@/components/quiz-formats';
import {
  playAudioProbe,
  stopAudioProbe,
  type AudioProbeKey,
} from '@/lib/wtfi/audio-probes';
import { getSoulProbeFormat } from '@/lib/wtfi/quiz-script';
import {
  SOUL_PROBE_QUESTIONS,
  type SoulAnswers,
  type SoulProbeId,
  type SoulProbeQuestion,
} from '@/lib/wtfi/soul-resonance';

interface Props {
  /** 已有答案 */
  initialAnswers?: SoulAnswers;
  /** 答完一题就回调 */
  onAnswer?: (answers: SoulAnswers) => void;
  /** 6 题全部答完触发 */
  onComplete?: (answers: SoulAnswers) => void;
}

export function SoulProbeQuiz({
  initialAnswers = {},
  onAnswer,
  onComplete,
}: Props) {
  const [answers, setAnswers] = useState<SoulAnswers>(initialAnswers);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  useEffect(() => () => stopAudioProbe(), []);

  const handlePreview = useCallback((key: string) => {
    if (previewKey === key) {
      stopAudioProbe();
      setPreviewKey(null);
      return;
    }
    const dur = playAudioProbe(key as AudioProbeKey);
    if (dur > 0) {
      setPreviewKey(key);
      window.setTimeout(() => {
        setPreviewKey((cur) => (cur === key ? null : cur));
      }, dur * 1000);
    }
     
  }, [previewKey]);

  const completedCount = useMemo(
    () => SOUL_PROBE_QUESTIONS.filter((q) => answers[q.id]).length,
    [answers],
  );

  const handlePick = useCallback(
    (id: SoulProbeId, key: 'A' | 'B' | 'C' | 'D' | 'SKIP') => {
      const next = { ...answers, [id]: key };
      setAnswers(next);
      onAnswer?.(next);
      const filled = SOUL_PROBE_QUESTIONS.filter((q) => next[q.id]).length;
      if (filled === SOUL_PROBE_QUESTIONS.length) onComplete?.(next);
    },
    [answers, onAnswer, onComplete],
  );

  return (
    <section
      aria-label="灵魂探针 · 6 题"
      style={{
        padding: '24px 18px',
        borderRadius: 16,
        background:
          'linear-gradient(155deg, rgba(192,122,142,0.06) 0%, rgba(156,124,255,0.06) 100%)',
        border: '1px solid rgba(201,166,118,0.22)',
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: 'center',
          letterSpacing: 6,
          fontSize: 10.5,
          color: 'var(--color-gold)',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        ✦ POETRY · Soul Probe · {completedCount} / {SOUL_PROBE_QUESTIONS.length}
      </p>
      <h3
        style={{
          margin: '8px 0 4px',
          textAlign: 'center',
          fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          fontStyle: 'italic',
          fontSize: 24,
          color: 'var(--color-bg-primary)',
          fontWeight: 500,
        }}
      >
        灵魂探针
      </h3>
      <p
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(245,240,232,0.78)',
          margin: '0 auto 18px',
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        这 6 道签不影响你的人格判定。
        <br />
        但当你和 ta 配对时，
        <strong style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
          答案越像，你们的灵魂频率越接近。
        </strong>
      </p>

      <div
        style={{
          display: 'grid',
          gap: 16,
        }}
      >
        {SOUL_PROBE_QUESTIONS.map((q) => {
          const picked = answers[q.id];
          const format = getSoulProbeFormat(q.id);

          if (format === 'vinyl-drop' || format === 'color-drip') {
            return (
              <RitualWrapper key={q.id} q={q} pickedKey={picked}>
                {format === 'vinyl-drop' ? (
                  <VinylDrop
                    prompt={q.prompt}
                    hint={q.hint}
                    options={q.options.map((opt, idx) => ({
                      key: opt.key,
                      label: opt.label,
                      blurb: opt.blurb,
                      centerGlyph: ['♪', '♫', '♬', '◯'][idx] ?? '♪',
                      accent: ['var(--color-gold)', 'var(--color-accent)', '#9C7CFF', '#7AA3B0'][idx],
                    }))}
                    initial={
                      picked === 'A' || picked === 'B' || picked === 'C' || picked === 'D'
                        ? picked
                        : undefined
                    }
                    onPick={(k) => handlePick(q.id, k as 'A' | 'B' | 'C' | 'D')}
                    onPreview={q.id === 'music' ? handlePreview : undefined}
                    playingKey={q.id === 'music' ? previewKey : null}
                  />
                ) : (
                  <ColorDrip
                    prompt={q.prompt}
                    hint={q.hint}
                    options={q.options.map((opt) => {
                      const hex = opt.blurb.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? 'var(--color-accent)';
                      return {
                        key: opt.key,
                        label: opt.label,
                        hex,
                        blurb: opt.blurb.replace(/#[0-9A-Fa-f]{6}\s*·?\s*/, ''),
                      };
                    })}
                    initial={
                      picked === 'A' || picked === 'B' || picked === 'C' || picked === 'D'
                        ? picked
                        : undefined
                    }
                    onPick={(k) => handlePick(q.id, k as 'A' | 'B' | 'C' | 'D')}
                  />
                )}
                <SkipButton
                  picked={picked}
                  onSkip={() => handlePick(q.id, 'SKIP')}
                />
              </RitualWrapper>
            );
          }

          return (
            <fieldset
              key={q.id}
              style={{
                border: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              <legend
                style={{
                  display: 'inline-block',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: 4,
                  color: 'var(--color-bg-primary)',
                  background: 'rgba(26,21,48,0.85)',
                  padding: '3px 8px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {q.eyebrow}
              </legend>
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: 15,
                  color: 'var(--color-bg-primary)',
                  lineHeight: 1.5,
                  fontFamily: 'Noto Serif SC, serif',
                }}
              >
                {q.prompt}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 6,
                }}
              >
                {q.options.map((opt) => {
                  const isPicked = picked === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handlePick(q.id, opt.key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: isPicked
                          ? '1px solid #C9A676'
                          : '1px solid rgba(245,240,232,0.12)',
                        background: isPicked
                          ? 'rgba(201,166,118,0.12)'
                          : 'transparent',
                        color: 'var(--color-bg-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          color: isPicked ? 'var(--color-gold)' : 'var(--color-bg-primary)',
                        }}
                      >
                        {opt.key} · {opt.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          color: 'rgba(245,240,232,0.78)',
                          lineHeight: 1.4,
                        }}
                      >
                        {opt.blurb}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => handlePick(q.id, 'SKIP')}
                style={{
                  marginTop: 6,
                  background: 'transparent',
                  border: 'none',
                  color:
                    picked === 'SKIP'
                      ? 'var(--color-gold)'
                      : 'rgba(245,240,232,0.4)',
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {picked === 'SKIP' ? '✓ 已跳过 — 这 6 个都不是我' : '都不是我，跳过 →'}
              </button>
            </fieldset>
          );
        })}
      </div>

      {completedCount === SOUL_PROBE_QUESTIONS.length ? (
        <p
          style={{
            marginTop: 18,
            textAlign: 'center',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
            color: 'var(--color-gold)',
            fontSize: 14,
          }}
        >
          ✦ 你已收齐 6 道灵魂签。
        </p>
      ) : null}
    </section>
  );
}

function RitualWrapper({
  q,
  pickedKey,
  children,
}: {
  q: SoulProbeQuestion;
  pickedKey?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
      <legend
        style={{
          fontSize: 9.5,
          letterSpacing: 4,
          color: 'rgba(201,166,118,0.85)',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {q.eyebrow} {pickedKey ? `· ✓ ${pickedKey}` : ''}
      </legend>
      {children}
    </fieldset>
  );
}

function SkipButton({
  picked,
  onSkip,
}: {
  picked?: string;
  onSkip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSkip}
      style={{
        marginTop: 8,
        background: 'transparent',
        border: 'none',
        color: picked === 'SKIP' ? 'var(--color-gold)' : 'rgba(245,240,232,0.4)',
        fontSize: 11,
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {picked === 'SKIP' ? '✓ 已跳过 — 这几个都不是我' : '都不是我，跳过 →'}
    </button>
  );
}
