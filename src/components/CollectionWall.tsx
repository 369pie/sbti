'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadCard, type WtfCardData, getLitCount, getTotalCount } from '@/lib/wtf-card';
import { UNIVERSES, type Universe } from '@/lib/universes';

/**
 * CollectionWall · 图鉴收集进度墙
 *
 * 设计向：暮光博物笔记风格
 * 色板：暮紫底 #1a1530 / 玫瑰陶土 #C07A8E / 金箔 #C9A676 / 米白 #F5F0E8
 * 字体：var(--font-display) = Cormorant + Noto Serif SC
 */

interface UniverseCard {
  universe: Universe;
  result: { slug: string; testedAt: string } | null;
}

export function CollectionWall() {
  const [card, setCard] = useState<WtfCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedCard = loadCard();
    setCard(loadedCard);
    setIsLoading(false);
  }, []);

  const liveUniverses = useMemo(() => {
    return UNIVERSES.filter(u => u.status === 'live');
  }, []);

  const universeCards: UniverseCard[] = useMemo(() => {
    return liveUniverses.map(universe => ({
      universe,
      result: card?.results?.[universe.id] ?? null,
    }));
  }, [liveUniverses, card]);

  const litCount = useMemo(() => {
    return card ? getLitCount(card) : 0;
  }, [card]);

  const totalCount = useMemo(() => getTotalCount(), []);
  const progressPct = totalCount > 0 ? Math.round((litCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A676] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #251A3A 0%, #1a1530 100%)',
        borderRadius: 24,
        padding: '28px 20px 32px',
        border: '1px solid rgba(201, 166, 118, 0.25)',
        boxShadow: '0 30px 80px -30px rgba(26, 21, 48, 0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Header with progress ring */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#C9A676',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            COLLECTION · 图鉴收集
          </p>
          <h3
            style={{
              margin: '8px 0 0',
              fontSize: 20,
              fontWeight: 600,
              color: '#F5F0E8',
              fontFamily: 'var(--font-display), "Noto Serif SC", serif',
            }}
          >
            已解锁 <span style={{ color: '#C07A8E' }}>{litCount}</span>/{totalCount} 个宇宙
          </h3>
        </div>

        {/* Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(201, 166, 118, 0.15)"
              strokeWidth="2.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#C9A676"
              strokeWidth="2.5"
              strokeDasharray={`${progressPct}, 100`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
            style={{ color: '#C9A676' }}
          >
            {progressPct}%
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201, 166, 118, 0.4), transparent)',
          marginBottom: 24,
        }}
      />

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {universeCards.map((item, index) => (
          <UniverseGridCard key={item.universe.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function UniverseGridCard({ item, index }: { item: UniverseCard; index: number }) {
  const { universe, result } = item;
  const isUnlocked = result !== null;

  // Build result URL or test URL
  const href = isUnlocked
    ? `${universe.resultPrefix}/result/${result!.slug}/`
    : universe.testPath;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      style={{
        position: 'relative',
        borderRadius: 16,
        padding: '14px 12px 16px',
        background: isUnlocked
          ? `linear-gradient(135deg, ${hexToRgba(universe.accent, 0.12)} 0%, rgba(26, 21, 48, 0.6) 100%)`
          : 'rgba(26, 21, 48, 0.5)',
        border: isUnlocked
          ? `1px solid ${hexToRgba(universe.accent, 0.4)}`
          : '1px solid rgba(201, 166, 118, 0.15)',
        boxShadow: isUnlocked
          ? `0 8px 24px -8px ${hexToRgba(universe.accent, 0.3)}`
          : 'none',
        transition: 'all 0.25s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: isUnlocked
          ? `0 12px 32px -8px ${hexToRgba(universe.accent, 0.4)}`
          : '0 8px 24px -8px rgba(201, 166, 118, 0.15)',
      }}
    >
      {/* Emoji / Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          background: isUnlocked
            ? hexToRgba(universe.accent, 0.2)
            : 'rgba(201, 166, 118, 0.08)',
          border: isUnlocked
            ? `1px solid ${hexToRgba(universe.accent, 0.3)}`
            : '1px solid rgba(201, 166, 118, 0.12)',
          marginBottom: 10,
        }}
      >
        {isUnlocked ? universe.emoji : '🔒'}
      </div>

      {/* Universe Name */}
      <p
        style={{
          margin: '0 0 4px',
          fontSize: 13,
          fontWeight: 600,
          color: isUnlocked ? '#F5F0E8' : 'rgba(245, 240, 232, 0.6)',
          fontFamily: 'var(--font-display), "Noto Serif SC", serif',
          lineHeight: 1.3,
        }}
      >
        {universe.shortName}
      </p>

      {/* Status / Result */}
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: isUnlocked ? universe.accent : 'rgba(245, 240, 232, 0.4)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        {isUnlocked ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: universe.accent,
                display: 'inline-block',
              }}
            />
            已点亮
          </span>
        ) : (
          '去测试'
        )}
      </p>

      {/* Locked overlay effect */}
      {!isUnlocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(26,21,48,0.1) 0%, rgba(26,21,48,0.3) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );

  return (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  );
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
