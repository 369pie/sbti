'use client';

import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS, DEFAULT_OPTIONS, shuffleQuestions } from '@/lib/questions';
import type { AnswerOption } from '@/lib/questions';
import { STANDARD_QUESTIONS_V2 } from '@/lib/wtfi/standard-questions-v2';
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
import { recordUniverseResult } from '@/lib/wtf-card';
import { trackMystiEvent } from '@/lib/mysti/analytics';

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
  /** Explicit universe id for UniversePicker highlight (e.g. 'kings', 'delta') */
  universeId?: string;
  /** Custom finishing overlay emoji + text */
  finishingOverlay?: { emoji: string; text: string };
}

export function Quiz({ resultPrefix = '', showSkinToggle = true, variant = 'standard', universeId, finishingOverlay }: QuizProps = {}) {
  const searchParams = useSearchParams();
  const cpPartner = searchParams.get('cp');
  const mode = searchParams.get('mode');
  const isMysti = mode === 'mysti';

  // Track mysti test start
  useEffect(() => {
    if (isMysti) {
      trackMystiEvent('mysti_test_start');
    }
  }, [isMysti]);
  const [skinMode, setSkinMode] = useState<'standard' | 'xiuxian'>(() =>
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('skin') : null) === 'xiuxian' ? 'xiuxian' : 'standard'
  );
  const isXiuxian = skinMode === 'xiuxian';
  const modelNames = isXiuxian ? XIUXIAN_MODEL_NAMES : MODEL_NAMES;
  const modelColors = isXiuxian ? XIUXIAN_MODEL_COLORS : MODEL_COLORS;
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  // 标准入口题数瘦身：原 perDimension=3（15 维 × 3 = 45 题 + drink trigger）→ 2 即 31 题，
  // 与 banti / bird / wtfti 等宇宙体感对齐，~2 分钟可完成。维度覆盖通过 sampleQuestionsByDimension 保留。
  // ?bank=v2 切换到 clean-room 重写题库（场景投射式，规避 SBTI 句式），用于 A/B 体感与法律风险下线。
  const useV2Bank = searchParams.get('bank') === 'v2';
  const sourceBank = useV2Bank ? STANDARD_QUESTIONS_V2 : QUESTIONS;
  const [questions] = useState(() => shuffleQuestions(sourceBank, 2));
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
    const resultNamespace = isMysti ? 'mysti' : (resultPrefix === '/wtfti' ? 'wtfti' : 'sbti');

    // Track mysti test completion
    if (isMysti) {
      trackMystiEvent('mysti_test_complete', { slug: result.personality.slug });
    }

    saveStoredQuizResult(resultNamespace, {
      slug: result.personality.slug,
      storedAt: Date.now(),
      dimensionScores: result.dimensions,
      diagnostics: result.diagnostics,
    });

    // Record to WTF Card
    const cardUniverseId =
      universeId ? universeId :
      isMysti ? 'mysti' :
      resultPrefix === '/wtfti/kings' ? 'kings' :
      resultPrefix === '/wtfti/delta' ? 'delta' :
      resultPrefix === '/wtfti' ? 'wtfti' :
      isXiuxian ? 'xiuxian' : 'standard';
    recordUniverseResult(cardUniverseId, result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      const skinParam = isXiuxian ? '?skin=xiuxian' : '';
      if (cpPartner) {
        const sep = skinParam ? '&skin=xiuxian' : '';
        window.location.href = `${basePath}/cp/result?a=${encodeURIComponent(cpPartner)}&b=${encodeURIComponent(result.personality.slug)}${sep}`;
      } else if (isMysti) {
        window.location.href = `${basePath}/mysti/result/${encodeURIComponent(result.personality.slug)}${skinParam}`;
      } else if (resultPrefix === '/wtfti') {
        window.location.href = `${basePath}/wtfti/galaxy/preview/?seed=${encodeURIComponent(result.personality.slug)}`;
      } else {
        window.location.href = `${basePath}${resultPrefix}/result/${encodeURIComponent(result.personality.slug)}${skinParam}`;
      }
    }, 800);
  }, [cpPartner, isMysti, isXiuxian, resultPrefix, universeId]);

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

  // Mysti theme colors (same as MYSTI_THEMES.celestial)
  const mystiTheme = {
    bg: '#0B0D17',
    bgGradient: 'linear-gradient(180deg, #0B0D17 0%, #12152B 100%)',
    text: '#F3EFE6',
    textMuted: '#A7B0C8',
    accent: '#C9A86C',
    accentSoft: 'rgba(201,168,108,0.22)',
    divider: 'rgba(201,168,108,0.35)',
    cardSurface: '#12152B',
    cardBorder: 'rgba(201,168,108,0.45)',
    cardGlow: 'rgba(123,97,255,0.18)',
  };

  if (!mounted || !currentQ) {
    return (
      <div className={`min-h-[calc(100vh-3.5rem)] flex items-center justify-center ${isMysti ? '' : ''}`}
        style={isMysti ? { background: mystiTheme.bgGradient } : undefined}>
        <div
          className={`w-5 h-5 rounded-full border-2 ${isMysti ? '' : 'border-accent'} border-t-transparent animate-spin`}
          style={isMysti ? { borderColor: mystiTheme.accent, borderTopColor: 'transparent' } : undefined}
        />
      </div>
    );
  }

  // Xiuxian 2.0 question overlay
  const xiuxianSkin = isXiuxian ? XIUXIAN_V2_QUESTION_SKINS[currentQ.id] : undefined;
  const qText = xiuxianSkin?.text ?? currentQ.text;
  const defaultOpts = isXiuxian ? XIUXIAN_V2_DEFAULT_OPTIONS : DEFAULT_OPTIONS;
  const qOptions = xiuxianSkin?.options ?? currentQ.options ?? defaultOpts;

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] flex flex-col ${MODEL_CLASS[currentQ.model]} model-glow`}
      style={isMysti ? {
        background: mystiTheme.bgGradient,
        color: mystiTheme.text,
      } : undefined}
    >
      {/* Star particles background for mysti mode */}
      {isMysti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute inset-0" style={{
            background: `radial-gradient(circle at 50% 30%, rgba(123,97,255,0.08) 0%, transparent 60%)`,
          }} />
          {/* Star particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: mystiTheme.accent,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Universe picker */}
      {showSkinToggle && (
      <div className="px-6 pt-4 max-w-2xl mx-auto w-full flex justify-center">
        <UniversePicker
          current={universeId ?? (isXiuxian ? 'xiuxian' : 'standard')}
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
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full relative z-10">
        <div className="flex items-center justify-between text-xs mb-3"
          style={{ color: isMysti ? mystiTheme.textMuted : undefined }}>
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {totalMain}
            {showDrinkBranch && <span className="text-accent ml-1" style={isMysti ? { color: mystiTheme.accent } : undefined}>+{drinkBranchIndex + 1}</span>}
          </span>
          <span style={{ color: isMysti ? mystiTheme.accent : modelColor.base }}>
            {modelNames[currentQ.model]}
          </span>
        </div>

        {/* Progress indicator */}
        {isMysti ? (
          /* Mystical ✦ progress indicators */
          <div className="flex items-center justify-center gap-2 mb-3">
            {[...Array(totalMain)].map((_, i) => {
              const isCompleted = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isUpcoming = i > currentIndex;
              return (
                <span
                  key={i}
                  className="text-lg transition-all duration-300"
                  style={{
                    color: isCompleted ? mystiTheme.accent :
                           isCurrent ? mystiTheme.accent :
                           mystiTheme.textMuted,
                    opacity: isUpcoming ? 0.4 : 1,
                    textShadow: isCurrent ? `0 0 10px ${mystiTheme.accent}` : 'none',
                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  ✦
                </span>
              );
            })}
          </div>
        ) : (
          /* Standard progress bar */
          <div className="h-[3px] bg-border-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${modelColor.base}, ${modelColor.light})` }}
              initial={false}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        )}
      {/* Question area */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: direction * -60, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={`w-full max-w-2xl min-h-[31rem] sm:min-h-[29rem] relative z-10 ${isMysti ? 'px-2' : ''}`}
            style={isMysti ? {
              background: `linear-gradient(135deg, ${mystiTheme.cardSurface}90 0%, ${mystiTheme.cardSurface}60 100%)`,
              borderRadius: '1.5rem',
              border: `1px solid ${mystiTheme.cardBorder}`,
              padding: '2rem',
              boxShadow: `0 0 40px ${mystiTheme.cardGlow}`,
            } : undefined}
          >
            {/* Decorative ✦ corners for mysti mode */}
            {isMysti && (
              <>
                <span className="absolute top-3 left-4 text-sm" style={{ color: mystiTheme.accent, opacity: 0.5 }}>✦</span>
                <span className="absolute top-3 right-4 text-sm" style={{ color: mystiTheme.accent, opacity: 0.5 }}>✦</span>
                <span className="absolute bottom-3 left-4 text-sm" style={{ color: mystiTheme.accent, opacity: 0.5 }}>✦</span>
                <span className="absolute bottom-3 right-4 text-sm" style={{ color: mystiTheme.accent, opacity: 0.5 }}>✦</span>
              </>
            )}

            {/* Dimension badge */}
            <div className="flex justify-center mb-8">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider"
                style={isMysti ? {
                  background: mystiTheme.accentSoft,
                  color: mystiTheme.accent,
                  border: `1px solid ${mystiTheme.divider}`,
                } : {
                  background: modelColor.bg,
                  color: modelColor.base,
                  border: `1px solid ${modelColor.bg}`,
                }}
              >
                {currentQ.dimension}
              </span>
            </div>

            {/* Question text */}
            <h2
              className="text-2xl sm:text-3xl font-medium text-center leading-relaxed tracking-tight mb-12"
              style={isMysti ? { color: mystiTheme.text } : undefined}
            >
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
                    style={isMysti ? {
                      background: selected ? mystiTheme.accentSoft : `${mystiTheme.cardSurface}80`,
                      borderColor: selected ? mystiTheme.accent : mystiTheme.divider,
                      boxShadow: selected ? `0 0 12px ${mystiTheme.cardGlow}` : 'none',
                    } : selected ? { borderColor: modelColor.base } : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-colors"
                        style={isMysti ? {
                          background: selected ? mystiTheme.accent : `${mystiTheme.cardSurface}`,
                          color: selected ? '#FFFFFF' : mystiTheme.textMuted,
                        } : selected
                          ? { background: modelColor.base, color: '#FFFFFF' }
                          : { background: '#EDE8E2', color: '#9C9590' }
                        }
                      >
                        {opt.key}
                      </span>
                      <span
                        className={`text-base ${selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`}
                        style={isMysti ? {
                          color: selected ? mystiTheme.text : mystiTheme.textMuted,
                        } : undefined}
                      >
                        {opt.label}
                      </span>
                    </div>
                    {selected && (
                      <motion.div
                        layoutId="selected-ring"
                        className="absolute inset-0 rounded-2xl"
                        style={isMysti ? {
                          boxShadow: `0 0 16px ${mystiTheme.accentSoft}`,
                        } : {
                          boxShadow: `0 0 12px ${modelColor.bg}`,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Drink trigger hint */}
            {currentQ.isDrinkTrigger && (
              <p
                className="text-center text-xs mt-6 opacity-60"
                style={isMysti ? { color: mystiTheme.textMuted } : undefined}
              >
                {isXiuxian ? '此题可能触发隐藏灵酒支线 🍺' : '这道题可能会触发隐藏分支 🍺'}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-4 relative z-10">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="text-sm hover:text-text-secondary transition-colors px-4 py-2 cursor-pointer"
              style={isMysti ? { color: mystiTheme.textMuted } : { color: 'var(--text-muted)' }}
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
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={isMysti ? { background: `linear-gradient(180deg, ${mystiTheme.bg} 0%, ${mystiTheme.cardSurface} 100%)` } : undefined}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center"
            >
              {/* Pulsing glow effect for mysti mode */}
              {isMysti && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${mystiTheme.accent}40 0%, transparent 70%)`,
                    }}
                  />
                </motion.div>
              )}
              <div className="relative z-10">
                <div className="text-4xl mb-4">
                  {finishingOverlay?.emoji ?? (isMysti ? '✦' : (isXiuxian ? '🔮' : '🎯'))}
                </div>
                <p
                  className="text-lg"
                  style={isMysti ? { color: mystiTheme.text } : undefined}
                >
                  {finishingOverlay?.text ?? (isMysti ? '你的灵魂牌正在揭晓...' : (isXiuxian ? '灵镜推演中，请稳住道心…' : '正在分析你的人格…'))}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
