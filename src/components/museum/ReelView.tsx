'use client';

/**
 * ReelView (W4) — fullscreen-ish auto-play 5s/card carousel.
 * Plays/pauses/skips. Tap to open drawer.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import type { GalleryItem } from '@/app/types/gallery-data';
import { trackMuseum } from '@/lib/museum/analytics';
import CardTilt from './CardTilt';
import SealedCard from './SealedCard';
import type { SealStyle } from '@/lib/museum/season';
import { getItemRarityTier, isHoloTier } from '@/lib/museum/rarity';

interface ReelViewProps {
  items: GalleryItem[];
  tabId: string;
  tabAccent: string;
  unlockedKeys: Set<string>;
  sealStyle: SealStyle;
  onOpen: (key: string) => void;
}

const STEP_MS = 5000;

export default function ReelView({
  items, tabId, tabAccent, unlockedKeys, sealStyle, onOpen,
}: ReelViewProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);

  const advance = useCallback((delta: number) => {
    setIndex((i) => {
      const n = items.length;
      if (n === 0) return 0;
      return (i + delta + n) % n;
    });
  }, [items.length]);

  // Auto-play timer
  useEffect(() => {
    if (!playing || items.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, STEP_MS);
    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, items.length]);

  // Reset on items change.
  useEffect(() => {
    const t = window.setTimeout(() => setIndex(0), 0);
    return () => window.clearTimeout(t);
  }, [items]);

  // Track play/pause
  const onTogglePlay = useCallback(() => {
    setPlaying((p) => {
      trackMuseum(p ? 'reel_pause' : 'reel_play', { tab: tabId });
      return !p;
    });
  }, [tabId]);

  const onSkip = useCallback((delta: number) => () => {
    trackMuseum('reel_skip', { tab: tabId, dir: delta });
    advance(delta);
  }, [advance, tabId]);

  // Keyboard arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance(1);
      else if (e.key === 'ArrowLeft') advance(-1);
      else if (e.key === ' ') { e.preventDefault(); onTogglePlay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance, onTogglePlay]);

  if (items.length === 0) {
    return <div className="py-12 text-center text-text-muted text-sm">该筛选下暂无卡片可播放</div>;
  }

  const item = items[index];
  const key = `${tabId}:${item.slug}`;
  const isUnlocked = unlockedKeys.has(key);
  const tier = getItemRarityTier(item);
  const holo = isUnlocked && isHoloTier(tier);

  return (
    <div className="animate-fade-in">
      <div
        className="relative w-full rounded-2xl border overflow-hidden paper-texture"
        style={{
          aspectRatio: '5 / 7',
          maxHeight: '78vh',
          borderColor: `${tabAccent}33`,
          background: `linear-gradient(160deg, ${tabAccent}1a, var(--color-bg-elevated))`,
        }}
      >
        {/* Index pip strip */}
        <div className="absolute top-3 inset-x-3 z-10 flex gap-1">
          {items.map((_, i) => (
            <span
              key={i}
              className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ background: i === index ? tabAccent : `${tabAccent}30` }}
            >
              {i === index && playing && (
                <span
                  className="block h-full"
                  style={{
                    background: '#fff',
                    width: '100%',
                    transformOrigin: 'left',
                    animation: `reel-progress ${STEP_MS}ms linear forwards`,
                  }}
                />
              )}
            </span>
          ))}
        </div>

        {/* Card */}
        <button
          type="button"
          onClick={() => onOpen(key)}
          aria-label={isUnlocked ? `查看 ${item.name}` : `${item.name}（未解锁）`}
          className="absolute inset-0 flex items-center justify-center pt-12 pb-24 px-6"
        >
          {isUnlocked ? (
            holo ? (
              <CardTilt holo radius="0.75rem" maxTilt={6} className="w-[70%] aspect-[3/4]">
                {item.image ? (
                  <NextImage
                    src={item.image}
                    alt={item.name}
                    width={420}
                    height={560}
                    priority
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl">{item.emoji ?? '✦'}</div>
                )}
              </CardTilt>
            ) : item.image ? (
              <NextImage
                src={item.image}
                alt={item.name}
                width={420}
                height={560}
                priority
                className="w-[70%] aspect-[3/4] object-contain drop-shadow-xl"
              />
            ) : (
              <div className="text-6xl">{item.emoji ?? '✦'}</div>
            )
          ) : (
            <SealedCard
              accent={tabAccent}
              sealStyle={sealStyle}
              isHidden={Boolean(item.isSpecial)}
              code={item.code}
              className="w-[70%] aspect-[3/4]"
            />
          )}
        </button>

        {/* Bottom bar — code/name + controls */}
        <div className="absolute inset-x-0 bottom-0 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-sm" style={{ background: 'linear-gradient(to top, rgba(255,253,249,0.92), rgba(255,253,249,0))' }}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase block opacity-70" style={{ color: item.color }}>
                {item.code}
              </span>
              <h3 className="text-sm sm:text-base font-semibold truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                {isUnlocked ? item.name : '???'}
              </h3>
              <p className="text-[11px] text-text-muted truncate mt-0.5">
                {isUnlocked ? item.tagline : '做完测试解锁这张人设卡'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onSkip(-1)}
                aria-label="上一张"
                className="w-8 h-8 rounded-full border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >‹</button>
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={playing ? '暂停' : '播放'}
                className="w-9 h-9 rounded-full flex items-center justify-center text-bg-primary text-sm transition-transform hover:scale-105"
                style={{ background: tabAccent }}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                onClick={onSkip(1)}
                aria-label="下一张"
                className="w-8 h-8 rounded-full border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >›</button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-text-muted text-center">
        每 5 秒自动翻下一张 · 空格键暂停 · ←→ 切换
      </p>
      <style jsx>{`
        @keyframes reel-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
