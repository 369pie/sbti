'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';
import { getAnchor } from '@/lib/wtfi/constellation-anchors';
import { pickLettersForPlanet, type StardustLetter } from '@/lib/wtfi/stardust-letters';
import { getDailyEphemeris, type DailyEphemeris } from '@/lib/wtfi/daily-ephemeris';
import {
  computePairGravity,
  formatGravityValue,
  type PairGravityResult,
} from '@/lib/wtfi/gravity';
import { SoulSigil } from '@/components/galaxy/SoulSigil';
import { FragmentPalace } from '@/components/galaxy/FragmentPalace';
import { PantheonBadge } from '@/components/galaxy/PantheonBadge';
import { SignaturePerfumeCard } from '@/components/galaxy/SignaturePerfumeCard';
import { getCompanionForMoon, getShadowAvatar } from '@/lib/wtfi/pantheon';
import { MOON_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';
import { basePath } from '@/lib/site';
import {
  getPerfumeAnnotation,
  getSignaturePerfume,
} from '@/lib/wtfi/signature-perfume';
import type { SoulAnswers } from '@/lib/wtfi/soul-resonance';

/**
 * GalaxyPreview · WTFTI 人格星图 v2 · Editorial Cosmos
 *
 * 设计向：女性向 · 暮光博物笔记 × 星图占星志
 * 色板：暮紫底 #1a1530 / 玫瑰陶土 #C07A8E / 金箔 #C9A676 / 米白 #F5F0E8
 * 字体：Cormorant + Noto Serif SC（var(--font-display)）
 */
interface GalaxyPreviewProps {
  result: GalaxyResult;
  /** 是否真实跑过 S 轴并已解锁暗面（来自仪式或 session）。默认 false 保持 preview 行为 */
  shadowUnlockedByDefault?: boolean;
  /** 结果页已存在 session 时，用它把 CTA 接回 S 轴续跑，而不是只做本地展开 */
  resumeResultId?: string | null;
  /** 来自 session 的 soul probe 答案，用于"你嗅觉档案的延伸"个性化注解（可选） */
  soulAnswers?: SoulAnswers | null;
}

export default function GalaxyPreview({
  result,
  shadowUnlockedByDefault = false,
  resumeResultId = null,
  soulAnswers = null,
}: GalaxyPreviewProps) {
  // 有真实 shadow 数据（非 preview 的 NEUTRAL 占位）就直接解锁；
  // 否则沿用 ShadowGate 行为（用户需点"召唤异能者"，去走 /wtfti/galaxy/test）。
  const [shadowUnlocked, setShadowUnlocked] = useState(shadowUnlockedByDefault);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily:
          'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <StarFieldDecor />
      <DustOverlay />

      {/* 01 · Hero */}
      <section style={heroSection}>
        <Eyebrow gold>WTFTI · Personal Pantheon · 人格神域</Eyebrow>
        <h1 style={heroTitle}>
          你不是<em style={heroEm}>一</em>个人格
          <br />
          你是一整座<em style={heroEm}>人格神域</em>
        </h1>
        <Divider center style={{ marginTop: 28, marginBottom: 20 }} />
        <p style={heroSubtitle}>
          下方是属于你的 <span style={{ color: '#D4B58A' }}>6 重</span> 神性切片
          <br />
          <span style={{ opacity: 0.7 }}>主神化身 · 随侍三神 · 暗面化身 · 命运织线 · 灵魂印记 · 签名香水</span>
        </p>
        <div style={{ marginTop: 36 }}>
          <SerifNumeral roman="I" />
        </div>
      </section>

      {/* 02 · Home — Tutelary Deity */}
      <SectionFrame eyebrow="TUTELARY · 主神化身" title="你被哪位主神选中？" numeral="II">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <PantheonBadge slug={result.homePlanet.slug} />
        </div>
        <PlanetCard
          tier="HOME"
          accent="#C07A8E"
          accentSoft="rgba(192, 122, 142, 0.22)"
          code={result.homePlanet.code}
          name={result.homePlanet.name}
          headline={result.homePlanet.headline}
          body={result.homePlanet.body}
          imageUrl={result.homePlanet.cardImageUrl}
          axesVector={result.homePlanet.axesVector}
          planetSlug={result.homePlanet.slug}
        />
      </SectionFrame>

      {/* 03 · Moons — Three Companions */}
      <SectionFrame eyebrow="COMPANIONS · 随侍三神" title="你召唤哪三位神侍？" numeral="III">
        <p style={sectionLead}>
          每一个情境都会唤醒你身边的一位神侍。下面是你在
          <span style={{ color: '#C9A676' }}> 三个时辰 </span>里召唤的三位侍神。
        </p>
        <div style={moonScroller}>
          {result.moons.map((m, i) => (
            <div key={m.slug} style={moonCardSlot}>
              <MoonCard moon={m} index={i + 1} total={result.moons.length} />
            </div>
          ))}
        </div>
      </SectionFrame>

      {/* 04 · Shadow — Shadow Avatar */}
      <SectionFrame eyebrow="SHADOW · 暗面化身" title="你的异能者副形" numeral="IV">
        {!shadowUnlocked ? (
          <ShadowGate
            onUnlock={() => {
              trackGalaxyEvent('galaxy_shadow_unlock_cta', {
                slug: result.homePlanet.slug,
                props: { resumeResultId: resumeResultId ?? 'none' },
              });
              if (!result.shadow) {
                const params = new URLSearchParams();
                if (resumeResultId) {
                  params.set('startSoul', '1');
                  params.set('resultId', resumeResultId);
                }
                const target = `${basePath}/wtfti/galaxy/test/${params.toString() ? `?${params.toString()}` : ''}`;
                if (typeof window !== 'undefined') {
                  window.location.href = target;
                }
                return;
              }
              setShadowUnlocked(true);
            }}
          />
        ) : (
          result.shadow && (
            <PlanetCard
              tier="SHADOW"
              accent="#9C7CFF"
              accentSoft="rgba(156, 124, 255, 0.22)"
              code={result.shadow.bucket}
              name={result.shadow.name}
              headline={result.shadow.headline}
              body={result.shadow.body}
              tooltip={result.shadow.tooltip}
              imageUrl={result.shadow.cardImageUrl}
              shadow
              shadowBucket={result.shadow.bucket}
            />
          )
        )}
      </SectionFrame>

      {/* 05 · Orbit — Threads of Fate */}
      <SectionFrame eyebrow="THREADS · 命运织线" title="你在三神之间织出的命数" numeral="V">
        <OrbitMap result={result} />
      </SectionFrame>

      {/* 05.5 · Soul Sigil + Fragment Palace */}
      <SectionFrame eyebrow="SIGIL · 灵魂印记" title="只属于你的几何咒符" numeral="VI" tight>
        <SoulSigil galaxy={result} size={320} />
      </SectionFrame>

      {/* 06 · Signature Perfume + Soul Crystal */}
      {(() => {
        const perfume = getSignaturePerfume(result.homePlanet.slug);
        if (!perfume) return null;
        const annotation = getPerfumeAnnotation(soulAnswers);
        return (
          <SectionFrame
            eyebrow="SIGNATURE · 你的香水 · 你的结晶"
            title="如果神域有气味，那是你"
            numeral="VII"
          >
            <SignaturePerfumeCard perfume={perfume} annotation={annotation} />
          </SectionFrame>
        );
      })()}

      <SectionFrame eyebrow="FRAGMENTS · 镜面碎片" title="你和谁共享了一部分宇宙" numeral="VIII">
        <FragmentPalace galaxy={result} />
      </SectionFrame>

      {/* 07 · CTA */}
      <SectionFrame eyebrow="CONSTELLATION · 双人星图" title="想和 ta 碰撞星系吗？" numeral="IX" tight>
        <ConstellationCard result={result} />
      </SectionFrame>

      <Footer version={result.meta.testVersion} />
    </div>
  );
}

