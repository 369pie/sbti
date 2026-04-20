'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  HOME_PLANET_CATALOG,
  type HomePlanetEntry,
} from '@/lib/wtfi/galaxy-planets';
import { computePairGravity, formatGravityValue } from '@/lib/wtfi/gravity';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';
import { getDeity } from '@/lib/wtfi/pantheon';
import { calcKindredAffinity } from '@/lib/wtfi/fragment-palace';
import {
  calcSoulResonance,
  decodeSoulAnswers,
  mockSoulAnswers,
  readGS,
  type SoulAnswers,
} from '@/lib/wtfi/soul-resonance';
import { PantheonBadge } from '@/components/galaxy/PantheonBadge';
import { SoulSigil } from '@/components/galaxy/SoulSigil';

/**
 * Pair Gravity Preview · 内部预览
 *
 * - 左右两个下拉，分别选 A / B 主星
 * - 实时调用 computePairGravity + S + GS 双层叙事
 * - URL 接受 ?a= ?b= ?soulA= ?soulB= 来还原一个具体配对
 * - 用于设计 / PM / KOL 试看 8×8 = 64 种配对叙事
 */
export default function PairGravityPreview() {
  const [aSlug, setASlug] = useState<string>('home-storm-harbor');
  const [bSlug, setBSlug] = useState<string>('home-aurora-parlour');
  const [soulA, setSoulA] = useState<SoulAnswers | null>(null);
  const [soulB, setSoulB] = useState<SoulAnswers | null>(null);

  // hydrate from URL ?a, ?b, ?soulA, ?soulB
  useEffect(() => {
    if (typeof window === 'undefined') return;
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const a = params.get('a');
      const b = params.get('b');
      if (a && HOME_PLANET_CATALOG.some((p) => p.slug === a)) setASlug(a);
      if (b && HOME_PLANET_CATALOG.some((p) => p.slug === b)) setBSlug(b);
      const sA = params.get('soulA');
      const sB = params.get('soulB');
      if (sA) setSoulA(decodeSoulAnswers(sA));
      if (sB) setSoulB(decodeSoulAnswers(sB));
    });
  }, []);

  const planetA = HOME_PLANET_CATALOG.find((p) => p.slug === aSlug)!;
  const planetB = HOME_PLANET_CATALOG.find((p) => p.slug === bSlug)!;

  const galaxyA = useMemo(() => buildMockGalaxy(planetA), [planetA]);
  const galaxyB = useMemo(() => buildMockGalaxy(planetB), [planetB]);
  const gravity = useMemo(() => computePairGravity(galaxyA, galaxyB), [galaxyA, galaxyB]);
  const kindred = useMemo(() => calcKindredAffinity(galaxyA, galaxyB), [galaxyA, galaxyB]);
  const sScore = useMemo(
    () => calcSoulResonance(soulA ?? mockSoulAnswers(planetA.slug), soulB ?? mockSoulAnswers(planetB.slug)),
    [soulA, soulB, planetA.slug, planetB.slug],
  );
  const gs = useMemo(() => readGS(gravity.G, sScore), [gravity.G, sScore]);
  const usingRealSoul = Boolean(soulA && soulB);
  const deityA = getDeity(planetA.slug);
  const deityB = getDeity(planetB.slug);

  return (
    <div style={page}>
      <header style={header}>
        <p style={eyebrow}>TWO PANTHEONS · CONVERGENCE LAB</p>
        <h1 style={title}>
          众神交会，<em style={em}>引力 ⊕ 灵魂</em> 永远共振
        </h1>
        <p style={subtitle}>
          选两颗主神化身 · 看你们的人格引力 G 与灵魂频率 S 落在哪一种相遇。
        </p>
        {!usingRealSoul && (
          <p style={{ ...subtitle, fontSize: 12, marginTop: 8, color: 'rgba(245,240,232,0.5)' }}>
            ✦ 当前 S 由 mock 答案派生 ·{' '}
            <Link
              href="/wtfti/galaxy/soul-probe/"
              style={{ color: '#C9A676', textDecoration: 'underline' }}
            >
              做一次灵魂探针
            </Link>{' '}
            得到真实 S。
          </p>
        )}
      </header>

      <section style={pickerRow}>
        <PlanetPicker label="A · 你" value={aSlug} onChange={setASlug} accent={planetA.accent} />
        <div style={{ alignSelf: 'center', color: '#D4B58A', fontSize: 22 }}>⚭</div>
        <PlanetPicker label="B · ta" value={bSlug} onChange={setBSlug} accent={planetB.accent} />
      </section>

      {(deityA || deityB) && (
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto 24px',
            padding: '18px 22px',
            borderRadius: 18,
            background:
              'linear-gradient(135deg, rgba(192,122,142,0.08) 0%, rgba(156,124,255,0.08) 100%)',
            border: '1px solid rgba(201,166,118,0.28)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: '0.42em',
              color: '#D4B58A',
              textTransform: 'uppercase',
            }}
          >
            ✦ Two Tutelary Deities · 双主神同位
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: 12,
              marginTop: 14,
              flexWrap: 'wrap',
            }}
          >
            {deityA && <PantheonBadge slug={planetA.slug} compact />}
            {deityB && <PantheonBadge slug={planetB.slug} compact />}
          </div>
          {deityA && deityB && (
            <p
              style={{
                marginTop: 14,
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: 16,
                color: '#F5F0E8',
                lineHeight: 1.6,
              }}
            >
              {deityA.eastern.name} 与 {deityB.eastern.name} 同坐一席——
              <br />
              {deityA.coreFour} × {deityB.coreFour}
            </p>
          )}
        </section>
      )}

      <section style={resultBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={meta}>
            {planetA.name} ⇆ {planetB.name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display), serif',
              fontStyle: 'italic',
              color: gravity.band.accent,
              fontSize: 22,
              letterSpacing: '0.04em',
              textShadow: `0 0 14px ${gravity.band.accent}66`,
            }}
          >
            {formatGravityValue(gravity.G)}
          </span>
        </div>
        <h2
          style={{
            margin: '0 0 12px',
            fontFamily: 'var(--font-display), serif',
            fontSize: 32,
            color: '#F5F0E8',
            letterSpacing: '0.05em',
          }}
        >
          {gravity.band.name}
        </h2>
        <p style={narration}>{gravity.band.narration}</p>
        <p style={axisExplain}>{gravity.leadingAxisExplain}</p>
        <blockquote style={{ ...quoteStyle, color: gravity.band.accent }}>
          「{gravity.quote.quote}」
          <span style={quoteAuthor}>— {gravity.quote.author}</span>
        </blockquote>

        <details style={debug}>
          <summary style={debugSummary}>✦ Debug · 子分（不展示给用户）</summary>
          <pre style={debugPre}>
{`home cosine     = ${gravity.breakdown.homeSimilarity}
moon harmony    = ${gravity.breakdown.moonHarmony}
shadow resonance= ${gravity.breakdown.shadowResonance}
G (raw)         = ${gravity.G}
S (raw)         = ${sScore.toFixed(3)}
Kindred shared  = ${kindred.shared.length}
Kindred score   = ${kindred.kindredScore.toFixed(3)}`}
          </pre>
        </details>
      </section>

      <section
        style={{
          ...resultBox,
          marginTop: 28,
          background: gs.rare
            ? 'linear-gradient(155deg, rgba(192,122,142,0.18) 0%, rgba(201,166,118,0.12) 100%)'
            : 'rgba(245,240,232,0.04)',
          border: gs.rare ? '1px solid #C9A676' : '1px solid rgba(245,240,232,0.12)',
        }}
      >
        <p style={{ ...meta, color: '#D4B58A', textAlign: 'center' }}>
          ✦ G ⊕ S · 双层叙事 · {gs.rare ? '稀有相遇' : '常见相遇'}
        </p>
        <h2
          style={{
            margin: '8px 0 6px',
            textAlign: 'center',
            fontFamily: 'var(--font-display), serif',
            fontStyle: 'italic',
            fontSize: 32,
            color: '#F5F0E8',
            letterSpacing: '0.04em',
          }}
        >
          {gs.title}
        </h2>
        <p
          style={{
            margin: '4px auto 16px',
            maxWidth: 520,
            textAlign: 'center',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 13.5,
            color: 'rgba(245,240,232,0.85)',
            lineHeight: 1.85,
          }}
        >
          {gs.narration}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
          <MetricChip label="人格引力 G" value={formatGravityValue(gravity.G)} accent="#C9A676" />
          <MetricChip label="灵魂频率 S" value={`${Math.round(sScore * 100)}%`} accent="#C07A8E" hint={usingRealSoul ? '真实' : 'mock'} />
          <MetricChip label="精神同源" value={`${Math.round(kindred.kindredScore * 100)}%`} accent="#9C7CFF" />
        </div>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 520,
            padding: '10px 14px',
            borderLeft: '2px solid #C9A676',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'rgba(245,240,232,0.85)',
            lineHeight: 1.65,
          }}
        >
          {gs.literaryQuote}
        </p>
      </section>

      {kindred.shared.length > 0 && (
        <section
          style={{
            ...resultBox,
            marginTop: 28,
            background: 'rgba(245,240,232,0.04)',
            border: '1px solid rgba(201,166,118,0.32)',
          }}
        >
          <p style={{ ...meta, color: '#D4B58A', textAlign: 'center' }}>
            ✦ Shared Mirror Fragments · 你们共照的灵魂碎片
          </p>
          <p
            style={{
              margin: '10px auto 14px',
              maxWidth: 520,
              textAlign: 'center',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 13.5,
              color: 'rgba(245,240,232,0.85)',
              lineHeight: 1.8,
            }}
          >
            你们共同照亮了 <strong style={{ color: '#C9A676' }}>{kindred.shared.length}</strong> 位历史灵魂的镜子。
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {kindred.shared.slice(0, 8).map((f) => (
              <span
                key={f.slug}
                style={{
                  padding: '7px 13px',
                  borderRadius: 999,
                  border: '1px solid rgba(201,166,118,0.45)',
                  background: 'rgba(201,166,118,0.08)',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: '#F5F0E8',
                }}
              >
                {f.sigil} {f.nameZh}
              </span>
            ))}
          </div>
        </section>
      )}

      <section
        style={{
          ...resultBox,
          marginTop: 28,
          background: 'rgba(245,240,232,0.04)',
          border: '1px solid rgba(245,240,232,0.12)',
        }}
      >
        <p style={{ ...meta, color: '#D4B58A', textAlign: 'center' }}>
          ✦ Twin Sigils · 双印记
        </p>
        <p
          style={{
            margin: '10px auto 18px',
            maxWidth: 520,
            textAlign: 'center',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 12.5,
            color: 'rgba(245,240,232,0.6)',
            lineHeight: 1.8,
          }}
        >
          每个灵魂印记由 5 轴几何程序生成 · 全宇宙独一无二。
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <SoulSigil galaxy={galaxyA} size={200} />
            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.2em', color: '#D4B58A' }}>{planetA.name}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <SoulSigil galaxy={galaxyB} size={200} />
            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.2em', color: '#D4B58A' }}>{planetB.name}</p>
          </div>
        </div>
      </section>

      <p style={footnote}>
        引力档严格按区间映射：≥0.85 引力潮汐 / 0.65 稳定双星 / 0.45 远程引力 / 0.25 掠星轨道 / &lt;0.25 平行宇宙。<br />
        线上永不暴露百分比；只展示 G 数值（小数）+ 命名档 + 文学引语。
      </p>
    </div>
  );
}

