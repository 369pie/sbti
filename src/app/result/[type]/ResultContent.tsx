'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import type { ShareImageGeneratorHandle } from '@/components/ShareImageGenerator';
import { PERSONALITY_TYPES, getTypeImage, getTypeThumbnailImage, getTypeMediumImage, getXiuxianTypeImage, getXiuxianTypeThumbnailImage, getXiuxianTypeMediumImage, getRarity } from '@/lib/personalities';
import type { PersonalityType } from '@/lib/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { getXiuxianSkin } from '@/lib/xiuxian';
import { getXiuxianLaunchOnlyTypes } from '@/lib/xiuxian-v2';
import { UniverseResultBar } from '@/components/UniverseResultBar';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UniverseProgressBar } from '@/components/UniverseProgressBar';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { UniverseSwitcher } from '@/components/UniverseSwitcher';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';
import { loadStoredQuizResult } from '@/lib/quiz-result-session';
import { ResultDiagnosticsPanel } from '@/components/ResultDiagnosticsPanel';
import { FollowMeCard, FollowMeFloating } from '@/components/FollowMeLinks';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';

type DimensionRadarComponentType = typeof import('@/components/DimensionChart')['DimensionRadar'];
type DimensionBarsComponentType = typeof import('@/components/DimensionChart')['DimensionBars'];
type ShareImageGeneratorComponentType = typeof import('@/components/ShareImageGenerator')['ShareImageGenerator'];

const emptySubscribe = () => () => {};
const SKIN_QUERY_CHANGE_EVENT = 'sbti:skin-query-change';

function subscribeToSkinQuery(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('popstate', onStoreChange);
  window.addEventListener(SKIN_QUERY_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('popstate', onStoreChange);
    window.removeEventListener(SKIN_QUERY_CHANGE_EVENT, onStoreChange);
  };
}

function getSkinQuerySnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('skin') === 'xiuxian';
}

function getSkinQueryServerSnapshot(): boolean {
  return false;
}

interface Props {
  personality: PersonalityType;
  dimensionScores: DimensionScore[];
}

