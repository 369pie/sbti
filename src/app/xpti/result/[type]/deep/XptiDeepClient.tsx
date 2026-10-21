'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { basePath } from '@/lib/site';
import type { XptiPersonalityType } from '@/lib/xpti/personalities';
import { getXptiPersonalityBySlug } from '@/lib/xpti/personalities';
import { XPTI_DIMENSIONS } from '@/lib/xpti/dimensions';
import type { DimensionLevel } from '@/lib/xpti/dimensions';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { buildResourceId } from '@/lib/payments/skus';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { levelToScore } from '@/lib/payments/deep-content';
import { useDeepPayload, deepStatusText } from '@/lib/deep/use-deep-payload';
import type { XptiDeepPayload } from '@/lib/deep/xpti-deep.server';
import {
  PremiumFoilStyles,
  PremiumEditionStamp,
  hashEditionNumber,
  formatIssuedDate,
} from '@/components/premium/PremiumFoil';
import { BundleCta } from '@/components/premium/BundleCta';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

interface Props {
  personality: XptiPersonalityType;
}

export function XptiDeepClient({ personality }: Props) {
  const slug = personality.slug;
  const accent = personality.color || '#8B7AD9';
  const resourceId = buildResourceId('xpti', slug);

  // Partner-aware: ?partner=<xpti-slug> overlays a compatibility band.
  const searchParams = useSearchParams();
  const partnerSlug = searchParams?.get('partner') ?? null;
  const partner = useMemo(
    () => (partnerSlug ? getXptiPersonalityBySlug(partnerSlug) ?? null : null),
    [partnerSlug],
  );

  useEffect(() => {
    trackFunnelEvent('paywall_view', { module: 'xpti', slug, sku: 'xpti-deep-xp' });
  }, [slug]);

  const dimensionScores = XPTI_DIMENSIONS.map((d) => {
    const level = (personality.profile[d.id] ?? 'M') as DimensionLevel;
    return { id: d.id, name: d.name, level, score: levelToScore(level) };
  });
  const radarPoints = dimensionScores.map((d) => d.score / 3);

  // Partner radar overlay — uses the partner's actual XPTI_DIMENSIONS profile.
  const partnerRadarPoints = useMemo(() => {
    if (!partner) return null;
    return XPTI_DIMENSIONS.map((d) => {
      const level = (partner.profile[d.id] ?? 'M') as DimensionLevel;
      return levelToScore(level) / 3;
    });
  }, [partner]);

  // Premium edition signature.
  const editionNo = hashEditionNumber(`xpti::${slug}::${partnerSlug ?? 'solo'}`);
  const issuedDate = formatIssuedDate();
  const partnerAccent = '#9C7CFF';

  // Trim long description to first paragraph for the free band.
  const firstPara = personality.description.split('\n').find((l) => l.trim().length > 6) ?? personality.tagline;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #1f1830 0%, #14101e 60%, #0a0810 100%)',
        color: 'var(--color-bg-primary)',
        paddingBlock: '64px 96px',
      }}
    >
      <PremiumFoilStyles />
      {/* ── Hero ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <Link
          href={`${basePath}/xpti/result/${slug}/`}
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'none',
          }}
        >
          ← {personality.name} · 浅档
        </Link>

        <div style={{ fontSize: 56, marginBlock: 24 }}>{personality.emoji}</div>

        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.42em',
            color: 'var(--color-gold)',
            margin: 0,
          }}
        >
          XPTI · DEEP XP
        </p>
        <h1
          style={{
            fontFamily: display,
            fontSize: 48,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            margin: '12px 0 8px',
          }}
        >
          {personality.name}
        </h1>
        <p
          style={{
            fontFamily: display,
            fontStyle: 'italic',
            fontSize: 20,
            color: accent,
            margin: 0,
          }}
        >
          {personality.tagline}
        </p>
        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'var(--color-gold)',
            marginTop: 16,
          }}
        >
          CODE · {personality.code}
        </p>
      </section>

      {/* ── Free preview ── */}
      <section style={{ maxWidth: 720, margin: '64px auto 0', padding: '0 24px' }}>
        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'rgba(245,240,232,0.45)',
            margin: '0 0 12px',
          }}
        >
          FREE · 浅档摘要
        </p>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14,
            lineHeight: 1.95,
            color: 'rgba(245,240,232,0.78)',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {firstPara}
        </p>
      </section>

      {/* ── Paywalled deep ── */}
      <section style={{ maxWidth: 720, margin: '48px auto 0', padding: '0 24px' }}>
        <PremiumPaywall
          sku="xpti-deep-xp"
          brand="xpti"
          resourceId={resourceId}
          lockedTitle={`解锁 ${personality.name} · 9 维 XP 深档`}
          teaserBullets={[
            partner
              ? `双人对照 9 维 · 你 vs ${partner.name} · 含相容度`
              : '9 维 XP 雷达 · 印刷级解读（解锁后可叠加伴侣画像）',
            '6 类亲密配对推荐 + 8 大雷区',
            '6 段场景化对话脚本 · 完整轮次 + 导演备注',
          ]}
          preview={
            <div style={{ paddingBlock: 20 }}>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: 'var(--color-gold)',
                  textAlign: 'center',
                  margin: '0 0 16px',
                }}
              >
                RADAR · 9 AXES
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar
                  size={220}
                  points={radarPoints}
                  accent={accent}
                  labels={dimensionScores.map((d) => d.name)}
                  dim
                />
              </div>
              <p
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 13,
                  lineHeight: 1.9,
                  color: 'rgba(245,240,232,0.6)',
                  textAlign: 'center',
                  marginTop: 18,
                }}
              >
                完整版含每个轴的高/中/低注解、6 类亲密配对、6 段对话脚本。
              </p>
            </div>
          }
        >
          <XptiDeepPaid
            slug={slug}
            personality={personality}
            partner={partner}
            accent={accent}
            radarPoints={radarPoints}
            partnerRadarPoints={partnerRadarPoints}
            dimensionScores={dimensionScores}
            editionNo={editionNo}
            issuedDate={issuedDate}
            partnerAccent={partnerAccent}
          />
        </PremiumPaywall>
      </section>
    </main>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function XptiDeepPaid({
  slug,
  personality,
  partner,
  accent,
  radarPoints,
  partnerRadarPoints,
  dimensionScores,
  editionNo,
  issuedDate,
  partnerAccent,
}: {
  slug: string;
  personality: XptiPersonalityType;
  partner: XptiPersonalityType | null;
  accent: string;
  radarPoints: number[];
  partnerRadarPoints: number[] | null;
  dimensionScores: Array<{ id: string; name: string; level: DimensionLevel; score: number }>;
  editionNo: string;
  issuedDate: string;
  partnerAccent: string;
}) {
  const state = useDeepPayload<XptiDeepPayload>('xpti', { slug, partner: partner?.slug ?? null });
  if (state.status !== 'ok') {
    return (
      <p data-deep-status={state.status} style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(245,240,232,0.7)', fontSize: 14 }}>
        {deepStatusText(state)}
      </p>
    );
  }
  const { compatibility, pairs, landmines, dialogues } = state.data;
  return (
          <div style={{ display: 'grid', gap: 56, paddingBlock: 24 }}>

            <PremiumEditionStamp editionNo={editionNo} issuedDate={issuedDate} />

            <DeepSection
              eyebrow={partner ? 'RADAR · 双人对照 9 维' : 'RADAR · 9 维 XP 雷达'}
              numeral="I"
              title={partner ? `你 × ${partner.name} · 重叠区即默契` : '你的亲密形状'}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar
                  size={360}
                  points={radarPoints}
                  accent={accent}
                  labels={dimensionScores.map((d) => d.name)}
                  secondaryPoints={partnerRadarPoints ?? undefined}
                  secondaryAccent={partnerAccent}
                />
              </div>
              {partner && compatibility && (
                <div
                  style={{
                    marginTop: 18,
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid rgba(201,166,118,0.35)',
                    background:
                      'linear-gradient(135deg, rgba(192,122,142,0.08), rgba(156,124,255,0.08))',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: mono,
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      color: 'var(--color-gold)',
                      margin: '0 0 6px',
                    }}
                  >
                    COMPATIBILITY · 相容度
                  </p>
                  <p
                    className="premium-foil"
                    style={{
                      fontFamily: display,
                      fontStyle: 'italic',
                      fontSize: 36,
                      lineHeight: 1.1,
                      margin: '0 0 6px',
                    }}
                  >
                    {compatibility.score}
                    <span style={{ fontSize: 16, marginLeft: 4 }}>/ 100</span>
                  </p>
                  <p
                    style={{
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                      lineHeight: 1.85,
                      color: 'rgba(245,240,232,0.85)',
                      margin: 0,
                    }}
                  >
                    {compatibility.verdict}
                  </p>
                </div>
              )}
              {partner ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 22,
                    marginTop: 14,
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: '0.18em',
                  }}
                >
                  <span style={{ color: accent }}>● 你（{personality.code}）</span>
                  <span style={{ color: partnerAccent }}>● {partner.name}（{partner.code}）</span>
                </div>
              ) : (
                <PartnerInviteCta />
              )}
              <ul
                style={{
                  marginTop: 24,
                  padding: 0,
                  listStyle: 'none',
                  display: 'grid',
                  gap: 8,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
                {dimensionScores.map((d) => (
                  <li
                    key={d.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px dashed rgba(245,240,232,0.15)',
                      paddingBlock: 6,
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'rgba(245,240,232,0.78)' }}>{d.name}</span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        color: accent,
                      }}
                    >
                      {d.level} · {d.score.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </DeepSection>

            <DeepSection eyebrow="PAIRINGS · 6 类亲密配对" numeral="II" title="你最对得上谁">
              <div style={{ display: 'grid', gap: 12 }}>
                {pairs.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 6,
                      border: '1px solid rgba(245,240,232,0.12)',
                      background: 'rgba(245,240,232,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          letterSpacing: '0.32em',
                          color: 'var(--color-gold)',
                        }}
                      >
                        {p.badge} · {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: display,
                        fontStyle: 'italic',
                        fontSize: 18,
                        color: 'rgba(245,240,232,0.95)',
                        margin: '0 0 6px',
                      }}
                    >
                      {p.archetype}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Noto Serif SC", serif',
                        fontSize: 13,
                        lineHeight: 1.85,
                        color: 'rgba(245,240,232,0.78)',
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: accent }}>对象画像 · </strong>
                      {p.who}
                      <br />
                      <strong style={{ color: accent }}>为什么对得上 · </strong>
                      {p.why}
                    </p>
                  </div>
                ))}
              </div>
            </DeepSection>

            <DeepSection eyebrow="LANDMINES · 8 大雷区" numeral="III" title="自己最容易踩的坑">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {landmines.map((m, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 4,
                      border: '1px solid rgba(192,90,120,0.25)',
                      background: 'rgba(192,90,120,0.06)',
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                      lineHeight: 1.8,
                      color: 'rgba(245,240,232,0.78)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: '0.32em',
                        color: 'var(--color-accent-light)',
                        marginRight: 10,
                      }}
                    >
                      ⚠ {String(i + 1).padStart(2, '0')}
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </DeepSection>

            <DeepSection
              eyebrow="DIALOGUES · 6 段场景化脚本"
              numeral="IV"
              title="不是开场白 · 是完整剧本"
            >
              <div style={{ display: 'grid', gap: 24 }}>
                {dialogues.map((d, i) => (
                  <article
                    key={d.id}
                    style={{
                      padding: '20px 22px',
                      borderRadius: 8,
                      border: '1px solid rgba(245,240,232,0.12)',
                      background:
                        'linear-gradient(180deg, rgba(245,240,232,0.05) 0%, rgba(245,240,232,0.02) 100%)',
                    }}
                  >
                    <header style={{ marginBottom: 14 }}>
                      <p
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          letterSpacing: '0.32em',
                          color: 'var(--color-gold)',
                          margin: '0 0 6px',
                        }}
                      >
                        SCRIPT {String(i + 1).padStart(2, '0')} · {d.eyebrow}
                      </p>
                      <h3
                        style={{
                          fontFamily: display,
                          fontSize: 19,
                          fontWeight: 500,
                          fontStyle: 'italic',
                          color: 'var(--color-bg-primary)',
                          margin: '0 0 6px',
                        }}
                      >
                        {d.scenario}
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Noto Serif SC", serif',
                          fontSize: 12,
                          lineHeight: 1.75,
                          color: 'rgba(245,240,232,0.55)',
                          margin: 0,
                        }}
                      >
                        <span style={{ color: accent, marginRight: 6 }}>目标 ·</span>
                        {d.goal}
                      </p>
                    </header>

                    <ol
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'grid',
                        gap: 12,
                        borderLeft: '1px dashed rgba(245,240,232,0.18)',
                        paddingLeft: 16,
                      }}
                    >
                      {d.turns.map((t, ti) => {
                        const isYou = t.speaker === 'you';
                        return (
                          <li key={ti} style={{ display: 'grid', gap: 4 }}>
                            <span
                              style={{
                                fontFamily: mono,
                                fontSize: 9,
                                letterSpacing: '0.32em',
                                color: isYou ? accent : 'rgba(245,240,232,0.45)',
                              }}
                            >
                              {isYou ? '你 →' : '← TA'}
                            </span>
                            <p
                              style={{
                                fontFamily: '"Noto Serif SC", serif',
                                fontSize: 13.5,
                                lineHeight: 1.85,
                                color: isYou
                                  ? 'rgba(245,240,232,0.92)'
                                  : 'rgba(245,240,232,0.7)',
                                margin: 0,
                              }}
                            >
                              「{t.line}」
                            </p>
                            {t.note && (
                              <p
                                style={{
                                  fontFamily: display,
                                  fontStyle: 'italic',
                                  fontSize: 11.5,
                                  lineHeight: 1.7,
                                  color: 'rgba(201,166,118,0.7)',
                                  margin: 0,
                                  paddingLeft: 12,
                                  borderLeft: '2px solid rgba(201,166,118,0.35)',
                                }}
                              >
                                导演备注 · {t.note}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </article>
                ))}
              </div>
            </DeepSection>

            <BundleCta />

            <DeepSection
              eyebrow="NEXT · 跨模块深档"
              numeral="V"
              title="测过 XPTI 的人，常常也读完了…"
            >
              <div style={{ display: 'grid', gap: 12 }}>
                <CrossLink
                  href={`${basePath}/cpti/`}
                  eyebrow="CPTI · ¥6.9"
                  title="关系深档 · 8 维雷达"
                  desc="把你的 XP 放回真实的关系坐标里——你们的关系到底是什么型？"
                  toModule="cpti"
                />
                <CrossLink
                  href={`${basePath}/wtfti/galaxy/test/`}
                  eyebrow="WTFTI · ¥6.9"
                  title="主神三联档"
                  desc="主神 + 神侍三位 + 暗面副形——你的人格神格在哪一层。"
                  toModule="wtfti"
                />
                <CrossLink
                  href={`${basePath}/soulti/`}
                  eyebrow="SOULTI · ¥9.9"
                  title="灵魂深镜报告"
                  desc="9 轴交叉解读 + 修复处方 + 灵魂长信。"
                  toModule="soulti"
                />
              </div>
            </DeepSection>
          </div>
  );
}

function DeepSection({
  eyebrow,
  numeral,
  title,
  children,
}: {
  eyebrow: string;
  numeral: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <span
          className="premium-foil"
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.42em',
          }}
        >
          {eyebrow}
        </span>
        <span style={{ flex: 1, height: 1, background: 'rgba(201,166,118,0.25)' }} />
        <span
          className="premium-foil"
          style={{
            fontFamily: display,
            fontStyle: 'italic',
            fontSize: 28,
            letterSpacing: '0.06em',
          }}
        >
          {numeral}
        </span>
      </div>
      <h2
        style={{
          fontFamily: display,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: '-0.01em',
          color: 'rgba(245,240,232,0.95)',
          margin: '0 0 20px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CrossLink({
  href,
  eyebrow,
  title,
  desc,
  toModule,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  toModule: 'cpti' | 'wtfti' | 'soulti';
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackFunnelEvent('cross_module_unlock_click', {
          module: 'xpti',
          fromModule: 'xpti',
          toModule,
          source: 'xpti-deep',
        })
      }
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '16px 18px',
        borderRadius: 6,
        border: '1px solid rgba(201,166,118,0.25)',
        background: 'rgba(245,240,232,0.04)',
        color: 'var(--color-bg-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'var(--color-gold)',
          }}
        >
          {eyebrow}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--color-gold)', fontSize: 14 }}>→</span>
      </div>
      <p
        style={{
          fontFamily: display,
          fontStyle: 'italic',
          fontSize: 18,
          margin: '0 0 4px',
          color: 'rgba(245,240,232,0.95)',
        }}
      >
        {title}
      </p>
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

