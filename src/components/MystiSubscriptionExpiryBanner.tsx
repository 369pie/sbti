'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  daysUntilExpiry,
  getActiveSubscription,
} from '@/lib/mysti/subscription';
import { trackMystiEvent } from '@/lib/mysti/analytics';

interface InitialState {
  days: number | null;
  sku: string | null;
  dismissKey: string;
  dismissed: boolean;
}

function readInitialState(): InitialState {
  if (typeof window === 'undefined') {
    return { days: null, sku: null, dismissKey: '', dismissed: false };
  }
  const sub = getActiveSubscription();
  if (!sub) return { days: null, sku: null, dismissKey: '', dismissed: false };
  const days = daysUntilExpiry();
  const dismissKey = `mysti-expiry-banner-dismissed-${sub.sku}-${sub.expiresAt}`;
  let dismissed = false;
  try {
    dismissed = window.localStorage.getItem(dismissKey) === '1';
  } catch {
    /* swallow */
  }
  return { days, sku: sub.sku, dismissKey, dismissed };
}

/**
 * Top-of-screen reminder banner shown when an active subscription is within
 * 7 days of expiry. Dismissible per (sku+expiresAt) so renewals reset it.
 */
export function MystiSubscriptionExpiryBanner() {
  const [state, setState] = useState<InitialState>(readInitialState);
  const { days, sku, dismissKey, dismissed } = state;

  if (days === null || dismissed || days > 7 || days <= 0) return null;

  const handleDismiss = () => {
    setState(prev => ({ ...prev, dismissed: true }));
    try {
      if (dismissKey) window.localStorage.setItem(dismissKey, '1');
    } catch {
      /* swallow */
    }
  };

  const tone =
    days <= 1
      ? { bg: 'rgba(255, 100, 100, 0.16)', accent: '#FFB8B8' }
      : days <= 3
        ? { bg: 'rgba(255, 196, 100, 0.16)', accent: '#FFD89A' }
        : { bg: 'rgba(180, 200, 255, 0.14)', accent: '#CFE0FF' };

  return (
    <div
      className="fixed top-0 inset-x-0 z-40 px-4 py-2 text-xs sm:text-sm text-center backdrop-blur"
      style={{
        background: tone.bg,
        color: tone.accent,
        borderBottom: `1px solid ${tone.accent}33`,
      }}
      role="status"
      aria-live="polite"
    >
      <span className="opacity-90">
        通行证还剩 <b>{days}</b> 天到期
        {sku ? ` · ${labelFor(sku)}` : ''} ·{' '}
      </span>
      <Link
        href="/mysti/subscribe/?from=expiry"
        className="underline font-medium"
        onClick={() => {
          try {
            trackMystiEvent('mysti_subscribe_view', {
              source: 'expiry_banner',
              days,
              sku,
            });
          } catch {
            /* noop */
          }
        }}
      >
        续费 / 升级
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="关闭"
        className="ml-3 opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

function labelFor(sku: string): string {
  switch (sku) {
    case 'monthly-pass':
      return '月度通行证';
    case 'quarterly-pass':
      return '季度通行证';
    case 'yearly-pass':
      return '年度通行证';
    case 'creator-pass':
      return '创作者通行证';
    default:
      return sku;
  }
}
