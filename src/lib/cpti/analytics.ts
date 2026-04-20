import { enqueueProductEvent } from '@/lib/analytics/product-events';

type CptiEvent =
  | 'cpti_pair_code_created'
  | 'cpti_pair_code_copied'
  | 'cpti_pair_code_shared'
  | 'cpti_match_started'
  | 'cpti_match_completed'
  | 'cpti_profile_saved'
  | 'cpti_leaderboard_viewed'
  | 'cpti_collection_viewed'
  | 'cpti_join_page_opened'
  // Sprint 1 (2026-04-19) — viral funnel instrumentation
  | 'cpti_pair_panel_viewed'
  | 'cpti_pair_link_generated'
  | 'cpti_pair_code_auto_generated'
  | 'cpti_pair_poster_downloaded'
  | 'cpti_gallery_missing_clicked'
  | 'cpti_gallery_milestone_reached'
  | 'cpti_relationship_seo_landed'
  | 'cpti_theory_viewed'
  // Sprint 2 (2026-04-19) — scenario long-tail SEO
  | 'cpti_scenario_landed'
  // Sprint 2 polish (2026-04-19) — gallery progress poster
  | 'cpti_gallery_progress_shared'
  // Sprint 2 polish (2026-04-19) — E7 lite prediction widget
  | 'cpti_prediction_viewed'
  | 'cpti_prediction_clicked';

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
  try {
    enqueueProductEvent('cpti', event, {
      slug: typeof properties?.personality === 'string' ? properties.personality : undefined,
      tier: typeof properties?.tier === 'string' ? properties.tier : undefined,
      step: classifyCptiStep(event),
      ok: typeof properties?.ok === 'boolean' ? properties.ok : undefined,
      value: typeof properties?.collected === 'number'
        ? properties.collected
        : typeof properties?.milestone === 'number'
        ? properties.milestone
        : undefined,
      props: {
        method: typeof properties?.method === 'string' ? properties.method : undefined,
        target: typeof properties?.target === 'string' ? properties.target : undefined,
        rarity: typeof properties?.rarity === 'string' ? properties.rarity : undefined,
        relationship: typeof properties?.relationship === 'string' ? properties.relationship : undefined,
      },
    });
  } catch {
    // never block UX for analytics
  }
}

function classifyCptiStep(event: string): string | undefined {
  if (event.includes('pair_panel_viewed')) return 'pair_view';
  if (event.includes('pair_link_generated') || event.includes('pair_code_auto_generated')) return 'pair_generate';
  if (event.includes('pair_code_copied') || event.includes('pair_poster_downloaded')) return 'pair_share';
  if (event.includes('match_started')) return 'match_entry';
  if (event.includes('match_completed')) return 'match_finish';
  if (event.includes('profile_saved')) return 'profile_saved';
  if (event.includes('gallery_progress_shared')) return 'progress_share';
  if (event.includes('gallery_milestone_reached')) return 'milestone';
  if (event.includes('gallery_missing_clicked')) return 'gallery_explore';
  if (event.includes('relationship_seo_landed') || event.includes('scenario_landed')) return 'seo_landing';
  if (event.includes('prediction_viewed')) return 'prediction_view';
  if (event.includes('prediction_clicked')) return 'prediction_click';
  if (event.includes('theory_viewed')) return 'theory_view';
  if (event.includes('leaderboard_viewed')) return 'leaderboard_view';
  if (event.includes('collection_viewed')) return 'collection_view';
  if (event.includes('join_page_opened')) return 'join_view';
  return undefined;
}

// TODO: Implement server-side analytics (Vercel Analytics is client-side only)
export function trackCptiServerEvent(event: CptiEvent, properties?: Record<string, unknown>) {
  console.log(`[analytics:server] ${event}`, properties);
}
