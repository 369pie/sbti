'use client';

import dynamic from 'next/dynamic';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
const CptiShareImageGenerator = dynamic(
  () => import('@/components/CptiShareImageGenerator').then((m) => m.CptiShareImageGenerator),
  { ssr: false },
);
import type { CptiShareImageGeneratorHandle } from '@/components/CptiShareImageGenerator';
import { CPTI_DIMENSIONS, CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import {
  CPTI_PERSONALITY_TYPES,
  getCptiRarity,
  getCptiTypeImage,
  getCptiTypeThumbnailImage,
  getCptiTypeMediumImage,
} from '@/lib/cpti/personalities';
import type { CptiPersonalityType } from '@/lib/cpti/personalities';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { trackCptiEvent } from '@/lib/cpti/analytics';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { HermosaInputCard } from '@/components/hermosa/HermosaInputCard';
import { ClaimAssetCard } from '@/components/ClaimAssetCard';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';
import { CptiPairEntryPanel } from '@/components/cpti/CptiPairEntryPanel';
import { CptiCompatibilityPredictor } from '@/components/cpti/CptiCompatibilityPredictor';

interface Props {
  personality: CptiPersonalityType;
  dimensionScores: CptiDimensionScore[];
}

export function CptiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [heroImageMode, setHeroImageMode] = useState<'thumb' | 'medium' | 'full' | 'emoji'>('medium');
  const [otherImageModes, setOtherImageModes] = useState<Record<string, 'thumb' | 'full' | 'emoji'>>({});
  const shareRef = useRef<CptiShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef, CptiShareImageGenerator);

  const shareUrl = getSiteUrl(`/cpti/result/${personality.slug}/`);
  const heroImageSrc = heroImageMode === 'full'
    ? getCptiTypeImage(personality.slug)
    : heroImageMode === 'thumb'
      ? getCptiTypeThumbnailImage(personality.slug)
      : getCptiTypeMediumImage(personality.slug);

  const copyShareText = useCallback(() => {
    const text = `我在关系里的CP角色是 ${personality.code}（${personality.name}）\n${personality.tagline}\n来测测你的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [personality.code, personality.name, personality.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackCptiEvent('cpti_pair_code_copied', { personality: personality.slug, method: 'link' });
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, personality.slug]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的CP角色是 ${personality.code}（${personality.name}）`,
          text: personality.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    copyLink();
  }, [copyLink, personality.code, personality.name, personality.tagline, shareUrl]);

  const others = CPTI_PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 3);
  const rarity = getCptiRarity(personality.slug);

  const handleHeroImageError = useCallback(() => {
    setHeroImageMode((current) => {
      if (current === 'medium') return 'full';
      if (current === 'full') return 'emoji';
      if (current === 'emoji') return 'medium';
      return current;
    });
  }, []);

  const getOtherTypeImageSrc = (slug: string) => {
    const mode = otherImageModes[slug] ?? 'thumb';
    return mode === 'full' ? getCptiTypeImage(slug) : getCptiTypeThumbnailImage(slug);
  };

  const handleOtherTypeImageError = useCallback((slug: string) => {
    setOtherImageModes((current) => {
      const mode = current[slug] ?? 'thumb';
      if (mode === 'emoji') return current;
      return {
        ...current,
        [slug]: mode === 'thumb' ? 'full' : 'emoji',
      };
    });
  }, []);

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
            onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
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
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6 max-w-[70%] sm:max-w-none">
              <span className="block h-px w-6" style={{ background: personality.color, opacity: 0.5 }} aria-hidden />
              <span className="text-[10px] tracking-[0.4em] uppercase text-text-muted whitespace-nowrap">
                CPTI · Result
              </span>
              <span className="block h-px w-6" style={{ background: personality.color, opacity: 0.5 }} aria-hidden />
            </div>

            {/* Hero image */}
            {heroImageMode === 'emoji' ? (
              <div
                className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] flex items-center justify-center text-9xl"
                style={{
                  background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
                  boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
                }}
              >
                {personality.emoji}
              </div>
            ) : (
              <div
                className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
                  boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
                }}
              >
                <NextImage
                  src={heroImageSrc}
                  alt={personality.name}
                  fill
                  sizes="(max-width: 768px) 256px, 384px"
                  className="object-contain drop-shadow-2xl w-[88%] h-[88%]"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
                  onError={handleHeroImageError}
                />
              </div>
            )}

            {/* Code (editorial serial) */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span
                className="font-mono text-xs tracking-[0.42em] uppercase"
                style={{ color: personality.color }}
              >
                {personality.code}
              </span>
            </div>

            {/* Name (editorial display serif) */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4 leading-[1.05]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--color-ink)' }}
            >
              {personality.name}
            </h1>

            {/* Editorial rule */}
            <div className="mx-auto mb-5 h-px w-12" style={{ background: personality.color, opacity: 0.5 }} aria-hidden />

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
                仅 {rarity.populationPct}% 的测试者是此角色
              </span>
            </div>

            {/* Tagline (editorial italic) */}
            <p
              className="text-xl text-text-secondary max-w-md mx-auto"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
            >
              {personality.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            角色速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {personality.description}
          </p>
        </motion.div>
      </section>

      {/* ★ Pair entry panel — promoted to second screen (Sprint 1, 2026-04-19) */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <CptiPairEntryPanel personality={personality} />
        </motion.div>
      </section>

      {/* ★ Compatibility prediction widget (Sprint 2 polish, 2026-04-19) */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
        >
          <CptiCompatibilityPredictor
            personality={personality}
            dimensionScores={dimensionScores}
          />
        </motion.div>
      </section>

      {/* Gallery entry card — promoted from leaderboard footer */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <Link
          href="/cpti/gallery/"
          className="group block rounded-2xl border border-border-subtle bg-bg-elevated hover:border-rose-500/40 transition-all p-6 sm:p-7"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📖</div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold text-text-primary mb-1">
                我的关系图鉴
              </div>
              <div className="text-xs sm:text-sm text-text-muted">
                25 格可收集 · 看看你已点亮哪几格 · 还缺哪些
              </div>
            </div>
            <span className="text-rose-500 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
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
              const dim = CPTI_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = CPTI_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{CPTI_MODEL_NAMES[dim.model]}</span>
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

      <HermosaInputCard
        universe="cpti"
        slug={personality.slug}
        code={personality.code}
        personalityName={personality.name}
      />

      <CrossTestRecommendations currentTest="cpti" personalityName={personality.name} />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="cpti" />
      </section>

      {/* Claim Asset Card */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <ClaimAssetCard
            variant="result"
            payload={{
              personalitySlug: personality.slug,
              dimensionScores,
              source: 'self_test',
            }}
            onClaim={() => {
              trackCptiEvent('cpti_profile_saved', {
                personality: personality.slug,
                claimedVia: 'result_page',
              });
            }}
            onIdleSecondaryAction={quickShare}
          />
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
            发给身边的人看看你是什么角色
          </h2>

          <div className="space-y-3">
            {shareMounted ? <CptiShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} /> : null}

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
                href="/cpti/test"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
              >
                重新测试
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stealth (偊测) — demoted to tertiary entry (Sprint 1) */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link
            href="/cpti/stealth"
            className="block rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6 text-center hover:bg-purple-500/10 transition-all group"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🔮</span>
              <div className="text-left">
                <div className="text-base font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                  偊偊测一下
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  不用发链接，根据你对 ta 的了解来测你们的默契
                </div>
              </div>
              <svg className="w-5 h-5 text-text-muted group-hover:text-purple-400 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Leaderboard link */}
      <div className="max-w-2xl mx-auto px-6 pb-10 text-center">
        <Link
          href="/cpti/leaderboard"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors"
        >
          🏆 查看关系图鉴排行榜 →
        </Link>
      </div>

      {/* Other types */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
          还可以看看其他CP角色
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/cpti/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
            >
              {(otherImageModes[p.slug] ?? 'thumb') === 'emoji' ? (
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl mb-3"
                  style={{ background: `${p.color}15` }}
                >
                  {p.emoji}
                </div>
              ) : (
                <div
                  className="relative w-24 h-24 rounded-lg overflow-hidden mb-3"
                  style={{ background: `${p.color}10` }}
                >
                  <NextImage
                    src={getOtherTypeImageSrc(p.slug)}
                    alt={p.name}
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                    onError={() => handleOtherTypeImageError(p.slug)}
                  />
                </div>
              )}
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <UniversePreviewCards currentUniverse="cpti" />
    </div>
  );
}

