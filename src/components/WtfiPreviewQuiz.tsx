'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { WTFI_AXES, getAxis, type WtfiAxis } from '@/lib/wtfi/axes';
import { WTFI_SCENARIO_QUESTIONS } from '@/lib/wtfi/questions';
import { scoreWtfi, type WtfiAnswer } from '@/lib/wtfi/scoring';
import { TheoryAnchorCard } from '@/components/TheoryAnchorCard';
import { CciPanel } from '@/components/CciPanel';
import { persistUniverseProfile } from '@/lib/wtfi/cci';

type Phase = 'intro' | 'quiz' | 'result';

const TOTAL = WTFI_SCENARIO_QUESTIONS.length;

export function WtfiPreviewQuiz() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<WtfiAnswer[]>([]);
  const [idx, setIdx] = useState(0);

  const q = WTFI_SCENARIO_QUESTIONS[idx];
  const result = useMemo(
    () => (phase === 'result' ? scoreWtfi(answers) : null),
    [phase, answers],
  );

  function pick(key: 'A' | 'B' | 'C') {
    const next: WtfiAnswer[] = [
      ...answers.filter((a) => a.questionId !== q.id),
      { questionId: q.id, optionKey: key },
    ];
    setAnswers(next);
    if (idx + 1 < TOTAL) {
      setIdx(idx + 1);
    } else {
      setPhase('result');
    }
  }

  function reset() {
    setAnswers([]);
    setIdx(0);
    setPhase('intro');
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-bg-primary text-text-primary"
      style={{ background: 'var(--color-paper, #FAF8F5)' }}
    >
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {phase === 'intro' && <Intro onStart={() => setPhase('quiz')} />}
        {phase === 'quiz' && (
          <Quiz
            index={idx}
            total={TOTAL}
            question={q}
            current={answers.find((a) => a.questionId === q.id)?.optionKey}
            onPick={pick}
            onBack={() => idx > 0 && setIdx(idx - 1)}
          />
        )}
        {phase === 'result' && result && <Result result={result} onReset={reset} />}
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="max-w-2xl mx-auto w-full px-6 pt-8 pb-2 flex items-center justify-between">
      <Link
        href="/"
        className="text-xs tracking-[0.3em] uppercase text-text-muted hover:text-text-primary transition-colors"
      >
        ← WTFTI
      </Link>
      <span className="text-[11px] tracking-[0.25em] uppercase text-text-muted">
        N° W-T-F-I · Preview
      </span>
    </header>
  );
}

