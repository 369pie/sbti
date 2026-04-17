'use client';

/**
 * Card detail drawer — bottom sheet on mobile, side modal on desktop.
 * Shows: large image + headline + slogan (荒诞文学) + 3 CTAs:
 *   1. 去做 [tabLabel] 测试  (or "查看完整解读" if already unlocked)
 *   2. 浏览同系列  (close + scroll to grid)
 *   3. 复制小红书文案  (W2: screenshot generator placeholder)
 *
 * Locked cards show a teaser headline + "??? 解锁后揭晓" body to preserve
 * the reveal moment.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import type { GalleryItem, GalleryTab } from '@/app/types/gallery-data';
import { getFeaturedCopy } from '@/lib/museum/featured-slogans';
import { trackMuseum } from '@/lib/museum/analytics';
import { generateShareCard, downloadBlob } from '@/lib/museum/share-card';

export interface CardDrawerPayload {
  tab: Pick<GalleryTab, 'id' | 'label' | 'emoji' | 'accent' | 'testHref'>;
  item: GalleryItem;
  isUnlocked: boolean;
}

interface CardDrawerProps {
  payload: CardDrawerPayload | null;
  onClose: () => void;
}

export default function CardDrawer({ payload, onClose }: CardDrawerProps) {
  const isOpen = payload !== null;

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Esc to close + analytics on open
  useEffect(() => {
    if (!isOpen || !payload) return;
    trackMuseum('museum_card_drawer_open', {
      tab: payload.tab.id,
      slug: payload.item.slug,
      unlocked: payload.isUnlocked,
    });
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, payload, onClose]);

  const handleClose = useCallback(() => {
    if (payload) {
      trackMuseum('museum_card_drawer_close', { tab: payload.tab.id, slug: payload.item.slug });
    }
    onClose();
  }, [payload, onClose]);

  const handleTakeTest = useCallback(() => {
    if (!payload) return;
    trackMuseum('museum_card_unlock_test_click', {
      tab: payload.tab.id,
      slug: payload.item.slug,
      unlocked: payload.isUnlocked,
    });
  }, [payload]);

  const [sharing, setSharing] = useState(false);
  const handleShare = useCallback(async () => {
    if (!payload || sharing) return;
    setSharing(true);
    trackMuseum('museum_screenshot_intent', { tab: payload.tab.id, slug: payload.item.slug });
    try {
      // Prefer thumbnail webp for performance; fall back to full image
      const imgSrc = payload.item.image;
      const blob = await generateShareCard({
        imageSrc: imgSrc,
        name: payload.item.name,
        tagline: payload.item.tagline,
        code: payload.item.code,
        accentColor: payload.tab.accent,
        tabLabel: payload.tab.label,
        tabEmoji: payload.tab.emoji,
      });
      downloadBlob(blob, `wtfti-${payload.tab.id}-${payload.item.slug}.png`);
    } catch (err) {
      console.error('[share-card]', err);
    } finally {
      setSharing(false);
    }
  }, [payload, sharing]);

  if (!isOpen || !payload) return null;

  const { tab, item, isUnlocked } = payload;
  const copy = getFeaturedCopy(tab.id, item.slug);
  const accent = tab.accent;

  // Locked teaser preserves mystery
  const headline = isUnlocked ? (copy?.headline ?? item.name) : '??? 未解锁';
  const longCopy = isUnlocked
    ? (copy?.sloganLong ?? item.tagline)
    : `这是「${tab.label}」系列的一张人设卡。做完测试后，您可能会、也可能不会落到这里。`;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-drawer-headline"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="关闭"
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px] animate-fade-in"
        style={{ animationDuration: '180ms' }}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-lg sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up"
        style={{
          background: 'var(--color-bg-elevated)',
          border: `1px solid ${accent}33`,
          animationDuration: '320ms',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden sticky top-0 pt-2.5 pb-1 flex justify-center" style={{ background: 'var(--color-bg-elevated)' }}>
          <span className="block w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        {/* Close (desktop) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="关闭"
          className="hidden sm:flex absolute top-4 right-4 w-9 h-9 rounded-full items-center justify-center text-text-muted hover:bg-black/5 transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="px-5 sm:px-8 pt-3 sm:pt-8 pb-7 sm:pb-9">
          {/* Issue marker */}
          <div className="flex items-center gap-3 mb-4">
            <span className="serial-number text-xs" style={{ color: accent }}>
              {tab.emoji} {tab.label}
            </span>
            <span className="editorial-rule flex-1 max-w-[60px]" style={{ background: `${accent}55` }} />
            <span className="eyebrow text-[10px]" style={{ color: accent }}>
              {isUnlocked ? '· 已解锁 ·' : '· 未解锁 ·'}
            </span>
          </div>

          {/* Big image */}
          <div
            className="relative w-full aspect-square rounded-2xl overflow-hidden mb-5 flex items-center justify-center"
            style={{
              background: `linear-gradient(160deg, ${accent}1a 0%, ${accent}06 60%, transparent 100%)`,
            }}
          >
            {/* Corner ornaments */}
            <span className="absolute top-3 left-3 opacity-40 text-base" style={{ color: accent }}>✦</span>
            <span className="absolute top-3 right-3 opacity-40 text-base" style={{ color: accent }}>✦</span>
            <span className="absolute bottom-3 left-3 opacity-40 text-base" style={{ color: accent }}>✦</span>
            <span className="absolute bottom-3 right-3 opacity-40 text-base" style={{ color: accent }}>✦</span>

            {item.image ? (
              <NextImage
                src={item.image}
                alt={item.name}
                width={520}
                height={520}
                className="w-[72%] h-[72%] object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.18)]"
                style={isUnlocked ? undefined : { filter: 'grayscale(0.85) blur(6px)', opacity: 0.7 }}
              />
            ) : (
              <div className="text-7xl">{item.emoji ?? '✦'}</div>
            )}

            {!isUnlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl mb-1.5" aria-hidden>🔒</span>
                <span className="eyebrow text-[10px]" style={{ color: accent }}>
                  做测试解锁
                </span>
              </div>
            )}
          </div>

          {/* Code + headline */}
          <div className="mb-3">
            <span
              className="text-[11px] font-mono tracking-[0.22em] uppercase block mb-1.5"
              style={{ color: accent, opacity: 0.75 }}
            >
              {item.code}
            </span>
            <h2 id="card-drawer-headline" className="section-headline text-2xl sm:text-3xl leading-tight">
              {headline}
            </h2>
            {item.rarity && (
              <span
                className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                style={{
                  color: item.rarity.color,
                  background: item.rarity.bgColor,
                  borderColor: `${item.rarity.color}40`,
                }}
              >
                {item.rarity.label}
              </span>
            )}
          </div>

          {/* Slogan (荒诞文学) */}
          <p className="text-base sm:text-lg leading-[1.7] text-text-secondary mb-6">
            {longCopy}
          </p>

          <hr className="editorial-rule-soft mb-6" />

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <Link
              href={isUnlocked ? item.href : tab.testHref}
              prefetch={false}
              onClick={handleTakeTest}
              className="btn w-full"
              style={{
                background: accent,
                color: '#fff',
                border: `1px solid ${accent}`,
              }}
            >
              {isUnlocked ? '查看完整解读' : `去做 ${tab.label} 测试解锁`}
              <span className="opacity-70">→</span>
            </Link>

            {/* Share card — only for unlocked cards */}
            {isUnlocked && (
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="btn btn-ghost w-full"
                style={{ borderColor: `${accent}40`, color: accent, opacity: sharing ? 0.6 : 1 }}
              >
                {sharing ? '生成中…' : '📲 生成小红书收藏图'}
              </button>
            )}

            <Link
              href={tab.testHref}
              prefetch={false}
              className="btn btn-ghost w-full"
              style={{ borderColor: `${accent}28`, color: 'var(--color-text-muted)' }}
            >
              浏览 {tab.emoji} {tab.label} 全套
            </Link>
          </div>

          {/* Footer hint */}
          <p className="text-[11px] text-text-muted text-center mt-5 leading-relaxed">
            点击空白处 / 按 Esc 关闭{isUnlocked ? ' · 点击上方按钮生成图片' : ' · 做完测试再来解锁这张'}
          </p>
        </div>
      </div>
    </div>
  );
}
