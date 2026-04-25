'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import NextImage from 'next/image';
import type { GalleryItem, GalleryTab } from './gallery-data';
import MuseumCover from '@/components/museum/MuseumCover';
import MuseumProgress from '@/components/museum/MuseumProgress';
import CardDrawer, { type CardDrawerPayload } from '@/components/museum/CardDrawer';
import CardTilt from '@/components/museum/CardTilt';
import SealedCard from '@/components/museum/SealedCard';
import ViewModeSwitch from '@/components/museum/ViewModeSwitch';
import SetBonusBadges from '@/components/museum/SetBonusBadges';
import type { LightboxItem } from '@/components/museum/CardLightbox';
import { useMuseumUnlocked } from '@/lib/museum/unlocked';
import { trackMuseum } from '@/lib/museum/analytics';
import type { FeaturedCard } from '@/lib/museum/featured';
import { getSeasonInfo, type SealStyle } from '@/lib/museum/season';
import { loadViewMode, saveViewMode, type ViewMode } from '@/lib/museum/view-mode';
import { computeSetBonus } from '@/lib/museum/set-bonus';
import { encodePairSlug } from '@/lib/museum/cp-pair';
import { currentYm } from '@/lib/museum/monthly-recap';
import { computeFreePath, markViewModeSeen } from '@/lib/museum/free-path';
import BirthdayBadge from '@/components/museum/BirthdayBadge';
import SnapshotShareButton from '@/components/museum/SnapshotShareButton';

const FreePathPanel = dynamic(() => import('@/components/museum/FreePathPanel'), { ssr: false });

const CardLightbox = dynamic(() => import('@/components/museum/CardLightbox'), { ssr: false });
const DailyPickOverlay = dynamic(() => import('@/components/museum/DailyPickOverlay'), { ssr: false });
const BinderView = dynamic(() => import('@/components/museum/BinderView'), { ssr: false });
const PileView = dynamic(() => import('@/components/museum/PileView'), { ssr: false });
const ReelView = dynamic(() => import('@/components/museum/ReelView'), { ssr: false });
const ConstellationView = dynamic(() => import('@/components/museum/ConstellationView'), { ssr: false });

function compactMark(value: string | undefined, fallback: string) {
  const source = (value || fallback).replace(/[^\dA-Za-z\u4e00-\u9fa5]/g, '');
  return (source.slice(0, 3) || fallback.slice(0, 2) || 'TI').toUpperCase();
}

function ArrowIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function CodeGlyph({
  code,
  label,
  color,
  className = 'h-12 w-12',
}: {
  code?: string;
  label: string;
  color?: string;
  className?: string;
}) {
  return (
    <span className={`site-code-mark ${className}`} style={color ? { color } : undefined}>
      {compactMark(code, label)}
    </span>
  );
}

/* ── Gallery card ───────────────────────────────────────── */
interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  tabId: string;
  tabAccent: string;
  isUnlocked: boolean;
  sealStyle: SealStyle;
  onOpen: (key: string) => void;
  onPreview: (index: number) => void;
}

