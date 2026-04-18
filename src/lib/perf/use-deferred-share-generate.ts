'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface GenerateHandle {
  generate?: (...args: unknown[]) => unknown;
}

interface PreloadableDynamicComponent {
  preload?: () => Promise<unknown>;
}

/**
 * Lazy-mount-on-intent for `*ShareImageGenerator` components.
 *
 * Each share generator is heavy (html-to-image + qrcode + a hidden tree of
 * full-resolution art). Even when the component is wrapped in
 * `next/dynamic({ ssr: false })`, including it in the JSX causes the chunk
 * to load and the tree to render shortly after first paint, blowing the
 * LCP / INP budget on result pages that the user may never share from.
 *
 * Usage:
 *
 * ```tsx
 * const shareRef = useRef<MyHandle>(null);
 * const { mounted, ensureMounted, triggerGenerate } =
 *   useDeferredShareGenerate(shareRef, MyShareGenerator);
 *
 * <button
 *   onPointerEnter={ensureMounted} // warm chunk on hover/touch
 *   onClick={triggerGenerate}      // mount + generate, queued if needed
 * >分享</button>
 *
 * {mounted ? <MyShareGenerator ref={shareRef} {...props} /> : null}
 * ```
 *
 * The hook waits up to ~600ms (30 frames) for the dynamic component to
 * mount and attach its ref, then calls `generate()` exactly once.
 */
export function useDeferredShareGenerate<H extends GenerateHandle>(
  ref: RefObject<H | null>,
  preloadable?: unknown,
) {
  const [mounted, setMounted] = useState(false);
  const pendingRef = useRef(false);
  const lastTickRef = useRef(0);
  const prewarmStartedRef = useRef(false);

  const prewarmChunk = useCallback(() => {
    if (prewarmStartedRef.current) return;
    prewarmStartedRef.current = true;
    const preloadCandidate = preloadable as PreloadableDynamicComponent | undefined;

    try {
      void preloadCandidate?.preload?.();
    } catch {
      // swallow — best-effort warmup only
    }
  }, [preloadable]);

  useEffect(() => {
    if (!preloadable || mounted) return;
    if (typeof window === 'undefined' || document.visibilityState === 'hidden') return;

    const connection = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        saveData?: boolean;
      };
    };

    if (connection.connection?.saveData) return;

    const effectiveType = connection.connection?.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      prewarmChunk();
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(run, { timeout: 2500 });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(handle);
      };
    }

    const timeout = window.setTimeout(run, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [mounted, preloadable, prewarmChunk]);

  // Drain any pending generate() once the component finishes mounting.
  useEffect(() => {
    if (!mounted || !pendingRef.current) return;
    let cancelled = false;
    let attempts = 0;
    const tryRun = () => {
      if (cancelled) return;
      const handle = ref.current;
      if (handle && typeof handle.generate === 'function') {
        try {
          handle.generate();
        } catch {
          // swallow — share-generation errors are surfaced inside the component
        }
        pendingRef.current = false;
        return;
      }
      if (attempts++ < 30) {
        // ~16ms/frame × 30 = up to 500ms wait for ref attach.
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(tryRun);
        } else {
          setTimeout(tryRun, 16);
        }
      } else {
        pendingRef.current = false;
      }
    };
    tryRun();
    return () => {
      cancelled = true;
    };
  }, [mounted, ref]);

  const ensureMounted = useCallback(() => {
    prewarmChunk();
    setMounted((v) => v || true);
  }, [prewarmChunk]);

  const triggerGenerate = useCallback(() => {
    // Debounce double-fires (e.g. pointer + click on touch devices).
    if (typeof performance !== 'undefined') {
      const now = performance.now();
      if (now - lastTickRef.current < 250) return;
      lastTickRef.current = now;
    }

    prewarmChunk();
    pendingRef.current = true;
    if (mounted) {
      const handle = ref.current;
      if (handle && typeof handle.generate === 'function') {
        try {
          handle.generate();
        } catch {
          // swallow
        }
        pendingRef.current = false;
        return;
      }
      // mounted but ref not yet attached — effect will pick it up.
      return;
    }
    setMounted(true);
  }, [mounted, prewarmChunk, ref]);

  return { mounted, ensureMounted, triggerGenerate };
}
