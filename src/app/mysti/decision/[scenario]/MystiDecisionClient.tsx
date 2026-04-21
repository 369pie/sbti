'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { WTFTI_PERSONALITIES } from '@/lib/wtfti-personalities';
import {
  type DecisionScenario,
  type DecisionStance,
  pickStanceFromDraw,
  pickQuote,
  DECISION_DISCLAIMER,
} from '@/lib/mysti/decision-quotes';
import { appendDecisionLog } from '@/lib/mysti/decision-log';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import {
  getQuotaStatus,
  consumeDraw,
  hasDecisionPack,
  DECISION_PACK_RESOURCE_ID,
  type QuotaStatus,
} from '@/lib/mysti/decision-quota';
import { DecisionPackPaywall } from '@/components/mysti/DecisionPackPaywall';

type Phase = 'invite' | 'shuffle' | 'choose' | 'reveal';

const STANCE_LABEL: Record<DecisionStance, string> = {
  go: '今夜宜行',
  wait: '今夜宜静',
  flow: '今夜宜随',
};
const STANCE_ENG: Record<DecisionStance, string> = {
  go: 'OF GOING',
  wait: 'OF WAITING',
  flow: 'OF FLOWING',
};

/** 牌堆中可选 7 张牌背（视觉差异由位置决定） */
const DECK_SIZE = 7;

