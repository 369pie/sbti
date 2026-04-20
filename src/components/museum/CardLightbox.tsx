'use client';

/**
 * CardLightbox (W2) — fullscreen preview with swipe-between-neighbours.
 *
 * Use case: long-press / explicit "preview" button on a grid card opens this
 * with a list of neighbours from the same tab. Swipe ← → to walk; tap or
 * pull-down to close.
 *
 * Implementation notes:
 *  - Pure CSS transitions (no Framer dependency)
 *  - Swipe detection via pointerdown / pointermove / pointerup
 *  - Backdrop blur + fade
 *  - Image is rendered with NextImage at high res for crisp pinch-zoom on
 *    iOS (browser handles native pinch-zoom on the image element)
 *  - Locked cards in the lightbox: still show silhouette + "??? 未解锁"
 *
 * Loaded via dynamic import in TypesContent so it never lands in initial JS.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import type { GalleryItem } from '@/app/types/gallery-data';
import { trackMuseum } from '@/lib/museum/analytics';

export interface LightboxItem {
  tabId: string;
  tabLabel: string;
  tabAccent: string;
  item: GalleryItem;
  isUnlocked: boolean;
}

interface CardLightboxProps {
  items: LightboxItem[];
  startIndex: number;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 60; // px

export default function CardLightbox({ items, startIndex, onClose }: CardLightboxProps) {
  const [index, setIndex] = useState(() => Math.max(0, Math.min(startIndex, items.length - 1)));
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Track open
  const openLoggedRef = useRef(false);
  useEffect(() => {
    if (openLoggedRef.current) return;
    openLoggedRef.current = true;
    const cur = items[index];
    if (cur) trackMuseum('card_lightbox_open', { tab: cur.tabId, slug: cur.item.slug, unlocked: cur.isUnlocked });
  }, [items, index]);

  // Esc / arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = useCallback((dir: number) => {
    setIndex((cur) => {
      const next = Math.max(0, Math.min(items.length - 1, cur + dir));
      if (next !== cur) {
        const it = items[next];
        if (it) trackMuseum('card_lightbox_swipe', { tab: it.tabId, slug: it.item.slug, dir });
      }
      return next;
    });
    setDrag({ x: 0, y: 0, active: false });
  }, [items]);

  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    setDrag({ x: 0, y: 0, active: true });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startXRef.current == null || startYRef.current == null) return;
    setDrag({ x: e.clientX - startXRef.current, y: e.clientY - startYRef.current, active: true });
  };
  const onPointerUp = () => {
    if (!drag.active) return;
    if (drag.y > 100 && Math.abs(drag.y) > Math.abs(drag.x)) {
      onClose();
    } else if (drag.x > SWIPE_THRESHOLD) {
      step(-1);
    } else if (drag.x < -SWIPE_THRESHOLD) {
      step(1);
    } else {
      setDrag({ x: 0, y: 0, active: false });
    }
    startXRef.current = null;
    startYRef.current = null;
  };

  const cur = items[index];
  if (!cur) return null;

  const accent = cur.tabAccent;
  const slideStyle: React.CSSProperties = drag.active
    ? { transform: `translate3d(${drag.x}px, ${Math.max(0, drag.y)}px, 0)`, transition: 'none' }
    : { transform: 'translate3d(0,0,0)', transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)' };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`预览 ${cur.item.name}`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-black/72 backdrop-blur-md animate-fade-in"
        style={{ animationDuration: '160ms' }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-5 py-4 flex items-center justify-between text-white/85 z-10 pointer-events-none">
        <span className="text-[11px] font-mono tracking-[0.22em] uppercase pointer-events-auto">
          {cur.tabLabel} · {index + 1}/{items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors pointer-events-auto"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Slide */}
      <div
        className="relative max-w-[88vw] sm:max-w-[520px] aspect-[5/7] rounded-3xl overflow-hidden touch-pan-y select-none"
        style={{
          background: `linear-gradient(160deg, ${accent}26 0%, ${accent}0a 60%, transparent 100%)`,
          border: `1px solid ${accent}55`,
          ...slideStyle,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Corners */}
        <span className="absolute top-3 left-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
        <span className="absolute top-3 right-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
        <span className="absolute bottom-3 left-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
        <span className="absolute bottom-3 right-3 opacity-50 text-base" style={{ color: accent }}>✦</span>

        <div className="absolute inset-0 flex items-center justify-center pt-8 pb-24 px-6">
          {cur.item.image ? (
            <NextImage
              src={cur.item.image}
              alt={cur.item.name}
              width={720}
              height={720}
              priority
              className="max-w-full max-h-full object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
              style={cur.isUnlocked ? undefined : { filter: 'grayscale(0.9) blur(4px)', opacity: 0.6 }}
              draggable={false}
            />
          ) : (
            <div className="text-9xl">{cur.item.emoji ?? '✦'}</div>
          )}
        </div>

        <div className="absolute left-5 right-5 bottom-5 text-white/90">
          <span className="text-[11px] font-mono tracking-[0.22em] uppercase block mb-1.5 opacity-75" style={{ color: accent }}>
            {cur.item.code}
          </span>
          <h3 className="text-2xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            {cur.isUnlocked ? cur.item.name : '??? 未解锁'}
          </h3>
          {cur.isUnlocked && (
            <p className="text-sm leading-snug opacity-80 mt-1.5 line-clamp-2">{cur.item.tagline}</p>
          )}
        </div>
      </div>

      {/* Side hints */}
      {index > 0 && (
        <button
          type="button"
          aria-label="上一张"
          onClick={() => step(-1)}
          className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/85 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {index < items.length - 1 && (
        <button
          type="button"
          aria-label="下一张"
          onClick={() => step(1)}
          className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white/85 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Bottom hint */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-white/50 px-4 pointer-events-none">
        左右滑动 切换 · 下拉关闭 · Esc / ✕ 退出
      </p>
    </div>
  );
}
