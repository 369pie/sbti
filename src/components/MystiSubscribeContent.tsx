'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { SKU_PRICES, type SubscriptionSku } from '@/lib/mysti/unlock';
import { getPaymentAvailabilityStatus } from '@/lib/payment/availability';
import {
  daysUntilExpiry,
  getActiveSubscription,
  isSubscriber,
} from '@/lib/mysti/subscription';
import { getActiveReferralCode } from '@/lib/mysti/creator-referral';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import { readApiJson } from '@/lib/api';

interface TierDef {
  sku: SubscriptionSku;
  badge: string;
  perMonth: string;
  highlight?: string;
  bullets: string[];
  cta: string;
  recommended?: boolean;
}

const TIERS: TierDef[] = [
  {
    sku: 'monthly-pass',
    badge: '试一个月',
    perMonth: '¥19/月',
    bullets: [
      '每日翻牌专属仪式',
      '全部 Plus 分享卡 · 去水印 / 金边精修',
      '灵魂月报自动解锁（¥6.9/月）',
      '灵魂信 / 合盘报告 / 藏品卡 全 7 折',
      '到期自然结束 · 不自动续费',
    ],
    cta: '开通月度通行证',
  },
  {
    sku: 'quarterly-pass',
    badge: '最甜蜜点',
    perMonth: '¥33/月（季付）',
    highlight: '相比月卡省 ¥18',
    bullets: [
      '月卡全部权益',
      '额外赠送：每月限定藏品卡 1 张',
      '到期前 7 天提醒续费',
    ],
    cta: '开通季度通行证 ¥99',
    recommended: true,
  },
  {
    sku: 'yearly-pass',
    badge: '铁粉之选',
    perMonth: '¥25/月（年付）',
    highlight: '相比月卡省 ¥-65 · 全年最划算',
    bullets: [
      '季卡全部权益',
      '额外赠送：年度限定藏品 N° 编号',
      '专属客服通道 + 年度灵魂书',
    ],
    cta: '开通年度通行证 ¥299',
  },
];

