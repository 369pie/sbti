'use client';

import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BIRD_QUESTIONS, BIRD_DEFAULT_OPTIONS, shuffleBirdQuestions } from '@/lib/bird/questions';
import type { AnswerOption } from '@/lib/questions';
import { calculateResult } from '@/lib/scoring';
import type { Answer } from '@/lib/scoring';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { ModelType } from '@/lib/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult } from '@/lib/wtf-card';
import { UniversePicker } from '@/components/UniversePicker';

const MODEL_CLASS: Record<ModelType, string> = {
  self: 'model-self',
  emotion: 'model-emotion',
  attitude: 'model-attitude',
  action: 'model-action',
  social: 'model-social',
};

const emptySubscribe = () => () => {};

export function BirdQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => shuffleBirdQuestions(BIRD_QUESTIONS));
  const drinkBranch = useMemo(() => BIRD_QUESTIONS.filter(q => q.isDrinkBranch), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [showDrinkBranch, setShowDrinkBranch] = useState(false);
  const [drinkBranchIndex, setDrinkBranchIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const answerLockRef = useRef<number | null>(null);
  const activeQuestionIdRef = useRef<number | null>(null);
  const isFinishingRef = useRef(false);
  const finishTimeoutRef = useRef<number | null>(null);

  const allQuestions = useMemo(() => {
    if (showDrinkBranch) return drinkBranch;
    return questions;
  }, [drinkBranch, questions, showDrinkBranch]);

  const index = showDrinkBranch ? drinkBranchIndex : currentIndex;
  const currentQ = allQuestions[index];
  const currentQuestionId = currentQ?.id ?? null;
  const totalMain = questions.length;
  const progress = ((currentIndex + (showDrinkBranch ? drinkBranchIndex : 0)) / (totalMain + (showDrinkBranch ? drinkBranch.length : 0))) * 100;
  const modelColor = currentQ ? MODEL_COLORS[currentQ.model] : MODEL_COLORS.self;

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

    const result = calculateResult(finalAnswers, BIRD_QUESTIONS);

    // Record to WTF Card
    recordUniverseResult('bird', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/bird/result/${encodeURIComponent(result.personality.slug)}/`;
    }, 800);
  }, []);

  const handleAnswer = useCallback((questionId: number, value: Answer) => {
    if (!currentQ) return;
    if (isFinishingRef.current || questionId !== activeQuestionIdRef.current || answerLockRef.current === questionId) return;

    answerLockRef.current = questionId;

    const nextAnswers = new Map(answers);
    nextAnswers.set(questionId, value);
    setAnswers(nextAnswers);
    setDirection(1);

    if (showDrinkBranch) {
      if (drinkBranchIndex < drinkBranch.length - 1) {
        setDrinkBranchIndex(prev => prev + 1);
      } else {
        finishTest(nextAnswers);
      }
      return;
    }

    if (currentQ.isDrinkTrigger && value === 3) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setShowDrinkBranch(true);
        setDrinkBranchIndex(0);
      }
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishTest(nextAnswers);
    }
  }, [answers, currentIndex, currentQ, drinkBranch.length, drinkBranchIndex, finishTest, questions.length, showDrinkBranch]);

  const handleBack = useCallback(() => {
    if (isFinishingRef.current || answerLockRef.current === currentQuestionId) return;

    if (showDrinkBranch && drinkBranchIndex > 0) {
      setDirection(-1);
      setDrinkBranchIndex(prev => prev - 1);
    } else if (showDrinkBranch && drinkBranchIndex === 0) {
      setShowDrinkBranch(false);
      setDirection(-1);
    } else if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, currentQuestionId, drinkBranchIndex, showDrinkBranch]);

  useEffect(() => {
    if (!mounted || currentQ || isFinishingRef.current || answers.size === 0) return;

    const mainOutOfRange = !showDrinkBranch && currentIndex >= questions.length;
    const branchOutOfRange = showDrinkBranch && drinkBranchIndex >= drinkBranch.length;

    if (mainOutOfRange || branchOutOfRange) {
      const timeoutId = window.setTimeout(() => {
        finishTest(new Map(answers));
      }, 0);
      return () => { window.clearTimeout(timeoutId); };
    }
  }, [answers, currentIndex, currentQ, drinkBranch.length, drinkBranchIndex, finishTest, mounted, questions.length, showDrinkBranch]);

  const canGoBack = currentIndex > 0 || (showDrinkBranch && drinkBranchIndex >= 0);

  if (!mounted || !currentQ) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] flex flex-col ${MODEL_CLASS[currentQ.model]} model-glow`}>
      <div className="px-6 pt-4 max-w-2xl mx-auto w-full flex justify-center">
        <UniversePicker current="bird" />
      </div>

      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {totalMain}
            {showDrinkBranch && <span className="text-accent ml-1">+{drinkBranchIndex + 1}</span>}
          </span>
          <span style={{ color: modelColor.base }}>
            {MODEL_NAMES[currentQ.model]}
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

            <h2 className="text-2xl sm:text-3xl font-medium text-center leading-relaxed tracking-tight mb-12">
              {currentQ.text}
            </h2>

            <div className="flex flex-col gap-3 max-w-md mx-auto">
              {(currentQ.options ?? BIRD_DEFAULT_OPTIONS).map((opt: AnswerOption) => {
                const selected = answers.get(currentQ.id) === opt.value;
                return (
                  <motion.button
                    key={opt.key}
                    onClick={() => handleAnswer(currentQ.id, opt.value as Answer)}
                    disabled={isFinishing}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative w-full py-4 px-6 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
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
                        layoutId="bird-selected-ring"
                        className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: `0 0 12px ${modelColor.bg}` }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {currentQ.isDrinkTrigger && (
              <p className="text-center text-text-muted text-xs mt-6 opacity-60">
                这道题可能会触发森林派对隐藏分支 🍷
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-4">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors px-4 py-2 cursor-pointer"
            >
              ← 上一题
            </button>
          )}
        </div>
      </div>

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
              <div className="text-4xl mb-4">🐦</div>
              <p className="text-text-secondary text-lg">正在翻译你的鸟格…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