export function MystiDecisionClient({ scenario }: { scenario: DecisionScenario }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('invite');
  // Deck slot indexes the user tapped (0..DECK_SIZE-1), in pick order
  const [pickedSlots, setPickedSlots] = useState<number[]>([]);
  // Personality indexes derived from picked slots (used for stance + log)
  const [picks, setPicks] = useState<number[]>([]);
  const [seed, setSeed] = useState<number>(0);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [premium, setPremium] = useState<boolean>(false);

  useEffect(() => {
    trackMystiEvent('mysti_decision_entry', { slug: scenario.id });
    // Hydrate quota + pack state on mount
    setQuota(getQuotaStatus());
    setPremium(hasDecisionPack());
  }, [scenario.id]);

  const refreshQuota = useCallback(() => {
    setQuota(getQuotaStatus());
    setPremium(hasDecisionPack());
  }, []);

  const startRitual = useCallback(() => {
    const status = getQuotaStatus();
    if (status.exhausted) {
      // Should not happen because UI gates the button, but defensive.
      setQuota(status);
      return;
    }
    const next = consumeDraw();
    setQuota(next);
    setPremium(hasDecisionPack());
    try {
      trackMystiEvent('mysti_decision_quota_consume', {
        slug: scenario.id,
        props: {
          used: String(next.used),
          total: String(next.total),
          hasPack: next.hasPack ? '1' : '0',
        },
      });
    } catch {
      /* noop */
    }
    setPickedSlots([]);
    setPicks([]);
    setSeed(0);
    setPhase('shuffle');
    const hold = reduceMotion ? 400 : 1800;
    window.setTimeout(() => setPhase('choose'), hold);
  }, [reduceMotion, scenario.id]);

  const handlePick = useCallback(
    (deckIdx: number) => {
      if (phase !== 'choose') return;
      if (pickedSlots.includes(deckIdx) || pickedSlots.length >= 3) return;

      const personalityIdx =
        (Math.floor(Date.now() / 1000) + deckIdx * 13) % WTFTI_PERSONALITIES.length;

      const nextSlots = [...pickedSlots, deckIdx];
      const nextPicks = [...picks, personalityIdx];

      setPickedSlots(nextSlots);
      setPicks(nextPicks);

      if (nextSlots.length === 3) {
        const newSeed = Math.floor(Date.now() / 1000) + deckIdx;
        setSeed(newSeed);
        window.setTimeout(() => setPhase('reveal'), reduceMotion ? 200 : 700);
      }
    },
    [phase, pickedSlots, picks, reduceMotion],
  );

  const stance: DecisionStance = useMemo(
    () => (picks.length === 3 ? pickStanceFromDraw(picks) : 'flow'),
    [picks],
  );
  const quote = useMemo(
    () => (picks.length === 3 ? pickQuote(scenario.id, stance, seed, premium) : null),
    [scenario.id, stance, seed, picks.length, premium],
  );

  // Archive once on reveal
  useEffect(() => {
    if (phase !== 'reveal' || !quote) return;
    appendDecisionLog({
      scenario: scenario.id,
      stance,
      picks,
      quote: quote.text,
    });
    trackMystiEvent('mysti_decision_pick', {
      slug: scenario.id,
      props: { stance, seed: String(seed) },
    });
    trackMystiEvent('mysti_decision_archive', { slug: scenario.id });
  }, [phase, quote, picks, scenario.id, stance, seed]);

  const reset = useCallback(() => {
    setPhase('invite');
    setPickedSlots([]);
    setPicks([]);
    setSeed(0);
  }, []);

  const handleShare = useCallback(async () => {
    if (!quote) return;
    const text = `${scenario.question}\n\n暮光说：${quote.text}\n\n— 灵鉴 · ${scenario.label}\nwtfti.com/mysti/decision/${scenario.id}/`;
    trackMystiEvent('mysti_decision_share', { slug: scenario.id });
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `灵鉴 · ${scenario.label}`, text });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('已复制 · 可粘贴发圈');
      }
    } catch {
      // user dismissed share — non-fatal
    }
  }, [quote, scenario.id, scenario.label, scenario.question]);

  const accent = scenario.accentHex;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 80% 60% at 30% 20%, ${accent}26 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 80% 90%, rgba(156,124,255,0.14) 0%, transparent 60%), #1a1530`,
        color: '#F5F0E8',
        padding: '64px 20px 120px',
        fontFamily: 'var(--font-display, "Cormorant Garamond"), "Noto Serif SC", serif',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/mysti/decision/"
            style={{
              fontSize: 12,
              letterSpacing: '0.32em',
              color: 'rgba(245,240,232,0.55)',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            ← 换一个场景
          </Link>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.42em',
              color: accent,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            第 {scenario.numeral} 章 · {scenario.eyebrow}
          </span>
        </div>

        <h1
          style={{
            marginTop: 28,
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '0.02em',
          }}
        >
          {scenario.label}
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 17,
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.78)',
            fontStyle: 'italic',
          }}
        >
          {scenario.question}
        </p>

        {/* Phase: invite */}
        {phase === 'invite' && (
          <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.68)', lineHeight: 1.7 }}>
              呼吸三次，把心里那个犹豫的句子默念一遍。
              然后让暮光替你抽 3 张牌——它们会决定今夜的基调。
            </p>

            {quota && !quota.exhausted && (
              <button
                type="button"
                onClick={startRitual}
                style={{
                  marginTop: 12,
                  padding: '16px 28px',
                  fontSize: 16,
                  letterSpacing: '0.12em',
                  color: '#1a1530',
                  background: `linear-gradient(135deg, ${accent} 0%, #C07A8E 100%)`,
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: `0 12px 32px -12px ${accent}88`,
                }}
              >
                开始洗牌 · 进入 90 秒仪式
              </button>
            )}

            {quota && (
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: 'rgba(245,240,232,0.55)',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {quota.hasPack ? '✦ 场景包已激活 · ' : ''}
                30 天剩余 {quota.remaining}/{quota.total} 次
              </p>
            )}

            {quota && quota.exhausted && (
              quota.hasPack ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: '26px 24px',
                    borderRadius: 18,
                    border: `1px solid ${accent}44`,
                    background:
                      'linear-gradient(160deg, rgba(48,32,72,0.78) 0%, rgba(31,21,48,0.92) 100%)',
                    boxShadow: `0 24px 56px -28px ${accent}44`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.42em',
                      color: accent,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    Decision Pack · This Cycle Is Full
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 24,
                      lineHeight: 1.3,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    这一轮 30 天配额已经抽完
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.8,
                      color: 'rgba(245,240,232,0.74)',
                    }}
                  >
                    场景包仍然有效，但 5 个场景共享同一份 30 天配额。
                    你这一轮已经用掉 {quota.used}/{quota.total} 次，等额度恢复后再回来抽下一张。
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      href="/mysti/archive/"
                      style={{
                        padding: '12px 18px',
                        borderRadius: 999,
                        textDecoration: 'none',
                        background: '#C9A676',
                        color: '#1a1530',
                        fontSize: 13,
                        letterSpacing: '0.12em',
                        fontWeight: 600,
                      }}
                    >
                      查看已抽档案
                    </Link>
                    <Link
                      href="/mysti/decision/"
                      style={{
                        padding: '12px 18px',
                        borderRadius: 999,
                        textDecoration: 'none',
                        border: '1px solid rgba(245,240,232,0.24)',
                        color: 'rgba(245,240,232,0.74)',
                        fontSize: 13,
                        letterSpacing: '0.12em',
                      }}
                    >
                      回到场景列表
                    </Link>
                  </div>
                </div>
              ) : (
                <DecisionPackPaywall
                  resourceId={DECISION_PACK_RESOURCE_ID}
                  onUnlocked={refreshQuota}
                />
              )
            )}
          </div>
        )}

        {/* Phase: shuffle */}
        {phase === 'shuffle' && (
          <div
            style={{
              marginTop: 80,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 240,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ position: 'relative', width: 200, height: 280 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ rotate: 0, x: 0, opacity: 0 }}
                  animate={
                    reduceMotion
                      ? { opacity: 0.7 }
                      : {
                          rotate: [-8 + i * 4, -4 + i * 2, 0],
                          x: [-12 + i * 6, -6 + i * 3, 0],
                          opacity: [0, 0.85, 0.95],
                        }
                  }
                  transition={{ duration: 1.4, delay: i * 0.08 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    background: 'linear-gradient(180deg, #2D2147 0%, #1F1530 100%)',
                    border: `1px solid ${accent}55`,
                    boxShadow: `0 16px 32px -16px ${accent}66`,
                  }}
                />
              ))}
              <p
                style={{
                  position: 'absolute',
                  bottom: -36,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 12,
                  letterSpacing: '0.32em',
                  color: 'rgba(245,240,232,0.55)',
                  textTransform: 'uppercase',
                }}
              >
                暮光正在洗牌…
              </p>
            </motion.div>
          </div>
        )}

        {/* Phase: choose */}
        {phase === 'choose' && (
          <div style={{ marginTop: 48 }}>
            <p
              style={{
                fontSize: 13,
                letterSpacing: '0.16em',
                color: 'rgba(245,240,232,0.68)',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              选三张牌 · 已选 {pickedSlots.length}/3
            </p>
            <div
              style={{
                marginTop: 32,
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {Array.from({ length: DECK_SIZE }).map((_, i) => {
                const isPicked = pickedSlots.includes(i);
                return (
                  <DeckCard
                    key={i}
                    accent={accent}
                    onClick={() => handlePick(i)}
                    disabled={pickedSlots.length >= 3 || isPicked}
                    revealed={pickedSlots.length === 3}
                    reduceMotion={reduceMotion ?? false}
                    deckIdx={i}
                    pickedSlot={isPicked}
                  />
                );
              })}
            </div>
            <p
              style={{
                marginTop: 28,
                fontSize: 12,
                color: 'rgba(245,240,232,0.45)',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              触摸任意三张 · 不需要思考太久 · 第一直觉最准
            </p>
          </div>
        )}

        {/* Phase: reveal */}
        <AnimatePresence>
          {phase === 'reveal' && quote && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ marginTop: 56 }}
            >
              <ResultCard
                scenario={scenario}
                stance={stance}
                quote={quote.text}
                accent={accent}
              />

              <div
                style={{
                  marginTop: 32,
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    padding: '14px 24px',
                    fontSize: 14,
                    letterSpacing: '0.16em',
                    color: '#1a1530',
                    background: '#C9A676',
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  ✦ 复制金句 · 发圈
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    padding: '14px 24px',
                    fontSize: 14,
                    letterSpacing: '0.16em',
                    color: '#F5F0E8',
                    background: 'transparent',
                    border: '1px solid rgba(245,240,232,0.32)',
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  再抽一次
                </button>
                <Link
                  href="/mysti/decision/"
                  style={{
                    padding: '14px 24px',
                    fontSize: 14,
                    letterSpacing: '0.16em',
                    color: 'rgba(245,240,232,0.68)',
                    border: '1px solid transparent',
                    borderRadius: 999,
                    textDecoration: 'none',
                    alignSelf: 'center',
                  }}
                >
                  换一个场景
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <p
          style={{
            marginTop: 80,
            fontSize: 11,
            lineHeight: 1.6,
            opacity: 0.55,
            fontStyle: 'italic',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          {DECISION_DISCLAIMER}
        </p>
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────

function DeckCard({
  accent,
  onClick,
  disabled,
  revealed,
  reduceMotion,
  deckIdx,
  pickedSlot,
}: {
  accent: string;
  onClick: () => void;
  disabled: boolean;
  revealed: boolean;
  reduceMotion: boolean;
  deckIdx: number;
  pickedSlot: boolean;
}) {
  const [tapped, setTapped] = useState(false);
  return (
    <button
      type="button"
      aria-label={`抽第 ${deckIdx + 1} 张牌`}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setTapped(true);
        onClick();
      }}
      style={{
        position: 'relative',
        aspectRatio: '2 / 3',
        borderRadius: 8,
        border: `1px solid ${accent}66`,
        background:
          tapped || revealed
            ? `linear-gradient(135deg, ${accent}33 0%, #1a1530 100%)`
            : 'linear-gradient(180deg, #2D2147 0%, #1F1530 100%)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 200ms ease, opacity 200ms ease',
        transform: reduceMotion ? 'none' : tapped ? 'translateY(-8px) scale(1.04)' : 'none',
        opacity: pickedSlot && !tapped ? 0.4 : 1,
        padding: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 4,
          border: `1px solid ${accent}88`,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          fontSize: 14,
          fontStyle: 'italic',
          fontFamily: 'var(--font-display, "Cormorant Garamond"), serif',
        }}
      >
        ✦
      </span>
    </button>
  );
}

function ResultCard({
  scenario,
  stance,
  quote,
  accent,
}: {
  scenario: DecisionScenario;
  stance: DecisionStance;
  quote: string;
  accent: string;
}) {
  return (
    <article
      style={{
        position: 'relative',
        padding: '40px 32px 32px',
        borderRadius: 22,
        border: `1px solid ${accent}55`,
        background:
          'linear-gradient(180deg, rgba(45,33,71,0.96) 0%, rgba(31,21,48,0.96) 100%)',
        boxShadow: `0 24px 60px -32px ${accent}77`,
        overflow: 'hidden',
      }}
    >
      {/* Top decorative line */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 18,
          left: 32,
          right: 32,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${accent}88 50%, transparent 100%)`,
        }}
      />

      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.42em',
          color: accent,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {STANCE_ENG[stance]} · {scenario.eyebrow}
      </p>

      <h2
        style={{
          marginTop: 12,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: '#F5F0E8',
        }}
      >
        <span style={{ color: accent, fontStyle: 'italic', marginRight: 10 }}>
          {scenario.numeral}
        </span>
        {STANCE_LABEL[stance]}
      </h2>

      <p
        style={{
          marginTop: 28,
          fontSize: 22,
          lineHeight: 1.65,
          fontStyle: 'italic',
          color: '#F5F0E8',
          letterSpacing: '0.02em',
        }}
      >
        “{quote}”
      </p>

      <p
        style={{
          marginTop: 24,
          fontSize: 13,
          color: 'rgba(245,240,232,0.55)',
          letterSpacing: '0.06em',
        }}
      >
        — 灵鉴 · {scenario.label}
      </p>

      {/* Bottom sigil */}
      <div
        aria-hidden
        style={{
          marginTop: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 18,
          borderTop: `1px solid ${accent}33`,
        }}
      >
        <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', letterSpacing: '0.32em' }}>
          WTFTI · MYSTI
        </span>
        <span
          style={{
            fontSize: 11,
            color: accent,
            letterSpacing: '0.42em',
            fontFamily: 'var(--font-display, "Cormorant Garamond"), serif',
            fontStyle: 'italic',
          }}
        >
          ✦ {scenario.numeral} ✦
        </span>
      </div>
    </article>
  );
}
