'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import {
  isUnlocked,
  recordUnlock,
  SKU_PRICES,
  type MystiSku,
} from '@/lib/mysti/unlock';
import {
  isSubscriber,
  passCoversSingleSku,
  passDiscountForSku,
} from '@/lib/mysti/subscription';
import { getActiveReferralCode } from '@/lib/mysti/creator-referral';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { trackMystiEvent } from '@/lib/mysti/analytics';

interface Props {
  sku: MystiSku;
  resourceId: string;
  /** 解锁前展示的标题 */
  lockedTitle: string;
  /** 锁定状态下展示的预览 */
  preview: React.ReactNode;
  /** 解锁后展示的内容 */
  children: React.ReactNode;
}

export function MystiPaywall({
  sku,
  resourceId,
  lockedTitle,
  preview,
  children,
}: Props) {
  const { theme } = useMystiTheme();
  const [unlocked, setUnlocked] = useState<boolean>(() =>
    isUnlocked(sku, resourceId),
  );
  const [hasPass, setHasPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');

  const meta = SKU_PRICES[sku];
  const passCovers = passCoversSingleSku(sku);
  const passDiscount = passDiscountForSku(sku);
  const discountedPrice = +(meta.price * (1 - passDiscount)).toFixed(2);

  // 订阅会员权益：hydrate 后检查
  useEffect(() => {
    const subscribed = isSubscriber();
    setHasPass(subscribed);
    if (subscribed && passCovers && !unlocked) {
      setUnlocked(true);
      try {
        trackMystiEvent('mysti_paywall_pass_unlocked', { sku, resourceId });
      } catch {
        /* noop */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 首次看到 paywall
  useEffect(() => {
    if (!unlocked) {
      try {
        trackMystiEvent('mysti_paywall_view', { sku, resourceId });
      } catch {
        /* noop */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku, resourceId]);

  // 离开 / 切走但未购买 → dismiss（用于 paywall 漏斗的流失节点）
  // 用 ref 跟踪 initiate / unlocked 的最终状态，避免把"已点购买"也算成 dismiss
  const initiatedRef = useRef(false);
  const dismissedRef = useRef(false);
  const unlockedRef = useRef(unlocked);
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fireDismiss = (reason: 'unmount' | 'visibility' | 'pagehide') => {
      if (unlockedRef.current || initiatedRef.current || dismissedRef.current) return;
      dismissedRef.current = true;
      try {
        trackMystiEvent('mysti_paywall_dismiss', { sku, resourceId, reason });
      } catch {
        /* noop */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        fireDismiss('visibility');
      }
    };
    const onPageHide = () => fireDismiss('pagehide');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      fireDismiss('unmount');
    };
  }, [sku, resourceId]);

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    setError(null);
    initiatedRef.current = true;
    try {
      trackMystiEvent('mysti_paywall_initiate', {
        sku,
        resourceId,
        paymentType,
      });
    } catch {
      /* noop */
    }
    try {
      const ref = getActiveReferralCode() || undefined;
      const deviceId = getOrCreateDeviceId() || undefined;
      const redirect = (() => {
        if (typeof window === 'undefined') return '/mysti/';
        const pathname = window.location.pathname;
        const search = window.location.search;
        // 把 ?unlocked={sku} 拼进回跳，这样支付完成回到原页面时
        // 可被对应组件（如 MystiShareImageGenerator）感知并自动呈现已解锁内容。
        if (search.includes('unlocked=')) return `${pathname}${search}`;
        const sep = search ? '&' : '?';
        return `${pathname}${search}${sep}unlocked=${encodeURIComponent(sku)}`;
      })();
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, resourceId, paymentType, ref, deviceId, redirect }),
      });
      const data = (await res.json()) as {
        url?: string;
        orderId?: string;
        stub?: boolean;
        error?: string;
      };
      if (!res.ok || !data.url || !data.orderId) {
        throw new Error(data.error || 'create_failed');
      }

      if (data.stub) {
        const verify = await fetch(
          `/api/mysti/payment/verify?orderId=${encodeURIComponent(data.orderId)}&stub=1`,
        );
        const vj = (await verify.json()) as { paid?: boolean; token?: string };
        if (vj.paid) {
          recordUnlock({
            sku,
            resourceId,
            orderId: data.orderId,
            unlockedAt: Date.now(),
            token: vj.token,
          });
          setUnlocked(true);
          try {
            trackMystiEvent('mysti_paywall_success', {
              sku,
              resourceId,
              stub: true,
            });
          } catch {
            /* noop */
          }
          return;
        }
      }

      window.location.href = data.url;
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [sku, resourceId, paymentType]);

  if (unlocked) {
    return <>{children}</>;
  }

  const finalPrice = passDiscount > 0 && hasPass ? discountedPrice : meta.price;

  return (
    <div className="relative">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: theme.cardSurface,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: theme.cardBorder,
        }}
      >
        <div
          className="p-6 select-none pointer-events-none"
          style={{ filter: 'blur(6px)', opacity: 0.55 }}
          aria-hidden
        >
          {preview}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{
            background: `linear-gradient(180deg, ${theme.bg}cc 0%, ${theme.bgGradient[1]}ee 80%)`,
          }}
        >
          <div
            className="text-5xl mb-3"
            style={{
              color: theme.accentGold,
              fontFamily: 'var(--font-display)',
            }}
          >
            ✦
          </div>
          <h3
            className="text-xl mb-2"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            {lockedTitle}
          </h3>
          <p
            className="text-sm mb-1"
            style={{
              color: theme.textMuted,
              fontFamily: 'var(--font-serif)',
            }}
          >
            {meta.label}
          </p>

          {passDiscount > 0 ? (
            <p className="text-xs mb-5" style={{ color: theme.textSubtle }}>
              <s>¥{meta.price.toFixed(1)}</s>{' '}
              <span style={{ color: theme.accentGold }}>
                会员价 ¥{discountedPrice.toFixed(1)}
              </span>
              {!hasPass && (
                <>
                  {' · '}
                  <Link
                    href={`/mysti/subscribe/?from=${encodeURIComponent(sku)}`}
                    className="underline"
                    style={{ color: theme.accent }}
                    onClick={() => {
                      try {
                        trackMystiEvent('mysti_subscribe_view', {
                          source: 'paywall',
                          sku,
                        });
                      } catch {
                        /* noop */
                      }
                    }}
                  >
                    以后全部 7 折
                  </Link>
                </>
              )}
            </p>
          ) : (
            <p className="text-sm mb-5" style={{ color: theme.textMuted }}>
              ¥{meta.price.toFixed(1)}
            </p>
          )}

          <div className="flex gap-2 mb-4">
            {(['wechat', 'alipay'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPaymentType(p)}
                className="px-4 py-2 rounded-full text-xs transition-all"
                style={{
                  background:
                    paymentType === p ? theme.accentSoft : 'transparent',
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

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full max-w-xs py-3.5 rounded-xl text-sm tracking-wider transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-wait"
            style={{
              background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
              color: '#fff',
              fontFamily: 'var(--font-serif)',
              boxShadow: `0 8px 24px ${theme.cardGlow}`,
            }}
          >
            {loading
              ? '正在创建订单…'
              : `✦ 解锁 · ¥${finalPrice.toFixed(1)}`}
          </button>

          {!hasPass && (passCovers || passDiscount > 0) && (
            <Link
              href={`/mysti/subscribe/?from=${encodeURIComponent(sku)}`}
              onClick={() => {
                try {
                  trackMystiEvent('mysti_subscribe_view', {
                    source: 'paywall_upsell',
                    sku,
                  });
                } catch {
                  /* noop */
                }
              }}
              className="mt-3 text-[11px] underline opacity-80 hover:opacity-100"
              style={{ color: theme.accent }}
            >
              {passCovers
                ? '¥ 19 开通月度通行证 · 本 SKU 免费 + 以后全 7 折'
                : '¥ 19 开通月度通行证 · 以后全 7 折'}
            </Link>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs"
                style={{ color: '#FFB1B1' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="mt-4 text-[11px]" style={{ color: theme.textSubtle }}>
            一次性付费 · 终身解锁 · 支持微信 / 支付宝
          </p>
        </motion.div>
      </div>
    </div>
  );
}