// ── Section primitives ──────────────────────────────────

function SectionFrame({
  eyebrow,
  title,
  numeral,
  tight,
  children,
}: {
  eyebrow: string;
  title: string;
  numeral: string;
  tight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ position: 'relative', padding: tight ? '64px 0 40px' : '88px 0 56px', zIndex: 1 }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <SerifNumeral roman={numeral} small />
        <Eyebrow gold>{eyebrow}</Eyebrow>
        <h2 style={sectionTitle}>{title}</h2>
        <Divider center style={{ margin: '20px auto 32px' }} />
      </div>
      {children}
    </section>
  );
}

function Eyebrow({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: '"Inter", "PingFang SC", system-ui, sans-serif',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: gold ? '#D4B58A' : 'rgba(245,240,232,0.55)',
      }}
    >
      {children}
    </p>
  );
}

function SerifNumeral({ roman, small }: { roman: string; small?: boolean }) {
  return (
    <div
      style={{
        margin: small ? '0 auto 6px' : '0 auto 12px',
        width: small ? 32 : 44,
        height: small ? 32 : 44,
        borderRadius: 999,
        border: '1px solid rgba(201,166,118,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#D4B58A',
        fontFamily: 'var(--font-display), serif',
        fontStyle: 'italic',
        fontSize: small ? 14 : 18,
        letterSpacing: 1,
        background: 'rgba(201,166,118,0.06)',
      }}
    >
      {roman}
    </div>
  );
}

function Divider({ center, style }: { center?: boolean; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        width: 64,
        marginLeft: center ? 'auto' : undefined,
        marginRight: center ? 'auto' : undefined,
        background:
          'linear-gradient(90deg, transparent, rgba(201,166,118,0.85), transparent)',
        ...style,
      }}
    />
  );
}

// ── Planet Card (HOME / SHADOW) ─────────────────────────

