'use client';

import { useState, useCallback, useMemo, useSyncExternalStore, useRef, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiPath } from '@/lib/api';
import {
  calculateFlexResult,
  sampleQuestions,
  type ScoringMode,
  type FlexAxis,
  type FlexQuestion,
  type FlexPersonalityProfile,
} from '@/lib/ugc/flexible-scoring';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreatorQuizProps {
  universeSlug: string;
  universeName: string;
  emoji: string;
  primaryColor: string;
  scoringMode: ScoringMode;
  axes: FlexAxis[];
  questions: FlexQuestion[];
  personalities: FlexPersonalityProfile[];
  questionsPerTest?: number;
  universeId: string;
}

const emptySubscribe = () => () => {};

// ─── Component ───────────────────────────────────────────────────────────────

export function CreatorQuiz({
  universeSlug,
  emoji,
  primaryColor,
  scoringMode,
  axes,
  questions: allQuestions,
  personalities,
  questionsPerTest,
  universeId,
}: CreatorQuizProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const questions = useMemo(
    () => sampleQuestions(allQuestions, questionsPerTest),
    [allQuestions, questionsPerTest],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const answerLockRef = useRef<string | null>(null);
  const isFinishingRef = useRef(false);
  const resultSessionIdRef = useRef<string>('');

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  useLayoutEffect(() => {
    answerLockRef.current = null;
  }, [currentIndex]);

  useEffect(() => {
    isFinishingRef.current = isFinishing;
  }, [isFinishing]);

  const ensureResultSessionId = useCallback(() => {
    if (!resultSessionIdRef.current) {
      resultSessionIdRef.current = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    return resultSessionIdRef.current;
  }, []);

  const finishTest = useCallback((finalAnswers: Map<string, string>) => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setIsFinishing(true);

    const result = calculateFlexResult(scoringMode, finalAnswers, questions, axes, personalities);
    const sessionId = ensureResultSessionId();
    const referrer = typeof document !== 'undefined' ? (document.referrer || null) : null;

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        `creator-quiz:last-result:${universeId}`,
        JSON.stringify({
          sessionId,
          personalitySlug: result.matchedSlug,
          sharedTracked: false,
          createdAt: Date.now(),
        }),
      );
    }

    // Record result (fire-and-forget)
    fetch(getApiPath('/ugc/result'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        universeId,
        personalitySlug: result.matchedSlug,
        sessionId,
        scores: Object.fromEntries(result.axisScores.map(a => [a.key, a.score])),
        referrer,
      }),
    }).catch(() => {});

    setTimeout(() => {
      router.push(`/c/${universeSlug}/result/${result.matchedSlug}/`);
    }, 1500);
  }, [scoringMode, questions, axes, personalities, universeId, universeSlug, router, ensureResultSessionId]);

  const handleAnswer = useCallback((optionId: string) => {
    if (!currentQ) return;
    if (answerLockRef.current === currentQ.id) return;
    answerLockRef.current = currentQ.id;

    const newAnswers = new Map(answers);
    newAnswers.set(currentQ.id, optionId);
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        finishTest(newAnswers);
      } else {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [currentQ, answers, currentIndex, questions.length, finishTest]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-2xl">{emoji}</div>
      </div>
    );
  }

  if (isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0a0a0a' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          {emoji}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-white/60"
        >
          正在揭示你的真实面目…
        </motion.p>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <motion.div
          className="h-full"
          style={{ background: primaryColor }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="pt-12 pb-4 px-6 text-center">
        <p className="text-white/40 text-sm">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 className="text-xl font-bold text-white mb-8 text-center leading-relaxed">
              {currentQ.text}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((option) => {
                const isSelected = answers.get(currentQ.id) === option.id;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full p-4 rounded-2xl text-left transition-all duration-200 ${
                      isSelected
                        ? 'text-white border'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                    style={isSelected ? {
                      background: `${primaryColor}20`,
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 2px ${primaryColor}`,
                    } : undefined}
                  >
                    <span className="text-sm leading-relaxed">{option.text}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        {currentIndex > 0 && (
          <div className="pb-8 pt-4">
            <button
              onClick={goBack}
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              ← 上一题
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
