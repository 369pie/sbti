'use client';

/**
 * /start/ — 新生 90 秒引导测（W3 · E3.1）
 *
 * 三题 → 推荐"起点支柱"。
 * 不写库；只有 funnel 事件 + 端上短暂状态。
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { enqueueProductEvent } from '@/lib/analytics/product-events';

type Pillar = 'I' | 'II' | 'III';

interface Choice {
  id: string;
  label: string;
  hint?: string;
  pillar: Pillar;
}

interface Question {
  key: 'mood' | 'relation' | 'desire';
  eyebrow: string;
  prompt: string;
  italic: string;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    key: 'mood',
    eyebrow: 'Q1 · 心境',
    prompt: '今天的「她」更像哪种天气？',
    italic: '不必准确，第一直觉最像。',
    choices: [
      { id: 'a', label: '清晨的雾', hint: '想被看见，但不想被看透', pillar: 'I' },
      { id: 'b', label: '午后阵雨', hint: '想哭一场又想被陪一程', pillar: 'II' },
      { id: 'c', label: '深夜的火', hint: '想说点什么，留下来', pillar: 'III' },
    ],
  },
  {
    key: 'relation',
    eyebrow: 'Q2 · 关系',
    prompt: '此刻让「她」最放不下的是？',
    italic: '是不是问题不重要——她在想就已经足够。',
    choices: [
      { id: 'self', label: '自己', hint: '我到底是谁、我怎么了', pillar: 'I' },
      { id: 'someone', label: '一个人', hint: 'TA 在我心里却不在身边', pillar: 'II' },
      { id: 'world', label: '一群人 / 一件事', hint: '我想为什么留下点东西', pillar: 'III' },
    ],
  },
  {
    key: 'desire',
    eyebrow: 'Q3 · 想被怎样接住',
    prompt: '今天，更想被——',
    italic: '没有对错。三种都是温柔。',
    choices: [
      { id: 'know', label: '认识', hint: '一份会被她保存的档案', pillar: 'I' },
      { id: 'walk', label: '陪着', hint: '一句只属于今天的预兆', pillar: 'II' },
      { id: 'write', label: '认领', hint: '在沙龙里被一群「她」围着', pillar: 'III' },
    ],
  },
];

const PILLAR_META: Record<
  Pillar,
  {
    serial: string;
    eyebrow: string;
    title: string;
    italic: string;
    cta: string;
    href: string;
    secondaryHref: string;
    secondaryCta: string;
    accent: string;
    accentSoft: string;
  }
> = {
  I: {
    serial: 'I',
    eyebrow: 'KNOW HER · 认识她',
    title: '从一份会被她保存的档案开始',
    italic: '不是给你贴标签，是给你一个能藏进收藏夹的镜子。',
    cta: '走进 WTFTI · 12 神性女性档案',
    href: '/wtfti/',
    secondaryCta: '或浏览所有测试矩阵',
    secondaryHref: '/types/',
    accent: 'var(--color-rose)',
    accentSoft: 'rgba(192, 122, 142, 0.12)',
  },
  II: {
    serial: 'II',
    eyebrow: 'WALK WITH HER · 陪着她',
    title: '从一句只属于今天的预兆开始',
    italic: '不算命，不指路。只是有一行字，今天恰好为她写。',
    cta: '走进 Mysti · 今日抽一张牌',
    href: '/mysti/daily/',
    secondaryCta: '或看「她的星图档案」是什么',
    secondaryHref: '/mysti/',
    accent: 'var(--color-gem)',
    accentSoft: 'rgba(124, 132, 200, 0.14)',
  },
  III: {
    serial: 'III',
    eyebrow: '懂我 · 树洞',
    title: '找一个地方，把心里话轻轻放下',
    italic: '不评论、不点赞、不互关——只是被一群「她」远远地接住。',
    cta: '走进树洞 · 说出来就好受一点',
    href: '/bottle/',
    secondaryCta: '或查看今夜的极光时刻',
    secondaryHref: '/bottle/',
    accent: 'var(--color-gold-leaf)',
    accentSoft: 'rgba(201, 166, 118, 0.12)',
  },
};

export function StartContent() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Pillar[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    trackFunnelEvent('onboarding_start', { module: 'home', source: 'start_view' });
  }, []);

  const recommended = useMemo<Pillar | null>(() => {
    if (picks.length === 0) return null;
    const tally: Record<Pillar, number> = { I: 0, II: 0, III: 0 };
    for (const p of picks) tally[p] += 1;
    // tie-break: prefer last pick (more recent intent)
    let best: Pillar = picks[picks.length - 1];
    let bestN = tally[best];
    (['I', 'II', 'III'] as Pillar[]).forEach((p) => {
      if (tally[p] > bestN) {
        best = p;
        bestN = tally[p];
      }
    });
    return best;
  }, [picks]);

  function answer(qIndex: number, choice: Choice) {
    const next = [...picks];
    next[qIndex] = choice.pillar;
    setPicks(next);
    trackFunnelEvent('onboarding_answer', {
      module: 'home',
      slug: QUESTIONS[qIndex].key,
      source: choice.id,
    });

    if (qIndex + 1 < QUESTIONS.length) {
      setStep(qIndex + 1);
    } else {
      setDone(true);
      const final =
        next[next.length - 1] ?? recommended ?? 'I';
      trackFunnelEvent('onboarding_complete', {
        module: 'home',
        slug: `pillar_${final}`,
        source: next.join('-'),
      });
      // P0 funnel step 2: map /start finish → first_look_finish (gate query name).
      enqueueProductEvent('home', 'first_look_finish', {
        step: 'finish',
        slug: `pillar_${final}`,
        props: { source: next.join('-') },
      });
    }
  }

  function reset() {
    setPicks([]);
    setStep(0);
    setDone(false);
  }

  return (
    <main className="min-h-screen px-6 sm:px-10 py-16 sm:py-24" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 sm:mb-16">
          <Link
            href="/"
            className="inline-block text-[11px] tracking-[0.32em] uppercase mb-6"
            style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', color: 'var(--color-text-muted)' }}
          >
            ← WTFTI
          </Link>
          <div className="eyebrow mb-3">A FIELD GUIDE TO HER · 90 SECONDS</div>
          <h1
            className="section-headline text-4xl sm:text-5xl leading-[1.08]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            <span className="editorial-italic">90 秒</span>看见我自己
          </h1>
          <p className="display-tagline text-text-secondary mt-4 text-base max-w-xl">
            三个问题，找到此刻最适合「她」的入口。没有正确答案，第一直觉最像。
          </p>
        </header>

        {!done ? (
          <ProgressBar current={step} total={QUESTIONS.length} />
        ) : null}

        {!done ? (
          <QuestionCard q={QUESTIONS[step]} onPick={(c) => answer(step, c)} />
        ) : (
          <RecommendedPillar pillar={recommended ?? 'I'} onReset={reset} />
        )}

        <p
          className="mt-16 text-[11px] text-center"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            letterSpacing: '0.18em',
          }}
        >
          ENTERTAINMENT · 仅供娱乐与自我观察 · 不构成任何形式的诊断或决策依据
        </p>
      </div>
    </main>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 2,
              background: i <= current ? 'var(--color-text-primary)' : 'var(--color-rule-soft)',
              transition: 'background 400ms ease',
            }}
          />
        ))}
      </div>
      <div
        className="text-[10px] tracking-[0.32em] uppercase"
        style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', color: 'var(--color-text-muted)' }}
      >
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  );
}

function QuestionCard({ q, onPick }: { q: Question; onPick: (c: Choice) => void }) {
  return (
    <section
      className="border p-6 sm:p-10"
      style={{ borderColor: 'var(--color-rule-soft)', background: 'var(--color-bg-elevated)' }}
    >
      <div className="eyebrow mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        {q.eyebrow}
      </div>
      <h2
        className="text-2xl sm:text-3xl leading-[1.2] mb-3"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        {q.prompt}
      </h2>
      <p
        className="mb-8 text-sm"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
        }}
      >
        {q.italic}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {q.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c)}
            className="text-left transition-all duration-300 group"
            style={{
              border: '1px solid var(--color-rule-soft)',
              padding: '18px 20px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-baseline gap-3">
              <span
                className="text-[11px] tracking-[0.18em] uppercase"
                style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', color: 'var(--color-text-muted)' }}
              >
                {c.id.toUpperCase()}
              </span>
              <span
                className="text-lg sm:text-xl group-hover:translate-x-0.5 transition-transform duration-300"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--color-text-primary)' }}
              >
                {c.label}
              </span>
            </div>
            {c.hint ? (
              <div className="mt-1 ml-[34px] text-[13px] text-text-secondary leading-relaxed">
                {c.hint}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}

function RecommendedPillar({ pillar, onReset }: { pillar: Pillar; onReset: () => void }) {
  const meta = PILLAR_META[pillar];
  return (
    <section
      className="border p-8 sm:p-12"
      style={{
        borderColor: meta.accent,
        background: meta.accentSoft,
      }}
    >
      <div
        className="text-[11px] tracking-[0.42em] uppercase mb-4"
        style={{ color: meta.accent, fontFamily: 'ui-monospace, "SF Mono", monospace' }}
      >
        N°{meta.serial} · {meta.eyebrow}
      </div>
      <h2
        className="text-3xl sm:text-4xl leading-[1.12] mb-4"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--color-text-primary)' }}
      >
        {meta.title}
      </h2>
      <p
        className="text-base sm:text-lg mb-8"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          color: meta.accent,
          opacity: 0.95,
        }}
      >
        {meta.italic}
      </p>

      {/* P1: single next step — 今日卡 (refocus §5.1 / §7) */}
      <div className="flex flex-col gap-3 mb-6">
        <Link
          href="/today/"
          className="inline-flex items-center justify-center gap-3 px-7 py-3.5 text-sm transition-transform hover:translate-x-0.5"
          style={{
            background: meta.accent,
            color: 'var(--color-bg-elevated)',
            fontFamily: 'var(--font-display)',
          }}
        >
          明天来看你的第一张今日卡
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/today/#remind"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs"
          style={{
            color: meta.accent,
            fontFamily: 'var(--font-display)',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          开启提醒，明天叫我一声
        </Link>
      </div>
      <p className="mb-8 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
        想先逛逛也行：
        <Link href={meta.href} style={{ color: meta.accent, marginLeft: 6 }}>{meta.cta}</Link>
        <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
        <Link href={meta.secondaryHref} style={{ color: meta.accent }}>{meta.secondaryCta}</Link>
      </p>

      <div
        className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[12px]"
        style={{ borderTop: '1px solid var(--color-rule-soft)', color: 'var(--color-text-muted)' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          这只是入口。三支柱之间没有先后，随时可以折返。
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] tracking-[0.32em] uppercase underline"
          style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          ↺ 重新做一遍
        </button>
      </div>
    </section>
  );
}
