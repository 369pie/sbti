'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { XPTI_DIMENSIONS, XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiRarity, getXptiTypeThumbnailImage } from '@/lib/xpti/personalities';
import type { XptiPersonalityType } from '@/lib/xpti/personalities';
import type { XptiDimensionScore } from '@/lib/xpti/scoring';
import { XptiShareImageGenerator } from '@/components/XptiShareImageGenerator';
import type { XptiShareImageGeneratorHandle } from '@/components/XptiShareImageGenerator';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfCardCTA } from '@/components/WtfCardCTA';

interface Props {
  personality: XptiPersonalityType;
  dimensionScores: XptiDimensionScore[];
}

export function XptiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<XptiShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/xpti/result/${personality.slug}/`);

  const copyShareText = useCallback(() => {
    const text = `我的恋爱XP体质是 ${personality.code}（${personality.name}）\n${personality.tagline}\n来测测你的 → ${shareUrl}`;
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
          title: `我的恋爱XP体质是 ${personality.code}（${personality.name}）`,
          text: personality.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  }, [copyLink, personality.code, personality.name, personality.tagline, shareUrl]);

  const others = XPTI_PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 4);
  const rarity = getXptiRarity(personality.slug);

  // Parse description sections
  const descSections = personality.description.split(/【(.*?)】/).filter(Boolean);
  const parsedSections: { title: string; content: string }[] = [];
  for (let i = 0; i < descSections.length; i += 2) {
    if (i + 1 < descSections.length) {
      parsedSections.push({ title: descSections[i], content: descSections[i + 1].trim() });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${personality.color}12, transparent 70%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Share button */}
          <button
            onClick={() => shareRef.current?.generate()}
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-purple-400 transition-all cursor-pointer"
            title="生成分享图片"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-6">
              恋爱XP体质鉴定结果
            </div>

            {/* Hero character image */}
            <div
              className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-6 rounded-3xl overflow-hidden"
              style={{ background: `${personality.color}15` }}
            >
              <NextImage
                src={getXptiTypeThumbnailImage(personality.slug)}
                alt={personality.name}
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-contain p-2"
                priority
              />
            </div>

            {/* Number + Code */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-xs font-mono text-text-muted tracking-wider">{personality.number}</span>
              <span
                className="text-sm font-mono tracking-[0.3em] uppercase"
                style={{ color: personality.color }}
              >
                {personality.code}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {personality.name}
            </h1>

            {/* Rarity */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ color: rarity.color, background: rarity.bgColor, borderColor: `${rarity.color}30` }}
              >
                {rarity.tier === 'legendary' && '✦ '}
                {rarity.tier === 'epic' && '◆ '}
                {rarity.label}
              </span>
              <span className="text-xs text-text-muted">
                仅 {rarity.populationPct}% 的测试者是此体质
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              {personality.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Description — 4 sections */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {parsedSections.map((sec, i) => (
            <div
              key={sec.title}
              className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
            >
              <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
                {sec.title}
              </h2>
              <div className="text-text-secondary leading-[1.8] text-base whitespace-pre-line">
                {sec.content}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Dimension Bars */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            {personality.code} 的四轴画像
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-6">
            {dimensionScores.map(ds => {
              const dim = XPTI_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = XPTI_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{XPTI_MODEL_NAMES[dim.model]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{dim.poleALabel}</span>
                      <span className="font-mono">{ds.level}</span>
                      <span>{dim.poleBLabel}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color.base}, ${color.light})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">{dim.levels[ds.level]}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <CrossTestRecommendations currentTest="xpti" personalityName={personality.name} />

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            发给闺蜜/恋人测测
          </h2>

          <div className="space-y-3">
            <XptiShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} />

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-purple-500/20 bg-purple-500/5 text-sm text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
            >
              {textCopied ? '已复制分享文案 ✓' : '📋 复制分享文案'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <button
                onClick={quickShare}
                className="flex-1 py-3 rounded-xl border border-purple-500/30 text-sm text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href="/xpti/test"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
              >
                重新测试
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Other types */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
          还可以看看其他XP体质
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/xpti/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4 text-center"
            >
              <div className="text-2xl mb-2">{p.emoji}</div>
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <WtfCardCTA />
    </div>
  );
}
