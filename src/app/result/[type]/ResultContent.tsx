'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { DimensionRadar, DimensionBars } from '@/components/DimensionChart';
import { ShareImageGenerator } from '@/components/ShareImageGenerator';
import type { ShareImageGeneratorHandle } from '@/components/ShareImageGenerator';
import { PERSONALITY_TYPES, getTypeImage } from '@/lib/personalities';
import { DIMENSIONS, MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { PersonalityType } from '@/lib/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { useCallback, useRef, useState } from 'react';
import { SHARE_SITE_URL } from '@/lib/site';

interface Props {
  personality: PersonalityType;
  dimensionScores: DimensionScore[];
}

export function ResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [cpCopied, setCpCopied] = useState(false);
  const shareRef = useRef<ShareImageGeneratorHandle>(null);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const copyCPLink = useCallback(() => {
    const url = `${SHARE_SITE_URL}cp/${personality.slug}/`;
    navigator.clipboard.writeText(url);
    setCpCopied(true);
    setTimeout(() => setCpCopied(false), 2000);
  }, [personality.slug]);

  const others = PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 3);

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
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-accent transition-all cursor-pointer"
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
              {personality.isSpecial ? '特殊人格结果' : '标准人格结果'}
            </div>

            {/* Type image */}
            <div className="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden" style={{ background: `${personality.color}15` }}>
              <NextImage
                src={getTypeImage(personality.slug)}
                alt={personality.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority
              />
            </div>

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
          className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            人格速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {personality.description}
          </p>
        </motion.div>
      </section>

      {/* Radar Chart */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6 text-center">
            十五维指纹
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 sm:p-8">
            <DimensionRadar dimensions={dimensionScores} size={340} />
          </div>
        </motion.div>
      </section>

      {/* Dimension Bars */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            {personality.code} 的典型维度落点
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 sm:p-8">
            <DimensionBars dimensionScores={dimensionScores} />
          </div>
        </motion.div>
      </section>

      {/* CP invite section */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div
            className="rounded-2xl border p-6 sm:p-8 text-center"
            style={{ borderColor: `${personality.color}30`, background: `${personality.color}08` }}
          >
            <div className="text-3xl mb-3">💕</div>
            <h3 className="text-lg font-semibold mb-2">邀请好友测 CP</h3>
            <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
              把链接发给朋友，TA 测完就能看到你们的配对结果！
            </p>
            <button
              onClick={copyCPLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: cpCopied ? '#22c55e' : personality.color,
                color: '#0c0a09',
              }}
            >
              {cpCopied ? '链接已复制 ✓' : '复制 CP 邀请链接'}
              {!cpCopied && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </button>
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
            分享给朋友
          </h2>

          <div className="space-y-3">
            <ShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} />

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <Link
                href="/test"
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
          还可以看看其他人格
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden mb-2" style={{ background: `${p.color}15` }}>
                <NextImage
                  src={getTypeImage(p.slug)}
                  alt={p.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/types" className="text-sm text-text-muted hover:text-accent transition-colors">
            查看全部 27 种 →
          </Link>
        </div>
      </section>
    </div>
  );
}
