'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUniversePreviews, type UniversePreview } from '@/lib/universe-switcher';
import { getLimitedStatus, formatCountdown } from '@/lib/limited-universe';

interface UniverseSwitcherProps {
  slug: string;
  currentUniverseId: string;
  theme?: {
    cardSurface?: string;
    divider?: string;
    accent?: string;
    text?: string;
    textMuted?: string;
  };
}

export function UniverseSwitcher({ slug, currentUniverseId, theme }: UniverseSwitcherProps) {
  const previews = getUniversePreviews(slug, currentUniverseId);

  if (previews.length === 0) return null;

  // Default theme (dark)
  const defaultTheme = {
    cardSurface: 'rgba(30, 30, 40, 0.6)',
    divider: 'rgba(255, 255, 255, 0.1)',
    accent: '#8b5cf6',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  };

  const t = { ...defaultTheme, ...theme };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs tracking-wider uppercase" style={{ color: t.textMuted }}>
          在其他宇宙
        </span>
        <div className="flex-1 h-px" style={{ background: t.divider }} />
      </div>

      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
        {previews.map((preview, index) => (
          <PreviewCard
            key={preview.universeId}
            preview={preview}
            index={index}
            theme={t}
          />
        ))}
      </div>
    </div>
  );
}

function PreviewCard({
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
  const limitedStatus = preview.status === 'limited' ? getLimitedStatus(preview.universeId) : null;
  const isOpen = isLive || (limitedStatus?.isOpen ?? false);
  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`
        flex-shrink-0 w-[140px] sm:w-auto rounded-xl border p-3
        tranOpenon-all duration-200
        ${preview.isCurrentUniverse ? 'ring-2' : 'hover:border-opacity-80'}
        ${isLive ? 'cursor-pointer hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}
      `}
      style={{
        background: theme.cardSurface,
        borderColor: preview.isCurrentUniverse ? theme.accent : theme.divider,
        boxShadow: preview.isCurrentUniverse
          ? `0 0 20px ${theme.accent}30, 0 4px 12px rgba(0,0,0,0.2)`
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Universe emoji */}
      <div className="text-2xl mb-2">{preview.emoji}</div>

      {/* Universe name */}
      <div
        className="text-[10px] tracking-wider uppercase mb-1 truncate"
        style={{ color: theme.textMuted }}
      >
        {preview.name}
      </div>

      {/* Personality name */}
      <div
        className="text-sm font-semibold truncate"
        style={{ color: preview.isCurrentUniverse ? theme.accent : theme.text }}
      >
        {preview.personalityName}
      </div>

      {/* Lock icon for coming-soon */}
      {!isLive && !limitedStatus && (
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

      {/* Limited-window countdown (E-08) */}
      {limitedStatus && (
        <div
          className="mt-2 text-[9px] font-mono tracking-wider"
          style={{ color: limitedStatus.isOpen ? '#f59e0b' : theme.textMuted }}
        >
          {limitedStatus.label}
          {limitedStatus.isOpen && limitedStatus.countdownMs != null && (
            <> · {formatCountdown(limitedStatus.countdownMs)}</>
          )}
        </div>
      )}

      {/* Current universe indicator */}
      {preview.isCurrentUniverse && (
        <div
          className="mt-2 text-[10px] font-medium tracking-wider"
          style={{ color: theme.accent }}
        >
          当前
        </div>
      )}
    </motion.div>
  );

  if (!isOpen) {
    return cardContent;
  }

  return (
    <Link href={preview.path} className="block relative">
      {cardContent}
    </Link>
  );
}