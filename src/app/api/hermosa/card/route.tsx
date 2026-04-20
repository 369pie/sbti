/**
 * /api/hermosa/card
 * ─────────────────────────────────────────────
 * 黑板字报留言卡（next/og 渲染，1080×1350 9:11 通用分享尺寸）
 *
 * Query:
 *   text (req)         留言内容，≤180 字
 *   signature          可空匿名昵称
 *   universe           wtfti / soulti / ... 用于角标徽章
 *   slug               人格 slug，用于副标
 *   number             罗马数字编号（可选；前端未传则用日期 hash）
 *   tag                单个 hermosa tag，渲染为金色徽章
 *
 * 注意：所有 div 必须显式 display；root 必须显式 height；不要负 offset。
 */

import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

const W = 1080;
const H = 1350;

const TAG_LABELS: Record<string, string> = {
  want: '想要',
  feedback: '体验吐槽',
  voice: '价值观点',
  declare: '同型号宣言',
  feature: '想要新内容',
  thanks: '感谢',
};

const UNIVERSE_LABELS: Record<string, string> = {
  wtfti: 'WTFTI',
  soulti: 'SOULTI',
  cpti: 'CPTI',
  xpti: 'XPTI',
  hogti: 'HOGTI',
  fanrenti: '凡修TI',
  mysti: 'MYSTI',
  wtfcard: 'CARD',
  meta: 'WTFTI',
};

function fnvHash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function toRoman(num: number): string {
  if (num <= 0) return 'I';
  const map: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

function StarSvg({ size = 14, opacity = 0.5 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'flex', opacity }}
    >
      <path
        d="M 50 0 L 58 42 L 100 50 L 58 58 L 50 100 L 42 58 L 0 50 L 42 42 Z"
        fill="#C9A676"
      />
    </svg>
  );
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rawText = (sp.get('text') ?? '').slice(0, 180);
  const text = rawText || '她想说点什么。';
  const signature = (sp.get('signature') ?? '').slice(0, 24);
  const universe = (sp.get('universe') ?? 'meta').toLowerCase();
  const slug = sp.get('slug') ?? '';
  const tag = sp.get('tag') ?? '';
  const numberParam = sp.get('number');
  const number = numberParam
    ? Math.max(1, Math.min(9999, Number(numberParam) || 1))
    : (fnvHash(text + signature) % 999) + 1;

  const universeLabel = UNIVERSE_LABELS[universe] ?? 'HERMOSA';
  const tagLabel = tag && TAG_LABELS[tag] ? TAG_LABELS[tag] : '';

  // 字号根据文本长度自适应：12 段
  const len = text.length;
  const fontSize = len <= 24 ? 76 : len <= 48 ? 62 : len <= 90 ? 50 : len <= 130 ? 42 : 36;
  const lineHeight = 1.55;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          background: '#15102A',
          position: 'relative',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          color: '#F5F0E8',
        }}
      >
        {/* 暮紫 → 玫瑰 极淡晕 */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -200,
            width: 700,
            height: 700,
            display: 'flex',
            background: 'radial-gradient(circle, rgba(192,122,142,0.18) 0%, rgba(192,122,142,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -150,
            width: 600,
            height: 600,
            display: 'flex',
            background: 'radial-gradient(circle, rgba(201,166,118,0.15) 0%, rgba(201,166,118,0) 70%)',
          }}
        />

        {/* 角部装饰星屑 */}
        <div style={{ position: 'absolute', top: 56, left: 56, display: 'flex', gap: 14 }}>
          <StarSvg size={12} opacity={0.7} />
          <StarSvg size={8} opacity={0.45} />
        </div>
        <div style={{ position: 'absolute', top: 56, right: 56, display: 'flex', gap: 14 }}>
          <StarSvg size={8} opacity={0.45} />
          <StarSvg size={12} opacity={0.7} />
        </div>

        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 110,
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: '0.42em',
              color: '#C9A676',
              fontWeight: 500,
            }}
          >
            HERMOSA · 她 的 话
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ width: 80, height: 1, background: '#C9A676', display: 'flex', opacity: 0.7 }} />
            <div
              style={{
                display: 'flex',
                fontSize: 16,
                letterSpacing: '0.32em',
                color: '#F5F0E8',
                opacity: 0.55,
                fontStyle: 'italic',
              }}
            >
              N° {toRoman(number)}
            </div>
            <div style={{ width: 80, height: 1, background: '#C9A676', display: 'flex', opacity: 0.7 }} />
          </div>
        </div>

        {/* 引文区 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '60px 110px',
          }}
        >
          {/* 起引号 */}
          <div
            style={{
              display: 'flex',
              fontSize: 110,
              color: '#C9A676',
              opacity: 0.5,
              lineHeight: 1,
              marginBottom: -10,
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            「
          </div>
          <div
            style={{
              display: 'flex',
              fontSize,
              lineHeight,
              color: '#F5F0E8',
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 400,
              maxWidth: 860,
              letterSpacing: '0.02em',
            }}
          >
            {text}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 110,
              color: '#C9A676',
              opacity: 0.5,
              lineHeight: 1,
              marginTop: -10,
              fontFamily: '"Cormorant Garamond", serif',
              alignSelf: 'flex-end',
            }}
          >
            」
          </div>
        </div>

        {/* 标签徽章（可选） */}
        {tagLabel ? (
          <div
            style={{
              display: 'flex',
              alignSelf: 'center',
              marginBottom: 24,
              padding: '8px 22px',
              border: '1px solid #C9A676',
              borderRadius: 999,
              fontSize: 18,
              letterSpacing: '0.24em',
              color: '#C9A676',
            }}
          >
            # {tagLabel}
          </div>
        ) : null}

        {/* 签名 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            paddingBottom: 48,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontStyle: 'italic',
              color: '#C9A676',
              letterSpacing: '0.06em',
            }}
          >
            — {signature || 'Anonymous'}, MMXXVI
          </div>
          {slug ? (
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                color: '#F5F0E8',
                opacity: 0.4,
                letterSpacing: '0.18em',
              }}
            >
              {universeLabel} · {slug}
            </div>
          ) : null}
        </div>

        {/* 底部条 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '28px 80px',
            borderTop: '1px solid rgba(201,166,118,0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              letterSpacing: '0.32em',
              color: '#C9A676',
              opacity: 0.85,
            }}
          >
            THE WALL OF HER VOICE
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              letterSpacing: '0.32em',
              color: '#F5F0E8',
              opacity: 0.5,
            }}
          >
            HERMOSA · WTFTI
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      },
    },
  );
}
