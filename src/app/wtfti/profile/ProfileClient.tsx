'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FiveSenseRadar } from '@/components/galaxy/FiveSenseRadar';
import {
  decodeSoulAnswers,
  type SoulAnswers,
} from '@/lib/wtfi/soul-resonance';
import {
  calcFiveSenseProfile,
  getSoulFrequencyLine,
  getSoulPerfume,
  getSoulTexture,
  type FiveSenseProfile,
} from '@/lib/wtfi/sense-profile';
import { loadCard } from '@/lib/wtf-card';
import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { getDeity } from '@/lib/wtfi/pantheon';

const DIMS: { key: keyof FiveSenseProfile; label: string; emoji: string }[] = [
  { key: 'hearing', label: '听觉', emoji: '♫' },
  { key: 'vision', label: '视觉', emoji: '◉' },
  { key: 'smell', label: '嗅觉', emoji: '❀' },
  { key: 'touch', label: '触觉', emoji: '✦' },
  { key: 'intuition', label: '直觉', emoji: '◈' },
];

const STORAGE_KEY = 'wtfti.soul.answers.v1';

// Decorative stardust seed — fixed positions so no hydration mismatch
const STARS = [
  { x: 8, y: 12, s: 1.5 }, { x: 23, y: 5, s: 1 }, { x: 41, y: 9, s: 2 },
  { x: 67, y: 3, s: 1 }, { x: 78, y: 14, s: 1.5 }, { x: 90, y: 7, s: 1 },
  { x: 15, y: 22, s: 1 }, { x: 55, y: 18, s: 1.5 }, { x: 85, y: 25, s: 1 },
  { x: 5, y: 45, s: 1 }, { x: 95, y: 40, s: 1.5 }, { x: 3, y: 72, s: 1 },
  { x: 97, y: 68, s: 1 }, { x: 12, y: 85, s: 1.5 }, { x: 88, y: 82, s: 1 },
];

