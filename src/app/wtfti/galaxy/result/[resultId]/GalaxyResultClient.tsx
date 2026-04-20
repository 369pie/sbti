'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import GalaxyPreview from '@/components/galaxy/GalaxyPreview';
import { GalaxyShareDock } from '@/components/galaxy/share/GalaxyShareDock';
import { ContemporaryDeityBadge } from '@/components/galaxy/ContemporaryDeityBadge';
import { DailyEphemerisCard } from '@/components/galaxy/DailyEphemerisCard';
import { FiveSenseRadar } from '@/components/galaxy/FiveSenseRadar';
import { PriceAnchor } from '@/components/PriceAnchor';
import {
  loadGalaxySessionById,
  loadLatestGalaxySession,
  type GalaxySession,
} from '@/lib/wtfi/galaxy-session';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';
import { basePath } from '@/lib/site';
import { getDailyEphemeris } from '@/lib/wtfi/daily-ephemeris';
import { calcFiveSenseProfile } from '@/lib/wtfi/sense-profile';
import { HermosaInputCard } from '@/components/hermosa/HermosaInputCard';

export default function GalaxyResultClient({ resultId }: { resultId: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [session, setSession] = useState<GalaxySession | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      // 优先按 resultId 查，找不到再退到 latest（比如仪式还在前一个 tab 没同步）。
      const byId = loadGalaxySessionById(resultId);
      const fallback = byId ?? loadLatestGalaxySession();
      if (fallback) {
        setSession(fallback);
        setStatus('ready');
        trackGalaxyEvent('galaxy_result_view', {
          slug: fallback.personalitySlug,
          props: {
            resultId: fallback.resultId,
            hasShadow: Boolean(fallback.result.shadow),
          },
        });
      } else {
        setStatus('missing');
      }
    });
  }, [resultId]);

  const content = useMemo(() => {
    if (status === 'loading') return <Loading />;
    if (status === 'missing') return <Missing />;
    if (!session) return <Missing />;
    const hasRealShadow = Boolean(session.result.shadow);
    const ephemeris = getDailyEphemeris(session.result.homePlanet.slug);
    const senseProfile = session.soulAnswers
      ? calcFiveSenseProfile(session.soulAnswers)
      : null;
    return (
      <>
        <GalaxyPreview
          result={session.result}
          shadowUnlockedByDefault={hasRealShadow}
          resumeResultId={session.resultId}
          soulAnswers={session.soulAnswers ?? null}
        />
        <ContemporaryDeityBadge
          homeSlug={session.result.homePlanet.slug}
          resultId={session.resultId}
          hasShadow={hasRealShadow}
        />
        {(ephemeris || senseProfile) && (
          <section
            aria-label="今日月相 · 五感档案"
            style={{
              padding: '32px 20px 140px',
              display: 'grid',
              gap: 24,
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            {ephemeris && <DailyEphemerisCard ephemeris={ephemeris} />}
            {senseProfile && (
              <figure
                style={{
                  margin: 0,
                  padding: '24px 20px',
                  borderRadius: 22,
                  background:
                    'linear-gradient(170deg, rgba(156,124,255,0.08) 0%, rgba(26,21,48,0) 55%), radial-gradient(ellipse at top, rgba(20,12,60,0.85), rgba(8,5,18,0.95))',
                  border: '1px solid rgba(201,166,118,0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <figcaption
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.42em',
                    textTransform: 'uppercase',
                    color: 'var(--galaxy-gold-soft, #D4B58A)',
                  }}
                >
                  FIVE SENSES · 灵魂频率
                </figcaption>
                <FiveSenseRadar profile={senseProfile} size={280} accent="#C9A676" />
              </figure>
            )}
          </section>
        )}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 48px' }}>
          <HermosaInputCard
            universe="wtfti"
            slug={session.personalitySlug}
            personalityName={session.personalitySlug}
            accent="#C07A8E"
          />
        </section>
        <DeepArchiveCta resultId={session.resultId} slug={session.personalitySlug} />
        <GalaxyShareDock session={session} />
      </>
    );
  }, [status, session]);

  return content;
}

function DeepArchiveCta({ resultId, slug }: { resultId: string; slug: string }) {
  return (
    <section
      aria-label="深度主神档案 · 解锁入口"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '8px 20px 56px',
      }}
    >
      <div
        style={{
          borderRadius: 24,
          padding: '26px 24px',
          background:
            'radial-gradient(ellipse at top, rgba(192,122,142,0.18), rgba(26,21,48,0) 60%), rgba(20,15,42,0.65)',
          border: '1px solid rgba(201,166,118,0.28)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'SF Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: '#D4B58A',
            opacity: 0.8,
            margin: 0,
          }}
        >
          DEEP PANTHEON ARCHIVE · 深度主神档案
        </p>
        <h3
          style={{
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 24,
            fontWeight: 400,
            color: '#F5F0E8',
            margin: '10px 0 8px',
          }}
        >
          解锁主神三联档 · Sigil 高清 · 30 天月相封信
        </h3>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 13.5,
            lineHeight: 1.85,
            color: 'rgba(245,240,232,0.7)',
            maxWidth: 480,
            margin: '0 auto 20px',
          }}
        >
          完整版含 480px 印刷级 Sigil、灵魂香水全谱注解、镜面碎片 24 镜框、
          30 天逐日封信。一次解锁，永久属于你。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <PriceAnchor sku="wtfti-deep-pantheon" from={`wtfti-result-${slug}`} />
        </div>
        <Link
          href={`${basePath}/wtfti/galaxy/result/${resultId}/deep/`}
          onClick={() => {
            try {
              trackGalaxyEvent('galaxy_deep_cta_click', {
                slug,
                props: { resultId },
              });
            } catch {
              /* noop */
            }
          }}
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            borderRadius: 999,
            background: 'linear-gradient(120deg, #C07A8E, #C9A676)',
            color: '#1A1530',
            textDecoration: 'none',
            fontSize: 14,
            letterSpacing: '0.16em',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontWeight: 600,
          }}
        >
          ✦ 进入深度档案 · ¥6.9 ✦
        </Link>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--galaxy-bg-hero, #1A1530)',
        color: 'var(--galaxy-cream, #F5F0E8)',
        fontFamily:
          'var(--galaxy-font-display), "Cormorant Garamond", "Noto Serif SC", serif',
        fontStyle: 'italic',
        fontSize: 20,
        letterSpacing: '0.06em',
      }}
    >
      ✦ 众神正在为你写身份信 …
    </div>
  );
}

