/**
 * Museum analytics — thin wrapper around @vercel/analytics + dataLayer.
 *
 * All museum-related events go through this module so we can rename / batch
 * them later without touching components.
 */
import { track } from '@vercel/analytics';

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
  | 'museum_screenshot_intent';  // (W2) long-press / "save card" intent

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
}
