'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { SoulSigil } from '@/components/galaxy/SoulSigil';
import { FragmentPalace } from '@/components/galaxy/FragmentPalace';
import { SignaturePerfumeCard } from '@/components/galaxy/SignaturePerfumeCard';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { PriceAnchor } from '@/components/PriceAnchor';
import {
  loadGalaxySessionById,
  loadLatestGalaxySession,
  type GalaxySession,
} from '@/lib/wtfi/galaxy-session';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';
import { basePath } from '@/lib/site';
import {
  getPerfumeAnnotation,
  getSignaturePerfume,
} from '@/lib/wtfi/signature-perfume';
import { pickLettersForPlanet, type StardustLetter } from '@/lib/wtfi/stardust-letters';
import { buildResourceId } from '@/lib/payments/skus';

const display =
  '"Cormorant Garamond", "Noto Serif SC", "Source Han Serif SC", serif';
const mono = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

export default function GalaxyDeepClient({ resultId }: { resultId: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [session, setSession] = useState<GalaxySession | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const byId = loadGalaxySessionById(resultId);
      const fallback = byId ?? loadLatestGalaxySession();
      if (fallback) {
        setSession(fallback);
        setStatus('ready');
        try {
          trackGalaxyEvent('galaxy_deep_view', {
            slug: fallback.personalitySlug,
            props: { resultId: fallback.resultId },
          });
        } catch {
          /* noop */
        }
      } else {
        setStatus('missing');
      }
    });
  }, [resultId]);

  const body = useMemo(() => {
    if (status === 'loading') return <DeepLoading />;
    if (status === 'missing' || !session) return <DeepMissing />;

    const { result, soulAnswers, personalitySlug } = session;
    const planetSlug = result.homePlanet.slug;
    const perfume = getSignaturePerfume(planetSlug);
    const annotation = getPerfumeAnnotation(soulAnswers ?? null);
    // Synthesize a 30-day letter cycle by walking the deterministic seed.
    const letters30: StardustLetter[] = Array.from({ length: 30 }, (_, i) =>
      pickLettersForPlanet(planetSlug, i + 1),
    ).flatMap((trio, i) => trio.slice(0, 1).map((l) => ({ ...l, _day: i + 1 } as StardustLetter & { _day: number })));

    const resourceId = buildResourceId('wtfti', personalitySlug);

    // Stable edition number per (resultId × personalitySlug) — feels personal,
    // determined client-side from the session, NOT exposed to the free tier.
    const editionNo = (() => {
      const seed = `${resultId}::${personalitySlug}`;
      let h = 0x811c9dc5;
      for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
      return String(Math.abs(h) % 9000 + 1000);
    })();
    const today = new Date();
    const issuedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    return (
      <div
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(ellipse at top, #1f1840 0%, #0f0a22 60%, #08051a 100%)',
          color: '#F5F0E8',
          fontFamily: display,
          paddingBottom: 120,
        }}
      >
        {/* Paid-tier visual signature: gold-foil shimmer used on Roman numerals */}
        <style>{`
          @keyframes wtfti-foil-sweep {
            0% { background-position: -180% 0; }
            100% { background-position: 280% 0; }
          }
          .wtfti-deep-foil {
            background-image: linear-gradient(
              100deg,
              #8B6A3A 0%,
              #C9A676 22%,
              #F4DDA0 38%,
              #FFF1C2 50%,
              #F4DDA0 62%,
              #C9A676 78%,
              #8B6A3A 100%
            );
            background-size: 280% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
            animation: wtfti-foil-sweep 6.5s linear infinite;
            font-feature-settings: "lnum", "tnum";
          }
          @keyframes wtfti-stamp-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(201,166,118,0.0), inset 0 0 18px rgba(192,122,142,0.16); }
            50% { box-shadow: 0 0 24px 0 rgba(201,166,118,0.18), inset 0 0 18px rgba(192,122,142,0.22); }
          }
        `}</style>
        {/* ── Header ── */}
        <header
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '48px 24px 16px',
          }}
        >
          <Link
            href={`${basePath}/wtfti/galaxy/result/${resultId}/`}
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'rgba(245,240,232,0.55)',
              textDecoration: 'none',
            }}
          >
            ← 返回神域结果
          </Link>
        </header>

        {/* ── Hero ── */}
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '24px 24px 40px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: '#D4B58A',
              opacity: 0.7,
              margin: 0,
            }}
          >
            DEEP PANTHEON ARCHIVE · 深度主神档案
          </p>
          <h1
            style={{
              fontFamily: display,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(34px, 5.5vw, 52px)',
              lineHeight: 1.08,
              margin: '14px 0 8px',
              letterSpacing: '0.01em',
            }}
          >
            {result.homePlanet.name}
            <span style={{ color: '#C9A676' }}> · </span>
            完整档案
          </h1>
          <p
            style={{
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 14,
              lineHeight: 1.9,
              color: 'rgba(245,240,232,0.65)',
              maxWidth: 520,
              margin: '8px auto 24px',
            }}
          >
            主神 Sigil 高清 · 灵魂香水全谱注解 · 镜面碎片 24 镜框 · 30 天月相封信
          </p>
          <EditionStamp editionNo={editionNo} issuedDate={issuedDate} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PriceAnchor sku="wtfti-deep-pantheon" from="wtfti-deep" />
          </div>
        </section>

        {/* ── Free preview band ── */}
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '0 24px 32px',
          }}
        >
          <div
            style={{
              borderRadius: 22,
              padding: '24px 22px',
              background:
                'linear-gradient(170deg, rgba(192,122,142,0.06) 0%, rgba(15,10,34,0) 60%), rgba(20,15,42,0.55)',
              border: '1px solid rgba(201,166,118,0.18)',
            }}
          >
            <p
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#C9A676',
                opacity: 0.8,
                margin: 0,
              }}
            >
              FREE GLIMPSE · 你可以先看一眼
            </p>
            <h2
              style={{
                fontFamily: display,
                fontStyle: 'italic',
                fontSize: 22,
                fontWeight: 400,
                margin: '12px 0 10px',
              }}
            >
              {result.homePlanet.headline}
            </h2>
            <p
              style={{
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 14,
                lineHeight: 1.95,
                color: 'rgba(245,240,232,0.75)',
                margin: 0,
              }}
            >
              {result.homePlanet.body}
            </p>
          </div>
        </section>

        {/* ── Paywalled deep content ── */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <PremiumPaywall
            sku="wtfti-deep-pantheon"
            brand="wtfti"
            resourceId={resourceId}
            lockedTitle="解锁完整主神档案"
            teaserBullets={[
              'Soul Sigil 高清 480px · 印刷级几何咒符',
              `灵魂香水全谱注解 · ${perfume?.name ?? '专属调香'}`,
              '镜面碎片 24 镜框 · 30 天月相封信',
            ]}
            preview={
              <div style={{ paddingBlock: 20 }}>
                <p
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: '0.32em',
                    color: '#D4B58A',
                    opacity: 0.7,
                    textAlign: 'center',
                    margin: '0 0 16px',
                  }}
                >
                  SIGIL · 灵魂印记
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <SoulSigil galaxy={result} size={220} />
                </div>
                <p
                  style={{
                    fontFamily: '"Noto Serif SC", serif',
                    fontSize: 13,
                    lineHeight: 1.9,
                    color: 'rgba(245,240,232,0.6)',
                    textAlign: 'center',
                    marginTop: 18,
                    maxWidth: 460,
                    marginInline: 'auto',
                  }}
                >
                  你的灵魂印记由轨道与星屑组成 · 完整版含 480px 高清矢量、可下载壁纸、印刷级 PDF。
                </p>
              </div>
            }
          >
            <div style={{ display: 'grid', gap: 56, paddingBlock: 24 }}>
              <DeepSection
                eyebrow="SIGIL HD · 灵魂印记"
                numeral="I"
                title="只属于你的几何咒符 · 印刷版"
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <SoulSigil galaxy={result} size={420} />
                </div>
                <p
                  style={{
                    fontFamily: '"Noto Serif SC", serif',
                    fontSize: 13,
                    color: 'rgba(245,240,232,0.62)',
                    textAlign: 'center',
                    marginTop: 18,
                  }}
                >
                  右键保存 · 1080px 矢量底图 · 可作锁屏 / 印章 / 名片
                </p>
              </DeepSection>

              {perfume && (
                <DeepSection
                  eyebrow="SIGNATURE PERFUME · 灵魂香水全谱"
                  numeral="II"
                  title={perfume.name}
                >
                  <SignaturePerfumeCard perfume={perfume} annotation={annotation} />
                </DeepSection>
              )}

              <DeepSection
                eyebrow="FRAGMENTS · 镜面碎片"
                numeral="III"
                title="你和谁共享了一部分宇宙 · 24 镜框"
              >
                <FragmentPalace galaxy={result} />
              </DeepSection>

              <DeepSection
                eyebrow="STARDUST LETTERS · 30 天月相封信"
                numeral="IV"
                title="未来 30 天 · 每日一封写给你的星屑信"
              >
                <ol
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gap: 14,
                  }}
                >
                  {letters30.map((l, i) => (
                    <li
                      key={`${l.id}-${i}`}
                      style={{
                        borderRadius: 16,
                        padding: '16px 18px',
                        background: 'rgba(20,15,42,0.55)',
                        border: '1px solid rgba(201,166,118,0.14)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: mono,
                            fontSize: 10,
                            letterSpacing: '0.22em',
                            color: '#C9A676',
                            opacity: 0.85,
                          }}
                        >
                          DAY {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          style={{
                            fontFamily: display,
                            fontStyle: 'italic',
                            fontSize: 16,
                            color: 'rgba(245,240,232,0.92)',
                          }}
                        >
                          {l.author}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: '"Noto Serif SC", serif',
                          fontSize: 13,
                          lineHeight: 1.9,
                          color: 'rgba(245,240,232,0.7)',
                          margin: 0,
                        }}
                      >
                        “{l.quote}”{l.translation ? ` — ${l.translation}` : ''}
                      </p>
                    </li>
                  ))}
                </ol>
              </DeepSection>

              {/* Cross-module footer */}
              <DeepSection
                eyebrow="NEXT · 跨模块深档"
                numeral="V"
                title="解过 WTFTI 的人，78% 也读完了 SoulTI 灵魂深镜"
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                  }}
                >
                  <CrossLink
                    href={`${basePath}/soulti/`}
                    eyebrow="SOULTI · ¥9.9"
                    title="灵魂深镜报告"
                    desc="轴间交叉解读 · 修复处方 · 灵魂长信"
                  />
                  <CrossLink
                    href={`${basePath}/cpti/`}
                    eyebrow="CPTI · ¥6.9"
                    title="双人关系深档"
                    desc="8 维雷达 · 30 条共修建议"
                  />
                  <CrossLink
                    href={`${basePath}/mysti/subscribe/?from=wtfti-deep-pantheon`}
                    eyebrow="MYSTI · ¥19/月"
                    title="月度通行证 · 全档 7 折"
                    desc="本档免费 · 后续全模块自动 7 折"
                  />
                </div>
              </DeepSection>
            </div>
          </PremiumPaywall>
        </section>
      </div>
    );
  }, [status, session, resultId]);

  return body;
}

