'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import type { GalleryItem, GalleryTab } from './gallery-data';

/* ── Gallery card ───────────────────────────────────────── */
function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const shouldPrioritizeImage = index < 4;
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(item.image) && !hasImageError;

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 25}ms` }}>
      <Link
        href={item.href}
        prefetch={false}
        className="group block rounded-xl sm:rounded-2xl border border-border-subtle hover:border-accent/40 bg-bg-elevated hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 active:translate-y-0"
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
            />
          ) : (
            <div className="flex h-[70%] w-[70%] flex-col items-center justify-center rounded-xl border-2 border-white/30 bg-white/20 text-center backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl leading-none">{item.emoji ?? '🌿'}</span>
              <span className="mt-2 px-3 text-xs sm:text-sm font-medium text-text-primary/85 line-clamp-2">{item.name}</span>
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
                borderColor: item.rarity.color + '40'
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
                {item.name}
              </h3>
            </div>
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted leading-snug line-clamp-1 mt-0.5 sm:mt-1">
            {item.tagline}
          </p>
        </div>
      </Link>
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
        background: 'transparent'
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
}: TypesContentProps) {
  const groups: TabGroup[] = useMemo(() => [
    { label: GROUP_LABELS[0], tabs: coreGroup },
    { label: GROUP_LABELS[1], tabs: ipGroup },
    { label: GROUP_LABELS[2], tabs: themeGroup },
  ], [coreGroup, ipGroup, themeGroup]);

  const allTabs = useMemo(() => groups.flatMap(g => g.tabs), [groups]);
  const [activeId, setActiveId] = useState(allTabs[0]?.id ?? 'sbti');
  const activeTab = allTabs.find((tab) => tab.id === activeId) ?? allTabs[0];
  const totalCount = allTabs.reduce((sum, tab) => sum + tab.items.length, 0);

  return (
    <>
      <div className="mb-4 sm:mb-6 animate-fade-up">
        <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          {totalCount} Types · {allTabs.length} Series
        </span>
      </div>

      {/* ── Grouped tabs (horizontal scroll on mobile) ── */}
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
                  onClick={() => setActiveId(tab.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        key={activeTab.id + '-desc'}
        className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{activeTab.description}</p>
          <Link
            href={activeTab.testHref}
            className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all whitespace-nowrap border"
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

      {/* Grid with improved mobile responsiveness */}
      <div
        key={activeTab.id + '-grid'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 animate-fade-up"
        style={{ animationDelay: '150ms' }}
      >
          {activeTab.items.map((item, i) => (
            <GalleryCard key={item.slug} item={item} index={i} />
          ))}
      </div>
    </>
  );
}
