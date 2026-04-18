'use client';

import dynamic from 'next/dynamic';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DAILY_DIMENSIONS, DAILY_MODEL_NAMES, DAILY_MODEL_COLORS } from '@/lib/daily/dimensions';
import { DAILY_STATUS_TYPES } from '@/lib/daily/statuses';
import type { DailyStatusType } from '@/lib/daily/statuses';
import type { DailyDimensionScore } from '@/lib/daily/scoring';
const DailyShareImageGenerator = dynamic(
  () => import('@/components/DailyShareImageGenerator').then((m) => m.DailyShareImageGenerator),
  { ssr: false },
);
import type { DailyShareImageGeneratorHandle } from '@/components/DailyShareImageGenerator';
import { DailyStatusAvatar } from '@/components/DailyStatusAvatar';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { loadStoredQuizResult } from '@/lib/quiz-result-session';
import { ResultDiagnosticsPanel } from '@/components/ResultDiagnosticsPanel';
import { generateDailyFortune, loadTodayResult, msUntilMidnight, cacheDailyResult } from '@/lib/daily/fortune';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';

const emptySubscribe = () => () => {};

interface Props {
  status: DailyStatusType;
  dimensionScores: DailyDimensionScore[];
}

export function DailyResultContent({ status, dimensionScores }: Props) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<DailyShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef);
  const [countdown, setCountdown] = useState('');

  // Ensure today's result is cached (handles direct link access)
  useEffect(() => {
    if (!mounted) return;
    const cached = loadTodayResult();
    if (!cached) cacheDailyResult(status.slug);
  }, [mounted, status.slug]);

  // Fortune data
  const allSlugs = useMemo(() => DAILY_STATUS_TYPES.map(s => s.slug), []);
  const fortune = useMemo(() => {
    const today = new Date();
    const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return generateDailyFortune(ds, status.slug, allSlugs);
  }, [status.slug, allSlugs]);
  const compatibleStatus = useMemo(() => DAILY_STATUS_TYPES.find(s => s.slug === fortune.compatibleStatus), [fortune.compatibleStatus]);

  // Countdown to midnight
  useEffect(() => {
    if (!mounted) return;
    const tick = () => {
      const ms = msUntilMidnight();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mounted]);

  const shareUrl = getSiteUrl(`/daily/result/${status.slug}/`);
  const sessionResult = useMemo(() => {
    if (!mounted) {
      return null;
    }

    const stored = loadStoredQuizResult<DailyDimensionScore>('daily');
    return stored?.slug === status.slug ? stored : null;
  }, [mounted, status.slug]);
  const activeDimensionScores = sessionResult?.dimensionScores ?? dimensionScores;
  const diagnostics = sessionResult?.diagnostics ?? null;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const copyShareText = useCallback(() => {
    const text = `今日模式：${status.code}（${status.name}）\n${status.tagline}\n来测测你的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [status.code, status.name, status.tagline, shareUrl]);

  const others = DAILY_STATUS_TYPES.filter(s => s.slug !== status.slug).slice(0, 3);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${status.color}12, transparent 70%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Top-right share button */}
          <button
            onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-teal-400 transition-all cursor-pointer"
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
              今日模式 · {dateStr}
            </div>

            {/* Character avatar */}
            <DailyStatusAvatar
              status={status}
              alt={`${status.name}形象`}
              priority
              sizes="(min-width: 640px) 192px, 160px"
              className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 rounded-2xl overflow-hidden"
              style={{ background: `${status.color}15` }}
              imageClassName="object-contain p-2"
              fallbackClassName="w-full h-full flex items-center justify-center text-7xl sm:text-8xl"
            />

            {/* Code */}
            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: status.color }}
            >
              {status.code}
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {status.name}
            </h1>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              {status.tagline}
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
            今日模式速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {status.description}
          </p>
        </motion.div>
      </section>

      {/* Fortune Card */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm overflow-hidden"
        >
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
            <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-5">
              🔮 今日运势
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Lucky Color */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 border border-black/5"
                  style={{ background: fortune.luckyColor.hex }}
                />
                <div>
                  <div className="text-xs text-text-muted">幸运色</div>
                  <div className="text-sm font-medium text-text-primary">{fortune.luckyColor.name}</div>
                </div>
              </div>
              {/* Lucky Number */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-sm font-mono font-bold" style={{ color: status.color }}>
                  {fortune.luckyNumber}
                </div>
                <div>
                  <div className="text-xs text-text-muted">幸运数字</div>
                  <div className="text-sm font-medium text-text-primary">{fortune.luckyNumber}</div>
                </div>
              </div>
              {/* Keyword */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-base">🏷️</div>
                <div>
                  <div className="text-xs text-text-muted">今日关键词</div>
                  <div className="text-sm font-medium text-text-primary">{fortune.keyword}</div>
                </div>
              </div>
              {/* Compatible */}
              {compatibleStatus && (
                <Link href={`/daily/result/${compatibleStatus.slug}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-base">{compatibleStatus.emoji}</div>
                  <div>
                    <div className="text-xs text-text-muted">最搭模式</div>
                    <div className="text-sm font-medium text-text-primary group-hover:underline">{compatibleStatus.name}</div>
                  </div>
                </Link>
              )}
            </div>
          </div>
          {/* Advice banner */}
          <div className="px-6 sm:px-8 py-4 bg-bg-tertiary/50 border-t border-border-subtle">
            <p className="text-sm text-text-secondary leading-relaxed">💡 {fortune.advice}</p>
          </div>
          {/* Motto */}
          <div className="px-6 sm:px-8 py-4 border-t border-border-subtle">
            <p className="text-center text-sm text-text-muted italic">&ldquo;{fortune.motto}&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {diagnostics && (
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <ResultDiagnosticsPanel diagnostics={diagnostics} accent={status.color} title="这次今日判定说明" />
          </motion.div>
        </section>
      )}

      {/* Dimension Bars */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            {diagnostics ? `${status.code} 的本次五维落点` : `${status.code} 的五维数据`}
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-5">
            {activeDimensionScores.map(ds => {
              const dim = DAILY_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = DAILY_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{DAILY_MODEL_NAMES[dim.model]}</span>
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

      <CrossTestRecommendations currentTest="daily" personalityName={status.name} />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="daily" dimensionScores={dimensionScores} />
      </section>

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            分享你的今日模式
          </h2>

          <div className="space-y-3">
            {shareMounted ? <DailyShareImageGenerator ref={shareRef} status={status} dimensionScores={activeDimensionScores} /> : null}

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-teal-500/20 bg-teal-500/5 text-sm text-teal-400 hover:bg-teal-500/10 transition-all cursor-pointer"
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
              <Link
                href="/daily/"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
              >
                返回今日模式
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Countdown to next day */}
      {mounted && countdown && (
        <section className="max-w-2xl mx-auto px-6 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-center rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6"
          >
            <div className="text-sm text-text-muted mb-2">新模式将在以下时间刷新</div>
            <div className="text-3xl font-mono font-semibold tracking-widest" style={{ color: status.color }}>
              {countdown}
            </div>
            <div className="text-xs text-text-muted mt-2">明天回来，看看你开了什么新模式 ✨</div>
          </motion.div>
        </section>
      )}

      {/* Other statuses */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
          还有这些状态卡
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map(s => (
            <Link
              key={s.slug}
              href={`/daily/result/${s.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
            >
              <DailyStatusAvatar
                status={s}
                alt=""
                sizes="96px"
                className="relative w-24 h-24 rounded-lg overflow-hidden mb-3"
                style={{ background: `${s.color}15` }}
                imageClassName="object-contain p-1"
                fallbackClassName="w-full h-full flex items-center justify-center text-3xl"
              />
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: s.color }}>
                {s.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{s.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
