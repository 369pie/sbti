import { enqueueProductEvent } from '@/lib/analytics/product-events';

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
  | 'mysti_daily_bonus_pull';

export function trackMystiEvent(event: MystiEvent, properties?: Record<string, unknown>) {
  // Try Vercel Analytics first (client-side only)
  try {
    const { track } = require('@vercel/analytics');
    track(event, properties);
  } catch {
    // Fallback: console.log in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MystiAnalytics] ${event}`, properties);
    }
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
  if (event.endsWith('_test_start')) return 'entry';
  if (event.endsWith('_test_complete')) return 'finish';
  if (event.endsWith('_return_landing')) return 'return_landing';
  if (event.endsWith('_return_complete')) return 'return_finish';
  return undefined;
}
