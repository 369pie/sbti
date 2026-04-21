import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site';
import {
  DECISION_SCENARIOS,
  DECISION_DISCLAIMER,
} from '@/lib/mysti/decision-quotes';
import { DecisionDeckUpgradeBanner } from '@/components/mysti/DecisionDeckUpgradeBanner';

export const metadata: Metadata = {
  title: '今日决策 · 灵鉴 90 秒决策快卡 — WTFTI',
  description:
    '今夜赴约？此刻交锋？出门远行？选一个场景，让暮光替你抽 3 张牌，得到一句可截屏的诗意答案。灵鉴所述仅为暮光时分的隐喻 · 决定权永远在你手里。',
  keywords: ['决策快卡', '塔罗决策', '今日决策', 'WTFTI', '灵鉴', '约会塔罗', '面试塔罗'],
  alternates: { canonical: '/mysti/decision/' },
  openGraph: {
    title: '今日决策 · 灵鉴 90 秒决策快卡',
    description: '90 秒、3 张牌、一句金句、一张可截屏的暮光卡。',
    url: getSiteUrl('/mysti/decision/'),
    images: [
      {
        url: getSiteUrl('/images/mysti/og-default.png'),
        width: 1200,
        height: 630,
        alt: '灵鉴 · 今日决策',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '今日决策 · 灵鉴 90 秒决策快卡',
    description: '90 秒、3 张牌、一句金句、一张可截屏的暮光卡。',
  },
};

export default function MystiDecisionHubPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 80% 60% at 30% 20%, rgba(192,122,142,0.15) 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 80% 90%, rgba(156,124,255,0.12) 0%, transparent 60%), #1a1530',
        color: '#F5F0E8',
        padding: '80px 24px 120px',
        fontFamily: 'var(--font-display, "Cormorant Garamond"), "Noto Serif SC", serif',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: '0.42em',
            color: '#C9A676',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          MYSTI / DECISION QUICK CARDS
        </p>
        <h1
          style={{
            marginTop: 18,
            fontSize: 'clamp(36px, 7vw, 56px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '0.02em',
          }}
        >
          今夜，<em style={{ fontStyle: 'italic', color: '#C07A8E' }}>暮光</em>
          替你抽一张。
        </h1>
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.78)',
            maxWidth: 560,
          }}
        >
          90 秒、3 张牌、一句可截屏的诗意答案。
          挑一个今晚正在心里盘旋的场景，让灵鉴替你说出那句你没说出口的判断。
        </p>

        <div
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 16,
          }}
        >
          {DECISION_SCENARIOS.map((s) => {
            const inner = (
              <article
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '24px 26px',
                  border: `1px solid ${s.enabled ? 'rgba(201,166,118,0.32)' : 'rgba(245,240,232,0.10)'}`,
                  borderRadius: 18,
                  background: s.enabled
                    ? 'linear-gradient(180deg, rgba(37,26,58,0.92) 0%, rgba(31,21,48,0.92) 100%)'
                    : 'rgba(37,26,58,0.45)',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'transform 200ms ease, border-color 200ms ease',
                  cursor: s.enabled ? 'pointer' : 'default',
                  opacity: s.enabled ? 1 : 0.55,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    flex: '0 0 56px',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: `1.5px solid ${s.accentHex}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display, "Cormorant Garamond"), serif',
                    fontStyle: 'italic',
                    fontSize: 26,
                    color: s.accentHex,
                    letterSpacing: '0.04em',
                  }}
                >
                  {s.numeral}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.32em',
                      color: s.accentHex,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    第 {s.numeral} 章 · {s.eyebrow}
                  </p>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      lineHeight: 1.3,
                    }}
                  >
                    {s.label}
                  </h2>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: 'rgba(245,240,232,0.62)',
                    }}
                  >
                    {s.tagline}
                  </p>
                </div>
                <span
                  style={{
                    flex: '0 0 auto',
                    fontSize: 13,
                    color: s.enabled ? s.accentHex : 'rgba(245,240,232,0.38)',
                    letterSpacing: '0.16em',
                  }}
                >
                  {s.enabled ? '抽 →' : '敬请期待'}
                </span>
              </article>
            );
            return s.enabled ? (
              <Link
                key={s.id}
                href={`/mysti/decision/${s.id}/`}
                aria-label={`进入「${s.label}」决策快卡`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {inner}
              </Link>
            ) : (
              <div key={s.id} aria-disabled>
                {inner}
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 64,
            fontSize: 11,
            lineHeight: 1.6,
            opacity: 0.55,
            fontStyle: 'italic',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          {DECISION_DISCLAIMER}
        </p>

        <DecisionDeckUpgradeBanner />

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            fontSize: 12,
            color: 'rgba(245,240,232,0.45)',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/mysti/" style={{ color: 'inherit' }}>
            ← 回到灵鉴入口
          </Link>
          <Link href="/mysti/sigil/" style={{ color: 'inherit' }}>
            年度纪章册 →
          </Link>
          <Link href="/mysti/archive/" style={{ color: 'inherit' }}>
            我的灵魂档案 →
          </Link>
        </div>
      </div>
    </main>
  );
}
