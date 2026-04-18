'use client';

/**
 * Shared "lazy share generator" pattern.
 *
 * The various `*ShareImageGenerator` components (one per universe) each pull
 * in `html-to-image` + `qrcode` + a hidden render tree of original-resolution
 * personality art. They are heavy, and the user only needs them when they
 * click "生成分享图". Eagerly mounting them on every result page burns ~80 KB
 * of script + significant decode time during the LCP window.
 *
 * Use this hook to:
 *   1. Keep the heavy module out of the initial bundle (`next/dynamic` with
 *      `ssr: false`).
 *   2. Defer mount until the first user gesture (click / pointerenter on the
 *      share CTA), then await ref attachment before invoking `generate()`.
 *
 * Usage in a result page:
 *
 * ```tsx
 * const { Lazy, ref, ensureMounted, runWithRef } = useLazyShareGenerator(
 *   () => import('@/components/XxxShareImageGenerator').then(m => m.XxxShareImageGenerator),
 * );
 *
 * <button
 *   onPointerEnter={ensureMounted}
 *   onClick={() => runWithRef(handle => handle.generate())}
 * >生成分享图</button>
 * {Lazy ? <Lazy ref={ref} ...props /> : null}
 * ```
 */

import {
  type ComponentType,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from 'react';

interface ShareHandleLike {
  // Each *ShareImageGenerator exposes its own handle; we type loosely here
  // and let callers narrow via the loader return type.
  generate?: (...args: unknown[]) => unknown;
}

export interface UseLazyShareGeneratorResult<
  Props,
  Handle extends ShareHandleLike,
> {
  /** Component to render once mounted; null until first ensureMounted call. */
  Lazy: ComponentType<Props & { ref?: React.Ref<Handle> }> | null;
  ref: RefObject<Handle | null>;
  /** Idempotent. Triggers the dynamic import + state flip. */
  ensureMounted: () => Promise<void>;
  /** Mounts (if needed), waits for ref, then calls fn(handle). */
  runWithRef: <R>(fn: (handle: Handle) => R | Promise<R>) => Promise<R | undefined>;
}

export function useLazyShareGenerator<
  Props,
  Handle extends ShareHandleLike,
>(
  loader: () => Promise<ComponentType<Props & { ref?: React.Ref<Handle> }>>,
): UseLazyShareGeneratorResult<Props, Handle> {
  const ref = useRef<Handle | null>(null);
  const [Lazy, setLazy] = useState<
    ComponentType<Props & { ref?: React.Ref<Handle> }> | null
  >(null);
  const loaderPromiseRef = useRef<Promise<void> | null>(null);

  const ensureMounted = useCallback(async () => {
    if (loaderPromiseRef.current) return loaderPromiseRef.current;
    loaderPromiseRef.current = loader()
      .then((Component) => {
        setLazy(() => Component);
      })
      .catch((err) => {
        loaderPromiseRef.current = null;
        throw err;
      });
    return loaderPromiseRef.current;
  }, [loader]);

  const runWithRef = useCallback(
    async <R,>(fn: (handle: Handle) => R | Promise<R>): Promise<R | undefined> => {
      await ensureMounted();
      // Wait up to ~600ms for the dynamic component to mount + attach its ref.
      for (let i = 0; i < 30; i += 1) {
        if (ref.current) return fn(ref.current);
        await new Promise<void>((resolve) => {
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => resolve());
          } else {
            setTimeout(resolve, 16);
          }
        });
      }
      return undefined;
    },
    [ensureMounted],
  );

  return { Lazy, ref, ensureMounted, runWithRef };
}
