'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { getDailyQuestions, calculateDailyResult } from '@/lib/daily/scoring';
import type { Answer } from '@/lib/daily/scoring';
import type { DailyAnswerOption } from '@/lib/daily/questions';
import { DAILY_MODEL_NAMES, DAILY_MODEL_COLORS } from '@/lib/daily/dimensions';
import { basePath } from '@/lib/site';
import { saveStoredQuizResult } from '@/lib/quiz-result-session';
import { cacheDailyResult, loadTodayResult } from '@/lib/daily/fortune';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from './QuizShell';

const DAILY_ACCENT = '#B8905A';

const emptySubscribe = () => () => {};

export function DailyQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => getDailyQuestions());
  const cachedSlug = useSyncExternalStore(
    emptySubscribe,
    () => loadTodayResult(),
    () => null,
  );
  const redirecting = cachedSlug !== null;

  // Auto-redirect if already tested today
  useEffect(() => {
    if (!mounted || !cachedSlug) return;
    window.location.href = `${basePath}/daily/result/${encodeURIComponent(cachedSlug)}/`;
  }, [mounted, cachedSlug]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const answerLockRef = useRef<number | null>(null);
  const activeQuestionIdRef = useRef<number | null>(null);
  const isFinishingRef = useRef(false);
  const finishTimeoutRef = useRef<number | null>(null);

  const currentQ = questions[currentIndex];
  const currentQuestionId = currentQ?.id ?? null;
  const total = questions.length;

  const modelColor = currentQ ? DAILY_MODEL_COLORS[currentQ.model] : DAILY_MODEL_COLORS.energy;

  useLayoutEffect(() => {
    activeQuestionIdRef.current = currentQuestionId;

    if (currentQuestionId !== null) {
      answerLockRef.current = null;
    }
  }, [currentQuestionId]);

  useEffect(() => {
    isFinishingRef.current = isFinishing;
  }, [isFinishing]);

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
    setIsFinishing(true);

    const result = calculateDailyResult(finalAnswers, questions);

    saveStoredQuizResult('daily', {
      slug: result.status.slug,
      storedAt: Date.now(),
      dimensionScores: result.dimensions,
      diagnostics: result.diagnostics,
    });

    // Cache today's result for daily lock
    cacheDailyResult(result.status.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/daily/result/${encodeURIComponent(result.status.slug)}/`;
    }, 800);
  }, [questions]);

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

  useEffect(() => {
    if (!mounted || currentQ || isFinishingRef.current || answers.size === 0 || currentIndex < questions.length) return;

    const timeoutId = window.setTimeout(() => {
      finishTest(new Map(answers));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [answers, currentIndex, currentQ, finishTest, mounted, questions.length]);

  if (!mounted || !currentQ || redirecting) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const accent = modelColor.base ?? DAILY_ACCENT;

  return (
    <QuizShell
      currentIndex={currentIndex}
      total={total}
      direction={direction === 1 ? 1 : -1}
      onBack={handleBack}
      accent={accent}
      eyebrow="Daily · 今日运势"
      dimensionLabel={`${currentQ.dimension} · ${DAILY_MODEL_NAMES[currentQ.model]}`}
      footerLabel="WTFti · DAILY · 今日人设"
      finishing={isFinishing}
      finishingLabel="正在读取你今天的状态"
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>
      <QuizOptions>
        {currentQ.options.map((opt: DailyAnswerOption) => {
          const selected = answers.get(currentQ.id) === opt.value;
          return (
            <QuizOption
              key={opt.key}
              marker={opt.key}
              label={opt.label}
              selected={selected}
              disabled={isFinishing}
              accent={accent}
              onSelect={() => handleAnswer(currentQ.id, opt.value as Answer)}
            />
          );
        })}
      </QuizOptions>
    </QuizShell>
  );
}