function SubscribeInner() {
  const { theme } = useMystiTheme();
  const search = useSearchParams();
  const fromSku = search.get('from') ?? null;
  const [hydrated, setHydrated] = useState(false);
  const [hasPass, setHasPass] = useState(false);
  const [days, setDays] = useState(0);
  const [activeSku, setActiveSku] = useState<SubscriptionSku | null>(null);
  const [loading, setLoading] = useState<SubscriptionSku | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    setHasPass(isSubscriber());
    setDays(daysUntilExpiry());
    const sub = getActiveSubscription();
    setActiveSku(sub?.sku ?? null);
    try {
      trackMystiEvent('mysti_subscribe_view', {
        source: 'page',
        from: fromSku,
      });
    } catch {
      /* noop */
    }
  }, [fromSku]);

  const checkout = useCallback(
    async (sku: SubscriptionSku) => {
      const paymentAvailability = getPaymentAvailabilityStatus();
      if (paymentAvailability.blocked) {
        setError(paymentAvailability.message);
        return;
      }

      setLoading(sku);
      setError(null);
      try {
        trackMystiEvent('mysti_subscribe_initiate', { sku, paymentType });
      } catch {
        /* noop */
      }
      try {
        const ref = getActiveReferralCode() || undefined;
        const deviceId = getOrCreateDeviceId() || undefined;
        const redirect =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/mysti/subscribe/';
        const res = await fetch('/api/mysti/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku,
            resourceId: 'subscription',
            paymentType,
            ref,
            deviceId,
            redirect,
          }),
        });
        const data = await readApiJson<{
          url?: string;
          orderId?: string;
          stub?: boolean;
          error?: string;
          message?: string;
        }>(res);
        if (!res.ok || !data.url) {
          throw new Error(data.message || data.error || 'create_failed');
        }
        window.location.href = data.url;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(null);
      }
    },
    [paymentType],
  );

  const headline = useMemo(() => {
    if (!hydrated) return '灵魂通行证';
    if (hasPass && activeSku) {
      return `你已开通 · 还剩 ${days} 天`;
    }
    return '灵魂通行证';
  }, [hydrated, hasPass, activeSku, days]);

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link
            href="/mysti/"
            className="text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
            style={{ color: theme.textMuted }}
          >
            ← 灵鉴首页
          </Link>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {headline}
          </h1>
          <p
            className="mt-3 text-sm leading-7 max-w-xl mx-auto"
            style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
          >
            把单次解锁、月报、Plus 分享卡、每日仪式打包到一张通行证。
            <br />
            到期自然结束，不自动续费——这是我们对你最基本的尊重。
          </p>
        </div>

        {/* 当前订阅状态 */}
        {hydrated && hasPass && activeSku && (
          <div
            className="mb-8 rounded-2xl px-5 py-4 text-sm"
            style={{
              background: theme.cardSurface,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.cardBorder,
              color: theme.text,
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium">
                  当前：{SKU_PRICES[activeSku].label}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  剩余 {days} 天 · 可叠加续费 · 到期前 7 天会提醒
                </p>
              </div>
              <Link
                href="/mysti/"
                className="text-xs underline"
                style={{ color: theme.accent }}
              >
                返回灵鉴
              </Link>
            </div>
          </div>
        )}

        {/* 支付方式 */}
        <div className="flex justify-center gap-2 mb-6">
          {(['wechat', 'alipay'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPaymentType(p)}
              className="px-4 py-2 rounded-full text-xs transition-all"
              style={{
                background: paymentType === p ? theme.accentSoft : 'transparent',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor:
                  paymentType === p ? theme.accent : theme.cardBorder,
                color: paymentType === p ? theme.accent : theme.textMuted,
              }}
            >
              {p === 'wechat' ? '微信支付' : '支付宝'}
            </button>
          ))}
        </div>

        {/* 三档价位 */}
        <div className="grid sm:grid-cols-3 gap-4">
          {TIERS.map(tier => {
            const meta = SKU_PRICES[tier.sku];
            const isActive = activeSku === tier.sku;
            const recommended = tier.recommended;
            return (
              <motion.div
                key={tier.sku}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 flex flex-col relative"
                style={{
                  background: theme.cardSurface,
                  borderWidth: recommended ? 2 : 1,
                  borderStyle: 'solid',
                  borderColor: recommended ? theme.accentGold : theme.cardBorder,
                  boxShadow: recommended
                    ? `0 12px 36px ${theme.cardGlow}`
                    : undefined,
                }}
              >
                {recommended && (
                  <span
                    className="absolute -top-3 right-4 text-[10px] px-2 py-1 rounded-full"
                    style={{
                      background: theme.accentGold,
                      color: theme.bg,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    最甜蜜点
                  </span>
                )}
                <p
                  className="text-[10px] tracking-[0.22em] uppercase opacity-80"
                  style={{ color: theme.textMuted }}
                >
                  {tier.badge}
                </p>
                <h3
                  className="mt-2 text-xl"
                  style={{ fontFamily: 'var(--font-display)', color: theme.text }}
                >
                  {meta.label}
                </h3>
                <p
                  className="mt-1 text-2xl font-medium"
                  style={{ color: theme.accentGold }}
                >
                  ¥{meta.price}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  {tier.perMonth}
                </p>
                {tier.highlight && (
                  <p className="text-[11px] mt-1" style={{ color: theme.accent }}>
                    {tier.highlight}
                  </p>
                )}
                <ul className="mt-4 space-y-2 text-sm flex-1">
                  {tier.bullets.map(b => (
                    <li
                      key={b}
                      className="flex gap-2"
                      style={{ color: theme.textMuted }}
                    >
                      <span style={{ color: theme.accentGold }}>·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => checkout(tier.sku)}
                  disabled={!!loading || isActive}
                  className="mt-5 py-3 rounded-xl text-sm tracking-wider transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
                    color: '#fff',
                    fontFamily: 'var(--font-serif)',
                    boxShadow: `0 8px 24px ${theme.cardGlow}`,
                  }}
                >
                  {isActive
                    ? '当前已开通'
                    : loading === tier.sku
                      ? '正在创建订单…'
                      : tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {error && (
          <p
            className="mt-4 text-center text-xs"
            style={{ color: '#FFB1B1' }}
          >
            {error}
          </p>
        )}

        {/* 权益矩阵 */}
        <div
          className="mt-10 rounded-2xl p-6"
          style={{
            background: theme.cardSurface,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.cardBorder,
          }}
        >
          <h3
            className="text-base mb-4"
            style={{ fontFamily: 'var(--font-display)', color: theme.text }}
          >
            通行证 vs 单次购买
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
            <Row label="灵魂月报 · 月度生成" pass="自动解锁" single="¥6.9 / 月" theme={theme} />
            <Row label="全部 Plus 分享卡" pass="去水印 · 金边" single="¥4.9 / 张" theme={theme} />
            <Row label="灵魂信 · 深度版" pass="7 折 · ¥6.9" single="¥9.9" theme={theme} />
            <Row label="双人合盘报告" pass="7 折 · ¥9" single="¥12.9" theme={theme} />
            <Row label="N° 藏品分享卡" pass="7 折 · ¥13.9" single="¥19.9" theme={theme} />
            <Row label="每日翻牌" pass="额外仪式" single="基础免费" theme={theme} />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 space-y-4 text-sm" style={{ color: theme.textMuted }}>
          <details className="rounded-xl px-4 py-3" style={{ background: theme.cardSurface, borderWidth: 1, borderStyle: 'solid', borderColor: theme.cardBorder }}>
            <summary className="cursor-pointer" style={{ color: theme.text }}>
              到期会自动续费吗？
            </summary>
            <p className="mt-2 text-xs leading-6">
              不会。所有通行证都是「到期自然结束」，到期前 7 天 / 3 天 / 1 天分别提醒一次。需要续费时你主动操作即可，叠加续期也支持。
            </p>
          </details>
          <details className="rounded-xl px-4 py-3" style={{ background: theme.cardSurface, borderWidth: 1, borderStyle: 'solid', borderColor: theme.cardBorder }}>
            <summary className="cursor-pointer" style={{ color: theme.text }}>
              已经买过单次内容，开通通行证还划算吗？
            </summary>
            <p className="mt-2 text-xs leading-6">
              已购买的单次内容仍永久可读。开通通行证后，今后再买灵魂信 / 合盘 / 藏品卡都自动 7 折，月报也不再单独收费。
            </p>
          </details>
          <details className="rounded-xl px-4 py-3" style={{ background: theme.cardSurface, borderWidth: 1, borderStyle: 'solid', borderColor: theme.cardBorder }}>
            <summary className="cursor-pointer" style={{ color: theme.text }}>
              换设备 / 清缓存后通行证还在吗？
            </summary>
            <p className="mt-2 text-xs leading-6">
              注册账号后跨设备同步；未注册的设备需用相同浏览器或重新登录。所有订单都在我们服务端有记录，可随时找客服恢复。
            </p>
          </details>
          <details className="rounded-xl px-4 py-3" style={{ background: theme.cardSurface, borderWidth: 1, borderStyle: 'solid', borderColor: theme.cardBorder }}>
            <summary className="cursor-pointer" style={{ color: theme.text }}>
              不想用了能退款吗？
            </summary>
            <p className="mt-2 text-xs leading-6">
              开通后 7 天内未享受任何专属权益的话可全额退款；已经使用过月报 / 藏品卡的部分按比例扣除，剩余金额原路退回。
            </p>
          </details>
        </div>

        <p
          className="mt-10 text-center text-[11px]"
          style={{ color: theme.textSubtle }}
        >
          支付完成后会回到本页 · 通行证立即生效
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  pass,
  single,
  theme,
}: {
  label: string;
  pass: string;
  single: string;
  theme: ReturnType<typeof useMystiTheme>['theme'];
}) {
  return (
    <>
      <div style={{ color: theme.textMuted }}>{label}</div>
      <div style={{ color: theme.accentGold }}>{pass}</div>
      <div style={{ color: theme.textMuted }}>{single}</div>
    </>
  );
}

export function MystiSubscribeContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D17] text-[#F3EFE6]">
          加载中…
        </div>
      }
    >
      <SubscribeInner />
    </Suspense>
  );
}
