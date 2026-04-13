'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIdentifyQuestions, calculateIdentifyResult } from '@/lib/identify/scoring';
import type { Answer } from '@/lib/identify/scoring';
import type { IdentifyAnswerOption } from '@/lib/identify/questions';
import { IDENTIFY_MODEL_NAMES, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import { basePath } from '@/lib/site';
import { saveStoredQuizResult } from '@/lib/quiz-result-session';

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
  const progress = ((currentIndex) / total) * 100;

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
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3">你要鉴定谁？</h1>
          <p className="text-text-secondary mb-8">
            输入 ta 的昵称（选填），然后回答关于 ta 的 10 道题
          </p>

          <div className="mb-6">
            <input
              type="text"
              value={friendName}
              onChange={e => setFriendName(e.target.value)}
              placeholder="输入好友昵称，如：小花"
              maxLength={20}
              className="w-full px-5 py-4 rounded-2xl border border-border-subtle bg-bg-elevated text-center text-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30 transition-all"
              onKeyDown={e => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-lg hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer"
          >
            开始鉴定 →
          </button>

          <p className="text-xs text-text-muted mt-4">
            不输入昵称也可以直接开始
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Phase: Finishing ──
  if (phase === 'finishing') {
    const displayName = friendName.trim() || 'ta';
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-text-secondary">
            正在鉴定<span className="text-text-primary font-medium"> {displayName} </span>的人格...
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Phase: Quiz ──
  if (!currentQ) return null;

  const displayName = friendName.trim() || 'ta';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {total}
          </span>
          <span style={{ color: modelColor.base }}>
            鉴定 {displayName} · {IDENTIFY_MODEL_NAMES[currentQ.model]}
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
              {currentQ.options.map((opt: IdentifyAnswerOption) => {
                const selected = answers.get(currentQ.id) === opt.value;
                return (
                  <motion.button
                    key={opt.key}
                    onClick={() => handleAnswer(currentQ.id, opt.value as Answer)}
                    disabled={isFinishingRef.current}
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
                      <span className="text-[15px] leading-relaxed text-text-secondary group-hover:text-text-primary transition-colors">
                        {opt.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Back button */}
            {currentIndex > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleBack}
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  ← 上一题
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
