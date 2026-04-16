'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { generateSoulFrequency, getTimeUntilNextWeek, type SoulFrequency } from '@/lib/soul-frequency';
import { loadCard } from '@/lib/wtf-card';
import { resolvePersonality } from '@/lib/personality-resolver';

export function WeeklySoulContent() {
  const [freq, setFreq] = useState<SoulFrequency | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFreq(generateSoulFrequency());
  }, []);

  const card = typeof window !== 'undefined' ? loadCard() : null;
  const primarySlug = card?.results?.['wtfti']?.slug;
  const primaryPersonality = primarySlug ? resolvePersonality('wtfti', primarySlug) : null;

  const { days, hours } = mounted ? getTimeUntilNextWeek() : { days: 0, hours: 0 };

  if (!freq || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="section-label mb-2">SOUL FREQUENCY</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          每周灵魂频率
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {freq.weekLabel} · 每周一更新
        </p>
      </motion.div>

      {/* Personality anchor */}
      {primaryPersonality && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <span className="text-lg">{primaryPersonality.emoji}</span>
          <span className="text-sm text-text-secondary">{primaryPersonality.name}</span>
          <span className="text-xs text-text-muted">的本周频率</span>
        </motion.div>
      )}

      {/* Energy ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center mb-8"
      >
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={freq.luckyColor.hex}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - freq.energyIndex / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text-primary">{freq.energyIndex}</span>
            <span className="text-[10px] text-text-muted">能量指数</span>
          </div>
        </div>
      </motion.div>

      {/* Vibe label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            background: `${freq.luckyColor.hex}15`,
            color: freq.luckyColor.hex,
            border: `1px solid ${freq.luckyColor.hex}30`,
          }}
        >
          ✦ {freq.vibe}
        </div>
      </motion.div>

      {/* Soul state */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8 p-5 rounded-2xl border border-border-subtle bg-bg-elevated text-center"
      >
        <p className="text-[10px] font-mono tracking-widest text-text-muted mb-3 uppercase">灵魂状态</p>
        <p className="text-base text-text-primary leading-relaxed">{freq.soulState}</p>
      </motion.div>

      {/* Keywords */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <p className="text-[10px] font-mono tracking-widest text-text-muted mb-3 text-center uppercase">本周关键词</p>
        <div className="flex justify-center gap-3">
          {freq.keywords.map((kw, i) => (
            <div
              key={kw}
              className="px-4 py-2 rounded-xl border border-border-subtle bg-bg-secondary text-sm text-text-primary font-medium"
            >
              {kw}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lucky color */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 flex items-center justify-center gap-3"
      >
        <p className="text-[10px] font-mono tracking-widest text-text-muted uppercase">幸运色</p>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border border-white/20"
            style={{ background: freq.luckyColor.hex }}
          />
          <span className="text-sm text-text-secondary">{freq.luckyColor.name}</span>
          <span className="text-[10px] font-mono text-text-muted">{freq.luckyColor.hex}</span>
        </div>
      </motion.div>

      {/* Advice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 p-4 rounded-xl border border-accent/20 bg-accent-dim text-center"
      >
        <p className="text-[10px] font-mono tracking-widest text-accent/60 mb-2 uppercase">本周小建议</p>
        <p className="text-sm text-accent">{freq.advice}</p>
      </motion.div>

      {/* Next update countdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-center mb-8"
      >
        <p className="text-xs text-text-muted">
          下次更新：{days > 0 ? `${days} 天 ${hours} 小时后` : `${hours} 小时后`}
        </p>
      </motion.div>

      {/* CTA */}
      {!primarySlug && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-text-muted mb-3">完成 WTFTI 测试解锁个性化频率</p>
          <Link
            href="/wtfti/test/"
            className="inline-block px-5 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            去测试 →
          </Link>
        </motion.div>
      )}

      {/* Back to card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-center mt-6"
      >
        <Link
          href="/card/"
          className="text-sm text-text-muted hover:text-accent transition-colors"
        >
          ← 返回 WTF Card
        </Link>
      </motion.div>
    </div>
  );
}
