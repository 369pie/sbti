'use client';

/**
 * DecisionPackPaywall — 决策快卡场景包专用销售卡
 *
 * 与 PremiumPaywall 的区别：
 * - 不包裹"模糊预览 + 解锁内容"——只是一个独立销售卡
 * - 出现在 /mysti/decision/[scenario]/ 配额耗尽时
 * - 也用于 /mysti/decision/ 入口页的升级 banner
 *
 * 复用 /api/mysti/payment/create + recordUnlock 链路；
 * 视觉与 Editorial Atelier × 暮光博物笔记 体系对齐。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  recordUnlock,
  SKU_PRICES,
  isUnlocked,
} from '@/lib/mysti/unlock';
import { getPaymentAvailabilityStatus } from '@/lib/payment/availability';
import { getActiveReferralCode } from '@/lib/mysti/creator-referral';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import { readApiJson } from '@/lib/api';
import { restoreMystiEntitlement } from '@/lib/mysti/entitlement-restore';

interface Props {
  /** 解锁后回调（父组件用来刷新配额状态） */
  onUnlocked?: () => void;
  /** decision-pack 的资源 id；默认 'global'（场景共享） */
  resourceId?: string;
  /** 入口页 banner 模式：稍微淡化、横向 */
  variant?: 'inline' | 'banner';
  /** 自定义副标题 */
  subtitle?: string;
}

const SKU = 'decision-pack' as const;

export function DecisionPackPaywall({
  onUnlocked,
  resourceId = 'global',
  variant = 'inline',
  subtitle,
}: Props) {
  const meta = SKU_PRICES[SKU];
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked(SKU, resourceId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (unlocked) return;
    let cancelled = false;

    const restore = async () => {
      try {
        const result = await restoreMystiEntitlement({ sku: SKU, resourceId });
        if (cancelled || !result.restored) return;
        setUnlocked(true);
        onUnlocked?.();
        trackMystiEvent('mysti_paywall_success', {
          sku: SKU,
          resourceId,
          brand: 'mysti',
          source: 'restore',
        });
      } catch {
        // noop
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, [unlocked, resourceId, onUnlocked]);

  useEffect(() => {
    if (unlocked) return;
    try {
      trackMystiEvent('mysti_paywall_view', {
        sku: SKU,
        resourceId,
        brand: 'mysti',
      });
    } catch {
      /* noop */
    }
  }, [unlocked, resourceId]);

  const handlePurchase = useCallback(async () => {
    const avail = getPaymentAvailabilityStatus();
    if (avail.blocked) {
      setError(avail.message);
      return;
    }
    setLoading(true);
    setError(null);
    initiatedRef.current = true;
    try {
      trackMystiEvent('mysti_paywall_initiate', {
        sku: SKU,
        resourceId,
        brand: 'mysti',
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
        const sep = search ? '&' : '?';
        return `${pathname}${search}${sep}unlocked=${encodeURIComponent(SKU)}`;
      })();
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: SKU,
          resourceId,
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
            sku: SKU,
            resourceId,
            orderId: data.orderId,
            unlockedAt: Date.now(),
            token: vj.token,
          });
          setUnlocked(true);
          onUnlocked?.();
          try {
            trackMystiEvent('mysti_paywall_success', {
              sku: SKU,
              resourceId,
              brand: 'mysti',
              stub: true,
            });
          } catch {
            /* noop */
          }
          return;
        }
      }

      // Real-payment flow → jump out to xunhupay-hosted page
      if (typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      setError(`下单失败：${msg}`);
    } finally {
      setLoading(false);
    }
  }, [paymentType, resourceId, onUnlocked]);

  if (unlocked) {
    return null;
  }

  const isBanner = variant === 'banner';

  return (
    <div
      style={{
        marginTop: 8,
        padding: isBanner ? '20px 22px' : '28px 24px',
        borderRadius: 18,
        border: '1px solid rgba(201,166,118,0.42)',
        background:
          'linear-gradient(160deg, rgba(48,32,72,0.94) 0%, rgba(31,21,48,0.96) 100%)',
        boxShadow: '0 24px 56px -28px rgba(192,122,142,0.42)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        color: '#F5F0E8',
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
        DECISION PACK · 场景包
      </div>
      <h3
        style={{
          fontSize: isBanner ? 22 : 24,
          lineHeight: 1.25,
          fontWeight: 600,
          letterSpacing: '0.02em',
          fontFamily:
            'var(--font-display, "Cormorant Garamond"), "Noto Serif SC", serif',
        }}
      >
        本月配额已到 ·{' '}
        <em style={{ fontStyle: 'italic', color: '#C07A8E' }}>
          解锁今晚的下一张
        </em>
      </h3>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: 'rgba(245,240,232,0.72)',
        }}
      >
        {subtitle ??
          '暮光每月只发给你 3 张免费的牌——再多一次都需要你点头。'}
      </p>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 12.5,
          color: 'rgba(245,240,232,0.78)',
        }}
      >
        {[
          '✦ 30 天内 +8 次抽签（共 11 次）',
          '✦ 解锁「高级金句池」更长更隐喻',
          '✦ 全 5 场景共享 · 不限单一场景',
        ].map((line) => (
          <li key={line} style={{ letterSpacing: '0.02em' }}>
            {line}
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 6,
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontFamily:
              'var(--font-display, "Cormorant Garamond"), serif',
            fontWeight: 600,
            color: '#C9A676',
            letterSpacing: '0.02em',
          }}
        >
          ¥{meta.price}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.55)' }}>
          / 30 天 · {meta.tagline}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {(['wechat', 'alipay'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPaymentType(p)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 999,
              fontSize: 12,
              letterSpacing: '0.18em',
              border:
                paymentType === p
                  ? '1px solid rgba(201,166,118,0.78)'
                  : '1px solid rgba(245,240,232,0.18)',
              background:
                paymentType === p ? 'rgba(201,166,118,0.14)' : 'transparent',
              color:
                paymentType === p ? '#F5F0E8' : 'rgba(245,240,232,0.55)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {p === 'wechat' ? '微信' : '支付宝'}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading}
        style={{
          marginTop: 4,
          padding: '14px 22px',
          fontSize: 15,
          letterSpacing: '0.16em',
          color: '#1a1530',
          background:
            'linear-gradient(135deg, #C9A676 0%, #C07A8E 100%)',
          border: 'none',
          borderRadius: 999,
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? '正在创建订单…' : `✦ ¥${meta.price} 解锁 · 30 天 +8 次`}
      </button>

      {error && (
        <p
          style={{
            fontSize: 12,
            color: '#C07A8E',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