function PartnerInviteCta() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: '14px 18px',
        borderRadius: 12,
        background: 'rgba(156,124,255,0.08)',
        border: '1px dashed rgba(156,124,255,0.4)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: '#9C7CFF',
          margin: '0 0 8px',
        }}
      >
        DUAL RADAR · 邀请伴侣
      </p>
      <p
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 13,
          lineHeight: 1.85,
          color: 'rgba(245,240,232,0.78)',
          margin: 0,
        }}
      >
        让 ta 也测一份 XPTI · 在当前链接末尾追加 <code style={{ color: 'var(--color-gold)' }}>?partner=ta-的-slug</code>，
        自动叠加 ta 的画像与你们的相容度评分。
      </p>
    </div>
  );
}

function Radar({
  size,
  points,
  accent,
  labels,
  dim = false,
  secondaryPoints,
  secondaryAccent,
}: {
  size: number;
  points: number[];
  accent: string;
  labels: string[];
  dim?: boolean;
  secondaryPoints?: number[];
  secondaryAccent?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const n = points.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const polyOf = (vals: number[]) =>
    vals
      .map((v, i) => {
        const rr = r * v;
        return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
      })
      .join(' ');

  const polygon = polyOf(points);
  const secondary = secondaryPoints ? polyOf(secondaryPoints) : null;

  const grid = [0.25, 0.5, 0.75, 1].map((step) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const rr = r * step;
      return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
    }).join(' ');
    return <polygon key={step} points={pts} fill="none" stroke="rgba(245,240,232,0.12)" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="XP 雷达">
      {grid}
      {points.map((_, i) => {
        const x2 = cx + r * Math.cos(angle(i));
        const y2 = cy + r * Math.sin(angle(i));
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(245,240,232,0.1)" />;
      })}
      {secondary && secondaryAccent && (
        <polygon
          points={secondary}
          fill={`${secondaryAccent}28`}
          stroke={secondaryAccent}
          strokeWidth={1.4}
          strokeDasharray="3 3"
        />
      )}
      <polygon
        points={polygon}
        fill={`${accent}${dim ? '20' : '38'}`}
        stroke={accent}
        strokeWidth={1.5}
      />
      {labels.map((l, i) => {
        const lr = r + 14;
        const lx = cx + lr * Math.cos(angle(i));
        const ly = cy + lr * Math.sin(angle(i));
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize={size > 280 ? 11 : 9}
            fill="rgba(245,240,232,0.7)"
            fontFamily={mono}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ letterSpacing: '0.06em' }}
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}
