'use client';

import { useEffect } from 'react';

import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { hasDeviceArchive } from '@/lib/her/device-archive';

/** B12: one today_view per visit, tagged with whether this device has an archive. */
export function TodayViewTracker() {
  useEffect(() => {
    enqueueProductEvent('today', 'today_view', { step: 'view', props: { has_archive: hasDeviceArchive() } });
  }, []);
  return null;
}
