'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { FLOWER_DIMENSIONS, FLOWER_MODEL_NAMES, FLOWER_MODEL_COLORS } from '@/lib/flower/dimensions';
import { FLOWER_PERSONALITY_TYPES, getFlowerRarity, getFlowerTypeImage, getFlowerTypeThumbnailImage, getFlowerTypeMediumImage } from '@/lib/flower/personalities';
import type { FlowerPersonalityType } from '@/lib/flower/personalities';
import type { FlowerDimensionScore } from '@/lib/flower/scoring';
import { FlowerShareImageGenerator } from '@/components/FlowerShareImageGenerator';
import type { FlowerShareImageGeneratorHandle } from '@/components/FlowerShareImageGenerator';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UniverseProgressBar } from '@/components/UniverseProgressBar';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';

interface Props {
  personality: FlowerPersonalityType;
  dimensionScores: FlowerDimensionScore[];
}

export function FlowerResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<FlowerShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/flower/result/${personality.slug}/`);

  const copyShareText = useCallback(() => {
    const text = `我的花格是 ${personality.flower}（${personality.name}）\n${personality.flowerLang}\n来测测你像哪朵花 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [personality.flower, personality.name, personality.flowerLang, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的花格是 ${personality.flower}（${personality.name}）`,
          text: personality.flowerLang,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  }, [copyLink, personality.flower, personality.name, personality.flowerLang, shareUrl]);

  const others = FLOWER_PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 4);
  const rarity = getFlowerRarity(personality.slug);

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
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-rose-400 transition-all cursor-pointer"
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
              花格鉴定结果
            </div>

            {/* Type image */}
            <div
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] overflow-hidden flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
                boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
              }}
            >
              <NextImage
                src={getFlowerTypeMediumImage(personality.slug)}
                alt={personality.flower}
                width={384}
                height={384}
                className="w-[88%] h-[88%] object-contain drop-shadow-2xl"
                priority
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
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

            {/* Flower Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-2">
              {personality.flower}
            </h1>

            {/* Personality Name */}
            <p className="text-lg text-text-secondary mb-4">{personality.name}</p>

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
                仅 {rarity.populationPct}% 的人是这朵花
              </span>
            </div>

            {/* Flower Language */}
            <p className="text-xl italic max-w-md mx-auto" style={{ color: personality.color }}>
              &ldquo;{personality.flowerLang}&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* Description — sections */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {parsedSections.map((sec) => (
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
            {personality.flower} 的四轴花格画像
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-6">
            {dimensionScores.map(ds => {
              const dim = FLOWER_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = FLOWER_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{FLOWER_MODEL_NAMES[dim.model]}</span>
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

      <CrossTestRecommendations currentTest="flower" personalityName={personality.name} />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="flower" dimensionScores={dimensionScores} />
      </section>

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            发给闺蜜测测她是哪朵花
          </h2>

          <div className="space-y-3">
            <FlowerShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} />

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
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
                className="flex-1 py-3 rounded-xl border border-rose-500/30 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href="/flower/test"
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
          还可以看看其他花格
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/flower/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden" style={{ background: `${p.color}12` }}>
                <NextImage
                  src={getFlowerTypeThumbnailImage(p.slug)}
                  alt={p.flower}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.flower}</span>
              <span className="text-xs text-text-muted block">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ResultClosureEngine
        currentUniverse="flower"
        personalitySlug={personality.slug}
        personalityName={personality.name}
        accent={personality.color}
      />
      <DailyCheckInCTA />
    </div>
  );
}
