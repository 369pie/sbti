'use client';

/**
 * CardTilt (W2) — wrap any card-shaped child with mouse/touch driven 3D tilt
 * + holographic foil overlay. Pure CSS transforms (no Framer/WebGL).
 *
 * Behaviour:
 *  - Mouse pointer drives rotateX/Y up to ±8°
 *  - Touch start uses last known position; on touch move follow finger
 *  - Pointer leaves → spring back to neutral
 *  - Holo overlay: conic-gradient + linear sheen, follows pointer X
 *  - Disabled if `prefers-reduced-motion` is reduce
 *  - Disabled on coarse pointer (touch-only) by default unless `enableTouch`
 *  - Holo only rendered if `holo` prop is truthy (keeps grid card cheap)
 *
 * Props are intentionally minimal — wraps children in a positioned div, does
 * NOT provide its own background. Compose with a SealedCard / GalleryCard
 * face for visuals.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode, TouchEvent as ReactTouchEvent } from 'react';
import { trackMuseum } from '@/lib/museum/analytics';

export interface CardTiltProps {
  children: ReactNode;
  /** Show holographic foil sheen (use for SR+/SSR/UR cards) */
  holo?: boolean;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Enable on touch devices (default false — perf + most users won't notice) */
  enableTouch?: boolean;
  /** Border radius matching the inner card; defaults to 1rem */
  radius?: string;
  className?: string;
  style?: CSSProperties;
  /** Optional click handler — bubbles up so it doesn't conflict with inner buttons */
  onClick?: () => void;
  /** Aria label when used as a button substitute */
  ariaLabel?: string;
}

const NEUTRAL = { rx: 0, ry: 0, mx: 50, my: 50, active: false };

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

let firstTiltLogged = false;

export default function CardTilt({
  children,
  holo = false,
  maxTilt = 8,
  enableTouch = false,
  radius = '1rem',
  className = '',
  style,
  onClick,
  ariaLabel,
}: CardTiltProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [pose, setPose] = useState(NEUTRAL);
  const enabledRef = useRef(false);

  // Init enabled flag (client-only)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (isCoarsePointer() && !enableTouch) return;
    enabledRef.current = true;
  }, [enableTouch]);

  const updateFromCoords = useCallback((clientX: number, clientY: number) => {
    if (!enabledRef.current) return;
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = (clientX - rect.left) / rect.width; // 0..1
    const py = (clientY - rect.top) / rect.height; // 0..1
    const cx = Math.max(0, Math.min(1, px));
    const cy = Math.max(0, Math.min(1, py));
    const ry = (cx - 0.5) * 2 * maxTilt; // left = -, right = +
    const rx = -(cy - 0.5) * 2 * maxTilt;
    setPose({ rx, ry, mx: cx * 100, my: cy * 100, active: true });

    if (!firstTiltLogged) {
      firstTiltLogged = true;
      trackMuseum('card_tilt_engaged');
    }
  }, [maxTilt]);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    updateFromCoords(e.clientX, e.clientY);
  }, [updateFromCoords]);

  const handleTouchMove = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    if (!enableTouch) return;
    const t = e.touches[0];
    if (!t) return;
    updateFromCoords(t.clientX, t.clientY);
  }, [updateFromCoords, enableTouch]);

  const reset = useCallback(() => {
    setPose(NEUTRAL);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  const wrapperStyle: CSSProperties = {
    perspective: '900px',
    borderRadius: radius,
    ...style,
  };

  const surfaceStyle: CSSProperties = {
    transform: `rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) translateZ(0)`,
    transition: pose.active
      ? 'transform 80ms linear'
      : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
    transformStyle: 'preserve-3d',
    willChange: pose.active ? 'transform' : undefined,
    borderRadius: radius,
  };

  const holoStyle: CSSProperties | undefined = holo && pose.active ? {
    opacity: 0.55,
    background: `radial-gradient(circle at ${pose.mx}% ${pose.my}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 40%), conic-gradient(from ${pose.mx * 3.6}deg at 50% 50%, #ffd6e8 0%, #d6f0ff 25%, #fff5d6 50%, #d6ffe5 75%, #ffd6e8 100%)`,
    mixBlendMode: 'screen',
    borderRadius: radius,
    pointerEvents: 'none',
    transition: 'opacity 220ms ease',
  } : holo ? {
    opacity: 0,
    transition: 'opacity 380ms ease',
    borderRadius: radius,
    pointerEvents: 'none',
  } : undefined;

  // If onClick is supplied, render as button-like div with role=button.
  // Otherwise render plain div (composed inside an existing <button>).
  const interactive = Boolean(onClick);

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      style={wrapperStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      onTouchMove={handleTouchMove}
      onTouchEnd={reset}
      onTouchCancel={reset}
      onClick={interactive ? handleClick : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="relative h-full w-full" style={surfaceStyle}>
        {children}
        {holo && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={holoStyle}
          />
        )}
        {/* Edge highlight on tilt */}
        {pose.active && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: radius,
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,${holo ? 0.45 : 0.28})`,
            }}
          />
        )}
      </div>
    </div>
  );
}
