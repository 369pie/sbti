'use client';

/**
 * PileView (W4) — strewn-on-table card pile. Cards are absolutely
 * positioned with deterministic-but-shuffleable rotation/offset.
 *
 * Pointer drag re-positions a card on top of the pile (z-index bump).
 * "Shuffle" re-seeds the layout. No physics engine — pure CSS transform.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import type { GalleryItem } from '@/app/types/gallery-data';
import { trackMuseum } from '@/lib/museum/analytics';
import SealedCard from './SealedCard';
import type { SealStyle } from '@/lib/museum/season';

interface PileViewProps {
  items: GalleryItem[];
  tabId: string;
  tabAccent: string;
  unlockedKeys: Set<string>;
  sealStyle: SealStyle;
  onOpen: (key: string) => void;
}

interface CardLayout {
  x: number;       // % offset from container center
  y: number;
  rot: number;     // degrees
  z: number;       // layer
}

/* ── tiny seeded RNG (mulberry32) so seeds are reproducible during a render ── */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLayout(count: number, seed: number): CardLayout[] {
  const r = rng(seed);
  const layouts: CardLayout[] = [];
  for (let i = 0; i < count; i++) {
    layouts.push({
      x: (r() * 70) - 35,           // -35..35 %
      y: (r() * 60) - 30,           // -30..30 %
      rot: (r() * 36) - 18,         // -18..18°
      z: i,
    });
  }
  return layouts;
}

export default function PileView({
  items,
  tabId,
  tabAccent,
  unlockedKeys,
  sealStyle,
  onOpen,
}: PileViewProps) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const layout = useMemo(() => buildLayout(items.length, seed), [items.length, seed]);
  const [overrides, setOverrides] = useState<Record<number, CardLayout>>({});
  const dragLoggedRef = useRef(false);

  // Reset overrides when shuffling.
  useEffect(() => {
    const t = window.setTimeout(() => setOverrides({}), 0);
    return () => window.clearTimeout(t);
  }, [seed]);

  const merged = useMemo(() => layout.map((l, i) => overrides[i] ?? l), [layout, overrides]);
  const maxZ = useMemo(() => merged.reduce((m, c) => Math.max(m, c.z), 0), [merged]);

  const handleShuffle = useCallback(() => {
    trackMuseum('pile_shuffle', { tab: tabId, count: items.length });
    setSeed(Math.floor(Math.random() * 1e6));
  }, [tabId, items.length]);

  const dragRef = useRef<{
    idx: number;
    startX: number; startY: number;
    base: CardLayout;
    pointerId: number;
  } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown = useCallback((idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!stageRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      idx,
      startX: e.clientX,
      startY: e.clientY,
      base: merged[idx],
      pointerId: e.pointerId,
    };
    if (!dragLoggedRef.current) {
      dragLoggedRef.current = true;
      trackMuseum('pile_card_drag', { tab: tabId });
    }
  }, [merged, tabId]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    setOverrides((prev) => ({
      ...prev,
      [drag.idx]: {
        ...drag.base,
        x: drag.base.x + dx,
        y: drag.base.y + dy,
        z: maxZ + 1,
      },
    }));
  }, [maxZ]);

  const onPointerEnd = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      dragRef.current = null;
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* swallow */ }
    }
  }, []);

  const moveSinceDownRef = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const handleClick = useCallback((key: string) => () => {
    // Only treat as click if movement was small.
    const m = moveSinceDownRef.current;
    if (m && Math.abs(m.dx) + Math.abs(m.dy) < 8) onOpen(key);
    else if (!m) onOpen(key);
  }, [onOpen]);

  return (
    <div className="animate-fade-in">
      {/* Tabletop */}
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-2xl paper-texture border"
        style={{
          aspectRatio: '4 / 5',
          maxHeight: '70vh',
          borderColor: `${tabAccent}22`,
          background: `radial-gradient(ellipse at center, ${tabAccent}12 0%, var(--color-bg-secondary) 70%)`,
        }}
      >
        {merged.map((l, i) => {
          const item = items[i];
          if (!item) return null;
          const key = `${tabId}:${item.slug}`;
          const isUnlocked = unlockedKeys.has(key);

          return (
            <button
              key={key}
              type="button"
              onPointerDown={(e) => {
                onPointerDown(i)(e);
                moveSinceDownRef.current = { id: e.pointerId, dx: 0, dy: 0 };
              }}
              onPointerMove={(e) => {
                if (moveSinceDownRef.current && moveSinceDownRef.current.id === e.pointerId) {
                  moveSinceDownRef.current.dx = e.clientX - (dragRef.current?.startX ?? e.clientX);
                  moveSinceDownRef.current.dy = e.clientY - (dragRef.current?.startY ?? e.clientY);
                }
                onPointerMove(e);
              }}
              onPointerUp={(e) => { onPointerEnd(e); moveSinceDownRef.current = null; }}
              onPointerCancel={(e) => { onPointerEnd(e); moveSinceDownRef.current = null; }}
              onClick={handleClick(key)}
              aria-label={isUnlocked ? `查看 ${item.name}` : `${item.name}（未解锁）`}
              className="absolute touch-none rounded-xl overflow-hidden border bg-bg-elevated shadow-[0_8px_20px_-12px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2"
              style={{
                left: '50%', top: '50%',
                width: '34%', aspectRatio: '3 / 4',
                transform: `translate(-50%, -50%) translate(${l.x}%, ${l.y}%) rotate(${l.rot}deg)`,
                zIndex: l.z + 1,
                borderColor: `${tabAccent}33`,
              }}
            >
              {isUnlocked ? (
                item.image ? (
                  <NextImage
                    src={item.image}
                    alt={item.name}
                    width={220}
                    height={293}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-contain p-2 pointer-events-none"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">{item.emoji ?? '✦'}</div>
                )
              ) : (
                <SealedCard
                  accent={tabAccent}
                  sealStyle={sealStyle}
                  isHidden={Boolean(item.isSpecial)}
                  code={item.code}
                  className="absolute inset-0"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono tracking-[0.15em] text-text-muted">
          {items.length} 张铺在桌上
        </span>
        <button
          type="button"
          onClick={handleShuffle}
          className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition-colors"
          style={{ color: tabAccent, borderColor: `${tabAccent}50`, background: `${tabAccent}08` }}
        >
          🔀 重新摊牌
        </button>
      </div>
      <p className="mt-2 text-[11px] text-text-muted">
        提示：拖动一张卡可以挪到最上面 · 点击可查看详情
      </p>
    </div>
  );
}
