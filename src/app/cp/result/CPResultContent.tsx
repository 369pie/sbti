'use client';

import dynamic from 'next/dynamic';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { getPersonalityBySlug, getTypeImage, getTypeThumbnailImage, getTypeMediumImage } from '@/lib/personalities';
import { MODEL_COLORS } from '@/lib/dimensions';
import { calculateCP, getTierColor, getTierEmoji } from '@/lib/cp-matching';
import type { CPResult, DimensionComparison } from '@/lib/cp-matching';
import { useRef, useState, useCallback } from 'react';
const CPShareImageGenerator = dynamic(
  () => import('@/components/CPShareImageGenerator').then((m) => m.CPShareImageGenerator),
  { ssr: false },
);
import type { CPShareImageGeneratorHandle } from '@/components/CPShareImageGenerator';
import { getSiteUrl } from '@/lib/site';

function CompatibilityRing({ value, size = 160, color }: { value: number; size?: number; color: string }) {
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#EDE8E2" strokeWidth={8}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}

function ModelBar({ name, score, model }: { name: string; score: number; model: string }) {
  const colors = MODEL_COLORS[model as keyof typeof MODEL_COLORS];
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-20 shrink-0">{name}</span>
      <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${colors.base}, ${colors.light})` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums w-8 text-right" style={{ color: colors.base }}>
        {score}
      </span>
    </div>
  );
}

function DimensionRow({ comp, codeA, codeB }: { comp: DimensionComparison; codeA: string; codeB: string }) {
  const colors = MODEL_COLORS[comp.model];
  const levelColor = (l: string) => {
    if (l === 'H') return '#22c55e';
    if (l === 'M') return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b border-border-subtle/50 last:border-0">
      <span
        className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
        style={{ background: colors.bg, color: colors.base }}
      >
        {comp.dimensionId}
      </span>
      <span className="text-xs text-text-secondary flex-1 truncate">{comp.dimensionName}</span>
      <span
        className="text-xs font-mono w-5 text-center font-bold"
        style={{ color: levelColor(comp.levelA) }}
      >
        {comp.levelA}
      </span>
      <span className="text-[10px] text-text-muted">vs</span>
      <span
        className="text-xs font-mono w-5 text-center font-bold"
        style={{ color: levelColor(comp.levelB) }}
      >
        {comp.levelB}
      </span>
      <span
        className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
        style={{
          background: comp.compatibility === 100 ? 'rgba(34,197,94,0.15)' :
                       comp.compatibility >= 65 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
          color: comp.compatibility === 100 ? '#22c55e' :
                  comp.compatibility >= 65 ? '#eab308' : '#ef4444',
        }}
      >
        {comp.label}
      </span>
    </div>
  );
}

export function CPResultContent() {
  const searchParams = useSearchParams();
  const slugA = searchParams.get('a');
  const slugB = searchParams.get('b');
  const shareRef = useRef<CPShareImageGeneratorHandle>(null);
  const [cpLinkCopied, setCpLinkCopied] = useState(false);

  const copyCPResultLink = useCallback(() => {
    if (!slugA || !slugB) return;
    const url = getSiteUrl(`/cp/result/?a=${slugA}&b=${slugB}`);
    navigator.clipboard.writeText(url);
    setCpLinkCopied(true);
    setTimeout(() => setCpLinkCopied(false), 2000);
  }, [slugA, slugB]);

  if (!slugA || !slugB) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">缺少配对参数</p>
          <Link href="/test/" className="text-accent hover:underline">去测试 →</Link>
        </div>
      </div>
    );
  }

  const typeA = getPersonalityBySlug(slugA);
  const typeB = getPersonalityBySlug(slugB);

  if (!typeA || !typeB) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">未找到对应人格类型</p>
          <Link href="/test/" className="text-accent hover:underline">去测试 →</Link>
        </div>
      </div>
    );
  }

  const result = calculateCP(typeA, typeB);
  const tierColor = getTierColor(result.tier);
  const tierEmoji = getTierEmoji(result.tier);

  return (
    <div className="min-h-screen">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${typeA.color}08, transparent 50%), 
                       radial-gradient(ellipse at 70% 30%, ${typeB.color}08, transparent 50%)`,
        }}
      />

      {/* Hero: Two types + score */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8 relative">
        {/* Share button */}
        <button
          onClick={() => shareRef.current?.generate()}
          className="absolute top-12 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-accent transition-all cursor-pointer"
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
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-8">
            <span className="text-accent">💕</span>
            CP 配对结果
          </div>

          {/* Two personality cards side by side */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
            {/* Type A */}
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3"
                style={{ background: `${typeA.color}15` }}
              >
                <NextImage
                  src={getTypeMediumImage(typeA.slug)}
                  alt={typeA.name}
                  width={96} height={96}
                  className="w-full h-full object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
                />
              </div>
              <span className="text-xs font-mono tracking-wider" style={{ color: typeA.color }}>
                {typeA.code}
              </span>
              <span className="text-sm font-medium mt-0.5">{typeA.name}</span>
            </div>

            {/* VS / Score */}
            <div className="flex flex-col items-center">
              <CompatibilityRing value={result.overall} color={tierColor} />
            </div>

            {/* Type B */}
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3"
                style={{ background: `${typeB.color}15` }}
              >
                <NextImage
                  src={getTypeMediumImage(typeB.slug)}
                  alt={typeB.name}
                  width={96} height={96}
                  className="w-full h-full object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
                />
              </div>
              <span className="text-xs font-mono tracking-wider" style={{ color: typeB.color }}>
                {typeB.code}
              </span>
              <span className="text-sm font-medium mt-0.5">{typeB.name}</span>
            </div>
          </div>

          {/* Tier label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <span
              className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-semibold"
              style={{ color: tierColor }}
            >
              {tierEmoji} {result.tier}
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Summary text */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            配对速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {result.summary}
          </p>
        </motion.div>
      </section>

      {/* Model compatibility bars */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            五大模型契合度
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 space-y-4">
            {result.modelScores.map(ms => (
              <ModelBar key={ms.model} name={ms.name} score={ms.score} model={ms.model} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Insights */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            配对洞察
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.insights.map((insight, i) => (
              <div
                key={i}
                className="rounded-xl border border-border-subtle bg-bg-elevated shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{insight.emoji}</span>
                  <span className="text-sm font-medium text-text-primary">{insight.title}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dimension comparison table */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            15 维对比详情
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border text-[10px] text-text-muted font-mono tracking-wider">
              <span className="w-8 shrink-0">维度</span>
              <span className="flex-1">名称</span>
              <span className="w-5 text-center" style={{ color: typeA.color }}>{typeA.code.slice(0, 4)}</span>
              <span className="w-6" />
              <span className="w-5 text-center" style={{ color: typeB.color }}>{typeB.code.slice(0, 4)}</span>
              <span className="w-16 text-center">结果</span>
            </div>
            {result.comparisons.map(comp => (
              <DimensionRow key={comp.dimensionId} comp={comp} codeA={typeA.code} codeB={typeB.code} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Send to partner */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div
            className="rounded-2xl border p-6 sm:p-8 text-center"
            style={{ borderColor: `${tierColor}30`, background: `${tierColor}08` }}
          >
            <div className="text-3xl mb-3">📩</div>
            <h3 className="text-lg font-semibold mb-2">发给 TA 看结果</h3>
            <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
              复制这个链接发给对方，TA 打开就能看到你们的 CP 配对报告！
            </p>
            <button
              onClick={copyCPResultLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: cpLinkCopied ? '#22c55e' : tierColor,
                color: '#FFFFFF',
              }}
            >
              {cpLinkCopied ? '链接已复制 ✓' : '复制 CP 结果链接'}
              {!cpLinkCopied && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            分享你们的 CP 结果
          </h2>
          <div className="space-y-3">
            <CPShareImageGenerator ref={shareRef} cpResult={result} />
          </div>
        </motion.div>
      </section>

      {/* Actions */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/result/${typeA.slug}`}
            className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
          >
            查看 {typeA.code} 详情
          </Link>
          <Link
            href={`/result/${typeB.slug}`}
            className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
          >
            查看 {typeB.code} 详情
          </Link>
          <Link
            href="/test/"
            className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
          >
            重新测试
          </Link>
        </div>
      </section>
    </div>
  );
}
