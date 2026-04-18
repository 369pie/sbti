'use client';

import { useEffect } from 'react';
import { syncSubscriptionFromServer } from '@/lib/mysti/subscription';

/**
 * Mounts once per page-load under MystiLayout. Pulls the authoritative
 * subscription record from the server and reconciles with the local envelope.
 * Throttled internally; safe to render multiple times.
 */
export function MystiSubscriptionBoot() {
  useEffect(() => {
    syncSubscriptionFromServer().catch(() => {
      /* swallow — local envelope continues to work offline */
    });
  }, []);
  return null;
}
