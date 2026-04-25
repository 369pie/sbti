'use client';

/**
 * DailyPickOverlay (W2) — "今日封印 · 每日一卡" experience.
 *
 * What it shows:
 *   1. Season chip (节气 / 月相 from season.ts) + date
 *   2. A featured card (60/40 unlocked/locked bias from daily-pick.ts)
 *      - Front: tilt + holo if unlocked, otherwise SealedCard
 *      - Back (after flip): seasonal one-liner + unlock-path
 *   3. CTAs: 截图发小红书 / 找闺蜜也翻一张 / ❤︎ 收藏
 *
 * Modes:
 *   - mode="overlay": fixed fullscreen overlay, dismissable
 *   - mode="page":    flat block usable inside a route (no backdrop)
 *
 * Auto-marks "seen" when opened to suppress re-popups for the same day.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import type { GalleryTab } from '@/app/types/gallery-data';
import { getSeasonInfo, formatSeasonHeader } from '@/lib/museum/season';
import { pickDailyCard, getOrCreateUserSeed, markDailyPickSeen, type DailyPick } from '@/lib/museum/daily-pick';
import { isFav, toggleFav } from '@/lib/museum/daily-favs';

const MOON_EMOJI: Record<string, string> = {
  new: '🌑',
  waxing: '🌓',
  full: '🌕',
  waning: '🌗',
};
import { buildUnlockPath } from '@/lib/museum/unlock-path';
import { useMuseumUnlocked } from '@/lib/museum/unlocked';
import { trackMuseum } from '@/lib/museum/analytics';
import { generateShareCard, downloadBlob } from '@/lib/museum/share-card';
import CardTilt from './CardTilt';
import CardFlip from './CardFlip';
import SealedCard from './SealedCard';

interface DailyPickOverlayProps {
  allTabs: GalleryTab[];
  mode?: 'overlay' | 'page';
  onClose?: () => void;
  /** Override today's date for /types/today/?date=2026-04-19 testing */
  isoDateOverride?: string;
}

