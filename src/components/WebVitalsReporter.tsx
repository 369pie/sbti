'use client';

import { useEffect } from 'react';

/**
 * Mounted once in the root layout. Lazy-imports the RUM client after first
 * paint (idle callback) so it never blocks LCP.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    let cancelled = false;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const start = () => {
      if (cancelled) return;
      void import('@/lib/perf/web-vitals-client').then(({ startWebVitalsReporter }) => {
        if (cancelled) return;
        void startWebVitalsReporter();
      }).catch(() => {});
    };
    if (typeof w.requestIdleCallback === 'function') {
      const handle = w.requestIdleCallback(start, { timeout: 3000 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(handle);
      };
    }
    const t = window.setTimeout(start, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
