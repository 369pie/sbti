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
}
