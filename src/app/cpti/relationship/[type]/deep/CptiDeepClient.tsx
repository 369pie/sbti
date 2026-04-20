'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { basePath } from '@/lib/site';
import { getRelationshipBySlug, type CptiRelationshipType } from '@/lib/cpti/relationships';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { buildResourceId } from '@/lib/payments/skus';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { hashString, pickN, pickLevel, levelToScore } from '@/lib/payments/deep-content';
import {
  PremiumFoilStyles,
  PremiumEditionStamp,
  hashEditionNumber,
  formatIssuedDate,
} from '@/components/premium/PremiumFoil';
import { BundleCta } from '@/components/premium/BundleCta';
import {
  RELATIONSHIP_STAGES,
  type RelationshipStage,
  getPracticesForStage,
  LANDMINE_POOL_V2,
} from '@/lib/cpti/deep-pools';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

// ─── 8 axes (5 base CPTI dims + 3 deep slices) ───────────────────────────────
const AXES = [
  { id: 'power',     label: '主导力' },
  { id: 'express',   label: '表达力' },
  { id: 'conflict',  label: '冲突力' },
  { id: 'care',      label: '付出力' },
  { id: 'fusion',    label: '融合度' },
  { id: 'pace',      label: '节奏同步' },
  { id: 'safety',    label: '安全感存量' },
  { id: 'growth',    label: '共修弹性' },
] as const;

const LANDMINE_POOL = LANDMINE_POOL_V2;

const MONTH_THEMES = [
  '一月 · 仪式重启',
  '二月 · 重提爱意',
  '三月 · 共修一项新技能',
  '四月 · 互写感谢清单',
  '五月 · 旅行 / 短途出走',
  '六月 · 边界对齐',
  '七月 · 共同财务 check-in',
  '八月 · 各自独处一天',
  '九月 · 复盘上半年',
  '十月 · 朋友圈共建',
  '十一月 · 健康 / 体能合修',
  '十二月 · 写下一年关系清单',
];

interface Props {
  relationship: CptiRelationshipType;
  tierInfo: { label: string; color: string; bgColor: string };
}

