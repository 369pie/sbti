'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MYSTI_THEMES } from '@/lib/mysti/themes';
import type { MystiTheme } from '@/lib/mysti/types';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import {
  drawDailyCard,
  hasDrawnToday,
  getTodayDrawResult,
  getCollectionCount,
  getCollectionTotal,
  getCollectionProgress,
  getRarityDistribution,
  getRarityColor,
  getRarityGlow,
  getRarityLabel,
  getRarityEmoji,
  getTimeUntilNextDraw,
  checkMilestone,
  getNextMilestone,
  getVariantLabel,
  getVariantGlow,
  type GachaResult,
  type GachaRarity,
  type GachaVariant,
} from '@/lib/mysti/gacha';
import { MystiGachaShareImageGenerator } from '@/components/MystiGachaShareImageGenerator';

const THEME_STORAGE_KEY = 'mysti-theme-preference';

export function MystiGachaContent() {
  const [themeId, setThemeId] = useState<MystiTheme['id']>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'pale' || stored === 'celestial') return stored;
    }
    return 'celestial';
  });

  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [collectionCount, setCollectionCount] = useState(0);
  const [collectionTotal, setCollectionTotal] = useState(0);
  const [rarityDist, setRarityDist] = useState<Record<GachaRarity, number>>({
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0,
  });
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareRef = useRef<{ generate: () => void }>(null);

  useEffect(() => {
    setMounted(true);

    // Check if already drawn today
    if (hasDrawnToday()) {
      const existing = getTodayDrawResult();
      if (existing) {
        setGachaResult(existing);
        setIsFlipped(true);
        setShowGlow(true);
      }
    }

    // Load collection stats
    setCollectionCount(getCollectionCount());
    setCollectionTotal(getCollectionTotal());
    setRarityDist(getRarityDistribution());

    trackMystiEvent('mysti_gacha_view');
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!gachaResult || !hasDrawnToday()) return;

    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextDraw());
    }, 1000);

    return () => clearInterval(timer);
  }, [gachaResult]);

  const toggleTheme = useCallback(() => {
    setThemeId(prev => {
      const next = prev === 'celestial' ? 'pale' : 'celestial';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const handleDraw = useCallback(() => {
    if (isDrawing || hasDrawnToday()) return;

    setIsDrawing(true);
    trackMystiEvent('mysti_gacha_draw');

    // Simulate shuffling animation
    setTimeout(() => {
      const result = drawDailyCard();
      setGachaResult(result);
      setIsDrawing(false);

      // Start flip animation
      setTimeout(() => setIsFlipped(true), 100);
      setTimeout(() => setShowGlow(true), 1000);

      // Update collection stats
      const newCount = getCollectionCount();
      setCollectionCount(newCount);
      setCollectionTotal(getCollectionTotal());
      setRarityDist(getRarityDistribution());

      // Check for milestone
      const milestone = checkMilestone(newCount);
      if (milestone) {
        setShowMilestone(milestone);
        setTimeout(() => setShowMilestone(null), 5000);
      }

      trackMystiEvent('mysti_gacha_result', {
        rarity: result.card.rarity,
        universeId: result.card.universeId,
        slug: result.card.slug,
        isNew: result.isNew,
      });
    }, 1500);
  }, [isDrawing]);

  const theme = MYSTI_THEMES[themeId];
  const progress = getCollectionProgress();
  const nextMilestone = getNextMilestone(collectionCount);

  const gradientBgStyle = {
    background: `linear-gradient(180deg, ${theme.gradientBg[0]} 0%, ${theme.gradientBg[1]} 100%)`,
    color: theme.text,
  };

  return (
    <div className="min-h-screen" style={gradientBgStyle}>
      {/* Milestone celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.accent }}>
                收集里程碑！
              </h2>
              <p className="text-lg" style={{ color: theme.text }}>
                已收集 {showMilestone} 张卡牌
              </p>
              <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
                继续收集，解锁更多卡牌！
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
        <Link
          href="/mysti/"
          className="text-sm font-medium tracking-wide opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: theme.textMuted }}
        >
          WTFTI · 每日抽卡
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{ borderColor: theme.divider, color: theme.accent }}
          >
            已收集 {collectionCount}/{collectionTotal}
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-full text-xs border transition-all hover:brightness-110"
            style={{ borderColor: theme.divider, color: theme.accent, background: theme.accentSoft }}
            aria-label="切换主题"
          >
            {theme.label}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 pb-20">
        {/* Header */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-4 pb-8"
        >
          <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: theme.accent }}>
            ✦ 每日一抽 ✦
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            灵魂卡牌
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            每天抽取一张来自不同宇宙的灵魂卡牌
          </p>
          <div className="w-16 h-px mx-auto mt-4" style={{ background: theme.divider }} />
        </motion.div>

        {/* Card area */}
        <div className="mb-10">
          {!gachaResult && !isDrawing ? (
            /* Draw button */
            <motion.div
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div
                className="mx-auto max-w-sm aspect-[2/3] rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientCard[0]} 0%, ${theme.gradientCard[1]} 100%)`,
                  borderColor: theme.cardBorder,
                  boxShadow: `0 24px 80px -24px ${theme.cardGlow}`,
                }}
                onClick={handleDraw}
              >
                <div className="text-5xl mb-4" style={{ color: theme.accent, opacity: 0.6 }}>
                  ✦
                </div>
                <div className="text-lg font-medium mb-2" style={{ color: theme.text }}>
                  今日免费一抽
                </div>
                <div className="text-sm" style={{ color: theme.textMuted }}>
                  点击抽取你的灵魂卡牌
                </div>
              </div>
            </motion.div>
          ) : isDrawing ? (
            /* Shuffling animation */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="mx-auto max-w-sm aspect-[2/3] rounded-2xl border flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientCard[0]} 0%, ${theme.gradientCard[1]} 100%)`,
                  borderColor: theme.cardBorder,
                  boxShadow: `0 24px 80px -24px ${theme.cardGlow}`,
                }}
              >
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-4xl"
                  style={{ color: theme.accent }}
                >
                  ✦
                </motion.div>
                <div className="text-sm mt-4" style={{ color: theme.textMuted }}>
                  正在抽取...
                </div>
              </motion.div>
            </motion.div>
          ) : gachaResult ? (
            /* Drawn card */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              {/* Card with flip animation */}
              <div className="mx-auto max-w-sm" style={{ perspective: '1000px' }}>
                <motion.div
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{
                    rotateY: isFlipped ? 0 : 180,
                    opacity: 1,
                    scale: isFlipped ? (showGlow ? 1 : 1.03) : 1,
                  }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    borderRadius: '1rem',
                    boxShadow: showGlow
                      ? `0 0 40px 8px ${getRarityGlow(gachaResult.card.rarity)}, 0 24px 80px -24px ${theme.cardGlow}`
                      : undefined,
                    transition: 'box-shadow 0.6s ease-out',
                  }}
                >
                  {/* Card back (shown initially) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      position: isFlipped ? 'absolute' : 'relative',
                      inset: 0,
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      opacity: isFlipped ? 0 : 1,
                      pointerEvents: isFlipped ? 'none' : 'auto',
                    }}
                  >
                    <CardBack theme={theme} />
                  </div>

                  {/* Card front (revealed after flip) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      opacity: isFlipped ? 1 : 0,
                      pointerEvents: isFlipped ? 'auto' : 'none',
                    }}
                  >
                    <GachaCardFront
                      card={gachaResult.card}
                      theme={theme}
                      isNew={gachaResult.isNew}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Card info */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8"
                >
                  {/* Rarity badge */}
                  <div className="mb-4">
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
                      style={{
                        borderColor: getRarityColor(gachaResult.card.rarity),
                        background: getRarityGlow(gachaResult.card.rarity),
                        color: getRarityColor(gachaResult.card.rarity),
                      }}
                    >
                      {getRarityEmoji(gachaResult.card.rarity)}
                      {getRarityLabel(gachaResult.card.rarity)}
                    </span>
                  </div>

                  {/* New card indicator */}
                  {gachaResult.isNew && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="mb-4"
                    >
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(34,197,94,0.2)',
                          color: '#22c55e',
                        }}
                      >
                        ✨ 新卡牌！
                      </span>
                    </motion.div>
                  )}

                  {/* Card description */}
                  <p
                    className="text-sm italic mb-6"
                    style={{ color: theme.textMuted }}
                  >
                    "{gachaResult.card.cardDescription}"
                  </p>

                  {/* Tomorrow message */}
                  <div
                    className="rounded-xl border p-4 mb-6"
                    style={{
                      borderColor: theme.divider,
                      background: `${theme.cardSurface}80`,
                    }}
                  >
                    <div className="text-xs tracking-wider uppercase mb-2" style={{ color: theme.textMuted }}>
                      明天再来
                    </div>
                    <div className="text-lg font-mono" style={{ color: theme.accent }}>
                      {String(countdown.hours).padStart(2, '0')}:
                      {String(countdown.minutes).padStart(2, '0')}:
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </div>

        {/* Share button */}
        {gachaResult && isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border p-6 sm:p-8 text-center mb-10"
            style={{ borderColor: theme.cardBorder, background: `${theme.cardSurface}60` }}
          >
            <div className="text-2xl mb-2">✦</div>
            <h3 className="text-base font-semibold mb-1">生成分享卡</h3>
            <p className="text-xs sm:text-sm mb-5" style={{ color: theme.textMuted }}>
              将今日卡牌保存为图片，分享给朋友
            </p>
            <div className="max-w-xs mx-auto">
              <MystiGachaShareImageGenerator
                ref={shareRef}
                result={gachaResult}
                collectionCount={collectionCount}
                collectionTotal={collectionTotal}
                themeId={themeId}
              />
            </div>
          </motion.div>
        )}

        {/* Collection progress */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-xl border p-5 mb-6"
          style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
        >
          <div className="text-xs tracking-wider uppercase mb-3 text-center" style={{ color: theme.accent }}>
            收集进度
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2" style={{ color: theme.textMuted }}>
              <span>已收集 {collectionCount} 张</span>
              <span>共 {collectionTotal} 张</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: theme.divider }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
                }}
              />
            </div>
            {nextMilestone && (
              <div className="text-xs mt-2 text-center" style={{ color: theme.textMuted }}>
                下一个里程碑: {nextMilestone} 张
              </div>
            )}
          </div>

          {/* Rarity distribution */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(['common', 'uncommon', 'rare', 'legendary'] as GachaRarity[]).map(rarity => {
              const dropRate = rarity === 'legendary' ? '~1%' : rarity === 'rare' ? '~5%' : rarity === 'uncommon' ? '~20%' : '~60%';
              return (
                <div
                  key={rarity}
                  className="text-center p-2 rounded-lg"
                  style={{
                    background: getRarityGlow(rarity),
                    border: `1px solid ${getRarityColor(rarity)}30`,
                  }}
                >
                  <div className="text-lg">{getRarityEmoji(rarity)}</div>
                  <div className="text-xs font-medium" style={{ color: getRarityColor(rarity) }}>
                    {rarityDist[rarity]}
                  </div>
                  <div className="text-[10px]" style={{ color: theme.textMuted }}>
                    {getRarityLabel(rarity)}
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: theme.textMuted, opacity: 0.6 }}>
                    {dropRate}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Back links */}
        <motion.div
          initial={mounted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/mysti/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
            style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#fff' }}
          >
            🔮 返回灵鉴首页
          </Link>
          <Link
            href="/mysti/daily/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm border transition-all hover:opacity-80"
            style={{ borderColor: theme.divider, color: theme.textMuted }}
          >
            ✦ 每日一牌
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

// ─── Card Components ─────────────────────────────────────────────────────────

function CardBack({ theme }: { theme: MystiTheme }) {
  const isCelestial = theme.id === 'celestial';

  return (
    <div
      className="aspect-[2/3] rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: isCelestial
          ? `linear-gradient(135deg, #0B0D17 0%, #1a1d3a 50%, #0B0D17 100%)`
          : `linear-gradient(135deg, #F7F4EF 0%, #FFF8F0 50%, #F7F4EF 100%)`,
        borderColor: isCelestial ? 'rgba(201,168,108,0.45)' : 'rgba(168,92,100,0.35)',
        boxShadow: isCelestial
          ? `0 24px 80px -24px rgba(123,97,255,0.18)`
          : `0 24px 80px -24px rgba(94,113,106,0.12)`,
      }}
    >
      {/* Mystical pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="150" r="60" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.4" />
        <circle cx="100" cy="150" r="40" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <circle cx="100" cy="150" r="20" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.2" />
        <line x1="100" y1="90" x2="100" y2="210" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <line x1="40" y1="150" x2="160" y2="150" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <line x1="58" y1="108" x2="142" y2="192" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.25" />
        <line x1="58" y1="192" x2="142" y2="108" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.25" />
        <circle cx="100" cy="80" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        <circle cx="100" cy="220" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        <circle cx="40" cy="150" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        <circle cx="160" cy="150" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
      </svg>

      {/* Center symbol */}
      <div
        className="text-5xl font-serif relative z-10"
        style={{ color: isCelestial ? '#C9A86C' : '#A85C64', opacity: 0.6 }}
      >
        ✦
      </div>

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${isCelestial ? '#C9A86C' : '#A85C64'}, transparent)` }}
      />
    </div>
  );
}

interface GachaCardFrontProps {
  card: GachaResult['card'];
  theme: MystiTheme;
  isNew: boolean;
}

function GachaCardFront({ card, theme, isNew }: GachaCardFrontProps) {
  const rarityColor = getRarityColor(card.rarity);
  const rarityGlow = getRarityGlow(card.rarity);
  const isHighRarity = card.rarity === 'rare' || card.rarity === 'legendary';
  const isLegendary = card.rarity === 'legendary';
  const variant = card.variant ?? 'normal';
  const isSpecialVariant = variant !== 'normal';
  const variantLabel = getVariantLabel(variant);
  const variantShadow = getVariantGlow(variant);

  // Ownership percentage based on rarity tier
  const ownershipPct = card.rarity === 'legendary' ? 0.3
    : card.rarity === 'rare' ? 2.1
    : card.rarity === 'uncommon' ? 8.5
    : null; // don't show for common

  return (
    <div
      className={`aspect-[2/3] rounded-2xl border flex flex-col items-center justify-center p-6 relative overflow-hidden ${
        isLegendary ? 'gacha-legendary-shimmer' : ''
      } ${variant === 'holographic' ? 'gacha-holo-overlay' : ''}`}
      style={{
        background: isLegendary
          ? `linear-gradient(135deg, #1a1520 0%, #2d1f35 30%, #1a1520 60%, #251a2d 100%)`
          : `linear-gradient(135deg, ${theme.gradientCard[0]} 0%, ${theme.gradientCard[1]} 100%)`,
        borderColor: variant === 'gold' ? '#FFD700' : variant === 'holographic' ? '#a78bfa' : rarityColor,
        borderWidth: isHighRarity || isSpecialVariant ? '2px' : '1px',
        boxShadow: isSpecialVariant
          ? variantShadow
          : isHighRarity
            ? `0 0 30px 4px ${rarityGlow}, 0 24px 80px -24px ${rarityGlow}`
            : `0 24px 80px -24px ${rarityGlow}`,
      }}
    >
      {/* Variant badge */}
      {isSpecialVariant && (
        <div
          className="absolute top-4 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider z-10"
          style={{
            background: variant === 'gold'
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
            color: variant === 'gold' ? '#1a1520' : '#fff',
            boxShadow: variant === 'gold'
              ? '0 0 8px rgba(255,215,0,0.4)'
              : '0 0 8px rgba(139,92,246,0.4)',
          }}
        >
          {variantLabel}
        </div>
      )}

      {/* Gold variant shimmer overlay */}
      {variant === 'gold' && (
        <div
          className="absolute inset-0 pointer-events-none gacha-holo-overlay"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,165,0,0.1) 25%, transparent 50%, rgba(255,215,0,0.06) 75%, rgba(255,165,0,0.08) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      )}
      {/* Holographic overlay for rare+ */}
      {isHighRarity && (
        <div
          className="absolute inset-0 pointer-events-none gacha-holo-overlay"
          style={{
            background: isLegendary
              ? `linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,165,0,0.08) 25%, rgba(255,215,0,0.03) 50%, rgba(255,165,0,0.06) 75%, rgba(255,215,0,0.05) 100%)`
              : `linear-gradient(135deg, rgba(167,139,250,0.04) 0%, rgba(192,132,252,0.06) 50%, rgba(167,139,250,0.03) 100%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Top accent line with rarity color */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: isHighRarity ? '2px' : '1px',
          background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)`,
        }}
      />

      {/* Universe emoji */}
      <div className="text-4xl mb-4">{card.universeEmoji || '🔮'}</div>

      {/* Personality emoji */}
      <div className={`text-6xl sm:text-7xl mb-4 ${isLegendary ? 'gacha-legendary-pulse' : ''}`}>
        {card.personalityEmoji}
      </div>

      {/* Personality name */}
      <div
        className="text-xl font-medium mb-2"
        style={{
          color: isLegendary ? '#FFD700' : theme.text,
          textShadow: isLegendary ? '0 0 20px rgba(255,215,0,0.3)' : undefined,
        }}
      >
        {card.personalityName}
      </div>

      {/* Personality code */}
      <div className="text-xs font-mono mb-4" style={{ color: theme.textMuted }}>
        {card.personalityCode}
      </div>

      {/* Universe badge */}
      <div
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
        style={{
          borderColor: theme.divider,
          background: theme.accentSoft,
          color: theme.accent,
        }}
      >
        {card.universeName}
      </div>

      {/* Ownership rarity text */}
      {ownershipPct !== null && (
        <div
          className="mt-3 text-[10px] font-mono tracking-wide"
          style={{ color: rarityColor, opacity: 0.8 }}
        >
          全站仅 {ownershipPct}% 的人拥有此卡
        </div>
      )}

      {/* Rarity indicator */}
      <div
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm"
        style={{
          background: rarityGlow,
          color: rarityColor,
        }}
      >
        {getRarityEmoji(card.rarity)}
      </div>

      {/* New card indicator */}
      {isNew && (
        <div
          className="absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-medium"
          style={{
            background: 'rgba(34,197,94,0.2)',
            color: '#22c55e',
          }}
        >
          NEW
        </div>
      )}

      {/* Legendary corner decorations */}
      {isLegendary && (
        <>
          <div className="absolute top-3 left-3 text-xs" style={{ color: '#FFD700', opacity: 0.4 }}>✦</div>
          <div className="absolute bottom-3 left-3 text-xs" style={{ color: '#FFD700', opacity: 0.4 }}>✦</div>
        </>
      )}

      {/* Bottom accent line */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: isHighRarity ? '2px' : '1px',
          background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)`,
        }}
      />
    </div>
  );
}