export function ProfileClient() {
  const [answers, setAnswers] = useState<SoulAnswers | null>(null);
  const [planetSlug, setPlanetSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let parsed: SoulAnswers = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = decodeSoulAnswers(raw);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers(parsed);
    const card = loadCard();
    const slug = card?.results?.wtfti?.slug ?? null;
    if (slug && HOME_PLANET_CATALOG.some((p) => p.slug === slug)) {
      setPlanetSlug(slug);
    }
  }, []);

  const hasAnswers = !!answers && Object.values(answers).some((v) => v && v !== 'SKIP');
  const profile: FiveSenseProfile = answers
    ? calcFiveSenseProfile(answers)
    : { hearing: 0.1, vision: 0.1, smell: 0.1, touch: 0.1, intuition: 0.1 };
  const perfume = answers ? getSoulPerfume(answers) : null;
  const texture = answers ? getSoulTexture(answers) : null;
  const frequency = answers ? getSoulFrequencyLine(answers) : null;
  const planet = planetSlug
    ? HOME_PLANET_CATALOG.find((p) => p.slug === planetSlug) ?? null
    : null;
  const deity = planet ? getDeity(planet.slug) : null;
  const accent = planet?.accent ?? 'var(--color-gold)';
  const accentSoft = accent === 'var(--color-gold)'
    ? 'rgba(201,166,118,0.18)'
    : `${accent}2e`;

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 120% 55% at 50% 0%, #2d1e52 0%, #1a1530 42%, #0F0A22 100%)',
        color: 'var(--color-bg-primary)',
        fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Stardust layer ── */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              borderRadius: '50%',
              background: 'rgba(245,240,232,0.55)',
              boxShadow: `0 0 ${s.s * 2}px rgba(245,240,232,0.4)`,
            }}
          />
        ))}
        {/* ambient glow top */}
        <div style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 480,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Back button ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '20px 20px 0' }}>
        <Link
          href="/wtfti/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px 6px 10px',
            borderRadius: 999,
            border: '1px solid rgba(245,240,232,0.15)',
            background: 'rgba(245,240,232,0.06)',
            color: 'rgba(245,240,232,0.75)',
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textDecoration: 'none',
            backdropFilter: 'blur(6px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回
        </Link>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 96px', position: 'relative', zIndex: 1 }}>

        {/* Hero header */}
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* Planet + deity pill */}
          {planet && deity ? (
            <div style={{ marginBottom: 18 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 14px',
                borderRadius: 999,
                border: `1px solid ${accent}55`,
                background: accentSoft,
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.22em',
                color: accent,
                textTransform: 'uppercase',
              }}>
                ✦ {planet.name} · {deity.eastern.name}
              </span>
            </div>
          ) : null}

          <p style={{
            margin: '0 0 10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.42em',
            color: 'rgba(245,240,232,0.45)',
            textTransform: 'uppercase',
          }}>
            Five-Sense Profile · WTFTI
          </p>
          <h1 style={{
            margin: '0 0 10px',
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: '0.04em',
            lineHeight: 1.25,
            background: `linear-gradient(135deg, #F5F0E8 30%, ${accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            你的灵魂频率
          </h1>
          <p style={{
            margin: 0,
            fontSize: 13,
            color: 'rgba(245,240,232,0.6)',
            lineHeight: 1.75,
            fontFamily: 'Noto Serif SC, serif',
          }}>
            听觉 / 视觉 / 嗅觉 / 触觉 / 直觉<br />
            6 道灵魂签合成的 5 维档案
          </p>
        </header>

        {/* ── Golden divider ── */}
        <Divider accent={accent} />

        {/* ── Radar section ── */}
        <section aria-label="五感雷达" style={{ margin: '28px 0 24px' }}>
          <div style={{
            padding: '28px 16px 20px',
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.05) 0%, transparent 65%)',
            border: '1px solid rgba(245,240,232,0.09)',
            borderRadius: 20,
            display: 'grid',
            justifyItems: 'center',
            gap: 16,
            boxShadow: `0 0 60px ${accent}0a, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}>
            <FiveSenseRadar profile={profile} accent={accent} />

            {/* Frequency line */}
            {frequency ? (
              <p style={{
                margin: 0,
                fontSize: 13,
                color: 'rgba(245,240,232,0.82)',
                textAlign: 'center',
                lineHeight: 1.7,
                fontFamily: 'Noto Serif SC, serif',
                fontStyle: 'italic',
              }}>
                {frequency}
              </p>
            ) : (
              <p style={{
                margin: 0,
                fontSize: 12.5,
                color: 'rgba(245,240,232,0.5)',
                textAlign: 'center',
                lineHeight: 1.6,
                fontFamily: 'Noto Serif SC, serif',
              }}>
                完成 6 题灵魂探针后，雷达会按你的答案重新展开
              </p>
            )}

            {/* Dimension bars */}
            {hasAnswers ? (
              <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DIMS.map((d) => {
                  const val = profile[d.key];
                  return (
                    <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 36,
                        fontSize: 11,
                        fontFamily: 'Noto Serif SC, serif',
                        color: 'rgba(245,240,232,0.65)',
                        flexShrink: 0,
                        textAlign: 'right',
                      }}>
                        {d.label}
                      </span>
                      <div style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(245,240,232,0.08)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${Math.round(val * 100)}%`,
                          height: '100%',
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${accent}88, ${accent})`,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                      <span style={{
                        width: 28,
                        fontSize: 10.5,
                        fontFamily: 'Inter, sans-serif',
                        color: accent,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {Math.round(val * 100)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {/* ── Soul cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, margin: '0 0 28px' }}>
          <article style={{
            padding: '18px 16px',
            borderRadius: 16,
            background: 'linear-gradient(145deg, rgba(192,122,142,0.13) 0%, rgba(192,122,142,0.05) 100%)',
            border: '1px solid rgba(192,122,142,0.35)',
            boxShadow: '0 4px 24px rgba(192,122,142,0.08)',
          }}>
            <p style={{
              margin: '0 0 10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.34em',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
            }}>
              ✦ 灵魂香水
            </p>
            <p style={{
              margin: '0 0 6px',
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--color-bg-primary)',
              fontFamily: 'Noto Serif SC, serif',
              lineHeight: 1.3,
            }}>
              {perfume?.name ?? '—'}
            </p>
            <p style={{
              margin: 0,
              fontSize: 11.5,
              color: 'rgba(245,240,232,0.7)',
              lineHeight: 1.6,
              fontFamily: 'Noto Serif SC, serif',
            }}>
              {perfume?.hint ?? '完成 scent 题后揭晓。'}
            </p>
            {perfume?.reference ? (
              <p style={{ margin: '6px 0 0', fontSize: 10.5, color: 'rgba(245,240,232,0.45)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {perfume.reference}
              </p>
            ) : null}
          </article>

          <article style={{
            padding: '18px 16px',
            borderRadius: 16,
            background: 'linear-gradient(145deg, rgba(201,166,118,0.13) 0%, rgba(201,166,118,0.05) 100%)',
            border: '1px solid rgba(201,166,118,0.35)',
            boxShadow: '0 4px 24px rgba(201,166,118,0.08)',
          }}>
            <p style={{
              margin: '0 0 10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.34em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
            }}>
              ✦ 灵魂质地
            </p>
            <p style={{
              margin: '0 0 6px',
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--color-bg-primary)',
              fontFamily: 'Noto Serif SC, serif',
              lineHeight: 1.3,
            }}>
              {texture?.name ?? '—'}
            </p>
            <p style={{
              margin: 0,
              fontSize: 11.5,
              color: 'rgba(245,240,232,0.7)',
              lineHeight: 1.6,
              fontFamily: 'Noto Serif SC, serif',
            }}>
              {texture?.verb ?? '完成 touch 题后揭晓。'}
            </p>
          </article>
        </div>

        {/* ── Planet / Deity card ── */}
        {deity && planet ? (
          <>
            <Divider accent={accent} />
            <div style={{
              margin: '24px 0',
              padding: '20px 22px',
              borderRadius: 16,
              background: `linear-gradient(145deg, ${accentSoft} 0%, rgba(26,21,48,0.6) 100%)`,
              border: `1px solid ${accent}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}>
              {/* Planet orb */}
              <div style={{
                flexShrink: 0,
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 38% 35%, ${accent}cc 0%, ${accent}44 55%, #1a1530 100%)`,
                boxShadow: `0 0 20px ${accent}55`,
                border: `1px solid ${accent}44`,
              }} />
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.32em', color: accent, textTransform: 'uppercase' }}>
                  主星 · 主神
                </p>
                <p style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 600, fontFamily: 'Noto Serif SC, serif', color: 'var(--color-bg-primary)' }}>
                  {planet.name}
                </p>
                <p style={{ margin: 0, fontSize: 12, fontFamily: 'Noto Serif SC, serif', color: 'rgba(245,240,232,0.65)', lineHeight: 1.55 }}>
                  {deity.eastern.name} × {deity.western.name}
                </p>
              </div>
            </div>
          </>
        ) : null}

        {/* ── Empty state CTA ── */}
        {!hasAnswers ? (
          <div style={{
            padding: '20px 18px',
            border: '1px dashed rgba(201,166,118,0.35)',
            borderRadius: 16,
            textAlign: 'center',
            marginBottom: 24,
            background: 'rgba(201,166,118,0.04)',
          }}>
            <p style={{
              margin: '0 0 14px',
              fontSize: 13.5,
              color: 'rgba(245,240,232,0.78)',
              fontFamily: 'Noto Serif SC, serif',
              lineHeight: 1.7,
            }}>
              先做一遍 6 题灵魂探针<br />雷达会按你的答案重新打开
            </p>
            <Link
              href="/wtfti/galaxy/test/?startSoul=1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 24px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.32em',
                color: '#1a1530',
                background: 'linear-gradient(135deg, #C9A676 0%, #C07A8E 100%)',
                borderRadius: 999,
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(201,166,118,0.35)',
              }}
            >
              ✦ 去做灵魂探针
            </Link>
          </div>
        ) : null}

        {/* ── CTA buttons ── */}
        <Divider accent={accent} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', marginTop: 24 }}>
          {planet ? (
            <Link
              href={`/wtfti/shrine/${planet.slug}/`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 20px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.3em',
                color: 'var(--color-bg-primary)',
                background: `linear-gradient(135deg, ${accent}22 0%, ${accent}10 100%)`,
                border: `1px solid ${accent}55`,
                borderRadius: 14,
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: `0 2px 16px ${accent}18`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ✦ 进入「{planet.name}」神龛
            </Link>
          ) : null}
          <Link
            href="/wtfti/daily/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px 20px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.3em',
              color: '#9C7CFF',
              background: 'rgba(156,124,255,0.08)',
              border: '1px solid rgba(156,124,255,0.35)',
              borderRadius: 14,
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ✦ 今日天象签
          </Link>
          {hasAnswers ? (
            <Link
              href="/wtfti/galaxy/test/?startSoul=1"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 20px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.22em',
                color: 'rgba(245,240,232,0.5)',
                background: 'transparent',
                border: '1px solid rgba(245,240,232,0.12)',
                borderRadius: 14,
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              重新做灵魂探针
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Divider({ accent }: { accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,0.08)' }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent, opacity: 0.6 }} />
      <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,0.08)' }} />
    </div>
  );
}