function MetricChip({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent: string;
  hint?: string;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '8px 14px',
        borderRadius: 12,
        background: 'rgba(245,240,232,0.04)',
        border: `1px solid ${accent}55`,
        minWidth: 90,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 9,
          letterSpacing: '0.3em',
          color: 'rgba(245,240,232,0.6)',
          textTransform: 'uppercase',
        }}
      >
        {label}
        {hint ? <span style={{ marginLeft: 4, color: accent }}> · {hint}</span> : null}
      </p>
      <p
        style={{
          margin: '4px 0 0',
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 22,
          color: accent,
          letterSpacing: '0.04em',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function PlanetPicker({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  accent: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: '14px 16px',
        borderRadius: 16,
        background: 'rgba(245,240,232,0.04)',
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 24px -10px ${accent}88`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: '#D4B58A',
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '8px 0',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(212,181,138,0.4)',
          color: '#F5F0E8',
          fontFamily: 'var(--font-display), serif',
          fontSize: 18,
          letterSpacing: '0.04em',
          outline: 'none',
        }}
      >
        {HOME_PLANET_CATALOG.map((p) => (
          <option key={p.slug} value={p.slug} style={{ background: '#1a1530' }}>
            {p.name} · {p.code}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildMockGalaxy(home: HomePlanetEntry): GalaxyResult {
  return {
    homePlanet: {
      code: home.code,
      name: home.name,
      slug: home.slug,
      axesVector: home.defaultAxesVector,
      headline: home.headline,
      body: home.body,
      cardImageUrl: home.cardImageUrl,
    },
    moons: [
      {
        universeId: 'romance',
        code: 'MOON-MOCK',
        name: '占位神侍',
        slug: 'moon-mock',
        headline: '——',
        body: '——',
        cardImageUrl: home.cardImageUrl,
      },
    ],
    shadow: {
      axisScore: 1.5,
      bucket: 'SHADOW-NEUTRAL',
      slug: 'shadow-neutral-midline-lighthouse',
      name: '中线灯塔',
      headline: '——',
      body: '——',
      tooltip: '',
      cardImageUrl: home.cardImageUrl,
    },
    orbit: [],
    meta: { resultId: `mock-${home.slug}`, createdAt: new Date().toISOString(), testVersion: 'pair-preview-v1' },
  };
}

const page: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
  color: '#F5F0E8',
  fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
  padding: '64px 24px 96px',
};

const header: CSSProperties = { textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' };

const eyebrow: CSSProperties = {
  margin: 0,
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  letterSpacing: '0.42em',
  color: '#D4B58A',
};

const title: CSSProperties = {
  fontFamily: 'var(--font-display), serif',
  fontSize: 36,
  margin: '14px 0 8px',
  letterSpacing: '0.04em',
  lineHeight: 1.25,
};

const em: CSSProperties = { fontStyle: 'italic', color: '#C07A8E', padding: '0 4px' };

const subtitle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 14,
  color: 'rgba(245,240,232,0.7)',
  margin: 0,
};

const pickerRow: CSSProperties = {
  display: 'flex',
  gap: 16,
  maxWidth: 720,
  margin: '0 auto 32px',
};

const resultBox: CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '28px 28px 24px',
  borderRadius: 24,
  background: 'linear-gradient(180deg, rgba(245,240,232,0.05) 0%, rgba(245,240,232,0.01) 100%)',
  border: '1px solid rgba(212,181,138,0.28)',
  boxShadow: '0 30px 80px -30px rgba(192,122,142,0.4)',
};

const meta: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.32em',
  color: '#D4B58A',
  fontFamily: 'Inter, sans-serif',
};

const narration: CSSProperties = {
  margin: '0 0 14px',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 14,
  lineHeight: 1.85,
  color: 'rgba(245,240,232,0.82)',
};

const axisExplain: CSSProperties = {
  margin: '0 0 18px',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 12.5,
  color: 'rgba(245,240,232,0.55)',
  lineHeight: 1.7,
};

const quoteStyle: CSSProperties = {
  margin: 0,
  padding: '14px 18px',
  borderLeft: '2px solid currentColor',
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 16,
  lineHeight: 1.6,
};

const quoteAuthor: CSSProperties = {
  display: 'block',
  marginTop: 6,
  fontStyle: 'normal',
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  letterSpacing: '0.2em',
  color: 'rgba(245,240,232,0.55)',
};

const debug: CSSProperties = {
  marginTop: 20,
  padding: '10px 14px',
  borderRadius: 10,
  background: 'rgba(15,10,34,0.6)',
  border: '1px solid rgba(245,240,232,0.08)',
};

const debugSummary: CSSProperties = {
  cursor: 'pointer',
  color: 'rgba(245,240,232,0.5)',
  fontSize: 11,
  letterSpacing: '0.3em',
  fontFamily: 'Inter, sans-serif',
};

const debugPre: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 11,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  color: 'rgba(245,240,232,0.7)',
  whiteSpace: 'pre-wrap',
};

const footnote: CSSProperties = {
  marginTop: 32,
  textAlign: 'center',
  fontSize: 11,
  letterSpacing: '0.2em',
  color: 'rgba(245,240,232,0.4)',
  fontFamily: 'Inter, sans-serif',
  lineHeight: 1.8,
};
