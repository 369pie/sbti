'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { CPTI_QUESTIONS, CPTI_DEFAULT_OPTIONS, shuffleCptiQuestions } from '@/lib/cpti/questions';
import type { CptiAnswerOption } from '@/lib/cpti/questions';
import { CPTI_PEER_QUESTIONS, shuffleCptiPeerQuestions } from '@/lib/cpti/peer-questions';
import type { CptiPeerQuestion } from '@/lib/cpti/peer-questions';
import { CPTI_STEALTH_QUESTIONS, shuffleCptiStealthQuestions } from '@/lib/cpti/stealth-questions';
import { calculateCptiResult } from '@/lib/cpti/scoring';
import type { Answer } from '@/lib/cpti/scoring';
import { matchRelationship } from '@/lib/cpti/relationship-matching';
import type { CptiInviteData } from '@/lib/cpti/cpti-invite';
import { saveCptiProfile, loadCptiProfile } from '@/lib/cpti/cpti-profile';
import { CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult, recordRelationship } from '@/lib/wtf-card';
import { cptiApi } from '@/lib/cpti/cpti-api';
import type { CptiPricingIntent } from '@/lib/cpti/pricing-intents';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from '@/components/QuizShell';

/** CPTI 主调：枯玫瑰，与品牌 rose 同根。 */
const CPTI_ACCENT = 'var(--color-rose-deep)';

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
  /** Pair code ID for server-side paired flow (from /cpti/join) */
  pairCodeId?: string;
  /** Optional inviter nickname for six-digit pair code flow */
  pairPartnerNickname?: string;
  /** Optional pricing funnel hint to preserve through the solo result redirect */
  pricingIntent?: Extract<CptiPricingIntent, 'deep' | 'cosign' | 'seasonal'>;
}

export function CptiQuiz({
  mode: initialMode = 'solo',
  inviteData,
  targetNickname,
  pairCodeId,
  pairPartnerNickname,
  pricingIntent,
}: CptiQuizProps = {}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

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

  const storeRelationshipResult = useCallback((data: Record<string, unknown>) => {
    try {
      sessionStorage.setItem('cpti-relationship', JSON.stringify(data));
    } catch {
      // ignore storage failures
    }
  }, []);

  // ── Finish: self-assessment done ──
  const finishSelfTest = useCallback(async (finalAnswers: Map<number, Answer>) => {
    if (isFinishingRef.current) return;

    isFinishingRef.current = true;
    setIsFinishing(true);

    const result = calculateCptiResult(finalAnswers, CPTI_QUESTIONS);

    // Save profile to localStorage for future invite/stealth use
    saveCptiProfile(result.personality.slug, result.dimensions);

    // Also persist to backend DB (fire-and-forget, don't block navigation)
    const source = pairCodeId ? 'pair_flow' : 'self_test';
    // Write CPTI personality to WTF Card
    recordUniverseResult('cpti', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    try {
      await cptiApi.bootstrap();
      await cptiApi.saveProfile({
        personalitySlug: result.personality.slug,
        dimensionScores: result.dimensions,
        source,
      });

      if (pairCodeId) {
        const participantAnswers = Object.fromEntries(
          Array.from(finalAnswers.entries()).map(([qid, value]) => [qid, value as number]),
        );

        const startRes = await cptiApi.startMatch({ pairCodeId });
        const completeRes = await cptiApi.completeMatch({
          matchId: startRes.matchId,
          initiatorAnswers: {},
          participantAnswers,
        });

        recordRelationship({
          slug: completeRes.relationship.slug,
          partnerNickname: pairPartnerNickname || '对方',
          mySlug: completeRes.participantProfile.personality.slug,
          partnerSlug: completeRes.initiatorProfile.personality.slug,
          compatibility: completeRes.compatibility,
        });

        try {
          sessionStorage.setItem('cpti-relationship-backend', JSON.stringify(completeRes));
        } catch {
          // ignore storage failures
        }

        storeRelationshipResult({
          relationship: completeRes.relationship,
          pairs: [],
          compatibility: completeRes.compatibility,
          nicknameA: pairPartnerNickname || '对方',
          personalitySlugA: completeRes.initiatorProfile.personality.slug,
          personalitySlugB: completeRes.participantProfile.personality.slug,
          dimsA: completeRes.initiatorProfile.dimensions,
          dimsB: completeRes.participantProfile.dimensions,
        });

        finishTimeoutRef.current = window.setTimeout(() => {
          window.location.href = `${basePath}/cpti/relationship/`;
        }, 800);
        return;
      }
    } catch (err) {
      console.warn('[CPTI] Failed to complete paired backend flow:', err);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (pricingIntent) params.set('intent', pricingIntent);
      const query = params.toString();
      window.location.href = `${basePath}/cpti/result/${encodeURIComponent(result.personality.slug)}/${query ? `?${query}` : ''}`;
    }, 800);
  }, [pairCodeId, pairPartnerNickname, pricingIntent, storeRelationshipResult]);

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
  }, [inviteData, storeRelationshipResult]);

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
  }, [storeRelationshipResult, targetNickname]);

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
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center" style={{ background: 'var(--color-paper)' }}>
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--color-rose-deep)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const dimensionLabel = CPTI_MODEL_NAMES[currentQ.model];
  const accent = modelColor.base ?? CPTI_ACCENT;
  const eyebrow = isPeerMode ? 'CPTI · Peer' : isStealthMode ? 'CPTI · Stealth' : 'CPTI · Couple';
  const finishingLabel = (isPeerMode || isStealthMode) ? '正在生成你们的关系类型' : '正在生成你的 CP 角色';

  // Mode banner — kept above QuizShell so progress bar stays the first thing in view
  const banner = isPeerMode && inviteData ? (
    <div className="px-6 pt-3 max-w-2xl mx-auto w-full">
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5 text-center">
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-rose-deep)' }}>
          💌 {inviteData.nickname || '对方'}想知道你们是什么关系 · 请以观察者视角回答
        </p>
      </div>
    </div>
  ) : isStealthMode ? (
    <div className="px-6 pt-3 max-w-2xl mx-auto w-full">
      <div className="rounded-md border px-4 py-2.5 text-center" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-secondary)' }}>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-accent)' }}>
          🔮 偷偷测 CP 感 · 根据你对{targetNickname || 'TA'}的了解来回答
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      {banner}
      <QuizShell
        currentIndex={currentIndex}
        total={total}
        direction={direction as 1 | -1}
        onBack={handleBack}
        accent={accent}
        eyebrow={eyebrow}
        dimensionLabel={dimensionLabel}
        footerLabel="WTFti · CPTI · 关系类型图鉴"
        finishing={isFinishing}
        finishingLabel={finishingLabel}
      >
        <QuestionTitle>{currentQ.text}</QuestionTitle>

        <QuizOptions>
          {(currentQ.options ?? CPTI_DEFAULT_OPTIONS).map((opt: CptiAnswerOption) => {
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
    </>
  );
}
