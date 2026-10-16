import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Keep OG font assets tiny and self-contained so serverless deploys do not
// depend on pruned node_modules files at runtime. Regenerate these subsets if
// the Chinese copy in this image changes.
//
// On Vercel these files must be force-included via `outputFileTracingIncludes`
// in next.config.ts. If a deploy ever loses them, fall back to no-font instead
// of crashing the lambda (exit 128). Satori will draw boxes for unknown
// glyphs, but the OG response still succeeds and X/WeChat will at least show
// the gradient + ASCII.
async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(
      join(process.cwd(), 'assets', 'fonts', filename),
    );
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

const BG = '#FFF7F8';
const ACCENT = '#F59BB8';
const INK = '#4D2C2F';
const INK_SOFT = '#6E4549';
const ROSE_MIST = '#FAD6E0';

const chips = ['今日一牌', '情侣关系报告 ¥12.9', '三分钟经典测试'] as const;

export const socialImageAlt = 'WTFTI — 女生的情绪陪伴站 · 情侣关系沟通报告';

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
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `radial-gradient(circle at 85% 15%, #FCE9F0 0%, ${BG} 55%, #FFFFFF 100%)`,
          color: INK,
          padding: '56px 64px',
          fontFamily: 'Noto Sans SC',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '640px' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              borderRadius: '999px',
              background: ACCENT,
              color: INK,
              padding: '10px 22px',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '0.18em',
            }}
          >
            WTFTI
          </div>
          <div style={{ display: 'flex', marginTop: '36px', fontSize: '76px', fontWeight: 700, lineHeight: 1.1 }}>
            女生的情绪陪伴站
          </div>
          <div style={{ display: 'flex', marginTop: '14px', fontSize: '44px', fontWeight: 700, color: INK_SOFT }}>
            情侣关系沟通报告
          </div>
          <div style={{ display: 'flex', marginTop: '24px', fontSize: '28px', color: INK_SOFT, lineHeight: 1.4 }}>
            先听懂今天的自己，再看清一段关系。
          </div>
          <div style={{ display: 'flex', marginTop: '36px', gap: '12px' }}>
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  display: 'flex',
                  borderRadius: '999px',
                  border: `2px solid ${ACCENT}`,
                  background: '#FFFFFF',
                  padding: '10px 20px',
                  fontSize: '22px',
                  color: INK,
                }}
              >
                {c}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: '32px', fontSize: '22px', color: '#9C7178' }}>wtfti.com</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '360px',
            padding: '32px',
            borderRadius: '32px',
            background: '#FFFFFF',
            border: `2px solid ${ROSE_MIST}`,
            boxShadow: '0 24px 60px rgba(245, 155, 184, 0.35)',
          }}
        >
          <div style={{ display: 'flex', fontSize: '20px', color: '#9C7178' }}>今晚可以试着这样说</div>
          <div style={{ display: 'flex', marginTop: '16px', fontSize: '32px', fontWeight: 700, lineHeight: 1.45, color: INK }}>
            “我不是想赢这场架，我只是想你先抱抱我。”
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: '28px',
              alignSelf: 'flex-start',
              borderRadius: '999px',
              background: INK,
              color: BG,
              padding: '12px 24px',
              fontSize: '22px',
              fontWeight: 700,
            }}
          >
            和 ta 一起测
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