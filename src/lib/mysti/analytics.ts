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
  | 'mysti_share_tier_unlock_click';

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
