import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// OG / Twitter share image — cream journal palette (design system v3).
// Fonts must be force-included via next.config outputFileTracingIncludes.

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      console.warn('[social-image] optional font missing', { filename });
      return null;
    }
    throw error;
  }
}

let socialFontsPromise: Promise<{
  regular: Buffer | null;
  bold: Buffer | null;
}> | null = null;

function loadSocialFonts(): Promise<{
  regular: Buffer | null;
  bold: Buffer | null;
}> {
  if (!socialFontsPromise) {
    socialFontsPromise = Promise.all([
      tryReadFont('noto-sans-sc-social-400.woff'),
      tryReadFont('noto-sans-sc-social-700.woff'),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return socialFontsPromise;
}

// Cream journal tokens (docs/04-design-growth/design/wtfti-design-system-v3-2026-10.md)
const BG = '#FBF6EC';
const CARD = '#FFFDF8';
const INK = '#4A3628';
const MUTE = '#8A7362';
const LINE = '#E8DCC8';
const PEACH = '#E8907A';
const PEACH_SOFT = '#FADBD0';
const SAGE = '#A9C5A0';

const chips = ['测我 · 看清自己', '美我 · 穿搭妆容', '懂我 · 树洞'] as const;

export const socialImageAlt = 'WTFTI — 懂你的女生私人顾问';

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageContentType = 'image/png';

export async function createSocialImageResponse() {
  const { regular: chineseRegularFont, bold: chineseBoldFont } =
    await loadSocialFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BG,
          color: INK,
          padding: '56px 64px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Noto Sans SC',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-60px',
            width: '360px',
            height: '360px',
            borderRadius: '999px',
            background: PEACH_SOFT,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-40px',
            width: '280px',
            height: '280px',
            borderRadius: '999px',
            background: SAGE,
            opacity: 0.22,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '780px' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              borderRadius: '999px',
              background: PEACH,
              color: INK,
              padding: '10px 22px',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.18em',
            }}
          >
            WTFTI
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: '36px',
              fontSize: '64px',
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            懂你的女生私人顾问
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: '18px',
              fontSize: '30px',
              lineHeight: 1.4,
              color: MUTE,
            }}
          >
            看清自己 · 变好看 · 有地方说心里话
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {chips.map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  borderRadius: '999px',
                  border: `1px solid ${LINE}`,
                  background: CARD,
                  padding: '12px 18px',
                  fontSize: '22px',
                  color: INK,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              fontSize: '22px',
              color: MUTE,
            }}
          >
            <span>每天一张今日卡</span>
            <span style={{ marginTop: '4px' }}>wtfti.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
      fonts: [
        ...(chineseRegularFont
          ? [{
              name: 'Noto Sans SC',
              data: chineseRegularFont,
              style: 'normal' as const,
              weight: 400 as const,
            }]
          : []),
        ...(chineseBoldFont
          ? [{
              name: 'Noto Sans SC',
              data: chineseBoldFont,
              style: 'normal' as const,
              weight: 700 as const,
            }]
          : []),
      ],
    },
  );
}
