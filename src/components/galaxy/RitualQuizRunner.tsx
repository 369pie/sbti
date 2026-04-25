'use client';

/**
 * RitualQuizRunner · WTFTI 主测仪式跑酷
 *
 * 战略来源：
 *   - docs/01-strategy/wtfti-ritual-quiz-grammar-2026-04-20.md §4 18 题章节流
 *   - docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §7 90 秒情绪编排
 *
 * 体验时间线：
 *   ① BigBangIntro（3s）        → 黑屏奇点爆炸 + 主神召唤词
 *   ② DeityRollCall（5s）        → 8 主神剪影流过 + 幽默尾句
 *   ③ SanctumGate（C1）          → 双手按住 1.5s 解锁
 *   ④ Chapter I  · 引力轴（rose）   ← 主题库 share 32%
 *   ⑤ Chapter II · 暗面之井（twilight）  ← 主题库 share 22% + 1 道 meme 题
 *   ⑥ SummonOverlay（4s）         → 屏幕震动 + 暗面苏醒预告
 *   ⑦ Chapter III · 命运织线（gold）  ← 主题库 share 46%
 *   ⑧ Chapter IV · 灵魂探针（aurora）← SoulProbeQuiz（6 题）
 *   ⑨ StardustSealing（C3）       → 写一封 30 天后给自己的信
 *   ⑩ → /wtfti/galaxy/preview/?seed=...&soul=...
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ChapterShell,
  EitherOrPlanets,
  MirrorSlider,
  PolaroidStack,
  SanctumGate,
  StardustSealing,
  TarotPull,
  TwoAmText,
} from '@/components/quiz-formats';
import { SoulProbeQuiz } from '@/components/galaxy/SoulProbeQuiz';
import { SAxisQuiz } from '@/components/galaxy/SAxisQuiz';
import { BigBangIntro } from '@/components/galaxy/ritual/BigBangIntro';
import { DeityRollCall } from '@/components/galaxy/ritual/DeityRollCall';
import { SummonOverlay } from '@/components/galaxy/ritual/SummonOverlay';
import { QUESTIONS, shuffleQuestions } from '@/lib/questions';
import type { Question } from '@/lib/questions';
import { calculateResult } from '@/lib/scoring';
import type { Answer } from '@/lib/scoring';
import { basePath } from '@/lib/site';
import { saveStoredQuizResult } from '@/lib/quiz-result-session';
import { recordUniverseResult } from '@/lib/wtf-card';
import {
  MEME_QUESTION,
  RITUAL_CHAPTERS,
  sliceQuestionsByChapter,
  type QuizFormatHint,
} from '@/lib/wtfi/ritual-script';
import {
  decodeSoulAnswers,
  encodeSoulAnswers,
  isSoulComplete,
  type SoulAnswers,
} from '@/lib/wtfi/soul-resonance';
import { buildGalaxyResult } from '@/lib/wtfi/galaxy-builder';
import {
  generateResultId,
  saveGalaxySession,
  type GalaxySession,
} from '@/lib/wtfi/galaxy-session';
import type { SScoreResult } from '@/lib/wtfi/scoring-s';
import { projectClassicResult } from '@/lib/wtfi/projection';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';
import { scheduleMonthlyRetestLetter } from '@/lib/wtfi/letters-archive';

const SOUL_STORAGE_KEY = 'wtfti.soul.answers.v1';
const CLASSIC_TOGGLE_KEY = 'wtfti.ritual.classic';

type Phase =
  | { kind: 'big-bang' }
  | { kind: 'roll-call' }
  | { kind: 'sanctum' }
  | { kind: 'chapter-intro'; chapterIdx: 0 | 1 | 2 }
  | { kind: 'chapter-question'; chapterIdx: 0 | 1 | 2; questionIdx: number }
  | { kind: 'meme' }
  | { kind: 'summon' }
  | { kind: 'soul-intro' }
  | { kind: 'soul' }
  | { kind: 's-intro' }
  | { kind: 's-axis' }
  | { kind: 'sealing' };

interface Props {
  /** 跳过 BigBang/RollCall/SanctumGate/Sealing 等仪式，直接答题 */
  fastPath?: boolean;
  /** 从结果页补跑 S 轴，不重做主测 */
  startSoul?: boolean;
  /** 可续跑的旧结果 session；没有它就退回完整仪式 */
  resumeSession?: GalaxySession | null;
  /** 好友邀请原始值 `<seedSlug>.<soulCode>`，完成后跳转配对页 */
  friendInvite?: string | null;
}

