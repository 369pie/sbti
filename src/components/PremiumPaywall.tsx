'use client';

/**
 * PremiumPaywall — brand-agnostic locked-content gate.
 *
 * Shares the same payment pipeline as `MystiPaywall` (xunhupay → recordUnlock
 * via /api/mysti/payment/create + /verify) but accepts an explicit `theme`
 * + `brand` so non-mysti modules don't need to mount MystiThemeProvider.
 *
 * The `MystiPaywall` component now renders this internally with
 * the live mysti v2 theme, so behavior for existing mysti pages is unchanged.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  isUnlocked,
  recordUnlock,
  SKU_PRICES,
  type MystiSku,
} from '@/lib/mysti/unlock';
import { getPaymentAvailabilityStatus } from '@/lib/payment/availability';
import {
  isSubscriber,
  passCoversSingleSku,
  passDiscountForSku,
  syncSubscriptionFromServer,
} from '@/lib/mysti/subscription';
import { getActiveReferralCode } from '@/lib/mysti/creator-referral';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import { readApiJson } from '@/lib/api';
import { restoreMystiEntitlement } from '@/lib/mysti/entitlement-restore';
import {
  BRAND_THEMES,
  type PaywallBrand,
  type PaywallTheme,
} from '@/lib/payments/brand-themes';

interface Props {
  /** Module SKU; must be a member of the MystiSku union. */
  sku: MystiSku;
  /** Stable `${universe}:${slug}` resource identifier. */
  resourceId: string;
  /** Brand for analytics + default theme lookup. */
  brand: PaywallBrand;
  /** Locked-state title shown above the price. */
  lockedTitle: string;
  /** Blurred preview content shown behind the overlay. */
  preview: React.ReactNode;
  /** Unlocked content (rendered when paid or via subscription). */
  children: React.ReactNode;
  /** Optional theme override (mysti wrapper passes its dynamic theme). */
  theme?: PaywallTheme;
  /** Optional teaser bullets shown below the price (max ~3). */
  teaserBullets?: string[];
}

