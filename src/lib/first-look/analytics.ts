/**
 * First Look · analytics events (lightweight stub).
 *
 * Emits to window.dataLayer if present; otherwise logs in dev mode.
 * We keep event names stable so funnel dashboards can be wired later:
 *   first_look_entry      → ritual lands
 *   first_look_q          → every answer { id }
 *   first_look_finish     → result computed { slug, code, rarity }
 *   first_look_share      → share CTA clicked { slug, channel? }
 *   first_look_deep_click → deep-dive pass clicked { target, match }
 */

import { track } from '@vercel/analytics';

import { enqueueProductEvent } from '@/lib/analytics/product-events';

export type FirstLookEventName =
  | 'first_look_entry'
  | 'first_look_q'
  | 'first_look_finish'
  | 'first_look_share'
  | 'first_look_deep_click';

const SID_KEY = 'sbti:first-look:sid';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const found = window.sessionStorage.getItem(SID_KEY);
    if (found) return found;
    const sid = `fl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem(SID_KEY, sid);
    return sid;
  } catch {
    return `fl_${Date.now().toString(36)}`;
  }
}

function getAttributionPayload(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const q = url.searchParams;
  return {
    sid: getSessionId(),
    page_path: url.pathname,
    page_url: window.location.href,
    referrer: document.referrer || 'direct',
    utm_source: q.get('utm_source') ?? undefined,
    utm_medium: q.get('utm_medium') ?? undefined,
    utm_campaign: q.get('utm_campaign') ?? undefined,
    utm_content: q.get('utm_content') ?? undefined,
    utm_term: q.get('utm_term') ?? undefined,
    from: q.get('from') ?? undefined,
  };
}

export function trackFirstLook(event: FirstLookEventName, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const eventPayload = {
    ts: Date.now(),
    ...getAttributionPayload(),
    ...(payload ?? {}),
  };

  try {
    track(event, eventPayload);
  } catch {
    // never block UX for analytics
  }

  try {
    const stepMap: Record<FirstLookEventName, string> = {
      first_look_entry: 'entry',
      first_look_q: 'q_advance',
      first_look_finish: 'finish',
      first_look_share: 'share',
      first_look_deep_click: 'deep_click',
    };
    const slug = typeof payload?.slug === 'string' ? payload.slug : undefined;
    const code = typeof payload?.code === 'string' ? payload.code : undefined;
    const tier = typeof payload?.tier === 'string' ? payload.tier : undefined;
    const value = typeof payload?.match === 'number'
      ? payload.match
      : typeof payload?.id === 'number'
      ? payload.id
      : undefined;
    enqueueProductEvent('first_look', event, {
      slug,
      code,
      tier,
      step: stepMap[event],
      value,
      props: {
        target: typeof payload?.target === 'string' ? payload.target : undefined,
        channel: typeof payload?.channel === 'string' ? payload.channel : undefined,
        rarity: typeof payload?.rarity === 'string' ? payload.rarity : undefined,
        stage: typeof payload?.stage === 'string' ? payload.stage : undefined,
      },
    });
  } catch {
    // never block UX for analytics
  }

  try {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...eventPayload });
    } else if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[first-look]', event, eventPayload);
    }
  } catch {
    // never block UX for analytics
  }
}