export function RitualQuizRunner({
  fastPath = false,
  startSoul = false,
  resumeSession = null,
  friendInvite = null,
}: Props) {
  useEffect(() => {
    trackGalaxyEvent('galaxy_ritual_start', {
      step: fastPath ? 'fast_path' : 'full_ritual',
      props: { friendInvite: Boolean(friendInvite) },
    });
  }, [fastPath, friendInvite]);

  const [classicMode, setClassicMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(CLASSIC_TOGGLE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleClassic = useCallback(() => {
    setClassicMode((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(CLASSIC_TOGGLE_KEY, next ? '1' : '0');
        }
      } catch {
        // noop
      }
      return next;
    });
  }, []);

  const canResumeSoul = startSoul && Boolean(resumeSession);
  const initialSoulAnswers = useMemo(() => {
    if (!canResumeSoul) return {} as SoulAnswers;
    if (resumeSession?.soulAnswers) return resumeSession.soulAnswers;
    if (typeof window === 'undefined') return {} as SoulAnswers;
    try {
      return decodeSoulAnswers(window.localStorage.getItem(SOUL_STORAGE_KEY));
    } catch {
      return {} as SoulAnswers;
    }
  }, [canResumeSoul, resumeSession]);

  const [questions] = useState(() => shuffleQuestions(QUESTIONS, 2));
  const chapterSlices = useMemo(() => sliceQuestionsByChapter(questions), [questions]);

  const [phase, setPhase] = useState<Phase>(() =>
    canResumeSoul
      ? (isSoulComplete(initialSoulAnswers) ? { kind: 's-intro' } : { kind: 'soul-intro' })
      : fastPath
        ? { kind: 'chapter-intro', chapterIdx: 0 }
        : { kind: 'big-bang' },
  );
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [soulAnswers, setSoulAnswers] = useState<SoulAnswers>(initialSoulAnswers);
  const [shadowScore, setShadowScore] = useState<SScoreResult | null>(null);
  const [memeAnswered, setMemeAnswered] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const finishedRef = useRef(false);

  // ─────────── Phase transitions ───────────

  const advanceFromBigBang = useCallback(() => setPhase({ kind: 'roll-call' }), []);
  const advanceFromRollCall = useCallback(() => setPhase({ kind: 'sanctum' }), []);
  const advanceFromSanctum = useCallback(() => setPhase({ kind: 'chapter-intro', chapterIdx: 0 }), []);

  const startChapter = useCallback((chapterIdx: 0 | 1 | 2) => {
    setPhase({ kind: 'chapter-question', chapterIdx, questionIdx: 0 });
  }, []);

  const handleAnswer = useCallback(
    (qid: number, value: Answer) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(qid, value);
        return next;
      });
      // advance
      setPhase((curr) => {
        if (curr.kind !== 'chapter-question') return curr;
        const slice = chapterSlices[curr.chapterIdx];
        if (curr.questionIdx + 1 < slice.length) {
          return {
            kind: 'chapter-question',
            chapterIdx: curr.chapterIdx,
            questionIdx: curr.questionIdx + 1,
          };
        }
        // chapter finished
        if (curr.chapterIdx === 0) return { kind: 'chapter-intro', chapterIdx: 1 };
        if (curr.chapterIdx === 1) return { kind: 'meme' };
        return { kind: 'summon' };
      });
    },
    [chapterSlices],
  );

  const handleMemePicked = useCallback(() => {
    setMemeAnswered(true);
    setPhase({ kind: 'chapter-intro', chapterIdx: 2 });
  }, []);

  const advanceFromSummon = useCallback(() => setPhase({ kind: 'soul-intro' }), []);
  const advanceFromSoulIntro = useCallback(() => setPhase({ kind: 'soul' }), []);

  const handleSoulComplete = useCallback((next: SoulAnswers) => {
    setSoulAnswers(next);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SOUL_STORAGE_KEY, encodeSoulAnswers(next));
      }
    } catch {
      // noop
    }
    setPhase({ kind: 's-intro' });
  }, []);

  const advanceFromSIntro = useCallback(() => {
    trackGalaxyEvent('galaxy_s_axis_start', {});
    setPhase({ kind: 's-axis' });
  }, []);

  const handleSAxisComplete = useCallback((score: SScoreResult) => {
    setShadowScore(score);
    trackGalaxyEvent('galaxy_s_axis_complete', {
      slug: score.shadow.bucket,
      value: score.axisScore,
      props: {
        bucket: score.shadow.bucket,
        answered: score.completion.answered,
        timeouts: score.completion.timeouts,
      },
    });
    setPhase({ kind: 'sealing' });
  }, []);

  const skipSAxis = useCallback(() => {
    trackGalaxyEvent('galaxy_s_axis_skip', {});
    setPhase({ kind: 'sealing' });
  }, []);

  // ─────────── Finalization ───────────

  const finalize = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinishing(true);

    let resultId: string;
    let personalitySlug: string;
    let galaxyResult;
    let sourceTag = 'classic-15';

    if (canResumeSoul && resumeSession) {
      resultId = resumeSession.resultId;
      personalitySlug = resumeSession.personalitySlug;
      const rebuilt = buildGalaxyResult({
        resultId,
        personalitySlug,
        axesVector: resumeSession.result.homePlanet.axesVector,
        shadowScore: shadowScore ?? undefined,
      });
      galaxyResult = {
        ...rebuilt,
        shadow: shadowScore ? rebuilt.shadow : resumeSession.result.shadow,
        meta: {
          ...rebuilt.meta,
          createdAt: resumeSession.result.meta.createdAt,
        },
      };
      sourceTag = 'resume-session';
    } else {
      const result = calculateResult(answers, QUESTIONS);
      saveStoredQuizResult('wtfti', {
        slug: result.personality.slug,
        storedAt: Date.now(),
        dimensionScores: result.dimensions,
        diagnostics: result.diagnostics,
      });
      recordUniverseResult('wtfti', result.personality.slug);

      resultId = generateResultId();
      const wtfiProjection = projectClassicResult(result);
      const axesVector = wtfiProjection.axes;
      personalitySlug = result.personality.slug;
      galaxyResult = buildGalaxyResult({
        resultId,
        personalitySlug,
        axesVector,
        shadowScore: shadowScore ?? undefined,
      });
      sourceTag = wtfiProjection.source;
    }

    saveGalaxySession({
      resultId,
      createdAt: galaxyResult.meta.createdAt,
      personalitySlug,
      result: galaxyResult,
      soulAnswers,
    });

    trackGalaxyEvent('galaxy_result_create', {
      slug: personalitySlug,
      step: shadowScore ? 'with_shadow' : 'without_shadow',
      props: {
        homePlanet: galaxyResult.homePlanet.slug,
        shadowBucket: shadowScore?.shadow.bucket ?? 'none',
        wtfiSource: sourceTag,
      },
    });
    trackGalaxyEvent('galaxy_ritual_finish', {
      slug: personalitySlug,
      step: shadowScore ? 'with_shadow' : 'without_shadow',
      props: {
        homePlanet: galaxyResult.homePlanet.slug,
        soulAnswered: Object.keys(soulAnswers).length,
      },
    });

    // 月相复测仪式 · 28 天后由 StardustDueBanner 自动召回
    try {
      scheduleMonthlyRetestLetter(personalitySlug);
    } catch {
      /* 配额耗尽 / 私密模式 · 忽略 */
    }

    // 兼容老分享链路：仍保留 soul / friend query，但落地跳 result/[id]
    const soulCode = encodeSoulAnswers(soulAnswers);
    const params = new URLSearchParams();
    if (soulCode && soulCode !== '______') params.set('soul', soulCode);
    if (friendInvite) params.set('friend', friendInvite);
    const qs = params.toString();
    if (typeof window !== 'undefined') {
      const url = `${basePath}/wtfti/galaxy/result/${resultId}/${qs ? `?${qs}` : ''}`;
      window.location.href = url;
    }
  }, [answers, canResumeSoul, friendInvite, resumeSession, shadowScore, soulAnswers]);

  // ─────────── Render ───────────

  if (finishing) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-bg-primary)',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          fontStyle: 'italic',
          fontSize: 22,
          letterSpacing: '0.04em',
        }}
      >
        ✦ 众神正在为你写身份信 …
      </div>
    );
  }

  if (phase.kind === 'big-bang') {
    return <BigBangIntro onComplete={advanceFromBigBang} />;
  }
  if (phase.kind === 'roll-call') {
    return <DeityRollCall onComplete={advanceFromRollCall} />;
  }
  if (phase.kind === 'sanctum') {
    return (
      <RitualPageShell>
        <SanctumGate
          onUnlock={advanceFromSanctum}
          invocation="请双手按住屏幕，让神殿认出你的频率。"
        />
      </RitualPageShell>
    );
  }

  if (phase.kind === 'chapter-intro') {
    const ch = RITUAL_CHAPTERS[phase.chapterIdx];
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={phase.chapterIdx} />
        <ChapterShell
          tone={ch.tone}
          chapterMark={ch.numeral}
          eyebrow={ch.eyebrow}
          title={ch.title}
          subtitle={ch.subtitle}
          progress={(phase.chapterIdx + 0.0001) / 4}
        >
          <button
            type="button"
            onClick={() => startChapter(phase.chapterIdx)}
            style={primaryCtaStyle}
          >
            ✦ 进入这一章 ✦
          </button>
        </ChapterShell>
        <ClassicToggle classicMode={classicMode} onToggle={toggleClassic} />
      </RitualPageShell>
    );
  }

  if (phase.kind === 'chapter-question') {
    const ch = RITUAL_CHAPTERS[phase.chapterIdx];
    const slice = chapterSlices[phase.chapterIdx];
    const q = slice[phase.questionIdx];
    if (!q) {
      // safety net
      return null;
    }
    const formatHint: QuizFormatHint = classicMode
      ? 'classic-abc'
      : ch.pickFormat(q, phase.questionIdx);
    const totalAnswered = answers.size;
    const totalQuestions = chapterSlices.reduce((acc, s) => acc + s.length, 0);
    const progress = Math.min(0.999, (totalAnswered + phase.chapterIdx * 0.001) / totalQuestions);
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={phase.chapterIdx} />
        <ChapterShell
          tone={ch.tone}
          chapterMark={ch.numeral}
          eyebrow={ch.eyebrow}
          title={ch.title}
          progress={progress}
          questionIndex={phase.questionIdx + 1}
          questionTotal={slice.length}
        >
          <QuestionRenderer
            question={q}
            formatHint={formatHint}
            onAnswer={(value) => handleAnswer(q.id, value)}
          />
        </ChapterShell>
        <ClassicToggle classicMode={classicMode} onToggle={toggleClassic} />
      </RitualPageShell>
    );
  }

  if (phase.kind === 'meme') {
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={1} />
        <ChapterShell
          tone="twilight"
          chapterMark="II.5"
          eyebrow="MEME · 凌晨剧场"
          title="附赠一个不算分的问题"
          subtitle="只是想看你最近在做什么梦。"
          progress={0.55}
        >
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--color-bg-primary)',
              fontFamily: '"Noto Serif SC", serif',
            }}
          >
            {MEME_QUESTION.prompt}
          </p>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 12,
              color: 'rgba(245,240,232,0.5)',
            }}
          >
            {MEME_QUESTION.hint}
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            {MEME_QUESTION.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  if (memeAnswered) return;
                  handleMemePicked();
                }}
                style={memeButtonStyle}
              >
                <span style={{ color: 'var(--color-gold)', fontWeight: 600, marginRight: 8 }}>
                  {opt.key}
                </span>
                <span style={{ color: 'var(--color-bg-primary)', fontSize: 14 }}>{opt.label}</span>
                <span
                  style={{
                    display: 'block',
                    marginTop: 4,
                    fontSize: 12,
                    color: 'rgba(245,240,232,0.55)',
                    fontStyle: 'italic',
                  }}
                >
                  「{opt.blurb}」
                </span>
              </button>
            ))}
          </div>
        </ChapterShell>
      </RitualPageShell>
    );
  }

  if (phase.kind === 'summon') {
    return <SummonOverlay onComplete={advanceFromSummon} />;
  }

  if (phase.kind === 'soul-intro') {
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={3} />
        <ChapterShell
          tone="aurora"
          chapterMark="IV"
          eyebrow="SOUL · 灵魂探针"
          title="最后六道签 — 灵魂频率扫描"
          subtitle="不影响你的人格判定，但决定你和 ta 是不是「灵魂双星」。"
          progress={0.78}
        >
          <button
            type="button"
            onClick={advanceFromSoulIntro}
            style={primaryCtaStyle}
          >
            ✦ 开始扫描我的灵魂 ✦
          </button>
        </ChapterShell>
      </RitualPageShell>
    );
  }

  if (phase.kind === 'soul') {
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={3} />
        <SoulProbeQuiz
          initialAnswers={soulAnswers}
          onAnswer={(next) => setSoulAnswers(next)}
          onComplete={handleSoulComplete}
        />
      </RitualPageShell>
    );
  }

  if (phase.kind === 's-intro') {
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={3} />
        <ChapterShell
          tone="twilight"
          chapterMark="V"
          eyebrow="SHADOW · 暗面召唤"
          title="要不要让你的暗面也走出来？"
          subtitle="再答 12 签意识流，解锁你的异能者副形。可以跳过，主神域不受影响。"
          progress={0.88}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <button type="button" onClick={advanceFromSIntro} style={primaryCtaStyle}>
              ✦ 召唤我的异能者 ✦
            </button>
            <button type="button" onClick={skipSAxis} style={secondaryCtaStyle}>
              暂不召唤 · 直接封信 →
            </button>
          </div>
        </ChapterShell>
      </RitualPageShell>
    );
  }

  if (phase.kind === 's-axis') {
    return (
      <RitualPageShell>
        <RitualStepper currentChapter={3} />
        <SAxisQuiz onComplete={handleSAxisComplete} />
      </RitualPageShell>
    );
  }

  if (phase.kind === 'sealing') {
    return (
      <RitualPageShell>
        <ChapterShell
          tone="gold"
          chapterMark="V"
          eyebrow="SEALING · 星尘封信"
          title="把这份神域寄给 30 天后的自己"
          subtitle="这一封信会在你忘了今天的时候，重新走到你面前。"
          progress={0.95}
        >
          <StardustSealing
            personalitySlug={undefined}
            dueDays={30}
            nextHref="#"
            nextLabel="✦ 揭晓我的人格神域 ✦"
            onSealed={() => {
              window.setTimeout(finalize, 600);
            }}
          />
          <button
            type="button"
            onClick={finalize}
            style={{
              ...secondaryCtaStyle,
              marginTop: 12,
            }}
          >
            先跳过封信，直接看结果 →
          </button>
        </ChapterShell>
      </RitualPageShell>
    );
  }

  return null;
}

