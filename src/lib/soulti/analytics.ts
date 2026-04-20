'use client';

/**
 * SoulTI · analytics events.
 *
 * Mirrors the pattern of `first-look/analytics` and `cpti/analytics`:
 *  - Pushes to @vercel/analytics so they show up in the Vercel dashboard.
 *  - Also pushes to `window.dataLayer` if present (GTM).
 *  - Forwards to `enqueueProductEvent` so the SoulTI funnel is durable in
 *    Supabase and can be aggregated by `/creator/admin/ops/`.
 *
 * Event vocabulary (keep stable — funnel queries depend on these names):
 *   soulti_entry            → user lands on /soulti/ landing
 *   soulti_test_start       → quiz begins
 *   soulti_q_advance        → each question advance { id, key }
 *   soulti_finish           → result page renders { slug, code }
 *   soulti_share_click      → any share / copy CTA { channel }
 *   soulti_deep_report_view → user clicks the Deep Mirror unlock CTA
 *   soulti_letter_subscribe → user subscribes to the soul letter
 *   soulti_wish_post        → user posts a wish in the wishing well
 *   soulti_pair_open        → user opens the pair compatibility view
 */

import { enqueueProductEvent } from '@/lib/analytics/product-events';

export type SoultiEventName =
  | 'soulti_entry'
  | 'soulti_test_start'
  | 'soulti_q_advance'
  | 'soulti_finish'
  | 'soulti_share_click'
  | 'soulti_deep_report_view'
  | 'soulti_letter_subscribe'
  | 'soulti_wish_post'
  | 'soulti_pair_open';

const STEP_MAP: Record<SoultiEventName, string> = {
  soulti_entry: 'entry',
  soulti_test_start: 'test_start',
  soulti_q_advance: 'q_advance',
  soulti_finish: 'finish',
  soulti_share_click: 'share',
  soulti_deep_report_view: 'deep_report_view',
  soulti_letter_subscribe: 'letter_subscribe',
  soulti_wish_post: 'wish_post',
  soulti_pair_open: 'pair_open',
};

export function trackSoulti(
  event: SoultiEventName,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;

  // 1. Vercel Analytics (never throw if unavailable).
  try {
    // Using a typed dynamic import avoids require() while keeping the call
    // defensive — the module is always present in app builds.
    import('@vercel/analytics')
      .then((mod) => {
        try {
          mod.track?.(event, payload as Parameters<typeof mod.track>[1]);
        } catch {
          // ignore analytics failures
        }
      })
      .catch(() => {
        // ignore
      });
  } catch {
    // ignore
  }

  // 2. GTM dataLayer (optional).
  try {
    const win = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event, ...payload });
    }
  } catch {
    // ignore
  }

  // 3. Durable product_events bucket.
  try {
    enqueueProductEvent('soulti', event, {
      slug: typeof payload.slug === 'string' ? payload.slug : undefined,
      code: typeof payload.code === 'string' ? payload.code : undefined,
      tier: typeof payload.tier === 'string' ? payload.tier : undefined,
      step: STEP_MAP[event],
      ok: typeof payload.ok === 'boolean' ? payload.ok : undefined,
      value: typeof payload.value === 'number'
        ? payload.value
        : typeof payload.id === 'number'
        ? payload.id
        : undefined,
      props: {
        channel: typeof payload.channel === 'string' ? payload.channel : undefined,
        target: typeof payload.target === 'string' ? payload.target : undefined,
        key: typeof payload.key === 'string' ? payload.key : undefined,
        source: typeof payload.source === 'string' ? payload.source : undefined,
      },
    });
  } catch {
    // tracking must never throw
  }
}
