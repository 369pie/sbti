import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCoupleByShareToken } from '@/lib/xpti/couple-server';
import { getXptiPersonalityBySlug } from '@/lib/xpti/personalities';

export const alt = 'XPTI · 关系合并报告';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// Default `dynamic` (auto) — generated on demand per shareToken.

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch {
    return null;
  }
}

export default async function CoupleOgImage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const couple = await getCoupleByShareToken(shareToken);

  const inviterPersonality = couple ? getXptiPersonalityBySlug(couple.inviter_slug) : null;
  const partnerPersonality = couple?.partner_slug
    ? getXptiPersonalityBySlug(couple.partner_slug)
    : null;
  const merged = couple?.merged_payload ?? null;

  const [regular, bold] = await Promise.all([
    tryReadFont('noto-sans-sc-social-400.woff'),
    tryReadFont('noto-sans-sc-social-700.woff'),
  ]);
  const fonts = [
    regular ? { name: 'NotoSC', data: regular, weight: 400 as const, style: 'normal' as const } : null,
    bold ? { name: 'NotoSC', data: bold, weight: 700 as const, style: 'normal' as const } : null,
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const inviterColor = inviterPersonality?.color ?? '#C07A8E';
  const partnerColor = partnerPersonality?.color ?? '#C9A676';
  const pairingLabel = merged?.pairing.label ?? '正在合并…';
  const pairingEnglish = merged?.pairing.english ?? 'Awaiting partner';
  const oneLine = merged?.pairing.oneLine ?? '邀请 ta 完成 12 题，关系雷达就会浮现。';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 80px',
          background: `radial-gradient(ellipse 60% 60% at 25% 30%, ${inviterColor}33 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 75% 70%, ${partnerColor}33 0%, transparent 60%), #1a1530`,
          color: '#F5F0E8',
          fontFamily: 'NotoSC, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#C9A676', fontSize: 18, letterSpacing: 6, fontWeight: 700 }}>
            XPTI · TENSION COUPLE
          </span>
          <span style={{ color: '#F5F0E8', fontSize: 14, letterSpacing: 4, opacity: 0.6 }}>
            CODE · {couple?.pair_code ?? '— — — — — —'}
          </span>
        </div>

        <div
          style={{
            marginTop: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 360 }}>
            <span style={{ fontSize: 18, color: inviterColor, letterSpacing: 4, fontWeight: 700 }}>
              {inviterPersonality?.code ?? '——'}
            </span>
            <span style={{ marginTop: 8, fontSize: 44, color: '#F5F0E8', fontWeight: 700, lineHeight: 1.1 }}>
              {inviterPersonality?.name ?? '邀请方'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 56, color: '#C9A676' }}>×</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: 360 }}>
            <span style={{ fontSize: 18, color: partnerColor, letterSpacing: 4, fontWeight: 700 }}>
              {partnerPersonality?.code ?? '——'}
            </span>
            <span style={{ marginTop: 8, fontSize: 44, color: '#F5F0E8', fontWeight: 700, lineHeight: 1.1, textAlign: 'right' }}>
              {partnerPersonality?.name ?? '等待 ta'}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'rgba(245,240,232,0.6)', letterSpacing: 6 }}>
            {pairingEnglish}
          </span>
          <span style={{ marginTop: 14, fontSize: 52, color: '#F5F0E8', fontWeight: 700, letterSpacing: 4 }}>
            {pairingLabel}
          </span>
          <span
            style={{
              marginTop: 22,
              fontSize: 22,
              color: 'rgba(245,240,232,0.78)',
              textAlign: 'center',
              maxWidth: 960,
              lineHeight: 1.55,
              fontStyle: 'italic',
            }}
          >
            {oneLine}
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
          <span style={{ fontSize: 16, color: 'rgba(245,240,232,0.5)', letterSpacing: 2 }}>
            xpti · 关系张力雷达 + 6 类配对模型 + 24 句对话脚本
          </span>
          <span style={{ fontSize: 16, color: '#C9A676', letterSpacing: 6, fontWeight: 700 }}>
            EDITORIAL ATELIER
          </span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
