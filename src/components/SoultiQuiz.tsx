'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from './QuizShell';
import { SOULTI_QUESTIONS, SOULTI_ACT_NAMES, shuffleSoultiQuestions } from '@/lib/soulti/questions';
import type { SoultiAnswerOption } from '@/lib/soulti/questions';
import { calculateSoultiResult } from '@/lib/soulti/scoring';
import { calculateSoultiLayeredResult } from '@/lib/soulti/scoring';
import type { Answer } from '@/lib/soulti/scoring';
import { SOULTI_MODEL_NAMES, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult } from '@/lib/wtf-card';
import { UniversePicker } from '@/components/UniversePicker';

const emptySubscribe = () => () => {};

export function SoultiQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => shuffleSoultiQuestions(SOULTI_QUESTIONS));

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

  const modelColor = currentQ ? SOULTI_MODEL_COLORS[currentQ.model] : SOULTI_MODEL_COLORS.tide;

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

    const result = calculateSoultiResult(finalAnswers, questions);

    // Calculate and persist layered (three-mirror) result
    try {
      const layered = calculateSoultiLayeredResult(finalAnswers, questions);
      localStorage.setItem('soulti-layered', JSON.stringify(layered));
    } catch { /* localStorage unavailable — non-critical */ }

    // Record to WTF Card
    recordUniverseResult('soulti', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/soulti/result/${encodeURIComponent(result.personality.slug)}/`;
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
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const actName = SOULTI_ACT_NAMES[currentQ.act];

  const accent = modelColor.base ?? '#A85A6E';

  return (
    <QuizShell
      currentIndex={currentIndex}
      total={total}
      direction={direction === 1 ? 1 : -1}
      onBack={handleBack}
      accent={accent}
      eyebrow="Soulti · 灵魂之味"
      dimensionLabel={`${currentQ.dimension} · ${SOULTI_MODEL_NAMES[currentQ.model]}`}
      footerLabel="WTFti · SOULTI · 灵魂之味"
      finishing={isFinishing}
      finishingLabel="正在打捞你的灵魂之味"
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>
      <QuizOptions>
        {currentQ.options.map((opt: SoultiAnswerOption) => {
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
