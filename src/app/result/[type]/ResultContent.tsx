'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { DimensionRadar, DimensionBars } from '@/components/DimensionChart';
import { ShareImageGenerator } from '@/components/ShareImageGenerator';
import type { ShareImageGeneratorHandle } from '@/components/ShareImageGenerator';
import { PERSONALITY_TYPES, getTypeImage, getRarity } from '@/lib/personalities';
import { DIMENSIONS, MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import type { PersonalityType } from '@/lib/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import type { PersonalityGuide } from '@/lib/result-guide';

interface Props {
  personality: PersonalityType;
  dimensionScores: DimensionScore[];
  guide: PersonalityGuide;
}

export function ResultContent({ personality, dimensionScores, guide }: Props) {
  const [copied, setCopied] = useState(false);
  const [cpCopied, setCpCopied] = useState(false);
  const shareRef = useRef<ShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/result/${personality.slug}/`);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的 SBTI 人格是 ${personality.code}（${personality.name}）`,
          text: personality.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    copyLink();
  }, [copyLink, personality.code, personality.name, personality.tagline, shareUrl]);

  const copyCPLink = useCallback(() => {
    const url = getSiteUrl(`/cp/${personality.slug}/`);
    navigator.clipboard.writeText(url);
    setCpCopied(true);
    setTimeout(() => setCpCopied(false), 2000);
  }, [personality.slug]);

  const similarSlugs = new Set(guide.similarTypes.map((item) => item.personality.slug));
  const others = PERSONALITY_TYPES.filter(p => p.slug !== personality.slug && !similarSlugs.has(p.slug)).slice(0, 3);
  const rarity = getRarity(personality.slug);

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
            <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 rounded-2xl overflow-hidden" style={{ background: `${personality.color}15` }}>
              <NextImage
                src={getTypeImage(personality.slug)}
                alt={personality.name}
                width={192}
                height={192}
                className="w-full h-full object-contain p-2"
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

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            人格类型解释
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.explanation.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-5"
              >
                <h3 className="text-base font-medium text-text-primary mb-3">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-7">{item.body}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-5">
            适合人群
          </h2>
          <ul className="space-y-3 text-text-secondary text-sm sm:text-base leading-7">
            {guide.suitableFor.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ background: personality.color }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.5 }}
        >
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-2">
                相近人格对比
              </h2>
              <p className="text-sm text-text-secondary leading-6">
                如果你觉得这个结果和别的人格只差一点点，先看这两个最接近的类型。
              </p>
            </div>
            <Link href="/guide/how-to-read-sbti-results" className="text-sm text-text-muted hover:text-accent transition-colors">
              看结果说明 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.similarTypes.map((item) => (
              <Link
                key={item.personality.slug}
                href={`/result/${item.personality.slug}`}
                className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-5 hover:bg-bg-secondary/60 hover:border-border transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden" style={{ background: `${item.personality.color}15` }}>
                    <NextImage
                      src={getTypeImage(item.personality.slug)}
                      alt={item.personality.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: item.personality.color }}>
                      {item.personality.code}
                    </span>
                    <h3 className="text-base font-medium text-text-primary">{item.personality.name}</h3>
                    <p className="text-xs text-text-muted mt-1">{item.personality.tagline}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-mono tracking-wider text-text-muted uppercase mb-2">相似点</p>
                  <div className="flex flex-wrap gap-2">
                    {item.sharedTraits.map((trait) => (
                      <span key={trait} className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-mono tracking-wider text-text-muted uppercase mb-2">关键差异</p>
                  <ul className="space-y-2 text-sm text-text-secondary leading-6">
                    {item.differenceSummary.map((summary) => (
                      <li key={summary} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-muted flex-shrink-0" />
                        <span>{summary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.5 }}
        >
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">📚</div>
            <h2 className="text-lg font-semibold mb-2">继续看测试说明与结果解读</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-5 leading-7">
              如果你已经拿到了结果，但还想看懂十五维、稀有度、相近人格和 SBTI / MBTI 的差别，可以继续读说明栏目。
            </p>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all"
            >
              进入说明栏目
            </Link>
          </div>
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
                color: '#110f1c',
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
              <button
                onClick={quickShare}
                className="flex-1 py-3 rounded-xl border border-accent/30 text-sm text-accent hover:bg-accent/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
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
          {others.map(p => {
            const r = getRarity(p.slug);
            return (
            <Link
              key={p.slug}
              href={`/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden mb-2" style={{ background: `${p.color}15` }}>
                <NextImage
                  src={getTypeImage(p.slug)}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
              <span
                className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ color: r.color, background: r.bgColor }}
              >
                {r.label}
              </span>
            </Link>
            );
          })}
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
