'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_NAMES, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import { SOULTI_PERSONALITY_TYPES, getSoultiRarity, getSoultiResonance, getSoultiPersonalityBySlug } from '@/lib/soulti/personalities';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import type { SoultiDimensionScore } from '@/lib/soulti/scoring';
import type { SoultiLayeredResult } from '@/lib/soulti/scoring';
import { SoultiShareImageGenerator } from '@/components/SoultiShareImageGenerator';
import type { SoultiShareImageGeneratorHandle } from '@/components/SoultiShareImageGenerator';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';
import { getCurrentWeeklyPrompt } from '@/lib/soulti/deep-report';

interface Props {
  personality: SoultiPersonalityType;
  dimensionScores: SoultiDimensionScore[];
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

export function SoultiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<SoultiShareImageGeneratorHandle>(null);
  const [layered, setLayered] = useState<SoultiLayeredResult | null>(null);

  // Load layered (three-mirror) data from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem('soulti-layered');
      if (!raw) return;
      const data = JSON.parse(raw) as SoultiLayeredResult;
      // Only use if the overall result matches the current personality
      if (data.overall?.slug === personality.slug) {
        setLayered(data);
      }
    } catch { /* ignore */ }
  }, [personality.slug]);

  const shareUrl = getSiteUrl(`/soulti/result/${personality.slug}/`);
  const resonance = getSoultiResonance(personality.slug);
  const rarity = getSoultiRarity(personality.slug);

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

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>

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
              onClick={() => shareRef.current?.generate()}
              className="absolute -top-2 right-0 p-2 rounded-lg text-[#7A6A5A] font-medium/40 hover:text-[#7A6A5A] font-medium transition-colors cursor-pointer"
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

      {/* ── THREE MIRRORS — 三面镜子 ── */}
      {layered && (layered.daySelf.slug !== layered.nightSelf.slug || layered.daySelf.slug !== layered.dreamTendency.slug) && (() => {
        const dayP = getSoultiPersonalityBySlug(layered.daySelf.slug);
        const nightP = getSoultiPersonalityBySlug(layered.nightSelf.slug);
        const dreamP = getSoultiPersonalityBySlug(layered.dreamTendency.slug);
        if (!dayP || !nightP || !dreamP) return null;

        const mirrors = [
          { label: '白天的你', sub: 'Day Self', p: dayP, emoji: '☀️' },
          { label: '深夜的你', sub: 'Night Self', p: nightP, emoji: '🌙' },
          { label: '梦里的你', sub: 'Dream Self', p: dreamP, emoji: '💭' },
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

            <div className="grid grid-cols-3 gap-3">
              {mirrors.map(({ label, sub, p, emoji }) => {
                const isSameAsOverall = p.slug === personality.slug;
                return (
                  <div
                    key={sub}
                    className="rounded-2xl border p-4 sm:p-5 text-center transition-all"
                    style={{
                      borderColor: `${p.color}20`,
                      background: isSameAsOverall ? `${p.color}08` : '#FDFCFA',
                    }}
                  >
                    <p className="text-[10px] tracking-[0.2em] text-[#8b7355] font-medium uppercase mb-3" style={{ fontFamily: serifFont }}>
                      {sub}
                    </p>
                    <div className="text-2xl mb-2">{emoji}</div>
                    <p
                      className="text-sm tracking-[0.15em] mb-1"
                      style={{ fontFamily: serifFont, color: p.color }}
                    >
                      {p.name}
                    </p>
                    <p className="text-[10px] text-[#6A6054] font-semibold tracking-wider font-mono mb-2">
                      {p.code}
                    </p>
                    <p
                      className="text-[11px] leading-relaxed text-text-primary line-clamp-2 text-[12px] font-medium"
                      style={{ fontFamily: serifFont }}
                    >
                      {p.tagline}
                    </p>
                    <p className="text-[10px] text-[#6A6054] font-medium mt-2" style={{ fontFamily: serifFont }}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Tension hint — if day and night differ */}
            {layered.daySelf.slug !== layered.nightSelf.slug && (
              <p
                className="text-center text-xs text-text-primary opacity-90 mt-6 leading-relaxed"
                style={{ fontFamily: serifFont, fontStyle: 'italic' }}
              >
                白天你是{dayP.name}，深夜你变成{nightP.name}。<br />
                这不是矛盾——是你的不同面在轮流照顾你。
              </p>
            )}
          </motion.section>
        );
      })()}

      {/* ── Deep Mirror Report Teaser (demand tracking) ── */}
      {layered && (layered.daySelf.slug !== layered.nightSelf.slug || layered.daySelf.slug !== layered.dreamTendency.slug) && (() => {
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
            {mirrorType && (
              <Link
                href={`/soulti/result/${mirrorType.slug}`}
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
              </Link>
            )}
            {oppositeType && (
              <Link
                href={`/soulti/result/${oppositeType.slug}`}
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
              </Link>
            )}
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

      <CrossTestRecommendations currentTest="soulti" personalityName={personality.name} />

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
            <SoultiShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} />

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

      <DailyCheckInCTA />
      <UniversePreviewCards currentUniverse="soulti" />
      <IdentifyViralCTA personalityName={personality.name} />
      <WtfCardCTA />
      <UgcShareCTA />
    </div>
  );
}
