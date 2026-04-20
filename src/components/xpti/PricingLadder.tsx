'use client';

/**
 * XPTI v3.0 价值阶梯（Pricing Ladder）
 *
 * 4 档清晰的付费门槛：
 *   ¥4.9  深度 XP 解析（单人）
 *   ¥6.9  关系合并报告 · 双人各付一半
 *   ¥12.9 关系合并报告 · 单方付清
 *   ¥29   年度档案（4 次复测对比 + 张力轨迹 + 年度 PDF）
 *
 * 这只是一个对比展示组件 — 不直接发起支付，按钮链路指向各 SKU 对应的页面。
 */

import Link from 'next/link';
import { basePath } from '@/lib/site';
import { SKU_PRICES } from '@/lib/mysti/unlock';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

const PALETTE = {
  paper: '#F5F0E8',
  paperDeep: '#EFE6D6',
  ink: '#1F1A16',
  inkMute: '#5B524B',
  rule: '#D6CDBE',
  rose: '#A85A6E',
  wine: '#6A2A3E',
  gold: '#C9A676',
};

interface Tier {
  sku: 'xpti-deep-xp' | 'xpti-couple-half' | 'xpti-couple-report' | 'xpti-archive-yearly';
  tier: 'L1' | 'L2' | 'L3' | 'L4';
  eyebrow: string;
  highlights: string[];
  ctaHref: string;
  ctaLabel: string;
  recommended?: boolean;
}

const TIERS: Tier[] = [
  {
    sku: 'xpti-deep-xp',
    tier: 'L1',
    eyebrow: '一个人 · 入门',
    highlights: [
      'XP 雷达 · 9 维满分图',
      '6 类配对 · 谁让你最甜 / 最痛',
      '亲密雷区清单 · 5 条',
    ],
    ctaHref: '/xpti/',
    ctaLabel: '完测后解锁',
  },
  {
    sku: 'xpti-couple-half',
    tier: 'L2',
    eyebrow: '两个人 · 平摊',
    highlights: [
      '双人合并雷达 · 9 轴叠加',
      '6 类张力配对 · 配你们专属版',
      '24 句对话脚本 · 拿来即用',
      '你 ¥6.9 + ta ¥6.9 = ¥13.8',
    ],
    ctaHref: '/xpti/couple/',
    ctaLabel: '邀请伴侣 →',
    recommended: true,
  },
  {
    sku: 'xpti-couple-report',
    tier: 'L3',
    eyebrow: '两个人 · 单方付清',
    highlights: [
      '与 L2 内容完全一致',
      '一方一次付清 ¥12.9',
      '适合"我就请一下她"的场合',
    ],
    ctaHref: '/xpti/couple/',
    ctaLabel: '我请客 →',
  },
  {
    sku: 'xpti-archive-yearly',
    tier: 'L4',
    eyebrow: '一年里的你 · 长期资产',
    highlights: [
      '4 次复测对照（≥ 8 周一次）',
      '张力 3 轴轨迹图',
      '年度 PDF · 可下载收藏',
      '所有历史档案不再被裁剪',
    ],
    ctaHref: '/xpti/archive/',
    ctaLabel: '解锁年度档案 →',
  },
];

export function PricingLadder() {
  return (
    <section
      style={{
        background: PALETTE.paper,
        padding: '72px 24px 88px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.42em',
              color: PALETTE.rose,
              textTransform: 'uppercase',
            }}
          >
            XPTI · Pricing Ladder · v3.0
          </div>
          <h2
            style={{
              fontFamily: display,
              fontSize: 'clamp(34px, 5vw, 54px)',
              lineHeight: 1.12,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              margin: '14px 0 6px',
              color: PALETTE.ink,
            }}
          >
            从 <span style={{ fontStyle: 'italic', color: PALETTE.wine }}>一个人</span>
            ，到 <span style={{ fontStyle: 'italic', color: PALETTE.wine }}>两个人</span>
            ，到 <span style={{ fontStyle: 'italic', color: PALETTE.wine }}>一年里的你</span>
          </h2>
          <p
            style={{
              maxWidth: 560,
              margin: '14px auto 0',
              fontSize: 15,
              lineHeight: 1.8,
              color: PALETTE.inkMute,
            }}
          >
            XPTI 不再只是一份&ldquo;测完就走&rdquo;的画像。下面 4 个价位都 ≤ ¥29，
            你可以从任意一档开始。
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(232px, 1fr))',
            gap: 16,
          }}
        >
          {TIERS.map((t) => {
            const meta = SKU_PRICES[t.sku];
            return (
              <article
                key={t.sku}
                style={{
                  position: 'relative',
                  background: t.recommended ? '#FFFDF9' : PALETTE.paperDeep,
                  border: `1px solid ${t.recommended ? PALETTE.wine : PALETTE.rule}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: t.recommended ? `0 8px 24px ${PALETTE.wine}14` : 'none',
                }}
              >
                {t.recommended && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      background: PALETTE.gold,
                      color: PALETTE.ink,
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontFamily: mono,
                      fontSize: 10,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recommended
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      letterSpacing: '0.32em',
                      color: t.recommended ? PALETTE.wine : PALETTE.gold,
                      textTransform: 'uppercase',
                    }}
                  >
                    {t.tier} · {t.eyebrow}
                  </span>
                </div>
                <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 22, color: PALETTE.ink, lineHeight: 1.25 }}>
                  {meta.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: display,
                      fontSize: 40,
                      fontWeight: 500,
                      color: PALETTE.wine,
                      lineHeight: 1,
                    }}
                  >
                    ¥{meta.price}
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: PALETTE.inkMute, letterSpacing: '0.18em' }}>
                    {t.sku === 'xpti-archive-yearly' ? '/ year' : '/ once'}
                  </span>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gap: 8,
                    flexGrow: 1,
                  }}
                >
                  {t.highlights.map((h) => (
                    <li
                      key={h}
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: PALETTE.inkMute,
                        paddingLeft: 14,
                        position: 'relative',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 8,
                          width: 6,
                          height: 1,
                          background: t.recommended ? PALETTE.wine : PALETTE.gold,
                        }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${basePath}${t.ctaHref}`}
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: t.recommended ? PALETTE.wine : 'transparent',
                    color: t.recommended ? PALETTE.paper : PALETTE.wine,
                    border: `1px solid ${PALETTE.wine}`,
                    borderRadius: 999,
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    marginTop: 4,
                  }}
                >
                  {t.ctaLabel}
                </Link>
              </article>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontSize: 12,
            color: PALETTE.inkMute,
            lineHeight: 1.7,
          }}
        >
          所有付费内容均为本地解锁；订阅类灵魂月度通行证（¥19/月）暂不覆盖 XPTI 模块。
          <br />
          v3.2 将上线 ¥9.9/月「亲密内参」订阅，包含每月主题报告 + 测试更新。
        </p>
      </div>
    </section>
  );
}
