'use client';

/**
 * Unified product-event sender.
 *
 * Designed to be the *durable* mirror of the per-module Vercel Analytics
 * trackers. Each `track*Event(...)` helper forwards through here so the same
 * event appears in:
 *   - @vercel/analytics (real-time, capped retention, no SQL)
 *   - public.product_events  (Supabase, full SQL, used by the ops dashboard)
 *
 * Performance contract (NEVER block UX):
 *   - Calls are queued synchronously, dispatched through requestIdleCallback.
 *   - Batched up to 32 events / 2 seconds and flushed via navigator.sendBeacon.
 *   - On page hide / visibility change, flush via sendBeacon (zero perf cost).
 *   - All errors are swallowed. Tracking never throws into product code.
 */

const ENDPOINT = '/api/events/ingest/';
const FLUSH_DEBOUNCE_MS = 2000;
const MAX_BUFFER = 32;
const SID_KEY = 'wtfti.session.id';
const DID_KEY = 'wtfti.perf.did';

export type ProductEventModule =
  | 'first_look'
  | 'mysti'
  | 'cpti'
  | 'soulti'
  | 'xpti'
  | 'wtfcard'
  | 'museum'
  | 'creator'
  | 'identify'
  | 'home'
  | 'auth'
  | 'wtfti'
  | 'galaxy';

export interface ProductEventInput {
  /** Optional. Defaults to current page pathname. */
  pathname?: string;
  /** Persona / archetype slug, e.g. "spring", "boss". */
  slug?: string;
  /** Personality code, e.g. "TROFG". */
  code?: string;
  /** Tier label: free / pro / paid / unlocked etc. */
  tier?: string;
  /**
   * Funnel step name. Use a stable enum, e.g.
   *   "entry" | "q_advance" | "finish" | "share" | "deep_click" | "paywall_view".
   */
  step?: string;
  /** Numeric metric (duration ms, score, count). */
  value?: number;
  /** Soft success flag. Useful for paywall outcomes / share results. */
  ok?: boolean;
  /** Optional structured payload. Keep small (≤ 2 KB total). */
  props?: Record<string, string | number | boolean | undefined | null>;
}

interface QueuedEvent extends ProductEventInput {
  ts: number;
  module: ProductEventModule;
  event: string;
  session_id: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ua?: string;
}

let buffer: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let installed = false;

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

function getDeviceId(): string {
  const win = safeWindow();
  if (!win) return '';
  try {
    const existing = win.localStorage.getItem(DID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    win.localStorage.setItem(DID_KEY, next);
    return next;
  } catch {
    return '';
  }
}

function getSessionId(): string {
  const win = safeWindow();
  if (!win) return '';
  try {
    const existing = win.sessionStorage.getItem(SID_KEY);
    if (existing) return existing;
    const next = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    win.sessionStorage.setItem(SID_KEY, next);
    return next;
  } catch {
    return '';
  }
}

function getUaFamily(): string {
  const win = safeWindow();
  if (!win) return 'unknown';
  const ua = win.navigator.userAgent.toLowerCase();
  if (ua.includes('micromessenger')) return 'wechat';
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome/')) return 'chrome';
  if (ua.includes('safari/')) return 'safari';
  if (ua.includes('firefox/')) return 'firefox';
  return 'unknown';
}

function readAttribution() {
  const win = safeWindow();
  if (!win) return {};
  try {
    const url = new URL(win.location.href);
    const params = url.searchParams;
    return {
      pathname: url.pathname,
      referrer: win.document.referrer || undefined,
      utm_source: params.get('utm_source') ?? undefined,
      utm_medium: params.get('utm_medium') ?? undefined,
      utm_campaign: params.get('utm_campaign') ?? undefined,
    };
  } catch {
    return {};
  }
}

function flush(sync = false): void {
  const win = safeWindow();
  if (!win || buffer.length === 0) return;

  const events = buffer;
  buffer = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const payload = JSON.stringify({
    deviceId: getDeviceId(),
    events,
  });

  try {
    if (sync && typeof win.navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      win.navigator.sendBeacon(ENDPOINT, blob);
      return;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // swallow
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => flush(false), FLUSH_DEBOUNCE_MS);
}

function ensureLifecycleHooks(): void {
  if (installed) return;
  const win = safeWindow();
  if (!win) return;
  installed = true;
  const flushNow = () => flush(true);
  win.addEventListener('pagehide', flushNow);
  win.addEventListener('visibilitychange', () => {
    if (win.document.visibilityState === 'hidden') flushNow();
  });
}

function dispatch(item: QueuedEvent): void {
  buffer.push(item);
  if (buffer.length >= MAX_BUFFER) {
    flush(false);
    return;
  }
  scheduleFlush();
}

/**
 * Queue a product event. Safe to call from any client component.
 *
 * Forwarding from existing per-module trackers should look like:
 *   enqueueProductEvent('mysti', 'mysti_test_complete', { slug, ... });
 */
export function enqueueProductEvent(
  moduleName: ProductEventModule,
  eventName: string,
  input: ProductEventInput = {},
): void {
  const win = safeWindow();
  if (!win || !eventName) return;

  ensureLifecycleHooks();

  const attribution = readAttribution();
  const item: QueuedEvent = {
    ts: Date.now(),
    module: moduleName,
    event: eventName,
    session_id: getSessionId(),
    pathname: input.pathname ?? attribution.pathname,
    referrer: attribution.referrer,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    ua: getUaFamily(),
    slug: input.slug,
    code: input.code,
    tier: input.tier,
    step: input.step,
    value: typeof input.value === 'number' ? input.value : undefined,
    ok: typeof input.ok === 'boolean' ? input.ok : undefined,
    props: input.props ? sanitizeProps(input.props) : undefined,
  };

  // Defer the actual queue push to idle time when supported, so we never
  // contend with input handlers or LCP-critical work.
  const idle = (win as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  }).requestIdleCallback;
  if (typeof idle === 'function') {
    try {
      idle(() => dispatch(item), { timeout: 1500 });
      return;
    } catch {
      // fall through to immediate dispatch
    }
  }
  dispatch(item);
}

function sanitizeProps(
  props: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') out[key] = value.slice(0, 240);
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'boolean') out[key] = value;
  }
  return out;
}
