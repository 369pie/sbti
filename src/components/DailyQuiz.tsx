'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyQuestions, calculateDailyResult } from '@/lib/daily/scoring';
import type { Answer } from '@/lib/daily/scoring';
import type { DailyAnswerOption } from '@/lib/daily/questions';
import { DAILY_QUESTIONS } from '@/lib/daily/questions';
import { DAILY_MODEL_NAMES, DAILY_MODEL_COLORS } from '@/lib/daily/dimensions';
import type { DailyModelType } from '@/lib/daily/dimensions';
import { basePath } from '@/lib/site';

export function DailyQuiz() {
  const [mounted, setMounted] = useState(false);
  const [questions] = useState(() => getDailyQuestions());

  useEffect(() => { setMounted(true); }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const answerLockRef = useRef<number | null>(null);

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex) / total) * 100;
  const isAnswerLocked = currentQ ? answerLockRef.current === currentQ.id : false;

  const modelColor = currentQ ? DAILY_MODEL_COLORS[currentQ.model] : DAILY_MODEL_COLORS.energy;

  useEffect(() => {
    if (currentQ) {
      answerLockRef.current = null;
    }
  }, [currentQ?.id]);

  const handleAnswer = useCallback((value: Answer) => {
    if (!currentQ || isFinishing || answerLockRef.current === currentQ.id) return;
    answerLockRef.current = currentQ.id;

    const newAnswers = new Map(answers);
    newAnswers.set(currentQ.id, value);
    setAnswers(newAnswers);
    setDirection(1);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinishing(true);
      const result = calculateDailyResult(newAnswers, DAILY_QUESTIONS);
      setTimeout(() => {
        window.location.href = `${basePath}/daily/result/${encodeURIComponent(result.status.slug)}/`;
      }, 800);
    }
  }, [currentQ, answers, currentIndex, questions, isFinishing]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  if (!mounted || !currentQ) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {total}
          </span>
          <span style={{ color: modelColor.base }}>
            {DAILY_MODEL_NAMES[currentQ.model]}
          </span>
        </div>

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
              {currentQ.options.map((opt: DailyAnswerOption) => {
                const selected = answers.get(currentQ.id) === opt.value;
                return (
                  <motion.button
                    key={opt.key}
                    onClick={() => handleAnswer(opt.value as Answer)}
                    disabled={isAnswerLocked || isFinishing}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative w-full py-4 px-6 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'bg-bg-tertiary border-2'
                        : 'bg-bg-secondary/60 border border-border-subtle hover:border-border hover:bg-bg-tertiary/50'
                    } disabled:cursor-not-allowed disabled:opacity-80`}
                    style={selected ? { borderColor: modelColor.base } : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-colors"
                        style={
                          selected
                            ? { background: modelColor.base, color: '#110f1c' }
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
                        layoutId="daily-selected-ring"
                        className="absolute inset-0 rounded-xl"
                        style={{ boxShadow: `0 0 20px ${modelColor.bg}` }}
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
              <div className="text-4xl mb-4">🔮</div>
              <p className="text-text-secondary text-lg">正在读取你今天的状态…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