function Footer() {
  return (
    <footer className="max-w-2xl mx-auto w-full px-6 py-6 text-[11px] text-text-muted text-center tracking-[0.18em] uppercase">
      WTFI Preview · 仅供 5 人内测，请勿外发
    </footer>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="space-y-8 mt-6">
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.32em] uppercase text-text-muted">
          WTFTI Theory · v0
        </p>
        <h1
          className="text-3xl sm:text-4xl leading-snug"
          style={{ fontFamily: 'var(--font-fraunces, serif)' }}
        >
          你不是一个人格，
          <br />
          你是一组人设。
        </h1>
        <p className="text-base text-text-secondary leading-relaxed pt-2">
          这是 WTFTI 自有「情境人格理论」的 30 题预览版。
          基于 Mischel & Shoda (1995) CAPS
          框架，本测试不告诉你"你是谁"，告诉你"在不同情境下你怎么反应"。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WTFI_AXES.map((a) => (
          <div
            key={a.id}
            className="border rounded-2xl p-4"
            style={{ borderColor: 'var(--color-rule, #E5DED4)' }}
          >
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl"
                style={{ fontFamily: 'var(--font-fraunces, serif)', color: a.color }}
              >
                {a.id}
              </span>
              <span className="text-sm text-text-secondary">{a.english}</span>
            </div>
            <div className="mt-1 text-base font-medium">{a.name}</div>
            <div className="mt-1 text-xs text-text-muted leading-relaxed">{a.testing}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-full text-white text-sm tracking-[0.18em] uppercase transition-transform hover:scale-[1.01]"
        style={{ background: 'var(--color-accent, #C07A8E)' }}
      >
        开始 · 30 题 · 约 5 分钟
      </button>
      <p className="text-[11px] text-text-muted text-center">
        没有所谓的对错答案，只有"在那个场景下，你最可能怎么反应"。
      </p>
    </section>
  );
}

function Quiz({
  index,
  total,
  question,
  current,
  onPick,
  onBack,
}: {
  index: number;
  total: number;
  question: (typeof WTFI_SCENARIO_QUESTIONS)[number];
  current: 'A' | 'B' | 'C' | undefined;
  onPick: (k: 'A' | 'B' | 'C') => void;
  onBack: () => void;
}) {
  const axis = getAxis(question.primaryAxis);
  const progress = ((index + 1) / total) * 100;

  return (
    <section className="space-y-8">
      {/* progress */}
      <div>
        <div className="flex items-center justify-between text-[11px] tracking-[0.25em] uppercase text-text-muted">
          <span>
            N° {String(index + 1).padStart(2, '0')} / {total}
          </span>
          <span style={{ color: axis.color }}>
            轴 · {axis.id} · {axis.name}
          </span>
        </div>
        <div
          className="mt-2 h-[2px] w-full"
          style={{ background: 'var(--color-rule-soft, #EFE8DD)' }}
        >
          <div
            className="h-full transition-[width] duration-300"
            style={{ width: `${progress}%`, background: axis.color }}
          />
        </div>
      </div>

      {/* scene */}
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.32em] uppercase text-text-muted">场景</p>
        <h2
          className="text-2xl leading-snug"
          style={{ fontFamily: 'var(--font-fraunces, serif)' }}
        >
          {question.scene}
        </h2>
        <p className="text-base text-text-secondary leading-relaxed">{question.text}</p>
      </div>

      {/* options */}
      <div className="space-y-3">
        {question.options.map((opt) => {
          const active = current === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onPick(opt.key)}
              className="w-full text-left border rounded-2xl px-5 py-4 transition-colors hover:bg-bg-elevated"
              style={{
                borderColor: active ? axis.color : 'var(--color-rule, #E5DED4)',
                background: active ? 'var(--color-bg-elevated, #FFFCF7)' : 'transparent',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="text-sm tracking-[0.2em]"
                  style={{ color: axis.color, fontFamily: 'var(--font-fraunces, serif)' }}
                >
                  {opt.key}
                </span>
                <span className="text-base leading-relaxed flex-1">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <button
          onClick={onBack}
          disabled={index === 0}
          className="tracking-[0.2em] uppercase disabled:opacity-30 hover:text-text-primary"
        >
          ← 上一题
        </button>
        <span>{question.category === 'main' ? '主测题' : '反差 / 触发'}</span>
      </div>
    </section>
  );
}

function Result({
  result,
  onReset,
}: {
  result: ReturnType<typeof scoreWtfi>;
  onReset: () => void;
}) {
  const { axes, personality, flags } = result;
  useEffect(() => {
    persistUniverseProfile({ universe: 'wtfti', axes });
  }, [axes]);
  return (
    <section className="space-y-10 mt-4">
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.32em] uppercase text-text-muted">
          您的 WTFI 人格画像
        </p>
        <h1
          className="text-4xl sm:text-5xl leading-tight"
          style={{ fontFamily: 'var(--font-fraunces, serif)', color: personality.color }}
        >
          {personality.name}
        </h1>
        <p className="text-sm tracking-[0.2em] uppercase text-text-muted">
          {personality.code} · {personality.rarity}
        </p>
        <p className="text-base text-text-secondary italic">"{personality.tagline}"</p>
      </div>

      <p className="text-base leading-relaxed">{personality.description}</p>

      {/* WTFTI 理论锚点：把 4 轴理论露出到结果上方 */}
      <TheoryAnchorCard universe="wtfti" variant="light" />

      {/* CCI 跨情境一致性：要测过 ≥ 2 个宇宙才显示有效 */}
      <CciPanel variant="light" />

      {personality.universeHint && (
        <div
          className="border-l-2 pl-4 text-sm text-text-secondary leading-relaxed"
          style={{ borderColor: personality.color }}
        >
          <div className="text-[11px] tracking-[0.25em] uppercase text-text-muted mb-1">
            跨宇宙映射
          </div>
          {personality.universeHint}
        </div>
      )}

      {/* axis bars */}
      <div className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2
            className="text-xl"
            style={{ fontFamily: 'var(--font-fraunces, serif)' }}
          >
            4 轴向量
          </h2>
          <span className="text-[11px] tracking-[0.22em] uppercase text-text-muted">
            -3 ↔ +3
          </span>
        </div>
        {WTFI_AXES.map((a) => {
          const v = axes[a.id as WtfiAxis];
          const pct = ((v + 3) / 6) * 100;
          return (
            <div key={a.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span>
                  <span style={{ color: a.color, fontFamily: 'var(--font-fraunces, serif)' }}>
                    {a.id}
                  </span>{' '}
                  <span className="text-text-secondary">{a.name}</span>
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {v >= 0 ? '+' : ''}
                  {v.toFixed(2)}
                </span>
              </div>
              <div
                className="h-[6px] w-full rounded-full relative overflow-hidden"
                style={{ background: 'var(--color-rule-soft, #EFE8DD)' }}
              >
                {/* center marker */}
                <div
                  className="absolute top-0 h-full w-px"
                  style={{ left: '50%', background: 'var(--color-text-muted, #B5A89A)' }}
                />
                <div
                  className="absolute top-0 h-full rounded-full transition-all"
                  style={{
                    background: a.color,
                    left: v >= 0 ? '50%' : `${pct}%`,
                    width: `${Math.abs(v) / 6 * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>← {a.low.label}</span>
                <span>{a.high.label} →</span>
              </div>
            </div>
          );
        })}
      </div>

      {(flags.contrastSelf || flags.drunkTrigger) && (
        <div
          className="rounded-2xl p-4 text-sm border"
          style={{ borderColor: 'var(--color-accent, #C07A8E)', background: 'rgba(192,122,142,0.06)' }}
        >
          <div className="text-[11px] tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--color-accent)' }}>
            隐藏触发
          </div>
          {flags.contrastSelf && <div>● 您选择了"不同场景下是不同的人"——反差人格隐藏卡候选</div>}
          {flags.drunkTrigger && <div>● 您选择了"醉酒后讲童年"——DRUNK 宇宙候选</div>}
        </div>
      )}

      <div className="space-y-3 pt-4">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-full text-white text-sm tracking-[0.18em] uppercase"
          style={{ background: 'var(--color-accent, #C07A8E)' }}
        >
          重新测一次
        </button>
        <Link
          href="/"
          className="block text-center text-xs tracking-[0.22em] uppercase text-text-muted hover:text-text-primary"
        >
          返回 WTFTI
        </Link>
      </div>

      {/* theory anchor */}
      <div
        className="border-t pt-6 text-[11px] text-text-muted leading-relaxed"
        style={{ borderColor: 'var(--color-rule, #E5DED4)' }}
      >
        本测试基于 Mischel & Shoda (1995){' '}
        <em>A Cognitive-Affective System Theory of Personality</em>{' '}
        框架。WTFTI 主张人格不是稳定的特质，而是"情境 × 反应模式"的组合。
        测的宇宙越多，对你主人格的画像越精确。
      </div>
    </section>
  );
}