// ─────────── Sub-components ───────────

/** 12 颗静态星屑 — 用 CSS 随机 delay 让它们以慢漂上升 */
const STARDUST_SEEDS = Array.from({ length: 14 }, (_, i) => {
  // 用确定性数值避免 hydration mismatch
  const x = ((i * 73) % 100);
  const delay = ((i * 1.7) % 18).toFixed(2);
  const dur = (16 + ((i * 3) % 14)).toFixed(2);
  const size = 1.2 + ((i * 1.3) % 2.4);
  const opacity = (0.35 + ((i * 0.07) % 0.45)).toFixed(2);
  return { x, delay, dur, size, opacity };
});

function RitualPageShell({ children }: { children: React.ReactNode }) {
  // 进入仪式 → 锁深色宇宙、隐藏全站导航/页脚
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.dataset.wtftiRitual;
    document.body.dataset.wtftiRitual = '1';
    return () => {
      if (prev === undefined) {
        delete document.body.dataset.wtftiRitual;
      } else {
        document.body.dataset.wtftiRitual = prev;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        width: '100%',
        background:
          'radial-gradient(ellipse 90% 60% at 50% 18%, rgba(192,122,142,0.18) 0%, rgba(26,21,48,0.6) 38%, #0a0820 75%, #050310 100%)',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* ▒▒ 大气层 1：暮紫罗兰光晕 */}
      <div
        aria-hidden
        className="wtfti-ritual-orb"
        style={{
          position: 'absolute',
          left: '50%',
          top: '12%',
          width: 'min(78vmin, 720px)',
          height: 'min(78vmin, 720px)',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(156,124,255,0.28) 0%, rgba(192,122,142,0.18) 35%, transparent 70%)',
          animation: 'wtfti-orb-breathe 9s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* ▒▒ 大气层 2：金箔暖色侧光 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-15%',
          bottom: '-20%',
          width: 'min(70vmin, 680px)',
          height: 'min(70vmin, 680px)',
          background:
            'radial-gradient(circle, rgba(201,166,118,0.18) 0%, transparent 65%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      {/* ▒▒ 大气层 3：缓慢双层椭圆轨道环（远景） */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
      >
        <div
          className="wtfti-ritual-orbit"
          style={{
            width: 'min(120vmin, 1100px)',
            height: 'min(76vmin, 720px)',
            border: '1px solid rgba(212,181,138,0.18)',
            borderRadius: '50%',
            animation: 'wtfti-orbit-spin 90s linear infinite',
            boxShadow: '0 0 30px rgba(212,181,138,0.04) inset',
          }}
        />
        <div
          className="wtfti-ritual-orbit"
          style={{
            position: 'absolute',
            width: 'min(160vmin, 1500px)',
            height: 'min(58vmin, 560px)',
            border: '1px dashed rgba(192,122,142,0.16)',
            borderRadius: '50%',
            animation: 'wtfti-orbit-spin-rev 140s linear infinite',
          }}
        />
      </div>
      {/* ▒▒ 星屑漂浮 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {STARDUST_SEEDS.map((s, i) => (
          <span
            key={i}
            className="wtfti-ritual-stardust"
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              bottom: '-10vh',
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: i % 3 === 0 ? 'var(--color-gold)' : 'var(--color-bg-primary)',
              boxShadow: `0 0 ${s.size * 4}px rgba(245,240,232,0.6)`,
              opacity: Number(s.opacity),
              animation: `wtfti-stardust-drift ${s.dur}s linear ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ▒▒ 顶部 chrome：左品牌 + 右退出 */}
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 22px 0',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <a
          href={`${basePath}/wtfti/`}
          aria-label="WTFTI 首页"
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 6,
            color: 'var(--color-bg-primary)',
            textDecoration: 'none',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            letterSpacing: '0.32em',
            fontSize: 13,
            fontWeight: 600,
            textShadow: '0 0 18px rgba(192,122,142,0.4)',
          }}
        >
          <span style={{ color: 'var(--color-accent)' }}>✦</span>
          WTFTI
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'rgba(245,240,232,0.55)',
              marginLeft: 6,
            }}
          >
            ritual
          </span>
        </a>
        <a
          href={`${basePath}/wtfti/`}
          aria-label="退出仪式"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            border: '1px solid rgba(245,240,232,0.18)',
            background: 'rgba(10,8,32,0.4)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(245,240,232,0.78)',
            fontSize: 11,
            letterSpacing: '0.2em',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          ✕ exit
        </a>
      </header>

      {/* ▒▒ 内容主体 — 垂直居中 */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100dvh - 56px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(24px, 6vh, 64px) clamp(16px, 4vw, 32px) clamp(40px, 8vh, 80px)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            animation: 'wtfti-card-rise 720ms cubic-bezier(.2,.7,.2,1) both',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

function RitualStepper({ currentChapter }: { currentChapter: 0 | 1 | 2 | 3 }) {
  const steps = [
    { label: 'I', tone: 'var(--color-accent)' },
    { label: 'II', tone: '#9C7CFF' },
    { label: 'III', tone: 'var(--color-gold)' },
    { label: 'IV', tone: '#7AA3B0' },
  ];
  return (
    <nav
      aria-label="仪式章节进度"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 14,
        marginBottom: 26,
      }}
    >
      {steps.map((s, i) => {
        const isCurrent = i === currentChapter;
        const isPast = i < currentChapter;
        return (
          <div
            key={s.label}
            aria-current={isCurrent ? 'step' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              opacity: isCurrent ? 1 : isPast ? 0.85 : 0.5,
              transition: 'opacity 320ms ease',
            }}
          >
            <span
              aria-hidden
              style={{
                width: isCurrent ? 28 : 9,
                height: 9,
                borderRadius: 999,
                background: isCurrent
                  ? `linear-gradient(90deg, ${s.tone}, ${s.tone}aa)`
                  : isPast
                  ? s.tone
                  : 'rgba(245,240,232,0.22)',
                boxShadow: isCurrent ? `0 0 14px ${s.tone}99` : 'none',
                transition: 'all 320ms ease',
              }}
            />
            <span
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: isCurrent ? s.tone : 'rgba(245,240,232,0.7)',
                textShadow: isCurrent ? `0 0 10px ${s.tone}66` : 'none',
              }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

function ClassicToggle({
  classicMode,
  onToggle,
}: {
  classicMode: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ marginTop: 14, textAlign: 'center' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(245,240,232,0.5)',
          fontSize: 11,
          letterSpacing: '0.08em',
          cursor: 'pointer',
        }}
      >
        {classicMode
          ? '✦ 已开启「经典 ABC」 — 点击切回仪式样式 →'
          : '换成经典 ABC 题型 →'}
      </button>
    </div>
  );
}

function QuestionRenderer({
  question,
  formatHint,
  onAnswer,
}: {
  question: Question;
  formatHint: QuizFormatHint;
  onAnswer: (value: Answer) => void;
}) {
  const opts = question.options ?? [
    { key: 'A', label: '不认同', value: 1 as const },
    { key: 'B', label: '中立', value: 2 as const },
    { key: 'C', label: '认同', value: 3 as const },
  ];

  if (formatHint === 'either-or-planets' && opts.length >= 2) {
    const left = opts[0];
    const right = opts[opts.length - 1];
    return (
      <EitherOrPlanets
        prompt={question.text}
        left={{ key: left.key, label: left.label, glyph: '☾', accent: 'var(--color-accent)' }}
        right={{ key: right.key, label: right.label, glyph: '☉', accent: 'var(--color-gold)' }}
        onPick={(key) => {
          const opt = opts.find((o) => o.key === key);
          onAnswer((opt?.value ?? 2) as Answer);
        }}
      />
    );
  }

  if (formatHint === 'mirror-slider' && opts.length >= 3) {
    return (
      <MirrorSlider
        prompt={question.text}
        topStatement={opts[opts.length - 1].label}
        bottomStatement={opts[0].label}
        onPick={(_value, key) => {
          const map: Record<string, Answer> = { L: 1, M: 2, H: 3 };
          onAnswer(map[key] ?? 2);
        }}
      />
    );
  }

  if (formatHint === 'two-am-text' && opts.length >= 2) {
    return (
      <TwoAmText
        sender="? · 03:14"
        incoming={[question.text]}
        replies={opts.map((o, i) => ({
          key: o.key,
          text: o.label,
          variant: i === 0 ? 'me' : 'narrator',
        }))}
        onPick={(key) => {
          const opt = opts.find((o) => o.key === key);
          onAnswer((opt?.value ?? 2) as Answer);
        }}
      />
    );
  }

  if (formatHint === 'tarot-pull' && opts.length >= 2) {
    return (
      <TarotPull
        prompt={question.text}
        cards={opts.map((o, i) => ({
          key: o.key,
          faceGlyph: ['☽', '☉', '✦', '✺'][i] ?? '✶',
          cardName: ['The Mirror', 'The Tower', 'The Lovers', 'The Hermit'][i] ?? 'The Star',
          promptVariant: question.text,
          options: [{ key: o.key, label: o.label }],
        }))}
        onPick={(_cardKey, optionKey) => {
          const opt = opts.find((o) => o.key === optionKey);
          onAnswer((opt?.value ?? 2) as Answer);
        }}
      />
    );
  }

  if (formatHint === 'polaroid-stack' && opts.length >= 2) {
    return (
      <PolaroidStack
        prompt={question.text}
        options={opts.map((o, i) => ({
          key: o.key,
          caption: o.label,
          imageGlyph: ['☘', '✎', '✰', '✿'][i] ?? '❖',
          tilt: ((i % 2 === 0 ? 1 : -1) * (i + 1) * 1.5),
        }))}
        onPick={(key) => {
          const opt = opts.find((o) => o.key === key);
          onAnswer((opt?.value ?? 2) as Answer);
        }}
      />
    );
  }

  // classic-abc fallback
  return (
    <div>
      <p
        style={{
          margin: '0 0 14px',
          fontSize: 16,
          lineHeight: 1.7,
          color: 'var(--color-bg-primary)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        {question.text}
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onAnswer(o.value as Answer)}
            style={classicButtonStyle}
          >
            <span style={{ color: 'var(--color-gold)', fontWeight: 600, marginRight: 10 }}>
              {o.key}
            </span>
            <span style={{ color: 'var(--color-bg-primary)', fontSize: 14 }}>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────── Styles ───────────

const primaryCtaStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 24,
  padding: '14px 36px',
  borderRadius: 999,
  background: 'linear-gradient(120deg, #C07A8E 0%, #C9A676 100%)',
  color: '#1a1530',
  border: 'none',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 16,
  letterSpacing: '0.12em',
  cursor: 'pointer',
  fontWeight: 600,
  boxShadow: '0 18px 40px -14px rgba(192,122,142,0.65), 0 0 0 1px rgba(245,240,232,0.18) inset',
  transition: 'transform 220ms ease, box-shadow 220ms ease',
};

const secondaryCtaStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 18px',
  borderRadius: 999,
  background: 'transparent',
  color: 'rgba(245,240,232,0.6)',
  border: '1px solid rgba(245,240,232,0.18)',
  fontSize: 12,
  letterSpacing: '0.06em',
  cursor: 'pointer',
};

const classicButtonStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(245,240,232,0.04)',
  border: '1px solid rgba(212,181,138,0.22)',
  cursor: 'pointer',
};

const memeButtonStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(156,124,255,0.06)',
  border: '1px solid rgba(201,182,255,0.28)',
  cursor: 'pointer',
};
