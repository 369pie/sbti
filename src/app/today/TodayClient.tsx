'use client';

/**
 * /today · 一个今日（Phase A · 权威战略 §10 裁决 3）
 *
 * 收敛三套并行日常（wtfti/daily 天象签、mysti 每日抽牌、wtfti/moon 月亮打卡）
 * 为一个统一入口，加上「待拆的星尘信」——她每天回来 30 秒完成被陪伴动作的地方。
 *
 * 视觉：暮紫底 × 金箔分割 × 罗马数字章节徽章 I–IV（品牌词汇表，见 AGENTS.md）。
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { getDailyCard, formatDateCN } from '@/lib/mysti/daily-card';
import {
  EPHEMERIS_POOL,
  getDailyEphemeris,
  type EphemerisEvent,
} from '@/lib/wtfi/daily-ephemeris';
import { pickLetterByTone, type StardustLetter } from '@/lib/wtfi/stardust-letters';
import {
  getLunarPhase,
  loadFutureLetter,
  loadMoonProgress,
  recommendTodayChapter,
  type MoonProgress,
} from '@/lib/wtfi/lunar-chapters';
import {
  listDueStardustLetters,
  listStardustLetters,
  type StardustUserLetter,
} from '@/lib/wtfi/letters-archive';
import { loadLatestGalaxySession, type GalaxySession } from '@/lib/wtfi/galaxy-session';
import { syncWtftiTimeAssets } from '@/lib/wtfi/cloud-sync';
import { StarSpiritCard } from '@/components/galaxy/StarSpiritCard';
import { WTFTI_PERSONALITIES } from '@/lib/wtfti-personalities';

/** 与 daily-ephemeris 同式的日种子（无主星时的确定性回退） */
function daySeed(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - start) / 86_400_000) + 1;
  return d.getUTCFullYear() * 366 + dayOfYear;
}

function daysUntil(iso: string, now: Date): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000));
}

interface DailyRitual {
  event: EphemerisEvent;
  letter: StardustLetter;
}

const GOLD = 'var(--color-gold-leaf, #C9A676)';
const ROSE = 'var(--color-rose, #C07A8E)';

