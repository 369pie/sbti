'use client';

/**
 * ConstellationView (W4) — renders unlocked cards as nodes on a starry
 * canvas, connected by faint editorial lines. Hover/tap = card label.
 *
 * Pure SVG, no canvas API. Layout is deterministic from slug hashes,
 * so the same user sees the same constellation each visit.
 */

import { useMemo, useState } from 'react';
import type { GalleryItem } from '@/app/types/gallery-data';
import { trackMuseum } from '@/lib/museum/analytics';
import { getItemRarityTier, isHoloTier } from '@/lib/museum/rarity';

interface ConstellationViewProps {
  items: GalleryItem[];
  tabId: string;
  tabAccent: string;
  unlockedKeys: Set<string>;
  onOpen: (key: string) => void;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

interface Node {
  slug: string;
  item: GalleryItem;
  x: number;       // 0..1 (normalized)
  y: number;
  r: number;
  glow: boolean;
  isUnlocked: boolean;
}

function layout(items: GalleryItem[], tabId: string, unlockedKeys: Set<string>): Node[] {
  return items.map((item) => {
    const seed = fnv1a(`${tabId}:${item.slug}`);
    const ang = ((seed % 360) * Math.PI) / 180;
    // bias by rarity — higher tier closer to center
    const tier = getItemRarityTier(item);
    const tierIdx = ['N', 'R', 'SR', 'SSR', 'UR'].indexOf(tier);
    const radial = 0.18 + ((seed >> 10) % 1000) / 1000 * (0.42 - tierIdx * 0.06);
    const x = 0.5 + Math.cos(ang) * radial;
    const y = 0.5 + Math.sin(ang) * radial * 0.85;        // squish vertically
    const isUnlocked = unlockedKeys.has(`${tabId}:${item.slug}`);
    return {
      slug: item.slug,
      item,
      x,
      y,
      r: 4 + tierIdx * 1.2 + (isUnlocked ? 1.5 : 0),
      glow: isUnlocked && isHoloTier(tier),
      isUnlocked,
    };
  });
}

export default function ConstellationView({
  items, tabId, tabAccent, unlockedKeys, onOpen,
}: ConstellationViewProps) {
  const nodes = useMemo(() => layout(items, tabId, unlockedKeys), [items, tabId, unlockedKeys]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Build edges — connect each node to its 2 nearest neighbors (faint).
  const edges = useMemo(() => {
    const out: { ax: number; ay: number; bx: number; by: number; opacity: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const dists = nodes
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((e) => e.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      for (const { j, d } of dists) {
        const b = nodes[j];
        const both = a.isUnlocked && b.isUnlocked;
        out.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, opacity: both ? 0.18 : 0.06 - d * 0.04 });
      }
    }
    return out;
  }, [nodes]);

  const W = 100; // viewBox units
  const H = 100;

  const hoverNode = hoverIdx != null ? nodes[hoverIdx] : null;

  return (
    <div className="animate-fade-in">
      <div
        className="relative w-full rounded-2xl border overflow-hidden"
        style={{
          aspectRatio: '4 / 3',
          maxHeight: '70vh',
          borderColor: `${tabAccent}33`,
          background: `radial-gradient(ellipse at 30% 20%, ${tabAccent}28 0%, var(--color-bg-secondary) 65%, var(--color-bg-tertiary) 100%)`,
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          {/* twinkles (decorative) */}
          {Array.from({ length: 18 }).map((_, i) => {
            const seed = fnv1a(`tw:${tabId}:${i}`);
            const x = (seed % 1000) / 10;
            const y = ((seed >> 10) % 1000) / 10;
            return (
              <circle key={`tw-${i}`} cx={x} cy={y} r="0.18" fill="#fff" opacity={0.35}>
                <animate attributeName="opacity" values="0.1;0.45;0.1" dur="6s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            );
          })}

          {/* edges */}
          {edges.map((e, i) => (
            <line
              key={`e-${i}`}
              x1={e.ax * W}
              y1={e.ay * H}
              x2={e.bx * W}
              y2={e.by * H}
              stroke={tabAccent}
              strokeWidth={0.18}
              opacity={e.opacity}
            />
          ))}

          {/* nodes */}
          {nodes.map((n, i) => (
            <g
              key={n.slug}
              onPointerEnter={() => setHoverIdx(i)}
              onPointerLeave={() => setHoverIdx((h) => (h === i ? null : h))}
              onClick={() => {
                trackMuseum('constellation_node_click', { tab: tabId, slug: n.slug, unlocked: n.isUnlocked });
                onOpen(`${tabId}:${n.slug}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              {n.glow && (
                <circle
                  cx={n.x * W}
                  cy={n.y * H}
                  r={n.r / 2 + 2}
                  fill={n.item.color}
                  opacity={0.18}
                >
                  <animate attributeName="opacity" values="0.1;0.32;0.1" dur="3.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={n.x * W}
                cy={n.y * H}
                r={n.r / 4}
                fill={n.isUnlocked ? n.item.color : 'rgba(154,144,138,0.4)'}
                stroke="#fff"
                strokeWidth={0.2}
                opacity={n.isUnlocked ? 1 : 0.55}
              />
            </g>
          ))}
        </svg>

        {/* Hover label */}
        {hoverNode && (
          <div
            className="absolute pointer-events-none rounded-md border bg-bg-elevated/95 backdrop-blur-sm px-2 py-1 shadow-md text-[11px]"
            style={{
              left: `calc(${hoverNode.x * 100}% + 8px)`,
              top:  `calc(${hoverNode.y * 100}% - 6px)`,
              borderColor: `${tabAccent}55`,
              transform: 'translateY(-50%)',
            }}
          >
            <span className="font-mono tracking-[0.15em] opacity-60">{hoverNode.item.code}</span>
            <span className="ml-1.5">
              {hoverNode.isUnlocked ? hoverNode.item.name : '???'}
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-text-muted text-center">
        每张卡是一颗星 · 越亮越稀有 · 点击查看
      </p>
    </div>
  );
}