export function ResultContent({ personality, dimensionScores }: Props) {
  const isLaunchOnly = Boolean(personality.isLaunchOnly);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const hasXiuxianQuery = useSyncExternalStore(subscribeToSkinQuery, getSkinQuerySnapshot, getSkinQueryServerSnapshot);
  const [copied, setCopied] = useState(false);
  const [cpCopied, setCpCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [heroImageFallback, setHeroImageFallback] = useState(false);
  const [otherImageFallbacks, setOtherImageFallbacks] = useState<Record<string, true>>({});
  const [DimensionRadarComponent, setDimensionRadarComponent] = useState<DimensionRadarComponentType | null>(null);
  const [DimensionBarsComponent, setDimensionBarsComponent] = useState<DimensionBarsComponentType | null>(null);
  const [ShareImageGeneratorComponent, setShareImageGeneratorComponent] = useState<ShareImageGeneratorComponentType | null>(null);
  const [pendingShareGeneration, setPendingShareGeneration] = useState(false);
  const shareRef = useRef<ShareImageGeneratorHandle>(null);
  const chartSectionRef = useRef<HTMLElement | null>(null);
  const shareSectionRef = useRef<HTMLElement | null>(null);
  const chartLoadRef = useRef<Promise<void> | null>(null);
  const shareLoadRef = useRef<Promise<void> | null>(null);

  const toggleSkin = useCallback(() => {
    if (isLaunchOnly) {
      return;
    }

    const next = !hasXiuxianQuery;
    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set('skin', 'xiuxian');
    } else {
      url.searchParams.delete('skin');
    }
    window.history.replaceState({}, '', url.toString());
    window.dispatchEvent(new Event(SKIN_QUERY_CHANGE_EVENT));
  }, [hasXiuxianQuery, isLaunchOnly]);

  const showXiuxian = hasXiuxianQuery || isLaunchOnly;
  const xiuxianSkin = showXiuxian ? getXiuxianSkin(personality.slug) : undefined;
  const displayColor = xiuxianSkin?.color ?? personality.color;
  const displayName = xiuxianSkin?.displayName ?? personality.name;
  const displayTagline = xiuxianSkin?.tagline ?? personality.tagline;
  const displayDesc = xiuxianSkin?.description ?? personality.description;
  const skinQuery = showXiuxian ? '?skin=xiuxian' : '';
  const shareUrl = getSiteUrl(`/result/${personality.slug}${skinQuery}`);
  const xiuxianGalleryCount = PERSONALITY_TYPES.length + getXiuxianLaunchOnlyTypes().length;
  const storageNamespace = mounted && typeof window !== 'undefined' && window.location.pathname.includes('/wtfti/')
    ? 'wtfti'
    : 'sbti';
  const sessionResult = useMemo(() => {
    if (!mounted) {
      return null;
    }

    const stored = loadStoredQuizResult<DimensionScore>(storageNamespace);
    return stored?.slug === personality.slug ? stored : null;
  }, [mounted, personality.slug, storageNamespace]);
  const activeDimensionScores = sessionResult?.dimensionScores ?? dimensionScores;
  const diagnostics = sessionResult?.diagnostics ?? null;

  const loadCharts = useCallback(() => {
    if (DimensionRadarComponent && DimensionBarsComponent) {
      return Promise.resolve();
    }

    if (!chartLoadRef.current) {
      chartLoadRef.current = import('@/components/DimensionChart')
        .then((mod) => {
          setDimensionRadarComponent(() => mod.DimensionRadar);
          setDimensionBarsComponent(() => mod.DimensionBars);
        })
        .catch((error) => {
          chartLoadRef.current = null;
          throw error;
        });
    }

    return chartLoadRef.current;
  }, [DimensionBarsComponent, DimensionRadarComponent]);

  const loadShareGenerator = useCallback(() => {
    if (ShareImageGeneratorComponent) {
      return Promise.resolve();
    }

    if (!shareLoadRef.current) {
      shareLoadRef.current = import('@/components/ShareImageGenerator')
        .then((mod) => {
          setShareImageGeneratorComponent(() => mod.ShareImageGenerator);
        })
        .catch((error) => {
          shareLoadRef.current = null;
          throw error;
        });
    }

    return shareLoadRef.current;
  }, [ShareImageGeneratorComponent]);

  const heroImageSrc = showXiuxian
    ? (heroImageFallback ? getXiuxianTypeImage(personality.slug) : getXiuxianTypeMediumImage(personality.slug))
    : (heroImageFallback ? getTypeImage(personality.slug) : getTypeMediumImage(personality.slug));

  const getOtherTypeImageSrc = (slug: string) => {
    const shouldUseOriginal = Boolean(otherImageFallbacks[slug]);

    if (showXiuxian) {
      return shouldUseOriginal ? getXiuxianTypeImage(slug) : getXiuxianTypeThumbnailImage(slug);
    }

    return shouldUseOriginal ? getTypeImage(slug) : getTypeThumbnailImage(slug);
  };

  const handleOtherTypeImageError = (slug: string) => {
    setOtherImageFallbacks((current) => {
      if (current[slug]) {
        return current;
      }

      return {
        ...current,
        [slug]: true,
      };
    });
  };

  const openShareGenerator = useCallback(() => {
    setPendingShareGeneration(true);
    void loadShareGenerator();
  }, [loadShareGenerator]);

  useEffect(() => {
    if (DimensionRadarComponent && DimensionBarsComponent) {
      return;
    }

    const section = chartSectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      void loadCharts();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadCharts();
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [DimensionBarsComponent, DimensionRadarComponent, loadCharts]);

  useEffect(() => {
    if (ShareImageGeneratorComponent) {
      return;
    }

    const section = shareSectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadShareGenerator();
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [ShareImageGeneratorComponent, loadShareGenerator]);

  useEffect(() => {
    if (!pendingShareGeneration || !ShareImageGeneratorComponent || !shareRef.current) {
      return;
    }

    shareRef.current.generate();
    setPendingShareGeneration(false);
  }, [ShareImageGeneratorComponent, pendingShareGeneration]);

  const copyShareText = useCallback(() => {
    const text = showXiuxian
      ? `我的 SBTI 本命灵兽是 ${personality.code}（${displayName}）\n${displayTagline}\n来照照修仙灵镜 → ${shareUrl}`
      : `我的 SBTI 人格是 ${personality.code}（${personality.name}）\n${personality.tagline}\n来测测你的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [personality.code, personality.name, personality.tagline, displayName, displayTagline, shareUrl, showXiuxian]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: showXiuxian 
            ? `我的 SBTI 本命灵兽是 ${personality.code}（${displayName}）`
            : `我的 SBTI 人格是 ${personality.code}（${displayName}）`,
          text: displayTagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    copyLink();
  }, [copyLink, personality.code, displayName, displayTagline, shareUrl, showXiuxian]);

  const copyCPLink = useCallback(() => {
    const url = getSiteUrl(`/cp/${personality.slug}${skinQuery}`);
    navigator.clipboard.writeText(url);
    setCpCopied(true);
    setTimeout(() => setCpCopied(false), 2000);
  }, [personality.slug, skinQuery]);

  const others = PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 3);
  const rarity = getRarity(personality.slug);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${displayColor}12, transparent 70%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Top-right buttons */}
          <div className="absolute top-16 right-6 flex items-center gap-2">
            <button
              onClick={toggleSkin}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                showXiuxian
                  ? 'border-purple-300/60 bg-purple-50/80 text-purple-600 hover:bg-purple-100/80'
                  : 'border-border-subtle bg-bg-secondary/60 text-text-muted hover:bg-bg-secondary hover:text-text-secondary'
              }`}
              title={showXiuxian ? '切换为标准版' : '切换为修仙版'}
              disabled={isLaunchOnly}
            >
              {showXiuxian ? '📋 标准版' : '🔮 修仙版'}
            </button>
            <button
              onClick={openShareGenerator}
              className="p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-accent transition-all cursor-pointer"
              title="生成分享图片"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-6">
              {showXiuxian 
                ? (personality.isSpecial ? '特殊灵宠' : '标准修仙结果')
                : (personality.isSpecial ? '特殊人格结果' : '标准人格结果')}
            </div>

            {/* Type image */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 rounded-2xl overflow-hidden" style={{ background: `${displayColor}15` }}>
              <NextImage
                src={heroImageSrc}
                alt={displayName}
                width={192}
                height={192}
                className="w-full h-full object-contain p-2"
                priority
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
                onError={() => {
                  if (!heroImageFallback) {
                    setHeroImageFallback(true);
                  }
                }}
              />
            </div>

            {/* Code */}
            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: displayColor }}
            >
              {personality.code}
            </div>

            {/* Name */}
            {xiuxianSkin ? (
              <div className="mb-4">
                <p className="text-[clamp(2rem,5vw,2.5rem)] font-semibold tracking-tight leading-tight text-text-primary/85">
                  {xiuxianSkin.name}
                </p>
                <h1 className="mx-auto mt-2 max-w-[14ch] text-[clamp(2.2rem,7vw,4rem)] font-semibold tracking-tight leading-[1.06] text-balance">
                  {xiuxianSkin.dao}
                </h1>
              </div>
            ) : (
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
                {personality.name}
              </h1>
            )}

            {/* Rarity + population badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ color: rarity.color, background: rarity.bgColor, borderColor: `${rarity.color}30` }}
              >
                {rarity.tier === 'legendary' && '✦ '}
                {rarity.tier === 'epic' && '◆ '}
                {showXiuxian && xiuxianSkin ? xiuxianSkin.realm : rarity.label}
              </span>
              <span className="text-xs text-text-muted">
                {showXiuxian
                  ? `仅 ${rarity.populationPct}% 的修士结成了此等灵体`
                  : `仅 ${rarity.populationPct}% 的测试者是此人格`}
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              {displayTagline}
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
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            {showXiuxian ? '灵物图鉴册' : '人格速写'}
          </h2>

          {showXiuxian && xiuxianSkin && (
            <div className="mb-6 pb-6 border-b border-border-subtle space-y-3">
              <div className="flex text-sm"><span className="w-20 text-text-muted">本体形态：</span><span className="flex-1 text-text-secondary">{xiuxianSkin.creature}</span></div>
              <div className="flex text-sm"><span className="w-20 text-text-muted">看家法术：</span><span className="flex-1 text-text-secondary">{xiuxianSkin.spell}</span></div>
              <div className="flex text-sm"><span className="w-20 text-text-muted">专属法宝：</span><span className="flex-1 text-text-secondary">{xiuxianSkin.artifact}</span></div>
            </div>
          )}

          <p className="text-text-secondary leading-[1.8] text-base whitespace-pre-wrap">
            {displayDesc}
          </p>
        </motion.div>
      </section>

      {diagnostics && (
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <ResultDiagnosticsPanel diagnostics={diagnostics} accent={displayColor} title="这次人格判定说明" />
          </motion.div>
        </section>
      )}

      {/* Radar Chart */}
      <section ref={chartSectionRef} className="max-w-3xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6 text-center">
            {diagnostics ? '本次十五维落点' : '十五维指纹'}
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm">
            {DimensionRadarComponent ? (
              <DimensionRadarComponent dimensions={activeDimensionScores} size={340} />
            ) : (
              <div className="mx-auto h-[340px] w-full max-w-[340px] animate-pulse rounded-full bg-bg-secondary/60" />
            )}
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
            {diagnostics ? `${personality.code} 的本次维度落点` : `${personality.code} 的典型维度落点`}
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm">
            {DimensionBarsComponent ? (
              <DimensionBarsComponent dimensionScores={activeDimensionScores} />
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index}>
                    <div className="mb-2 h-4 w-32 animate-pulse rounded bg-bg-secondary/60" />
                    <div className="h-2 animate-pulse rounded-full bg-bg-secondary/60" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {!isLaunchOnly && (
        <>
          {/* CP invite section */}
          <section className="max-w-2xl mx-auto px-6 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div
                className="rounded-2xl border p-6 sm:p-8 text-center"
                style={{ borderColor: `${displayColor}30`, background: `${displayColor}08` }}
              >
                <div className="text-3xl mb-3">💕</div>
                <h3 className="text-lg font-semibold mb-2">邀请好友测 CP</h3>
                <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
                  把链接发给朋友，TA 测完就能看到你们的配对结果！
                </p>
                <button
                  onClick={copyCPLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: cpCopied ? 'var(--color-sage)' : displayColor, color: 'var(--color-bg-primary)' }}
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

          {/* Combo entry */}
          <section className="max-w-2xl mx-auto px-6 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <Link
                href={`/combo?sbti=${personality.slug}`}
                className="block rounded-2xl border p-6 sm:p-8 text-center transition-all hover:shadow-md"
                style={{ borderColor: 'color-mix(in oklab, var(--color-accent) 19%, transparent)', background: 'color-mix(in oklab, var(--color-accent) 6%, transparent)' }}
              >
                <div className="text-3xl mb-3">🧩</div>
                <h3 className="text-lg font-semibold mb-2">解锁你的人格拼盘</h3>
                <p className="text-sm text-text-secondary mb-4 max-w-sm mx-auto">
                  SBTI × MBTI × 星座，三合一拼出你的专属称号和毒舌分析
                </p>
                <span
                  className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-medium text-bg-primary"
                  style={{ background: 'var(--color-accent)' }}
                >
                  去拼盘 →
                </span>
              </Link>
            </motion.div>
          </section>
        </>
      )}

      <CrossTestRecommendations currentTest="sbti" personalityName={personality.name} />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="sbti" dimensionScores={dimensionScores} />
      </section>

      {/* Universe Switcher — same personality in other universes */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <UniverseSwitcher slug={personality.slug} currentUniverseId="standard" />
      </section>

      {/* Share section */}
      <section ref={shareSectionRef} className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            分享给朋友
          </h2>

          <div className="space-y-3">
            {ShareImageGeneratorComponent ? (
              <ShareImageGeneratorComponent
                ref={shareRef}
                personality={personality}
                dimensionScores={activeDimensionScores}
                isXiuxian={showXiuxian}
              />
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3.5 text-sm text-text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-muted/30 border-t-text-muted" />
                分享工具加载中…
              </div>
            )}

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-accent/20 bg-accent/5 text-sm text-accent hover:bg-accent/10 transition-all cursor-pointer"
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
                className="flex-1 py-3 rounded-xl border border-accent/30 text-sm text-accent hover:bg-accent/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href={showXiuxian ? '/test?skin=xiuxian' : '/test'}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
              >
                重新测试
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Cross-universe exploration */}
      <section className="max-w-3xl mx-auto px-6 pb-8">
        <UniverseResultBar slug={personality.slug} current={showXiuxian ? 'xiuxian' : 'standard'} />
      </section>

      <FollowMeCard />

      {/* Other types */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
          还可以看看其他人格
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map(p => {
            const r = getRarity(p.slug);
            return (
            <Link
              key={p.slug}
              href={`/result/${p.slug}${skinQuery}`}
              className="group rounded-2xl border border-border-subtle hover:border-border bg-bg-elevated hover:shadow-md transition-all p-4"
            >
              <div className="w-28 h-28 rounded-lg overflow-hidden mb-3" style={{ background: `${p.color}15` }}>
                <NextImage
                  src={getOtherTypeImageSrc(p.slug)}
                  alt={p.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-contain p-1"
                  onError={() => handleOtherTypeImageError(p.slug)}
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
          <Link href={`/types${skinQuery}`} className="text-sm text-text-muted hover:text-accent transition-colors">
            查看全部 {showXiuxian ? xiuxianGalleryCount : PERSONALITY_TYPES.length} 种 →
          </Link>
        </div>
      </section>

      <ResultClosureEngine
        currentUniverse={showXiuxian ? 'xiuxian' : 'standard'}
        personalitySlug={personality.slug}
        personalityName={personality.name}
        accent={displayColor}
      />
      <DailyCheckInCTA />
      <FollowMeFloating />
    </div>
  );
}
