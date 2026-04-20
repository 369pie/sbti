'use client';

/**
 * BinderView (W3) — renders items as 9-slot card-sleeve pages with
 * left/right pagination. Empty slots are rendered as faint cream wells
 * so the binder feel is preserved even on a half-full page.
 */

import { useCallback, useMemo, useState } from 'react';
import NextImage from 'next/image';
import type { GalleryItem } from '@/app/types/gallery-data';
import { paginate, totalPages } from '@/lib/museum/binder';
import { trackMuseum } from '@/lib/museum/analytics';
import SealedCard from './SealedCard';
import type { SealStyle } from '@/lib/museum/season';

interface BinderViewProps {
  items: GalleryItem[];
  tabId: string;
  tabAccent: string;
  unlockedKeys: Set<string>;
  sealStyle: SealStyle;
  onOpen: (key: string) => void;
}

export default function BinderView({
  items,
  tabId,
  tabAccent,
  unlockedKeys,
  sealStyle,
  onOpen,
}: BinderViewProps) {
  const pages = useMemo(() => paginate(items, 9), [items]);
  const total = useMemo(() => totalPages(items, 9), [items]);
  const [pageIndex, setPageIndex] = useState(0);

  const goPrev = useCallback(() => {
    setPageIndex((p) => {
      const next = Math.max(0, p - 1);
      trackMuseum('binder_page_change', { tab: tabId, page: next });
      return next;
    });
  }, [tabId]);

  const goNext = useCallback(() => {
    setPageIndex((p) => {
      const next = Math.min(total - 1, p + 1);
      trackMuseum('binder_page_change', { tab: tabId, page: next });
      return next;
    });
  }, [tabId, total]);

  const safePage = Math.min(pageIndex, total - 1);
  const page = pages[safePage] ?? pages[0];

  return (
    <div className="animate-fade-in">
      {/* Sleeve page */}
      <div
        className="relative rounded-2xl border p-3 sm:p-4 paper-texture"
        style={{
          borderColor: `${tabAccent}33`,
          boxShadow: `inset 0 0 0 1px ${tabAccent}10, 0 1px 0 rgba(255,255,255,0.5), 0 8px 24px -16px rgba(0,0,0,0.18)`,
        }}
      >
        {/* Three binder rings (decoration) */}
        <div aria-hidden className="absolute -left-1.5 sm:-left-2 inset-y-0 flex flex-col justify-around py-6 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-3 h-3 rounded-full"
              style={{ background: `${tabAccent}33`, boxShadow: `inset 0 0 0 1px ${tabAccent}88` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {page.items.map((item, slotIdx) => {
            if (!item) {
              return (
                <div
                  key={`empty-${safePage}-${slotIdx}`}
                  className="aspect-[3/4] rounded-lg border border-dashed flex items-center justify-center text-text-muted/40"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                  aria-hidden
                >
                  <span className="text-2xl">·</span>
                </div>
              );
            }
            const key = `${tabId}:${item.slug}`;
            const isUnlocked = unlockedKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onOpen(key)}
                aria-label={isUnlocked ? `查看 ${item.name}` : `${item.name}（未解锁）`}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  borderColor: `${tabAccent}30`,
                  background: isUnlocked
                    ? `linear-gradient(135deg, ${item.color}10, ${item.color}04)`
                    : 'var(--color-bg-elevated)',
                }}
              >
                {/* Plastic sleeve gloss */}
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.18) 100%)',
                  }}
                />

                {isUnlocked ? (
                  <>
                    {item.image ? (
                      <NextImage
                        src={item.image}
                        alt={item.name}
                        width={200}
                        height={266}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">
                        {item.emoji ?? '✦'}
                      </div>
                    )}
                    {item.rarity && (
                      <span
                        className="absolute top-1.5 left-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                        style={{ color: item.rarity.color, background: item.rarity.bgColor }}
                      >
                        {item.rarity.label}
                      </span>
                    )}
                  </>
                ) : (
                  <SealedCard
                    accent={tabAccent}
                    sealStyle={sealStyle}
                    isHidden={Boolean(item.isSpecial)}
                    code={item.code}
                    className="absolute inset-0"
                  />
                )}

                {/* Bottom code strip */}
                <span
                  className="absolute bottom-0 inset-x-0 text-[8px] sm:text-[9px] font-mono tracking-[0.18em] uppercase text-center py-1"
                  style={{
                    color: isUnlocked ? item.color : 'var(--color-text-muted)',
                    background: 'rgba(255,253,249,0.85)',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  {isUnlocked ? item.code : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pager */}
      <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={safePage === 0}
          className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="上一页"
        >
          ← 翻页
        </button>
        <span className="text-[11px] sm:text-xs font-mono tracking-[0.15em] text-text-muted">
          {safePage + 1} / {total}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={safePage >= total - 1}
          className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="下一页"
        >
          翻页 →
        </button>
      </div>
    </div>
  );
}
