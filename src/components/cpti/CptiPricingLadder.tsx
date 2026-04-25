'use client';

/**
 * CPTI 2.0 — 价值阶梯页（5 档 + 通行证顶档）
 *
 * 视觉沿用「Editorial Atelier × 暮光博物笔记」: 米白底 / 金箔 / 玫瑰陶土 /
 * Cormorant + Noto Serif SC / 罗马数字章节。不要渐变背景、硬投影、AI slop。
 */

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackCptiEvent } from '@/lib/cpti/analytics';
import { cptiPricingIntentToTierSku, parseCptiPricingIntent } from '@/lib/cpti/pricing-intents';

interface Tier {
  sku: string;
  roman: string;
  name: string;
  price: string;
  unit?: string;
  tagline: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
}

const TIERS: Tier[] = [
  {
    sku: 'cpti-deep-relationship',
    roman: 'I',
    name: '单段关系 · 深档',
    price: '¥6.9',
    tagline: '为某一段你最在意的关系，做一份正式档案。',
    bullets: ['8 维关系雷达', '30 条共修建议', '12 月主题流转', '8 个雷区清单'],
    ctaLabel: '解锁单段深档',
    ctaHref: '/cpti/test/?intent=deep',
  },
  {
    sku: 'cpti-cosign-edition',
    roman: 'II',
    name: '双签金箔限定卡',
    price: '¥9.9',
    unit: '/段 · 双方各付',
    tagline: '一段关系，两个人共同署名。是你们之间的契约。',
    bullets: ['金箔双线框 + 专属编号', '双方昵称同时印在卡面', '可下载 4K 印刷级海报', '永久不可重复领取'],
    ctaLabel: '邀请 ta 一起署名',
    ctaHref: '/cpti/test/?intent=cosign',
  },
  {
    sku: 'cpti-codex-pass-yearly',
    roman: 'III',
    name: '关系图鉴年卡',
    price: '¥29',
    unit: '/年',
    tagline: '把你和重要的人之间，所有的关系都留下来。',
    bullets: [
      '关系档案夹无限存储',
      '90 天后可重测，自动生成「关系演化对比」',
      '年底生成你的年度关系图鉴长图',
      '全部 25 种关系类型深档随测随读',
    ],
    ctaLabel: '解锁年卡',
    ctaHref: '/cpti/me/codex/?intent=upgrade',
    highlight: true,
    badge: '最热',
  },
  {
    sku: 'cpti-squad-pack',
    roman: 'IV',
    name: '闺蜜组团购',
    price: '¥39',
    unit: '/4 人',
    tagline: '4 个人，6 段两两关系，1 张组合人格画像。',
    bullets: ['4 人组合自动生成 6 段关系', '一张组合人格群像海报', '组员各自享 1 年 archive 权益', '组长一次付清，无需各付'],
    ctaLabel: '组建闺蜜组',
    ctaHref: '/cpti/squad/',
    badge: '已上线',
  },
  {
    sku: 'cpti-seasonal-pack',
    roman: 'V',
    name: '季节限定皮肤年包',
    price: '¥19',
    unit: '/年',
    tagline: '把关系卡做成节令藏品：七夕、情人节、春节，一年三次换装。',
    bullets: ['七夕鹊桥金箔', '情人节玫瑰封蜡', '春节朱砂福印', '窗口外也可永久购买'],
    ctaLabel: '去结果页挑皮肤',
    ctaHref: '/cpti/test/?intent=seasonal',
    badge: '新',
  },
];

const PASS_TIER = {
  sku: 'monthly-pass',
  name: '灵魂通行证（含 CPTI 全部高级特性）',
  price: '¥19',
  unit: '/月',
  tagline: '已经在用 Mysti 的话，CPTI 全部 deep / cosign / archive 自动覆盖。',
  ctaLabel: '了解通行证 →',
  ctaHref: '/mysti/pricing/',
};

