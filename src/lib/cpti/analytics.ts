type CptiEvent =
  | 'cpti_pair_code_created'
  | 'cpti_pair_code_copied'
  | 'cpti_pair_code_shared'
  | 'cpti_match_started'
  | 'cpti_match_completed'
  | 'cpti_profile_saved'
  | 'cpti_leaderboard_viewed'
  | 'cpti_collection_viewed'
  | 'cpti_join_page_opened';

export function trackCptiEvent(event: CptiEvent, properties?: Record<string, unknown>) {
  // Try Vercel Analytics first (client-side only)
  try {
    const { track } = require('@vercel/analytics');
    track(event, properties);
  } catch {
    // Fallback: console.log in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[analytics] ${event}`, properties);
    }
  }
}

// TODO: Implement server-side analytics (Vercel Analytics is client-side only)
export function trackCptiServerEvent(event: CptiEvent, properties?: Record<string, unknown>) {
  console.log(`[analytics:server] ${event}`, properties);
}
