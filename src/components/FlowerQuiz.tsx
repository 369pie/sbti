'use client';

import { useState, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from './QuizShell';
import { FLOWER_QUESTIONS, FLOWER_DEFAULT_OPTIONS, shuffleFlowerQuestions } from '@/lib/flower/questions';
import type { FlowerAnswerOption } from '@/lib/flower/questions';
import { calculateFlowerResult } from '@/lib/flower/scoring';
import type { Answer } from '@/lib/flower/scoring';
import { FLOWER_MODEL_NAMES, FLOWER_MODEL_COLORS } from '@/lib/flower/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult } from '@/lib/wtf-card';
import { UniversePicker } from '@/components/UniversePicker';

const emptySubscribe = () => () => {};

export function FlowerQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => shuffleFlowerQuestions(FLOWER_QUESTIONS));

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

  const modelColor = currentQ ? FLOWER_MODEL_COLORS[currentQ.model] : FLOWER_MODEL_COLORS.photosynthesis;

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

    const result = calculateFlowerResult(finalAnswers, FLOWER_QUESTIONS);

    // Record to WTF Card
    recordUniverseResult('flower', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/flower/result/${encodeURIComponent(result.personality.slug)}/`;
    }, 800);
  }, []);

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
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const accent = modelColor.base ?? '#B85470';

  return (
    <QuizShell
      currentIndex={currentIndex}
      total={total}
      direction={direction === 1 ? 1 : -1}
      onBack={handleBack}
      accent={accent}
      eyebrow="Flower · 花的人格"
      dimensionLabel={`${currentQ.dimension} · ${FLOWER_MODEL_NAMES[currentQ.model]}`}
      footerLabel="WTFti · FLOWER · 花语图鉴"
      finishing={isFinishing}
      finishingLabel="正在为你择一朵对应的花"
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>
      <QuizOptions>
        {(currentQ.options ?? FLOWER_DEFAULT_OPTIONS).map((opt: FlowerAnswerOption) => {
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
