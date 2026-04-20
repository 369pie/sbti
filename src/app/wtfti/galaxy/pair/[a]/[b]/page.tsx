import type { Metadata } from 'next';
import Link from 'next/link';
import NextImage from 'next/image';
import { notFound } from 'next/navigation';
import { HOME_PLANET_CATALOG, type HomePlanetEntry } from '@/lib/wtfi/galaxy-planets';
import { computePairGravity, formatGravityValue } from '@/lib/wtfi/gravity';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';
import { calcKindredAffinity } from '@/lib/wtfi/fragment-palace';
import { getDeity } from '@/lib/wtfi/pantheon';
import { calcSoulResonance, mockSoulAnswers, readGS } from '@/lib/wtfi/soul-resonance';
import { getSiteUrl } from '@/lib/site';
import { PantheonBadge } from '@/components/galaxy/PantheonBadge';

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  const params: { a: string; b: string }[] = [];
  for (const a of HOME_PLANET_CATALOG) {
    for (const b of HOME_PLANET_CATALOG) {
      params.push({ a: a.slug, b: b.slug });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ a: string; b: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { a, b } = await params;
  const pa = HOME_PLANET_CATALOG.find((p) => p.slug === a);
  const pb = HOME_PLANET_CATALOG.find((p) => p.slug === b);
  if (!pa || !pb) return {};
  const gravity = computePairGravity(buildMockGalaxy(pa), buildMockGalaxy(pb));
  const sScore = calcSoulResonance(mockSoulAnswers(pa.slug), mockSoulAnswers(pb.slug));
  const gs = readGS(gravity.G, sScore);
  const deityA = getDeity(pa.slug);
  const deityB = getDeity(pb.slug);
  const url = getSiteUrl(`/wtfti/galaxy/pair/${a}/${b}/`);
  const deityLine =
    deityA && deityB ? `${deityA.eastern.name} ⚭ ${deityB.eastern.name}` : '';
  const title = `${pa.name} ⇆ ${pb.name} · ${gs.title}${
    deityLine ? ` · ${deityLine}` : ''
  } · WTFTI 引力`;
  const description = `${pa.name} 和 ${pb.name} ${gs.title}：${gs.narration.slice(0, 60)}…`;
  return {
    title,
    description,
    keywords: [
      pa.name,
      pb.name,
      deityA?.eastern.name,
      deityB?.eastern.name,
      gs.title,
      'WTFTI',
      '人格匹配',
      '宇宙引力',
      '灵魂双星',
      '神性配对',
    ].filter(Boolean) as string[],
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'WTFTI' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PairPage({ params }: Props) {
  const { a, b } = await params;
  const pa = HOME_PLANET_CATALOG.find((p) => p.slug === a);
  const pb = HOME_PLANET_CATALOG.find((p) => p.slug === b);
  if (!pa || !pb) notFound();

  const gravity = computePairGravity(buildMockGalaxy(pa), buildMockGalaxy(pb));
  const galaxyA = buildMockGalaxy(pa);
  const galaxyB = buildMockGalaxy(pb);
  const kindred = calcKindredAffinity(galaxyA, galaxyB);
  const sScore = calcSoulResonance(mockSoulAnswers(pa.slug), mockSoulAnswers(pb.slug));
  const gs = readGS(gravity.G, sScore);
  const deityA = getDeity(pa.slug);
  const deityB = getDeity(pb.slug);

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
        padding: '64px 24px 96px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.42em',
            color: '#D4B58A',
            textTransform: 'uppercase',
          }}
        >
          ✦ Two Galaxies · Compatibility
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 36,
            margin: '14px 0 6px',
            letterSpacing: '0.04em',
            lineHeight: 1.25,
          }}
        >
          {pa.name} <em style={{ fontStyle: 'italic', color: '#D4B58A' }}>⚭</em> {pb.name}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 24,
            color: gravity.band.accent,
            letterSpacing: '0.04em',
            textShadow: `0 0 18px ${gravity.band.accent}66`,
          }}
        >
          {formatGravityValue(gravity.G)}
        </p>
        <p
          style={{
            margin: '6px 0 28px',
            fontFamily: 'var(--font-display), serif',
            fontSize: 30,
            color: '#F5F0E8',
            letterSpacing: '0.04em',
          }}
        >
          {gravity.band.name}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 60px 1fr',
            alignItems: 'center',
            gap: 8,
            margin: '0 auto 32px',
            maxWidth: 600,
          }}
        >
          <PlanetThumb planet={pa} />
          <span style={{ color: '#D4B58A', fontSize: 28, fontFamily: 'var(--font-display), serif', fontStyle: 'italic' }}>
            ⚭
          </span>
          <PlanetThumb planet={pb} />
        </div>

        <section
          style={{
            padding: '24px 24px 22px',
            borderRadius: 18,
            background: 'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(15,10,34,0.4) 100%)',
            border: `1px solid ${gravity.band.accent}55`,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              margin: '0 0 14px',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 14,
              lineHeight: 1.85,
              color: 'rgba(245,240,232,0.85)',
            }}
          >
            {gravity.band.narration}
          </p>
          <p
            style={{
              margin: '0 0 18px',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 12.5,
              lineHeight: 1.75,
              color: 'rgba(245,240,232,0.55)',
            }}
          >
            {gravity.leadingAxisExplain}
          </p>
          <blockquote
            style={{
              margin: 0,
              padding: '12px 16px',
              borderLeft: `2px solid ${gravity.band.accent}`,
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 16,
              color: gravity.band.accent,
              lineHeight: 1.6,
            }}
          >
            「{gravity.quote.quote}」
            <span
              style={{
                display: 'block',
                marginTop: 4,
                fontStyle: 'normal',
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                letterSpacing: '0.2em',
                color: 'rgba(245,240,232,0.55)',
              }}
            >
              — {gravity.quote.author}
            </span>
          </blockquote>
        </section>

        {(deityA || deityB) && (
          <section
            style={{
              marginTop: 28,
              padding: '22px 22px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(192,122,142,0.08) 0%, rgba(156,124,255,0.08) 100%)',
              border: '1px solid rgba(201,166,118,0.32)',
              textAlign: 'left',
            }}
          >
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.42em', color: '#D4B58A', textTransform: 'uppercase', textAlign: 'center' }}>
              ✦ Two Tutelary Deities · 双主神同位
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              {deityA && <PantheonBadge slug={pa.slug} compact />}
              {deityB && <PantheonBadge slug={pb.slug} compact />}
            </div>
            {deityA && deityB && (
              <p
                style={{
                  marginTop: 14,
                  textAlign: 'center',
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

        <section
          style={{
            marginTop: 28,
            padding: '22px 22px',
            borderRadius: 18,
            background: gs.rare
              ? 'linear-gradient(155deg, rgba(192,122,142,0.18) 0%, rgba(201,166,118,0.12) 100%)'
              : 'rgba(245,240,232,0.04)',
            border: gs.rare ? '1px solid #C9A676' : '1px solid rgba(245,240,232,0.12)',
            textAlign: 'left',
          }}
        >
          <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.42em', color: '#D4B58A', textTransform: 'uppercase', textAlign: 'center' }}>
            ✦ G ⊕ S · 双层叙事 · {gs.rare ? '稀有相遇' : '常见相遇'}
          </p>
          <h3
            style={{
              margin: '10px 0 4px',
              textAlign: 'center',
              fontFamily: 'var(--font-display), serif',
              fontStyle: 'italic',
              fontSize: 26,
              color: '#F5F0E8',
              letterSpacing: '0.04em',
            }}
          >
            {gs.title}
          </h3>
          <p
            style={{
              margin: '6px auto 14px',
              maxWidth: 480,
              textAlign: 'center',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 13.5,
              color: 'rgba(245,240,232,0.85)',
              lineHeight: 1.85,
            }}
          >
            {gs.narration}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 14 }}>
            <MetricChip label="人格引力 G" value={formatGravityValue(gravity.G)} accent="#C9A676" />
            <MetricChip label="灵魂频率 S" value={`${Math.round(sScore * 100)}%`} accent="#C07A8E" />
            <MetricChip label="精神同源" value={`${Math.round(kindred.kindredScore * 100)}%`} accent="#9C7CFF" />
          </div>
          <p
            style={{
              margin: 0,
              padding: '10px 14px',
              borderLeft: '2px solid #C9A676',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'rgba(245,240,232,0.85)',
              lineHeight: 1.6,
            }}
          >
            {gs.literaryQuote}
          </p>
        </section>

        {kindred.shared.length > 0 && (
          <section
            style={{
              marginTop: 22,
              padding: '20px 22px',
              borderRadius: 16,
              background: 'rgba(245,240,232,0.03)',
              border: '1px solid rgba(201,166,118,0.22)',
              textAlign: 'left',
            }}
          >
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.42em', color: '#D4B58A', textTransform: 'uppercase', textAlign: 'center' }}>
              ✦ Shared Mirror Fragments · 共照碎片 · {kindred.shared.length} 枚
            </p>
            <p
              style={{
                margin: '10px auto 14px',
                textAlign: 'center',
                maxWidth: 420,
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 13,
                color: 'rgba(245,240,232,0.78)',
                lineHeight: 1.7,
              }}
            >
              你们共同照亮了 {kindred.shared.length} 位历史灵魂的镜子——
              <br />
              你们共享 ta 们的一部分宇宙。
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 10,
              }}
            >
              {kindred.shared.map((frag) => (
                <li
                  key={frag.slug}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'linear-gradient(155deg, rgba(192,122,142,0.18) 0%, rgba(201,166,118,0.10) 100%)',
                    border: '1px solid rgba(201,166,118,0.45)',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: '"Cormorant Garamond", serif',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: '#C9A676',
                    }}
                  >
                    {frag.sigil} {frag.nameZh}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 10.5, color: 'rgba(245,240,232,0.55)', letterSpacing: 0.5 }}>
                    {frag.fields.join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            href="/wtfti/test/"
            style={{
              borderRadius: 999,
              padding: '12px 28px',
              fontSize: 12,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              background: '#F5F0E8',
              color: '#1a1530',
              fontFamily: 'Inter, sans-serif',
              textDecoration: 'none',
            }}
          >
            ✦ 测出我的主星
          </Link>
          <Link
            href={`/wtfti/galaxy/planet/${pa.slug}/`}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              letterSpacing: '0.3em',
              color: 'rgba(245,240,232,0.65)',
              textDecoration: 'none',
              borderBottom: `1px solid ${pa.accent}55`,
              paddingBottom: 2,
            }}
          >
            读 {pa.name} 的本星档案 →
          </Link>
          <Link
            href={`/wtfti/galaxy/planet/${pb.slug}/`}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              letterSpacing: '0.3em',
              color: 'rgba(245,240,232,0.65)',
              textDecoration: 'none',
              borderBottom: `1px solid ${pb.accent}55`,
              paddingBottom: 2,
            }}
          >
            读 {pb.name} 的本星档案 →
          </Link>
        </div>

        <p
          style={{
            marginTop: 48,
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'rgba(245,240,232,0.4)',
            textTransform: 'uppercase',
          }}
        >
          G = 0.5·home + 0.3·moons + 0.2·shadow · 不暴露百分比
        </p>
      </div>
    </main>
  );
}

function PlanetThumb({ planet }: { planet: HomePlanetEntry }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 12,
        borderRadius: 16,
        background: 'rgba(245,240,232,0.04)',
        border: `1px solid ${planet.accent}44`,
      }}
    >
      <NextImage
        src={planet.cardImageUrl}
        alt={planet.name}
        width={240}
        height={320}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: 10,
          border: `1px solid ${planet.accent}55`,
          display: 'block',
        }}
      />
      <p
        style={{
          margin: '10px 0 0',
          fontFamily: 'var(--font-display), serif',
          fontSize: 14,
          letterSpacing: '0.04em',
          color: '#F5F0E8',
        }}
      >
        {planet.name}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontSize: 9,
          letterSpacing: '0.32em',
          color: planet.accent,
          textTransform: 'uppercase',
        }}
      >
        {planet.code}
      </p>
    </div>
  );
}

function MetricChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <p
        style={{
          margin: 0,
          fontSize: 9,
          letterSpacing: '0.3em',
          color: 'rgba(245,240,232,0.55)',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
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
    meta: {
      resultId: `pair-${home.slug}`,
      createdAt: new Date().toISOString(),
      testVersion: 'pair-public-v1',
    },
  };
}