function GalleryCard({ item, index, tabId, tabAccent, isUnlocked, sealStyle, onOpen, onPreview }: GalleryCardProps) {
  const shouldPrioritizeImage = index < 4;
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(item.image) && !hasImageError;
  const isHidden = Boolean(item.isSpecial);
  const tilt = isUnlocked && (item.rarity?.label?.includes('SR') || item.rarity?.label?.includes('UR') || item.isSpecial);

  const handleClick = useCallback(() => {
    if (!isUnlocked) {
      trackMuseum('museum_locked_card_click', { tab: tabId, slug: item.slug });
    }
    onOpen(`${tabId}:${item.slug}`);
  }, [isUnlocked, tabId, item.slug, onOpen]);

  const handlePreview = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    onPreview(index);
  }, [onPreview, index]);

  // Long-press preview
  const longPressTimerRef = useRef<number | null>(null);
  const handlePointerDown = useCallback(() => {
    if (typeof window === 'undefined') return;
    longPressTimerRef.current = window.setTimeout(() => {
      onPreview(index);
    }, 480);
  }, [onPreview, index]);
  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const imageInner = showImage ? (
    <NextImage
      src={item.image}
      alt={item.name}
      width={384}
      height={384}
      loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
      fetchPriority={shouldPrioritizeImage ? 'high' : 'auto'}
      onError={() => setHasImageError(true)}
      className="w-[70%] h-[70%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
    />
  ) : (
    <div className="flex h-[70%] w-[70%] flex-col items-center justify-center rounded-xl border-2 border-border-subtle/30 bg-bg-elevated/20 text-center backdrop-blur-sm">
      <CodeGlyph code={item.code} label={item.name} color={item.color} className="h-14 w-14 sm:h-16 sm:w-16" />
      <span className="mt-2 px-3 text-xs sm:text-sm font-medium text-text-primary/85 line-clamp-2">{item.name}</span>
    </div>
  );

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 25}ms` }}>
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        aria-label={isUnlocked ? `查看 ${item.name}` : `${item.name}（未解锁）`}
        className="group block w-full text-left rounded-xl sm:rounded-2xl border border-border-subtle hover:border-accent/40 bg-bg-elevated hover:shadow-lg transition duration-300 overflow-hidden hover:-translate-y-1 active:translate-y-0 cursor-pointer"
      >
        <div
          className="relative w-full aspect-square overflow-hidden"
          style={
            isUnlocked
              ? { backgroundImage: `linear-gradient(135deg, ${item.color}12, ${item.color}06)` }
              : undefined
          }
        >
          {isUnlocked ? (
            tilt ? (
              <CardTilt holo radius="0.75rem" maxTilt={6} className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">{imageInner}</div>
              </CardTilt>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">{imageInner}</div>
            )
          ) : (
            <SealedCard
              accent={tabAccent}
              sealStyle={sealStyle}
              isHidden={isHidden}
              code={item.code}
              tabLabel={undefined}
              className="absolute inset-0"
            />
          )}

          {item.isSpecial && (
            <span className="absolute top-2.5 right-2.5 text-[9px] sm:text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-accent-dim text-accent backdrop-blur-sm border border-accent/20">
              特殊
            </span>
          )}
          {item.rarity && (
            <span
              className="absolute top-2.5 left-2.5 text-[9px] sm:text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border"
              style={{
                color: item.rarity.color,
                background: item.rarity.bgColor,
                borderColor: item.rarity.color + '40',
              }}
            >
              {item.rarity.label}
            </span>
          )}
          {!item.rarity && isUnlocked && (
            <span
              className="absolute top-2.5 left-2.5 rounded-full border px-2 py-0.5 text-[9px] font-mono tracking-[0.12em] backdrop-blur-sm"
              style={{
                color: item.color,
                background: `${item.color}12`,
                borderColor: `${item.color}35`,
              }}
            >
              {compactMark(item.code, item.name)}
            </span>
          )}

          {/* Preview eye (unlocked only) */}
          {isUnlocked && (
            <div
              role="button"
              tabIndex={0}
              onClick={handlePreview}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreview(); } }}
              aria-label="预览大图"
              className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-text-primary/35 hover:bg-text-primary/55 backdrop-blur-sm flex items-center justify-center text-bg-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span
                className="text-[9px] sm:text-[11px] font-mono tracking-widest block mb-1 sm:mb-0.5 uppercase opacity-75"
                style={{ color: item.color }}
              >
                {item.code}
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-text-primary truncate">
                {isUnlocked ? item.name : '???'}
              </h3>
            </div>
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted leading-snug line-clamp-1 mt-0.5 sm:mt-1">
            {isUnlocked ? item.tagline : '做完测试解锁这张人设卡'}
          </p>
        </div>
      </button>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

interface TabGroup {
  label: string;
  tabs: GalleryTab[];
}

interface TypesContentProps {
  coreGroup: GalleryTab[];
  ipGroup: GalleryTab[];
  themeGroup: GalleryTab[];
  totalCount: number;
  seriesCount: number;
  featured: FeaturedCard[];
}

const GROUP_LABELS: [string, string, string] = ['核心人格', '15维度 IP 宇宙', '独立主题测试'];

function TabButton({ tab, isActive, onClick }: { tab: GalleryTab; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium
        transition duration-200 whitespace-nowrap cursor-pointer flex-shrink-0
        ${isActive
          ? 'text-text-primary shadow-sm'
          : 'text-text-muted hover:text-text-secondary'
        }
      `}
      style={isActive ? {
        background: `linear-gradient(135deg, ${tab.accent}15, ${tab.accent}08)`,
        border: `1px solid ${tab.accent}40`,
        boxShadow: `0 0 12px ${tab.accent}20`,
      } : {
        border: '1px solid transparent',
        background: 'transparent',
      }}
    >
      <CodeGlyph code={tab.id} label={tab.label} color={tab.accent} className="h-6 w-6 text-[9px]" />
      <span className="text-[11px] sm:text-sm">{tab.label}</span>
      <span
        className="text-[9px] sm:text-[11px] font-mono ml-0.5 tabular-nums"
        style={{ color: isActive ? tab.accent : undefined }}
      >
        {tab.items.length}
      </span>
    </button>
  );
}

