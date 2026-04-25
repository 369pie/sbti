'use client';

import dynamic from 'next/dynamic';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MYSTI_THEMES } from '@/lib/mysti/themes';
import type { MystiTheme, MystiShareImageGeneratorHandle } from '@/lib/mysti/types';
import { getDailyCard, getDailyCardIndex, getRandomBonusCard, formatDateCN, type DailyCardInterpretation } from '@/lib/mysti/daily-card';
const MystiDailyShareImageGenerator = dynamic(
  () => import('@/components/MystiDailyShareImageGenerator').then((m) => m.MystiDailyShareImageGenerator),
  { ssr: false },
);
import { trackMystiEvent } from '@/lib/mysti/analytics';
import { isSubscriber } from '@/lib/mysti/subscription';

const THEME_STORAGE_KEY = 'mysti-theme-preference';

export function MystiDailyContent() {
  const [themeId, setThemeId] = useState<MystiTheme['id']>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'pale' || stored === 'celestial') return stored;
    }
    return 'celestial';
  });
  const [dailyCard, setDailyCard] = useState<DailyCardInterpretation | null>(null);
  const [bonusCard, setBonusCard] = useState<DailyCardInterpretation | null>(null);
  const [bonusUsedToday, setBonusUsedToday] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('mysti-bonus-pull-date') === new Date().toDateString();
    } catch {
      return false;
    }
  });
  const subscriber = useMemo<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isSubscriber();
  }, []);
  const [mounted, setMounted] = useState(false);
  const shareRef = useRef<MystiShareImageGeneratorHandle>(null);

  useEffect(() => {
    setDailyCard(getDailyCard());
    setMounted(true);
    trackMystiEvent('mysti_daily_view');
  }, []);

  const pullBonusCard = useCallback(() => {
    if (!subscriber || bonusUsedToday) return;
    const card = getRandomBonusCard(getDailyCardIndex());
    setBonusCard(card);
    setBonusUsedToday(true);
    try {
      window.localStorage.setItem('mysti-bonus-pull-date', new Date().toDateString());
      trackMystiEvent('mysti_daily_bonus_pull', { arcana: card.arcanaName });
    } catch {
      /* swallow */
    }
  }, [subscriber, bonusUsedToday]);

  const toggleTheme = useCallback(() => {
    setThemeId(prev => {
      const next = prev === 'celestial' ? 'pale' : 'celestial';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const theme = MYSTI_THEMES[themeId];
  const today = new Date();
  const dateStr = formatDateCN(today);

  if (!dailyCard) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: theme.bg, color: theme.text }}>
        <div className="text-sm" style={{ color: theme.textMuted }}>加载中…</div>
      </div>
    );
  }

  const gradientBgStyle = {
    background: `linear-gradient(180deg, ${theme.gradientBg[0]} 0%, ${theme.gradientBg[1]} 100%)`,
    color: theme.text,
  };

  return (
    <div className="min-h-screen" style={gradientBgStyle}>
      {/* Top bar */}
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
        <Link href="/mysti/" className="text-sm font-medium tracking-wide opacity-80 hover:opacity-100 transition-opacity" style={{ color: theme.textMuted }}>
          WTFTI · 灵鉴
        </Link>
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-full text-xs border transition-all hover:brightness-110"
          style={{ borderColor: theme.divider, color: theme.accent, background: theme.accentSoft }}
          aria-label="切换主题"
        >
          {theme.label}
        </button>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 pb-20">
        {/* Date display */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-4 pb-6"
        >
          <div className="text-xs tracking-wider mb-2" style={{ color: theme.textMuted }}>
            {dateStr}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            每日一牌
          </h1>
          <div className="w-16 h-px mx-auto" style={{ background: theme.divider }} />
        </motion.div>

        {/* Arcana header */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center mb-6"
        >
          <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.accent }}>
            大阿卡纳
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {dailyCard.arcanaNameCN}
          </h2>
          <div className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {dailyCard.arcanaName}
          </div>
        </motion.div>

        {/* Tarot card with 3D flip */}
        <FlipCard theme={theme} mounted={mounted} delay={0.15} className="mx-auto max-w-sm mb-8">
          <div
            className="aspect-[2/3] rounded-2xl border flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientCard[0]} 0%, ${theme.gradientCard[1]} 100%)`,
              borderColor: theme.cardBorder,
              boxShadow: `0 24px 80px -24px ${theme.cardGlow}`,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />
            <div className="text-6xl sm:text-7xl font-serif mb-4" style={{ color: theme.accent }}>
              {dailyCard.arcanaNameCN.slice(0, 1)}
            </div>
            <div className="text-lg font-medium" style={{ color: theme.text }}>
              {dailyCard.arcanaNameCN}
            </div>
            <div className="text-xs mt-2" style={{ color: theme.textMuted }}>
              {dailyCard.arcanaName}
            </div>
            {/* Lucky number */}
            <div
              className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: theme.accentSoft, color: theme.accent }}
            >
              {dailyCard.luckyNumber}
            </div>
          </div>
        </FlipCard>

        {/* Keywords */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {dailyCard.keywords.map((kw, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs border"
              style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.accent }}
            >
              {kw}
            </span>
          ))}
        </motion.div>

        {/* Daily reading */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border p-5 mb-6"
          style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
        >
          <div className="text-xs tracking-wider uppercase mb-3 text-center" style={{ color: theme.accent }}>
            ✦ 今日解读 ✦
          </div>
          <p className="text-sm leading-relaxed text-center" style={{ color: theme.text }}>
            {dailyCard.dailyReading}
          </p>
        </motion.div>

        {/* Action */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-xl border p-5 mb-6"
          style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
        >
          <div className="text-xs tracking-wider uppercase mb-3 text-center" style={{ color: theme.accent }}>
            🎯 今日行动
          </div>
          <p className="text-sm leading-relaxed text-center" style={{ color: theme.text }}>
            {dailyCard.action}
          </p>
        </motion.div>

        {/* Lucky color + Lucky number */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div
            className="rounded-xl border p-4 text-center"
            style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
          >
            <div className="text-xs tracking-wider uppercase mb-2" style={{ color: theme.textMuted }}>
              幸运色
            </div>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: dailyCard.luckyColor, borderColor: theme.divider }}
              />
              <span className="text-sm font-mono" style={{ color: theme.text }}>
                {dailyCard.luckyColor}
              </span>
            </div>
          </div>
          <div
            className="rounded-xl border p-4 text-center"
            style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
          >
            <div className="text-xs tracking-wider uppercase mb-2" style={{ color: theme.textMuted }}>
              幸运数
            </div>
            <div className="text-3xl font-serif font-bold" style={{ color: theme.accent }}>
              {dailyCard.luckyNumber}
            </div>
          </div>
        </motion.div>

        {/* Subscriber-only bonus pull */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="rounded-2xl border p-5 mb-6 text-center"
          style={{ borderColor: theme.cardBorder, background: `${theme.cardSurface}40` }}
        >
          {subscriber ? (
            bonusCard ? (
              <div>
                <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.accent }}>
                  会员加抽 · {bonusCard.arcanaNameCN}
                </div>
                <p className="text-sm" style={{ color: theme.text }}>
                  {bonusCard.dailyReading}
                </p>
                <p className="text-xs mt-3" style={{ color: theme.textMuted }}>
                  今日已使用加抽 · 明日 0 点重置
                </p>
              </div>
            ) : (
              <button
                onClick={pullBonusCard}
                disabled={bonusUsedToday}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: 'var(--color-bg-primary)' }}
              >
                {bonusUsedToday ? '今日已加抽过' : '🎴 通行证特权 · 再翻一张'}
              </button>
            )
          ) : (
            <div>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                通行证会员每天可额外翻一张牌
              </p>
              <Link
                href="/mysti/subscribe/?from=daily_bonus"
                className="inline-flex mt-3 px-4 py-2 rounded-full text-xs border transition-all hover:opacity-80"
                style={{ borderColor: theme.cardBorder, color: theme.accent }}
              >
                了解通行证 →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Share CTA */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="rounded-2xl border p-6 sm:p-8 text-center"
          style={{ borderColor: theme.cardBorder, background: `${theme.cardSurface}60` }}
        >
          <div className="text-2xl mb-2">✦</div>
          <h3 className="text-base font-semibold mb-1">生成今日卡牌</h3>
          <p className="text-xs sm:text-sm mb-5" style={{ color: theme.textMuted }}>
            将今日卡牌保存为图片，分享给你的一天
          </p>
          <div className="max-w-xs mx-auto">
            <MystiDailyShareImageGenerator ref={shareRef} dailyCard={dailyCard} themeId={themeId} />
          </div>
        </motion.div>

        {/* Back links */}
        <motion.div
          initial={mounted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/mysti/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
            style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: 'var(--color-bg-primary)' }}
          >
            🔮 查看你的灵魂牌
          </Link>
          <Link
            href="/mysti/gacha/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm border transition-all hover:opacity-80"
            style={{ borderColor: 'color-mix(in oklab, var(--color-accent) 45%, transparent)', color: 'var(--color-text-muted)' }}
          >
            🎴 每日抽卡
          </Link>
          <Link
            href="/mysti/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm border transition-all hover:opacity-80"
            style={{ borderColor: theme.divider, color: theme.textMuted }}
          >
            返回灵鉴首页
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

