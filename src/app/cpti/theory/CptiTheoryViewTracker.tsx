'use client';

import { useEffect } from 'react';
import { trackCptiEvent } from '@/lib/cpti/analytics';

export function CptiTheoryViewTracker() {
  useEffect(() => {
    trackCptiEvent('cpti_theory_viewed');
  }, []);
  return null;
}
