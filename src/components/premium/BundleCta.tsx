'use client';

import Link from 'next/link';

/**
 * BundleCta — cross-module bundle reward banner.
 * Shipped on each paid deep page (CPTI / XPTI / SoulTI) above the
 * existing cross-link list. Encourages users to unlock more deep tiers
 * for soft-bundled rewards (no real payment coupling — narrative only).
 */
export function BundleCta({
  accent = '#C9A676',
}: {
  accent?: string;
}) {
  return (
    <div
      style={{
        marginTop: 24,
        padding: '20px 22px',
        borderRadius: 16,
        background:
          'linear-gradient(135deg, rgba(201,166,118,0.06), rgba(192,122,142,0.05))',
        border: '1px solid rgba(201,166,118,0.28)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.42em',
            color: accent,
            textTransform: 'uppercase',
          }}
        >
          BUNDLE · 跨档奖励
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 11,
            color: 'rgba(245,240,232,0.55)',
          }}
        >
          解锁越多 · 越完整
        </span>
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {[
          {
            badge: 'II',
            title: '任意两档深档',
            sub: '解锁「跨档对话脚本」· 把两套人格映射成一份桥梁练习',
          },
          {
            badge: 'III',
            title: '任意三档深档',
            sub: '解锁「整体灵魂档案」· 自动生成你的人格全景与共振曲线',
          },
          {
            badge: '∞',
            title: 'Mysti 通行证 ¥19/月',
            sub: 'WTFTI / SoulTI / CPTI / XPTI 深档自动解锁 + 灵魂月报 + 礼品卡 6 折',
          },
        ].map((item) => (
          <li
            key={item.badge}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `1px solid ${accent}`,
                color: accent,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(201,166,118,0.05)',
              }}
            >
              {item.badge}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 13,
                  color: 'rgba(245,240,232,0.92)',
                  marginBottom: 2,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  color: 'rgba(245,240,232,0.6)',
                  lineHeight: 1.7,
                }}
              >
                {item.sub}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px dashed rgba(201,166,118,0.25)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Link
          href="/mysti/subscribe/?from=deep-bundle"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.32em',
            color: accent,
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderBottom: `1px solid ${accent}`,
            paddingBottom: 2,
          }}
        >
          开通通行证 →
        </Link>
      </div>
    </div>
  );
}
