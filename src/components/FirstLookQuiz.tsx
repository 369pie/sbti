'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FIRST_LOOK_QUESTIONS, type FirstLookOption, type FirstLookQuestion } from '@/lib/first-look/questions';
import { computeFirstLookResult, type FirstLookAnswerMap } from '@/lib/first-look/scoring';
import { saveFirstLookResult } from '@/lib/first-look/session';
import { trackFirstLook } from '@/lib/first-look/analytics';
import { recordUniverseResult } from '@/lib/wtf-card';
import { withBasePath } from '@/lib/site';

type Phase = 'intro' | 'quiz' | 'sealing';

const FINISH_DURATION_MS = 1600;

export function FirstLookQuiz() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<FirstLookAnswerMap>(() => new Map());
  const [direction, setDirection] = useState<1 | -1>(1);

  const question: FirstLookQuestion | undefined = FIRST_LOOK_QUESTIONS[currentIndex];
  const total = FIRST_LOOK_QUESTIONS.length;
  const progress = Math.min(100, Math.round(((currentIndex) / total) * 100));

  // Track entry once when intro mounts
  const entryTracked = useRef(false);
  const quizStartAt = useRef<number | null>(null);
  useEffect(() => {
    if (!entryTracked.current) {
      entryTracked.current = true;
      trackFirstLook('first_look_entry', { stage: 'intro' });
    }
  }, []);

  const finalizeResult = useCallback(
    (finalAnswers: FirstLookAnswerMap) => {
      const result = computeFirstLookResult(finalAnswers);
      saveFirstLookResult({
        slug: result.archetype.slug,
        code: result.archetype.code,
        vector: result.vector,
        deepDive: result.deepDive,
      });
      trackFirstLook('first_look_finish', {
        slug: result.archetype.slug,
        code: result.archetype.code,
        rarity: result.archetype.rarity,
        primary: result.deepDive[0]?.target,
        elapsed_ms: quizStartAt.current ? Date.now() - quizStartAt.current : undefined,
      });
      try {
        recordUniverseResult('first-look', result.archetype.slug);
      } catch {
        // wtf-card is optional; never block navigation
      }
      router.push(withBasePath(`/test/result/${result.archetype.slug}/`));
    },
    [router],
  );

  const handleSelect = useCallback(
    (option: FirstLookOption) => {
      if (!question) return;
      const nextAnswers = new Map(answers);
      nextAnswers.set(question.id, option.key);
      trackFirstLook('first_look_q', { id: question.id, key: option.key });
      setAnswers(nextAnswers);

      if (currentIndex + 1 >= total) {
        setPhase('sealing');
        window.setTimeout(() => finalizeResult(nextAnswers), FINISH_DURATION_MS);
        return;
      }
      setDirection(1);
      setCurrentIndex(i => i + 1);
    },
    [answers, currentIndex, finalizeResult, question, total],
  );

  const goBack = useCallback(() => {
    if (currentIndex === 0) {
      setPhase('intro');
      return;
    }
    setDirection(-1);
    setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  const startQuiz = useCallback(() => {
    quizStartAt.current = Date.now();
    trackFirstLook('first_look_entry', { stage: 'start_quiz' });
    setPhase('quiz');
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────
  const pageClass =
    'min-h-[calc(100vh-3.5rem)] w-full flex flex-col relative overflow-hidden paper-texture';

  if (phase === 'intro') {
    return (
      <div className={pageClass} style={{ background: 'var(--color-paper)' }}>
        <IntroRitual onStart={startQuiz} />
      </div>
    );
  }

  if (phase === 'sealing') {
    return (
      <div className={pageClass} style={{ background: 'var(--color-paper)' }}>
        <SealingRitual />
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className={pageClass} style={{ background: 'var(--color-paper)' }}>
      {/* Top bar */}
      <header className="max-w-2xl mx-auto w-full px-6 pt-6 sm:pt-10 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="text-xs tracking-[0.3em] uppercase text-text-muted hover:text-text-primary transition-colors"
          aria-label="上一题"
        >
          ← 回上一题
        </button>
        <span className="serial-number text-xs">
          {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </header>

      {/* Progress rule */}
      <div className="max-w-2xl mx-auto w-full px-6 mt-2">
        <div className="h-[2px] w-full" style={{ background: 'var(--color-rule-soft)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'var(--color-accent)' }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Question body */}
      <main className="max-w-2xl mx-auto w-full px-6 flex-1 flex flex-col justify-center py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, y: direction * 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <QuestionHeader question={question} />
            <div className="mt-8 sm:mt-10">
              {question.variant === 'duo' ? (
                <DuoOptions options={question.options} onSelect={handleSelect} />
              ) : (
                <TrioOptions options={question.options} onSelect={handleSelect} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Foot */}
      <footer className="max-w-2xl mx-auto w-full px-6 pb-8 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
          WTFti · 初见 · First Look
        </p>
      </footer>
    </div>
  );
}

// ── Intro ritual ───────────────────────────────────────────────────────────

function IntroRitual({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center">
        {/* Serial badge */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="serial-number text-xs">N° 00</span>
          <span className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--color-rule)' }} />
          <span className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
            First Look
          </span>
          <span className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--color-rule)' }} />
        </div>

        {/* Glyph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 flex items-center justify-center"
          style={{ width: 120, height: 120 }}
        >
          <MoonCrest />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="editorial-display text-4xl sm:text-5xl mb-5 leading-[1.05]"
          style={{ color: 'var(--color-ink)' }}
        >
          你的<span className="editorial-italic" style={{ color: 'var(--color-rose-deep)' }}>第一张牌</span>
          <br />
          正在洗。
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-[15px] sm:text-base text-text-secondary leading-[1.8] max-w-md mx-auto mb-10"
        >
          10 道直觉题，3-4 分钟。<br />
          不是问卷，是一次被看见的小仪式。
          <br className="hidden sm:block" />
          结果会告诉你——今晚更适合去哪条深潜支线。
        </motion.p>

        <motion.button
          type="button"
          onClick={onStart}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="btn btn-ink min-w-[200px] group"
        >
          翻开第一张牌
          <span
            className="ml-2 inline-block transition-transform duration-500 group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 text-xs text-text-muted"
        >
          想回到经典 SBTI 46 题？ <Link href="/test/classic/" prefetch={false} className="underline underline-offset-4">点这里</Link>
        </motion.p>
      </div>
    </div>
  );
}

function MoonCrest() {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
      <defs>
        <linearGradient id="moon-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D4B58A" />
          <stop offset="1" stopColor="#8C3E3E" />
        </linearGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="url(#moon-gold)"
        strokeWidth="1"
      />
      <circle
        cx="60"
        cy="60"
        r="30"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="0.7"
        opacity="0.6"
      />
      {/* Waxing crescent */}
      <path d="M60 18 A42 42 0 1 0 60 102 A28 42 0 1 1 60 18 Z" fill="var(--color-accent)" opacity="0.12" />
      {/* Cross star */}
      <g transform="translate(60 60)" stroke="url(#moon-gold)" strokeWidth="0.8">
        <line x1="0" y1="-54" x2="0" y2="-46" />
        <line x1="0" y1="46" x2="0" y2="54" />
        <line x1="-54" y1="0" x2="-46" y2="0" />
        <line x1="46" y1="0" x2="54" y2="0" />
      </g>
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fontFamily="var(--font-editorial)"
        fontSize="26"
        fontStyle="italic"
        fill="var(--color-ink)"
      >
        ☾
      </text>
    </svg>
  );
}

// ── Sealing ritual ──────────────────────────────────────────────────────────

function SealingRitual() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8"
        >
          <MoonCrest />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="editorial-display text-2xl sm:text-3xl mb-3"
        >
          正在为你封印这张牌……
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-sm text-text-muted tracking-[0.2em]"
        >
          Sealing · Reading · Naming
        </motion.p>
      </div>
    </div>
  );
}

// ── Question header ─────────────────────────────────────────────────────────

function QuestionHeader({ question }: { question: FirstLookQuestion }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="serial-number text-xs">{question.eyebrow.split(' · ')[0]}</span>
        <span className="h-px w-8" style={{ background: 'var(--color-rule)' }} />
        <span className="text-[10px] tracking-[0.3em] uppercase text-text-muted">
          {question.eyebrow.split(' · ')[1] ?? ''}
        </span>
      </div>
      <h2 className="editorial-display mt-4 text-2xl sm:text-3xl leading-[1.25]" style={{ color: 'var(--color-ink)' }}>
        {question.prompt}
      </h2>
    </>
  );
}

// ── Duo / trio option cards ─────────────────────────────────────────────────

interface OptionGroupProps {
  options: FirstLookOption[];
  onSelect: (o: FirstLookOption) => void;
}

function DuoOptions({ options, onSelect }: OptionGroupProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((option, i) => (
        <OptionCard key={option.key} option={option} onSelect={onSelect} index={i} />
      ))}
    </div>
  );
}

function TrioOptions({ options, onSelect }: OptionGroupProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option, i) => (
        <OptionCard key={option.key} option={option} onSelect={onSelect} index={i} compact />
      ))}
    </div>
  );
}

