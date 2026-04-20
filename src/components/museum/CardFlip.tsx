'use client';

/**
 * CardFlip (W2) — controlled flip container with spring-feel CSS transition.
 *
 * Renders front and back faces; toggling `flipped` rotates the inner element
 * 180° around Y. Both faces preserve perspective and 3D context.
 *
 * Controlled API: parent owns `flipped` state and passes a setter via onFlip.
 * This keeps the component reusable inside drawer (where flip ↔ analytics
 * tracking is a parent concern).
 */

import type { CSSProperties, ReactNode } from 'react';

export interface CardFlipProps {
  flipped: boolean;
  onFlip?: (next: boolean) => void;
  front: ReactNode;
  back: ReactNode;
  /** Border radius matching the inner card; defaults to 1rem */
  radius?: string;
  className?: string;
  style?: CSSProperties;
  /** When true, clicking anywhere on the card triggers flip. Default true. */
  flipOnClick?: boolean;
  ariaLabel?: string;
}

export default function CardFlip({
  flipped,
  onFlip,
  front,
  back,
  radius = '1rem',
  className = '',
  style,
  flipOnClick = true,
  ariaLabel,
}: CardFlipProps) {
  const wrapperStyle: CSSProperties = {
    perspective: '1200px',
    borderRadius: radius,
    ...style,
  };

  const innerStyle: CSSProperties = {
    transformStyle: 'preserve-3d',
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    transition: 'transform 620ms cubic-bezier(0.34, 1.32, 0.64, 1)',
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: radius,
    willChange: 'transform',
  };

  const faceStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: radius,
  };

  const backStyle: CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
  };

  const handleClick = () => {
    if (flipOnClick && onFlip) onFlip(!flipped);
  };

  return (
    <div
      className={`relative ${className}`}
      style={wrapperStyle}
      onClick={flipOnClick ? handleClick : undefined}
      role={flipOnClick ? 'button' : undefined}
      tabIndex={flipOnClick ? 0 : undefined}
      aria-label={ariaLabel}
      aria-pressed={flipOnClick ? flipped : undefined}
      onKeyDown={(e) => {
        if (!flipOnClick || !onFlip) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip(!flipped);
        }
      }}
    >
      <div style={innerStyle}>
        <div style={faceStyle}>{front}</div>
        <div style={backStyle}>{back}</div>
      </div>
    </div>
  );
}
