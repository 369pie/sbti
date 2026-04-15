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
  | 'mysti_return_complete';

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
