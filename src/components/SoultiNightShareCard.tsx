'use client';

/**
 * SoulTI Night Share Card · 夜版分享卡（深色 9:16）
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E3)
 *
 * Designed to ship the "我的撕裂度 X%" hook as a midnight-themed, single-
 * focal-point card that screenshots cleanly on small screens. Uses the same
 * dimensions as `SoultiPortraitShareCard` (9:16) so users can pick which
 * variant to post. Pure DOM (no canvas), so screenshots inherit user fonts.
 */

import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { SHARE_SITE_URL } from '@/lib/site';
import {
  getSoultiResonance,
  getSoultiRarity,
} from '@/lib/soulti/personalities';

interface Props {
  personality: SoultiPersonalityType;
  tearRate: number; // 0..100
  /** Day-self / night-self labels for the contrast line */
  daySelfName?: string;
  nightSelfName?: string;
}

const serif = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const mono = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

export function SoultiNightShareCard({
  personality,
  tearRate,
  daySelfName,
  nightSelfName,
}: Props) {
  const resonance = getSoultiResonance(personality.slug);
  const rarity = getSoultiRarity(personality.slug);
  const accent = personality.color;

  // Choose a single soul quote line (resonance.quote may include line breaks)
  const quote =
    resonance?.quote?.split(/\n+/).filter(Boolean)[0]?.trim() ?? personality.tagline;
  const quoteSrc = resonance?.quoteSource;

  return (
    <div className="mx-auto" style={{ maxWidth: 360 }}>
      <div
        className="relative mx-auto rounded-3xl overflow-hidden"
        style={{
          aspectRatio: '9 / 16',
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(139,159,212,0.12) 0%, transparent 60%), linear-gradient(180deg, #1a1722 0%, #14121b 60%, #0f0d16 100%)',
          border: `1px solid ${accent}40`,
          boxShadow: '0 30px 80px -30px rgba(0,0,0,0.6)',
          color: 'var(--color-bg-primary)',
        }}
      >
        {/* Top ribbon */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: mono, color: '#b8c4e0' }}>
            SoulTI · Night
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.15em]"
            style={{
              background: 'rgba(232,227,214,0.06)',
              color: 'var(--color-bg-primary)',
              border: '1px solid rgba(232,227,214,0.18)',
              fontFamily: mono,
            }}
          >
            {rarity.label} · {rarity.populationPct.toFixed(1)}%
          </span>
        </div>

        {/* HERO · Tear Rate big number */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{ top: '14%' }}
        >
          <p
            className="text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: mono, color: '#b8c4e0', opacity: 0.85 }}
          >
            TEAR RATE
          </p>
          <div className="leading-none" style={{ color: 'var(--color-bg-primary)' }}>
            <span
              style={{
                fontFamily: serif,
                fontSize: '92px',
                fontWeight: 300,
                letterSpacing: '0.02em',
              }}
            >
              {Math.round(tearRate)}
            </span>
            <span
              style={{
                fontFamily: serif,
                fontSize: '32px',
                marginLeft: '4px',
                opacity: 0.7,
              }}
            >
              %
            </span>
          </div>
          <p
            className="mt-3 text-[11px] tracking-[0.18em]"
            style={{ fontFamily: serif, color: '#9aa3c4' }}
          >
            白天的我 · 与 · 深夜的我
          </p>
        </div>

        {/* Day vs Night contrast */}
        {daySelfName && nightSelfName && (
          <div
            className="absolute left-0 right-0 text-center px-8"
            style={{ top: '47%' }}
          >
            <p
              className="text-[14px] leading-[2.1]"
              style={{ fontFamily: serif, color: 'var(--color-bg-primary)' }}
            >
              白天我是
              <span style={{ color: accent, marginLeft: 4, marginRight: 4 }}>
                {daySelfName}
              </span>
              <br />
              深夜变成
              <span style={{ color: '#b8c4e0', marginLeft: 4 }}>{nightSelfName}</span>
            </p>
          </div>
        )}

        {/* Soul quote */}
        <div className="absolute left-6 right-6" style={{ top: '64%' }}>
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{
              background: 'rgba(232,227,214,0.04)',
              border: '1px solid rgba(232,227,214,0.12)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <p
              className="text-[12px] leading-[1.95]"
              style={{ fontFamily: serif, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}
            >
              &ldquo;{quote}&rdquo;
            </p>
            {quoteSrc && (
              <p
                className="mt-2 text-[9px] tracking-[0.2em]"
                style={{ fontFamily: mono, color: '#9aa3c4' }}
              >
                — {quoteSrc}
              </p>
            )}
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute left-0 right-0 text-center" style={{ top: '83%' }}>
          <p
            className="text-[10px] tracking-[0.35em] mb-1"
            style={{ fontFamily: mono, color: accent }}
          >
            {personality.code.split('').join(' · ')}
          </p>
          <p
            className="text-[14px]"
            style={{ fontFamily: serif, color: 'var(--color-bg-primary)' }}
          >
            {personality.emoji} {personality.name}
          </p>
        </div>

        {/* Bottom brand */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <span
            className="text-[10px] tracking-[0.2em]"
            style={{ fontFamily: mono, color: '#7a82a3' }}
          >
            {SHARE_SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}/soulti
          </span>
          <span
            className="text-[10px] tracking-[0.2em]"
            style={{ fontFamily: mono, color: '#7a82a3' }}
          >
            #{personality.number} / 32
          </span>
        </div>

        {/* Subtle starfield overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.18) 50%, transparent 50%), radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.12) 50%, transparent 50%), radial-gradient(1px 1px at 85% 70%, rgba(255,255,255,0.16) 50%, transparent 50%), radial-gradient(1px 1px at 35% 88%, rgba(255,255,255,0.10) 50%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />
      </div>

      <p
        className="mt-3 text-center text-[11px]"
        style={{ fontFamily: mono, color: 'var(--color-text-muted)' }}
      >
        手机端长按卡片保存图片 · 桌面端请截图
      </p>
    </div>
  );
}
