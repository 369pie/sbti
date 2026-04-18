'use client';

import dynamic from 'next/dynamic';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { PERSONALITY_TYPES, getTypeImage, getTypeThumbnailImage, getTypeMediumImage } from '@/lib/personalities';
import {
  MBTI_TYPES, ZODIAC_SIGNS, ELEMENT_LABELS,
  generateCombo, getComboPersonalityImage, getComboPersonalityThumbnailImage, getComboPersonalityMediumImage,
} from '@/lib/combo';
import type { ComboResult } from '@/lib/combo';
const ComboShareImageGenerator = dynamic(
  () => import('@/components/ComboShareImageGenerator').then((m) => m.ComboShareImageGenerator),
  { ssr: false },
);
import type { ComboShareImageGeneratorHandle } from '@/components/ComboShareImageGenerator';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';

// ─── Step indicator ──────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'w-8 bg-accent' : i === current ? 'w-8 bg-accent/50' : 'w-4 bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );
}

// ─── SBTI type picker ────────────────────────────────────

function SBTIPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-center">选择你的 SBTI 人格</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        还没测过？<Link href="/test/" className="text-accent hover:underline">先去测一下</Link>
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
        {PERSONALITY_TYPES.map(p => (
          <button
            key={p.slug}
            onClick={() => onSelect(p.slug)}
            className={`group relative rounded-2xl border p-2.5 sm:p-3 lg:p-4 text-center transition-all cursor-pointer min-h-[7.5rem] lg:min-h-[11rem] ${
              selected === p.slug
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            {p.isSpecial && (
              <span className="absolute top-2 right-2 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium text-accent">
                特殊
              </span>
            )}
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 mx-auto mb-1.5 lg:mb-3 rounded-xl lg:rounded-2xl overflow-hidden" style={{ background: `${p.color}15` }}>
              <NextImage
                src={getTypeThumbnailImage(p.slug)}
                alt={p.name}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[10px] sm:text-[11px] lg:text-xs font-mono tracking-[0.16em]" style={{ color: p.color }}>
              {p.code}
            </div>
            <div className="text-xs sm:text-sm lg:text-[15px] leading-tight text-text-primary mt-0.5 lg:mt-1">
              {p.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MBTI picker ─────────────────────────────────────────

function MBTIPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-center">选择你的 MBTI</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        不确定？挑一个你觉得最像的就行
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MBTI_TYPES.map(m => (
          <button
            key={m.code}
            onClick={() => onSelect(m.code)}
            className={`rounded-xl border py-3 px-2 text-center transition-all cursor-pointer ${
              selected === m.code
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            <div className="text-sm font-mono font-semibold text-text-primary">{m.code}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Zodiac picker ───────────────────────────────────────

function ZodiacPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-center">选择你的星座</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        你的太阳星座就行
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {ZODIAC_SIGNS.map(z => (
          <button
            key={z.id}
            onClick={() => onSelect(z.id)}
            className={`rounded-xl border py-3 px-2 text-center transition-all cursor-pointer ${
              selected === z.id
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            <div className="text-xl mb-0.5">{z.emoji}</div>
            <div className="text-sm text-text-primary">{z.name}</div>
            <div className="text-[10px] text-text-muted">{ELEMENT_LABELS[z.element]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Result display ──────────────────────────────────────

function ComboResultDisplay({ result }: { result: ComboResult }) {
  const shareRef = useRef<ComboShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef);
  const [copied, setCopied] = useState(false);
  const comboImageSrc = getComboPersonalityMediumImage(result.comboPersonality.code);
  const comboImageFallbackSrc = getComboPersonalityImage(result.comboPersonality.code);
  const personalityImageSrc = getTypeMediumImage(result.personality.slug);
  const personalityImageFallbackSrc = getTypeImage(result.personality.slug);

  const applyImageFallback = (target: HTMLImageElement, fallbackSrc: string) => {
    if (target.dataset.fallbackApplied === 'true') {
      return true;
    }

    target.dataset.fallbackApplied = 'true';
    target.src = fallbackSrc;
    return false;
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Top-right share button */}
      <button
        onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
        className="absolute -top-2 right-0 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-purple-400 transition-all cursor-pointer z-10"
        title="生成分享图片"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {/* Easter egg badge */}
      {result.isEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border border-amber-400/30 bg-amber-400/10 text-amber-400">
            🥚 隐藏彩蛋组合
          </span>
        </motion.div>
      )}

      {/* Three badges row */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
          style={{ color: result.personality.color, background: `${result.personality.color}12`, borderColor: `${result.personality.color}30` }}
        >
          {result.personality.emoji} {result.personality.code}
        </span>
        <span className="text-text-muted text-xs">×</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-purple-400/30 bg-purple-400/10 text-purple-300">
          {result.mbti.code}
        </span>
        <span className="text-text-muted text-xs">×</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          {result.zodiac.emoji} {result.zodiac.name}
        </span>
      </div>

      {/* Combo Personality Hero Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-2xl border-2 p-6 sm:p-8 text-center mb-6"
        style={{ borderColor: result.comboPersonality.color, background: `${result.comboPersonality.color}08` }}
      >
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
          {/* Combo personality image */}
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0"
            style={{ borderColor: `${result.comboPersonality.color}40`, background: `${result.comboPersonality.color}12` }}
          >
            <NextImage
              src={comboImageSrc}
              alt={result.comboPersonality.name}
              width={96}
              height={96}
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                if (!applyImageFallback(target, comboImageFallbackSrc)) {
                  return;
                }

                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span style="font-size:2.5rem;line-height:1;display:flex;align-items:center;justify-content:center;height:100%">${result.comboPersonality.emoji}</span>`;
                }
              }}
            />
          </div>
          {/* SBTI character image */}
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0"
            style={{ borderColor: `${result.personality.color}40`, background: `${result.personality.color}12` }}
          >
            <NextImage
              src={personalityImageSrc}
              alt={result.personality.name}
              width={96}
              height={96}
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                applyImageFallback(e.currentTarget, personalityImageFallbackSrc);
              }}
            />
          </div>
        </div>
        <div
          className="text-lg sm:text-xl font-mono font-extrabold tracking-wider mb-1"
          style={{ color: result.comboPersonality.color }}
        >
          {result.comboPersonality.code}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">{result.comboPersonality.name}</h3>
        <p className="text-sm text-text-secondary">「{result.comboPersonality.tagline}」</p>
      </motion.div>

      {/* Combo title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent"
      >
        {result.title}
      </motion.h1>

      {/* Sub info */}
      <p className="text-sm text-text-muted text-center mb-8">
        {result.personality.name} · {result.mbti.code} · {result.zodiac.name}
      </p>

      {/* Roast card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm mb-8"
      >
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-5">
          毒舌拼盘分析
        </h2>
        <div className="space-y-4">
          {result.roasts.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="flex gap-3"
            >
              <span className="text-accent shrink-0 mt-0.5">▸</span>
              <p className="text-text-secondary leading-relaxed text-[15px]">{line}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Share section */}
      <div className="space-y-3 mb-8">
        {shareMounted ? <ComboShareImageGenerator ref={shareRef} result={result} /> : null}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopyLink}
          className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
        >
          {copied ? '已复制 ✓' : '复制链接'}
        </button>
        <Link
          href={`/result/${result.personality.slug}/`}
          className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
        >
          查看 SBTI 详情
        </Link>
        <Link
          href="/test/"
          className="flex-1 py-3 rounded-xl border border-accent/30 text-sm text-accent hover:bg-accent/10 transition-all text-center"
        >
          重新测试
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main content ────────────────────────────────────────

export function ComboContent() {
  const searchParams = useSearchParams();
  const preselectedSBTI = searchParams.get('sbti');

  const [sbtiSlug, setSbtiSlug] = useState<string | null>(preselectedSBTI);
  const [mbtiCode, setMbtiCode] = useState<string | null>(null);
  const [zodiacId, setZodiacId] = useState<string | null>(null);
  const [result, setResult] = useState<ComboResult | null>(null);

  const handleSBTISelect = useCallback((slug: string) => {
    setSbtiSlug(slug);
  }, []);

  const handleMBTISelect = useCallback((code: string) => {
    setMbtiCode(code);
  }, []);

  const handleZodiacSelect = useCallback((id: string) => {
    setZodiacId(id);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!sbtiSlug || !mbtiCode || !zodiacId) return;
    const comboResult = generateCombo(sbtiSlug, mbtiCode, zodiacId);
    if (comboResult) {
      setResult(comboResult);
    }
  }, [sbtiSlug, mbtiCode, zodiacId]);

  const handleReset = useCallback(() => {
    setResult(null);
    setMbtiCode(null);
    setZodiacId(null);
  }, []);

  const shellWidthClass = result ? 'max-w-2xl' : 'max-w-5xl';

  return (
    <div className="min-h-screen">
      <div className={`${shellWidthClass} mx-auto px-4 sm:px-6 pt-12 pb-24`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-4">
            🧩 人格拼盘
          </div>
          {!result && (
            <>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                解锁你的人格拼盘
              </h1>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                把 SBTI 人格 × MBTI × 星座拼在一起，看看能拼出什么离谱称号
              </p>
            </>
          )}
        </motion.div>

        {!result && <StepIndicator current={sbtiSlug ? (mbtiCode ? (zodiacId ? 3 : 2) : 1) : 0} total={3} />}

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ComboResultDisplay result={result} />
              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="text-sm text-text-muted hover:text-accent transition-colors cursor-pointer"
                >
                  换个组合试试 →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Step 1: SBTI */}
              {!preselectedSBTI && (
                <div className="mb-10">
                  <SBTIPicker selected={sbtiSlug} onSelect={handleSBTISelect} />
                </div>
              )}

              {/* Pre-selected SBTI badge */}
              {preselectedSBTI && sbtiSlug && (() => {
                const p = PERSONALITY_TYPES.find(t => t.slug === sbtiSlug);
                return p ? (
                  <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 mb-8 p-3 rounded-xl border border-border-subtle bg-bg-secondary/40">
                    <div className="w-8 h-8 rounded-lg overflow-hidden" style={{ background: `${p.color}15` }}>
                      <NextImage src={getTypeThumbnailImage(p.slug)} alt={p.name} width={32} height={32} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-medium">{p.code}（{p.name}）</span>
                    <span className="text-xs text-text-muted">— 你的 SBTI 人格</span>
                  </div>
                ) : null;
              })()}

              {/* Step 2: MBTI */}
              {sbtiSlug && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto mb-10"
                >
                  <MBTIPicker selected={mbtiCode} onSelect={handleMBTISelect} />
                </motion.div>
              )}

              {/* Step 3: Zodiac */}
              {sbtiSlug && mbtiCode && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto mb-10"
                >
                  <ZodiacPicker selected={zodiacId} onSelect={handleZodiacSelect} />
                </motion.div>
              )}

              {/* Generate button */}
              {sbtiSlug && mbtiCode && zodiacId && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto mt-8"
                >
                  <button
                    onClick={handleGenerate}
                    className="w-full py-4 rounded-2xl bg-accent text-bg-primary font-semibold text-base hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    🧩 解锁我的人格拼盘
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
