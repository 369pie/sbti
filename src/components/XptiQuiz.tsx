'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XPTI_QUESTIONS, XPTI_DEFAULT_OPTIONS, shuffleXptiQuestions } from '@/lib/xpti/questions';
import type { XptiAnswerOption } from '@/lib/xpti/questions';
import { calculateXptiResult } from '@/lib/xpti/scoring';
import type { Answer } from '@/lib/xpti/scoring';
import { XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult } from '@/lib/wtf-card';
import { UniversePicker } from '@/components/UniversePicker';

const emptySubscribe = () => () => {};

export function XptiQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => shuffleXptiQuestions(XPTI_QUESTIONS));

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
  const progress = ((currentIndex) / total) * 100;

  const modelColor = currentQ ? XPTI_MODEL_COLORS[currentQ.model] : XPTI_MODEL_COLORS.power;

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

    const result = calculateXptiResult(finalAnswers, XPTI_QUESTIONS);

    // Record to WTF Card
    recordUniverseResult('xpti', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/xpti/result/${encodeURIComponent(result.personality.slug)}/`;
    }, 800);
  }, []);

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

  if (!mounted || !currentQ) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="px-6 pt-4 max-w-2xl mx-auto w-full flex justify-center">
        <UniversePicker current="xpti" />
      </div>

      {/* Progress */}
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {total}
          </span>
          <span style={{ color: modelColor.base }}>
            {XPTI_MODEL_NAMES[currentQ.model]}
          </span>
        </div>

        <div className="h-[3px] bg-border-subtle rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${modelColor.base}, ${modelColor.light})` }}
            initial={false}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: direction * -60, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl"
          >
            {/* Dimension badge */}
            <div className="flex justify-center mb-8">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider"
                style={{
                  background: modelColor.bg,
                  color: modelColor.base,
                  border: `1px solid ${modelColor.bg}`,
                }}
              >
                {currentQ.dimension}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-2xl sm:text-3xl font-medium text-center leading-relaxed tracking-tight mb-12">
              {currentQ.text}
            </h2>

            {/* Answer buttons */}
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              {(currentQ.options ?? XPTI_DEFAULT_OPTIONS).map((opt: XptiAnswerOption) => {
                const selected = answers.get(currentQ.id) === opt.value;
                return (
                  <motion.button
                    key={opt.key}
                    onClick={() => handleAnswer(currentQ.id, opt.value as Answer)}
                    disabled={isFinishing}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative w-full py-4 px-6 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'bg-bg-elevated border-2 shadow-sm'
                        : 'bg-bg-elevated border border-border-subtle hover:border-border hover:shadow-sm'
                    } disabled:cursor-not-allowed disabled:opacity-80`}
                    style={selected ? { borderColor: modelColor.base } : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-colors"
                        style={
                          selected
                            ? { background: modelColor.base, color: '#FFFFFF' }
                            : { background: '#EDE8E2', color: '#9C9590' }
                        }
                      >
                        {opt.key}
                      </span>
                      <span className={`text-base ${selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`}>
                        {opt.label}
                      </span>
                    </div>
                    {selected && (
                      <motion.div
                        layoutId="xpti-selected-ring"
                        className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: `0 0 12px ${modelColor.bg}` }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-4">
          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors px-4 py-2 cursor-pointer"
            >
              ← 上一题
            </button>
          )}
        </div>
      </div>

      {/* Finishing overlay */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-bg-primary flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-4xl mb-4">💜</div>
              <p className="text-text-secondary text-lg">正在解码你的恋爱XP体质…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
