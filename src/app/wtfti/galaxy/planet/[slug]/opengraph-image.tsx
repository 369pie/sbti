import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { getAnchor } from '@/lib/wtfi/constellation-anchors';

export const dynamic = 'force-static';
export const alt = 'WTFTI 人格星图 · 主星卡';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return HOME_PLANET_CATALOG.map((p) => ({ slug: p.slug }));
}

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch {
    return null;
  }
}

export default async function PlanetOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === slug);
  if (!planet) return new Response('not found', { status: 404 });
  const anchor = getAnchor(slug);
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
          padding: '70px 80px',
          background: `radial-gradient(ellipse 80% 60% at 30% 20%, ${planet.accent}33 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 80% 90%, #9C7CFF22 0%, transparent 60%), #1a1530`,
          color: '#F5F0E8',
          fontFamily: 'NotoSC, sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#D4B58A', fontSize: 22 }}>*</span>
            <span style={{ color: '#D4B58A', fontSize: 18, letterSpacing: 6, fontWeight: 700 }}>
              WTFTI / PERSONALITY GALAXY
            </span>
          </div>
          <span style={{ color: planet.accent, fontSize: 18, letterSpacing: 4, fontWeight: 700 }}>
            {planet.code}
          </span>
        </div>

        <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 22, color: planet.accent, letterSpacing: 4, fontWeight: 700 }}>
            {anchor ? `本星归属 · ${anchor.constellation} · ${anchor.constellationLatin}` : '本星归属'}
          </span>
          <span
            style={{
              marginTop: 22,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: 4,
              lineHeight: 1.1,
              color: '#F5F0E8',
            }}
          >
            {planet.name}
          </span>
          <span style={{ marginTop: 18, fontSize: 30, color: 'rgba(245,240,232,0.85)', lineHeight: 1.5, maxWidth: 920 }}>
            {planet.headline}
          </span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 20, color: 'rgba(245,240,232,0.55)', letterSpacing: 2 }}>
            wtfti.com / galaxy / planet / {planet.slug}
          </span>
          <span style={{ fontSize: 20, color: '#D4B58A', letterSpacing: 6, fontWeight: 700 }}>
            COSMIC ROMANCE
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 100,
            width: 240,
            height: 240,
            borderRadius: 240,
            background: `radial-gradient(circle at 35% 30%, ${planet.accent} 0%, ${planet.accent}88 35%, transparent 75%)`,
            opacity: 0.55,
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
