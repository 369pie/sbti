'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { XPTI_DIMENSIONS, XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiRarity, getXptiTypeThumbnailImage, getXptiTypeMediumImage } from '@/lib/xpti/personalities';
import type { XptiPersonalityType } from '@/lib/xpti/personalities';
import type { XptiDimensionScore } from '@/lib/xpti/scoring';
import type { XptiShareImageGeneratorHandle } from '@/components/XptiShareImageGenerator';
const XptiShareImageGenerator = dynamic(
  () => import('@/components/XptiShareImageGenerator').then((m) => m.XptiShareImageGenerator),
  { ssr: false },
);
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UniverseProgressBar } from '@/components/UniverseProgressBar';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';

interface Props {
  personality: XptiPersonalityType;
  dimensionScores: XptiDimensionScore[];
}

export function XptiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<XptiShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef);

  const shareUrl = getSiteUrl(`/xpti/result/${personality.slug}/`);

  const copyShareText = useCallback(() => {
    const text = `我的 XPTI 结果是 ${personality.code}（${personality.name}）\n${personality.tagline}\n来测测你的 → ${shareUrl}`;
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
          title: `我的 XPTI 结果是 ${personality.code}（${personality.name}）`,
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

  const radarSize = 340;
  const radarCenter = radarSize / 2;
  const radarRadius = 120;
  const radarLevels = [0.25, 0.5, 0.75, 1];

  const radarNodes = XPTI_DIMENSIONS.map((dim, idx) => {
    const score = dimensionScores.find((s) => s.id === dim.id) ?? { id: dim.id, score: 2, level: 'M' as const };
    const angle = (-Math.PI / 2) + (idx * 2 * Math.PI) / XPTI_DIMENSIONS.length;
    const normalized = Math.max(0, Math.min(1, (score.score - 1) / 2));

    const valueX = radarCenter + Math.cos(angle) * radarRadius * normalized;
    const valueY = radarCenter + Math.sin(angle) * radarRadius * normalized;
    const labelX = radarCenter + Math.cos(angle) * (radarRadius + 22);
    const labelY = radarCenter + Math.sin(angle) * (radarRadius + 22);
    const axisX = radarCenter + Math.cos(angle) * radarRadius;
    const axisY = radarCenter + Math.sin(angle) * radarRadius;

    const textAnchor: 'start' | 'middle' | 'end' = labelX > radarCenter + 10
      ? 'start'
      : labelX < radarCenter - 10
        ? 'end'
        : 'middle';

    return {
      dim,
      score,
      valueX,
      valueY,
      labelX,
      labelY,
      axisX,
      axisY,
      textAnchor,
    };
  });

  const radarPolygon = radarNodes.map((n) => `${n.valueX},${n.valueY}`).join(' ');

  return (
    <div className="min-h-screen text-text-primary">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${personality.color}18, transparent 70%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Share button */}
          <button
            onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
            className="absolute top-6 right-6 p-2.5 rounded-full border border-rule-soft bg-bg-elevated hover:bg-paper-deep text-text-muted hover:text-text-primary transition-all cursor-pointer"
            title="生成分享图片"
            aria-label="生成分享图片"
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
              <span className="block h-px w-6" style={{ background: personality.color, opacity: 0.6 }} aria-hidden />
              <span className="text-[10px] tracking-[0.4em] uppercase text-text-muted whitespace-nowrap">
                XPTI · Result
              </span>
              <span className="block h-px w-6" style={{ background: personality.color, opacity: 0.6 }} aria-hidden />
            </div>

            {/* Hero character image */}
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] overflow-hidden flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
                boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
              }}
            >
              <NextImage
                src={getXptiTypeMediumImage(personality.slug)}
                alt={personality.name}
                fill
                sizes="(max-width: 768px) 256px, 384px"
                className="object-contain drop-shadow-2xl w-[88%] h-[88%]"
                priority
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
              />
            </div>

            {/* Number + Code (serial-number editorial) */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-text-muted">
                № {personality.number}
              </span>
              <span className="block w-px h-3 bg-[#A3526E]/40" aria-hidden />
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
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {personality.name}
            </h1>

            {/* Editorial rule */}
            <div className="mx-auto mb-5 h-px w-12" style={{ background: personality.color, opacity: 0.5 }} aria-hidden />

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
                仅 {rarity.populationPct}% 的测试者是此人格
              </span>
            </div>

            {/* Tagline */}
            <p
              className="text-xl text-text-secondary max-w-md mx-auto"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
            >
              {personality.tagline}
            </p>

            {/* Hidden tags */}
            {'hiddenTags' in personality && (personality as { hiddenTags?: string[] }).hiddenTags && (
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {((personality as { hiddenTags?: string[] }).hiddenTags ?? []).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{ color: personality.color, borderColor: `${personality.color}30`, background: `${personality.color}08` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
              className="rounded-2xl border border-rule-soft bg-bg-elevated backdrop-blur-xl shadow-sm p-6 sm:p-8"
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

      {/* Radar */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            {personality.code} 的九维雷达图
          </h2>
          <div className="rounded-2xl border border-rule-soft bg-bg-elevated backdrop-blur-xl shadow-sm p-6 sm:p-8">
            <div className="flex justify-center">
              <svg
                viewBox={`0 0 ${radarSize} ${radarSize}`}
                className="w-full max-w-[360px] h-auto"
                role="img"
                aria-label="九维情欲雷达图"
              >
                {radarLevels.map((level) => {
                  const points = radarNodes
                    .map((n) => {
                      const x = radarCenter + (n.axisX - radarCenter) * level;
                      const y = radarCenter + (n.axisY - radarCenter) * level;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <polygon
                      key={level}
                      points={points}
                      fill="none"
                      stroke="rgba(31, 26, 22, 0.14)"
                      strokeWidth="1"
                    />
                  );
                })}

                {radarNodes.map((n) => (
                  <line
                    key={n.dim.id}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={n.axisX}
                    y2={n.axisY}
                    stroke="rgba(31, 26, 22, 0.10)"
                    strokeWidth="1"
                  />
                ))}

                <motion.polygon
                  points={radarPolygon}
                  fill={`${personality.color}28`}
                  stroke={personality.color}
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.85, transformOrigin: 'center' }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                />

                {radarNodes.map((n) => (
                  <circle
                    key={`dot-${n.dim.id}`}
                    cx={n.valueX}
                    cy={n.valueY}
                    r="3.5"
                    fill={personality.color}
                    stroke="var(--color-paper)"
                    strokeWidth="1.5"
                  />
                ))}

                {radarNodes.map((n) => (
                  <g key={`label-${n.dim.id}`}>
                    <text
                      x={n.labelX}
                      y={n.labelY - 6}
                      fill="var(--color-ink)"
                      fontSize="11"
                      letterSpacing="0.3"
                      textAnchor={n.textAnchor}
                    >
                      {n.dim.id}
                    </text>
                    <text
                      x={n.labelX}
                      y={n.labelY + 9}
                      fill="var(--color-ink-mute)"
                      fontSize="10"
                      textAnchor={n.textAnchor}
                    >
                      {XPTI_MODEL_NAMES[n.dim.model]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {radarNodes.map((n) => {
                const color = XPTI_MODEL_COLORS[n.dim.model];
                return (
                  <div key={`legend-${n.dim.id}`} className="rounded-lg border border-rule-soft bg-bg-elevated px-3 py-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono" style={{ color: color.base }}>{n.dim.id}</span>
                      <span className="text-text-muted">{n.dim.poleLowLabel} · {n.dim.poleHighLabel}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{n.dim.levels[n.score.level]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <CrossTestRecommendations currentTest="xpti" personalityName={personality.name} variant="xpti" />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="xpti" variant="light" />
      </section>

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
            {shareMounted ? <XptiShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} presetId="xpti-editorial" /> : null}

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-rule-soft bg-bg-elevated text-sm text-text-secondary hover:bg-bg-elevated transition-all cursor-pointer"
            >
              {textCopied ? '已复制分享文案 ✓' : '📋 复制分享文案'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-rule-soft text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-all cursor-pointer"
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <button
                onClick={quickShare}
                className="flex-1 py-3 rounded-xl border border-rule-soft text-sm text-text-secondary hover:bg-bg-elevated transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href="/xpti/test"
                className="flex-1 py-3 rounded-xl border border-rule-soft text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 transition-all text-center"
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
          还可以看看其他关系原型
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/xpti/result/${p.slug}`}
              className="group rounded-xl border border-rule-soft hover:border-rule bg-bg-elevated/60 hover:bg-bg-elevated transition-all p-4 text-center"
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

      <ResultClosureEngine
        currentUniverse="xpti"
        personalitySlug={personality.slug}
        personalityName={personality.name}
        accent={personality.color}
        variant="xpti"
      />
      <DailyCheckInCTA variant="xpti" />
    </div>
  );
}