/* ─── 3D Flip Card Component (reused from MystiResultContent) ─── */

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
        <circle cx="100" cy="150" r="60" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.4" />
        <circle cx="100" cy="150" r="40" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
        <circle cx="100" cy="150" r="20" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.2" />
        <line x1="100" y1="90" x2="100" y2="210" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
        <line x1="40" y1="150" x2="160" y2="150" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
        <line x1="58" y1="108" x2="142" y2="192" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.25" />
        <line x1="58" y1="192" x2="142" y2="108" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.25" />
        <circle cx="100" cy="80" r="2" fill={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} opacity="0.5" />
        <circle cx="100" cy="220" r="2" fill={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} opacity="0.5" />
        <circle cx="40" cy="150" r="2" fill={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} opacity="0.5" />
        <circle cx="160" cy="150" r="2" fill={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} opacity="0.5" />
        <path d="M20,20 L40,20 L20,40 Z" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
        <path d="M180,20 L160,20 L180,40 Z" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
        <path d="M20,280 L40,280 L20,260 Z" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
        <path d="M180,280 L160,280 L180,260 Z" stroke={isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'} strokeWidth="0.5" opacity="0.3" />
      </svg>

      {/* Center symbol */}
      <div
        className="text-5xl font-serif relative z-10"
        style={{ color: isCelestial ? 'var(--color-gold)' : 'var(--color-accent)', opacity: 0.6 }}
      >
        ✦
      </div>

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${isCelestial ? 'var(--color-gold)' : 'var(--color-accent)'}, transparent)` }}
      />
    </div>
  );
}

interface FlipCardProps {
  theme: MystiTheme;
  mounted: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

function FlipCard({ theme, mounted, delay = 0, className = '', children }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const flipTimer = setTimeout(() => setIsFlipped(true), delay * 1000);
    const glowTimer = setTimeout(() => setShowGlow(true), delay * 1000 + 900);
    return () => {
      clearTimeout(flipTimer);
      clearTimeout(glowTimer);
    };
  }, [mounted, delay]);

  return (
    <div className={className} style={{ perspective: '1000px' }}>
      <motion.div
        initial={mounted ? { rotateY: 180, opacity: 0 } : false}
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
            ? `0 0 40px 8px ${theme.id === 'celestial' ? 'rgba(201,168,108,0.3)' : 'rgba(168,92,100,0.2)'}, 0 24px 80px -24px ${theme.cardGlow}`
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
          {children}
        </div>
      </motion.div>
    </div>
  );
}
