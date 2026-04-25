'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DailyEphemerisCard } from '@/components/galaxy/DailyEphemerisCard';
import { getDailyEphemeris, type DailyEphemeris } from '@/lib/wtfi/daily-ephemeris';
import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { loadCard } from '@/lib/wtf-card';
import { withBasePath } from '@/lib/site';

const STREAK_KEY = 'wtfti:daily:streak';

interface StreakState {
  count: number;
  lastDate: string;
}

function readStreak(today: string): StreakState {
  if (typeof window === 'undefined') return { count: 1, lastDate: today };
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 1, lastDate: today };
    const parsed = JSON.parse(raw) as StreakState;
    if (!parsed?.lastDate || typeof parsed.count !== 'number') {
      return { count: 1, lastDate: today };
    }
    return parsed;
  } catch {
    return { count: 1, lastDate: today };
  }
}

function writeStreak(state: StreakState) {
  try {
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function isYesterday(prev: string, today: string): boolean {
  const prevD = new Date(prev + 'T00:00:00Z').getTime();
  const todayD = new Date(today + 'T00:00:00Z').getTime();
  return todayD - prevD === 86_400_000;
}

export function DailyEphemerisClient() {
  const [ephemeris, setEphemeris] = useState<DailyEphemeris | null>(null);
  const [planetSlug, setPlanetSlug] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(1);
  const [needsTest, setNeedsTest] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    const card = loadCard();
    const wtftiResult = card?.results?.wtfti;
    const slug =
      wtftiResult?.slug && HOME_PLANET_CATALOG.some((p) => p.slug === wtftiResult.slug)
        ? wtftiResult.slug
        : null;

    if (!slug) {
      setNeedsTest(true);
      const sample = getDailyEphemeris('home-storm-harbor');
      setEphemeris(sample);
      setPlanetSlug('home-storm-harbor');
      return;
    }

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const e = getDailyEphemeris(slug);
    setEphemeris(e);
    setPlanetSlug(slug);

    const prev = readStreak(todayIso);
    if (prev.lastDate === todayIso) {
      setStreak(prev.count);
    } else if (isYesterday(prev.lastDate, todayIso)) {
      const next = { count: prev.count + 1, lastDate: todayIso };
      writeStreak(next);
      setStreak(next.count);
    } else {
      const next = { count: 1, lastDate: todayIso };
      writeStreak(next);
      setStreak(1);
    }
  }, []);

  return (
    <main
      style={{
        minHeight: '100dvh',
        background:
          'var(--galaxy-bg-hero)',
        color: 'var(--galaxy-cream)',
        fontFamily: 'var(--font-display)',
        padding: '64px 20px 96px',
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
          ✦ WTFTI · DAILY ✦
        </p>
        <h1
          style={{
            margin: '12px 0 8px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 36,
            fontWeight: 500,
            color: 'var(--galaxy-cream)',
            lineHeight: 1.15,
          }}
        >
          今日天象签
        </h1>
        <p
          style={{
            margin: '0 auto 28px',
            textAlign: 'center',
            maxWidth: 380,
            fontSize: 13,
            color: 'var(--galaxy-mist)',
            lineHeight: 1.7,
          }}
        >
          每日打开一次，主神写一句签 — 让 90 秒的测试，变成 365 天的陪伴。
        </p>

        {ephemeris && hydrated ? (
          <DailyEphemerisCard ephemeris={ephemeris} streak={streak} />
        ) : (
          <div
            style={{
              minHeight: 320,
              borderRadius: 22,
              border: '1px solid var(--color-border-subtle)',
              background: 'color-mix(in oklab, var(--galaxy-ink) 50%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: 'var(--galaxy-mist-faint)',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            ✦ summoning ✦
          </div>
        )}

        {needsTest ? (
          <div
            style={{
              marginTop: 22,
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px dashed var(--galaxy-gold-faint)',
              background: 'color-mix(in oklab, var(--galaxy-gold) 8%, transparent)',
              textAlign: 'center',
              fontSize: 12.5,
              color: 'var(--galaxy-mist)',
              lineHeight: 1.7,
            }}
          >
            <p style={{ margin: 0 }}>这是「暴雨港湾」主星的示例签 — </p>
            <p style={{ margin: '4px 0 10px' }}>
              先做一次 90 秒召唤，每日签会改成属于你的主神。
            </p>
            <Link
              href={withBasePath('/wtfti/galaxy/test/')}
              style={{
                display: 'inline-block',
                padding: '8px 18px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, var(--galaxy-gold) 0%, var(--color-gold) 100%)',
                color: '#4D2C2F',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              ✦ 立即召唤主神 ✦
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: 22, textAlign: 'center' }}>
            {planetSlug ? (
              <Link
                href={withBasePath(`/wtfti/galaxy/planet/${planetSlug}/`)}
                style={{
                  display: 'inline-block',
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--color-border)',
                  color: 'var(--galaxy-mist)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                ✦ 回到我的主星 ✦
              </Link>
            ) : null}
          </div>
        )}

        <p
          style={{
            margin: '36px auto 0',
            textAlign: 'center',
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.32em',
            color: 'var(--galaxy-mist-faint)',
            textTransform: 'uppercase',
          }}
        >
          明天同一时间 · 主神再见你
        </p>
      </div>
    </main>
  );
}
