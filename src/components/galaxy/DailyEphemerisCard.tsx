'use client';

/**
 * DailyEphemerisCard · 每日天象签卡片
 *
 * 战略：docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md §4
 * 用途：在 /wtfti/daily/ 路由展示用户当日的 ephemeris + 主神早安签
 */

import { useMemo } from 'react';

import type { DailyEphemeris } from '@/lib/wtfi/daily-ephemeris';
import { getDeity } from '@/lib/wtfi/pantheon';

interface Props {
  ephemeris: DailyEphemeris;
  /** 用户连续打开天数（用于解锁文字） */
  streak?: number;
}

export function DailyEphemerisCard({ ephemeris, streak = 1 }: Props) {
  const deity = useMemo(() => getDeity(ephemeris.homePlanet.slug), [ephemeris.homePlanet.slug]);
  const accent = ephemeris.homePlanet.accent;

  return (
    <article
      style={{
        position: 'relative',
        borderRadius: 22,
        padding: '28px 24px 30px',
        background:
          'linear-gradient(170deg, rgba(192,122,142,0.10) 0%, rgba(26,21,48,0) 60%), radial-gradient(ellipse at top, rgba(20,12,60,0.85), color-mix(in oklab, var(--galaxy-ink-deep) 95%, transparent))',
        border: `1px solid ${accent}33`,
        boxShadow: `0 16px 60px ${accent}22, inset 0 0 0 1px var(--color-accent-dim)`,
        overflow: 'hidden',
      }}
    >
      {/* glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-30% -10% auto auto',
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
          filter: 'blur(60px)',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />

      <header style={{ position: 'relative', textAlign: 'center', marginBottom: 18 }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.42em',
            color: accent,
            textTransform: 'uppercase',
          }}
        >
          ✦ Daily Ephemeris · {ephemeris.date}
        </p>
        <h2
          style={{
            margin: '8px 0 4px',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
            fontSize: 28,
            fontWeight: 500,
            color: 'var(--galaxy-cream)',
            lineHeight: 1.2,
          }}
        >
          {ephemeris.event.title}
        </h2>
        <p
          style={{
            margin: '6px auto 0',
            maxWidth: 360,
            fontSize: 13.5,
            color: 'var(--galaxy-mist)',
            lineHeight: 1.7,
            fontFamily: 'Noto Serif SC, serif',
          }}
        >
          {ephemeris.event.narration}
        </p>
      </header>

      {/* 主神早安签 */}
      {deity ? (
        <div
          style={{
            position: 'relative',
            marginTop: 22,
            padding: '18px 18px 16px',
            borderRadius: 16,
            background: 'var(--color-accent-dim)',
            border: '1px solid rgba(201,166,118,0.28)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: 'var(--galaxy-gold)',
              textTransform: 'uppercase',
            }}
          >
            ✦ {deity.eastern.name} 早安签
          </p>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14.5,
              color: 'var(--galaxy-cream)',
              lineHeight: 1.7,
              fontFamily: 'Noto Serif SC, serif',
              fontStyle: 'italic',
            }}
          >
            「{ephemeris.stardust.translation ?? ephemeris.stardust.quote}」
          </p>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--galaxy-mist-faint)',
              textTransform: 'uppercase',
              textAlign: 'right',
            }}
          >
            — {ephemeris.stardust.author}
          </p>
        </div>
      ) : null}

      {/* 来自主星 */}
      <div
        style={{
          position: 'relative',
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          aria-hidden
          style={{
            flex: '0 0 auto',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${accent}cc 0%, ${accent}55 50%, color-mix(in oklab, var(--galaxy-ink-deep) 95%, transparent) 100%)`,
            boxShadow: `0 0 20px ${accent}55`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: 'var(--galaxy-mist-faint)',
              textTransform: 'uppercase',
            }}
          >
            来自你的主星
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 14,
              color: 'var(--galaxy-cream)',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
              fontStyle: 'italic',
            }}
          >
            {ephemeris.homePlanet.name} · {ephemeris.constellation?.constellation ?? ''}
          </p>
        </div>
      </div>

      {/* streak */}
      {streak > 1 ? (
        <p
          style={{
            position: 'relative',
            marginTop: 18,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.24em',
            color: 'rgba(201,166,118,0.85)',
            textTransform: 'uppercase',
          }}
        >
          ✦ 连续召唤 {streak} 日 · 神域记得你
        </p>
      ) : null}
    </article>
  );
}