function PlanetCard({
  tier,
  accent,
  accentSoft,
  code,
  name,
  headline,
  body,
  tooltip,
  imageUrl,
  axesVector,
  shadow,
  shadowBucket,
  planetSlug,
}: {
  tier: 'HOME' | 'SHADOW';
  accent: string;
  accentSoft: string;
  code: string;
  name: string;
  headline: string;
  body: string;
  tooltip?: string;
  imageUrl: string;
  axesVector?: { W: number; T: number; F: number; I: number };
  shadow?: boolean;
  shadowBucket?: string;
  planetSlug?: string;
}) {
  const anchor = planetSlug ? getAnchor(planetSlug) : null;
  const letters = planetSlug ? pickLettersForPlanet(planetSlug) : [];
  const ephemeris = planetSlug && tier === 'HOME' ? getDailyEphemeris(planetSlug) : null;
  const shadowAvatar = shadow && shadowBucket ? getShadowAvatar(shadowBucket as Parameters<typeof getShadowAvatar>[0]) : null;
  return (
    <article
      style={{
        position: 'relative',
        width: 'min(calc(100% - 40px), 860px)',
        margin: '0 auto',
        padding: '8px 8px 28px',
        borderRadius: 28,
        background: shadow
          ? 'linear-gradient(180deg, #1c1438 0%, #0e0824 100%)'
          : 'linear-gradient(180deg, #251A3A 0%, #1c1334 100%)',
        border: `1px solid ${accentSoft}`,
        boxShadow: `0 30px 80px -30px ${accent}66, 0 0 0 1px rgba(255,255,255,0.04) inset`,
      }}
    >
      <CornerOrnament pos="tl" accent={accent} />
      <CornerOrnament pos="tr" accent={accent} />
      <CornerOrnament pos="bl" accent={accent} />
      <CornerOrnament pos="br" accent={accent} />

      <header style={{ padding: '14px 18px 10px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#D4B58A',
            fontSize: 10,
            letterSpacing: '0.4em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span>· {tier} ·</span>
          <span style={{ color: 'rgba(245,240,232,0.5)' }}>{code}</span>
        </div>
      </header>

      <PlanetVisual imageUrl={imageUrl} accent={accent} shadow={shadow} />

      <h3
        style={{
          margin: '24px 24px 6px',
          fontSize: 32,
          lineHeight: 1.15,
          fontFamily: 'var(--font-display), serif',
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}
      >
        {name}
      </h3>

      <p
        style={{
          margin: '0 24px 14px',
          textAlign: 'center',
          fontFamily: '"Cormorant Garamond", var(--font-display), serif',
          fontStyle: 'italic',
          fontSize: 17,
          color: accent,
          letterSpacing: '0.02em',
        }}
      >
        「{headline}」
      </p>

      <Divider center />

      <p
        style={{
          margin: '20px 26px 0',
          fontSize: 14,
          lineHeight: 1.85,
          color: 'rgba(245,240,232,0.78)',
          textAlign: 'center',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        {body}
      </p>

      {shadowAvatar && (
        <div
          style={{
            margin: '18px 26px 0',
            padding: '14px 16px',
            borderRadius: 14,
            background:
              'linear-gradient(155deg, rgba(156,124,255,0.12) 0%, rgba(20,12,60,0.45) 100%)',
            border: '1px solid rgba(201,182,255,0.28)',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(201,182,255,0.85)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ✦ 异能者档案 · {shadowAvatar.latinName}
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: 'rgba(245,240,232,0.85)',
              fontFamily: '"Noto Serif SC", serif',
              lineHeight: 1.65,
            }}
          >
            <span style={{ color: '#D4B58A', marginRight: 6 }}>{shadowAvatar.iconGlyph}</span>
            {shadowAvatar.archetype} · 「{shadowAvatar.power}」
          </p>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 13.5,
              color: '#C9B6FF',
              fontStyle: 'italic',
              fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
              lineHeight: 1.6,
            }}
          >
            「{shadowAvatar.oneLiner}」
          </p>
        </div>
      )}

      {axesVector && <AxesBars vector={axesVector} accent={accent} />}

      {anchor && <ConstellationPanel anchor={anchor} accent={accent} />}

      {letters.length > 0 && <StardustCarousel letters={letters} accent={accent} />}

      {ephemeris && <EphemerisPanel ephemeris={ephemeris} accent={accent} />}

      {tooltip && (
        <details
          style={{
            margin: '20px 26px 0',
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(212,181,138,0.08)',
            border: '1px solid rgba(212,181,138,0.22)',
            color: 'rgba(245,240,232,0.7)',
            fontSize: 12,
            fontFamily: '"Noto Serif SC", serif',
          }}
        >
          <summary style={{ cursor: 'pointer', color: '#D4B58A' }}>
            ✦ 一段不重要的科学注解
          </summary>
          <p style={{ marginTop: 8, lineHeight: 1.7 }}>{tooltip}</p>
        </details>
      )}

      <div
        style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: '0.3em',
          color: 'rgba(245,240,232,0.4)',
        }}
      >
        ✦ 长按保存这张星卡 ✦
      </div>
    </article>
  );
}

function CornerOrnament({ pos, accent }: { pos: 'tl' | 'tr' | 'bl' | 'br'; accent: string }) {
  const base: CSSProperties = {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: accent,
    opacity: 0.6,
  };
  const map: Record<typeof pos, CSSProperties> = {
    tl: { ...base, top: 8, left: 8, borderLeft: '1px solid', borderTop: '1px solid' },
    tr: { ...base, top: 8, right: 8, borderRight: '1px solid', borderTop: '1px solid' },
    bl: { ...base, bottom: 8, left: 8, borderLeft: '1px solid', borderBottom: '1px solid' },
    br: { ...base, bottom: 8, right: 8, borderRight: '1px solid', borderBottom: '1px solid' },
  };
  return <div aria-hidden style={map[pos]} />;
}

function PlanetVisual({ imageUrl, accent, shadow }: { imageUrl: string; accent: string; shadow?: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        margin: '8px 18px 0',
        aspectRatio: '1 / 1',
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${accent}4d`,
        boxShadow: `0 20px 60px -30px ${accent}66`,
        background: shadow
          ? 'linear-gradient(180deg, rgba(20,12,60,0.72) 0%, rgba(10,6,30,0.9) 100%)'
          : 'linear-gradient(180deg, rgba(26,21,48,0.55) 0%, rgba(15,10,34,0.78) 100%)',
      }}
    >
      {/* 直接展示图鉴图片，保证完整显示不裁剪 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: shadow
            ? 'rgba(10, 6, 30, 0.6)'
            : 'rgba(15, 10, 34, 0.4)',
        }}
      />

      {/* 轻微渐暗遮罩，保证标题区可读性 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(9,6,22,0.58) 0%, rgba(9,6,22,0.16) 34%, rgba(9,6,22,0.42) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function Sparkles() {
  const dots = [
    { top: '10%', left: '14%', size: 3, op: 0.9 },
    { top: '20%', left: '82%', size: 2, op: 0.7 },
    { top: '74%', left: '12%', size: 2, op: 0.6 },
    { top: '86%', left: '70%', size: 4, op: 0.85 },
    { top: '40%', left: '6%', size: 1.5, op: 0.5 },
    { top: '60%', left: '92%', size: 3, op: 0.8 },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: '#fff',
            opacity: d.op,
            boxShadow: '0 0 6px rgba(255,255,255,0.7)',
          }}
        />
      ))}
    </>
  );
}

function AxesBars({
  vector,
  accent,
}: {
  vector: { W: number; T: number; F: number; I: number };
  accent: string;
}) {
  const labels = [
    { axis: 'W', name: '触发反应' },
    { axis: 'T', name: '情绪倾斜' },
    { axis: 'F', name: '应对弹性' },
    { axis: 'I', name: '印记锚点' },
  ] as const;
  return (
    <div style={{ margin: '24px 26px 0' }}>
      <Eyebrow>Axes · 4 轴向量</Eyebrow>
      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {labels.map((l) => {
          const v = vector[l.axis as keyof typeof vector];
          const pct = ((v + 3) / 6) * 100;
          return (
            <div key={l.axis} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 18,
                  fontFamily: 'var(--font-display), serif',
                  fontStyle: 'italic',
                  color: '#D4B58A',
                  fontSize: 14,
                }}
              >
                {l.axis}
              </span>
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: 'rgba(245,240,232,0.08)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: -2,
                    width: 1,
                    height: 10,
                    background: 'rgba(245,240,232,0.18)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: pct >= 50 ? '50%' : `${pct}%`,
                    width: `${Math.abs(pct - 50)}%`,
                    background: accent,
                    borderRadius: 999,
                    boxShadow: `0 0 12px ${accent}aa`,
                  }}
                />
              </div>
              <span
                style={{
                  width: 36,
                  textAlign: 'right',
                  fontSize: 12,
                  color: 'rgba(245,240,232,0.6)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {v >= 0 ? '+' : ''}
                {v.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Moon Card ───────────────────────────────────────────

function MoonCard({
  moon,
  index,
  total,
}: {
  moon: GalaxyResult['moons'][number];
  index: number;
  total: number;
}) {
  const universeLabel: Record<string, string> = {
    romance: '恋爱里的你',
    work: '工作里的你',
    'late-night': '深夜独处的你',
    cpti: 'CP 互动里的你',
    soulti: '自我对话里的你',
  };
  const label = universeLabel[moon.universeId] ?? moon.universeId;

  return (
    <article
      style={{
        margin: 0,
        padding: '14px 14px 22px',
        borderRadius: 22,
        background:
          'linear-gradient(180deg, rgba(245,240,232,0.045) 0%, rgba(245,240,232,0.015) 100%)',
        border: '1px solid rgba(212,181,138,0.22)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0 18px 40px -20px rgba(192,122,142,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#D4B58A',
          fontSize: 10,
          letterSpacing: '0.32em',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span>
          MOON · {String(index).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
        <span style={{ color: 'rgba(245,240,232,0.5)' }}>{moon.code}</span>
      </header>

      {(() => {
        const moonEntry = MOON_PLANET_CATALOG.find((e) => e.slug === moon.slug);
        const moonAccent = moonEntry?.accent ?? '#C07A8E';
        const moonAccentHex = moonAccent;
        const companion = getCompanionForMoon(moon.slug);
        return (
          <div
            style={{
              position: 'relative',
              marginTop: 12,
              aspectRatio: '1 / 1',
              borderRadius: 16,
              overflow: 'hidden',
              background: `radial-gradient(circle at 50% 35%, ${moonAccentHex}22, transparent 60%)`,
            }}
          >
            {/* Orbit rings with moon accent */}
            <svg
              viewBox="0 0 200 200"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45, mixBlendMode: 'screen' }}
            >
              <ellipse cx="100" cy="100" rx="88" ry="28" fill="none" stroke={moonAccentHex} strokeWidth="0.7" strokeDasharray="2 4" transform="rotate(-22 100 100)" />
            </svg>

            {/* Layer 1: gradient sphere with moon-specific accent */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '70%',
                height: '70%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, #FFE0B6 0%, ${moonAccentHex} 45%, #1e1230 90%)`,
                boxShadow: `0 0 60px ${moonAccentHex}99`,
              }}
            />

            {/* Layer 2: companion iconGlyph centered in orb */}
            {companion && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 28,
                  lineHeight: 1,
                  opacity: 0.55,
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {companion.iconGlyph}
              </div>
            )}

            {/* Layer 3: sphere shading for 3-D depth */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '70%',
                height: '70%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 66% 70%, rgba(0,0,0,0.5) 0%, transparent 50%), radial-gradient(circle at 28% 26%, rgba(255,255,255,0.14) 0%, transparent 36%)',
                boxShadow: 'inset -14px -20px 44px rgba(0,0,0,0.48)',
                pointerEvents: 'none',
              }}
            />

            <Sparkles />
          </div>
        );
      })()}

      <p
        style={{
          marginTop: 16,
          fontSize: 11,
          letterSpacing: '0.3em',
          color: 'rgba(212,181,138,0.85)',
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
        }}
      >
        — {label} —
      </p>

      <CompanionOverlay moonSlug={moon.slug} fallbackName={moon.name} />

      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: '#C07A8E',
          fontStyle: 'italic',
          fontFamily: '"Cormorant Garamond", serif',
        }}
      >
        「{moon.headline}」
      </p>

      <p
        style={{
          marginTop: 10,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'rgba(245,240,232,0.72)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        {moon.body}
      </p>
    </article>
  );
}