export function PremiumPaywall({
  sku,
  resourceId,
  brand,
  lockedTitle,
  preview,
  children,
  theme: themeProp,
  teaserBullets,
}: Props) {
  const theme: PaywallTheme = themeProp
    ?? (brand === 'mysti'
      // Mysti callers should pass themeProp; if missing, fall back to wtfti
      // styling rather than crash.
      ? BRAND_THEMES.wtfti
      : BRAND_THEMES[brand]);

  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked(sku, resourceId));
  const [hasPass, setHasPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');

  const meta = SKU_PRICES[sku];
  const passCovers = passCoversSingleSku(sku);
  const passDiscount = passDiscountForSku(sku);
  const discountedPrice = +(meta.price * (1 - passDiscount)).toFixed(2);

  // Subscription benefit hydration
  useEffect(() => {
    const subscribed = isSubscriber();
    setHasPass(subscribed);
    if (subscribed && passCovers && !unlocked) {
      setUnlocked(true);
      try {
        trackMystiEvent('mysti_paywall_pass_unlocked', { sku, resourceId, brand });
      } catch {
        /* noop */
      }
    }
    syncSubscriptionFromServer({ force: true })
      .then((sub) => {
        if (!sub) return;
        setHasPass(true);
        if (
          isSubscriber() &&
          passCoversSingleSku(sku) &&
          !unlockedRef.current
        ) {
          setUnlocked(true);
          try {
            trackMystiEvent('mysti_paywall_pass_unlocked', { sku, resourceId, brand });
          } catch {
            /* noop */
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore server-side purchases when the success return page failed before it
  // could write the local unlock envelope.
  useEffect(() => {
    if (unlocked) return;

    let cancelled = false;
    const deviceId = getOrCreateDeviceId() || undefined;
    if (!deviceId) return;

    const restore = async () => {
      try {
        const restored = await restoreMystiEntitlement({ sku, resourceId, deviceId });
        if (cancelled || !restored.restored) return;
        setUnlocked(true);
        try {
          trackMystiEvent('mysti_paywall_success', {
            sku,
            resourceId,
            brand,
            source: 'restore',
          });
        } catch {
          /* noop */
        }
      } catch {
        // Restore is a quiet convenience path; the explicit purchase button
        // remains available if no matching paid order exists.
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, [unlocked, sku, resourceId, brand]);

  // First view tracking
  useEffect(() => {
    if (!unlocked) {
      try {
        trackMystiEvent('mysti_paywall_view', { sku, resourceId, brand });
      } catch {
        /* noop */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku, resourceId]);

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
        trackMystiEvent('mysti_paywall_dismiss', { sku, resourceId, brand, reason });
      } catch {
        /* noop */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') fireDismiss('visibility');
    };
    const onPageHide = () => fireDismiss('pagehide');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      fireDismiss('unmount');
    };
  }, [sku, resourceId, brand]);

  const handlePurchase = useCallback(async () => {
    const paymentAvailability = getPaymentAvailabilityStatus();
    if (paymentAvailability.blocked) {
      setError(paymentAvailability.message);
      return;
    }

    setLoading(true);
    setError(null);
    initiatedRef.current = true;
    try {
      trackMystiEvent('mysti_paywall_initiate', {
        sku,
        resourceId,
        brand,
        paymentType,
      });
    } catch {
      /* noop */
    }
    try {
      const ref = getActiveReferralCode() || undefined;
      const deviceId = getOrCreateDeviceId() || undefined;
      const redirect = (() => {
        if (typeof window === 'undefined') return '/';
        const pathname = window.location.pathname;
        const search = window.location.search;
        if (search.includes('unlocked=')) return `${pathname}${search}`;
        const sep = search ? '&' : '?';
        return `${pathname}${search}${sep}unlocked=${encodeURIComponent(sku)}`;
      })();
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, resourceId, paymentType, ref, deviceId, redirect }),
      });
      const data = await readApiJson<{
        url?: string;
        orderId?: string;
        stub?: boolean;
        error?: string;
        message?: string;
      }>(res);
      if (!res.ok || !data.url || !data.orderId) {
        throw new Error(data.message || data.error || 'create_failed');
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
              brand,
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
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [sku, resourceId, brand, paymentType]);

  if (unlocked) {
    return <div data-paywall="unlocked">{children}</div>;
  }

  const finalPrice = passDiscount > 0 && hasPass ? discountedPrice : meta.price;
  const lockedMinHeightClass = teaserBullets && teaserBullets.length > 0
    ? 'min-h-[420px] sm:min-h-[400px]'
    : 'min-h-[360px] sm:min-h-[340px]';

  return (
    <div className="relative" data-paywall="locked" data-paywall-brand={brand} data-paywall-sku={sku}>
      <div
        className={`relative rounded-2xl overflow-hidden ${lockedMinHeightClass}`}
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
          className="absolute inset-0 px-6 text-center"
          style={{
            background: `linear-gradient(180deg, ${theme.bg}cc 0%, ${theme.bgGradientEnd}ee 80%)`,
          }}
        >
          <div className="h-full overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center py-5">
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
                  fontFamily: 'var(--font-display)',
                }}
              >
                {meta.label}
              </p>

              {teaserBullets && teaserBullets.length > 0 && (
                <ul
                  className="mt-3 mb-3 text-xs space-y-1"
                  style={{ color: theme.textMuted }}
                >
                  {teaserBullets.slice(0, 3).map((b, i) => (
                    <li key={i}>· {b}</li>
                  ))}
                </ul>
              )}

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
                              brand,
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
                      background: paymentType === p ? theme.accentSoft : 'transparent',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: paymentType === p ? theme.accent : theme.cardBorder,
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
                  color: 'var(--color-bg-primary)',
                  fontFamily: 'var(--font-display)',
                  boxShadow: `0 8px 24px ${theme.cardGlow}`,
                }}
              >
                {loading ? '正在创建订单…' : `✦ 解锁 · ¥${finalPrice.toFixed(1)}`}
              </button>

              {!hasPass && (passCovers || passDiscount > 0) && (
                <Link
                  href={`/mysti/subscribe/?from=${encodeURIComponent(sku)}`}
                  onClick={() => {
                    try {
                      trackMystiEvent('mysti_subscribe_view', {
                        source: 'paywall_upsell',
                        sku,
                        brand,
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
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="mt-4 text-[11px]" style={{ color: theme.textSubtle }}>
                一次性付费 · 终身解锁 · 支持微信 / 支付宝
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
