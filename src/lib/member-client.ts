'use client';

/**
 * Client helpers for the site-wide membership: status hook + tracking.
 * Events (product_events module `member`): member_entry_click {source},
 * member_page_view, member_checkout_start, quota_exhausted {feature}.
 */

import { useEffect, useState } from 'react';

import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { featureConfig } from '@/lib/entitlements';
import { getOrCreateDeviceId } from '@/lib/mysti/device';

export interface FeatureUsageView {
  key: string;
  label: string;
  used: number | null;
  cap: number | null;
  remaining: number | null;
}

export interface EntitlementsView {
  ok?: boolean;
  claimed?: boolean;
  isMember?: boolean;
  expiresAt?: string | null;
  source?: 'her_profiles' | 'legacy_pass' | null;
  usage?: FeatureUsageView[];
}

let cache: Promise<EntitlementsView> | null = null;

export function fetchEntitlements(force = false): Promise<EntitlementsView> {
  if (cache && !force) return cache;
  const deviceId = (typeof window !== 'undefined' && getOrCreateDeviceId()) || '';
  cache = fetch(`/api/entitlements/?deviceId=${encodeURIComponent(deviceId)}`, { credentials: 'include', cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<EntitlementsView>) : { ok: false }))
    .then((d: EntitlementsView) => {
      // Mirror server membership into localStorage so sync isUnlocked() gates honour it.
      try {
        const exp = d.isMember ? Date.parse(String(d.expiresAt ?? '')) || Date.now() + 86400000 : 0;
        if (d.ok !== false) {
          if (exp) window.localStorage.setItem('wtfti-member-until', String(exp));
          else if (d.ok) window.localStorage.removeItem('wtfti-member-until');
        }
      } catch {
        /* noop */
      }
      return d;
    })
    .catch(() => ({ ok: false }));
  return cache;
}

export function useEntitlements(): EntitlementsView | null {
  const [v, setV] = useState<EntitlementsView | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchEntitlements().then((d) => alive && setV(d));
    return () => {
      alive = false;
    };
  }, []);
  return v;
}

export function memberHref(source: string): string {
  return `/member/?from=${encodeURIComponent(source)}`;
}

export function trackMemberEntry(source: string): void {
  enqueueProductEvent('member', 'member_entry_click', { step: 'entry', props: { source } });
}

export function trackMemberEvent(event: 'member_page_view' | 'member_checkout_start', props?: Record<string, string | number | boolean | undefined>): void {
  enqueueProductEvent('member', event, { step: event === 'member_page_view' ? 'view' : 'checkout', props });
}

type QuotaPayload = { feature?: string; cap?: number | null; isMember?: boolean };

export function trackQuotaExhausted(data: unknown): void {
  const d = (data ?? {}) as QuotaPayload;
  enqueueProductEvent('member', 'quota_exhausted', { step: 'quota', props: { feature: d.feature, cap: d.cap ?? undefined, member: !!d.isMember } });
}

export function quotaMessage(data: unknown): string {
  const d = (data ?? {}) as QuotaPayload;
  const label = (d.feature && featureConfig(d.feature)?.label.replace(/^美我 · /, '')) || '这个功能';
  return d.isMember
    ? `本月${label}的 ${d.cap ?? ''} 次会员额度用完了，下个月 1 号恢复`
    : `本月免费的 ${d.cap ?? ''} 次${label}用完了 · 开会员每月 ${featureConfig(d.feature ?? '')?.member ?? ''} 次（/member/）`;
}