function CompanionOverlay({ moonSlug, fallbackName }: { moonSlug: string; fallbackName: string }) {
  const companion = getCompanionForMoon(moonSlug);
  if (!companion) {
    return (
      <h4 style={{ margin: '6px 0 8px', fontSize: 22, fontFamily: 'var(--font-display), serif', letterSpacing: '0.04em' }}>
        {fallbackName}
      </h4>
    );
  }
  return (
    <div style={{ margin: '6px 0 10px' }}>
      <h4
        style={{
          margin: 0,
          fontSize: 21,
          fontFamily: 'var(--font-display), serif',
          letterSpacing: '0.04em',
          color: '#F5F0E8',
        }}
      >
        <span style={{ marginRight: 8, color: '#D4B58A' }}>{companion.iconGlyph}</span>
        {companion.name}
      </h4>
      <p
        style={{
          margin: '4px 0 6px',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(212,181,138,0.78)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {companion.latinName} · {companion.mythicSource}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          lineHeight: 1.65,
          color: 'rgba(245,240,232,0.78)',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          fontStyle: 'italic',
        }}
      >
        · 她对你做的事：{companion.whatSheDoes}
      </p>
    </div>
  );
}

// ── Shadow Gate ─────────────────────────────────────────

function ShadowGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 'min(calc(100% - 40px), 760px)',
        margin: '0 auto',
        padding: '40px 28px 32px',
        borderRadius: 28,
        textAlign: 'center',
        background:
          'radial-gradient(ellipse 100% 80% at 50% 30%, rgba(156,124,255,0.18), rgba(15,10,34,0.95) 70%)',
        border: '1px dashed rgba(201,182,255,0.5)',
        overflow: 'hidden',
      }}
    >
      <Sparkles />
      <div aria-hidden style={{ position: 'relative', margin: '0 auto 24px', width: 130, height: 130 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(201,182,255,0.4) 0%, rgba(20,12,60,0.8) 60%, rgba(7,5,31,1) 100%)',
            boxShadow: '0 0 40px rgba(156,124,255,0.4), inset -10px -16px 30px rgba(0,0,0,0.6)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4B58A',
            fontSize: 28,
            fontFamily: 'var(--font-display), serif',
            textShadow: '0 0 16px rgba(212,181,138,0.7)',
          }}
        >
          ✦
        </span>
      </div>
      <p
        style={{
          color: '#C9B6FF',
          fontSize: 11,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
          margin: 0,
        }}
      >
        Shadow Avatar · Sealed
      </p>
      <h3
        style={{
          fontFamily: 'var(--font-display), serif',
          fontSize: 26,
          margin: '12px 0 10px',
          letterSpacing: '0.05em',
        }}
      >
        你还没给自己
        <br />
        <em style={{ fontStyle: 'italic', color: '#D4B58A' }}>召唤暗面化身</em>
      </h3>
      <p
        style={{
          margin: '0 auto 24px',
          maxWidth: 320,
          fontSize: 13.5,
          lineHeight: 1.85,
          color: 'rgba(245,240,232,0.75)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        用 45 秒召唤你的暗面化身——
        <br />
        吸血鬼、狼人、女巫、塞壬、狐仙，
        <br />
        <span style={{ color: '#D4B58A' }}>你今夜会是哪一位？</span>
      </p>
      <button onClick={onUnlock} style={primaryButton}>
        ✦ 召唤你的异能者 ✦
      </button>
      <p
        style={{
          marginTop: 14,
          fontSize: 11,
          letterSpacing: '0.3em',
          color: 'rgba(245,240,232,0.4)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        — 仅自己可见 · 不分享你做过测试 —
      </p>
    </div>
  );
}

// ── Orbit Map ───────────────────────────────────────────

function OrbitMap({ result }: { result: GalaxyResult }) {
  const { homePlanet, moons, shadow, orbit } = result;
  const allDestinations: Array<{ name: string; tone: 'moon' | 'shadow' }> = [
    ...moons.map((m) => ({ name: m.name, tone: 'moon' as const })),
    ...(shadow ? [{ name: shadow.name, tone: 'shadow' as const }] : []),
  ];
  const reasonOf = (name: string) => orbit.find((o) => o.to === name)?.reason ?? '';

  const total = allDestinations.length;
  const cx = 200;
  const cy = 170;
  const rx = 150;
  const ry = 75;

  return (
    <div style={{ padding: '0 20px' }}>
      <div
        style={{
          position: 'relative',
          margin: '0 auto',
          maxWidth: 460,
          padding: '20px 16px 28px',
          borderRadius: 24,
          background: 'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(245,240,232,0.01) 100%)',
          border: '1px solid rgba(212,181,138,0.2)',
        }}
      >
        <svg viewBox="0 0 400 340" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <radialGradient id="homeOrb" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#FFE0B6" />
              <stop offset="40%" stopColor="#C07A8E" />
              <stop offset="100%" stopColor="#3a1a28" />
            </radialGradient>
            <radialGradient id="moonOrb" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#FFE9C9" />
              <stop offset="60%" stopColor="#D4B58A" />
              <stop offset="100%" stopColor="#5b3d22" />
            </radialGradient>
            <radialGradient id="shadowOrb" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#C9B6FF" />
              <stop offset="55%" stopColor="#9C7CFF" />
              <stop offset="100%" stopColor="#2A1B6B" />
            </radialGradient>
          </defs>

          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(212,181,138,0.45)" strokeWidth="0.6" strokeDasharray="2 4" />
          <ellipse cx={cx} cy={cy} rx={rx - 30} ry={ry - 18} fill="none" stroke="rgba(192,122,142,0.4)" strokeWidth="0.6" strokeDasharray="1 3" />
          <ellipse cx={cx} cy={cy} rx={rx + 30} ry={ry + 18} fill="none" stroke="rgba(156,124,255,0.35)" strokeWidth="0.6" strokeDasharray="1 5" />

          {[
            [40, 50],
            [360, 40],
            [60, 290],
            [350, 280],
            [200, 30],
            [200, 320],
            [310, 130],
            [90, 180],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="#fff" opacity={0.55} />
          ))}

          <circle cx={cx} cy={cy} r={36} fill="url(#homeOrb)" filter="drop-shadow(0 0 18px rgba(192,122,142,0.85))" />
          <text x={cx} y={cy + 60} textAnchor="middle" fill="#F5F0E8" fontFamily="var(--font-display), serif" fontSize="14" letterSpacing="0.06em">
            {homePlanet.name}
          </text>
          <text x={cx} y={cy + 76} textAnchor="middle" fill="#D4B58A" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="0.32em">
            HOME
          </text>

          {allDestinations.map((d, i) => {
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            const x = cx + Math.cos(angle) * rx;
            const y = cy + Math.sin(angle) * ry;
            return (
              <g key={d.name}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={d.tone === 'shadow' ? '#9C7CFF' : '#D4B58A'}
                  strokeWidth="0.4"
                  strokeDasharray="1 4"
                  opacity={0.65}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill={d.tone === 'shadow' ? 'url(#shadowOrb)' : 'url(#moonOrb)'}
                  filter={`drop-shadow(0 0 10px ${d.tone === 'shadow' ? 'rgba(156,124,255,0.7)' : 'rgba(212,181,138,0.7)'})`}
                />
                <text
                  x={x}
                  y={y + 28}
                  textAnchor="middle"
                  fill="#F5F0E8"
                  fontFamily="var(--font-display), serif"
                  fontSize="11"
                  letterSpacing="0.04em"
                >
                  {d.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul
        style={{
          margin: '24px auto 0',
          maxWidth: 460,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 10,
        }}
      >
        {allDestinations.map((d) => (
          <li
            key={d.name}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(245,240,232,0.04)',
              border: '1px solid rgba(212,181,138,0.18)',
              fontFamily: '"Noto Serif SC", serif',
            }}
          >
            <span
              style={{
                color: d.tone === 'shadow' ? '#C9B6FF' : '#D4B58A',
                fontFamily: 'var(--font-display), serif',
                fontStyle: 'italic',
                fontSize: 13,
                letterSpacing: '0.04em',
              }}
            >
              → {d.name}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.78)', lineHeight: 1.7 }}>
              {reasonOf(d.name)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Constellation CTA ───────────────────────────────────

function ConstellationCard({ result }: { result: GalaxyResult }) {
  const partner = MOCK_PARTNER_GALAXY;
  const gravity = computePairGravity(result, partner);
  return (
    <div
      style={{
        position: 'relative',
        width: 'min(calc(100% - 40px), 780px)',
        margin: '0 auto',
        padding: '32px 24px',
        borderRadius: 28,
        background:
          'linear-gradient(135deg, rgba(192,122,142,0.18) 0%, rgba(201,166,118,0.12) 50%, rgba(156,124,255,0.14) 100%)',
        border: '1px solid rgba(212,181,138,0.32)',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <Sparkles />
      <div aria-hidden style={{ position: 'relative', margin: '0 auto 20px', width: 160, height: 100 }}>
        <div style={miniOrb({ left: 8, accent: '#C07A8E' })} />
        <div style={miniOrb({ left: 80, accent: '#9C7CFF' })} />
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 56,
            color: '#D4B58A',
            fontFamily: 'var(--font-display), serif',
            fontStyle: 'italic',
            fontSize: 32,
            textShadow: '0 0 12px rgba(212,181,138,0.6)',
          }}
        >
          ⚭
        </div>
      </div>

      <Eyebrow gold>Two Galaxies · Compatibility</Eyebrow>
      <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, margin: '10px 0 10px', letterSpacing: '0.04em' }}>
        想看你和 ta 的<em style={{ color: '#C07A8E' }}>星系兼容度</em>吗？
      </h3>
      <p
        style={{
          margin: '0 auto 20px',
          maxWidth: 320,
          fontSize: 13,
          lineHeight: 1.85,
          color: 'rgba(245,240,232,0.75)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        把你的星图发给 ta，
        <br />
        我们会叠合两个星系，告诉你们彼此哪一颗星互相吸引，哪一颗星互相回避。
      </p>

      <GravityPreview gravity={gravity} partnerName={partner.homePlanet.name} />

      <a
        href={`/wtfti/galaxy/pair/${result.homePlanet.slug}/${partner.homePlanet.slug}/`}
        style={{
          ...ghostButton,
          display: 'inline-block',
          textDecoration: 'none',
          marginRight: 8,
        }}
      >
        邀请好友碰撞星系
      </a>
      <a
        href={`/wtfti/galaxy/planet/${result.homePlanet.slug}/`}
        style={{
          appearance: 'none',
          display: 'inline-block',
          marginTop: 12,
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.6)',
          textDecoration: 'none',
          borderBottom: '1px solid rgba(212,181,138,0.4)',
          paddingBottom: 2,
        }}
      >
        ☆ 读 {result.homePlanet.name} 的本星档案
      </a>
    </div>
  );
}

// ── Constellation Panel · 主星 ↔ 星座档案 ────────────────

function ConstellationPanel({
  anchor,
  accent,
}: {
  anchor: ReturnType<typeof getAnchor>;
  accent: string;
}) {
  if (!anchor) return null;
  return (
    <details
      style={{
        margin: '20px 26px 0',
        padding: '14px 16px 16px',
        borderRadius: 14,
        background:
          'linear-gradient(180deg, rgba(212,181,138,0.08) 0%, rgba(245,240,232,0.02) 100%)',
        border: '1px solid rgba(212,181,138,0.28)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          color: '#D4B58A',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 11,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
        }}
      >
        ✦ Star Atlas · 本星档案
      </summary>
      <div style={{ marginTop: 14 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display), serif',
            fontStyle: 'italic',
            fontSize: 18,
            color: '#F5F0E8',
            letterSpacing: '0.04em',
          }}
        >
          {anchor.constellationLatin}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 12,
            letterSpacing: '0.3em',
            color: 'rgba(212,181,138,0.85)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          — {anchor.constellation} —
        </p>
        <ul
          style={{
            margin: '14px 0 0',
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gap: 10,
            fontFamily: '"Noto Serif SC", serif',
          }}
        >
          <PanelRow label="神话" body={anchor.myth} />
          <PanelRow label="科学" body={anchor.science} />
          <PanelRow
            label="文学"
            body={`「${anchor.literary.quote}」 — ${anchor.literary.author}`}
            italic
            color={accent}
          />
        </ul>
      </div>
    </details>
  );
}

function PanelRow({
  label,
  body,
  italic,
  color,
}: {
  label: string;
  body: string;
  italic?: boolean;
  color?: string;
}) {
  return (
    <li style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 10 }}>
      <span
        style={{
          color: '#D4B58A',
          fontSize: 10,
          letterSpacing: '0.3em',
          fontFamily: 'Inter, sans-serif',
          paddingTop: 3,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          lineHeight: 1.75,
          color: color ?? 'rgba(245,240,232,0.78)',
          fontStyle: italic ? 'italic' : 'normal',
          fontFamily: italic ? '"Cormorant Garamond", serif' : '"Noto Serif SC", serif',
        }}
      >
        {body}
      </span>
    </li>
  );
}

// ── Stardust Carousel · 文学引语轮播 ────────────────────

function StardustCarousel({
  letters,
  accent,
}: {
  letters: StardustLetter[];
  accent: string;
}) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const cur = letters[idx % letters.length];

  const onCopy = async () => {
    const text = `「${cur.quote}」— ${cur.author}${cur.source ? ` · ${cur.source}` : ''}\n\n— from WTFTI 人格星图`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };
  return (
    <div
      style={{
        margin: '20px 26px 0',
        padding: '18px 18px 14px',
        borderRadius: 16,
        border: `1px solid ${accent}44`,
        background:
          'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(212,181,138,0.08), rgba(15,10,34,0.4) 80%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#D4B58A',
          fontSize: 10,
          letterSpacing: '0.32em',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span>✦ Stardust Letter · 星尘信</span>
        <span style={{ color: 'rgba(245,240,232,0.45)' }}>
          {String(idx + 1).padStart(2, '0')} / {String(letters.length).padStart(2, '0')}
        </span>
      </div>
      <p
        key={cur.id}
        style={{
          margin: '14px 0 6px',
          fontFamily: '"Cormorant Garamond", var(--font-display), serif',
          fontStyle: 'italic',
          fontSize: 17,
          lineHeight: 1.55,
          color: '#F5F0E8',
          letterSpacing: '0.02em',
        }}
      >
        「{cur.quote}」
      </p>
      {cur.translation && (
        <p
          style={{
            margin: '0 0 6px',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 12.5,
            color: 'rgba(245,240,232,0.65)',
            lineHeight: 1.7,
          }}
        >
          {cur.translation}
        </p>
      )}
      <p
        style={{
          margin: 0,
          textAlign: 'right',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: accent,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        — {cur.author}
        {cur.source ? ` · ${cur.source}` : ''}
      </p>
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {letters.map((_, i) => (
          <button
            key={i}
            aria-label={`星尘信 ${i + 1}`}
            onClick={() => setIdx(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              background: i === idx ? accent : 'rgba(245,240,232,0.25)',
              boxShadow: i === idx ? `0 0 10px ${accent}` : 'none',
              transition: 'background 200ms ease',
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <button
          type="button"
          onClick={onCopy}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: copied ? accent : 'rgba(245,240,232,0.55)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: '4px 10px',
          }}
        >
          {copied ? '✓ 已复制 · 可粘贴发圈' : '☆ 复制这一句'}
        </button>
      </div>
    </div>
  );
}

// ── Pair Gravity · 双星引力预演 ────────────────────────

function GravityPreview({
  gravity,
  partnerName,
}: {
  gravity: PairGravityResult;
  partnerName: string;
}) {
  const { band, leadingAxisExplain, quote, G } = gravity;
  return (
    <div
      style={{
        margin: '0 0 24px',
        padding: '20px 18px',
        borderRadius: 18,
        background: 'rgba(15,10,34,0.45)',
        border: `1px solid ${band.accent}55`,
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.32em',
            color: '#D4B58A',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ✦ Sample · 你 ↔ {partnerName}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display), serif',
            fontStyle: 'italic',
            color: band.accent,
            fontSize: 18,
            letterSpacing: '0.04em',
            textShadow: `0 0 10px ${band.accent}66`,
          }}
        >
          {formatGravityValue(G)}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-display), serif',
          fontSize: 22,
          letterSpacing: '0.05em',
          color: '#F5F0E8',
        }}
      >
        {band.name}
      </p>
      <p
        style={{
          margin: '8px 0 12px',
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 13,
          lineHeight: 1.8,
          color: 'rgba(245,240,232,0.78)',
        }}
      >
        {band.narration}
      </p>
      <p
        style={{
          margin: '0 0 12px',
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 12,
          color: 'rgba(245,240,232,0.55)',
          lineHeight: 1.7,
        }}
      >
        {leadingAxisExplain}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 14,
          color: band.accent,
          lineHeight: 1.6,
        }}
      >
        「{quote.quote}」
        <span
          style={{
            display: 'block',
            marginTop: 4,
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(245,240,232,0.5)',
            fontFamily: 'Inter, sans-serif',
            fontStyle: 'normal',
          }}
        >
          — {quote.author}
        </span>
      </p>
    </div>
  );
}

// Mock partner used for the in-page gravity demo (real pair flow to come).
const MOCK_PARTNER_GALAXY: GalaxyResult = {
  homePlanet: {
    code: 'WTFI-AUR',
    name: '极光客厅',
    slug: 'home-aurora-parlour',
    axesVector: { W: 1.1, T: -1.4, F: 0.9, I: 1.6 },
    headline: 'ta 把每一次相遇都布置成展览。',
    body: 'ta 的内心常亮着一盏暖灯，所有人路过都觉得自己被记得。',
    cardImageUrl: '/images/types/galaxy/home-storm-harbor.png',
  },
  moons: [
    {
      universeId: 'romance',
      code: 'MOON-ROM-B',
      name: '夜灯侍神',
      slug: 'moon-romance-nightlamp',
      headline: '在恋爱里 ta 是一盏不熄的小灯。',
      body: 'ta 不擅长承诺，但很擅长留灯。',
      cardImageUrl: '/images/types/galaxy/moon-romance-spring.png',
    },
    {
      universeId: 'work',
      code: 'MOON-WRK-B',
      name: '调度侍神',
      slug: 'moon-work-orchestra',
      headline: '工作里 ta 是把所有人放对位置的指挥。',
      body: 'ta 的专注是结构性的。',
      cardImageUrl: '/images/types/galaxy/moon-work-laser.png',
    },
  ],
  shadow: {
    axisScore: 1.8,
    bucket: 'SHADOW-ANCHOR-B',
    slug: 'shadow-aurora-quiet',
    name: '熄灯时刻',
    headline: 'ta 在所有人散场后才允许自己疲惫。',
    body: '深夜的 ta 会突然想起你白天说过的一句话。',
    tooltip: '高情绪劳动者常在 23:00 后才进入真实的 default mode。',
    cardImageUrl: '/images/types/galaxy/shadow-drift-a-nameless-current.png',
  },
  orbit: [],
  meta: {
    resultId: 'mock-partner-result',
    createdAt: '2026-04-19T00:00:00.000Z',
    testVersion: 'mock-partner-v1',
  },
};

// ── Big Bang Opener removed (RitualQuizRunner owns the cinematic opener) ──

function miniOrb({ left, accent }: { left: number; accent: string }): CSSProperties {
  return {
    position: 'absolute',
    top: 12,
    left,
    width: 76,
    height: 76,
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, #FFE0B6 0%, ${accent} 45%, #1a1147 90%)`,
    boxShadow: `0 0 30px ${accent}aa, inset -10px -14px 22px rgba(0,0,0,0.55)`,
    mixBlendMode: 'screen',
  };
}

// ── Decor ───────────────────────────────────────────────

function StarFieldDecor() {
  const stars = [
    { x: 5, y: 8, r: 0.8 }, { x: 12, y: 22, r: 1.2 }, { x: 22, y: 5, r: 0.6 },
    { x: 32, y: 18, r: 0.9 }, { x: 45, y: 10, r: 1.3 }, { x: 58, y: 24, r: 0.7 },
    { x: 70, y: 6, r: 1 }, { x: 82, y: 16, r: 0.8 }, { x: 92, y: 28, r: 1.4 },
    { x: 8, y: 38, r: 0.7 }, { x: 24, y: 48, r: 1.1 }, { x: 40, y: 42, r: 0.6 },
    { x: 56, y: 50, r: 0.9 }, { x: 72, y: 46, r: 1.2 }, { x: 88, y: 52, r: 0.8 },
    { x: 14, y: 64, r: 1 }, { x: 30, y: 72, r: 0.6 }, { x: 48, y: 68, r: 1.3 },
    { x: 64, y: 76, r: 0.8 }, { x: 80, y: 70, r: 1 }, { x: 96, y: 80, r: 0.7 },
    { x: 4, y: 88, r: 1.2 }, { x: 18, y: 92, r: 0.8 }, { x: 36, y: 96, r: 0.6 },
    { x: 52, y: 88, r: 1 }, { x: 68, y: 96, r: 0.7 }, { x: 84, y: 90, r: 1.1 },
  ];
  return (
    <svg
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.18} fill="#fff" opacity={0.55 + (i % 3) * 0.15} />
      ))}
    </svg>
  );
}

function DustOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 80% 50% at 30% 20%, rgba(192,122,142,0.18), transparent 60%), ' +
          'radial-gradient(ellipse 70% 40% at 80% 70%, rgba(156,124,255,0.16), transparent 65%), ' +
          'radial-gradient(ellipse 60% 30% at 50% 95%, rgba(201,166,118,0.12), transparent 60%)',
        mixBlendMode: 'screen',
        zIndex: 0,
      }}
    />
  );
}

