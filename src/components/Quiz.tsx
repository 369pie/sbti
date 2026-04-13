'use client';

import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS, DEFAULT_OPTIONS, shuffleQuestions } from '@/lib/questions';
import type { AnswerOption } from '@/lib/questions';
import { calculateResult } from '@/lib/scoring';
import type { Answer } from '@/lib/scoring';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { ModelType } from '@/lib/dimensions';
import { basePath } from '@/lib/site';
import { XIUXIAN_V2_QUESTION_SKINS, XIUXIAN_V2_DEFAULT_OPTIONS } from '@/lib/xiuxian-questions-v2';
import { XIUXIAN_MODEL_NAMES, XIUXIAN_MODEL_COLORS } from '@/lib/xiuxian';
import { UniversePicker } from '@/components/UniversePicker';
import type { Universe } from '@/lib/universes';
import { saveStoredQuizResult } from '@/lib/quiz-result-session';

const MODEL_CLASS: Record<ModelType, string> = {
  self: 'model-self',
  emotion: 'model-emotion',
  attitude: 'model-attitude',
  action: 'model-action',
  social: 'model-social',
};

const emptySubscribe = () => () => {};

interface QuizProps {
  /** Path prefix before /result/, e.g. '/wtfti' for /wtfti/result/[slug] */
  resultPrefix?: string;
  /** Whether to show the xiuxian/standard skin toggle (default: true) */
  showSkinToggle?: boolean;
  /** Which variant is active: 'standard' or 'wtfti' */
  variant?: 'standard' | 'wtfti';
  /** Custom finishing overlay emoji + text */
  finishingOverlay?: { emoji: string; text: string };
}

