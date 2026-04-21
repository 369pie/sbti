import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCoupleByShareToken } from '@/lib/xpti/couple-server';
import { getXptiPersonalityBySlug } from '@/lib/xpti/personalities';

// Dynamic; rendered per shareToken on demand.

const SIZE = { width: 1080, height: 1440 };

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ shareToken: string }> },
) {
  const { shareToken } = await ctx.params;
  const couple = await getCoupleByShareToken(shareToken);

  const inviter = couple ? getXptiPersonalityBySlug(couple.inviter_slug) : null;
  const partner = couple?.partner_slug ? getXptiPersonalityBySlug(couple.partner_slug) : null;
  const merged = couple?.merged_payload ?? null;

  const [regular, bold] = await Promise.all([
    tryReadFont('noto-sans-sc-social-400.woff'),
    tryReadFont('noto-sans-sc-social-700.woff'),
  ]);
  const fonts = [
    regular ? { name: 'NotoSC', data: regular, weight: 400 as const, style: 'normal' as const } : null,
    bold ? { name: 'NotoSC', data: bold, weight: 700 as const, style: 'normal' as const } : null,
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const inviterColor = inviter?.color ?? '#C07A8E';
  const partnerColor = partner?.color ?? '#C9A676';
  const pairingLabel = merged?.pairing.label ?? '等待 ta 加入';
  const pairingEnglish = merged?.pairing.english ?? 'Awaiting partner';
  const oneLine = merged?.pairing.oneLine ?? '把这张邀请卡发给 ta，关系雷达就会出现。';
  const pairCode = couple?.pair_code ?? '— —';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px 72px',
          background: `radial-gradient(ellipse 70% 50% at 50% 18%, ${inviterColor}40 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 50% 82%, ${partnerColor}40 0%, transparent 60%), #1a1530`,
          color: '#F5F0E8',
          fontFamily: 'NotoSC, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 18, letterSpacing: 8, color: '#C9A676', fontWeight: 700 }}>
            XPTI · COUPLE REPORT
          </span>
          <span style={{ marginTop: 14, fontSize: 14, letterSpacing: 5, color: 'rgba(245,240,232,0.6)' }}>
            CODE · {pairCode}
          </span>
        </div>

        {/* Inviter */}
        <div
          style={{
            marginTop: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 18, letterSpacing: 4, color: inviterColor, fontWeight: 700 }}>
            {inviter?.code ?? '——'}
          </span>
          <span style={{ marginTop: 10, fontSize: 64, color: '#F5F0E8', fontWeight: 700, letterSpacing: 2 }}>
            {inviter?.name ?? '邀请方'}
          </span>
          {inviter?.tagline && (
            <span style={{ marginTop: 10, fontSize: 22, color: 'rgba(245,240,232,0.72)', fontStyle: 'italic' }}>
              {inviter.tagline}
            </span>
          )}
        </div>

        {/* Connector */}
        <div style={{ marginTop: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: 80, color: '#C9A676' }}>×</span>
        </div>

        {/* Partner */}
        <div
          style={{
            marginTop: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 18, letterSpacing: 4, color: partnerColor, fontWeight: 700 }}>
            {partner?.code ?? '— —'}
          </span>
          <span style={{ marginTop: 10, fontSize: 64, color: '#F5F0E8', fontWeight: 700, letterSpacing: 2 }}>
            {partner?.name ?? '等待 ta'}
          </span>
          {partner?.tagline && (
            <span style={{ marginTop: 10, fontSize: 22, color: 'rgba(245,240,232,0.72)', fontStyle: 'italic' }}>
              {partner.tagline}
            </span>
          )}
        </div>

        {/* Pairing label */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 40,
            borderTop: '1px solid rgba(245,240,232,0.18)',
          }}
        >
          <span style={{ fontSize: 14, letterSpacing: 6, color: 'rgba(245,240,232,0.55)' }}>
            {pairingEnglish}
          </span>
          <span style={{ marginTop: 14, fontSize: 48, color: '#F5F0E8', fontWeight: 700, letterSpacing: 3 }}>
            {pairingLabel}
          </span>
          <span
            style={{
              marginTop: 18,
              fontSize: 22,
              color: 'rgba(245,240,232,0.78)',
              textAlign: 'center',
              lineHeight: 1.5,
              fontStyle: 'italic',
              maxWidth: 880,
            }}
          >
            {oneLine}
          </span>
          <span style={{ marginTop: 44, fontSize: 14, letterSpacing: 5, color: '#C9A676', fontWeight: 700 }}>
            EDITORIAL ATELIER · 关系张力雷达
          </span>
        </div>
      </div>
    ),
    { ...SIZE, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