interface DeepSectionProps {
  eyebrow: string;
  title: string;
  numeral: string;
  children: React.ReactNode;
}

function DeepSection({ eyebrow, title, numeral, children }: DeepSectionProps) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <span
          className="wtfti-deep-foil"
          style={{
            fontFamily: display,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}
        >
          {numeral}
        </span>
        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#D4B58A',
            opacity: 0.7,
            margin: 0,
          }}
        >
          {eyebrow}
        </p>
      </div>
      <h2
        style={{
          fontFamily: display,
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 3.4vw, 30px)',
          fontWeight: 400,
          letterSpacing: '0.01em',
          margin: '0 0 22px',
          color: '#F5F0E8',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

interface CrossLinkProps {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
}

function CrossLink({ href, eyebrow, title, desc }: CrossLinkProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '18px 18px',
        borderRadius: 18,
        background: 'rgba(20,15,42,0.6)',
        border: '1px solid rgba(201,166,118,0.18)',
        textDecoration: 'none',
        color: '#F5F0E8',
      }}
    >
      <p
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.28em',
          color: '#C9A676',
          opacity: 0.85,
          margin: 0,
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          fontFamily: display,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 18,
          margin: '8px 0 6px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 12.5,
          lineHeight: 1.75,
          color: 'rgba(245,240,232,0.65)',
          margin: 0,
        }}
      >
        {desc}
      </p>
    </Link>
  );
}

