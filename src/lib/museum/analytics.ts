/**
 * Museum analytics — thin wrapper around @vercel/analytics + dataLayer.
 *
 * All museum-related events go through this module so we can rename / batch
 * them later without touching components.
 */
import { track } from '@vercel/analytics';

import { enqueueProductEvent } from '@/lib/analytics/product-events';

export type MuseumEvent =
  | 'museum_view'                // page mount
  | 'museum_cover_cta_click'     // click "随机抽一张" / featured card on cover
  | 'museum_progress_seen'       // progress card visible (impression)
  | 'museum_card_drawer_open'    // open detail drawer
  | 'museum_card_drawer_close'
  | 'museum_card_unlock_test_click' // CTA inside drawer → go take that test
  | 'museum_locked_card_click'   // click on a locked card (silhouette)
  | 'museum_tab_switch'          // user switches series tab
  | 'museum_random_pick'         // user clicks 🎲 random
  | 'museum_screenshot_intent'   // long-press / "save card" intent
  // ─── W2 events ───────────────────────────────────────────────────────────
  | 'daily_pick_view'            // overlay opened (auto or manual)
  | 'daily_pick_flip'            // user flips today's card
  | 'daily_pick_share'           // generated share image
  | 'daily_pick_fav_toggle'      // heart on/off
  | 'daily_pick_invite'          // tap "找闺蜜也翻一张"
  | 'card_flip'                  // any card flipped (drawer / grid)
  | 'card_lightbox_open'         // long-press / preview opened
  | 'card_lightbox_swipe'        // swiped to neighbour
  | 'card_tilt_engaged'          // first time tilt is used in session
  | 'season_palette_seen'        // season info rendered (impression, capped 1/session)
  | 'unlock_path_view'           // user opened a locked card and saw the path
  | 'sealed_card_hover'          // sealed card hover/touch — measure curiosity
  // ─── W3 events ───────────────────────────────────────────────────────────
  | 'view_mode_switch'           // grid / binder / pile / reel / constellation
  | 'binder_page_change'         // binder pagination
  | 'cp_pair_view'               // /types/cp/[slugs] page mounted
  | 'cp_pair_share'              // generated CP screenshot
  | 'cp_pair_invite'             // copied invite link
  | 'cp_pair_swap'               // user swapped second card
  | 'monthly_recap_view'         // /types/month/[ym] mounted
  | 'monthly_recap_share'        // generated month grid screenshot
  | 'monthly_recap_nav'          // prev/next month link
  | 'set_bonus_seen'             // badges strip impression (capped 1/session)
  | 'set_bonus_complete'         // a badge crossed achieved threshold
  // ─── W4 events ───────────────────────────────────────────────────────────
  | 'pile_shuffle'               // user shuffled the pile
  | 'pile_card_drag'             // first drag in session
  | 'reel_play' | 'reel_pause' | 'reel_skip'
  | 'constellation_node_click'   // tap on a star
  // ─── W4 tail + W5 events ────────────────────────────────────────────────
  | 'free_path_seen'             // free-path panel impression (capped 1/session)
  | 'free_path_milestone_done'   // a milestone crossed threshold (decoration earned)
  | 'birthday_set'               // user set/updated birthday
  | 'birthday_clear'             // user cleared birthday
  | 'birthday_card_seen'         // birthday-day overlay/hint shown
  | 'snapshot_create'            // user created a share snapshot
  | 'snapshot_view'              // someone viewed a /u/share/[token] page
  | 'snapshot_visit_museum';     // viewer clicked through to the live museum

export interface MuseumEventProps {
  tab?: string;
  slug?: string;
  source?: string;
  unlocked?: boolean;
  total_unlocked?: number;
  total_cards?: number;
  [key: string]: string | number | boolean | undefined;
}

export function trackMuseum(event: MuseumEvent, props: MuseumEventProps = {}): void {
  if (typeof window === 'undefined') return;

  // Strip undefined values for clean analytics payloads
  const cleanProps: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) cleanProps[key] = value;
  }

  try {
    track(event, cleanProps);
  } catch {
    // Vercel analytics may be unavailable in dev — fail silently
  }

  // Push to GTM dataLayer if present
  try {
    const win = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event, ...cleanProps });
    }
  } catch {
    // ignore
  }

  try {
    enqueueProductEvent('museum', event, {
      slug: typeof props.slug === 'string' ? props.slug : undefined,
      step: event.replace('museum_', ''),
      ok: typeof props.unlocked === 'boolean' ? props.unlocked : undefined,
      value: typeof props.total_unlocked === 'number' ? props.total_unlocked : undefined,
      props: {
        tab: typeof props.tab === 'string' ? props.tab : undefined,
        source: typeof props.source === 'string' ? props.source : undefined,
        total_cards: typeof props.total_cards === 'number' ? props.total_cards : undefined,
      },
    });
  } catch {
    // never block UX
  }
}
