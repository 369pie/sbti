'use client';

import { useEffect } from 'react';
import { trackCptiEvent } from '@/lib/cpti/analytics';

export function CptiScenarioTracker({ scenario }: { scenario: string }) {
  useEffect(() => {
    trackCptiEvent('cpti_scenario_landed', { scenario });
  }, [scenario]);
  return null;
}
