'use client';

/**
 * P3 ¥19/月会员 CTA — journal/velvet skin.
 * Wires existing /api/mysti/payment/create (monthly-pass + xunhupay).
 * Explicit: 到期不自动续费（no dark-pattern auto-renew）.
 */

import { trackMemberEvent } from '@/lib/member-client';
import { useCallback, useState } from 'react';

import { readApiJson } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/mysti/device';
import { HER_MEMBERSHIP_MONTHLY_SKU, MEMBERSHIP_BENEFITS } from '@/lib/her/membership-benefits';
import { getPaymentAvailabilityStatus } from '@/lib/payment/availability';

type Props = {
  /** Where to return after pay */
  redirectPath: string;
  /** Visual skin class on outer card */
  skin?: 'journal' | 'velvet';
  /** Compact inline (today card footer) vs full card */
  variant?: 'inline' | 'card';
  /** Already a member */
  isMember?: boolean;
  expiresAt?: string | null;
  className?: string;
};

export function MembershipSubscribeCard({
  redirectPath,
  skin = 'journal',
  variant = 'card',
  isMember = false,
  expiresAt = null,
  className = '',
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');

  const startPay = useCallback(async () => {
    const availability = getPaymentAvailabilityStatus();
    if (availability.blocked) {
      setError(availability.message);
      return;
    }
    setLoading(true);
    setError(null);
    trackMemberEvent('member_checkout_start', { sku: HER_MEMBERSHIP_MONTHLY_SKU, paymentType, redirect: redirectPath });
    try {
      const deviceId = getOrCreateDeviceId() || undefined;
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sku: HER_MEMBERSHIP_MONTHLY_SKU,
          resourceId: 'subscription',
          paymentType,
          deviceId,
          redirect: redirectPath,
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
        throw new Error(data.message || data.error || '下单失败，请稍后再试');
      }
      // Prod must never silently stub-unlock; only follow URL (stub return only in non-prod).
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [paymentType, redirectPath]);

  if (isMember) {
    const expLabel = expiresAt
      ? new Date(expiresAt).toLocaleDateString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;
    return (
      <section className={`s-card ${className}`} data-membership="active">
        <div className="s-tape s-tape--sage" />
        <p className="s-eyebrow">会员 · 生效中</p>
        <h2 className="s-title" style={{ fontSize: 18, margin: '4px 0 8px' }}>
          你的会员还在
        </h2>
        <p style={{ fontSize: 13, color: 'var(--s-ink-2)', margin: '0 0 8px', lineHeight: 1.6 }}>
          {expLabel ? `有效期至 ${expLabel}（上海时区）` : '权益生效中'}
          。到期后需手动续费，我们不会自动扣款。
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--s-ink-2)', lineHeight: 1.7 }}>
          {MEMBERSHIP_BENEFITS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    );
  }

  const body = (
    <>
      <p className="s-eyebrow">{skin === 'velvet' ? 'Membership · ¥19/月' : '解锁完整今日 · 会员'}</p>
      <h2 className="s-title" style={{ fontSize: variant === 'inline' ? 16 : 18, margin: '4px 0 8px' }}>
        {variant === 'inline' ? '开通会员 · ¥19/月' : '懂你多一点 · ¥19/月'}
      </h2>
      <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, color: 'var(--s-ink-2)', lineHeight: 1.7 }}>
        {MEMBERSHIP_BENEFITS.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p style={{ fontSize: 12, color: 'var(--s-mute)', margin: '0 0 12px' }}>
        一次开通 30 天 · <strong style={{ color: 'var(--s-ink-2)', fontWeight: 500 }}>到期不自动续费</strong>
        ，续费需你主动点
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          className="s-btn"
          style={{
            flex: 1,
            opacity: paymentType === 'wechat' ? 1 : 0.55,
            maxWidth: 'none',
          }}
          onClick={() => setPaymentType('wechat')}
        >
          微信
        </button>
        <button
          type="button"
          className="s-btn"
          style={{
            flex: 1,
            opacity: paymentType === 'alipay' ? 1 : 0.55,
            maxWidth: 'none',
            background: paymentType === 'alipay' ? 'var(--s-accent)' : undefined,
          }}
          onClick={() => setPaymentType('alipay')}
        >
          支付宝
        </button>
      </div>
      <button
        type="button"
        className="s-btn"
        style={{ width: '100%', maxWidth: 'none' }}
        disabled={loading}
        onClick={() => void startPay()}
      >
        {loading ? '正在打开支付…' : `确认开通 · ¥19（${paymentType === 'wechat' ? '微信' : '支付宝'}）`}
      </button>
      {error ? (
        <p style={{ marginTop: 10, fontSize: 12, color: '#a14a4a' }} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );

  if (variant === 'inline') {
    return (
      <div className={className} data-membership="cta-inline" style={{ marginTop: 12 }}>
        {body}
      </div>
    );
  }

  return (
    <section className={`s-card ${className}`} data-membership="cta">
      <div className={skin === 'velvet' ? 's-tape' : 's-tape s-tape--peach'} />
      {body}
    </section>
  );
}
