'use client';

/**
 * Sigil · 年度纪章册（v1）
 *
 * v1 范围：
 * - 12 月罗马数字徽章网格（I–XII）
 * - 当前月有 SVG 纪章预览；未到月仅显示锁状徽章
 * - sigil-yearly（¥39）解锁后：所有月份开放预览 + 显示「下载年度 PDF」CTA
 *
 * 内容深度（24 节气联动 / 占星周期等）按 W7+ 二轮迭代再扩。
 *
 * 视觉：Editorial Atelier × 暮光博物笔记体系（Cormorant + Noto Serif SC，
 * 玫瑰陶土 / 金箔 / 暮紫底）。
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { isUnlocked } from '@/lib/mysti/unlock';
import { isSubscriber } from '@/lib/mysti/subscription';
import { SigilYearlyPaywall } from './mysti/SigilYearlyPaywall';

const ROMAN: readonly string[] = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

const MONTH_THEMES: Array<{ name: string; tagline: string; accent: string }> = [
  { name: '寒节', tagline: '把去年还没吐完的火吐完', accent: '#9C7CFF' },
  { name: '醒章', tagline: '让身体先于决心醒来', accent: '#C07A8E' },
  { name: '出芽', tagline: '允许羞耻地长出新枝', accent: '#88B69F' },
  { name: '雨纹', tagline: '冲洗那些没被流出来的话', accent: '#7CBADC' },
  { name: '蔷薇', tagline: '靠近那个让你脸热的人', accent: '#C07A8E' },
  { name: '中场', tagline: '把今年砍成两半重新数', accent: '#C9A676' },
  { name: '夏火', tagline: '不要避开你的高光', accent: '#E0894A' },
  { name: '潮信', tagline: '该回的信现在都得回', accent: '#9C7CFF' },
  { name: '秋分', tagline: '把得失放在同一架秤上', accent: '#C9A676' },
  { name: '霜痕', tagline: '允许第一次说不', accent: '#A8B2C4' },
  { name: '银息', tagline: '把今年的人重新分类', accent: '#7CBADC' },
  { name: '岁阙', tagline: '替明年留一格空白', accent: '#C9A676' },
];

const RESOURCE_ID = 'yearly';

export function MystiSigilContent() {
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(
      isUnlocked('sigil-yearly', RESOURCE_ID) ||
        // 通行证用户也直接放行（与 subscription.ts 的覆盖语义保持一致）
        isSubscriber(),
    );
    setHydrated(true);
  }, []);

  const currentMonth = useMemo(() => {
    if (!hydrated) return -1;
    return new Date().getMonth();
  }, [hydrated]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 80% 60% at 30% 20%, rgba(192,122,142,0.16) 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 80% 90%, rgba(156,124,255,0.14) 0%, transparent 60%), #1a1530',
        color: '#F5F0E8',
        padding: '72px 20px 120px',
        fontFamily:
          'var(--font-display, "Cormorant Garamond"), "Noto Serif SC", serif',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: '0.42em',
            color: '#C9A676',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          MYSTI / SIGIL · ANNUAL CODEX
        </p>
        <h1
          style={{
            marginTop: 18,
            fontSize: 'clamp(34px, 6.4vw, 52px)',
            fontWeight: 600,
            lineHeight: 1.18,
            letterSpacing: '0.02em',
          }}
        >
          一整年的暮光，
          <em style={{ fontStyle: 'italic', color: '#C07A8E' }}>
            被收进十二枚纪章
          </em>
          。
        </h1>
        <p
          style={{
            marginTop: 18,
            fontSize: 16,
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.78)',
            maxWidth: 600,
          }}
        >
          每个月，灵鉴会替你封存一枚 Sigil ——
          一段月相、一句你自己的话、一个被记下的瞬间。
          年终把 12 枚纪章合订成一本印刷级 PDF。
        </p>

        {/* 12 月网格 */}
        <section
          aria-label="十二月纪章"
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
            gap: 18,
          }}
        >
          {MONTH_THEMES.map((theme, idx) => {
            const isCurrent = idx === currentMonth;
            const isFuture = idx > currentMonth;
            const previewable = unlocked || isCurrent;
            return (
              <article
                key={theme.name}
                style={{
                  position: 'relative',
                  borderRadius: 18,
                  border: `1px solid ${
                    isCurrent
                      ? 'rgba(201,166,118,0.62)'
                      : 'rgba(245,240,232,0.10)'
                  }`,
                  background: isCurrent
                    ? 'linear-gradient(180deg, rgba(48,32,72,0.95) 0%, rgba(31,21,48,0.95) 100%)'
                    : 'rgba(37,26,58,0.55)',
                  padding: '22px 18px 20px',
                  opacity: previewable ? 1 : 0.42,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 196,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: `1.5px solid ${theme.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontStyle: 'italic',
                    color: theme.accent,
                    letterSpacing: '0.04em',
                    background: previewable
                      ? `radial-gradient(circle, ${theme.accent}28 0%, transparent 70%)`
                      : 'transparent',
                  }}
                >
                  {ROMAN[idx]}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.32em',
                    color: theme.accent,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {idx + 1} 月 · {theme.name}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: previewable
                      ? 'rgba(245,240,232,0.88)'
                      : 'rgba(245,240,232,0.32)',
                    fontStyle: previewable ? 'normal' : 'italic',
                  }}
                >
                  {previewable
                    ? theme.tagline
                    : isFuture
                    ? '待开启 · 时间到了再来'
                    : '解锁年度纪章册以查看'}
                </p>
                {isCurrent && (
                  <div
                    style={{
                      marginTop: 'auto',
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      color: '#C9A676',
                      textTransform: 'uppercase',
                    }}
                  >
                    ✦ 本月 · 进行中
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* 解锁区 */}
        <section style={{ marginTop: 64 }}>
          {!hydrated ? null : unlocked ? (
            <div
              style={{
                padding: '24px 26px',
                borderRadius: 18,
                border: '1px solid rgba(201,166,118,0.42)',
                background:
                  'linear-gradient(160deg, rgba(48,32,72,0.94) 0%, rgba(31,21,48,0.96) 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.42em',
                  color: '#C9A676',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                ✦ Sigil Yearly · 已解锁
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(245,240,232,0.78)',
                  lineHeight: 1.7,
                }}
              >
                12 枚纪章年终合订 PDF 将在 12 月 22 日（冬至）暮光时分发出。
                每月在
                <Link
                  href="/mysti/mood/"
                  style={{ color: '#C9A676', marginLeft: 4, marginRight: 4 }}
                >
                  心情打卡
                </Link>
                与
                <Link
                  href="/mysti/decision/"
                  style={{ color: '#C9A676', marginLeft: 4, marginRight: 4 }}
                >
                  决策快卡
                </Link>
                留下的痕迹会自动编入对应章节。
              </p>
            </div>
          ) : (
            <SigilYearlyPaywall resourceId={RESOURCE_ID} />
          )}
        </section>

        <p
          style={{
            marginTop: 56,
            fontSize: 11,
            lineHeight: 1.6,
            opacity: 0.55,
            fontStyle: 'italic',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          灵鉴所述仅为暮光时分的隐喻 · 决定权永远在你手里
        </p>

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
          <Link href="/mysti/seasonal/" style={{ color: 'inherit' }}>
            节气年报 →
          </Link>
          <Link href="/mysti/decision/" style={{ color: 'inherit' }}>
            今日决策 →
          </Link>
        </div>
      </div>
    </main>
  );
}
