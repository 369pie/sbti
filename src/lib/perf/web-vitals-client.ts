'use client';

/**
 * Lightweight Real-User Monitoring (RUM) client.
 *
 * - Subscribes to web-vitals (LCP / CLS / INP / FCP / TTFB).
 * - Buffers reports and flushes via `navigator.sendBeacon` so we don't add a
 *   blocking request to the LCP path.
 * - Also exposes `reportPerf(label, value)` for ad-hoc interaction timings
 *   ("click no-op", "supabase auth getUser", etc.).
 *
 * Designed to fail silently — RUM must never block the user.
 */

const ENDPOINT = '/api/perf/report/';
const FLUSH_DEBOUNCE_MS = 2000;

type Metric = {
  metric: string;
  value: number;
  rating?: string;
  pathname: string;
  label?: string;
  connection?: string;
  ua?: string;
};

let buffer: Metric[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;
let deviceId = '';

function getDeviceId(): string {
  if (deviceId) return deviceId;
  try {
    const KEY = 'wtfti.perf.did';
    const existing = window.localStorage.getItem(KEY);
    if (existing) {
      deviceId = existing;
      return deviceId;
    }
    deviceId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(KEY, deviceId);
  } catch {
    deviceId = 'anon';
  }
  return deviceId;
}

function getConnection(): string | undefined {
  try {
    const conn = (
      navigator as unknown as { connection?: { effectiveType?: string } }
    ).connection;
    return conn?.effectiveType;
  } catch {
    return undefined;
  }
}

function getUaFamily(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('micromessenger')) return 'wechat';
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome/')) return 'chrome';
  if (ua.includes('safari/')) return 'safari';
  if (ua.includes('firefox/')) return 'firefox';
  return 'unknown';
}

function flush(sync = false): void {
  if (buffer.length === 0) return;
  const payload = {
    deviceId: getDeviceId(),
    metrics: buffer,
  };
  buffer = [];
  flushTimer = null;

  const body = JSON.stringify(payload);
  try {
    if (sync && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      body,
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

function pushMetric(m: Metric): void {
  if (!m.pathname) return;
  buffer.push(m);
  // Cap buffer to avoid memory blowups on long sessions.
  if (buffer.length > 32) flush(false);
  else scheduleFlush();
}

export function reportPerf(label: string, value: number, metric = 'CUSTOM'): void {
  if (typeof window === 'undefined') return;
  pushMetric({
    metric,
    value,
    label,
    pathname: window.location.pathname,
    connection: getConnection(),
    ua: getUaFamily(),
  });
}

export async function startWebVitalsReporter(): Promise<void> {
  if (started || typeof window === 'undefined') return;
  started = true;

  const handler = (m: { name: string; value: number; rating?: string }) => {
    pushMetric({
      metric: m.name,
      value: m.value,
      rating: m.rating,
      pathname: window.location.pathname,
      connection: getConnection(),
      ua: getUaFamily(),
    });
  };

  try {
    const wv = await import('web-vitals');
    wv.onLCP(handler);
    wv.onCLS(handler);
    wv.onINP(handler);
    wv.onFCP(handler);
    wv.onTTFB(handler);
  } catch {
    // web-vitals failed to load — silently noop.
    started = false;
    return;
  }

  // Final flush before page unload.
  const flushNow = () => flush(true);
  window.addEventListener('pagehide', flushNow);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushNow();
  });
}
