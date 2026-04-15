'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { CPTI_QUESTIONS, CPTI_DEFAULT_OPTIONS, shuffleCptiQuestions } from '@/lib/cpti/questions';
import type { CptiAnswerOption } from '@/lib/cpti/questions';
import { CPTI_PEER_QUESTIONS, shuffleCptiPeerQuestions } from '@/lib/cpti/peer-questions';
import type { CptiPeerQuestion } from '@/lib/cpti/peer-questions';
import { CPTI_STEALTH_QUESTIONS, shuffleCptiStealthQuestions } from '@/lib/cpti/stealth-questions';
import { calculateCptiResult } from '@/lib/cpti/scoring';
import type { Answer, CptiDimensionScore } from '@/lib/cpti/scoring';
import { matchRelationship } from '@/lib/cpti/relationship-matching';
import { encodeCptiInvite, type CptiInviteData } from '@/lib/cpti/cpti-invite';
import { saveCptiProfile, loadCptiProfile } from '@/lib/cpti/cpti-profile';
import { CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import { basePath, getSiteUrl } from '@/lib/site';
import { recordUniverseResult, recordRelationship } from '@/lib/wtf-card';

const emptySubscribe = () => () => {};

/**
 * Quiz mode:
 * - 'solo': answer self-assessment → personal result page (default)
 * - 'peer': answer peer-questions about partner (invited) → relationship result
 * - 'stealth': answer stealth-questions about crush (using own stored profile) → relationship result
 */
export type CptiQuizMode = 'solo' | 'peer' | 'stealth';

interface CptiQuizProps {
  /** Pre-set mode. If 'peer', inviteData must be provided. 'stealth' uses saved profile + targetNickname. */
  mode?: CptiQuizMode;
  /** Decoded invite data from partner A (only for 'peer' mode) */
  inviteData?: CptiInviteData | null;
  /** Nickname of the target person (only for 'stealth' mode) */
  targetNickname?: string;
}

export function CptiQuiz({ mode: initialMode = 'solo', inviteData, targetNickname }: CptiQuizProps = {}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [phase, setPhase] = useState<'quiz'>('quiz');

  const isPeerMode = initialMode === 'peer' && inviteData;
  const isStealthMode = initialMode === 'stealth';

  // Questions based on mode
  const [questions] = useState(() => {
    if (isPeerMode) {
      return shuffleCptiPeerQuestions(CPTI_PEER_QUESTIONS) as (typeof CPTI_QUESTIONS[number] | CptiPeerQuestion)[];
    }
    if (isStealthMode) {
      return shuffleCptiStealthQuestions(CPTI_STEALTH_QUESTIONS) as (typeof CPTI_QUESTIONS[number] | CptiPeerQuestion)[];
    }
    return shuffleCptiQuestions(CPTI_QUESTIONS) as (typeof CPTI_QUESTIONS[number] | CptiPeerQuestion)[];
  });

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

  const modelColor = currentQ ? CPTI_MODEL_COLORS[currentQ.model] : CPTI_MODEL_COLORS.power;

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

  // ── Finish: self-assessment done ──
  const finishSelfTest = useCallback((finalAnswers: Map<number, Answer>) => {
    if (isFinishingRef.current) return;

    isFinishingRef.current = true;
    setIsFinishing(true);

    const result = calculateCptiResult(finalAnswers, CPTI_QUESTIONS);

    // Save profile to localStorage for future invite/stealth use
    saveCptiProfile(result.personality.slug, result.dimensions);

    // Write CPTI personality to WTF Card
    recordUniverseResult('cpti', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    // Always go straight to result page
    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/cpti/result/${encodeURIComponent(result.personality.slug)}/`;
    }, 800);
  }, []);

  // ── Finish: peer-assessment done ──
  const finishPeerTest = useCallback((finalAnswers: Map<number, Answer>) => {
    if (isFinishingRef.current || !inviteData) return;

    isFinishingRef.current = true;
    setIsFinishing(true);

    // Calculate B's profile from peer-questions about A
    // Peer-questions assess what B observes about A, so we build A's "observed profile"
    // But actually Mode C is: B answers questions about A → we get B's view of A as a profile
    // Then we compute relationship between A's self-profile and B's observed profile.
    // For simplicity: peer-question answers → dimension scores (same calc logic)
    const peerResult = calculateCptiResult(finalAnswers, CPTI_PEER_QUESTIONS);

    // A's dimensions from invite
    const dimsA = inviteData.dimensions;
    // B's self-assessment of A → B's observed dimensions of A (use as B's profile proxy)
    const dimsB = peerResult.dimensions;

    const relResult = matchRelationship(dimsA, dimsB);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    // Write relationship to WTF Card collection
    recordRelationship({
      slug: relResult.relationship.slug,
      partnerNickname: inviteData.nickname || '好友',
      mySlug: peerResult.personality.slug,
      partnerSlug: inviteData.personalitySlug,
      compatibility: relResult.compatibility,
    });

    // Also record CPTI personality for B (the peer answerer)
    recordUniverseResult('cpti', peerResult.personality.slug);

    // Store relationship result in sessionStorage for the result page
    storeRelationshipResult({
      relationship: relResult.relationship,
      pairs: relResult.pairs,
      compatibility: relResult.compatibility,
      nicknameA: inviteData.nickname,
      personalitySlugA: inviteData.personalitySlug,
      dimsA: inviteData.dimensions,
      dimsB: peerResult.dimensions,
      personalitySlugB: peerResult.personality.slug,
    });

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/cpti/relationship/`;
    }, 800);
  }, [inviteData]);

  // ── Finish: stealth assessment done ──
  const finishStealthTest = useCallback((finalAnswers: Map<number, Answer>) => {
    if (isFinishingRef.current) return;

    isFinishingRef.current = true;
    setIsFinishing(true);

    // Calculate observed profile of the crush from stealth questions
    const crushResult = calculateCptiResult(finalAnswers, CPTI_STEALTH_QUESTIONS);

    // Load user's own profile from localStorage
    const myProfile = loadCptiProfile();
    if (!myProfile) {
      // Shouldn't happen — stealth mode requires prior self-test
      window.location.href = `${basePath}/cpti/test/`;
      return;
    }

    const dimsA = myProfile.dimensions;
    const dimsB = crushResult.dimensions;
    const relResult = matchRelationship(dimsA, dimsB);

    // Write to WTF Card relationship collection
    recordRelationship({
      slug: relResult.relationship.slug,
      partnerNickname: targetNickname || 'TA',
      mySlug: myProfile.slug,
      partnerSlug: crushResult.personality.slug,
      compatibility: relResult.compatibility,
    });

    // Store for result page
    storeRelationshipResult({
      relationship: relResult.relationship,
      pairs: relResult.pairs,
      compatibility: relResult.compatibility,
      nicknameA: '我',
      personalitySlugA: myProfile.slug,
      dimsA,
      dimsB,
      personalitySlugB: crushResult.personality.slug,
    });

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/cpti/relationship/`;
    }, 800);
  }, [targetNickname]);

  function storeRelationshipResult(data: Record<string, unknown>) {
    try {
      sessionStorage.setItem('cpti-relationship', JSON.stringify(data));
    } catch { /* ignore */ }
  }

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
      if (isPeerMode) {
        finishPeerTest(newAnswers);
      } else if (isStealthMode) {
        finishStealthTest(newAnswers);
      } else {
        finishSelfTest(newAnswers);
      }
    }
  }, [answers, currentIndex, currentQ, finishSelfTest, finishPeerTest, finishStealthTest, isPeerMode, isStealthMode, questions.length]);

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
      if (isPeerMode) {
        finishPeerTest(new Map(answers));
      } else if (isStealthMode) {
        finishStealthTest(new Map(answers));
      } else {
        finishSelfTest(new Map(answers));
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [answers, currentIndex, currentQ, finishSelfTest, finishPeerTest, finishStealthTest, isPeerMode, isStealthMode, mounted, questions.length]);



  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Phase: Quiz (answering questions) ──
  if (!currentQ) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Mode banners */}
      {isPeerMode && inviteData && (
        <div className="bg-rose-500/5 border-b border-rose-500/10 px-6 py-3 text-center">
          <p className="text-sm text-rose-400">
            💌 {inviteData.nickname || '对方'}想知道你们是什么关系 · 请以观察者视角回答
          </p>
        </div>
      )}
      {isStealthMode && (
        <div className="bg-purple-500/5 border-b border-purple-500/10 px-6 py-3 text-center">
          <p className="text-sm text-purple-400">
            🔮 偷偷测CP感 · 根据你对{targetNickname || 'TA'}的了解来回答
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span className="font-mono tracking-wider">
            {currentIndex + 1} / {total}
          </span>
          <span style={{ color: modelColor.base }}>
            {CPTI_MODEL_NAMES[currentQ.model]}
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
              {(currentQ.options ?? CPTI_DEFAULT_OPTIONS).map((opt: CptiAnswerOption) => {
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
                        layoutId="cpti-selected-ring"
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
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-muted text-sm">
                {(isPeerMode || isStealthMode) ? '正在生成你们的关系类型…' : '正在生成你的CP角色…'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
