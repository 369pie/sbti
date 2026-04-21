import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  getDecisionScenario,
  listEnabledScenarios,
} from '@/lib/mysti/decision-quotes';

export const dynamic = 'force-static';
export const alt = '灵鉴 · 决策快卡';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listEnabledScenarios().map((s) => ({ scenario: s.id }));
}

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch {
    return null;
  }
}

export default async function MystiDecisionOgImage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  const s = getDecisionScenario(scenario);
  if (!s || !s.enabled) return new Response('not found', { status: 404 });

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
          background: `radial-gradient(ellipse 80% 60% at 30% 20%, ${s.accentHex}33 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 80% 90%, #9C7CFF22 0%, transparent 60%), #1a1530`,
          color: '#F5F0E8',
          fontFamily: 'NotoSC, sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#D4B58A', fontSize: 22 }}>✦</span>
            <span style={{ color: '#D4B58A', fontSize: 18, letterSpacing: 6, fontWeight: 700 }}>
              WTFTI / MYSTI · DECISION QUICK CARD
            </span>
          </div>
          <span style={{ color: s.accentHex, fontSize: 18, letterSpacing: 4, fontWeight: 700 }}>
            第 {s.numeral} 章
          </span>
        </div>

        <div style={{ marginTop: 70, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 22, color: s.accentHex, letterSpacing: 4, fontWeight: 700 }}>
            {s.eyebrow}
          </span>
          <span
            style={{
              marginTop: 20,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: 4,
              lineHeight: 1.1,
              color: '#F5F0E8',
            }}
          >
            {s.label}
          </span>
          <span
            style={{
              marginTop: 28,
              fontSize: 32,
              color: 'rgba(245,240,232,0.85)',
              lineHeight: 1.5,
              maxWidth: 920,
              fontStyle: 'italic',
            }}
          >
            {s.question}
          </span>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <span style={{ fontSize: 20, color: 'rgba(245,240,232,0.55)', letterSpacing: 2 }}>
            wtfti.com / mysti / decision / {s.id}
          </span>
          <span style={{ fontSize: 20, color: '#D4B58A', letterSpacing: 6, fontWeight: 700 }}>
            90 SEC · 3 CARDS · 1 LINE
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 100,
            width: 220,
            height: 220,
            borderRadius: 220,
            background: `radial-gradient(circle at 35% 30%, ${s.accentHex} 0%, ${s.accentHex}88 35%, transparent 75%)`,
            opacity: 0.5,
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
