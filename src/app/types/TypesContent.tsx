'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import type { GalleryItem, GalleryTab } from './gallery-data';
import MuseumCover from '@/components/museum/MuseumCover';
import MuseumProgress from '@/components/museum/MuseumProgress';
import CardDrawer, { type CardDrawerPayload } from '@/components/museum/CardDrawer';
import { useMuseumUnlocked } from '@/lib/museum/unlocked';
import { trackMuseum } from '@/lib/museum/analytics';
import type { FeaturedCard } from '@/lib/museum/featured';

/* ── Gallery card ───────────────────────────────────────── */
interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  tabId: string;
  isUnlocked: boolean;
  onOpen: (key: string) => void;
}

function GalleryCard({ item, index, tabId, isUnlocked, onOpen }: GalleryCardProps) {
  const shouldPrioritizeImage = index < 4;
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(item.image) && !hasImageError;

  const handleClick = useCallback(() => {
    if (!isUnlocked) {
      trackMuseum('museum_locked_card_click', { tab: tabId, slug: item.slug });
    }
    onOpen(`${tabId}:${item.slug}`);
  }, [isUnlocked, tabId, item.slug, onOpen]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 25}ms` }}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={isUnlocked ? `查看 ${item.name}` : `${item.name}（未解锁）`}
        className="group block w-full text-left rounded-xl sm:rounded-2xl border border-border-subtle hover:border-accent/40 bg-bg-elevated hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 active:translate-y-0 cursor-pointer"
      >
        <div
          className="relative w-full aspect-square flex items-center justify-center overflow-hidden bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(135deg, ${item.color}12, ${item.color}06)`,
          }}
        >
          {showImage ? (
            <NextImage
              src={item.image}
              alt={item.name}
              width={384}
              height={384}
              loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
              fetchPriority={shouldPrioritizeImage ? 'high' : 'auto'}
              onError={() => setHasImageError(true)}
              className="w-[70%] h-[70%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={
                isUnlocked
                  ? undefined
                  : { filter: 'grayscale(0.95) brightness(0.85) blur(1.5px)', opacity: 0.55 }
              }
            />
          ) : (
            <div className="flex h-[70%] w-[70%] flex-col items-center justify-center rounded-xl border-2 border-white/30 bg-white/20 text-center backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl leading-none">{item.emoji ?? '🌿'}</span>
              <span className="mt-2 px-3 text-xs sm:text-sm font-medium text-text-primary/85 line-clamp-2">{item.name}</span>
            </div>
          )}

          {/* Locked overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className="text-2xl sm:text-3xl mb-1 transition-transform duration-500 group-hover:scale-110"
                aria-hidden
              >
                🔒
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase opacity-80"
                style={{ color: item.color }}
              >
                未解锁
              </span>
            </div>
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
          {!item.rarity && item.emoji && (
            <span className="absolute top-2.5 left-2.5 text-lg sm:text-xl">{item.emoji}</span>
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
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
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
        relative flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
        transition-all duration-200 whitespace-nowrap cursor-pointer flex-shrink-0
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
      <span className="text-base hidden sm:inline">{tab.emoji}</span>
      <span className="text-sm sm:text-base">{tab.emoji}</span>
      <span className="hidden sm:inline">{tab.label}</span>
      <span className="sm:hidden text-[10px]">{tab.label}</span>
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
          className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all whitespace-nowrap border shrink-0"
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

      {/* ── Filter chips ── */}
      <div
        key={activeTab.id + '-filters'}
        className="flex flex-wrap gap-1.5 mb-4 sm:mb-5 animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
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
                className="text-[10px] sm:text-xs font-mono tracking-[0.1em] px-2.5 py-1 rounded-full border transition-all duration-150"
                style={isActive ? {
                  background: activeTab.accent,
                  color: '#fff',
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

      {/* ── Grid ── */}
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
              isUnlocked={unlocked.keys.has(key)}
              onOpen={openDrawer}
            />
          );
        }) : (
          <div className="col-span-full py-12 text-center text-text-muted text-sm">
            该筛选下暂无卡片
          </div>
        )}
      </div>

      {/* ── Card detail drawer ── */}
      <CardDrawer payload={drawerPayload} onClose={closeDrawer} />
    </>
  );
}