function Footer({ version }: { version: string }) {
  return (
    <footer style={{ marginTop: 96, padding: '40px 24px 64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <Divider center style={{ marginBottom: 24 }} />
      <p style={{ fontFamily: 'var(--font-display), serif', fontStyle: 'italic', fontSize: 16, color: '#D4B58A', margin: '0 0 8px' }}>
        WTFTI · Personality Atlas
      </p>
      <p style={{ fontSize: 11, letterSpacing: '0.32em', color: 'rgba(245,240,232,0.4)', fontFamily: 'Inter, sans-serif' }}>
        WHAT&apos;S THE F* TYPE INSIDE
      </p>
      <p style={{ marginTop: 16, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(245,240,232,0.3)', fontFamily: 'Inter, sans-serif' }}>
        v {version}
      </p>
    </footer>
  );
}

// ── Tokens ──────────────────────────────────────────────

const heroSection: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '88px 24px 56px',
  minHeight: '78vh',
  justifyContent: 'center',
};

const heroTitle: CSSProperties = {
  fontFamily: 'var(--font-display), serif',
  fontSize: 38,
  lineHeight: 1.25,
  margin: '24px 0 0',
  letterSpacing: '0.04em',
  color: '#F5F0E8',
};

const heroEm: CSSProperties = {
  fontStyle: 'italic',
  color: '#D4B58A',
  padding: '0 4px',
};

const heroSubtitle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 14,
  lineHeight: 1.85,
  color: 'rgba(245,240,232,0.78)',
  margin: 0,
  maxWidth: 680,
};

const sectionTitle: CSSProperties = {
  fontFamily: 'var(--font-display), serif',
  fontSize: 26,
  margin: '12px 0 0',
  letterSpacing: '0.04em',
  color: '#F5F0E8',
  position: 'relative',
  zIndex: 1,
};

const sectionLead: CSSProperties = {
  textAlign: 'center',
  fontSize: 13,
  color: 'rgba(245,240,232,0.7)',
  fontFamily: '"Noto Serif SC", serif',
  margin: '-8px auto 24px',
  maxWidth: 680,
  padding: '0 24px',
  lineHeight: 1.85,
};

const moonScroller: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 18,
  width: 'min(calc(100% - 32px), 1080px)',
  margin: '0 auto',
  padding: '8px 16px 24px',
};

const moonCardSlot: CSSProperties = {
  minWidth: 0,
  display: 'flex',
};

const primaryButton: CSSProperties = {
  appearance: 'none',
  border: '1px solid #C9A676',
  borderRadius: 999,
  padding: '14px 32px',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  background: 'linear-gradient(135deg, #C07A8E 0%, #9C7CFF 100%)',
  color: '#FFF7E6',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 12px 30px -10px rgba(192,122,142,0.7), 0 0 0 1px rgba(212,181,138,0.3) inset',
};

const ghostButton: CSSProperties = {
  appearance: 'none',
  borderRadius: 999,
  padding: '14px 32px',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  background: 'transparent',
  border: '1px solid rgba(212,181,138,0.7)',
  color: '#F5F0E8',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};

function EphemerisPanel({ ephemeris, accent }: { ephemeris: DailyEphemeris; accent: string }) {
  return (
    <section
      style={{
        margin: '20px 26px 0',
        padding: '16px 18px 18px',
        borderRadius: 14,
        background: `linear-gradient(180deg, ${accent}10 0%, rgba(15,10,34,0.45) 100%)`,
        border: `1px solid ${accent}33`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 90% 0%, rgba(212,181,138,0.18) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', position: 'relative' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 9.5,
            letterSpacing: '0.42em',
            color: '#D4B58A',
            textTransform: 'uppercase',
          }}
        >
          ✦ Today&apos;s Ephemeris
        </p>
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 10,
            color: 'rgba(245,240,232,0.4)',
            letterSpacing: '0.1em',
          }}
        >
          {ephemeris.date}
        </span>
      </div>
      <h4
        style={{
          margin: '10px 0 6px',
          fontFamily: 'var(--font-display), serif',
          fontSize: 18,
          color: '#F5F0E8',
          letterSpacing: '0.04em',
          position: 'relative',
        }}
      >
        {ephemeris.event.title}
      </h4>
      <p
        style={{
          margin: '0 0 12px',
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 12.5,
          lineHeight: 1.8,
          color: 'rgba(245,240,232,0.78)',
          position: 'relative',
        }}
      >
        {ephemeris.event.narration}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 13,
          lineHeight: 1.6,
          color: accent,
          paddingLeft: 12,
          borderLeft: `2px solid ${accent}77`,
          position: 'relative',
        }}
      >
        「{ephemeris.stardust.quote}」
        <span
          style={{
            display: 'block',
            marginTop: 4,
            fontStyle: 'normal',
            fontFamily: 'Inter, sans-serif',
            fontSize: 9.5,
            letterSpacing: '0.2em',
            color: 'rgba(245,240,232,0.5)',
          }}
        >
          — {ephemeris.stardust.author}
        </span>
      </p>
    </section>
  );
}
