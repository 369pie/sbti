import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

const notoSansScRegular = readFile(
  join(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'noto-sans-sc',
    'files',
    'noto-sans-sc-chinese-simplified-400-normal.woff',
  ),
);

const notoSansScBold = readFile(
  join(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'noto-sans-sc',
    'files',
    'noto-sans-sc-chinese-simplified-700-normal.woff',
  ),
);

const featuredTypes = [
  { code: 'CTRL', label: '拿捏者', background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)' },
  { code: 'BOSS', label: '控场王', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' },
  { code: 'CHILL', label: '无所谓', background: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)' },
] as const;

export const socialImageAlt = 'SBTI 人格测试预览图，使用中英双语展示测试信息';

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageContentType = 'image/png';

export async function createSocialImageResponse() {
  const [chineseRegularFont, chineseBoldFont] = await Promise.all([
    notoSansScRegular,
    notoSansScBold,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #FAF8F5 0%, #F2EFEA 55%, #EDE8E2 100%)',
          color: '#2D2A26',
          padding: '52px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '380px',
            height: '380px',
            borderRadius: '999px',
            background: 'rgba(224, 96, 136, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-40px',
            width: '320px',
            height: '320px',
            borderRadius: '999px',
            background: 'rgba(14, 165, 196, 0.06)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              borderRadius: '999px',
              border: '1px solid #DDD8D1',
              background: '#FFFFFF',
              padding: '12px 18px',
              fontSize: '24px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#e06088',
              fontWeight: 600,
            }}
          >
            SBTI
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '28px',
              maxWidth: '760px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '88px',
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              Find your type.
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '14px',
                fontSize: '40px',
                lineHeight: 1.2,
                color: '#2D2A26',
                fontFamily: 'Noto Sans SC',
                fontWeight: 700,
              }}
            >
              测测你是哪种抽象人格
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '18px',
                fontSize: '30px',
                lineHeight: 1.3,
                color: '#6B6560',
              }}
            >
              5 models, 15 dimensions, 27 results.
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '10px',
                fontSize: '24px',
                lineHeight: 1.3,
                color: '#7A736D',
                fontFamily: 'Noto Sans SC',
              }}
            >
              五大模型 · 十五维度 · 二十七张人设卡
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: '999px',
                  background: 'rgba(224, 96, 136, 0.1)',
                  border: '1px solid rgba(224, 96, 136, 0.3)',
                  padding: '10px 16px 12px',
                  color: '#e06088',
                }}
              >
                <div style={{ display: 'flex', fontSize: '22px', fontWeight: 600 }}>27 results</div>
                <div style={{ display: 'flex', marginTop: '4px', fontSize: '15px', fontFamily: 'Noto Sans SC' }}>27 张人设卡</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: '999px',
                  background: 'rgba(14, 165, 196, 0.1)',
                  border: '1px solid rgba(14, 165, 196, 0.3)',
                  padding: '10px 16px 12px',
                  color: '#0ea5c4',
                }}
              >
                <div style={{ display: 'flex', fontSize: '22px', fontWeight: 600 }}>15 dimensions</div>
                <div style={{ display: 'flex', marginTop: '4px', fontSize: '15px', fontFamily: 'Noto Sans SC' }}>15 个维度</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: '999px',
                  background: 'rgba(14, 165, 114, 0.1)',
                  border: '1px solid rgba(14, 165, 114, 0.3)',
                  padding: '10px 16px 12px',
                  color: '#0ea572',
                }}
              >
                <div style={{ display: 'flex', fontSize: '22px', fontWeight: 600 }}>Abstract quiz</div>
                <div style={{ display: 'flex', marginTop: '4px', fontSize: '15px', fontFamily: 'Noto Sans SC' }}>中文抽象人格测试</div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '24px',
                fontSize: '20px',
                color: '#9C9590',
                alignItems: 'center',
              }}
            >
              <span>sbtinb.com</span>
              <span style={{ display: 'flex', marginLeft: '12px', fontFamily: 'Noto Sans SC', letterSpacing: 0 }}>
                中文语境人格测试
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              padding: '22px 24px',
              borderRadius: '28px',
              background: '#FFFFFF',
              border: '1px solid #DDD8D1',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '17px',
                color: '#9C9590',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Featured types
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '6px',
                fontSize: '16px',
                color: '#8D867F',
                fontFamily: 'Noto Sans SC',
              }}
            >
              热门人设
            </div>
            <div style={{ display: 'flex', marginTop: '14px', gap: '10px' }}>
              {featuredTypes.map((type) => (
                <div
                  key={type.code}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '82px',
                    height: '82px',
                    borderRadius: '22px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: type.background,
                    color: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: '20px', fontWeight: 800 }}>{type.code}</div>
                  <div style={{ display: 'flex', marginTop: '4px', fontSize: '13px', fontFamily: 'Noto Sans SC' }}>
                    {type.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
      fonts: [
        {
          name: 'Noto Sans SC',
          data: chineseRegularFont,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Noto Sans SC',
          data: chineseBoldFont,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  );
}