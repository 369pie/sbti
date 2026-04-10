'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WorkPersonalityAvatar } from '@/components/WorkPersonalityAvatar';
import { WorkShareImageGenerator } from '@/components/WorkShareImageGenerator';
import type { WorkShareImageGeneratorHandle } from '@/components/WorkShareImageGenerator';
import { WORK_DIMENSIONS, WORK_MODEL_NAMES, WORK_MODEL_COLORS } from '@/lib/work/dimensions';
import { WORK_PERSONALITY_TYPES, getWorkRarity } from '@/lib/work/personalities';
import type { WorkPersonalityType } from '@/lib/work/personalities';
import type { WorkDimensionScore } from '@/lib/work/scoring';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';

interface Props {
  personality: WorkPersonalityType;
  dimensionScores: WorkDimensionScore[];
}

export function WorkResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<WorkShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/work/result/${personality.slug}/`);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的打工人格是 ${personality.code}（${personality.name}）`,
          text: personality.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    copyLink();
  }, [copyLink, personality.code, personality.name, personality.tagline, shareUrl]);

  const others = WORK_PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 3);
  const rarity = getWorkRarity(personality.slug);

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
          {/* Top-right share button */}
          <button
            onClick={() => shareRef.current?.generate()}
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-indigo-400 transition-all cursor-pointer"
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
              打工人格测试结果
            </div>

            <WorkPersonalityAvatar
              personality={personality}
              alt={`${personality.name}形象`}
              priority
              sizes="192px"
              className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 rounded-2xl overflow-hidden"
              style={{ background: `${personality.color}15` }}
              imageClassName="object-contain p-2"
              fallbackClassName="w-full h-full flex items-center justify-center text-7xl"
            />

            {/* Code */}
            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: personality.color }}
            >
              {personality.code}
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {personality.name}
            </h1>

            {/* Rarity + population badge */}
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
                仅 {rarity.populationPct}% 的测试者是此人格
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              {personality.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            打工速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {personality.description}
          </p>
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
            {personality.code} 的五维画像
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-5">
            {dimensionScores.map(ds => {
              const dim = WORK_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = WORK_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{WORK_MODEL_NAMES[dim.model]}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">{ds.level}</span>
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

      {/* Cross-promotion: try SBTI */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">也来测测你的抽象人格</h3>
            <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
              SBTI 人格测试 — 5 组切面 · 15 个维度 · 27 种结果
            </p>
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:brightness-110 transition-all"
            >
              去测 SBTI
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            分享给同事
          </h2>

          <div className="space-y-3">
            <WorkShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} />

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <button
                onClick={quickShare}
                className="flex-1 py-3 rounded-xl border border-indigo-500/30 text-sm text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href="/work/test"
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
          还可以看看其他打工人格
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/work/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
            >
              <WorkPersonalityAvatar
                personality={p}
                alt=""
                sizes="40px"
                className="relative w-10 h-10 rounded-lg overflow-hidden mb-2"
                style={{ background: `${p.color}15` }}
                imageClassName="object-contain p-1"
                fallbackClassName="w-full h-full flex items-center justify-center text-xl"
              />
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
