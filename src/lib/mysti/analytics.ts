import { enqueueProductEvent } from '@/lib/analytics/product-events';

type AnalyticsPrimitive = string | number | boolean | null;

type MystiEvent =
  | 'mysti_test_start'
  | 'mysti_test_complete'
  | 'mysti_share_generate'
  | 'mysti_share_download'
  | 'mysti_share_native'
  | 'mysti_dual_view'
  | 'mysti_daily_view'
  | 'mysti_daily_share'
  | 'mysti_return_landing'
  | 'mysti_return_complete'
  | 'mysti_gacha_view'
  | 'mysti_gacha_draw'
  | 'mysti_gacha_result'
  | 'mysti_gacha_share'
  | 'mysti_share_tier_unlock_click'
  // ── Monetization v2 (2026-04-18) ──
  | 'mysti_paywall_view'
  | 'mysti_paywall_initiate'
  | 'mysti_paywall_success'
  | 'mysti_paywall_dismiss'
  | 'mysti_paywall_pass_unlocked'
  | 'mysti_subscribe_view'
  | 'mysti_subscribe_initiate'
  | 'mysti_subscribe_success'
  | 'mysti_subscribe_dismiss'
  | 'mysti_gift_cta_click'
  | 'mysti_gift_purchase_initiate'
  | 'mysti_gift_purchase_success'
  | 'mysti_daily_bonus_pull'
  // ── Decision Quick-Card v1 (2026-04-21) ──
  | 'mysti_decision_entry'
  | 'mysti_decision_quota_consume'
  | 'mysti_decision_pick'
  | 'mysti_decision_share'
  | 'mysti_decision_archive';

function isAnalyticsPrimitive(value: unknown): value is AnalyticsPrimitive {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function getNestedProps(properties?: Record<string, unknown>): Record<string, AnalyticsPrimitive> {
  const raw = properties?.props;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const next: Record<string, AnalyticsPrimitive> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isAnalyticsPrimitive(value)) {
      next[key] = value;
    }
  }
  return next;
}

function toVercelPayload(properties?: Record<string, unknown>): Record<string, AnalyticsPrimitive> | undefined {
  if (!properties) return undefined;

  const next: Record<string, AnalyticsPrimitive> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (key === 'props') continue;
    if (isAnalyticsPrimitive(value)) {
      next[key] = value;
    }
  }

  for (const [key, value] of Object.entries(getNestedProps(properties))) {
    if (!(key in next)) {
      next[key] = value;
    }
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

export function trackMystiEvent(event: MystiEvent, properties?: Record<string, unknown>) {
  const vercelPayload = toVercelPayload(properties);
  const nestedProps = getNestedProps(properties);

  // Try Vercel Analytics first (client-side only) via dynamic import (避免 require)
  if (typeof window !== 'undefined') {
    import('@vercel/analytics')
      .then((mod) => {
        try {
          mod.track?.(event, vercelPayload as Parameters<typeof mod.track>[1]);
        } catch {
          // ignore analytics failures
        }
      })
      .catch(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MystiAnalytics] ${event}`, properties);
        }
      });
  }

  try {
    enqueueProductEvent('mysti', event, {
      slug: typeof properties?.slug === 'string' ? properties.slug : undefined,
      code: typeof properties?.code === 'string' ? properties.code : undefined,
      tier: typeof properties?.tier === 'string' ? properties.tier : undefined,
      step: classifyMystiStep(event),
      ok: typeof properties?.ok === 'boolean' ? properties.ok : undefined,
      value: typeof properties?.value === 'number' ? properties.value : undefined,
      props: {
        ...nestedProps,
        sku: typeof properties?.sku === 'string' ? properties.sku : undefined,
        partner: typeof properties?.partner === 'string' ? properties.partner : undefined,
        paymentType: typeof properties?.paymentType === 'string' ? properties.paymentType : undefined,
        source: typeof properties?.source === 'string' ? properties.source : undefined,
        reason: typeof properties?.reason === 'string' ? properties.reason : undefined,
        arcanaName: typeof properties?.arcanaName === 'string' ? properties.arcanaName : undefined,
        isDual: typeof properties?.isDual === 'boolean' ? properties.isDual : undefined,
      },
    });
  } catch {
    // tracking must never throw
  }
}

function classifyMystiStep(event: MystiEvent): string | undefined {
  if (event.includes('paywall')) return 'paywall';
  if (event.includes('subscribe')) return 'subscribe';
  if (event.includes('gift')) return 'gift';
  if (event.includes('gacha')) return 'gacha';
  if (event.includes('share')) return 'share';
  if (event.includes('daily')) return 'daily';
  if (event.includes('decision')) return 'decision';
  if (event.endsWith('_test_start')) return 'entry';
  if (event.endsWith('_test_complete')) return 'finish';
  if (event.endsWith('_return_landing')) return 'return_landing';
  if (event.endsWith('_return_complete')) return 'return_finish';
  return undefined;
}
