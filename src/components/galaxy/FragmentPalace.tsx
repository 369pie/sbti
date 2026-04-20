'use client';

/**
 * FragmentPalace · 人格碎片宫殿 / 黑洞
 *
 * 24 枚镜面碎片网格，按 igniteFragments() 点亮 3-7 枚。
 * shadow 强 → 黑洞模式（暮紫吸积盘）；shadow 弱 → 宫殿模式（米白穹顶）。
 *
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §12
 */

import { useMemo, useState } from 'react';

import {
  igniteFragments,
  listFragments,
  type IgnitedFragment,
} from '@/lib/wtfi/fragment-palace';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';

interface Props {
  galaxy: GalaxyResult;
  /** 黑洞模式开关；不传则自动按 shadow 强度判定 */
  forceBlackhole?: boolean;
}

export function FragmentPalace({ galaxy, forceBlackhole }: Props) {
  const ignited = useMemo(() => igniteFragments(galaxy), [galaxy]);
  const ignitedSlugs = useMemo(
    () => new Set(ignited.map((f) => f.slug)),
    [ignited],
  );
  const allFragments = useMemo(() => listFragments(), []);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    ignited[0]?.slug ?? null,
  );

  // 自动判定 mode
  const shadowAxisScore = galaxy.shadow?.axisScore ?? 0;
  const isBlackhole =
    forceBlackhole ?? Math.abs(shadowAxisScore) >= 1.6;

  const activeFragment = useMemo<IgnitedFragment | null>(() => {
    if (!activeSlug) return null;
    return ignited.find((f) => f.slug === activeSlug) ?? null;
  }, [activeSlug, ignited]);

  return (
    <section
      aria-label="人格碎片宫殿"
      style={{
        position: 'relative',
        width: 'min(calc(100% - 40px), 1120px)',
        margin: '0 auto',
        background: isBlackhole
          ? 'radial-gradient(circle at 50% 35%, #2a1a4a 0%, #1a1530 60%, #0e0820 100%)'
          : 'radial-gradient(circle at 50% 30%, #2a2238 0%, #1a1530 80%)',
        borderRadius: 18,
        padding: '36px 18px 28px',
        overflow: 'hidden',
        border: '1px solid rgba(201,166,118,0.18)',
      }}
    >
      {/* 顶部 eyebrow */}
      <p
        style={{
          textAlign: 'center',
          letterSpacing: 6,
          fontSize: 10.5,
          color: '#C9A676',
          fontWeight: 500,
          margin: 0,
          textTransform: 'uppercase',
        }}
      >
        ✦ Fragments · {isBlackhole ? '碎片黑洞' : '碎片宫殿'} · {ignited.length} / 24
      </p>
      <h3
        style={{
          textAlign: 'center',
          fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          fontStyle: 'italic',
          fontSize: 28,
          color: '#F5F0E8',
          margin: '8px 0 4px',
          fontWeight: 500,
        }}
      >
        Hall of Mirror Fragments
      </h3>
      <p
        style={{
          textAlign: 'center',
          fontSize: 12.5,
          color: 'rgba(245,240,232,0.62)',
          margin: '0 auto 24px',
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        {isBlackhole
          ? '这些镜面碎片绕着你的暗面奇点公转——每一枚都映照出与你共振的一位灵魂。'
          : '这是一座只为你打开的镜厅——24 面金边镜框里，亮起 ' +
            ignited.length +
            ' 位与你共享同一种宇宙的人。'}
      </p>

      {/* 碎片网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 6,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {allFragments.map((frag, idx) => {
          const isLit = ignitedSlugs.has(frag.slug);
          const isActive = activeSlug === frag.slug;
          const ignitedEntry = ignited.find((f) => f.slug === frag.slug);
          const strength = ignitedEntry?.resonanceStrength ?? 0;
          return (
            <button
              key={frag.slug}
              type="button"
              onClick={() => isLit && setActiveSlug(frag.slug)}
              disabled={!isLit}
              aria-pressed={isActive}
              aria-label={
                isLit ? `点亮的碎片 ${frag.nameZh}` : '未与你共振的碎片'
              }
              style={{
                aspectRatio: '1 / 1.4',
                borderRadius: 4,
                border: isActive
                  ? '1.5px solid #C9A676'
                  : isLit
                  ? '1px solid rgba(201,166,118,0.55)'
                  : '1px solid rgba(245,240,232,0.08)',
                background: isLit
                  ? `linear-gradient(155deg, rgba(192,122,142,${(
                      0.18 +
                      strength * 0.32
                    ).toFixed(2)}) 0%, rgba(201,166,118,${(
                      0.08 +
                      strength * 0.18
                    ).toFixed(2)}) 100%)`
                  : 'rgba(255,255,255,0.02)',
                color: isLit ? '#F5F0E8' : 'rgba(245,240,232,0.18)',
                cursor: isLit ? 'pointer' : 'default',
                fontSize: 14,
                lineHeight: 1.15,
                padding: '6px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                position: 'relative',
                boxShadow: isLit
                  ? `0 0 ${(strength * 12).toFixed(0)}px rgba(192,122,142,${(
                      strength * 0.45
                    ).toFixed(2)})`
                  : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: isLit ? '#C9A676' : 'rgba(201,166,118,0.18)',
                }}
              >
                {frag.sigil}
              </span>
              {isLit ? (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 500,
                    letterSpacing: 0.5,
                    textAlign: 'center',
                  }}
                >
                  {frag.nameZh}
                </span>
              ) : (
                <span style={{ fontSize: 9, opacity: 0.4 }}>?</span>
              )}
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 4,
                  fontSize: 7.5,
                  letterSpacing: 0.5,
                  color: isLit
                    ? 'rgba(201,166,118,0.7)'
                    : 'rgba(245,240,232,0.12)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                }}
              >
                {romanize(idx + 1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 当前选中的碎片详情 */}
      {activeFragment ? (
        <article
          style={{
            marginTop: 22,
            maxWidth: 980,
            marginInline: 'auto',
            padding: '18px 20px',
            borderRadius: 12,
            background: 'rgba(245,240,232,0.04)',
            border: '1px solid rgba(201,166,118,0.22)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: '1 1 260px' }}>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                letterSpacing: 4,
                color: '#C07A8E',
                textTransform: 'uppercase',
              }}
            >
              ✦ Fragment {activeFragment.sigil}
            </p>
            <h4
              style={{
                margin: '6px 0 0',
                fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#F5F0E8',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {activeFragment.nameZh}
            </h4>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: 'rgba(245,240,232,0.5)',
                lineHeight: 1.6,
              }}
            >
              {activeFragment.name} · {activeFragment.era}
            </p>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 11.5,
                color: 'rgba(201,166,118,0.7)',
                letterSpacing: 1,
                lineHeight: 1.7,
              }}
            >
              {activeFragment.fields.join(' · ')}
            </p>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: 14,
                color: '#F5F0E8',
                lineHeight: 1.75,
              }}
            >
              {activeFragment.resonance}
            </p>
            <blockquote
              style={{
                margin: 0,
                padding: '10px 14px',
                borderLeft: '2px solid #C9A676',
                fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
                fontStyle: 'italic',
                fontSize: 15,
                color: 'rgba(245,240,232,0.85)',
                lineHeight: 1.6,
              }}
            >
              「{activeFragment.quote}」
              <footer
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontStyle: 'normal',
                  color: 'rgba(245,240,232,0.45)',
                  letterSpacing: 0.5,
                }}
              >
                — {activeFragment.quoteSource}
              </footer>
            </blockquote>
          </div>
        </article>
      ) : null}

      <p
        style={{
          marginTop: 18,
          fontSize: 10.5,
          color: 'rgba(245,240,232,0.4)',
          textAlign: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.6,
        }}
      >
        这些碎片不证明你是他们，
        <br />
        只证明你和他们共享同一种宇宙的一部分。
      </p>
    </section>
  );
}

const ROMANS = [
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
  'XXII',
  'XXIII',
  'XXIV',
];
function romanize(n: number): string {
  return ROMANS[n] ?? `${n}`;
}
