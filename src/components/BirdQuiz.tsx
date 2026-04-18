'use client';

import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { BIRD_QUESTIONS, BIRD_DEFAULT_OPTIONS, shuffleBirdQuestions } from '@/lib/bird/questions';
import type { AnswerOption } from '@/lib/questions';
import { calculateResult } from '@/lib/scoring';
import type { Answer } from '@/lib/scoring';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import { basePath } from '@/lib/site';
import { recordUniverseResult } from '@/lib/wtf-card';
import { UniversePicker } from '@/components/UniversePicker';
import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from './QuizShell';

const BIRD_ACCENT = '#7A8A82';

const emptySubscribe = () => () => {};

export function BirdQuiz() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [questions] = useState(() => shuffleBirdQuestions(BIRD_QUESTIONS));
  const drinkBranch = useMemo(() => BIRD_QUESTIONS.filter(q => q.isDrinkBranch), []);

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
  }, [drinkBranch, questions, showDrinkBranch]);

  const index = showDrinkBranch ? drinkBranchIndex : currentIndex;
  const currentQ = allQuestions[index];
  const currentQuestionId = currentQ?.id ?? null;
  const totalMain = questions.length;
  const progress = ((currentIndex + (showDrinkBranch ? drinkBranchIndex : 0)) / (totalMain + (showDrinkBranch ? drinkBranch.length : 0))) * 100;
  const modelColor = currentQ ? MODEL_COLORS[currentQ.model] : MODEL_COLORS.self;

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

    const result = calculateResult(finalAnswers, BIRD_QUESTIONS);

    // Record to WTF Card
    recordUniverseResult('bird', result.personality.slug);

    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    finishTimeoutRef.current = window.setTimeout(() => {
      window.location.href = `${basePath}/bird/result/${encodeURIComponent(result.personality.slug)}/`;
    }, 800);
  }, []);

  const handleAnswer = useCallback((questionId: number, value: Answer) => {
    if (!currentQ) return;
    if (isFinishingRef.current || questionId !== activeQuestionIdRef.current || answerLockRef.current === questionId) return;

    answerLockRef.current = questionId;

    const nextAnswers = new Map(answers);
    nextAnswers.set(questionId, value);
    setAnswers(nextAnswers);
    setDirection(1);

    if (showDrinkBranch) {
      if (drinkBranchIndex < drinkBranch.length - 1) {
        setDrinkBranchIndex(prev => prev + 1);
      } else {
        finishTest(nextAnswers);
      }
      return;
    }

    if (currentQ.isDrinkTrigger && value === 3) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setShowDrinkBranch(true);
        setDrinkBranchIndex(0);
      }
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishTest(nextAnswers);
    }
  }, [answers, currentIndex, currentQ, drinkBranch.length, drinkBranchIndex, finishTest, questions.length, showDrinkBranch]);

  const handleBack = useCallback(() => {
    if (isFinishingRef.current || answerLockRef.current === currentQuestionId) return;

    if (showDrinkBranch && drinkBranchIndex > 0) {
      setDirection(-1);
      setDrinkBranchIndex(prev => prev - 1);
    } else if (showDrinkBranch && drinkBranchIndex === 0) {
      setShowDrinkBranch(false);
      setDirection(-1);
    } else if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
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
      return () => { window.clearTimeout(timeoutId); };
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

  const accent = modelColor.base ?? BIRD_ACCENT;
  const branchTotal = drinkBranch.length;
  const totalShown = totalMain + (showDrinkBranch ? branchTotal : 0);
  const stepShown = currentIndex + (showDrinkBranch ? drinkBranchIndex + 1 : 0);
  const branchExtraLabel = showDrinkBranch ? `+ Forest ${drinkBranchIndex + 1}/${branchTotal}` : undefined;

  return (
    <QuizShell
      currentIndex={stepShown}
      total={totalShown}
      progress={totalShown > 0 ? stepShown / totalShown : 0}
      branchExtraLabel={branchExtraLabel}
      direction={direction === 1 ? 1 : -1}
      onBack={canGoBack ? handleBack : undefined}
      accent={accent}
      eyebrow={showDrinkBranch ? 'Bird · 森林派对' : 'Bird · 你是哪种鸟'}
      dimensionLabel={`${currentQ.dimension} · ${MODEL_NAMES[currentQ.model]}`}
      topSlot={<UniversePicker current="bird" />}
      footerLabel="WTFti · BIRD · 群鸟图鉴"
      finishing={isFinishing}
      finishingLabel="正在翻译你的鸟格"
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>
      <QuizOptions>
        {(currentQ.options ?? BIRD_DEFAULT_OPTIONS).map((opt: AnswerOption) => {
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
      {currentQ.isDrinkTrigger && (
        <p className="text-center text-[11px] tracking-[0.25em] uppercase text-text-muted mt-6 opacity-70">
          这道题可能会触发森林派对隐藏分支 🍷
        </p>
      )}
    </QuizShell>
  );
}
