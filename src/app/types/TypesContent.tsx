'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONALITY_TYPES, getTypeImage, getRarity } from '@/lib/personalities';
import { LOVE_PERSONALITY_TYPES, getLoveTypeImage, getLoveRarity } from '@/lib/love/personalities';
import { WORK_PERSONALITY_TYPES, getWorkTypeImage, getWorkRarity } from '@/lib/work/personalities';
import { DAILY_STATUS_TYPES, getDailyTypeImage } from '@/lib/daily/statuses';
import { DRUNK_PERSONA_TYPES, getDrunkTypeImage } from '@/lib/drunk/personas';
import { GUIDE_ARTICLES } from '@/lib/guides';

/* ── Normalized gallery item ────────────────────────────── */
interface GalleryItem {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  color: string;
  emoji?: string;
  image: string;
  href: string;
  rarity?: { label: string; color: string; bgColor: string };
  isSpecial?: boolean;
}

interface GalleryTab {
  id: string;
  label: string;
  emoji: string;
  accent: string;
  testHref: string;
  description: string;
  items: GalleryItem[];
}

const GALLERY_THUMBNAIL_EXTENSION = /\.(png|jpe?g)$/i;

function getGalleryThumbnail(imagePath: string): string {
  if (!imagePath.includes('/images/types/')) {
    return imagePath;
  }

  return imagePath
    .replace('/images/types/', '/images/types/thumbs/')
    .replace(GALLERY_THUMBNAIL_EXTENSION, '.webp');
}

/* ── Build tabs from all modules ────────────────────────── */
function buildTabs(): GalleryTab[] {
  const sbtiItems: GalleryItem[] = PERSONALITY_TYPES.map(p => {
    const r = getRarity(p.slug);
    return {
      slug: p.slug, code: p.code, name: p.name, tagline: p.tagline,
      color: p.color, emoji: p.emoji, image: getTypeImage(p.slug),
      href: `/result/${p.slug}`, isSpecial: p.isSpecial,
      rarity: { label: r.label, color: r.color, bgColor: r.bgColor },
    };
  });

  const loveItems: GalleryItem[] = LOVE_PERSONALITY_TYPES.map(p => {
    const r = getLoveRarity(p.slug);
    return {
      slug: p.slug, code: p.code, name: p.name, tagline: p.tagline,
      color: p.color, emoji: p.emoji, image: getLoveTypeImage(p.slug),
      href: `/love/result/${p.slug}`,
      rarity: { label: r.label, color: r.color, bgColor: r.bgColor },
    };
  });

  const workItems: GalleryItem[] = WORK_PERSONALITY_TYPES.map(p => {
    const r = getWorkRarity(p.slug);
    return {
      slug: p.slug, code: p.code, name: p.name, tagline: p.tagline,
      color: p.color, emoji: p.emoji, image: getWorkTypeImage(p.slug),
      href: `/work/result/${p.slug}`,
      rarity: { label: r.label, color: r.color, bgColor: r.bgColor },
    };
  });

  const dailyItems: GalleryItem[] = DAILY_STATUS_TYPES.map(p => ({
    slug: p.slug, code: p.code, name: p.name, tagline: p.tagline,
    color: p.color, emoji: p.emoji, image: getDailyTypeImage(p.slug),
    href: `/daily/result/${p.slug}`,
  }));

  const drunkItems: GalleryItem[] = DRUNK_PERSONA_TYPES.map(p => ({
    slug: p.slug, code: p.code, name: p.name, tagline: p.tagline,
    color: p.color, emoji: p.emoji, image: getDrunkTypeImage(p.slug),
    href: `/drunk/result/${p.slug}`,
  }));

  return [
    {
      id: 'sbti', label: '人格图鉴', emoji: '🧬', accent: '#e8729c',
      testHref: '/test',
      description: '五大模型十五维度交叉分析，27 张人设卡各有各的离谱逻辑。',
      items: sbtiItems,
    },
    {
      id: 'love', label: '恋爱人格', emoji: '💕', accent: '#f472b6',
      testHref: '/love',
      description: '亲密关系里你不知道的一面——16 种恋爱人格画像。',
      items: loveItems,
    },
    {
      id: 'work', label: '职场人格', emoji: '💼', accent: '#818cf8',
      testHref: '/work',
      description: '打工人在工位上的 16 种灵魂状态，总有一款是你。',
      items: workItems,
    },
    {
      id: 'daily', label: '今日状态', emoji: '📅', accent: '#34d399',
      testHref: '/daily',
      description: '今天你是电量暴走还是尸体开机？12 种每日状态。',
      items: dailyItems,
    },
    {
      id: 'drunk', label: '酒后人设', emoji: '🍻', accent: '#f59e0b',
      testHref: '/drunk',
      description: '喝多了你是哪种人？12 种酒后人格解剖报告。',
      items: drunkItems,
    },
  ];
}

/* ── Gallery card ───────────────────────────────────────── */
function GalleryCard({ item, index }: { item: GalleryItem; index: number }) {
  const thumbnailImage = getGalleryThumbnail(item.image);
  const shouldPrioritizeImage = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link
        href={item.href}
        className="group block rounded-2xl border border-border-subtle hover:border-border bg-bg-elevated hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div
          className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${item.color}08, ${item.color}15)` }}
        >
          <NextImage
            src={thumbnailImage}
            alt={item.name}
            width={384}
            height={384}
            loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
            fetchPriority={shouldPrioritizeImage ? 'high' : 'auto'}
            className="w-[75%] h-[75%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
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
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function TypesContent() {
  const tabs = useMemo(() => buildTabs(), []);
  const [activeId, setActiveId] = useState('sbti');
  const activeTab = tabs.find(t => t.id === activeId)!;
  const totalCount = tabs.reduce((s, t) => s + t.items.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-10"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          Gallery · {totalCount} Types
        </span>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
          全人格图鉴馆
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          从基础人格到恋爱、职场、每日状态、酒后人设——{totalCount} 张抽象人设卡，五大系列一次刷完。
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          {tabs.map(tab => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
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
          })}
        </div>
      </div>

      {/* Tab description + test link */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.id + '-desc'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
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
        </motion.div>
      </AnimatePresence>

      {/* Card grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.id + '-grid'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {activeTab.items.map((item, i) => (
            <GalleryCard key={item.slug} item={item} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Guide section */}
      <section className="mt-12 sm:mt-16 pt-12 border-t border-border-subtle">
        <div className="max-w-4xl">
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Guide</span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            这些抽象名字到底咋看？
          </h2>
          <div className="space-y-4 text-text-secondary leading-8 text-sm sm:text-base">
            <p>
              SBTI 的人设卡不是随便起梗的标签列表——基础人格是五组切面、十五个维度的交叉组合；恋爱、职场、酒后人设各有独立维度模型。两个人看起来相似，最后也可能落到完全不同的卡上。
            </p>
            <p>
              最顺手的打开方式：先刷一遍感兴趣的系列图鉴，再去做对应测试，然后回到结果页对照详细解读。比只看一个结果名更容易理解自己为什么会落到那个类型。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {GUIDE_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5 hover:shadow-md hover:border-border transition-all"
              >
                <span className="text-xs font-mono tracking-wider text-text-muted uppercase block mb-2">
                  {article.category}
                </span>
                <h3 className="text-base font-medium text-text-primary leading-7">{article.title}</h3>
                <p className="text-sm text-text-secondary leading-6 mt-3">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
