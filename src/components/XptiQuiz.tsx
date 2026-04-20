'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { XPTI_QUESTIONS, XPTI_DEFAULT_OPTIONS, shuffleXptiQuestions } from '@/lib/xpti/questions';
import type { XptiAnswerOption } from '@/lib/xpti/questions';
import { calculateXptiResult } from '@/lib/xpti/scoring';
import { saveXptiResult } from '@/lib/xpti/storage';
import type { Answer } from '@/lib/xpti/scoring';
import { XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult } from '@/lib/wtf-card';
import { UniversePicker } from '@/components/UniversePicker';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from '@/components/QuizShell';

const emptySubscribe = () => () => {};

/** XPTI 主调：枯玫瑰 / 深酒红，取自 XptiHomeContent 的 velvet palette。 */
const XPTI_ACCENT = '#A85A6E';

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

  const modelColor = currentQ ? XPTI_MODEL_COLORS[currentQ.model] : XPTI_MODEL_COLORS.dominance;

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

    const result = calculateXptiResult(finalAnswers, questions);

    // Persist user's actual dimension scores so couple/archive features can
    // read them without forcing a re-test (Sprint 2-3 of v3.0).
    saveXptiResult(result);

    // Record to WTF Card
    recordUniverseResult('xpti', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/xpti/result/${encodeURIComponent(result.personality.slug)}/`;
    }, 800);
  }, [questions]);

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
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center" style={{ background: 'var(--color-paper)' }}>
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: XPTI_ACCENT, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const dimensionLabel = XPTI_MODEL_NAMES[currentQ.model];
  const accent = modelColor.base ?? XPTI_ACCENT;

  return (
    <QuizShell
      currentIndex={currentIndex}
      total={total}
      direction={direction as 1 | -1}
      onBack={handleBack}
      accent={accent}
      eyebrow="XPTI · Intimacy"
      dimensionLabel={dimensionLabel}
      topSlot={<UniversePicker current="xpti" />}
      footerLabel="WTFti · XPTI · 亲密偏好图谱"
      finishing={isFinishing}
      finishingLabel="正在解码你的亲密偏好图谱"
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>

      <QuizOptions>
        {(currentQ.options ?? XPTI_DEFAULT_OPTIONS).map((opt: XptiAnswerOption) => {
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
  );
}
