'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import type { FengPersonality } from '@/lib/feng/personalities';
import { FENG_PERSONALITIES, getFengTypeImage } from '@/lib/feng/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { getSiteUrl } from '@/lib/site';
import { FengShareImageGenerator } from '@/components/FengShareImageGenerator';
import type { FengShareImageHandle } from '@/components/FengShareImageGenerator';
import { UniverseSwitcher } from '@/components/UniverseSwitcher';
import { UniverseResultBar } from '@/components/UniverseResultBar';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';

interface Props {
  fengPersonality: FengPersonality;
  dimensionScores: DimensionScore[];
}

function WarningBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
      style={{ borderColor: `${color}50`, color: `${color}cc`, background: `${color}10` }}
    >
      <span className="text-[8px]">&#9650;</span>
      {children}
    </span>
  );
}

function CardFrame({
  children,
  color,
  className = '',
  style,
}: {
  children: React.ReactNode;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`relative rounded-2xl border overflow-hidden ${className}`} style={{ borderColor: `${color}25`, ...style }}>
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />
      {/* Inner shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: `inset 0 0 40px ${color}08` }}
      />
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l" style={{ borderColor: `${color}40` }} />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r" style={{ borderColor: `${color}40` }} />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l" style={{ borderColor: `${color}40` }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r" style={{ borderColor: `${color}40` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

export function FengResultContent({ fengPersonality: p, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<FengShareImageHandle>(null);

  const shareUrl = getSiteUrl(`/wtfti/feng/result/${p.slug}/`);

  const copyShareText = useCallback(() => {
    const text = `疯TI · 我竟然是${p.fengName}？？\n"【${p.tagline}】"\n来测测你的发疯人格 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [p.fengName, p.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `疯TI · 我竟然是${p.fengName}？？`,
          text: p.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  }, [copyLink, p.fengName, p.tagline, shareUrl]);

  const others = FENG_PERSONALITIES.filter(o => o.slug !== p.slug).slice(0, 4);
  const typeImageUrl = getFengTypeImage(p.slug);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-40 feng-scanlines opacity-10" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Massive personality color aura */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${p.color}18, transparent 60%)` }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { e: p.emoji, left: 12, top: 18, delay: 0 },
            { e: '✦', left: 88, top: 22, delay: 0.8 },
            { e: '✦', left: 8, top: 55, delay: 1.4 },
            { e: p.emoji, left: 84, top: 60, delay: 2.1 },
          ].map((item, i) => (
            <span
              key={i}
              className="absolute text-lg sm:text-xl opacity-15 select-none feng-float"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animationDelay: `${item.delay}s`,
                filter: `drop-shadow(0 0 10px ${p.color})`,
              }}
            >
              {item.e}
            </span>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center relative">
          {/* Top actions */}
          <div className="absolute top-16 right-6 flex items-center gap-2">
            <button
              onClick={() => shareRef.current?.generate()}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="生成分享图片"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] text-white/60 font-mono tracking-wider mb-6">
              <span style={{ color: p.color }}>●</span>
              疯TI · 发疯宇宙 · {p.number}
            </div>

            {/* Giant emoji with aura */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto mb-8">
              {/* Aura rings */}
              <div
                className="absolute inset-0 rounded-full feng-pulse-glow"
                style={{
                  boxShadow: `0 0 60px ${p.color}40, inset 0 0 40px ${p.color}15`,
                }}
              />
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: `radial-gradient(circle at 40% 30%, ${p.color}25, transparent 60%)`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: `${p.color}35` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-7xl sm:text-8xl md:text-9xl select-none"
                  style={{ filter: `drop-shadow(0 0 28px ${p.color}70)` }}
                >
                  {p.emoji}
                </span>
              </div>
            </div>

            {/* Code */}
            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: p.color, textShadow: `0 0 14px ${p.color}70` }}
            >
              {p.code}
            </div>

            {/* Name - huge and glowing */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4"
              style={{
                color: p.color,
                textShadow: `0 0 28px ${p.color}55, 0 0 72px ${p.color}30`,
              }}
            >
              {p.fengName}
            </h1>

            {/* Tagline */}
            <p
              className="text-lg sm:text-xl max-w-md mx-auto mb-2 font-bold"
              style={{ color: '#ffffff', textShadow: `0 0 16px ${p.color}35` }}
            >
              &ldquo;{p.tagline}&rdquo;
            </p>

            {/* Rotated warning label */}
            <div className="flex justify-center mt-4">
              <WarningBadge color={p.color}>
                CLASSIFIED // LEVEL {Math.floor(Math.random() * 5) + 1}
              </WarningBadge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Universe Switcher */}
      <UniverseSwitcher slug={p.slug} currentUniverseId="feng" />

      {/* 发疯一击 - premium card */}
      <section className="max-w-2xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardFrame color={p.color} className="p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.015)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">💥</span>
              <h2 className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">
                // Wtf_Hit.exe
              </h2>
            </div>
            <p
              className="text-xl sm:text-2xl font-bold leading-relaxed"
              style={{ color: p.color, textShadow: `0 0 14px ${p.color}30` }}
            >
              &ldquo;{p.copy.wtfHit}&rdquo;
            </p>
            {/* Slash-through decorative divider */}
            <div className="mt-5 h-px w-full relative overflow-hidden opacity-30">
              <div
                className="absolute inset-y-0 left-0 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                  transform: 'skewX(-45deg)',
                }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-white/30">
              <span>[</span>
              <span>DAMAGE_MULTIPLIER: ∞</span>
              <span>]</span>
            </div>
          </CardFrame>
        </motion.div>
      </section>

      {/* 隐藏症状清单 - diagnostic report */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardFrame color={p.color} className="p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.015)' }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📋</span>
              <h2 className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">
                // Diagnostic_Report
              </h2>
            </div>
            <ul className="space-y-3">
              {p.copy.symptoms.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border p-3 sm:p-4"
                  style={{ borderColor: `${p.color}15`, background: `${p.color}08` }}
                >
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-black font-mono"
                    style={{
                      background: `${p.color}18`,
                      color: p.color,
                      boxShadow: `0 0 12px ${p.color}20`,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-white/85 text-sm sm:text-base leading-relaxed pt-0.5">{s}</span>
                </li>
              ))}
            </ul>
            {/* Footer decoration */}
            <div className="mt-5 flex items-center justify-between text-[10px] font-mono text-white/25">
              <span>────────────────────────────────────────────────────</span>
              <span>END OF REPORT</span>
            </div>
          </CardFrame>
        </motion.div>
      </section>

      {/* Share & Actions - propaganda poster card */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardFrame
            color={p.color}
            className="p-6 sm:p-8 text-center"
            style={{
              background: `linear-gradient(180deg, ${p.color}0a, rgba(255,255,255,0.01))`,
            }}
          >
            {/* Propaganda star */}
            <div className="text-2xl mb-3" style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}>
              ✦
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">
              分享你的疯TI人格
            </h3>
            <p className="text-sm text-white/55 mb-5 max-w-sm mx-auto">
              截图发给朋友，看看谁是隐藏症状最重的那个
            </p>

            {/* Share image generator */}
            <div className="max-w-sm mx-auto mb-5">
              <FengShareImageGenerator
                ref={shareRef}
                personality={p}
                imageUrl={typeImageUrl}
                dimensionScores={dimensionScores}
              />
            </div>

            {/* Share buttons */}
            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                onClick={copyShareText}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {textCopied ? '已复制 ✓' : '复制文案'}
              </button>
              <button
                onClick={quickShare}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer text-black hover:brightness-110"
                style={{ background: p.color, boxShadow: `0 0 24px ${p.color}45` }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
            </div>

            {/* Poster footer text */}
            <div className="mt-5 text-[10px] font-mono tracking-widest text-white/20 uppercase">
              【 {p.code} 】 · {p.number} · 疯TI ARCHIVE
            </div>
          </CardFrame>
        </motion.div>
      </section>

      {/* Cross-universe exploration */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <UniverseResultBar slug={p.slug} current="feng" />
      </section>

      {/* Other types */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-white/10" />
          <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
            其他发疯人格
          </h3>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {others.map(o => (
            <Link
              key={o.slug}
              href={`/wtfti/feng/result/${o.slug}/`}
              className="group relative rounded-2xl border border-white/10 p-4 transition-all hover:border-white/20 flex flex-col items-center text-center overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: `inset 0 0 24px ${o.color}12` }}
              />
              <div
                className="relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-3 border"
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${o.color}12, transparent 55%)`,
                  borderColor: `${o.color}25`,
                }}
              >
                <span
                  className="text-5xl transition-transform duration-300 group-hover:scale-110"
                  style={{ filter: `drop-shadow(0 0 18px ${o.color}55)` }}
                >
                  {o.emoji}
                </span>
              </div>
              <div className="relative w-full">
                <div className="font-bold text-sm text-white truncate">{o.fengName}</div>
                <div className="text-[10px] text-white/40 font-mono mt-0.5 tracking-wider">
                  {o.number} · {o.code}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Retest CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/wtfti/feng/test/"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-base overflow-hidden transition-all hover:brightness-110"
            style={{ background: p.color, color: '#000', boxShadow: `0 0 28px ${p.color}45` }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white" />
            <span className="relative">重新测试</span>
          </Link>
          <Link
            href="/wtfti/feng/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/20 transition-all hover:bg-white/5"
          >
            返回疯TI 首页
          </Link>
        </div>
      </section>

      <DailyCheckInCTA />
      <UniversePreviewCards currentUniverse="feng" />
      <IdentifyViralCTA personalityName={p.fengName} />
      <WtfCardCTA />
      <UgcShareCTA />
    </div>
  );
}
