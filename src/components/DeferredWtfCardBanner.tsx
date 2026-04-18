'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const LazyWtfCardBanner = dynamic(
  () => import('@/components/WtfCardBanner').then((mod) => mod.WtfCardBanner),
  {
    ssr: false,
    loading: () => (
      <div className="px-6 pb-4 -mt-8" aria-hidden="true">
        <div className="max-w-4xl mx-auto h-24" />
      </div>
    ),
  }
);

export function DeferredWtfCardBanner() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;

    const node = rootRef.current;
    if (!node) return;

    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      const frameId = window.requestAnimationFrame(() => setShouldRender(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: '320px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender]);

  return <div ref={rootRef}>{shouldRender ? <LazyWtfCardBanner /> : null}</div>;
}