export function CptiPricingLadder() {
  const searchParams = useSearchParams();
  const focusedSku = useMemo(
    () => cptiPricingIntentToTierSku(parseCptiPricingIntent(searchParams.get('intent'))),
    [searchParams],
  );
  const emphasizedSku = focusedSku ?? 'cpti-codex-pass-yearly';
  const focusedTier = TIERS.find((tier) => tier.sku === focusedSku) ?? null;

  useEffect(() => {
    trackCptiEvent('cpti_pricing_viewed');
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-[920px] px-5 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.36em] text-text-muted">
            CPTI · Pricing Ladder · 2026 Spring Edition
          </p>
          <h1
            className="text-[44px] leading-[1.05] sm:text-[58px]"
            style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', fontStyle: 'italic' }}
          >
            命名一段关系
            <span className="text-accent">，</span>
            <br />
            然后留下所有关系。
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[14px] leading-[1.85] text-text-secondary">
            CPTI 2.0 给你 5 档清晰的方案：从一段关系的深档，到双方共同署名的限定卡，
            到你这一年里所有关系的图鉴册，到闺蜜组群像，再到一年三次会更新的季节限定皮肤。
          </p>
          {focusedTier && (
            <p className="mx-auto mt-4 inline-flex rounded-full border border-[var(--color-gold-leaf)]/40 bg-bg-elevated/80 px-3.5 py-1.5 text-[11px] tracking-[0.08em] text-text-secondary">
              已为你定位到这一档：{focusedTier.name}
            </p>
          )}
        </div>

        {/* Tiers */}
        <div className="grid gap-4 sm:grid-cols-2">
          {TIERS.map(tier => {
            const isFocused = tier.sku === emphasizedSku;
            return (
            <article
              key={tier.sku}
              className={`relative rounded-[22px] border p-6 transition ${
                isFocused
                  ? 'border-[var(--color-gold-leaf)] bg-bg-elevated shadow-[0_18px_44px_-22px_rgba(192,122,142,0.45)]'
                  : 'border-border-subtle bg-bg-elevated/85'
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute -top-2 right-5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    isFocused || tier.highlight
                      ? 'bg-gold text-bg-primary shadow-[0_4px_10px_rgba(201,166,118,0.35)]'
                      : 'bg-border-subtle text-accent-dim'
                  }`}
                >
                  {tier.badge}
                </span>
              )}

              <div className="mb-3 flex items-baseline gap-3">
                <span
                  className="text-2xl text-gold"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic' }}
                >
                  {tier.roman}
                </span>
                <h2 className="text-[16px] font-medium tracking-wide">{tier.name}</h2>
              </div>

              <div className="mb-3 flex items-baseline gap-2">
                <span
                  className="text-[42px] font-light leading-none text-text-primary"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  {tier.price}
                </span>
                {tier.unit && <span className="text-[12px] text-text-muted">{tier.unit}</span>}
              </div>

              <p className="mb-5 text-[13.5px] leading-[1.75] text-text-secondary">{tier.tagline}</p>

              <ul className="mb-6 space-y-2">
                {tier.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.7] text-text-secondary">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                onClick={() => trackCptiEvent('cpti_pricing_sku_clicked', { tier: tier.sku })}
                className={`block w-full rounded-xl py-3 text-center text-[14px] font-medium transition active:scale-[0.98] ${
                  isFocused
                    ? 'bg-text-primary text-bg-primary'
                    : 'border border-gold/60 text-text-secondary hover:bg-gold/8'
                }`}
              >
                {tier.ctaLabel}
              </Link>
            </article>
          );})}
        </div>

        {/* Pass tier */}
        <article className="mt-8 rounded-[22px] border border-dashed border-gold/60 bg-bg-secondary p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.32em] text-text-muted">
                Top Tier · 通行证覆盖
              </p>
              <h3 className="text-[16px] font-medium">{PASS_TIER.name}</h3>
              <p className="mt-2 max-w-[480px] text-[13px] leading-[1.75] text-text-secondary">{PASS_TIER.tagline}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <span
                  className="text-[36px] font-light text-text-primary"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  {PASS_TIER.price}
                </span>
                <span className="ml-1 text-[12px] text-text-muted">{PASS_TIER.unit}</span>
              </div>
              <Link
                href={PASS_TIER.ctaHref}
                onClick={() => trackCptiEvent('cpti_pricing_sku_clicked', { tier: PASS_TIER.sku })}
                className="rounded-xl border border-gold px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:bg-gold/10"
              >
                {PASS_TIER.ctaLabel}
              </Link>
            </div>
          </div>
        </article>

        {/* Footnote */}
        <p className="mt-12 text-center text-[11px] text-text-muted">
          所有 SKU 均一次解锁、永不复购；通行证按月续订，可随时取消。<br />
          支付方式：微信支付 · 支付宝（通过 Xunhupay 接入）。
        </p>

        <footer className="mt-10 border-t border-gold/30 pt-6 text-center text-[10px] font-mono uppercase tracking-[0.32em] text-text-muted">
          CPTI · 关系图鉴 · v2.0
        </footer>
      </div>
    </div>
  );
}