interface OptionCardProps {
  option: FirstLookOption;
  index: number;
  compact?: boolean;
  onSelect: (o: FirstLookOption) => void;
}

function OptionCard({ option, onSelect, index, compact }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.35 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={`relative text-left group overflow-hidden transition-colors ${compact ? 'p-5' : 'p-6 sm:p-7'}`}
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-rule-soft)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <div className="flex items-baseline gap-3 mb-3">
        <span className="serial-number text-xs">{option.key}</span>
        <span className="h-px flex-1" style={{ background: 'var(--color-rule-soft)' }} />
      </div>
      <p
        className={`editorial-display leading-[1.35] ${compact ? 'text-lg' : 'text-xl sm:text-[22px]'}`}
        style={{ color: 'var(--color-ink)' }}
      >
        {option.label}
      </p>
      {option.sublabel && (
        <p className={`text-text-muted mt-2 leading-[1.6] ${compact ? 'text-xs' : 'text-sm'}`}>
          {option.sublabel}
        </p>
      )}
      {/* Hover underline */}
      <span
        className="absolute left-6 bottom-4 h-px w-8 transition-all duration-500 group-hover:w-20"
        style={{ background: 'var(--color-accent)' }}
      />
    </motion.button>
  );
}

export default FirstLookQuiz;