export default function DailyPickOverlay({
  allTabs,
  mode = 'overlay',
  onClose,
  isoDateOverride,
}: DailyPickOverlayProps) {
  const unlocked = useMuseumUnlocked();
  const [pick, setPick] = useState<DailyPick | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [favOn, setFavOn] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [allowBackdropClose, setAllowBackdropClose] = useState(mode === 'page');

  // Compute pick once per render (depends on unlocked set)
  useEffect(() => {
    const seed = getOrCreateUserSeed();
    const next = pickDailyCard({
      allTabs,
      unlockedKeys: unlocked.keys,
      seedOverride: seed,
      dateOverride: isoDateOverride,
    });
    if (!next) return;
    setPick(next);
    markDailyPickSeen(next.isoDate);
    trackMuseum('daily_pick_view', {
      tab: next.tabId,
      slug: next.slug,
      unlocked: next.isUnlocked,
      date: next.isoDate,
    });
  }, [allTabs, unlocked.keys, isoDateOverride]);

  const season = useMemo(() => {
    const date = isoDateOverride ? new Date(`${isoDateOverride}T00:00:00+08:00`) : new Date();
    return getSeasonInfo(date);
  }, [isoDateOverride]);

  const seasonHeader = useMemo(() => formatSeasonHeader(season), [season]);

  // Track season palette impression once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flag = '__museum_season_seen';
    const w = window as unknown as Record<string, boolean>;
    if (w[flag]) return;
    w[flag] = true;
    trackMuseum('season_palette_seen', { tab: season.season, source: season.festival ?? 'season' });
  }, [season]);

  // Sync fav state when pick resolves
  useEffect(() => {
    if (!pick) return;
    setFavOn(isFav({ isoDate: pick.isoDate, tabId: pick.tabId, slug: pick.slug }));
  }, [pick]);

  // Guard against immediate close when overlay is opened by click.
  useEffect(() => {
    if (mode !== 'overlay') return;
    setAllowBackdropClose(false);
    const t = window.setTimeout(() => setAllowBackdropClose(true), 180);
    return () => window.clearTimeout(t);
  }, [mode]);

  const handleFlip = useCallback((next: boolean) => {
    setFlipped(next);
    if (next && pick) {
      trackMuseum('daily_pick_flip', { tab: pick.tabId, slug: pick.slug });
    }
  }, [pick]);

  const handleToggleFav = useCallback(() => {
    if (!pick) return;
    const next = toggleFav({ isoDate: pick.isoDate, tabId: pick.tabId, slug: pick.slug });
    setFavOn(next);
    trackMuseum('daily_pick_fav_toggle', {
      tab: pick.tabId,
      slug: pick.slug,
      unlocked: next,
    });
  }, [pick]);

  const handleShare = useCallback(async () => {
    if (!pick || sharing) return;
    setSharing(true);
    trackMuseum('daily_pick_share', { tab: pick.tabId, slug: pick.slug });
    try {
      const blob = await generateShareCard({
        imageSrc: pick.item.image,
        name: pick.isUnlocked ? pick.item.name : `${pick.tab.label} · 待揭晓`,
        tagline: `${seasonHeader} · ${season.signLine}`,
        code: pick.item.code,
        accentColor: season.palette.accent || pick.tab.accent,
        tabLabel: pick.tab.label,
        tabEmoji: MOON_EMOJI[season.moon] ?? pick.tab.emoji,
      });
      downloadBlob(blob, `wtfti-today-${pick.isoDate}-${pick.slug}.png`);
    } catch (err) {
      console.error('[daily-pick share]', err);
    } finally {
      setSharing(false);
    }
  }, [pick, sharing, seasonHeader, season]);

  const handleInvite = useCallback(async () => {
    if (!pick) return;
    trackMuseum('daily_pick_invite', { tab: pick.tabId, slug: pick.slug });
    const url = `${window.location.origin}/types/today/`;
    const text = `今日给我封印的是「${pick.isUnlocked ? pick.item.name : '待揭晓'}」 — 你也来翻一张 ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '找闺蜜也翻一张', text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // user cancelled
    }
  }, [pick]);

  if (!pick) {
    return mode === 'overlay' ? null : (
      <div className="text-center text-text-muted text-sm py-12">正在为您挑选今日封印…</div>
    );
  }

  const tab = pick.tab;
  const item = pick.item;
  const accent = season.palette.accent || tab.accent;
  const isUnlocked = pick.isUnlocked;

  const unlockPath = buildUnlockPath({
    tabId: tab.id,
    tabLabel: tab.label,
    testHref: tab.testHref,
    slug: item.slug,
    tabStarted: false,
  });

  const cardFront = (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden flex items-center justify-center"
      style={{
        background: isUnlocked
          ? `linear-gradient(160deg, ${accent}28 0%, ${accent}0a 60%, transparent 100%)`
          : undefined,
        border: isUnlocked ? `1px solid ${accent}40` : 'none',
        boxShadow: isUnlocked ? `0 24px 60px ${accent}1f` : '0 24px 60px rgba(31,26,22,0.18)',
      }}
    >
      {isUnlocked ? (
        <>
          <span className="absolute top-3 left-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
          <span className="absolute top-3 right-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
          <span className="absolute bottom-3 left-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
          <span className="absolute bottom-3 right-3 opacity-50 text-base" style={{ color: accent }}>✦</span>
          {item.image ? (
            <NextImage
              src={item.image}
              alt={item.name}
              width={600}
              height={600}
              priority
              className="w-[78%] h-[78%] object-contain drop-shadow-[0_22px_40px_rgba(0,0,0,0.28)]"
              draggable={false}
            />
          ) : (
            <div className="text-8xl">{item.emoji ?? '✦'}</div>
          )}
          <div className="absolute left-5 right-5 bottom-5">
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase block mb-1 opacity-70" style={{ color: accent }}>
              {item.code}
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
              {item.name}
            </h3>
          </div>
        </>
      ) : (
        <SealedCard
          accent={accent}
          sealStyle={season.sealStyle}
          isHidden={Boolean(item.isSpecial)}
          code={item.code}
          tabLabel={tab.label}
          interactive
          className="rounded-3xl"
        />
      )}
    </div>
  );

  const cardBack = (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8"
      style={{
        background: `linear-gradient(170deg, ${accent}14 0%, var(--color-bg-elevated) 60%)`,
        border: `1px solid ${accent}40`,
        boxShadow: `0 24px 60px ${accent}1a`,
      }}
    >
      <span className="absolute top-3 left-3 opacity-40 text-base" style={{ color: accent }}>✦</span>
      <span className="absolute top-3 right-3 opacity-40 text-base" style={{ color: accent }}>✦</span>
      <span className="absolute bottom-3 left-3 opacity-40 text-base" style={{ color: accent }}>✦</span>
      <span className="absolute bottom-3 right-3 opacity-40 text-base" style={{ color: accent }}>✦</span>

      <span className="text-[10px] font-mono tracking-[0.22em] uppercase opacity-70" style={{ color: accent }}>
        今日封印 · 卡背
      </span>
      <p className="mt-3 text-base sm:text-lg leading-[1.7] text-text-secondary" style={{ fontFamily: 'var(--font-serif)' }}>
        {isUnlocked ? (item.tagline || '一句仅属于今天的话。') : `「${tab.label}」系列 · 还没揭晓`}
      </p>

      <div className="mt-auto pt-4 border-t border-text-muted/15">
        <span className="text-[10px] font-mono tracking-[0.22em] uppercase opacity-70" style={{ color: accent }}>
          {unlockPath.headline}
        </span>
        <ul className="mt-2 space-y-1.5">
          {unlockPath.steps.map((step, i) => (
            <li key={i} className="text-xs sm:text-sm text-text-secondary leading-snug flex gap-2">
              <span className="font-mono opacity-60 mt-0.5" style={{ color: accent }}>0{i + 1}</span>
              <span>{step.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-text-muted leading-relaxed">{unlockPath.tail}</p>
      </div>
    </div>
  );

  const body = (
    <div className="w-full max-w-[560px] mx-auto animate-fade-up">
      <div
        className="rounded-[28px] border p-4 sm:p-5 md:p-6 max-h-[calc(100vh-2.5rem)] overflow-y-auto overscroll-contain"
        style={{
          background: `linear-gradient(180deg, ${season.palette.tintSoft}, rgba(255,253,249,0.96))`,
          borderColor: `${accent}2f`,
          boxShadow: '0 28px 70px rgba(20, 14, 24, 0.28)',
        }}
      >
      {/* Season header */}
      <div className="text-center mb-3 sm:mb-4">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono tracking-[0.18em] uppercase"
          style={{
            color: accent,
            background: `${accent}10`,
            border: `1px solid ${accent}30`,
          }}
        >
          <span aria-hidden>{MOON_EMOJI[season.moon] ?? '✦'}</span>
          {seasonHeader}
        </span>
        <p className="mt-2 text-sm sm:text-base text-text-secondary" style={{ fontFamily: 'var(--font-serif)' }}>
          {season.signLine}
        </p>
      </div>

      {/* Card */}
      <div className="mb-3 sm:mb-4 h-[clamp(260px,42vh,430px)] sm:h-[clamp(340px,52vh,540px)]">
        <CardTilt
          holo={isUnlocked}
          maxTilt={isUnlocked ? 9 : 5}
          radius="1.5rem"
          className="w-full h-full"
        >
          <CardFlip
            flipped={flipped}
            onFlip={handleFlip}
            front={cardFront}
            back={cardBack}
            radius="1.5rem"
            className="w-full h-full"
            ariaLabel={flipped ? '翻回卡面' : '翻开卡背'}
          />
        </CardTilt>
      </div>

      {/* Hint */}
      <p className="text-center text-[11px] text-text-muted mb-3">
        {flipped ? '↺ 再点一次翻回正面' : '点一下卡片 · 看看背面留给你的那句话'}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 rounded-2xl border p-2.5 sm:p-3 backdrop-blur-sm" style={{ borderColor: `${accent}22`, background: 'rgba(255,255,255,0.74)' }}>
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="btn w-full"
          style={{ background: accent, color: 'var(--color-bg-primary)', border: `1px solid ${accent}`, opacity: sharing ? 0.6 : 1 }}
        >
          {sharing ? '生成中…' : '📲 截图发小红书'}
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleInvite}
            className="btn btn-ghost w-full"
            style={{ borderColor: `${accent}40`, color: accent }}
          >
            {copied ? '✓ 已复制邀请' : '👯 找闺蜜也翻一张'}
          </button>
          <button
            type="button"
            onClick={handleToggleFav}
            aria-pressed={favOn}
            className="btn btn-ghost w-full"
            style={{
              borderColor: favOn ? accent : `${accent}40`,
              color: favOn ? 'var(--color-bg-primary)' : accent,
              background: favOn ? accent : 'transparent',
            }}
          >
            {favOn ? '❤︎ 已收藏' : '♡ 收藏这张'}
          </button>
        </div>

        {isUnlocked ? (
          <Link
            href={item.href}
            prefetch={false}
            className="btn btn-ghost w-full"
            style={{ borderColor: `${accent}28`, color: 'var(--color-text-muted)' }}
          >
            查看「{item.name}」完整解读 →
          </Link>
        ) : (
          <Link
            href={tab.testHref}
            prefetch={false}
            className="btn btn-ghost w-full"
            style={{ borderColor: `${accent}28`, color: 'var(--color-text-muted)' }}
          >
            去做 {tab.label} 测试 · 也许就是这张 →
          </Link>
        )}

        <Link
          href="/types/"
          prefetch={false}
          className="text-center text-[11px] text-text-muted underline-offset-4 hover:underline mt-1"
          onClick={onClose}
        >
          返回图鉴馆
        </Link>
      </div>
      </div>
    </div>
  );

  if (mode === 'page') {
    return body;
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="今日封印"
    >
      <button
        type="button"
        aria-label="关闭"
        onClick={() => {
          if (!allowBackdropClose) return;
          onClose?.();
        }}
        className="absolute inset-0 bg-black/55 backdrop-blur-md animate-fade-in"
        style={{ animationDuration: '180ms' }}
      />
      <div className="relative w-full py-5 sm:py-8 px-3 sm:px-4">
        {body}
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 flex items-center justify-center text-bg-primary/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