function EditionStamp({
  editionNo,
  issuedDate,
}: {
  editionNo: string;
  issuedDate: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0 auto 22px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 22px',
          borderRadius: 999,
          border: '1px solid rgba(201,166,118,0.45)',
          background:
            'linear-gradient(135deg, rgba(192,122,142,0.10), rgba(201,166,118,0.06))',
          animation: 'wtfti-stamp-pulse 4.5s ease-in-out infinite',
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, #FFE6A3, #C9A676 60%, #8B6A3A)',
            boxShadow: '0 0 8px rgba(201,166,118,0.5)',
          }}
        />
        <span
          className="wtfti-deep-foil"
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.36em',
            fontWeight: 600,
          }}
        >
          EDITION №{editionNo} / 9999
        </span>
        <span
          aria-hidden
          style={{
            width: 1,
            height: 14,
            background: 'rgba(201,166,118,0.4)',
          }}
        />
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.28em',
            color: 'rgba(245,240,232,0.7)',
          }}
        >
          ISSUED {issuedDate}
        </span>
      </div>
    </div>
  );
}

function DeepLoading() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        background: '#1A1530',
        color: '#F5F0E8',
        fontFamily: display,
        fontStyle: 'italic',
        fontSize: 18,
        letterSpacing: '0.06em',
      }}
    >
      ✦ 正在调阅你的深档 …
    </div>
  );
}

function DeepMissing() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 20px',
        background: '#1A1530',
        color: '#F5F0E8',
        fontFamily: display,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <p
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.4em',
            color: '#D4B58A',
          }}
        >
          NO RECORD · 没有找到神域记录
        </p>
        <h2
          style={{
            fontFamily: display,
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 5vw, 44px)',
            margin: '12px 0 16px',
          }}
        >
          先做一次完整仪式
        </h2>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14,
            lineHeight: 1.9,
            color: 'rgba(245,240,232,0.7)',
          }}
        >
          深度主神档案需要先有一份你的神域结果。点击下方按钮去做仪式。
        </p>
        <div style={{ marginTop: 24 }}>
          <Link
            href={`${basePath}/wtfti/galaxy/test/`}
            style={{
              display: 'inline-block',
              padding: '14px 26px',
              borderRadius: 999,
              background: 'linear-gradient(120deg, #C07A8E, #C9A676)',
              color: '#1A1530',
              textDecoration: 'none',
              fontSize: 14,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            ✦ 去做一次完整仪式 ✦
          </Link>
        </div>
      </div>
    </div>
  );
}