export function CptiDeepClient({ relationship, tierInfo }: Props) {
  const slug = relationship.slug;
  const resourceId = buildResourceId('cpti', slug);
  const searchParams = useSearchParams();

  // Partner-aware overlay: ?partner=<slug> renders both polygons on the radar.
  const partnerSlug = searchParams?.get('partner') ?? null;
  const partner = useMemo(
    () => (partnerSlug ? getRelationshipBySlug(partnerSlug) : null),
    [partnerSlug],
  );

  // Stage selector — drives which practice pool is drawn from.
  const [stage, setStage] = useState<RelationshipStage>('dating');

  useEffect(() => {
    trackFunnelEvent('paywall_view', { module: 'cpti', slug, sku: 'cpti-deep-relationship' });
  }, [slug]);

  // Deterministic radar values per relationship slug.
  const radarLevels = AXES.map((a) => pickLevel(slug, a.id));
  const radarPoints = AXES.map((_, i) => {
    const level = radarLevels[i];
    return levelToScore(level) / 3;
  });

  // Partner radar (overlaid only if partner is loaded).
  const partnerRadarPoints = partner
    ? AXES.map((a) => levelToScore(pickLevel(partner.slug, a.id)) / 3)
    : null;

  // Stage-aware practice pool — re-seeded per (slug × stage) for variety.
  const practicePool = useMemo(() => getPracticesForStage(stage), [stage]);
  const practices = useMemo(
    () => pickN(practicePool, `${slug}::${stage}`, 24, 'practice-v2'),
    [practicePool, slug, stage],
  );

  // Expanded landmines — pull 12 (was 8) from the v2 pool of 60+.
  const landmines = useMemo(
    () => pickN(LANDMINE_POOL, slug, 12, 'landmine-v2'),
    [slug],
  );

  const monthOffset = hashString(slug) % 12;
  const themes = MONTH_THEMES.map((_, i) => MONTH_THEMES[(i + monthOffset) % 12]);

  const accent = relationship.color || '#B85A78';
  const partnerAccent = '#9C7CFF'; // amethyst — visually distinct from the user's rose.

  // Premium edition signature — stable per (relationship × partner).
  const editionNo = hashEditionNumber(`cpti::${slug}::${partnerSlug ?? 'solo'}`);
  const issuedDate = formatIssuedDate();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #2a1a26 0%, #1a1018 60%, #0f0a12 100%)',
        color: '#F5F0E8',
        paddingBlock: '64px 96px',
      }}
    >
      <PremiumFoilStyles />
      {/* ── Hero ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <Link
          href={`${basePath}/cpti/relationship/${slug}/`}
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'none',
          }}
        >
          ← {relationship.name} · 浅档
        </Link>

        <div style={{ fontSize: 56, marginBlock: 24 }}>{relationship.emoji}</div>

        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.42em',
            color: '#C9A676',
            margin: 0,
          }}
        >
          CPTI · DEEP RELATIONSHIP
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
          {relationship.name}
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
          {relationship.tagline}
        </p>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.24em',
              padding: '4px 10px',
              borderRadius: 999,
              border: `1px solid ${tierInfo.color}50`,
              color: tierInfo.color,
              background: tierInfo.bgColor,
            }}
          >
            {tierInfo.label}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.24em',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid rgba(201,166,118,0.35)',
              color: '#C9A676',
            }}
          >
            CODE · {relationship.code}
          </span>
        </div>
      </section>

      {/* ── Free preview band ── */}
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
          {relationship.description}
        </p>
      </section>

      {/* ── Paywalled deep content ── */}
      <section style={{ maxWidth: 720, margin: '48px auto 0', padding: '0 24px' }}>
        <PremiumPaywall
          sku="cpti-deep-relationship"
          brand="cpti"
          resourceId={resourceId}
          lockedTitle={`解锁 ${relationship.name} · 8 维关系深档`}
          teaserBullets={[
            partner
              ? `双人对照 8 维雷达 · 你 vs ${partner.name}`
              : '8 维关系雷达（解锁后可邀请伴侣自动合并）',
            '24 条 stage-aware 共修建议 · 按你们的关系阶段分池',
            '12 月共修主题 + 12 大雷区清单',
          ]}
          preview={
            <div style={{ paddingBlock: 20 }}>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: '#D4B58A',
                  textAlign: 'center',
                  margin: '0 0 16px',
                }}
              >
                RADAR · 8 AXES
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar size={220} points={radarPoints} accent={accent} labels={AXES.map((a) => a.label)} dim />
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
                完整版含每个轴的解读、30 条共修建议、12 月主题、8 大雷区。
              </p>
            </div>
          }
        >
          <div style={{ display: 'grid', gap: 56, paddingBlock: 24 }}>

            <PremiumEditionStamp editionNo={editionNo} issuedDate={issuedDate} />

            <DeepSection
              eyebrow={partner ? 'RADAR · 双人对照 8 维' : 'RADAR · 8 维关系雷达'}
              numeral="I"
              title={partner ? `你 × ${partner.name} · 重叠区即默契` : '你们关系的形状'}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar
                  size={360}
                  points={radarPoints}
                  accent={accent}
                  labels={AXES.map((a) => a.label)}
                  secondaryPoints={partnerRadarPoints ?? undefined}
                  secondaryAccent={partnerAccent}
                />
              </div>
              {partner ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 22,
                    marginTop: 16,
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: '0.18em',
                  }}
                >
                  <span style={{ color: accent }}>● 你（{relationship.code}）</span>
                  <span style={{ color: partnerAccent }}>● {partner.name}（{partner.code}）</span>
                </div>
              ) : (
                <PartnerInviteCta slug={slug} />
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
                {AXES.map((a, i) => (
                  <li
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px dashed rgba(245,240,232,0.15)',
                      paddingBlock: 6,
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'rgba(245,240,232,0.78)' }}>{a.label}</span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        color: accent,
                      }}
                    >
                      {radarLevels[i]} · {(radarPoints[i] * 3).toFixed(1)}
                      {partnerRadarPoints && (
                        <span style={{ color: partnerAccent, marginLeft: 8 }}>
                          / {(partnerRadarPoints[i] * 3).toFixed(1)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </DeepSection>

            <DeepSection
              eyebrow="PRACTICE · 24 条 stage-aware 共修"
              numeral="II"
              title="按你们的关系阶段定制 · 拿来就能做"
            >
              <StageSelector value={stage} onChange={setStage} accent={accent} />
              <ol
                style={{
                  margin: '20px 0 0',
                  padding: 0,
                  listStyle: 'none',
                  display: 'grid',
                  gap: 12,
                }}
              >
                {practices.map((p, i) => (
                  <li
                    key={`${stage}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr',
                      gap: 12,
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: '0.24em',
                        color: '#C9A676',
                        opacity: 0.9,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Noto Serif SC", serif',
                        fontSize: 13.5,
                        lineHeight: 1.85,
                        color: 'rgba(245,240,232,0.82)',
                      }}
                    >
                      {p}
                    </span>
                  </li>
                ))}
              </ol>
            </DeepSection>

            <DeepSection eyebrow="THEMES · 12 月共修主题" numeral="III" title="一年的关系节气">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {themes.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 4,
                      border: '1px solid rgba(245,240,232,0.12)',
                      background: 'rgba(245,240,232,0.04)',
                      fontFamily: display,
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: 'rgba(245,240,232,0.86)',
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </DeepSection>

            <DeepSection eyebrow="LANDMINES · 12 大雷区" numeral="IV" title="千万别踩的关系陷阱">
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
                        color: '#E89BA8',
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

            <BundleCta />

            <DeepSection
              eyebrow="NEXT · 跨模块深档"
              numeral="V"
              title="完成 CPTI 关系深档的人，常常也读完了…"
            >
              <div style={{ display: 'grid', gap: 12 }}>
                <CrossLink
                  href={`${basePath}/wtfti/galaxy/test/`}
                  eyebrow="WTFTI · ¥6.9"
                  title="个人主神档案"
                  desc="拿到你自己的主神 + 神龛 + 月相日课，再回头看你们之间的化学反应。"
                  fromModule="cpti"
                  toModule="wtfti"
                />
                <CrossLink
                  href={`${basePath}/soulti/`}
                  eyebrow="SOULTI · ¥9.9"
                  title="灵魂深镜报告"
                  desc="9 轴交叉解读 + 修复处方 + 灵魂长信。安静地看见自己。"
                  fromModule="cpti"
                  toModule="soulti"
                />
                <CrossLink
                  href={`${basePath}/xpti/`}
                  eyebrow="XPTI · ¥4.9"
                  title="亲密偏好深析"
                  desc="9 维 XP 雷达 + 6 类亲密配对 + 雷区清单 + 24 个对话开场白。"
                  fromModule="cpti"
                  toModule="xpti"
                />
              </div>
            </DeepSection>
          </div>
        </PremiumPaywall>
      </section>
    </main>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

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
  fromModule,
  toModule,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  fromModule: 'cpti';
  toModule: 'wtfti' | 'soulti' | 'xpti';
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackFunnelEvent('cross_module_unlock_click', {
          module: fromModule,
          fromModule,
          toModule,
          source: 'cpti-deep',
        })
      }
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '16px 18px',
        borderRadius: 6,
        border: '1px solid rgba(201,166,118,0.25)',
        background: 'rgba(245,240,232,0.04)',
        color: '#F5F0E8',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: '#C9A676',
          }}
        >
          {eyebrow}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: '#C9A676', fontSize: 14 }}>→</span>
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

/** Lightweight inline radar — N evenly-spaced axes, 0–1 normalised values.
 *  Optional secondary polygon overlays the partner's profile.
 */
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="关系雷达">
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

/** Stage selector chips — drives which practice pool feeds Section II. */
function StageSelector({
  value,
  onChange,
  accent,
}: {
  value: RelationshipStage;
  onChange: (s: RelationshipStage) => void;
  accent: string;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: 'rgba(245,240,232,0.55)',
          margin: '0 0 10px',
        }}
      >
        STAGE · 你们现在在哪一程？
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {RELATIONSHIP_STAGES.map((s) => {
          const active = s.id === value;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              style={{
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? accent : 'rgba(245,240,232,0.2)'}`,
                background: active ? `${accent}22` : 'rgba(245,240,232,0.04)',
                color: active ? '#F5F0E8' : 'rgba(245,240,232,0.7)',
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: '0.18em',
                transition: 'all 0.18s',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <p
        style={{
          marginTop: 10,
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 12,
          color: 'rgba(245,240,232,0.55)',
        }}
      >
        {RELATIONSHIP_STAGES.find((s) => s.id === value)?.desc}
      </p>
    </div>
  );
}

/** Invite-partner CTA shown only when ?partner is missing. */
function PartnerInviteCta({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const u = new URL(window.location.href);
    u.searchParams.set('partner', '__PARTNER_SLUG__');
    return u.toString();
  }, []);

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
          margin: '0 0 10px',
        }}
      >
        让 ta 也测一份 CPTI · 把 ta 的 slug 加到链接末尾，自动合并成双人雷达。
      </p>
      <button
        type="button"
        onClick={() => {
          if (!url) return;
          navigator.clipboard.writeText(url.replace('__PARTNER_SLUG__', `${slug}-partner`));
          setCopied(true);
          setTimeout(() => setCopied(false), 2400);
        }}
        style={{
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: 999,
          border: '1px solid rgba(156,124,255,0.55)',
          background: 'rgba(156,124,255,0.18)',
          color: '#F5F0E8',
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.24em',
        }}
      >
        {copied ? 'COPIED ✓' : '复制邀请链接'}
      </button>
    </div>
  );
}
