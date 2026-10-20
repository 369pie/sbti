'use client';

import { useEffect } from 'react';
import { enqueueProductEvent } from '@/lib/analytics/product-events';

// Funnel (audit 2026-10-20): home_view → test_start → test_finish → archive_created → push_enabled.
// See docs/01-strategy/p0-funnel-gate-2026-10.md
export function HomeTracker() {
  useEffect(() => {
    enqueueProductEvent('home', 'home_view');
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
      if (el) enqueueProductEvent('home', 'home_cta_click', { step: el.dataset.track });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
