'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  LUNAR_CHAPTERS,
  answerChapter,
  getLunarPhase,
  loadFutureLetter,
  loadMoonProgress,
  recommendTodayChapter,
  sealFutureLetter,
  type FutureLetter,
  type LunarChapter,
  type LunarPhase,
  type MoonProgress,
} from '@/lib/wtfi/lunar-chapters';
import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { loadCard } from '@/lib/wtf-card';

function MoonGlyph({ phase, size = 96 }: { phase: LunarPhase; size?: number }) {
  // Render a moon SVG using two overlapping circles + clip
  const r = size / 2 - 2;
  const illum = phase.illumination;
  // simplification: use vertical mask offset proportional to illum
  const offset = (1 - illum * 2) * r; // -r..r
  const waxing =
    phase.fraction < 0.5; // first half growing → light on right
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${phase.cnName} · 月相图`}
    >
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--galaxy-cream)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--galaxy-gold)" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      {/* full moon disk dim */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="var(--color-border-subtle)" stroke="var(--color-border)" />
      {/* illuminated part — clip with translated circle */}
      <defs>
        <clipPath id="moonClip">
          <circle cx={size / 2} cy={size / 2} r={r} />
        </clipPath>
      </defs>
      <g clipPath="url(#moonClip)">
        <circle
          cx={size / 2 + (waxing ? offset : -offset)}
          cy={size / 2}
          r={r}
          fill="url(#moonGlow)"
        />
      </g>
      {/* halo */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r + 1}
        fill="none"
        stroke="var(--galaxy-gold-faint)"
        strokeWidth={0.6}
      />
    </svg>
  );
}

export function MoonClient() {
  const [progress, setProgress] = useState<MoonProgress | null>(null);
  const [letter, setLetter] = useState<FutureLetter | null>(null);
  const [phase, setPhase] = useState<LunarPhase | null>(null);
  const [planetSlug, setPlanetSlug] = useState<string | null>(null);
  const [letterTitle, setLetterTitle] = useState('');
  const [letterBody, setLetterBody] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase(getLunarPhase());
     
    setProgress(loadMoonProgress());
     
    setLetter(loadFutureLetter());
    const slug = loadCard()?.results?.wtfti?.slug ?? null;
    if (slug && HOME_PLANET_CATALOG.some((p) => p.slug === slug)) {
       
      setPlanetSlug(slug);
    }
  }, []);

  const todayChapter: LunarChapter | null = useMemo(() => {
    if (!phase || !progress) return null;
    return recommendTodayChapter(progress, phase);
  }, [phase, progress]);

  const completed = progress?.done.length ?? 0;
  const crowned = !!progress?.crownedAt;

  const planet = planetSlug
    ? HOME_PLANET_CATALOG.find((p) => p.slug === planetSlug) ?? null
    : null;
  const accent = planet?.accent ?? 'var(--galaxy-gold)';

  function pickOption(idx: number) {
    if (!todayChapter) return;
    const next = answerChapter(todayChapter.index, idx);
    setProgress(next);
    setSubmitted(`✦ 已记录 · 解锁「${todayChapter.unlockGift}」`);
    window.setTimeout(() => setSubmitted(null), 3500);
  }

  function handleSealLetter(e: React.FormEvent) {
    e.preventDefault();
    if (!letterTitle.trim()) return;
    const sealed = sealFutureLetter(letterTitle, letterBody, planetSlug ?? undefined);
    setLetter(sealed);
    setLetterTitle('');
    setLetterBody('');
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background:
          'var(--galaxy-bg-hero)',
        color: 'var(--galaxy-cream)',
        fontFamily: 'var(--font-display)',
        padding: '56px 20px 96px',
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.42em',
            color: 'var(--galaxy-gold)',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          ✦ Lunar Chapters · WTFTI ✦
        </p>
        <h1
          style={{
            margin: '14px 0 6px',
            textAlign: 'center',
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          月相章节
        </h1>
        <p
          style={{
            margin: '0 auto 22px',
            maxWidth: 420,
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--galaxy-mist)',
            lineHeight: 1.7,
            fontFamily: 'var(--font-serif)',
          }}
        >
          跟月亮走 12 期 — 每一期写一句话，
          <br />
          完成时加冕「{progress?.title ?? '大祭司'}」+ 收齐 24 镜面。
        </p>

        {/* Today's phase */}
        {phase ? (
          <section
            aria-label="今日月相"
            style={{
              margin: '0 auto 22px',
              padding: '20px 18px 18px',
              borderRadius: 18,
              background:
                'radial-gradient(ellipse at top, color-mix(in oklab, var(--color-bg-elevated) 12%, transparent) 0%, transparent 70%)',
              border: '1px solid var(--color-border-subtle)',
              display: 'grid',
              gridTemplateColumns: '96px 1fr',
              gap: 18,
              alignItems: 'center',
            }}
          >
            <MoonGlyph phase={phase} size={96} />
            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.32em',
                  color: 'var(--galaxy-gold)',
                  textTransform: 'uppercase',
                }}
              >
                ✦ Today · {phase.enName}
              </p>
              <p
                style={{
                  margin: '6px 0 4px',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--galaxy-cream)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {phase.cnName}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: 'var(--galaxy-mist)',
                  lineHeight: 1.55,
                  fontFamily: 'var(--font-serif)',
                }}
              >
                月龄第 {phase.ageDay} 天 · 亮度{' '}
                {(phase.illumination * 100).toFixed(0)}%
              </p>
            </div>
          </section>
        ) : null}

        {/* Today's chapter */}
        {todayChapter ? (
          <section
            aria-label="今日灵魂日课"
            style={{
              margin: '0 auto 22px',
              padding: '20px 18px 18px',
              borderRadius: 18,
              background: `linear-gradient(180deg, ${accent}1F 0%, transparent 100%)`,
              border: `1px solid ${accent}55`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.32em',
                color: accent,
                textTransform: 'uppercase',
              }}
            >
              ✦ Chapter {todayChapter.index} / 12 · {progress?.done.includes(todayChapter.index) ? '已答' : '待答'}
            </p>
            <h2
              style={{
                margin: '8px 0 10px',
                fontSize: 19,
                fontWeight: 600,
                color: 'var(--galaxy-cream)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {todayChapter.title}
            </h2>
            <p
              style={{
                margin: '0 0 4px',
                fontSize: 14,
                color: 'var(--galaxy-cream)',
                lineHeight: 1.6,
                fontFamily: 'var(--font-serif)',
              }}
            >
              {todayChapter.prompt}
            </p>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 11.5,
                color: 'var(--galaxy-mist-faint)',
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}
            >
              {todayChapter.hint}
            </p>
            <div style={{ display: 'grid', gap: 6 }}>
              {todayChapter.options.map((opt, idx) => {
                const picked = progress?.answers[todayChapter.index] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pickOption(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: picked
                        ? `1px solid ${accent}`
                        : '1px solid var(--color-border-subtle)',
                      background: picked ? `${accent}22` : 'transparent',
                      color: 'var(--galaxy-cream)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {String.fromCharCode(65 + idx)} · {opt}
                  </button>
                );
              })}
            </div>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 11.5,
                color: 'var(--galaxy-mist-faint)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {todayChapter.poeticLine}
            </p>
            {submitted ? (
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 11,
                  color: accent,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}
              >
                {submitted}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Progress map */}
        <section
          aria-label="12 章进度"
          style={{
            margin: '0 auto 22px',
            padding: '14px 14px 12px',
            borderRadius: 14,
            border: '1px solid var(--color-border-subtle)',
            background: 'color-mix(in oklab, var(--color-bg-elevated) 10%, transparent)',
          }}
        >
          <p
            style={{
              margin: '0 0 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: 'var(--galaxy-gold)',
              textTransform: 'uppercase',
            }}
          >
            ✦ 12 章 · 已完成 {completed} / 12
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 6,
            }}
          >
            {LUNAR_CHAPTERS.map((c) => {
              const done = progress?.done.includes(c.index);
              return (
                <div
                  key={c.index}
                  title={`${c.title} — ${done ? '已答' : '待答'}`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    background: done ? `${accent}33` : 'var(--color-accent-dim)',
                    border: done ? `1px solid ${accent}` : '1px solid var(--color-border-subtle)',
                    display: 'grid',
                    placeItems: 'center',
                    color: done ? accent : 'var(--galaxy-mist-faint)',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {c.index}
                </div>
              );
            })}
          </div>
          {crowned ? (
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 12,
                color: accent,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              ✦ 加冕 · {progress?.title ?? '大祭司'}
            </p>
          ) : null}
        </section>

        {/* Future Letter */}
        <section
          aria-label="未来信件"
          style={{
            margin: '0 auto 22px',
            padding: '16px 16px 14px',
            borderRadius: 14,
            border: '1px solid color-mix(in oklab, var(--color-rose) 40%, transparent)',
            background: 'color-mix(in oklab, var(--color-rose) 10%, transparent)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: 'var(--color-rose)',
              textTransform: 'uppercase',
            }}
          >
            ✦ Future Letter · 30 天封存
          </p>
          {letter ? (
            (() => {
              const reveal = new Date(letter.revealAt);
              const now = new Date();
              const ready = reveal.getTime() <= now.getTime();
              const days = Math.max(
                0,
                Math.ceil((reveal.getTime() - now.getTime()) / 86_400_000),
              );
              return (
                <div style={{ marginTop: 8 }}>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--galaxy-cream)',
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    「{letter.title}」
                  </p>
                  {ready ? (
                    <>
                      <p
                        style={{
                          margin: '0 0 6px',
                          fontSize: 13,
                          color: 'var(--galaxy-mist)',
                          lineHeight: 1.7,
                          fontFamily: 'var(--font-serif)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {letter.body || '（你当时只留了标题。）'}
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: 11,
                          color: 'var(--color-rose)',
                          fontWeight: 700,
                          letterSpacing: 3,
                          textTransform: 'uppercase',
                        }}
                      >
                        ✦ 已揭封 · 这封信现在到了
                      </p>
                    </>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: 'var(--galaxy-mist)',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      还有 <strong style={{ color: 'var(--color-rose)' }}>{days}</strong> 天揭封 ·{' '}
                      {reveal.toLocaleDateString('zh-CN')}
                      <br />
                      到那天回到这里，主神会替你拆信。
                    </p>
                  )}
                </div>
              );
            })()
          ) : (
            <form onSubmit={handleSealLetter} style={{ marginTop: 8 }}>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 12.5,
                  color: 'var(--galaxy-mist)',
                  lineHeight: 1.55,
                  fontFamily: 'var(--font-serif)',
                }}
              >
                给 30 天后的自己写一句话 — 主神会替你封存到那一天再拆。
              </p>
              <input
                type="text"
                placeholder="标题（≤ 60 字）"
                maxLength={60}
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  marginBottom: 6,
                  borderRadius: 8,
                  border: '1px solid color-mix(in oklab, var(--color-rose) 40%, transparent)',
                  background: 'color-mix(in oklab, var(--galaxy-ink) 66%, transparent)',
                  color: 'var(--galaxy-cream)',
                  fontSize: 13,
                  fontFamily: 'var(--font-serif)',
                  boxSizing: 'border-box',
                }}
              />
              <textarea
                placeholder="可写可不写 — 一段话即可（≤ 400 字）"
                maxLength={400}
                value={letterBody}
                onChange={(e) => setLetterBody(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid color-mix(in oklab, var(--color-rose) 30%, transparent)',
                  background: 'color-mix(in oklab, var(--galaxy-ink) 60%, transparent)',
                  color: 'var(--galaxy-cream)',
                  fontSize: 12.5,
                  resize: 'vertical',
                  fontFamily: 'var(--font-serif)',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={!letterTitle.trim()}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 999,
                  border: 'none',
                  background: letterTitle.trim()
                    ? 'linear-gradient(135deg, var(--color-rose) 0%, var(--galaxy-violet) 100%)'
                    : 'var(--color-border-subtle)',
                  color: letterTitle.trim() ? '#4D2C2F' : 'var(--galaxy-mist-faint)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  cursor: letterTitle.trim() ? 'pointer' : 'default',
                }}
              >
                ✦ 封存 30 天
              </button>
            </form>
          )}
        </section>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Link
            href="/wtfti/daily/"
            style={{
              fontSize: 11,
              color: 'var(--galaxy-violet)',
              fontWeight: 700,
              letterSpacing: 4,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            ✦ 今日天象签
          </Link>
          {planet ? (
            <Link
              href={`/wtfti/shrine/${planet.slug}/`}
              style={{
                fontSize: 11,
                color: 'var(--galaxy-gold)',
                fontWeight: 700,
                letterSpacing: 4,
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              ✦ 进入神龛 · {planet.name}
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
