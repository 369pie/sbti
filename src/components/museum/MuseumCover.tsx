'use client';

/**
 * Museum cover — magazine-style hero. Renders 1 large hero card + 2 side
 * cards from today's featured pool, plus a "🎲 随便给我一张" random button.
 *
 * Pure presentation; data comes from server util getDailyFeatured().
 */

import { useCallback, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import type { FeaturedCard } from '@/lib/museum/featured';
import { trackMuseum } from '@/lib/museum/analytics';

interface MuseumCoverProps {
  featured: FeaturedCard[];
  /** Total number of cards in the museum (for cover stats). */
  totalCards: number;
  /** Number of series/tabs (for cover stats). */
  totalSeries: number;
  /** Called when user clicks a featured card. Receives `${tabId}:${slug}`. */
  onCardClick: (key: string) => void;
  /** Called when user clicks the 🎲 random button — smart random is owned by caller. */
  onRandom: () => void;
}

export default function MuseumCover({ featured, totalCards, totalSeries, onCardClick, onRandom }: MuseumCoverProps) {
  const seenRef = useRef(false);

  useEffect(() => {
    if (seenRef.current) return;
    seenRef.current = true;
    trackMuseum('museum_view', { total_cards: totalCards });
  }, [totalCards]);

  const handlePickFeatured = useCallback((key: string, idx: number) => {
    trackMuseum('museum_cover_cta_click', { source: 'featured', slug: key, position: idx });
    onCardClick(key);
  }, [onCardClick]);

  if (featured.length === 0) return null;

  const [hero, ...rest] = featured;

  return (
    <section className="relative animate-fade-up">
      {/* Issue marker — same language as homepage */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <span className="serial-number text-sm">Issue 03</span>
        <span className="editorial-rule flex-1 max-w-[80px]" />
        <span className="eyebrow">The Museum · 今日特辑</span>
      </div>

      {/* Hero headline */}
      <h1 className="mb-3 sm:mb-4">
        <span
          className="editorial-display block text-4xl sm:text-6xl md:text-7xl"
          style={{ color: 'var(--color-ink)' }}
        >
          图鉴馆<span className="editorial-italic mx-2 sm:mx-3" style={{ color: 'var(--color-rose-deep)' }}>The Museum</span>
        </span>
      </h1>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mb-6 sm:mb-8">
        {totalCards} 张人设卡，{totalSeries} 个系列。今天的您，会抽到哪一张？
      </p>

      {/* Cover layout: hero left, two side cards right (stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
        {/* Hero — 3/5 width */}
        <button
          type="button"
          onClick={() => handlePickFeatured(`${hero.tabId}:${hero.item.slug}`, 0)}
          className="group relative md:col-span-3 aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden text-left transition-transform duration-500 hover:-translate-y-1 active:translate-y-0"
          style={{
            background: `linear-gradient(160deg, ${hero.tabAccent}26 0%, ${hero.tabAccent}0a 60%, transparent 100%)`,
            border: `1px solid ${hero.tabAccent}33`,
          }}
        >
          {/* Editorial corners ✦ */}
          <span className="absolute top-3 left-3 text-base opacity-40" style={{ color: hero.tabAccent }}>✦</span>
          <span className="absolute top-3 right-3 text-base opacity-40" style={{ color: hero.tabAccent }}>✦</span>
          <span className="absolute bottom-3 left-3 text-base opacity-40" style={{ color: hero.tabAccent }}>✦</span>
          <span className="absolute bottom-3 right-3 text-base opacity-40" style={{ color: hero.tabAccent }}>✦</span>

          {/* Issue marker */}
          <div className="absolute top-5 left-5 right-5 flex items-baseline justify-between">
            <span className="eyebrow text-[10px]" style={{ color: hero.tabAccent }}>
              {hero.tabEmoji} {hero.tabLabel}
            </span>
            <span className="serial-number text-xs" style={{ color: hero.tabAccent }}>
              Today / 01
            </span>
          </div>

          {/* Character image — centered, large */}
          <div className="absolute inset-0 flex items-center justify-center pt-12 pb-32">
            {hero.item.image ? (
              <NextImage
                src={hero.item.image}
                alt={hero.item.name}
                width={520}
                height={520}
                priority
                fetchPriority="high"
                className="w-[68%] h-[68%] object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="text-7xl">{hero.item.emoji ?? '✦'}</div>
            )}
          </div>

          {/* Bottom copy */}
          <div className="absolute left-5 right-5 bottom-5">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase opacity-60 mb-1.5 block" style={{ color: hero.tabAccent }}>
              {hero.item.code}
            </span>
            <h2 className="section-headline text-2xl sm:text-3xl mb-2 leading-tight">
              {hero.copy.headline}
            </h2>
            <p className="text-sm text-text-secondary leading-snug line-clamp-2">
              {hero.copy.kicker}
            </p>
          </div>
        </button>

        {/* Side stack — 2/5 width */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
          {rest.slice(0, 2).map((card, idx) => {
            const key = `${card.tabId}:${card.item.slug}`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePickFeatured(key, idx + 1)}
                className="group relative aspect-[4/5] md:aspect-auto md:flex-1 rounded-2xl overflow-hidden text-left transition-transform duration-500 hover:-translate-y-1 active:translate-y-0"
                style={{
                  background: `linear-gradient(160deg, ${card.tabAccent}1f 0%, ${card.tabAccent}08 60%, transparent 100%)`,
                  border: `1px solid ${card.tabAccent}28`,
                }}
              >
                <span className="absolute top-2.5 left-2.5 text-xs opacity-50" style={{ color: card.tabAccent }}>✦</span>
                <span className="absolute top-2.5 right-2.5 text-xs opacity-50" style={{ color: card.tabAccent }}>✦</span>

                <div className="absolute top-4 left-4 right-4 flex items-baseline justify-between">
                  <span className="eyebrow text-[9px]" style={{ color: card.tabAccent }}>
                    {card.tabLabel}
                  </span>
                  <span className="serial-number text-[10px]" style={{ color: card.tabAccent }}>
                    0{idx + 2}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pt-10 pb-20">
                  {card.item.image ? (
                    <NextImage
                      src={card.item.image}
                      alt={card.item.name}
                      width={280}
                      height={280}
                      className="w-[64%] h-[64%] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="text-5xl">{card.item.emoji ?? '✦'}</div>
                  )}
                </div>

                <div className="absolute left-4 right-4 bottom-4">
                  <h3 className="section-headline text-base sm:text-lg leading-tight mb-1">
                    {card.copy.headline}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-text-muted leading-snug line-clamp-2">
                    {card.copy.kicker}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Random pick CTA */}
      <div className="flex items-center gap-3 mt-6 sm:mt-8">
        <button
          type="button"
          onClick={onRandom}
          className="btn btn-ink"
        >
          <span aria-hidden>🎲</span>
          随便给我一张
        </button>
        <span className="eyebrow hidden sm:inline">每日精选 · 凌晨 8:00 更新</span>
      </div>

      <hr className="editorial-rule-soft mt-10 sm:mt-14" />
    </section>
  );
}
