'use client';

import dynamic from 'next/dynamic';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_NAMES, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import { SOULTI_PERSONALITY_TYPES, getSoultiRarity, getSoultiResonance, getSoultiPersonalityBySlug, getSoultiTypeMediumImage, getSoultiTypeEmojiFallbackImage } from '@/lib/soulti/personalities';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import type { SoultiDimensionScore } from '@/lib/soulti/scoring';
import type { SoultiLayeredResult } from '@/lib/soulti/scoring';
import { calculateTearRate } from '@/lib/soulti/scoring';
const SoultiShareImageGenerator = dynamic(
  () => import('@/components/SoultiShareImageGenerator').then((m) => m.SoultiShareImageGenerator),
  { ssr: false },
);
import type { SoultiShareImageGeneratorHandle } from '@/components/SoultiShareImageGenerator';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { SoultiCommunityCTA } from '@/components/SoultiCommunityCTA';
import { SoultiTearRateHero } from '@/components/SoultiTearRateHero';
import { SoultiTonightAction } from '@/components/SoultiTonightAction';
import { SoultiSoulLetterSubscribe } from '@/components/SoultiSoulLetterSubscribe';
import { SoultiMonthlyRetestNudge } from '@/components/SoultiMonthlyRetestNudge';
import { SoultiWishingWell } from '@/components/SoultiWishingWell';
import { HermosaInputCard } from '@/components/hermosa/HermosaInputCard';
import { SoultiShareCardSwitcher } from '@/components/SoultiShareCardSwitcher';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';
import { getCurrentWeeklyPrompt } from '@/lib/soulti/deep-report';
import { useAuth } from '@/components/AuthProvider';
import { getSoultiExtendedSections, generateSoulLetter } from '@/lib/soulti/extended-sections';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';
import { trackSoulti } from '@/lib/soulti/analytics';

