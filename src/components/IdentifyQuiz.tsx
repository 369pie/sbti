'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { getIdentifyQuestions, calculateIdentifyResult } from '@/lib/identify/scoring';
import type { Answer } from '@/lib/identify/scoring';
import type { IdentifyAnswerOption } from '@/lib/identify/questions';
import { IDENTIFY_MODEL_NAMES, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import { basePath } from '@/lib/site';
import { saveStoredQuizResult } from '@/lib/quiz-result-session';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from './QuizShell';

const IDENTIFY_ACCENT = '#A85A6E';

const emptySubscribe = () => () => {};

export function IdentifyQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Phase: 'name' → 'quiz' → 'finishing'
  const [phase, setPhase] = useState<'name' | 'quiz' | 'finishing'>('name');
  const [friendName, setFriendName] = useState('');
  const [questions] = useState(() => getIdentifyQuestions());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [direction, setDirection] = useState(1);
  const answerLockRef = useRef<number | null>(null);
  const activeQuestionIdRef = useRef<number | null>(null);
  const isFinishingRef = useRef(false);
  const finishTimeoutRef = useRef<number | null>(null);

  const currentQ = phase === 'quiz' ? questions[currentIndex] : null;
  const currentQuestionId = currentQ?.id ?? null;
  const total = questions.length;

  const modelColor = currentQ ? IDENTIFY_MODEL_COLORS[currentQ.model] : IDENTIFY_MODEL_COLORS.social;

  useLayoutEffect(() => {
    activeQuestionIdRef.current = currentQuestionId;
    if (currentQuestionId !== null) {
      answerLockRef.current = null;
    }
  }, [currentQuestionId]);

  useEffect(() => {
    return () => {
      if (finishTimeoutRef.current !== null) {
        window.clearTimeout(finishTimeoutRef.current);
      }
    };
  }, []);

  const finishTest = useCallback((finalAnswers: Map<number, Answer>) => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setPhase('finishing');

    const result = calculateIdentifyResult(finalAnswers, questions);

    // Save friend name alongside result
    const name = friendName.trim() || 'ta';
    try {
      window.sessionStorage.setItem('sbti:identify-friend-name', name);
    } catch { /* ignore */ }

    saveStoredQuizResult('identify', {
      slug: result.persona.slug,
      storedAt: Date.now(),
      dimensionScores: result.dimensions,
      diagnostics: result.diagnostics,
    });

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/identify/result/${encodeURIComponent(result.persona.slug)}/`;
    }, 800);
  }, [questions, friendName]);

  const handleAnswer = useCallback((questionId: number, value: Answer) => {
    if (!currentQ) return;
    if (isFinishingRef.current || questionId !== activeQuestionIdRef.current || answerLockRef.current === questionId) return;

    answerLockRef.current = questionId;

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, value);
    setAnswers(newAnswers);
    setDirection(1);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      finishTest(newAnswers);
    }
  }, [answers, currentIndex, currentQ, finishTest, questions.length]);

  const handleBack = useCallback(() => {
    if (isFinishingRef.current || answerLockRef.current === currentQuestionId) return;
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex, currentQuestionId]);

  const handleStartQuiz = useCallback(() => {
    setPhase('quiz');
  }, []);

  useEffect(() => {
    if (!mounted || currentQ || isFinishingRef.current || answers.size === 0 || currentIndex < questions.length) return;

    const timeoutId = window.setTimeout(() => {
      finishTest(new Map(answers));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [answers, currentIndex, currentQ, finishTest, mounted, questions.length]);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Phase: Name Input ──
  if (phase === 'name') {
    return (
      <div
        className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center px-6 py-12"
        style={{ background: 'var(--color-paper)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <p className="eyebrow mb-3" style={{ color: IDENTIFY_ACCENT }}>Identify · Friend</p>
          <h1
            className="text-3xl sm:text-4xl mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', fontWeight: 500 }}
          >
            你要鉴定<span className="editorial-italic"> 谁 </span>?
          </h1>
          <p className="text-text-secondary mb-10 leading-relaxed">
            输入 ta 的昵称（选填），然后回答关于 ta 的 10 道题
          </p>

          <div className="mb-6">
            <input
              type="text"
              value={friendName}
              onChange={e => setFriendName(e.target.value)}
              placeholder="输入好友昵称，如：小花"
              maxLength={20}
              className="w-full px-5 py-4 text-center text-lg focus:outline-none transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-rule-soft)',
                color: 'var(--color-ink)',
                borderRadius: 0,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = IDENTIFY_ACCENT)}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-rule-soft)')}
              onKeyDown={e => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>

          <button
            onClick={handleStartQuiz}
            className="btn btn-rose w-full"
          >
            开始鉴定 →
          </button>

          <p className="text-[11px] tracking-[0.25em] uppercase text-text-muted mt-6">
            不输入昵称也可以直接开始
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Phase: Quiz ──
  if (!currentQ) return null;

  const displayName = friendName.trim() || 'ta';
  const accent = modelColor.base ?? IDENTIFY_ACCENT;

  return (
    <QuizShell
      currentIndex={currentIndex}
      total={total}
      direction={direction === 1 ? 1 : -1}
      onBack={handleBack}
      accent={accent}
      eyebrow={`Identify · ${displayName}`}
      dimensionLabel={`${currentQ.dimension} · ${IDENTIFY_MODEL_NAMES[currentQ.model]}`}
      footerLabel={`WTFti · IDENTIFY · 鉴定 ${displayName}`}
      finishing={phase === 'finishing'}
      finishingLabel={`正在鉴定 ${displayName} 的人格`}
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>
      <QuizOptions>
        {currentQ.options.map((opt: IdentifyAnswerOption) => {
          const selected = answers.get(currentQ.id) === opt.value;
          return (
            <QuizOption
              key={opt.key}
              marker={opt.key}
              label={opt.label}
              selected={selected}
              disabled={phase === 'finishing'}
              accent={accent}
              onSelect={() => handleAnswer(currentQ.id, opt.value as Answer)}
            />
          );
        })}
      </QuizOptions>
    </QuizShell>
  );
}
