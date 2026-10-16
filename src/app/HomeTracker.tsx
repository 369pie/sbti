'use client';

import { useEffect } from 'react';
import { enqueueProductEvent } from '@/lib/analytics/product-events';

// Funnel step 1 of the refocus path: home_view → home_cta_click → first_look_finish → register_complete.
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
