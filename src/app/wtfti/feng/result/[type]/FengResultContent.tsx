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

function WarningBadge({ children, color, variant = 'default' }: { children: React.ReactNode; color: string; variant?: 'default' | 'critical' }) {
  const isCritical = variant === 'critical';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${isCritical ? 'feng-shake-lite' : ''}`}
      style={{
        borderColor: isCritical ? 'rgba(255,0,0,0.6)' : `${color}50`,
        color: isCritical ? '#ff4444' : `${color}cc`,
        background: isCritical ? 'rgba(255,0,0,0.12)' : `${color}10`,
      }}
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
  tilt = false,
}: {
  children: React.ReactNode;
  color: string;
  className?: string;
  style?: React.CSSProperties;
  tilt?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${tilt ? 'feng-tilt-1' : ''} ${className}`}
      style={{ borderColor: `${color}25`, ...style }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 40px ${color}08` }} />
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l" style={{ borderColor: `${color}40` }} />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r" style={{ borderColor: `${color}40` }} />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l" style={{ borderColor: `${color}40` }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r" style={{ borderColor: `${color}40` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

function OrbitalRings({ color }: { color: string }) {
  const ring1 = ['⚡', '✦', '●', '✦', '⚡', '✦', '●', '✦'];
  const ring2 = ['!', '?', '!', '?', '!', '?', '!', '?'];
  return (
    <>
      <div className="absolute inset-0 feng-orbit pointer-events-none">
        {ring1.map((s, i) => {
          const angle = (360 / ring1.length) * i;
          return (
            <span
              key={`r1-${i}`}
              className="absolute text-[10px] font-black"
              style={{
                color: `${color}60`,
                left: '50%',
                top: '50%',
                transform: `rotate(${angle}deg) translateY(-72px)`,
                transformOrigin: '0 0',
              }}
            >
              {s}
            </span>
          );
        })}
      </div>
      <div className="absolute inset-0 feng-orbit-reverse pointer-events-none">
        {ring2.map((s, i) => {
          const angle = (360 / ring2.length) * i;
          return (
            <span
              key={`r2-${i}`}
              className="absolute text-[11px] font-black"
              style={{
                color: `${color}40`,
                left: '50%',
                top: '50%',
                transform: `rotate(${angle}deg) translateY(-90px)`,
                transformOrigin: '0 0',
              }}
            >
              {s}
            </span>
          );
        })}
      </div>
    </>
  );
}

function ShockwaveRings({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <span className="absolute w-full h-full rounded-full border feng-shockwave" style={{ borderColor: `${color}30` }} />
      <span className="absolute w-full h-full rounded-full border feng-shockwave" style={{ borderColor: `${color}20`, animationDelay: '0.4s' }} />
      <span className="absolute w-full h-full rounded-full border feng-shockwave" style={{ borderColor: `${color}15`, animationDelay: '0.8s' }} />
    </div>
  );
}

function HandwriteNote({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`feng-handwrite text-sm sm:text-base text-white/70 absolute pointer-events-none ${className}`}
      style={{ ...style }}
    >
      {children}
    </span>
  );
}

const corruptChars = ['▓', '▒', '░', '@', '#', '$', '%', '&', '*', '?', '!'];

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getSeverityPercent(seed: string, index: number) {
  return 80 + (hashSeed(`${seed}:${index}`) % 19);
}

function getClassificationLevel(seed: string) {
  return (hashSeed(seed) % 5) + 1;
}

function CorruptName({ name, color }: { name: string; color: string }) {
  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4" style={{ color }}>
      {name.split('').map((char, i) => (
        <span
          key={i}
          className="relative inline-block feng-corrupt-text"
          style={{ '--fc-delay': `${i * 0.06}s`, '--fc-char': `"${corruptChars[(i + name.length) % corruptChars.length]}"` } as React.CSSProperties}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

function SymptomRow({ s, i, total, color }: { s: string; i: number; total: number; color: string }) {
  const severity = i < 2 ? 'calm' : i >= total - 2 ? 'critical' : 'warm';
  const isCritical = severity === 'critical';
  const isWarm = severity === 'warm';
  const isLast = i === total - 1;

  const borderColor = isCritical ? 'rgba(255,0,0,0.35)' : isWarm ? 'rgba(255,140,0,0.35)' : `${color}15`;
  const bgColor = isCritical ? 'rgba(255,0,0,0.1)' : isWarm ? 'rgba(255,140,0,0.08)' : `${color}08`;
  const numBg = isCritical ? 'rgba(255,0,0,0.22)' : isWarm ? 'rgba(255,140,0,0.18)' : `${color}18`;
  const numColor = isCritical ? '#ff4444' : isWarm ? '#ffaa33' : color;
  const badge = isCritical ? '⚠ CRITICAL' : isWarm ? '⚠ ELEVATED' : 'NORMAL';

  return (
    <li
      className={`flex items-start gap-3 rounded-xl border p-3 sm:p-4 ${isCritical ? 'feng-pulse-red feng-shake-lite' : ''} ${isLast ? 'rotate-[2deg]' : ''}`}
      style={{ borderColor, background: bgColor }}
    >
      <span
        className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-black font-mono"
        style={{ background: numBg, color: numColor, boxShadow: `0 0 12px ${numColor}20` }}
      >
        {String(i + 1).padStart(2, '0')}
      </span>
      <div className="flex-1 relative">
        <span className="text-white/85 text-sm sm:text-base leading-relaxed pt-0.5">{s}</span>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{
              color: numColor,
              background: `${numColor}15`,
            }}
          >
            {badge}
          </span>
          {isCritical && (
            <span className="text-[9px] font-mono text-white/40">
              SEVERITY: {getSeverityPercent(s, i)}%
            </span>
          )}
        </div>
        {isLast && (
          <div className="absolute -top-2 -right-1 feng-fatal-stamp text-[10px] font-black px-2 py-0.5 rounded border border-red-500/60">
            FATAL
          </div>
        )}
      </div>
    </li>
  );
}

const danmakuItems = [
  { text: '哈哈哈哈', top: '12%', delay: '0s', duration: '9s', color: '#ffffff80' },
  { text: '是我', top: '22%', delay: '2s', duration: '11s', color: '#ff005580' },
  { text: '监控拆了', top: '35%', delay: '4s', duration: '10s', color: '#00ffff80' },
  { text: '太准了', top: '48%', delay: '1s', duration: '12s', color: '#ffffff70' },
  { text: '救命', top: '58%', delay: '5s', duration: '9s', color: '#ffaa3380' },
  { text: '谁在我家装监控', top: '68%', delay: '3s', duration: '13s', color: '#ffffff60' },
  { text: '完全一致', top: '78%', delay: '6s', duration: '10s', color: '#39ff1480' },
  { text: '世另我', top: '88%', delay: '0.5s', duration: '11s', color: '#ff005570' },
];

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
      {/* Glitch scan sweep */}
      <div className="pointer-events-none fixed inset-0 z-[60] feng-scan-sweep" />

      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-40 feng-scanlines opacity-20" />

      {/* Danmaku layer */}
      <div className="pointer-events-none fixed inset-0 z-[35] overflow-hidden">
        {danmakuItems.map((d, i) => (
          <div
            key={i}
            className="absolute whitespace-nowrap text-sm sm:text-base font-bold feng-danmaku"
            style={{
              top: d.top,
              color: d.color,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          >
            {d.text}
          </div>
        ))}
      </div>

      {/* Top warning marquee */}
      <div className="relative z-30 overflow-hidden border-b border-white/10 bg-black/40">
        <div className="whitespace-nowrap feng-marquee flex items-center gap-8 py-1.5 text-[10px] font-mono tracking-widest uppercase text-red-400">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
            CLASSIFIED // DO NOT DISTRIBUTE
          </span>
          <span>⚠ DIAGNOSIS CONFIRMED</span>
          <span>⚡ VIRAL POTENTIAL: MAXIMUM</span>
          <span>🌀 PERSONALITY CORRUPTION DETECTED</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
            CLASSIFIED // DO NOT DISTRIBUTE
          </span>
          <span>⚠ DIAGNOSIS CONFIRMED</span>
          <span>⚡ VIRAL POTENTIAL: MAXIMUM</span>
          <span>🌀 PERSONALITY CORRUPTION DETECTED</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Massive personality color aura */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${p.color}20, transparent 55%)` }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { e: p.emoji, left: 10, top: 16, delay: 0, size: 'text-2xl' },
            { e: '✦', left: 86, top: 20, delay: 0.8, size: 'text-lg' },
            { e: '✦', left: 6, top: 52, delay: 1.4, size: 'text-base' },
            { e: p.emoji, left: 82, top: 58, delay: 2.1, size: 'text-xl' },
            { e: '⚡', left: 18, top: 70, delay: 1.1, size: 'text-lg' },
            { e: '✗', left: 90, top: 75, delay: 0.5, size: 'text-sm' },
            { e: '!', left: 4, top: 30, delay: 1.8, size: 'text-xl' },
            { e: '?', left: 94, top: 40, delay: 2.5, size: 'text-xl' },
          ].map((item, i) => (
            <span
              key={i}
              className={`absolute opacity-15 select-none feng-float-chaos ${item.size}`}
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

        <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center relative">
          {/* Top actions */}
          <div className="absolute top-12 right-6 flex items-center gap-2">
            <button
              onClick={() => shareRef.current?.generate()}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer feng-shake-lite"
              title="生成分享图片"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] text-white/60 font-mono tracking-wider mb-5 feng-jitter">
              <span style={{ color: p.color }}>●</span>
              疯TI · 发疯宇宙 · {p.number}
            </div>

            {/* Giant emoji with aura + orbital rings + shockwaves */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 mx-auto mb-8">
              <OrbitalRings color={p.color} />
              <ShockwaveRings color={p.color} />
              <div
                className="absolute inset-0 rounded-full feng-pulse-glow"
                style={{ boxShadow: `0 0 60px ${p.color}40, inset 0 0 40px ${p.color}15` }}
              />
              <div
                className="absolute inset-2 rounded-full"
                style={{ background: `radial-gradient(circle at 40% 30%, ${p.color}25, transparent 60%)` }}
              />
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: `${p.color}35` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl sm:text-8xl md:text-9xl select-none" style={{ filter: `drop-shadow(0 0 28px ${p.color}70)` }}>
                  {p.emoji}
                </span>
              </div>
              {/* Rotating ring SVG */}
              <svg className="absolute inset-0 w-full h-full feng-orbit-fast opacity-30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke={p.color} strokeWidth="0.5" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Code */}
            <div className="text-sm font-mono tracking-[0.3em] uppercase mb-2" style={{ color: p.color, textShadow: `0 0 14px ${p.color}70` }}>
              {p.code}
            </div>

            {/* Name - huge, glowing, corrupting */}
            <CorruptName name={p.fengName} color={p.color} />

            {/* Tagline */}
            <p className="text-lg sm:text-xl max-w-md mx-auto mb-2 font-bold" style={{ color: '#ffffff', textShadow: `0 0 16px ${p.color}35` }}>
              &ldquo;{p.tagline}&rdquo;
            </p>

            {/* Rotated warning label */}
            <div className="flex justify-center mt-4">
              <WarningBadge color={p.color} variant="critical">
                CLASSIFIED // LEVEL {getClassificationLevel(p.slug)}
              </WarningBadge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Universe Switcher */}
      <UniverseSwitcher slug={p.slug} currentUniverseId="feng" />

      {/* 发疯一击 - premium card */}
      <section className="max-w-2xl mx-auto px-6 pb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <CardFrame color={p.color} className="p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.015)' }} tilt>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">💥</span>
              <h2 className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">{'// Wtf_Hit.exe'}</h2>
            </div>
            <p className="text-xl sm:text-2xl font-bold leading-relaxed" style={{ color: p.color, textShadow: `0 0 14px ${p.color}30` }}>
              &ldquo;{p.copy.wtfHit}&rdquo;
            </p>
            {/* Slash-through decorative divider */}
            <div className="mt-5 h-px w-full relative overflow-hidden opacity-40">
              <div
                className="absolute inset-y-0 left-0 w-full feng-skew"
                style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-white/30">
              <span>[</span>
              <span className="text-red-400">DAMAGE_MULTIPLIER: ∞</span>
              <span>]</span>
            </div>
          </CardFrame>
        </motion.div>
      </section>

      {/* 隐藏症状清单 - diagnostic report with escalating severity */}
      <section className="max-w-2xl mx-auto px-6 pb-10 relative">
        <HandwriteNote className="-top-2 right-8 rotate-6 text-yellow-300/80" style={{ textShadow: '0 0 8px rgba(255,200,0,0.3)' }}>
          确诊了
        </HandwriteNote>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <CardFrame color={p.color} className="p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.015)' }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📋</span>
              <h2 className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">{'// Diagnostic_Report'}</h2>
              <span className="ml-auto text-[9px] font-mono text-red-400 border border-red-400/30 px-2 py-0.5 rounded">CONFIRMED</span>
            </div>
            <ul className="space-y-3 relative">
              {p.copy.symptoms.map((s, i) => (
                <SymptomRow key={i} s={s} i={i} total={p.copy.symptoms.length} color={p.color} />
              ))}
              <HandwriteNote className="bottom-16 right-2 rotate-[-3deg] text-pink-300/80" style={{ textShadow: '0 0 8px rgba(255,100,200,0.3)' }}>
                太真实了
              </HandwriteNote>
              <HandwriteNote className="bottom-40 -left-4 rotate-[4deg] text-cyan-300/70" style={{ textShadow: '0 0 8px rgba(0,255,255,0.2)' }}>
                我妈也这么说
              </HandwriteNote>
            </ul>
            {/* Footer decoration */}
            <div className="mt-5 flex items-center justify-between text-[10px] font-mono text-white/25">
              <span>────────────────────────────────────────────────────</span>
              <span>END OF REPORT</span>
            </div>
          </CardFrame>
        </motion.div>
      </section>

      {/* Fake system log console */}
      <section className="max-w-2xl mx-auto px-6 pb-6">
        <div className="rounded-lg border border-white/10 bg-black/60 px-4 py-3 font-mono text-xs">
          <div className="flex items-center justify-between mb-2 text-[10px] text-white/40">
            <span>system_log.txt</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 feng-flash" />
              LIVE
            </span>
          </div>
          <div className="space-y-1 text-white/70">
            <div><span className="text-green-400/80">&gt;</span> personality.exe has stopped responding</div>
            <div><span className="text-green-400/80">&gt;</span> sanity check: <span className="text-red-400">FAILED</span></div>
            <div><span className="text-green-400/80">&gt;</span> meme_density threshold exceeded (99.9%)</div>
            <div><span className="text-green-400/80">&gt;</span> generating viral payload for {p.code}...</div>
            <div><span className="text-green-400/80">&gt;</span> <span className="feng-blink">_</span></div>
          </div>
        </div>
      </section>

      {/* Share & Actions - propaganda poster card with viral styling */}
      <section className="max-w-2xl mx-auto px-6 pb-10 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <CardFrame
            color={p.color}
            className="p-6 sm:p-8 text-center relative"
            style={{ background: `linear-gradient(180deg, ${p.color}0a, rgba(255,255,255,0.01))` }}
            tilt
          >
            {/* Classified overlay stamps */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-red-500/70 border border-red-500/40 px-2 py-0.5 rotate-[-12deg]">
              TOP SECRET // LEAK
            </div>
            <div className="absolute top-5 right-4 text-xs font-black text-red-500/90 border-2 border-red-500/60 px-3 py-1 rotate-[8deg] uppercase tracking-wider">
              SHARE IMMEDIATELY
            </div>

            {/* Propaganda star */}
            <div className="text-2xl mb-2" style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}>
              ✦
            </div>
            {/* Viral badges */}
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <span className="text-[9px] font-mono text-red-400 border border-red-400/40 px-2 py-0.5 rounded">⚠ VIRAL</span>
              <span className="text-[9px] font-mono text-white/60 border border-white/10 px-2 py-0.5 rounded">
                传播指数 99.9%
              </span>
              <span className="text-[9px] font-mono text-white/60 border border-white/10 px-2 py-0.5 rounded">
                CONTAGIOUS: MAX
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">分享你的疯TI人格</h3>
            <p className="text-sm text-white/55 mb-5 max-w-sm mx-auto">截图发给朋友，看看谁是隐藏症状最重的那个</p>

            {/* Share image generator */}
            <div className="max-w-sm mx-auto mb-5">
              <FengShareImageGenerator ref={shareRef} personality={p} imageUrl={typeImageUrl} dimensionScores={dimensionScores} />
            </div>

            {/* Share buttons */}
            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                onClick={copyShareText}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-white feng-tilt-n1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {textCopied ? '已复制 ✓' : '复制文案'}
              </button>
              <button
                onClick={quickShare}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer text-black hover:brightness-110 feng-danger-pulse feng-tilt-1"
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

      {/* Other types - broken grid */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-white/10" />
          <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">其他发疯人格</h3>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {others.map((o, idx) => {
            const offsets = ['-mt-3 mb-3', 'mt-2 -mb-2', '-mt-1 mb-1', 'mt-3 -mb-3'];
            const rotations = ['rotate-[-2deg]', 'rotate-[1deg]', 'rotate-[2deg]', 'rotate-[-1deg]'];
            return (
              <Link
                key={o.slug}
                href={`/wtfti/feng/result/${o.slug}/`}
                className={`group relative rounded-2xl border border-white/10 p-4 transition-all hover:border-white/20 flex flex-col items-center text-center overflow-hidden ${offsets[idx]} ${rotations[idx]}`}
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: `inset 0 0 24px ${o.color}12` }} />
                <div
                  className="relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-3 border"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${o.color}12, transparent 55%)`,
                    borderColor: `${o.color}25`,
                  }}
                >
                  <span className="text-5xl transition-transform duration-300 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 18px ${o.color}55)` }}>
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
            );
          })}
        </div>
      </section>

      {/* Retest CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/wtfti/feng/test/"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-base overflow-hidden transition-all hover:brightness-110 feng-danger-pulse"
            style={{ background: p.color, color: '#000', boxShadow: `0 0 28px ${p.color}45` }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white" />
            <span className="relative">重新测试</span>
          </Link>
          <Link
            href="/wtfti/feng/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/20 transition-all hover:bg-white/5 feng-tilt-n1"
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
