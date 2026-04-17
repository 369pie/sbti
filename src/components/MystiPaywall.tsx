'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import {
  isUnlocked,
  recordUnlock,
  SKU_PRICES,
  type MystiSku,
} from '@/lib/mysti/unlock';
import { getActiveReferralCode } from '@/lib/mysti/creator-referral';
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
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked(sku, resourceId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');

  const meta = SKU_PRICES[sku];

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    setError(null);
    // event placeholder（analytics events 需在 trackMystiEvent 中注册类型）
    try {
      const ref = getActiveReferralCode() || undefined;
      const redirect =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/mysti/';
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, resourceId, paymentType, ref, redirect }),
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

      // Stub 模式：直接走假成功
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
            trackMystiEvent('mysti_test_complete', {
              kind: 'paywall_unlock_stub',
              sku,
              resourceId,
            });
          } catch {/* noop */}
          return;
        }
      }

      // Live 模式：跳到虎皮椒
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

  return (
    <div className="relative">
      {/* 模糊预览 */}
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

        {/* 解锁覆盖层 */}
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
            style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
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
            className="text-sm mb-5"
            style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
          >
            {meta.label} · ¥{meta.price.toFixed(1)}
          </p>

          {/* 支付方式 */}
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
            {loading ? '正在创建订单…' : `✦ 解锁 · ¥${meta.price.toFixed(1)}`}
          </button>

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

          <p
            className="mt-4 text-[11px]"
            style={{ color: theme.textSubtle }}
          >
            一次性付费 · 终身解锁 · 支持微信 / 支付宝
          </p>
        </motion.div>
      </div>
    </div>
  );
}