function Missing() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 20px',
        background: 'var(--galaxy-bg-hero, #1A1530)',
        color: 'var(--galaxy-cream, #F5F0E8)',
        fontFamily:
          'var(--galaxy-font-display), "Cormorant Garamond", "Noto Serif SC", serif',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 'min(92vw, 680px)',
          padding: 'clamp(24px, 4vw, 40px)',
          borderRadius: 28,
          background:
            'linear-gradient(170deg, rgba(156,124,255,0.08) 0%, rgba(26,21,48,0) 55%), radial-gradient(ellipse at top, rgba(20,12,60,0.78), rgba(8,5,18,0.92))',
          border: '1px solid rgba(201,166,118,0.18)',
          boxShadow: '0 24px 70px -36px rgba(156,124,255,0.4)',
        }}
      >
        <p
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.4em',
            fontSize: 11,
            color: 'var(--galaxy-gold-soft, #D4B58A)',
          }}
        >
          LOST IN NEBULA
        </p>
        <h2
          style={{
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(32px, 5vw, 48px)',
            margin: '8px 0 18px',
            lineHeight: 1.08,
          }}
        >
          这份神域还没有记录
        </h2>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            lineHeight: 1.8,
            color: 'rgba(245,240,232,0.7)',
          }}
        >
          可能你在新的浏览器打开了旧链接，或者仪式还没有做完。
          <br />
          下面两扇门里选一扇：
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 28,
          }}
        >
          <Link
            href={`${basePath}/wtfti/galaxy/test/`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '14px 22px',
              borderRadius: 999,
              background:
                'linear-gradient(120deg, var(--galaxy-rose, #C07A8E), var(--galaxy-gold, #C9A676))',
              color: 'var(--galaxy-ink, #1A1530)',
              textDecoration: 'none',
              fontSize: 15,
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}
          >
            ✦ 去做一次完整仪式 ✦
          </Link>
          <Link
            href={`${basePath}/wtfti/galaxy/preview/`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 18px',
              borderRadius: 999,
              background: 'transparent',
              color: 'rgba(245,240,232,0.7)',
              border: '1px solid rgba(245,240,232,0.22)',
              textDecoration: 'none',
              fontSize: 12,
              letterSpacing: '0.12em',
            }}
          >
            先看一眼神域示例 →
          </Link>
        </div>
      </div>
    </div>
  );
}