export function Quiz({ resultPrefix = '', showSkinToggle = true, variant = 'standard', finishingOverlay }: QuizProps = {}) {
  const searchParams = useSearchParams();
  const cpPartner = searchParams.get('cp');
  const [skinMode, setSkinMode] = useState<'standard' | 'xiuxian'>(() =>
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('skin') : null) === 'xiuxian' ? 'xiuxian' : 'standard'
  );
  const isXiuxian = skinMode === 'xiuxian';
  const modelNames = isXiuxian ? XIUXIAN_MODEL_NAMES : MODEL_NAMES;
  const modelColors = isXiuxian ? XIUXIAN_MODEL_COLORS : MODEL_COLORS;
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => shuffleQuestions(QUESTIONS, 3));
  const drinkBranch = useMemo(() => QUESTIONS.filter(q => q.isDrinkBranch), []);

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
  }, [showDrinkBranch, questions, drinkBranch]);

  const idx = showDrinkBranch ? drinkBranchIndex : currentIndex;
  const currentQ = allQuestions[idx];
  const currentQuestionId = currentQ?.id ?? null;
  const totalMain = questions.length;
  const progress = ((currentIndex + (showDrinkBranch ? drinkBranchIndex : 0)) / (totalMain + (showDrinkBranch ? drinkBranch.length : 0))) * 100;

  const modelColor = currentQ ? modelColors[currentQ.model] : modelColors.self;

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

    const result = calculateResult(finalAnswers, QUESTIONS);
    const resultNamespace = resultPrefix === '/wtfti' ? 'wtfti' : 'sbti';

    saveStoredQuizResult(resultNamespace, {
      slug: result.personality.slug,
      storedAt: Date.now(),
      dimensionScores: result.dimensions,
      diagnostics: result.diagnostics,
    });

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      const skinParam = isXiuxian ? '?skin=xiuxian' : '';
      if (cpPartner) {
        const sep = skinParam ? '&skin=xiuxian' : '';
        window.location.href = `${basePath}/cp/result?a=${encodeURIComponent(cpPartner)}&b=${encodeURIComponent(result.personality.slug)}${sep}`;
      } else {
        window.location.href = `${basePath}${resultPrefix}/result/${encodeURIComponent(result.personality.slug)}${skinParam}`;
      }
    }, 800);
  }, [cpPartner, isXiuxian, resultPrefix]);

  const handleAnswer = useCallback((questionId: number, value: Answer) => {
    if (!currentQ) return;
    if (isFinishingRef.current || questionId !== activeQuestionIdRef.current || answerLockRef.current === questionId) return;

    answerLockRef.current = questionId;

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, value);
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
      finishTest(newAnswers);
    }
  }, [answers, currentIndex, currentQ, drinkBranch, drinkBranchIndex, finishTest, questions, showDrinkBranch]);

  const handleBack = useCallback(() => {
    if (isFinishingRef.current || answerLockRef.current === currentQuestionId) return;

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
  }, [currentIndex, currentQuestionId, drinkBranchIndex, showDrinkBranch]);

  useEffect(() => {
    if (!mounted || currentQ || isFinishingRef.current || answers.size === 0) return;

    const mainOutOfRange = !showDrinkBranch && currentIndex >= questions.length;
    const branchOutOfRange = showDrinkBranch && drinkBranchIndex >= drinkBranch.length;

    if (mainOutOfRange || branchOutOfRange) {
      const timeoutId = window.setTimeout(() => {
        finishTest(new Map(answers));
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
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

  // Xiuxian 2.0 question overlay
  const xiuxianSkin = isXiuxian ? XIUXIAN_V2_QUESTION_SKINS[currentQ.id] : undefined;
  const qText = xiuxianSkin?.text ?? currentQ.text;
  const defaultOpts = isXiuxian ? XIUXIAN_V2_DEFAULT_OPTIONS : DEFAULT_OPTIONS;
  const qOptions = xiuxianSkin?.options ?? currentQ.options ?? defaultOpts;

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] flex flex-col ${MODEL_CLASS[currentQ.model]} model-glow`}>
      {/* Universe picker */}
      {showSkinToggle && (
      <div className="px-6 pt-4 max-w-2xl mx-auto w-full flex justify-center">
        <UniversePicker
          current={variant === 'wtfti' ? 'wtfti' : isXiuxian ? 'xiuxian' : 'standard'}
          onSelect={(u: Universe) => {
            // standard ↔ xiuxian can switch in-page without navigation
            if (variant === 'standard' && (u.id === 'standard' || u.id === 'xiuxian')) {
              const next = u.id === 'xiuxian';
              setSkinMode(next ? 'xiuxian' : 'standard');
              const url = new URL(window.location.href);
              if (next) { url.searchParams.set('skin', 'xiuxian'); }
              else { url.searchParams.delete('skin'); }
              window.history.replaceState({}, '', url.toString());
              return true; // prevent Link navigation
            }
            return false; // allow Link navigation for other universes
          }}
        />
      </div>
      )}

      {/* Progress */}
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {totalMain}
            {showDrinkBranch && <span className="text-accent ml-1">+{drinkBranchIndex + 1}</span>}
          </span>
          <span style={{ color: modelColor.base }}>
            {modelNames[currentQ.model]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-border-subtle rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${modelColor.base}, ${modelColor.light})` }}
            initial={false}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      {/* Question area */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: direction * -60, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl min-h-[31rem] sm:min-h-[29rem]"
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
              {qText}
            </h2>

            {/* Answer buttons */}
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              {qOptions.map((opt: AnswerOption) => {
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
                        layoutId="selected-ring"
                        className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: `0 0 12px ${modelColor.bg}` }}
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
                {isXiuxian ? '此题可能触发隐藏灵酒支线 🍺' : '这道题可能会触发隐藏分支 🍺'}
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
              <div className="text-4xl mb-4">{finishingOverlay?.emoji ?? (isXiuxian ? '🔮' : '🎯')}</div>
              <p className="text-text-secondary text-lg">
                {finishingOverlay?.text ?? (isXiuxian ? '灵镜推演中，请稳住道心…' : '正在分析你的人格…')}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
