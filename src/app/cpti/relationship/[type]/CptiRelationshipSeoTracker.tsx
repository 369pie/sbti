'use client';

import { useEffect } from 'react';
import { trackCptiEvent } from '@/lib/cpti/analytics';

export function CptiRelationshipSeoTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackCptiEvent('cpti_relationship_seo_landed', { slug });
  }, [slug]);
  return null;
}