export default function TypesContent({
  coreGroup,
  ipGroup,
  themeGroup,
  totalCount,
  seriesCount,
  featured,
}: TypesContentProps) {
  const groups: TabGroup[] = useMemo(() => [
    { label: GROUP_LABELS[0], tabs: coreGroup },
    { label: GROUP_LABELS[1], tabs: ipGroup },
    { label: GROUP_LABELS[2], tabs: themeGroup },
  ], [coreGroup, ipGroup, themeGroup]);

  const allTabs = useMemo(() => groups.flatMap(g => g.tabs), [groups]);

  const itemsByKey = useMemo(() => {
    const m = new Map<string, { tab: GalleryTab; item: GalleryItem }>();
    for (const t of allTabs) {
      for (const i of t.items) m.set(`${t.id}:${i.slug}`, { tab: t, item: i });
    }
    return m;
  }, [allTabs]);

  // ── State ────────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(allTabs[0]?.id ?? 'sbti');
  const [drawerPayload, setDrawerPayload] = useState<CardDrawerPayload | null>(null);
  type FilterMode = 'all' | 'rarity' | 'special' | 'unlocked' | 'locked';
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [lightboxStart, setLightboxStart] = useState<number | null>(null);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [cpPickerForKey, setCpPickerForKey] = useState<string | null>(null);

  // Season info — lazy init so it's stable across renders within a session
  const season = useMemo(() => getSeasonInfo(), []);

  // Restore persisted view mode on mount (async to satisfy lint).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => setViewMode(loadViewMode()), 0);
    return () => window.clearTimeout(t);
  }, []);

  const handleViewMode = useCallback((m: ViewMode) => {
    setViewMode(m);
    saveViewMode(m);
    markViewModeSeen(m);
    trackMuseum('view_mode_switch', { mode: m });
  }, []);

  // Keep the daily pick user-initiated; ?daily=1 remains a direct-share entry.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const force = url.searchParams.get('daily') === '1';
    if (!force) return;
    const t = window.setTimeout(() => {
      setDailyOpen(true);
    }, 80);
    return () => window.clearTimeout(t);
  }, []);
  // ── Derived ──────────────────────────────────────────────────────────
  const activeTab = allTabs.find((tab) => tab.id === activeId) ?? allTabs[0];
  const unlocked = useMuseumUnlocked();

  const tabHasRarity = useMemo(() => activeTab.items.some(i => i.rarity), [activeTab]);
  const tabHasSpecial = useMemo(() => activeTab.items.some(i => i.isSpecial), [activeTab]);

  const filteredItems = useMemo(() => {
    if (filterMode === 'all') return activeTab.items;
    if (filterMode === 'rarity') return activeTab.items.filter(i => i.rarity);
    if (filterMode === 'special') return activeTab.items.filter(i => i.isSpecial);
    if (filterMode === 'unlocked') return activeTab.items.filter(i => unlocked.keys.has(`${activeTab.id}:${i.slug}`));
    if (filterMode === 'locked') return activeTab.items.filter(i => !unlocked.keys.has(`${activeTab.id}:${i.slug}`));
    return activeTab.items;
  }, [activeTab, filterMode, unlocked.keys]);

  const activeTabUnlockedCount = useMemo(() => {
    let n = 0;
    for (const item of activeTab.items) {
      if (unlocked.keys.has(`${activeTab.id}:${item.slug}`)) n++;
    }
    return n;
  }, [activeTab, unlocked.keys]);

  // Set-bonus badges (W3) — derive across ALL tabs; only show top 6.
  const setBonus = useMemo(() => computeSetBonus(allTabs, unlocked.keys), [allTabs, unlocked.keys]);
  const visibleBadges = useMemo(() => setBonus.badges.slice(0, 8), [setBonus.badges]);

  // Free Path (W4) — seasonal decoration milestones.
  const freePathReport = useMemo(() => computeFreePath(allTabs, unlocked.keys), [allTabs, unlocked.keys]);
  const achievedBadgeIds = useMemo(
    () => setBonus.badges.filter(b => b.achieved).map(b => b.id),
    [setBonus.badges],
  );

  // Constellation only valuable if active tab has any unlocked card.
  const viewModeEnabled = useMemo(() => ({
    constellation: activeTabUnlockedCount > 0,
  }), [activeTabUnlockedCount]);

  // ── Callbacks ────────────────────────────────────────────────────────
  const openDrawer = useCallback((key: string) => {
    const found = itemsByKey.get(key);
    if (!found) return;
    setDrawerPayload({
      tab: {
        id: found.tab.id,
        label: found.tab.label,
        emoji: found.tab.emoji,
        accent: found.tab.accent,
        testHref: found.tab.testHref,
      },
      item: found.item,
      isUnlocked: unlocked.keys.has(key),
    });
  }, [itemsByKey, unlocked.keys]);

  const closeDrawer = useCallback(() => setDrawerPayload(null), []);

  const handleTabClick = useCallback((tabId: string) => {
    setActiveId(tabId);
    setFilterMode('all');
    trackMuseum('museum_tab_switch', { tab: tabId });
  }, []);

  // Smart random: 65% bias toward tabs explored but cards still locked (discovery)
  const handleSmartRandom = useCallback(() => {
    if (allTabs.length === 0) return;
    const globalPool: string[] = [];
    const discoveryPool: string[] = [];
    // Derive which tab ids the user has started from the keys Set
    const startedTabIds = new Set<string>();
    for (const key of unlocked.keys) {
      startedTabIds.add(key.split(':')[0]);
    }
    for (const tab of allTabs) {
      const tabStarted = startedTabIds.has(tab.id);
      for (const item of tab.items) {
        const key = `${tab.id}:${item.slug}`;
        globalPool.push(key);
        if (tabStarted && !unlocked.keys.has(key)) {
          discoveryPool.push(key);
        }
      }
    }
    const pool = discoveryPool.length > 2 && Math.random() < 0.65 ? discoveryPool : globalPool;
    const key = pool[Math.floor(Math.random() * pool.length)];
    trackMuseum('museum_random_pick', { slug: key });
    openDrawer(key);
  }, [allTabs, unlocked, openDrawer]);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Magazine cover ── */}
      {featured.length > 0 && (
        <MuseumCover
          featured={featured}
          totalCards={totalCount}
          totalSeries={seriesCount}
          onCardClick={openDrawer}
          onRandom={handleSmartRandom}
        />
      )}

      {/* ── Daily pick entry (W2) ── */}
      <div className="mb-4 sm:mb-6 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <button
          type="button"
          onClick={() => setDailyOpen(true)}
          className="group w-full rounded-2xl border px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4 transition hover:-translate-y-0.5 hover:shadow-md text-left"
          style={{
            background: `linear-gradient(120deg, ${season.palette.tintSoft}, var(--color-bg-elevated))`,
            borderColor: `${season.palette.tint}55`,
          }}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase block mb-1" style={{ color: season.palette.accent }}>
              今日封印 · Today
            </span>
            <h3 className="text-base sm:text-lg font-semibold leading-tight truncate" style={{ fontFamily: 'var(--font-serif)' }}>
              {season.festivalLabel ?? season.seasonLabel} · {season.signLine}
            </h3>
            <p className="text-[11px] sm:text-xs text-text-muted mt-1 truncate">
              一张属于今天的人格签卡 · {season.moonLabel}
            </p>
          </div>
          <span
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border whitespace-nowrap group-hover:translate-x-0.5 transition-transform"
            style={{
              color: season.palette.accent,
              background: `${season.palette.accent}10`,
              borderColor: `${season.palette.accent}40`,
            }}
          >
            翻开
            <ArrowIcon className="h-3 w-3" />
          </span>
        </button>
      </div>

      {/* ── Progress card ── */}
      <MuseumProgress totalCards={totalCount} totalSeries={seriesCount} />

      {/* ── Section heading ── */}
      <div className="mb-4 sm:mb-6 animate-fade-up">
        <span className="serial-number text-xs mr-3">04</span>
        <span className="eyebrow">All Series · 全部图鉴</span>
        <h2 className="section-headline text-2xl sm:text-3xl mt-2">
          按系列浏览
        </h2>
      </div>

      {/* ── Grouped tab switcher ── */}
      <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 animate-fade-up" style={{ animationDelay: '50ms' }}>
        {groups.map((group) => (
          <div key={group.label}>
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.15em] text-text-muted uppercase block mb-2">
              {group.label}
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:pb-0">
              {group.tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeId}
                  onClick={() => handleTabClick(tab.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Active tab info + test CTA ── */}
      <div
        key={activeTab.id + '-desc'}
        className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {activeTab.description}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            <span className="serial-number text-[11px]" style={{ color: activeTab.accent }}>
              {activeTabUnlockedCount}
            </span>
            <span className="opacity-60"> / {activeTab.items.length} 已解锁</span>
            {activeTabUnlockedCount === 0 && (
              <span className="opacity-60"> · 做测试点亮第一张</span>
            )}
          </p>
        </div>
        <Link
          href={activeTab.testHref}
          prefetch={false}
          className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition whitespace-nowrap border shrink-0"
          style={{
            color: activeTab.accent,
            background: `${activeTab.accent}08`,
            borderColor: `${activeTab.accent}30`,
          }}
        >
          去测试
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── Set-bonus badges (W3) ── */}
      <SetBonusBadges badges={visibleBadges} accent={activeTab.accent} />

      {/* ── Free Path seasonal track (W4) ── */}
      <FreePathPanel report={freePathReport} accent={activeTab.accent} />

      {/* ── Birthday + share-snapshot tools row (W4 + W5) ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
        <BirthdayBadge accent={activeTab.accent} />
        <SnapshotShareButton unlockedKeys={unlocked.keys} badgeIds={achievedBadgeIds} accent={activeTab.accent} />
      </div>

      {/* ── Filter chips + view-mode switcher row (W3) ── */}
      <div
        key={activeTab.id + '-filters'}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4 sm:mb-5 animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
        <div className="flex flex-wrap gap-1.5">
        {(
          [
            { mode: 'all', label: `全部 ${activeTab.items.length}`, always: true },
            { mode: 'unlocked', label: `已解锁 ${activeTabUnlockedCount}`, always: true },
            { mode: 'locked', label: `未解锁 ${activeTab.items.length - activeTabUnlockedCount}`, always: true },
            { mode: 'rarity', label: '稀有款', always: false, visible: tabHasRarity },
            { mode: 'special', label: '隐藏款', always: false, visible: tabHasSpecial },
          ] as const
        )
          .filter(c => c.always || c.visible)
          .map(({ mode, label }) => {
            const isActive = filterMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className="text-[10px] sm:text-xs font-mono tracking-[0.1em] px-2.5 py-1 rounded-full border transition duration-150"
                style={isActive ? {
                  background: activeTab.accent,
                  color: 'var(--color-bg-primary)',
                  borderColor: activeTab.accent,
                } : {
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <ViewModeSwitch
          active={viewMode}
          onChange={handleViewMode}
          accent={activeTab.accent}
          enabled={viewModeEnabled}
        />
      </div>

      {/* ── Dispatched view (W3+W4) ── */}
      {viewMode === 'binder' ? (
        <BinderView
          items={filteredItems}
          tabId={activeTab.id}
          tabAccent={activeTab.accent}
          unlockedKeys={unlocked.keys}
          sealStyle={season.sealStyle}
          onOpen={openDrawer}
        />
      ) : viewMode === 'pile' ? (
        <PileView
          items={filteredItems}
          tabId={activeTab.id}
          tabAccent={activeTab.accent}
          unlockedKeys={unlocked.keys}
          sealStyle={season.sealStyle}
          onOpen={openDrawer}
        />
      ) : viewMode === 'reel' ? (
        <ReelView
          items={filteredItems}
          tabId={activeTab.id}
          tabAccent={activeTab.accent}
          unlockedKeys={unlocked.keys}
          sealStyle={season.sealStyle}
          onOpen={openDrawer}
        />
      ) : viewMode === 'constellation' ? (
        <ConstellationView
          items={activeTab.items}
          tabId={activeTab.id}
          tabAccent={activeTab.accent}
          unlockedKeys={unlocked.keys}
          onOpen={openDrawer}
        />
      ) : (
        <div
          key={activeTab.id + '-grid'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4 animate-fade-up"
          style={{ animationDelay: '150ms' }}
        >
          {filteredItems.length > 0 ? filteredItems.map((item, i) => {
            const key = `${activeTab.id}:${item.slug}`;
            return (
              <GalleryCard
                key={key}
                item={item}
                index={i}
                tabId={activeTab.id}
                tabAccent={activeTab.accent}
                isUnlocked={unlocked.keys.has(key)}
                sealStyle={season.sealStyle}
                onOpen={openDrawer}
                onPreview={(idx) => setLightboxStart(idx)}
              />
            );
          }) : (
            <div className="col-span-full py-12 text-center text-text-muted text-sm">
              该筛选下暂无卡片
            </div>
          )}
        </div>
      )}

      {/* ── Month + CP entry strip (W3) ── */}
      <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
        <Link
          href={`/types/month/${currentYm()}/`}
          prefetch={false}
          className="group rounded-2xl border bg-bg-elevated px-4 py-3.5 flex items-center justify-between gap-3 hover:-translate-y-0.5 transition"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="min-w-0">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted block">Monthly Recap</span>
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>本月合辑 · 拼图发圈</span>
          </div>
          <ArrowIcon className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
        <button
          type="button"
          onClick={() => setCpPickerForKey('pick-a')}
          className="group rounded-2xl border bg-bg-elevated px-4 py-3.5 flex items-center justify-between gap-3 hover:-translate-y-0.5 transition text-left"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="min-w-0">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted block">CP / 配对</span>
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>选两张卡 · 生成 CP 锐评</span>
          </div>
          <ArrowIcon className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* ── Card detail drawer ── */}
      <CardDrawer payload={drawerPayload} onClose={closeDrawer} />

      {/* ── Lightbox (W2) ── */}
      {lightboxStart !== null && (
        <CardLightbox
          items={filteredItems.map<LightboxItem>((it) => ({
            tabId: activeTab.id,
            tabLabel: activeTab.label,
            tabAccent: activeTab.accent,
            item: it,
            isUnlocked: unlocked.keys.has(`${activeTab.id}:${it.slug}`),
          }))}
          startIndex={lightboxStart}
          onClose={() => setLightboxStart(null)}
        />
      )}

      {/* ── Daily Pick overlay (auto / manual) ── */}
      {dailyOpen && (
        <DailyPickOverlay allTabs={allTabs} mode="overlay" onClose={() => setDailyOpen(false)} />
      )}

      {/* ── CP picker overlay (W3) ── */}
      {cpPickerForKey && (
        <CpPicker
          allTabs={allTabs}
          unlockedKeys={unlocked.keys}
          onClose={() => setCpPickerForKey(null)}
        />
      )}
    </>
  );
}

/* ── CP picker — quick 2-step list-based selector ─────────────────── */
interface CpPickerProps {
  allTabs: GalleryTab[];
  unlockedKeys: Set<string>;
  onClose: () => void;
}

function CpPicker({ allTabs, unlockedKeys, onClose }: CpPickerProps) {
  const [pickA, setPickA] = useState<{ tabId: string; slug: string } | null>(null);
  const [pickB, setPickB] = useState<{ tabId: string; slug: string } | null>(null);

  // Lock body scroll while open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Once both picked, navigate.
  useEffect(() => {
    if (!pickA || !pickB || typeof window === 'undefined') return;
    const slug = encodePairSlug({ tabA: pickA.tabId, slugA: pickA.slug, tabB: pickB.tabId, slugB: pickB.slug });
    const t = window.setTimeout(() => {
      window.location.href = `/types/cp/${slug}/`;
    }, 200);
    return () => window.clearTimeout(t);
  }, [pickA, pickB]);

  const step = pickA ? 'B' : 'A';

  // Bias toward unlocked first within each tab; fall back to first 8.
  const renderableTabs = useMemo(() => {
    return allTabs.map((t) => {
      const items = [...t.items].sort((x, y) => {
        const xu = unlockedKeys.has(`${t.id}:${x.slug}`) ? 0 : 1;
        const yu = unlockedKeys.has(`${t.id}:${y.slug}`) ? 0 : 1;
        return xu - yu;
      }).slice(0, 12);
      return { tab: t, items };
    });
  }, [allTabs, unlockedKeys]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 animate-fade-in"
      style={{ background: 'rgba(31,26,22,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl border bg-bg-elevated flex flex-col animate-slide-up"
        style={{ borderColor: 'var(--color-border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b flex items-baseline justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <span className="serial-number text-xs">CP / 配对</span>
            <h2 className="text-lg sm:text-xl section-headline mt-0.5">
              {step === 'A' ? '挑第一张卡' : '再挑一张配对'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="text-text-muted hover:text-text-primary text-2xl leading-none"
          >×</button>
        </header>

        {pickA && (
          <div className="px-5 pt-3 text-[12px] text-text-muted">
            已选第一张：<span className="font-mono">{pickA.tabId}/{pickA.slug}</span>
            <button onClick={() => setPickA(null)} className="ml-2 underline">重选</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {renderableTabs.map(({ tab, items }) => (
            <div key={tab.id}>
              <div className="flex items-center gap-2 mb-2">
                <CodeGlyph code={tab.id} label={tab.label} color={tab.accent} className="h-7 w-7 text-[10px]" />
                <span className="text-sm font-semibold">{tab.label}</span>
                <span className="text-[10px] font-mono text-text-muted">{tab.items.length}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {items.map((item) => {
                  const k = { tabId: tab.id, slug: item.slug };
                  const isPickedA = pickA?.tabId === tab.id && pickA?.slug === item.slug;
                  const isUnlocked = unlockedKeys.has(`${tab.id}:${item.slug}`);
                  const disabled = step === 'B' && isPickedA;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (step === 'A') setPickA(k);
                        else setPickB(k);
                      }}
                      className="group relative aspect-[3/4] rounded-lg border overflow-hidden bg-bg-elevated transition hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderColor: `${item.color}33`, background: `linear-gradient(135deg, ${item.color}10, ${item.color}04)` }}
                    >
                      {item.image ? (
                        <NextImage src={item.image} alt={item.name} width={140} height={186} loading="lazy" className="absolute inset-0 w-full h-full object-contain p-2" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CodeGlyph code={item.code} label={item.name} color={item.color} className="h-11 w-11 text-[10px]" />
                        </div>
                      )}
                      {!isUnlocked && (
                        <span className="absolute top-1 right-1 text-[8px] font-mono px-1 rounded-sm" style={{ background: 'rgba(255,253,249,0.85)', color: 'var(--color-text-muted)' }}>未</span>
                      )}
                      <span className="absolute bottom-0 inset-x-0 text-[8px] text-center font-mono tracking-widest py-0.5 truncate" style={{ background: 'rgba(255,253,249,0.85)', color: item.color }}>
                        {item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <footer className="px-5 py-3 border-t text-[11px] text-text-muted text-center" style={{ borderColor: 'var(--color-border-subtle)' }}>
          已解锁卡会显示在前 · 未解锁卡也能配对（视为「假设」）
        </footer>
      </div>
    </div>
  );
}
