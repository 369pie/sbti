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
        className="group block rounded-2xl border border-border-subtle hover:border-border bg-bg-elevated hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div
          className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${item.color}08, ${item.color}15)` }}
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
              className="w-[75%] h-[75%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-[75%] w-[75%] flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/30 text-center backdrop-blur-sm">
              <span className="text-4xl leading-none">{item.emoji ?? '🌿'}</span>
              <span className="mt-2 px-3 text-sm font-medium text-text-primary/85 line-clamp-2">{item.name}</span>
            </div>
          )}
          {item.isSpecial && (
            <span className="absolute top-3 right-3 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-accent-dim text-accent backdrop-blur-sm">
              特殊
            </span>
          )}
          {item.rarity && (
            <span
              className="absolute top-3 left-3 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
              style={{ color: item.rarity.color, background: item.rarity.bgColor }}
            >
              {item.rarity.label}
            </span>
          )}
          {!item.rarity && item.emoji && (
            <span className="absolute top-3 left-3 text-sm">{item.emoji}</span>
          )}
        </div>
        <div className="px-4 py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0">
              <span
                className="text-[11px] font-mono tracking-widest block mb-0.5"
                style={{ color: item.color }}
              >
                {item.code}
              </span>
              <h3 className="text-base font-medium text-text-primary truncate">
                {item.name}
              </h3>
            </div>
            <svg
              className="w-4 h-4 flex-shrink-0 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-1 mt-1">
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
        relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium
        transition-all duration-200 whitespace-nowrap cursor-pointer
        ${isActive
          ? 'text-text-primary shadow-sm'
          : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
        }
      `}
      style={isActive ? {
        background: `linear-gradient(135deg, ${tab.accent}12, ${tab.accent}06)`,
        border: `1px solid ${tab.accent}30`,
      } : { border: '1px solid transparent' }}
    >
      <span className="text-base">{tab.emoji}</span>
      <span>{tab.label}</span>
      <span
        className="text-[11px] font-mono ml-0.5 tabular-nums"
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
      <div className="mb-6 animate-fade-up">
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          {totalCount} Types · {allTabs.length} Series
        </span>
      </div>

      {/* ── Grouped tabs ── */}
      <div className="mb-8 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <span className="text-[11px] font-mono tracking-[0.15em] text-text-muted uppercase block mb-2">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
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
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-up"
      >
          <p className="text-sm text-text-secondary">{activeTab.description}</p>
          <Link
            href={activeTab.testHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            style={{
              color: activeTab.accent,
              background: `${activeTab.accent}10`,
            }}
          >
            去测试
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
      </div>

      <div
        key={activeTab.id + '-grid'}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
      >
          {activeTab.items.map((item, i) => (
            <GalleryCard key={item.slug} item={item} index={i} />
          ))}
      </div>
    </>
  );
}
