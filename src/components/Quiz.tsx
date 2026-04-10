'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS, shuffleQuestions } from '@/lib/questions';
import { calculateResult } from '@/lib/scoring';
import type { Answer } from '@/lib/scoring';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { ModelType } from '@/lib/dimensions';

const ANSWER_OPTIONS = [
  { value: 1 as Answer, label: '不认同', key: 'A' },
  { value: 2 as Answer, label: '中立', key: 'B' },
  { value: 3 as Answer, label: '认同', key: 'C' },
];

const MODEL_CLASS: Record<ModelType, string> = {
  self: 'model-self',
  emotion: 'model-emotion',
  attitude: 'model-attitude',
  action: 'model-action',
  social: 'model-social',
};

export function Quiz() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [questions] = useState(() => {
    const main = shuffleQuestions(QUESTIONS.filter(q => !q.isDrinkBranch));
    return main;
  });

  useEffect(() => { setMounted(true); }, []);
  const drinkBranch = useMemo(() => QUESTIONS.filter(q => q.isDrinkBranch), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [showDrinkBranch, setShowDrinkBranch] = useState(false);
  const [drinkBranchIndex, setDrinkBranchIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  const allQuestions = useMemo(() => {
    if (showDrinkBranch) return drinkBranch;
    return questions;
  }, [showDrinkBranch, questions, drinkBranch]);

  const idx = showDrinkBranch ? drinkBranchIndex : currentIndex;
  const currentQ = allQuestions[idx];
  const totalMain = questions.length;
  const progress = ((currentIndex + (showDrinkBranch ? drinkBranchIndex : 0)) / (totalMain + (showDrinkBranch ? drinkBranch.length : 0))) * 100;

  const modelColor = currentQ ? MODEL_COLORS[currentQ.model] : MODEL_COLORS.self;

  const handleAnswer = useCallback((value: Answer) => {
    if (!currentQ || isFinishing) return;
    const newAnswers = new Map(answers);
    newAnswers.set(currentQ.id, value);
    setAnswers(newAnswers);
    setDirection(1);

    if (showDrinkBranch) {
      if (drinkBranchIndex < drinkBranch.length - 1) {
        setDrinkBranchIndex(i => i + 1);
      } else {
        finishTest(newAnswers);
      }
      return;
    }

    // Check if drink trigger
    if (currentQ.isDrinkTrigger && value === 3) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setShowDrinkBranch(true);
        setDrinkBranchIndex(0);
      }
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      if (currentQ.isDrinkTrigger && value === 3) {
        setShowDrinkBranch(true);
      } else {
        finishTest(newAnswers);
      }
    }
  }, [currentQ, answers, currentIndex, questions, showDrinkBranch, drinkBranchIndex, drinkBranch, isFinishing]);

  const handleBack = useCallback(() => {
    if (showDrinkBranch && drinkBranchIndex > 0) {
      setDirection(-1);
      setDrinkBranchIndex(i => i - 1);
    } else if (showDrinkBranch && drinkBranchIndex === 0) {
      setShowDrinkBranch(false);
      setDirection(-1);
    } else if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex, showDrinkBranch, drinkBranchIndex]);

  const finishTest = (finalAnswers: Map<number, Answer>) => {
    setIsFinishing(true);
    const result = calculateResult(finalAnswers, QUESTIONS);
    // Brief delay for animation
    setTimeout(() => {
      router.push(`/result/${result.personality.slug}`);
    }, 800);
  };

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
      {/* Progress */}
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

        {/* Progress bar */}
        <div className="h-[3px] bg-bg-tertiary rounded-full overflow-hidden">
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
              {ANSWER_OPTIONS.map(opt => {
                const selected = answers.get(currentQ.id) === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative w-full py-4 px-6 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'bg-bg-tertiary border-2'
                        : 'bg-bg-secondary/60 border border-border-subtle hover:border-border hover:bg-bg-tertiary/50'
                    }`}
                    style={selected ? { borderColor: modelColor.base } : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-colors"
                        style={
                          selected
                            ? { background: modelColor.base, color: '#0c0a09' }
                            : { background: 'rgba(68,64,60,0.5)', color: '#a8a29e' }
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
                        layoutId="selected-ring"
                        className="absolute inset-0 rounded-xl"
                        style={{ boxShadow: `0 0 20px ${modelColor.bg}` }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Drink trigger hint */}
            {currentQ.isDrinkTrigger && (
              <p className="text-center text-text-muted text-xs mt-6 opacity-60">
                这道题可能会触发隐藏分支 🍺
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
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
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-text-secondary text-lg">正在分析你的人格…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
