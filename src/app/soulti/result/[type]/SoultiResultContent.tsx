'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_NAMES, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import { SOULTI_PERSONALITY_TYPES, getSoultiRarity, getSoultiResonance } from '@/lib/soulti/personalities';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import type { SoultiDimensionScore } from '@/lib/soulti/scoring';
import { SoultiShareImageGenerator } from '@/components/SoultiShareImageGenerator';
import type { SoultiShareImageGeneratorHandle } from '@/components/SoultiShareImageGenerator';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';

interface Props {
  personality: SoultiPersonalityType;
  dimensionScores: SoultiDimensionScore[];
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

export function SoultiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<SoultiShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/soulti/result/${personality.slug}/`);
  const resonance = getSoultiResonance(personality.slug);
  const rarity = getSoultiRarity(personality.slug);

  const mirrorType = resonance ? SOULTI_PERSONALITY_TYPES.find(p => p.slug === resonance.mirrorSlug) : undefined;
  const oppositeType = resonance ? SOULTI_PERSONALITY_TYPES.find(p => p.slug === resonance.oppositeSlug) : undefined;

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
        <span className="text-xs tracking-[0.15em] text-text-muted" style={{ fontFamily: serifFont }}>
          SoulTI
        </span>
        <span className="text-xs tracking-wider text-text-muted font-mono">
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
              className="absolute -top-2 right-0 p-2 rounded-lg text-text-muted/40 hover:text-text-muted transition-colors cursor-pointer"
              title="生成分享图片"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <p className="text-xs tracking-[0.2em] text-text-muted mb-8">
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
            className="text-xs text-text-muted/60 mb-6 tracking-wider"
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
            <span className="text-[10px] text-text-muted/50 tracking-wider">
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
            className="text-lg sm:text-xl leading-[2] text-text-primary/80 whitespace-pre-line"
            style={{ fontFamily: serifFont, fontStyle: 'italic' }}
          >
            &ldquo;{resonance.quote}&rdquo;
          </blockquote>
          <p
            className="mt-4 text-xs text-text-muted/60 tracking-wider"
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

      {/* ── PERSONA section ── */}
      <motion.section
        className="max-w-2xl mx-auto px-6 pt-12 pb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h3
          className="text-[11px] tracking-[0.3em] text-text-muted/50 uppercase mb-8"
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
                className="text-[15px] leading-[2] text-text-secondary whitespace-pre-line"
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
            style={{ background: '#1C1B19' }}
          >
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-8"
              style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.3)' }}
            >
              SOUL RESONANCE · 灵魂共振
            </p>

            <h4
              className="text-2xl sm:text-3xl tracking-wider mb-1"
              style={{
                fontFamily: serifFont,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {resonance.soulOrigin.name}
            </h4>

            <p
              className="text-base tracking-[0.2em] mb-1"
              style={{
                fontFamily: serifFont,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {resonance.soulOrigin.zhName}
            </p>

            <p
              className="text-xs tracking-wider mb-6"
              style={{
                fontFamily: serifFont,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              {resonance.soulOrigin.era}
            </p>

            <p
              className="text-sm leading-[1.9]"
              style={{ color: 'rgba(255,255,255,0.55)' }}
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
                <p className="text-[10px] tracking-[0.25em] text-text-muted/40 uppercase mb-4" style={{ fontFamily: serifFont }}>
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
                <p className="text-[10px] tracking-[0.25em] text-text-muted/40 uppercase mb-4" style={{ fontFamily: serifFont }}>
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
          className="text-[11px] tracking-[0.3em] text-text-muted/50 uppercase mb-6"
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
                  <div className="flex items-center gap-2 text-xs text-text-muted">
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
                <p className="text-xs text-text-muted mt-1.5">{dim.levels[ds.level]}</p>
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
          className="text-sm leading-[2] text-text-muted/60"
          style={{ fontFamily: serifFont, fontStyle: 'italic' }}
        >
          探索不是为了改变你，<br />
          而是让你看见——你已经是了。
        </p>
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
            className="text-[11px] tracking-[0.3em] text-text-muted/50 uppercase mb-6 text-center"
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

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border-subtle text-sm text-text-muted hover:text-text-secondary hover:bg-bg-secondary/30 transition-all cursor-pointer"
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
                className="flex-1 py-3 rounded-xl border border-border-subtle text-sm text-text-muted hover:text-text-secondary hover:bg-bg-secondary/30 transition-all text-center"
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
          className="text-[11px] tracking-[0.3em] text-text-muted/50 uppercase mb-6"
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
