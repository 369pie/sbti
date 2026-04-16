'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUniversePreviews, type UniversePreview } from '@/lib/universe-switcher';

interface CrossUniverseCTAProps {
  slug: string;
  currentUniverseId: string;
  theme?: {
    cardSurface?: string;
    divider?: string;
    accent?: string;
    text?: string;
    textMuted?: string;
    bgGradient?: string;
  };
}

export function CrossUniverseCTA({ slug, currentUniverseId, theme }: CrossUniverseCTAProps) {
  const allPreviews = getUniversePreviews(slug, currentUniverseId);
  
  // Get 3 random other universe previews
  const randomPreviews = useMemo(() => {
    const others = allPreviews.filter(p => !p.isCurrentUniverse && p.status === 'live');
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [allPreviews]);

  // Calculate progress
  const totalUniverses = allPreviews.length;
  const unlockedUniverses = allPreviews.filter(p => p.status === 'live').length;

  // Default theme (dark)
  const defaultTheme = {
    cardSurface: 'rgba(30, 30, 40, 0.6)',
    divider: 'rgba(255, 255, 255, 0.1)',
    accent: '#8b5cf6',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(30, 30, 40, 0.8) 100%)',
  };

  const t = { ...defaultTheme, ...theme };

  if (randomPreviews.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-2xl border p-6 sm:p-8 overflow-hidden"
      style={{
        background: t.bgGradient,
        borderColor: t.divider,
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs mb-4"
          style={{ 
            borderColor: t.divider, 
            background: `${t.accent}15`,
            color: t.accent 
          }}
        >
          ✦ 你的 {totalUniverses} 种面孔 ✦
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-lg font-medium mb-2"
          style={{ color: t.text }}
        >
          同一个灵魂，不同的宇宙里有不同的名字
        </motion.p>
      </div>

      {/* Preview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {randomPreviews.map((preview, index) => (
          <PreviewMiniCard
            key={preview.universeId}
            preview={preview}
            index={index}
            theme={t}
          />
        ))}
      </div>

      {/* Progress and CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center gap-3"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-mono font-bold"
            style={{ 
              background: `${t.accent}20`,
              color: t.accent 
            }}
          >
            {unlockedUniverses}/{totalUniverses}
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: t.textMuted }}>
              已解锁
            </div>
            <div className="text-sm font-medium" style={{ color: t.text }}>
              {unlockedUniverses} 个宇宙
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Link
            href="/types/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
            style={{ 
              background: `linear-gradient(90deg, ${t.accent}, ${t.accent}cc)`,
              color: '#ffffff'
            }}
          >
            探索全部宇宙
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PreviewMiniCard({
  preview,
  index,
  theme,
}: {
  preview: UniversePreview;
  index: number;
  theme: {
    cardSurface: string;
    divider: string;
    accent: string;
    text: string;
    textMuted: string;
  };
}) {
  const isLive = preview.status === 'live';
  
  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
      className={`
        rounded-xl border p-4 transition-all duration-200
        ${isLive ? 'cursor-pointer hover:shadow-lg hover:border-opacity-80' : 'opacity-60 cursor-not-allowed'}
      `}
      style={{
        background: theme.cardSurface,
        borderColor: theme.divider,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Universe emoji and name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{preview.emoji}</span>
        <span 
          className="text-xs font-medium tracking-wider uppercase truncate"
          style={{ color: theme.textMuted }}
        >
          {preview.name}
        </span>
      </div>

      {/* Personality name */}
      <div 
        className="text-sm font-semibold truncate"
        style={{ color: theme.text }}
      >
        {preview.personalityName}
      </div>

      {/* Lock icon for coming-soon */}
      {!isLive && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: theme.textMuted }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );

  if (!isLive) {
    return cardContent;
  }

  return (
    <Link href={preview.path} className="block relative">
      {cardContent}
    </Link>
  );
}
