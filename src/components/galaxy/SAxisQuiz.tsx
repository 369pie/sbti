'use client';

/**
 * SAxisQuiz · S 轴 12 题运行时（意识流 · 暗面化身解锁）
 *
 * 题源：src/lib/wtfi/s-questions.ts（6 联想 + 4 反应时 + 2 排序）
 * 打分：src/lib/wtfi/scoring-s.ts → SScoreResult { axisScore, shadow, ... }
 *
 * 体验：题与题之间 220ms 淡入；联想/反应时题有倒计时圆环；排序题允许拖拽。
 * 设计口径：女性向 · 博物馆编辑级 · 金箔细线 + 暮紫光晕。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import {
  S_AXIS_QUESTIONS,
  type SAssociationQuestion,
  type SLatencyQuestion,
  type SQuestion,
  type STempoQuestion,
} from '@/lib/wtfi/s-questions';
import {
  scoreSAxis,
  type SAnswer,
  type SAssociationAnswer,
  type SLatencyAnswer,
  type STempoAnswer,
  type SScoreResult,
} from '@/lib/wtfi/scoring-s';

interface Props {
  onComplete: (score: SScoreResult) => void;
}

export function SAxisQuiz({ onComplete }: Props) {
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<SAnswer[]>([]);
  const finishedRef = useRef(false);

  const q = S_AXIS_QUESTIONS[cursor];
  const total = S_AXIS_QUESTIONS.length;

  const handleAnswered = useCallback(
    (answer: SAnswer) => {
      setAnswers((prev) => [...prev, answer]);
      if (cursor + 1 >= total) {
        if (finishedRef.current) return;
        finishedRef.current = true;
        const score = scoreSAxis([...answers, answer]);
        window.setTimeout(() => onComplete(score), 240);
        return;
      }
      setCursor((c) => c + 1);
    },
    [answers, cursor, total, onComplete],
  );

  if (!q) return null;

  return (
    <div style={wrapperStyle}>
      <header style={headerStyle}>
        <span style={eyebrowStyle}>SHADOW INVOCATION · 暗面 12 签</span>
        <span style={progressLabelStyle}>
          {String(cursor + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </header>

      <div style={progressBarStyle}>
        <div
          style={{
            ...progressFillStyle,
            width: `${((cursor + 1) / total) * 100}%`,
          }}
        />
      </div>

      <div key={q.id} style={cardStyle}>
        {q.type === 'association' ? (
          <AssociationCard q={q as SAssociationQuestion} onAnswered={handleAnswered} />
        ) : q.type === 'latency' ? (
          <LatencyCard q={q as SLatencyQuestion} onAnswered={handleAnswered} />
        ) : (
          <TempoCard q={q as STempoQuestion} onAnswered={handleAnswered} />
        )}
      </div>

      <p style={hintStyle}>
        别想太多 · 第一反应最准
      </p>
    </div>
  );
}

// ─────────────────────── Association / Latency ───────────────────────

function SingleSelectCard({
  q,
  onAnswered,
  anchor,
}: {
  q: SAssociationQuestion | SLatencyQuestion;
  onAnswered: (a: SAssociationAnswer | SLatencyAnswer) => void;
  anchor?: React.ReactNode;
}) {
  const [startedAt] = useState(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const timedOutRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (picked !== null || timedOutRef.current) return;
      timedOutRef.current = true;
      onAnswered({
        questionId: q.id,
        optionKey: null,
        latencyMs: q.countdownMs,
      });
    }, q.countdownMs);
    return () => window.clearTimeout(timer);
  }, [picked, q.countdownMs, q.id, onAnswered]);

  const handlePick = (key: string) => {
    if (picked !== null || timedOutRef.current) return;
    setPicked(key);
    const latencyMs = Date.now() - startedAt;
    window.setTimeout(() => {
      onAnswered({ questionId: q.id, optionKey: key, latencyMs });
    }, 180);
  };

  return (
    <>
      {anchor}
      <p style={promptStyle}>{q.prompt}</p>
      <Countdown durationMs={q.countdownMs} resetKey={q.id} />
      <div style={optionsStackStyle}>
        {q.options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handlePick(opt.key)}
            disabled={picked !== null}
            style={{
              ...optionButtonStyle,
              ...(picked === opt.key ? optionPickedStyle : {}),
            }}
          >
            <span style={optionKeyBadge}>{opt.key}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function AssociationCard({
  q,
  onAnswered,
}: {
  q: SAssociationQuestion;
  onAnswered: (a: SAssociationAnswer) => void;
}) {
  const anchor = useMemo(() => {
    if (q.anchorKind === 'color') {
      return (
        <div style={{ ...anchorBoxStyle }}>
          <span style={anchorLabelStyle}>ANCHOR</span>
          <div
            aria-hidden
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: q.anchor,
              boxShadow: `0 0 30px ${q.anchor}`,
              border: '1px solid rgba(201,166,118,0.45)',
            }}
          />
        </div>
      );
    }
    if (q.anchorKind === 'shape') {
      return (
        <div style={{ ...anchorBoxStyle }}>
          <span style={anchorLabelStyle}>ANCHOR</span>
          <div
            aria-hidden
            style={{
              width: 78,
              height: 28,
              borderRadius: 999,
              background:
                'linear-gradient(120deg, rgba(192,122,142,.7), rgba(156,124,255,.55))',
              boxShadow: '0 0 32px rgba(192,122,142,.45)',
              animation: 's-anchor-float 3.8s ease-in-out infinite',
            }}
          />
        </div>
      );
    }
    return (
      <div style={anchorBoxStyle}>
        <span style={anchorLabelStyle}>ANCHOR</span>
        <span style={anchorWordStyle}>{q.anchor}</span>
      </div>
    );
  }, [q.anchor, q.anchorKind]);

  return <SingleSelectCard q={q} onAnswered={onAnswered} anchor={anchor} />;
}

function LatencyCard({
  q,
  onAnswered,
}: {
  q: SLatencyQuestion;
  onAnswered: (a: SLatencyAnswer) => void;
}) {
  return <SingleSelectCard q={q} onAnswered={onAnswered} />;
}

// ─────────────────────── Tempo (排序题) ───────────────────────

function TempoCard({
  q,
  onAnswered,
}: {
  q: STempoQuestion;
  onAnswered: (a: STempoAnswer) => void;
}) {
  const [order, setOrder] = useState<string[]>(() => [...q.items]);
  const [dragCount, setDragCount] = useState(0);

  const move = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= order.length) return;
    const arr = [...order];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setOrder(arr);
    setDragCount((c) => c + 1);
  };

  const submit = () => {
    onAnswered({
      questionId: q.id,
      order,
      dragCount,
    });
  };

  return (
    <>
      <p style={promptStyle}>{q.prompt}</p>
      <ol style={tempoListStyle}>
        {order.map((item, idx) => (
          <li key={item} style={tempoItemStyle}>
            <span style={tempoIndexStyle}>{String(idx + 1).padStart(2, '0')}</span>
            <span style={tempoLabelStyle}>{item}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => move(idx, -1)}
                style={tempoArrowStyle}
                aria-label="上移"
                disabled={idx === 0}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                style={tempoArrowStyle}
                aria-label="下移"
                disabled={idx === order.length - 1}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" onClick={submit} style={tempoSubmitStyle}>
        ✦ 我排好了 · 下一签 ✦
      </button>
    </>
  );
}

// ─────────────────────── Countdown ring ───────────────────────

function Countdown({ durationMs, resetKey }: { durationMs: number; resetKey: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const t = window.setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 50);
    return () => window.clearInterval(t);
  }, [resetKey]);

  const pct = Math.min(1, elapsed / durationMs);
  const remainingSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));

  return (
    <div style={countdownRowStyle}>
      <div style={countdownTrackStyle}>
        <div
          style={{
            ...countdownFillStyle,
            width: `${(1 - pct) * 100}%`,
          }}
        />
      </div>
      <span style={countdownLabelStyle}>{remainingSec}s</span>
    </div>
  );
}

// ─────────────────────── Styles ───────────────────────

const wrapperStyle: CSSProperties = {
  width: '100%',
  maxWidth: 560,
  margin: '0 auto',
  padding: 'clamp(16px, 4vw, 28px)',
  color: 'var(--galaxy-cream, #F5F0E8)',
  fontFamily:
    'var(--galaxy-font-display), "Cormorant Garamond", "Noto Serif SC", serif',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
};

const eyebrowStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.38em',
  fontSize: 11,
  color: 'var(--galaxy-gold-soft, #D4B58A)',
};

const progressLabelStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 13,
  color: 'var(--galaxy-mist, rgba(245,240,232,0.65))',
};

const progressBarStyle: CSSProperties = {
  height: 2,
  borderRadius: 2,
  background: 'rgba(245,240,232,0.12)',
  overflow: 'hidden',
  marginBottom: 24,
};

const progressFillStyle: CSSProperties = {
  height: '100%',
  background:
    'linear-gradient(90deg, var(--galaxy-rose, #C07A8E), var(--galaxy-gold, #C9A676))',
  transition: 'width 320ms ease',
};

const cardStyle: CSSProperties = {
  padding: 'clamp(22px, 5vw, 36px)',
  borderRadius: 18,
  background:
    'linear-gradient(180deg, rgba(42,28,77,0.6) 0%, rgba(26,21,48,0.7) 100%)',
  border: '1px solid rgba(201,166,118,0.22)',
  boxShadow: 'var(--galaxy-rose-halo, 0 0 60px rgba(192,122,142,0.18))',
  backdropFilter: 'blur(6px)',
  animation: 's-card-rise 420ms cubic-bezier(.2,.7,.2,1) both',
};

const anchorBoxStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
  marginBottom: 18,
};

const anchorLabelStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.4em',
  fontSize: 10,
  color: 'var(--galaxy-gold-soft, #D4B58A)',
};

const anchorWordStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 42,
  color: 'var(--galaxy-cream, #F5F0E8)',
  letterSpacing: '0.08em',
  textShadow: '0 0 40px rgba(192,122,142,0.35)',
};

const promptStyle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 17,
  lineHeight: 1.7,
  textAlign: 'center',
  margin: '0 0 18px',
  color: 'var(--galaxy-cream, #F5F0E8)',
};

const hintStyle: CSSProperties = {
  textAlign: 'center',
  marginTop: 16,
  fontSize: 12,
  color: 'var(--galaxy-mist-faint, rgba(245,240,232,0.35))',
  fontStyle: 'italic',
  letterSpacing: '0.08em',
};

const optionsStackStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 16,
};

const optionButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  textAlign: 'left',
  padding: '12px 16px',
  borderRadius: 14,
  background: 'rgba(245,240,232,0.04)',
  border: '1px solid rgba(201,166,118,0.22)',
  color: 'var(--galaxy-cream, #F5F0E8)',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 200ms ease',
};

const optionPickedStyle: CSSProperties = {
  background: 'rgba(192,122,142,0.18)',
  borderColor: 'rgba(201,166,118,0.6)',
  transform: 'scale(1.01)',
};

const optionKeyBadge: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 15,
  color: 'var(--galaxy-gold-soft, #D4B58A)',
  minWidth: 18,
};

const countdownRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 6,
};

const countdownTrackStyle: CSSProperties = {
  flex: 1,
  height: 2,
  background: 'rgba(245,240,232,0.12)',
  borderRadius: 2,
  overflow: 'hidden',
};

const countdownFillStyle: CSSProperties = {
  height: '100%',
  background: 'var(--galaxy-violet, #9C7CFF)',
  transition: 'width 60ms linear',
};

const countdownLabelStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 12,
  color: 'var(--galaxy-mist, rgba(245,240,232,0.65))',
};

const tempoListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 18px',
  display: 'grid',
  gap: 10,
};

const tempoItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(245,240,232,0.04)',
  border: '1px solid rgba(201,166,118,0.22)',
};

const tempoIndexStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 14,
  color: 'var(--galaxy-gold-soft, #D4B58A)',
  minWidth: 28,
};

const tempoLabelStyle: CSSProperties = {
  flex: 1,
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 14,
  color: 'var(--galaxy-cream, #F5F0E8)',
};

const tempoArrowStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'rgba(156,124,255,0.12)',
  border: '1px solid rgba(156,124,255,0.28)',
  color: 'var(--galaxy-cream, #F5F0E8)',
  cursor: 'pointer',
  fontSize: 14,
};

const tempoSubmitStyle: CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  borderRadius: 999,
  background:
    'linear-gradient(120deg, var(--galaxy-rose, #C07A8E), var(--galaxy-gold, #C9A676))',
  color: 'var(--galaxy-ink, #1A1530)',
  border: 'none',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 15,
  letterSpacing: '0.12em',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 14px 32px -12px rgba(192,122,142,0.55)',
};