export function TodayClient() {
  const today = useMemo(() => new Date(), []);
  const [letters, setLetters] = useState<StardustUserLetter[] | null>(null);
  const [moon, setMoon] = useState<MoonProgress | null>(null);
  const [galaxy, setGalaxy] = useState<GalaxySession | null>(null);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/today' });
    const readLocal = () => {
      setLetters(listStardustLetters());
      setMoon(loadMoonProgress());
      setGalaxy(loadLatestGalaxySession());
    };
    readLocal();
    let cancelled = false;
    void syncWtftiTimeAssets().then(() => {
      if (!cancelled) readLocal();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const phase = useMemo(() => getLunarPhase(today), [today]);
  const card = useMemo(() => getDailyCard(today), [today]);

  const ritual = useMemo<DailyRitual>(() => {
    const planetSlug = (galaxy?.result as { homePlanet?: { slug?: string } } | undefined)?.homePlanet?.slug;
    const ephemeris = planetSlug ? getDailyEphemeris(planetSlug, today) : null;
    if (ephemeris) {
      return { event: ephemeris.event, letter: ephemeris.stardust };
    }
    const seed = daySeed(today);
    const event = EPHEMERIS_POOL[seed % EPHEMERIS_POOL.length];
    return { event, letter: pickLetterByTone(event.preferredTone, seed) };
  }, [galaxy, today]);

  const personality = useMemo(
    () => WTFTI_PERSONALITIES.find((p) => p.slug === galaxy?.personalitySlug) ?? null,
    [galaxy],
  );

  const dueLetters = letters ? listDueStardustLetters() : [];
  const futureLetter = letters !== null ? loadFutureLetter() : null;
  const nearestDue = useMemo(() => {
    const pending = (letters ?? []).filter((l) => !l.opened).map((l) => new Date(l.dueAt).getTime());
    if (futureLetter) pending.push(new Date(futureLetter.revealAt).getTime());
    if (pending.length === 0) return null;
    return new Date(Math.min(...pending));
  }, [letters, futureLetter]);

  const moonDone = moon?.done.length ?? 0;
  const nextChapter = useMemo(
    () => recommendTodayChapter(moon ?? { done: [], answers: {} }, phase),
    [moon, phase],
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
      }}
    >
      <div style={{ margin: '0 auto', maxWidth: 680, padding: '56px 18px 96px' }}>
        {/* ── Hero ── */}
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: 7,
              color: GOLD,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            ✦ Today · 每日签
          </p>
          <h1
            style={{
              margin: '10px 0 10px',
              fontSize: 34,
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: 1.15,
            }}
          >
            今天，也有一点 <em style={{ color: ROSE }}>sign</em>。
          </h1>
          <p style={{ margin: '0 auto', maxWidth: 460, fontSize: 12.5, color: 'rgba(245,240,232,.62)', lineHeight: 1.7 }}>
            {formatDateCN(today)} · 月相 {phase.cnName}
            {personality ? ` · ${personality.wtftiName} 在场` : null}
          </p>
          {personality ? (
            <Link
              href="/wtfti/galaxy/test/"
              prefetch={false}
              style={{ color: GOLD, fontSize: 11.5, textDecoration: 'none', borderBottom: `1px solid rgba(201,166,118,.35)`, paddingBottom: 2 }}
            >
              回到你的神域 →
            </Link>
          ) : null}
        </header>

        {/* ── 星灵（V0）── */}
        <StarSpiritCard personalitySlug={galaxy?.personalitySlug ?? null} />

        {/* ── I · 今日天象签 ── */}
        <section style={sectionStyle}>
          <div style={badgeStyle}>I</div>
          <p style={sectionEyebrowStyle}>Daily Ephemeris · 今日天象签</p>
          <h2 style={sectionTitleStyle}>{ritual.event.title}</h2>
          <p style={sectionBodyStyle}>{ritual.event.narration}</p>
          <blockquote
            style={{
              margin: '18px 0',
              padding: '14px 18px',
              borderLeft: `1px solid rgba(201,166,118,.55)`,
              background: 'rgba(201,166,118,.06)',
              borderRadius: '0 12px 12px 0',
              fontSize: 14.5,
              fontStyle: 'italic',
              lineHeight: 1.8,
            }}
          >
            {ritual.letter.translation ?? ritual.letter.quote}
            <footer style={{ marginTop: 8, fontSize: 10.5, fontStyle: 'normal', color: GOLD, letterSpacing: 1 }}>
              — {ritual.letter.author}
              {ritual.letter.source ? ` · ${ritual.letter.source}` : ''}
            </footer>
          </blockquote>
          <Link href="/wtfti/daily/" prefetch={false} style={ctaStyle}>
            看完整天象 →
          </Link>
        </section>

        {/* ── II · 灵鉴今日牌 ── */}
        <section style={sectionStyle}>
          <div style={badgeStyle}>II</div>
          <p style={sectionEyebrowStyle}>Mysti Draw · 灵鉴今日牌</p>
          <h2 style={sectionTitleStyle}>
            {card.arcanaNameCN} · <span style={{ fontStyle: 'italic', color: GOLD }}>{card.arcanaName}</span>
          </h2>
          <p style={{ fontSize: 11, letterSpacing: 2, color: ROSE, margin: '2px 0 12px' }}>
            {card.keywords.join(' · ')}
          </p>
          <p style={sectionBodyStyle}>{card.dailyReading}</p>
          <p style={{ margin: '12px 0 16px', fontSize: 13, lineHeight: 1.7, color: 'rgba(245,240,232,.85)' }}>
            <span style={{ color: GOLD }}>今日一句 · </span>
            {card.action}
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 11.5, color: 'rgba(245,240,232,.55)' }}>
            幸运色{' '}
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: card.luckyColor,
                border: '1px solid rgba(245,240,232,.3)',
                verticalAlign: '-1px',
              }}
            />{' '}
            · 幸运数字 {card.luckyNumber}
          </p>
          <Link href="/mysti" prefetch={false} style={ctaStyle}>
            进入灵鉴 →
          </Link>
        </section>

        {/* ── III · 月亮打卡 ── */}
        <section style={sectionStyle}>
          <div style={badgeStyle}>III</div>
          <p style={sectionEyebrowStyle}>Lunar Chapters · 月亮打卡</p>
          <h2 style={sectionTitleStyle}>
            {phase.cnName} <span style={{ fontSize: 14, color: 'rgba(245,240,232,.5)' }}>· 第 {phase.ageDay} 夜</span>
          </h2>
          <p style={sectionBodyStyle}>
            {moonDone >= 12
              ? `十二夜已满，${moon?.title ?? '大祭司'}——日课成为习惯，月亮记得你。`
              : `今日推荐章节：${nextChapter.title}`}
          </p>
          {/* 12 格月相进度 */}
          <div style={{ display: 'flex', gap: 5, margin: '16px 0 18px' }} aria-label={`月相进度 ${moonDone}/12`}>
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i < moonDone ? GOLD : 'rgba(245,240,232,.14)',
                }}
              />
            ))}
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 11.5, color: 'rgba(245,240,232,.55)' }}>
            {moonDone}/12 章已完成
          </p>
          <Link href="/wtfti/moon/" prefetch={false} style={ctaStyle}>
            继续日课 →
          </Link>
        </section>

        {/* ── IV · 星尘信件 ── */}
        <section style={sectionStyle}>
          <div style={badgeStyle}>IV</div>
          <p style={sectionEyebrowStyle}>Stardust Letters · 待拆的信</p>
          {letters === null ? (
            <p style={sectionBodyStyle}>✦ 信箱校准中…</p>
          ) : dueLetters.length > 0 ? (
            <>
              <h2 style={sectionTitleStyle}>
                <em style={{ color: ROSE }}>{dueLetters.length}</em> 封信，今天可以拆了
              </h2>
              <p style={sectionBodyStyle}>
                30 天前（或更早）的你，把它们封缄起来，指定在今天交还。
              </p>
              <Link href="/wtfti/letters/" prefetch={false} style={{ ...ctaStyle, color: ROSE, borderColor: 'rgba(192,122,142,.45)' }}>
                去拆信 →
              </Link>
            </>
          ) : nearestDue ? (
            <>
              <h2 style={sectionTitleStyle}>
                还差 <em style={{ color: GOLD }}>{daysUntil(nearestDue.toISOString(), today)}</em> 天，一封信会到期
              </h2>
              <p style={sectionBodyStyle}>
                未到期的信像还没升起的月亮——它在路上了。
              </p>
              <Link href="/wtfti/letters/" prefetch={false} style={ctaStyle}>
                看看信箱 →
              </Link>
            </>
          ) : (
            <>
              <h2 style={sectionTitleStyle}>写一封给 30 天后的自己</h2>
              <p style={sectionBodyStyle}>
                今天的一句话、一个愿望、一点心事——封缄 30 天，到期由你自己拆开。
                这是神域里最古老的时间仪式。
              </p>
              <Link href="/wtfti/letters/" prefetch={false} style={{ ...ctaStyle, color: ROSE, borderColor: 'rgba(192,122,142,.45)' }}>
                封第一封信 →
              </Link>
            </>
          )}
        </section>

        <footer style={{ marginTop: 36, textAlign: 'center', fontSize: 10.5, color: 'rgba(245,240,232,.35)', letterSpacing: 1 }}>
          测一次看见自己 · 每天打开有一点 sign
        </footer>
      </div>
    </main>
  );
}

// ── 样式（暮紫 × 金箔 体系内的局部样式，随 design-system-v2 收敛）──

const sectionStyle: React.CSSProperties = {
  position: 'relative',
  padding: '30px 26px 26px',
  marginBottom: 22,
  borderRadius: 16,
  border: '1px solid rgba(201,166,118,.18)',
  background: 'rgba(26,21,48,.55)',
  backdropFilter: 'blur(6px)',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -13,
  left: 22,
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: `1px solid rgba(201,166,118,.5)`,
  background: '#1a1530',
  color: GOLD,
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: 12.5,
  letterSpacing: 1,
};

const sectionEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 9.5,
  letterSpacing: 4,
  color: 'rgba(201,166,118,.75)',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '8px 0 10px',
  fontSize: 21,
  fontWeight: 500,
  lineHeight: 1.35,
};

const sectionBodyStyle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 13.5,
  color: 'rgba(245,240,232,.78)',
  lineHeight: 1.8,
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 12,
  letterSpacing: 1.5,
  color: GOLD,
  textDecoration: 'none',
  border: '1px solid rgba(201,166,118,.4)',
  borderRadius: 999,
  padding: '9px 20px',
};