interface Props {
  personality: SoultiPersonalityType;
  dimensionScores: SoultiDimensionScore[];
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

export function SoultiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const shareRef = useRef<SoultiShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef, SoultiShareImageGenerator);
  const [activeMirror, setActiveMirror] = useState<'day' | 'night' | 'dream'>('day');
  const { isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t0 = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t0);
  }, []);

  const layered = useMemo<SoultiLayeredResult | null>(() => {
    if (!mounted || typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('soulti-layered');
      if (!raw) return null;
      const data = JSON.parse(raw) as SoultiLayeredResult;
      return data.overall?.slug === personality.slug ? data : null;
    } catch {
      return null;
    }
  }, [mounted, personality.slug]);

  const shareUrl = getSiteUrl(`/soulti/result/${personality.slug}/`);
  const unlockHref = `/auth/login/?next=${encodeURIComponent(`/soulti/result/${personality.slug}/`)}`;
  const resonance = getSoultiResonance(personality.slug);
  const rarity = getSoultiRarity(personality.slug);

  // Fire one durable `soulti_finish` event per page mount so the ops dashboard
  // can build a real entry → finish funnel for SoulTI.
  useEffect(() => {
    trackSoulti('soulti_finish', {
      slug: personality.slug,
      code: personality.code,
      tier: rarity?.tier,
    });
  }, [personality.slug, personality.code, rarity?.tier]);

  const mirrorType = resonance ? SOULTI_PERSONALITY_TYPES.find(p => p.slug === resonance.mirrorSlug) : undefined;
  const oppositeType = resonance ? SOULTI_PERSONALITY_TYPES.find(p => p.slug === resonance.oppositeSlug) : undefined;

  const [xhsCopied, setXhsCopied] = useState(false);

  const copyXhsText = useCallback(() => {
    const desc = personality.description;
    const seeMatch = desc.match(/【看见】\n([\s\S]*?)(?=\n【)/);
    const seeLine = seeMatch ? seeMatch[1].split('\n').filter(Boolean)[0] : personality.tagline;

    const text = [
      `🫧 ${personality.name} | ${personality.code}`,
      `"${personality.tagline}"`,
      '',
      seeLine,
      '',
      `✨ 我的五轴画像：`,
      ...dimensionScores.map(ds => {
        const dim = SOULTI_DIMENSIONS.find(d => d.id === ds.id);
        return dim ? `${dim.poleALabel}${ds.level === 'H' ? '▓▓▓' : ds.level === 'M' ? '▓▓░' : '▓░░'}${dim.poleBLabel}` : '';
      }),
      '',
      `来照三面镜子 → wtfti.com/soulti`,
      '',
      '#SoulTI #自然人格 #性格测试 #内耗 #边界感 #人格测试',
    ].join('\n');
    navigator.clipboard.writeText(text);
    setXhsCopied(true);
    setTimeout(() => setXhsCopied(false), 2000);
  }, [personality, dimensionScores]);

  const copyShareText = useCallback(() => {
    const text = `我的自然人格是「${personality.name}」${personality.code}\n${personality.tagline}\n来探寻你的灵魂 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [personality.code, personality.name, personality.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    trackSoulti('soulti_share_click', { slug: personality.slug, code: personality.code, channel: 'native' });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的自然人格是「${personality.name}」${personality.code}`,
          text: personality.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  }, [copyLink, personality.code, personality.name, personality.tagline, shareUrl]);

  // Parse description sections
  const descSections = personality.description.split(/【(.*?)】/).filter(Boolean);
  const parsedSections: { title: string; content: string }[] = [];
  for (let i = 0; i < descSections.length; i += 2) {
    if (i + 1 < descSections.length) {
      parsedSections.push({ title: descSections[i], content: descSections[i + 1].trim() });
    }
  }

  // Spaced-out code letters for display
  const spacedCode = personality.code.split('').join(' · ');

  // Tear rate level (drives Tonight's Action picker as well)
  const tearLevel = useMemo(() => {
    if (!layered) return undefined;
    return calculateTearRate(layered).level;
  }, [layered]);

  return (
    <div className="min-h-screen" data-soulti-surface="cream" style={{ background: '#FAF8F5' }}>

      {/* ── Header bar ── */}
      <motion.header
        className="flex items-center justify-between px-6 pt-6 pb-2 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-xs tracking-[0.15em] text-[#7A6A5A] font-medium" style={{ fontFamily: serifFont }}>
          SoulTI
        </span>
        <span className="text-xs tracking-wider text-[#7A6A5A] font-medium font-mono">
          {personality.number} / 32
        </span>
      </motion.header>

      {/* ── E1 · Tear Rate Hero (撕裂度首屏) — strategy 2026-04-19 ── */}
      {layered && <SoultiTearRateHero layered={layered} accent={personality.color} />}

      {/* ── E11 · Monthly Retest Nudge — only renders when previous snapshot ≥ 25 days old ── */}
      {layered && (
        <SoultiMonthlyRetestNudge
          personalitySlug={personality.slug}
          currentTearRate={calculateTearRate(layered).percent}
          accent={personality.color}
        />
      )}

      {/* ── Hero: Type code + name ── */}
      <section className="max-w-2xl mx-auto px-6 pt-12 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Share button - subtle, top right */}
          <div className="relative">
            <button
              onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
              className="absolute -top-2 right-0 p-2 rounded-lg text-[#7A6A5A] opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
              title="生成分享图片"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <p className="text-xs tracking-[0.2em] text-[#7A6A5A] font-medium mb-8">
            你的自然人格是
          </p>

          {/* Hero character image */}
          <div
            className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto mb-8 rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}12 100%)`,
              border: `1px solid ${personality.color}20`,
            }}
          >
            {!heroImageFailed ? (
              <NextImage
                src={getSoultiTypeMediumImage(personality.slug)}
                alt={personality.name}
                fill
                sizes="(max-width: 768px) 224px, 288px"
                className="object-contain drop-shadow-lg"
                priority
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
                onError={() => setHeroImageFailed(true)}
              />
            ) : (
              <NextImage
                src={getSoultiTypeEmojiFallbackImage(personality.slug)}
                alt={personality.name}
                fill
                sizes="(max-width: 768px) 224px, 288px"
                className="object-contain drop-shadow-lg"
                priority
              />
            )}
          </div>

          {/* Type code — large serif, single line */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl mb-3 whitespace-nowrap"
            style={{
              fontFamily: serifFont,
              fontWeight: 400,
              color: personality.color,
              letterSpacing: '0.08em',
            }}
          >
            {spacedCode}
          </h1>

          {/* Source line */}
          <p
            className="text-xs text-[#6A6054] mb-6 tracking-wider"
            style={{ fontFamily: serifFont, fontStyle: 'italic' }}
          >
            — 向内探索 · 自然人格
          </p>

          {/* Chinese name */}
          <h2
            className="text-2xl sm:text-3xl tracking-[0.4em] mb-2"
            style={{
              fontFamily: serifFont,
              fontWeight: 400,
              color: '#2D2A26',
            }}
          >
            {personality.name}
          </h2>

          {/* Resonance sub-title — historical woman binding (HERTI-style naming layer) */}
          {resonance && (
            <p
              className="text-xs tracking-[0.3em] mb-0"
              style={{
                fontFamily: serifFont,
                color: personality.color,
                fontStyle: 'italic',
                opacity: 0.85,
              }}
            >
              · {resonance.soulOrigin.zhName} ·
            </p>
          )}

          {/* Rarity */}
          <div className="flex items-center justify-center gap-2 mt-4 mb-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] tracking-wider border"
              style={{ color: rarity.color, background: rarity.bgColor, borderColor: `${rarity.color}20` }}
            >
              {rarity.tier === 'legendary' && '✦ '}
              {rarity.tier === 'epic' && '◆ '}
              {rarity.label}
            </span>
            <span className="text-[10px] text-[#6A6054] font-semibold tracking-wider">
              {rarity.populationPct}% 的同频灵魂
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/60" />
      </div>

      {/* ── Quote section ── */}
      {resonance && (
        <motion.section
          className="max-w-2xl mx-auto px-6 py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <blockquote
            className="text-lg sm:text-xl leading-[2] text-text-primary whitespace-pre-line"
            style={{ fontFamily: serifFont, fontStyle: 'italic' }}
          >
            &ldquo;{resonance.quote}&rdquo;
          </blockquote>
          <p
            className="mt-4 text-xs text-[#6A6054] tracking-wider"
            style={{ fontFamily: serifFont }}
          >
            — {resonance.quoteSource}
          </p>
        </motion.section>
      )}

      {/* ── Divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/60" />
      </div>

      {/* ── THREE MIRRORS — 三面镜子（分层展示） ── */}
      {layered && (() => {
        const dayP = getSoultiPersonalityBySlug(layered.daySelf.slug);
        const nightP = getSoultiPersonalityBySlug(layered.nightSelf.slug);
        const dreamP = getSoultiPersonalityBySlug(layered.dreamTendency.slug);
        if (!dayP || !nightP || !dreamP) return null;

        const layerThemes = {
          day: { bg: 'linear-gradient(180deg, #FFF8F0 0%, #FAF4EC 100%)', accent: '#C4883A', border: '#C4883A20', label: '白天的你', sub: 'DAY SELF', emoji: '☀️', desc: '阳光下呈现的你——社交、行动、表达。这是世界最常看到的那一面。' },
          night: { bg: 'linear-gradient(180deg, #1A1B2E 0%, #252840 100%)', accent: '#8B9FD4', border: '#8B9FD430', label: '深夜的你', sub: 'NIGHT SELF', emoji: '🌙', desc: '夜晚独处时的你——脆弱、真实、不加修饰。这是你只给自己看的面。' },
          dream: { bg: 'linear-gradient(180deg, #F0F5F3 0%, #E8F0EC 100%)', accent: '#6B9B85', border: '#6B9B8520', label: '梦里的你', sub: 'DREAM SELF', emoji: '💭', desc: '潜意识中的倾向——修复、蜕变、你尚未展开的可能性。' },
        };

        const layers = [
          { key: 'day' as const, p: dayP, dims: layered.daySelf.dimensions, locked: false },
          { key: 'night' as const, p: nightP, dims: layered.nightSelf.dimensions, locked: !isAuthenticated },
          { key: 'dream' as const, p: dreamP, dims: layered.dreamTendency.dimensions, locked: !isAuthenticated },
        ];

        return (
          <motion.section
            className="max-w-2xl mx-auto px-6 py-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <h3
              className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-2"
              style={{ fontFamily: serifFont }}
            >
              THREE MIRRORS · 三面镜子
            </h3>
            <p className="text-xs text-[#7A6A5A] mb-8 font-medium" style={{ fontFamily: serifFont }}>
              同一个你，在不同时刻呈现的自然力
            </p>

            {/* Layer tab selector */}
            <div className="flex gap-2 mb-8">
              {layers.map(({ key, locked }) => {
                const theme = layerThemes[key];
                const isActive = activeMirror === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveMirror(key)}
                    className={`flex-1 py-3 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                      isActive ? 'shadow-sm scale-[1.02]' : 'opacity-70 hover:opacity-90'
                    }`}
                    style={{
                      borderColor: isActive ? theme.accent + '40' : 'transparent',
                      background: isActive ? (key === 'night' ? '#252840' : `${theme.accent}08`) : '#FDFCFA',
                    }}
                  >
                    <span className="text-lg block mb-1">{theme.emoji}</span>
                    <span
                      className="text-[10px] tracking-[0.15em] block"
                      style={{
                        fontFamily: serifFont,
                        color: key === 'night' && isActive ? '#B8C4E0' : theme.accent,
                      }}
                    >
                      {theme.label}
                    </span>
                    {locked && (
                      <span className="text-[9px] text-[#999] block mt-0.5">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active layer content */}
            {layers.map(({ key, p, dims, locked }) => {
              if (activeMirror !== key) return null;
              const theme = layerThemes[key];
              const isNight = key === 'night';
              const textColor = isNight ? 'rgba(255,255,255,0.9)' : '#2D2A26';
              const subtextColor = isNight ? 'rgba(255,255,255,0.6)' : '#6A6054';

              // Parse description sections for this personality
              const layerSections = p.description.split(/【(.*?)】/).filter(Boolean);
              const firstSection = layerSections.length >= 2 ? layerSections[1].trim() : p.tagline;
              const firstLine = firstSection.split('\n').filter(Boolean)[0] || p.tagline;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl overflow-hidden border"
                  style={{
                    background: theme.bg,
                    borderColor: theme.border,
                  }}
                >
                  <div className="p-6 sm:p-8">
                    {/* Layer header */}
                    <p
                      className="text-[10px] tracking-[0.3em] font-medium uppercase mb-1"
                      style={{ fontFamily: serifFont, color: theme.accent }}
                    >
                      {theme.sub}
                    </p>
                    <p className="text-xs mb-6" style={{ fontFamily: serifFont, color: subtextColor }}>
                      {theme.desc}
                    </p>

                    {/* Personality info */}
                    <div className="text-center mb-6">
                      <div className="text-3xl mb-2">{p.emoji}</div>
                      <h4
                        className="text-2xl tracking-[0.15em] mb-1"
                        style={{ fontFamily: serifFont, fontWeight: 400, color: textColor }}
                      >
                        {p.name}
                      </h4>
                      <p className="text-xs font-mono tracking-wider mb-2" style={{ color: theme.accent }}>
                        {p.code}
                      </p>
                      <p
                        className="text-sm leading-[1.8] max-w-sm mx-auto"
                        style={{ fontFamily: serifFont, color: subtextColor }}
                      >
                        {p.tagline}
                      </p>
                    </div>

                    {locked ? (
                      /* ── Locked layer: blurred preview ── */
                      <div className="relative">
                        <div className="select-none pointer-events-none" aria-hidden>
                          {/* Show first line for night, just title for dream */}
                          {key === 'night' && (
                            <p
                              className="text-sm leading-[1.8] mb-3"
                              style={{ fontFamily: serifFont, color: subtextColor }}
                            >
                              {firstLine}
                            </p>
                          )}
                          {key === 'dream' && (
                            <p
                              className="text-sm leading-[1.8] mb-3"
                              style={{ fontFamily: serifFont, color: subtextColor }}
                            >
                              你的修复方式是……
                            </p>
                          )}

                          {/* Blurred fake content */}
                          <div style={{ filter: 'blur(8px)' }}>
                            <div className="space-y-3">
                              <p className="text-sm leading-[1.8]" style={{ color: subtextColor }}>
                                {firstSection.slice(0, 120)}……这种模式的根源在于你深层的保护机制，
                                它让你在关系中反复经历同样的循环。
                              </p>
                              {/* Blurred dimension bars */}
                              <div className="space-y-2 mt-4">
                                {dims.map(ds => {
                                  const dim = SOULTI_DIMENSIONS.find(d => d.id === ds.id);
                                  if (!dim) return null;
                                  const pct = ((ds.score - 1) / 2) * 100;
                                  return (
                                    <div key={ds.id} className="flex items-center gap-3">
                                      <span className="text-xs w-6" style={{ color: subtextColor }}>{ds.id}</span>
                                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: isNight ? 'rgba(255,255,255,0.1)' : '#EDE8E2' }}>
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: theme.accent }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Unlock CTA overlay */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                          style={{
                            background: isNight
                              ? 'linear-gradient(180deg, rgba(26,27,46,0.3) 0%, rgba(26,27,46,0.85) 60%)'
                              : 'linear-gradient(180deg, rgba(253,252,250,0.2) 0%, rgba(253,252,250,0.85) 60%)',
                          }}
                        >
                          <p
                            className="text-sm mb-4 text-center"
                            style={{ fontFamily: serifFont, color: textColor }}
                          >
                            {key === 'night' ? '深夜的你，藏着白天不敢说的话。' : '梦里的你，指向尚未展开的蜕变。'}
                          </p>
                          <Link
                            href={unlockHref}
                            className="px-6 py-2.5 rounded-full text-sm text-white transition-all hover:scale-[1.02]"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent})`,
                              boxShadow: `0 4px 16px ${theme.accent}30`,
                              fontFamily: serifFont,
                              letterSpacing: '0.08em',
                            }}
                          >
                            登录解锁完整镜像
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* ── Unlocked layer (Day): full content ── */
                      <div>
                        {/* Description first section */}
                        <p
                          className="text-sm leading-[2] mb-6"
                          style={{ fontFamily: serifFont, color: subtextColor }}
                        >
                          {firstSection}
                        </p>

                        {/* Dimension bars */}
                        <div className="space-y-4">
                          {dims.map(ds => {
                            const dim = SOULTI_DIMENSIONS.find(d => d.id === ds.id);
                            if (!dim) return null;
                            const color = SOULTI_MODEL_COLORS[dim.model];
                            const pct = ((ds.score - 1) / 2) * 100;
                            return (
                              <div key={ds.id}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                                    <span className="text-sm" style={{ color: textColor }}>{SOULTI_MODEL_NAMES[dim.model]}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs" style={{ color: subtextColor }}>
                                    <span>{dim.poleALabel}</span>
                                    <span className="font-mono">{ds.level}</span>
                                    <span>{dim.poleBLabel}</span>
                                  </div>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EDE8E2' }}>
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${color.base}, ${color.light})` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                  />
                                </div>
                                <p className="text-xs mt-1" style={{ color: subtextColor }}>{dim.levels[ds.level]}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* ── 撕裂度 Tear Rate ── 独有功能，HERTI 永远无法提供 */}
            {(() => {
              const tear = calculateTearRate(layered);
              const ringColor =
                tear.level === 'aligned' ? '#5b8a72' :
                tear.level === 'partial' ? '#8b7355' :
                tear.level === 'split' ? '#b07850' :
                '#7a6b8a';
              const circ = 2 * Math.PI * 42;
              const offset = circ * (1 - tear.percent / 100);
              const divergentNames = tear.divergentAxes
                .map(id => {
                  const dim = SOULTI_DIMENSIONS.find(d => d.id === id);
                  return dim ? SOULTI_MODEL_NAMES[dim.model] : null;
                })
                .filter(Boolean)
                .join(' × ');

              return (
                <div className="mt-10 rounded-2xl border p-6 sm:p-8" style={{ borderColor: `${ringColor}25`, background: '#FDFCFA' }}>
                  <p
                    className="text-[10px] tracking-[0.35em] font-medium uppercase mb-5 text-center"
                    style={{ fontFamily: serifFont, color: ringColor }}
                  >
                    TEAR RATE · 撕裂度
                  </p>

                  <div className="flex items-center justify-center gap-6 sm:gap-8">
                    {/* Ring indicator */}
                    <div className="relative">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#EDE8E2" strokeWidth="4" />
                        <motion.circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={circ}
                          initial={{ strokeDashoffset: circ }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ delay: 0.4, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                        <text
                          x="50" y="50"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="22"
                          fontFamily={serifFont}
                          fill={ringColor}
                          fontWeight="400"
                        >
                          {tear.percent}%
                        </text>
                      </svg>
                    </div>

                    {/* Label & narrative */}
                    <div className="flex-1 max-w-[260px]">
                      <p
                        className="text-sm tracking-[0.2em] mb-1"
                        style={{ fontFamily: serifFont, color: ringColor }}
                      >
                        {tear.label}
                      </p>
                      {divergentNames && (
                        <p className="text-[10px] text-[#6A6054] tracking-wider mb-2" style={{ fontFamily: serifFont }}>
                          差异最大 · {divergentNames}
                        </p>
                      )}
                      <p
                        className="text-xs leading-[1.9] text-[#6A6054]"
                        style={{ fontFamily: serifFont }}
                      >
                        {tear.narrative}
                      </p>
                    </div>
                  </div>

                  {/* Tension hint — when day and night differ */}
                  {layered.daySelf.slug !== layered.nightSelf.slug && (
                    <p
                      className="text-center text-xs text-text-primary opacity-90 mt-6 pt-5 border-t leading-relaxed"
                      style={{ fontFamily: serifFont, fontStyle: 'italic', borderColor: `${ringColor}15` }}
                    >
                      白天你是{dayP.name}，深夜你变成{nightP.name}。<br />
                      这不是矛盾——是你的不同面在轮流照顾你。
                    </p>
                  )}
                </div>
              );
            })()}
          </motion.section>
        );
      })()}

      {/* ── Deep Mirror Report Teaser (demand tracking) ── */}
      {layered && (() => {
        const dayName = getSoultiPersonalityBySlug(layered.daySelf.slug)?.name ?? '';
        const nightName = getSoultiPersonalityBySlug(layered.nightSelf.slug)?.name ?? '';
        const hasDayNightDiff = layered.daySelf.slug !== layered.nightSelf.slug;
        return (
        <motion.section
          className="max-w-2xl mx-auto px-6 py-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden border p-6 sm:p-8"
            style={{ borderColor: `${personality.color}15`, background: '#FDFCFA' }}
          >
            {/* Blurred preview content */}
            <div className="select-none pointer-events-none" aria-hidden>
              <p
                className="text-[10px] tracking-[0.35em] text-[#8b7355] font-medium uppercase mb-4"
                style={{ fontFamily: serifFont }}
              >
                DEEP MIRROR · 深度镜像报告
              </p>
              <div className="space-y-3 [filter:blur(6px)]">
                <p className="text-sm leading-relaxed text-[#6A6054]" style={{ fontFamily: serifFont }}>
                  {hasDayNightDiff
                    ? `白天你是${dayName}，深夜你变成${nightName}——这不只是两个标签，而是你内在的一场持续对话。`
                    : `你的日常人格和梦境倾向之间存在微妙的错位——这种张力可能是你尚未被看见的部分。`}
                </p>
                <p className="text-sm leading-relaxed text-[#6A6054]" style={{ fontFamily: serifFont }}>
                  你的界限轴和火焰轴之间的交叉张力，解释了你在关系中反复出现的那个模式：
                  为什么总是等到烧完了，才允许自己离开……
                </p>
                <p className="text-sm leading-relaxed text-[#6A6054]" style={{ fontFamily: serifFont }}>
                  基于你的蜕变方式，你的修复处方是……
                </p>
              </div>
            </div>

            {/* CTA overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDFCFA]/60 backdrop-blur-[2px]">
              <p
                className="text-sm text-[#6A6054] mb-2 text-center leading-relaxed"
                style={{ fontFamily: serifFont }}
              >
                你的三层镜像之间，藏着一个故事。
              </p>
              <p
                className="text-xs text-[#6A6054] font-medium mb-5 text-center"
                style={{ fontFamily: serifFont }}
              >
                轴间交叉解读 · 修复处方 · 写给你的长信
              </p>
              <Link
                href={`/soulti/report/${personality.slug}`}
                onClick={() => {
                  trackSoulti('soulti_deep_report_view', {
                    slug: personality.slug,
                    code: personality.code,
                    source: 'result_teaser',
                  });
                  // Track demand signal
                  try {
                    const key = 'soulti-deep-mirror-clicks';
                    const prev = JSON.parse(localStorage.getItem(key) || '[]') as Array<{ t: number; slug: string }>;
                    prev.push({ t: Date.now(), slug: personality.slug });
                    localStorage.setItem(key, JSON.stringify(prev.slice(-200)));
                  } catch { /* ignore */ }
                  // GTM / analytics dataLayer push
                  if (typeof window !== 'undefined' && Array.isArray((window as unknown as Record<string, unknown[]>).dataLayer)) {
                    (window as unknown as Record<string, unknown[]>).dataLayer.push({
                      event: 'soulti_deep_mirror_click',
                      personality_slug: personality.slug,
                      personality_code: personality.code,
                    });
                  }
                }}
                className="px-8 py-3 rounded-full text-sm text-white transition-all hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${personality.color}cc, ${personality.color})`,
                  boxShadow: `0 4px 20px ${personality.color}30`,
                  fontFamily: serifFont,
                  letterSpacing: '0.1em',
                }}
              >
                查看深度镜像报告
              </Link>
            </div>
          </div>
        </motion.section>
        );
      })()}

      {/* ── E9 · Tonight's Small Action — free, actionable closer ── */}
      <SoultiTonightAction
        personality={personality}
        tearLevel={tearLevel}
      />

      {/* ── Divider ── */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t border-border-subtle/60" />
      </div>

      {/* ── PERSONA section ── */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pt-12 pb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h3
          className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-8"
          style={{ fontFamily: serifFont }}
        >
          PERSONA
        </h3>

        <div className="space-y-8">
          {parsedSections.map((sec) => (
            <div key={sec.title}>
              <h4
                className="text-sm tracking-[0.15em] mb-3"
                style={{ fontFamily: serifFont, color: personality.color }}
              >
                {sec.title}
              </h4>
              <div
                className="text-[15px] leading-[2] text-[#6A6054] whitespace-pre-line"
              >
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Tags ── */}
      {resonance && (
        <motion.section
          className="max-w-2xl mx-auto px-6 pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-2 justify-start">
            {resonance.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs tracking-wider border"
                style={{
                  borderColor: `${personality.color}25`,
                  color: personality.color,
                  background: `${personality.color}08`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Soul Resonance dark card ── */}
      {resonance && (
        <motion.section
          className="max-w-2xl mx-auto px-6 pb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{ background: 'linear-gradient(145deg, #2A2520 0%, #1A1715 100%)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 8px 32px rgba(36, 33, 29, 0.1)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-8"
              style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.7)' }}
            >
              SOUL RESONANCE · 灵魂共振
            </p>

            <h4
              className="text-2xl sm:text-3xl tracking-wider mb-1"
              style={{
                fontFamily: serifFont,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.95)',
              }}
            >
              {resonance.soulOrigin.name}
            </h4>

            <p
              className="text-base tracking-[0.2em] mb-1"
              style={{
                fontFamily: serifFont,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              {resonance.soulOrigin.zhName}
            </p>

            <p
              className="text-xs tracking-wider mb-6"
              style={{
                fontFamily: serifFont,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {resonance.soulOrigin.era}
            </p>

            <p
              className="text-sm leading-[1.9]"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {resonance.soulOrigin.description}
            </p>

            {/* ── 她也曾像你一样 · Connector narrative ── */}
            <div className="mt-8 pt-7" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p
                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.45)' }}
              >
                · 她也曾像你一样 ·
              </p>
              <p
                className="text-sm leading-[2]"
                style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.82)', fontStyle: 'italic' }}
              >
                她也曾以「{personality.name}」的方式活过——
                <br />
                也曾{personality.tagline.replace(/，/g, '、')}。
                <br />
                而她最终，把这种{personality.name}的力量，留给了世界。
              </p>
              <p
                className="text-[11px] leading-[1.9] mt-5"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: serifFont }}
              >
                你不是第一个以这种方式保护自己的人——<br />
                你也不会是最后一个。
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Mirror & Opposite cards ── */}
      {(mirrorType || oppositeType) && (
        <motion.section
          className="max-w-2xl mx-auto px-6 pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {mirrorType && (() => {
              const mRarity = getSoultiRarity(mirrorType.slug);
              return (
              <Link
                href={`/soulti/result/${mirrorType.slug}/`}
                className="group rounded-2xl border border-border-subtle/80 p-6 transition-all hover:border-border hover:shadow-sm"
                style={{ background: '#FDFCFA' }}
              >
                <p className="text-[10px] tracking-[0.25em] text-[#8b7355] font-medium uppercase mb-4" style={{ fontFamily: serifFont }}>
                  your mirror · 镜像
                </p>
                <div className="text-2xl mb-2">{mirrorType.emoji}</div>
                <p
                  className="text-sm tracking-[0.15em] mb-1 group-hover:opacity-80 transition-opacity"
                  style={{ fontFamily: serifFont, color: mirrorType.color }}
                >
                  {mirrorType.code}
                </p>
                <p className="text-sm text-text-primary" style={{ fontFamily: serifFont }}>
                  {mirrorType.name}
                </p>
                <p className="mt-2 text-[10px]" style={{ color: mRarity.color }}>
                  {mRarity.label} · 仅 {mRarity.populationPct.toFixed(1)}%
                </p>
                <p className="mt-1 text-[10px] text-[#8a7f72]" style={{ fontFamily: serifFont }}>
                  {mirrorType.tagline}
                </p>
              </Link>
              );
            })()}
            {oppositeType && (() => {
              const oRarity = getSoultiRarity(oppositeType.slug);
              return (
              <Link
                href={`/soulti/result/${oppositeType.slug}/`}
                className="group rounded-2xl border border-border-subtle/80 p-6 transition-all hover:border-border hover:shadow-sm"
                style={{ background: '#FDFCFA' }}
              >
                <p className="text-[10px] tracking-[0.25em] text-[#8b7355] font-medium uppercase mb-4" style={{ fontFamily: serifFont }}>
                  your opposite · 反面
                </p>
                <div className="text-2xl mb-2">{oppositeType.emoji}</div>
                <p
                  className="text-sm tracking-[0.15em] mb-1 group-hover:opacity-80 transition-opacity"
                  style={{ fontFamily: serifFont, color: oppositeType.color }}
                >
                  {oppositeType.code}
                </p>
                <p className="text-sm text-text-primary" style={{ fontFamily: serifFont }}>
                  {oppositeType.name}
                </p>
                <p className="mt-2 text-[10px]" style={{ color: oRarity.color }}>
                  {oRarity.label} · 仅 {oRarity.populationPct.toFixed(1)}%
                </p>
                <p className="mt-1 text-[10px] text-[#8a7f72]" style={{ fontFamily: serifFont }}>
                  {oppositeType.tagline}
                </p>
              </Link>
              );
            })()}
          </div>
        </motion.section>
      )}

      {/* ── Dimension bars ── */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <h3
          className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-6"
          style={{ fontFamily: serifFont }}
        >
          {personality.code} · 五轴画像
        </h3>

        <div className="rounded-2xl border border-border-subtle/60 p-6 sm:p-8 space-y-6" style={{ background: '#FDFCFA' }}>
          {dimensionScores.map(ds => {
            const dim = SOULTI_DIMENSIONS.find(d => d.id === ds.id);
            if (!dim) return null;
            const color = SOULTI_MODEL_COLORS[dim.model];
            const pct = ((ds.score - 1) / 2) * 100;
            return (
              <div key={ds.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                    <span className="text-sm text-text-primary">{SOULTI_MODEL_NAMES[dim.model]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#7A6A5A] font-medium">
                    <span>{dim.poleALabel}</span>
                    <span className="font-mono">{ds.level}</span>
                    <span>{dim.poleBLabel}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color.base}, ${color.light})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <p className="text-xs text-[#7A6A5A] font-medium mt-1.5">{dim.levels[ds.level]}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Poetic closing ── */}
      <motion.section
        className="max-w-xl mx-auto px-6 pb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.6 }}
      >
        <div className="max-w-xs mx-auto mb-8">
          <div className="border-t border-border-subtle/40" />
        </div>
        <p
          className="text-sm leading-[2] text-[#6A6054]"
          style={{ fontFamily: serifFont, fontStyle: 'italic' }}
        >
          探索不是为了改变你，<br />
          而是让你看见——你已经是了。
        </p>
      </motion.section>

      {/* ── Weekly Mirror Prompt ── */}
      {(() => {
        const weeklyPrompt = getCurrentWeeklyPrompt();
        return (
          <motion.section
            className="max-w-2xl mx-auto px-6 pb-12"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.5 }}
          >
            <div
              className="rounded-2xl border p-6 sm:p-8 text-center"
              style={{ borderColor: `${personality.color}12`, background: '#FDFCFA' }}
            >
              <p
                className="text-[10px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-4"
                style={{ fontFamily: serifFont }}
              >
                THIS WEEK&apos;S MIRROR · 本周镜像
              </p>
              <p
                className="text-sm leading-[2] mb-3"
                style={{ fontFamily: serifFont, color: '#2D2A26' }}
              >
                {weeklyPrompt.prompt}
              </p>
              <p
                className="text-[10px] text-[#6A6054]"
                style={{ fontFamily: serifFont }}
              >
                WEEK {weeklyPrompt.week} · 每周更新
              </p>
            </div>
          </motion.section>
        );
      })()}

      {/* ── Deep Report Entry ── */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.72, duration: 0.5 }}
      >
        <Link
          href={`/soulti/report/${personality.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm border transition-all hover:scale-[1.02]"
          style={{
            fontFamily: serifFont,
            borderColor: `${personality.color}30`,
            color: personality.color,
            letterSpacing: '0.08em',
          }}
        >
          查看深度镜像报告 →
        </Link>
      </motion.section>

      {/* ── S-06 · 7 段式扩展（此刻送你 · 如果你开始不安） ── */}
      {(() => {
        const ext = getSoultiExtendedSections(personality, resonance);
        return (
          <motion.section
            className="max-w-2xl mx-auto px-6 pb-12"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: 0.5 }}
          >
            <div className="space-y-4">
              {ext.map((s) => {
                const locked = s.locked && !isAuthenticated;
                return (
                  <div
                    key={s.title}
                    className="rounded-2xl border p-6 sm:p-7 relative overflow-hidden"
                    style={{ borderColor: `${personality.color}20`, background: '#FDFCFA' }}
                  >
                    <p
                      className="text-[10px] tracking-[0.3em] uppercase mb-3"
                      style={{ fontFamily: serifFont, color: personality.color }}
                    >
                      {s.title}
                    </p>
                    <p
                      className={`text-[14px] leading-[2] whitespace-pre-line ${locked ? 'blur-sm select-none' : ''}`}
                      style={{ fontFamily: serifFont, color: '#3a352f' }}
                    >
                      {s.body}
                    </p>
                    {locked && (
                      <div className="absolute inset-0 flex items-end justify-center pb-6 bg-gradient-to-b from-transparent via-[#FDFCFA]/80 to-[#FDFCFA]">
                        <Link
                          href={unlockHref}
                          className="px-5 py-2 rounded-full text-xs border"
                          style={{
                            fontFamily: serifFont,
                            background: personality.color,
                            color: '#fff',
                            borderColor: personality.color,
                          }}
                        >
                          登录后展开「如果你开始不安」
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        );
      })()}

      {/* ── S-01b · 灵魂长信（登录解锁） ── */}
      {(() => {
        const tearRate = layered ? calculateTearRate(layered).percent : 0;
        const letter = generateSoulLetter(personality, resonance, { tearRate });
        const locked = !isAuthenticated;
        return (
          <motion.section
            className="max-w-2xl mx-auto px-6 pb-12"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.76, duration: 0.5 }}
          >
            <div
              className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #FDFCFA, #F5EFE5)', border: `1px solid ${personality.color}22` }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-4 text-center" style={{ fontFamily: serifFont, color: '#8b7355' }}>
                SOUL LETTER · 灵魂长信
              </p>
              <div className={locked ? 'blur-sm select-none' : ''}>
                <p className="text-base mb-4" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                  {letter.salutation}
                </p>
                {letter.paragraphs.map((para, i) => (
                  <p key={i} className="text-[14px] leading-[2.1] mb-3" style={{ fontFamily: serifFont, color: '#3a352f' }}>
                    {para}
                  </p>
                ))}
                <p className="mt-4 text-xs tracking-[0.2em] text-right" style={{ fontFamily: serifFont, color: '#8b7355' }}>
                  — {letter.signature}
                </p>
              </div>
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link
                    href={unlockHref}
                    className="px-6 py-3 rounded-full text-sm"
                    style={{
                      fontFamily: serifFont,
                      background: personality.color,
                      color: '#fff',
                    }}
                  >
                    登录阅读你的灵魂长信
                  </Link>
                </div>
              )}
            </div>
          </motion.section>
        );
      })()}

      {/* ── S-02 · 纵向分享卡 ── */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.78, duration: 0.5 }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase mb-4 text-center" style={{ fontFamily: serifFont, color: '#8b7355' }}>
          PORTRAIT CARD · 9:16 分享卡
        </p>
        <SoultiShareCardSwitcher
          personality={personality}
          tearRate={layered ? calculateTearRate(layered).percent : undefined}
          daySelfName={layered ? getSoultiPersonalityBySlug(layered.daySelf.slug)?.name : undefined}
          nightSelfName={layered ? getSoultiPersonalityBySlug(layered.nightSelf.slug)?.name : undefined}
        />
      </motion.section>

      {/* ── SoulTI 宇宙导航 ── */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-[10px] tracking-[0.3em] uppercase mb-4 text-center" style={{ fontFamily: serifFont, color: '#8b7355' }}>
          SOULTI UNIVERSE · 继续探索
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/soulti/map/', label: '全景图谱', desc: '32 型 × 5 轴' },
            { href: '/soulti/origin/', label: '历史原型', desc: '32 位她' },
            { href: `/soulti/pair/?a=${personality.slug}`, label: '双人共振', desc: '测 TA 和你' },
            { href: '/soulti/rarity/', label: '稀有度榜', desc: '你是哪一档' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5"
              style={{ borderColor: `${personality.color}25`, background: '#FDFCFA' }}
            >
              <p className="text-sm mb-1" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                {link.label}
              </p>
              <p className="text-[10px]" style={{ fontFamily: serifFont, color: '#8a7f72' }}>
                {link.desc}
              </p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── E6 · Soul Letter D+1 subscribe — turn one-shot into 7-day relationship ── */}
      <SoultiSoulLetterSubscribe
        personalitySlug={personality.slug}
        personalityName={personality.name}
        personalityCode={personality.code}
        tearRatePercent={layered ? calculateTearRate(layered).percent : undefined}
        accent={personality.color}
      />

      {/* ── E10 · Wishing Well (匿名许愿池) ── */}
      <SoultiWishingWell
        personalitySlug={personality.slug}
        personalityName={personality.name}
        accent={personality.color}
      />

      {/* ── HERMOSA · 她的话｜女性涂鸦黑板留言入口（W2 试点：SoulTI） ── */}
      <HermosaInputCard
        universe="soulti"
        slug={personality.slug}
        code={personality.code}
        personalityName={personality.name}
        accent={personality.color}
      />

      <SoultiCommunityCTA
        personalityName={personality.name}
        rarity={rarity}
        accentColor={personality.color}
      />

      <CrossTestRecommendations currentTest="soulti" personalityName={personality.name} />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="soulti" dimensionScores={dimensionScores} />
      </section>

      {/* ── Share section ── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h3
            className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-6 text-center"
            style={{ fontFamily: serifFont }}
          >
            发给朋友一起共振
          </h3>

          <div className="space-y-3">
            {shareMounted ? <SoultiShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} /> : null}

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-stone-300/40 bg-stone-100/30 text-sm text-stone-500 hover:bg-stone-100/60 transition-all cursor-pointer"
            >
              {textCopied ? '已复制分享文案 ✓' : '📋 复制分享文案'}
            </button>

            <button
              onClick={copyXhsText}
              className="w-full py-3 rounded-xl border text-sm transition-all cursor-pointer"
              style={{
                borderColor: `${personality.color}25`,
                color: personality.color,
                background: `${personality.color}06`,
              }}
            >
              {xhsCopied ? '已复制小红书文案 ✓' : '📕 复制小红书文案'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border-subtle text-sm text-[#7A6A5A] font-medium hover:text-[#6A6054] hover:bg-bg-secondary/30 transition-all cursor-pointer"
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <button
                onClick={quickShare}
                className="flex-1 py-3 rounded-xl border border-stone-300/40 text-sm text-stone-500 hover:bg-stone-100/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href="/soulti/test"
                className="flex-1 py-3 rounded-xl border border-border-subtle text-sm text-[#7A6A5A] font-medium hover:text-[#6A6054] hover:bg-bg-secondary/30 transition-all text-center"
              >
                重新探索
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Other types → kept minimal ── */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h3
          className="text-[11px] tracking-[0.3em] text-[#8b7355] font-medium uppercase mb-6"
          style={{ fontFamily: serifFont }}
        >
          更多自然人格
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {SOULTI_PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 12).map(p => (
            <Link
              key={p.slug}
              href={`/soulti/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle/60 hover:border-border p-3 text-center transition-all"
              style={{ background: '#FDFCFA' }}
            >
              <div className="text-lg mb-1">{p.emoji}</div>
              <span
                className="text-[10px] tracking-[0.15em] block mb-0.5"
                style={{ fontFamily: serifFont, color: p.color }}
              >
                {p.code}
              </span>
              <span className="text-xs text-text-primary" style={{ fontFamily: serifFont }}>
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ResultClosureEngine
        currentUniverse="soulti"
        personalitySlug={personality.slug}
        personalityName={personality.name}
        accent={personality.color}
      />
      <DailyCheckInCTA />
    </div>
  );
}
