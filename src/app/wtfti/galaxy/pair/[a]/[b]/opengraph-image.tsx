import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HOME_PLANET_CATALOG, type HomePlanetEntry } from '@/lib/wtfi/galaxy-planets';
import { computePairGravity, formatGravityValue } from '@/lib/wtfi/gravity';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';

export const dynamic = 'force-static';
export const alt = 'WTFTI · Two Galaxies Compatibility';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  const params: { a: string; b: string }[] = [];
  for (const a of HOME_PLANET_CATALOG) {
    for (const b of HOME_PLANET_CATALOG) {
      params.push({ a: a.slug, b: b.slug });
    }
  }
  return params;
}

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch {
    return null;
  }
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
    meta: { resultId: `og-${home.slug}`, createdAt: '', testVersion: 'og' },
  };
}

export default async function PairOgImage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const pa = HOME_PLANET_CATALOG.find((p) => p.slug === a);
  const pb = HOME_PLANET_CATALOG.find((p) => p.slug === b);
  if (!pa || !pb) return new Response('not found', { status: 404 });
  const gravity = computePairGravity(buildMockGalaxy(pa), buildMockGalaxy(pb));

  const [regular, bold] = await Promise.all([
    tryReadFont('noto-sans-sc-social-400.woff'),
    tryReadFont('noto-sans-sc-social-700.woff'),
  ]);

  const fonts = [
    regular ? { name: 'NotoSC', data: regular, weight: 400 as const, style: 'normal' as const } : null,
    bold ? { name: 'NotoSC', data: bold, weight: 700 as const, style: 'normal' as const } : null,
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          background: `radial-gradient(ellipse 60% 60% at 25% 30%, ${pa.accent}33 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 75% 70%, ${pb.accent}33 0%, transparent 60%), #1a1530`,
          color: '#F5F0E8',
          fontFamily: 'NotoSC, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#D4B58A', fontSize: 18, letterSpacing: 6, fontWeight: 700 }}>
            WTFTI / TWO GALAXIES
          </span>
          <span style={{ color: gravity.band.accent, fontSize: 18, letterSpacing: 4, fontWeight: 700 }}>
            COMPATIBILITY
          </span>
        </div>

        <div
          style={{
            marginTop: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, color: pa.accent, letterSpacing: 4, fontWeight: 700 }}>{pa.code}</span>
            <span style={{ marginTop: 8, fontSize: 60, color: '#F5F0E8', fontWeight: 700, letterSpacing: 3, lineHeight: 1.1 }}>
              {pa.name}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 60, color: '#D4B58A' }}>⚭</span>
            <span style={{ marginTop: 12, fontSize: 56, color: gravity.band.accent, fontWeight: 700, letterSpacing: 2 }}>
              {formatGravityValue(gravity.G)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 22, color: pb.accent, letterSpacing: 4, fontWeight: 700 }}>{pb.code}</span>
            <span style={{ marginTop: 8, fontSize: 60, color: '#F5F0E8', fontWeight: 700, letterSpacing: 3, lineHeight: 1.1 }}>
              {pb.name}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 56, color: '#F5F0E8', fontWeight: 700, letterSpacing: 6 }}>
            {gravity.band.name}
          </span>
          <span style={{ marginTop: 22, fontSize: 26, color: 'rgba(245,240,232,0.78)', textAlign: 'center', maxWidth: 980, lineHeight: 1.5 }}>
            {gravity.band.narration}
          </span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 18, color: 'rgba(245,240,232,0.5)', letterSpacing: 2 }}>
            wtfti.com / galaxy / pair / {pa.slug} / {pb.slug}
          </span>
          <span style={{ fontSize: 18, color: '#D4B58A', letterSpacing: 6, fontWeight: 700 }}>
            COSMIC ROMANCE
          </span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
