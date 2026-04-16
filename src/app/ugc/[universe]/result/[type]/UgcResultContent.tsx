'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import type { UgcUniverseConfig, UgcPersonality } from '@/lib/ugc/types';
import type { DimensionScore } from '@/lib/scoring';
import { getSiteUrl } from '@/lib/site';
import { UniverseResultBar } from '@/components/UniverseResultBar';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UniverseProgressBar } from '@/components/UniverseProgressBar';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';

interface Props {
  universeConfig: UgcUniverseConfig;
  personality: UgcPersonality;
  dimensionScores: DimensionScore[];
}

export function UgcResultContent({ universeConfig: cfg, personality: p, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const universeId = `ugc-${cfg.id}`;
  const shareUrl = getSiteUrl(`/ugc/${cfg.id}/result/${p.slug}/`);

  const copyShareText = useCallback(() => {
    const text = `${cfg.name} · 我居然是${p.name}？？\n"${p.tagline}"\n来测测你的${cfg.shortName}人格 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [cfg.name, cfg.shortName, p.name, p.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cfg.name} · 我居然是${p.name}？？`,
          text: p.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  }, [copyLink, cfg.name, p.name, p.tagline, shareUrl]);

  const others = cfg.personalities.filter(o => o.slug !== p.slug).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${p.color}12, transparent 70%)` }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Share icon */}
          <div className="absolute top-16 right-6 flex items-center gap-2">
            <button
              onClick={quickShare}
              className="p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-accent transition-all cursor-pointer"
              title="分享"
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
              {cfg.emoji} {cfg.name} · {p.number}
              {cfg.creatorName && (
                <span className="text-text-muted/60">· by {cfg.creatorName}</span>
              )}
            </div>

            {/* Big emoji */}
            <div className="text-7xl sm:text-8xl mb-8">{p.emoji}</div>

            {/* Code */}
            <div className="text-sm font-mono tracking-[0.3em] uppercase mb-3" style={{ color: p.color }}>
              {p.code}
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {p.name}
            </h1>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              &ldquo;{p.tagline}&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hit section */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border bg-bg-elevated p-6 sm:p-8 shadow-sm"
          style={{ borderColor: `${p.color}30` }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            {cfg.hitLabel}
          </h2>
          <p className="text-xl font-medium text-accent leading-relaxed">
            &ldquo;{p.copy.hit}&rdquo;
          </p>
        </motion.div>
      </section>

      {/* OS section */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            {cfg.osLabel}
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base whitespace-pre-line">
            {p.copy.os}
          </p>
        </motion.div>
      </section>

      {/* Symptoms */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            {cfg.symptomsLabel}
          </h2>
          <ul className="space-y-3">
            {p.copy.symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs mt-0.5"
                  style={{ background: `${p.color}15`, color: p.color }}
                >
                  ✓
                </span>
                <span className="text-text-secondary text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Closer */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-6"
        >
          <p className="text-text-muted text-base leading-relaxed italic whitespace-pre-line">
            {p.copy.closer}
          </p>
        </motion.div>
      </section>

      {/* Quote card */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="rounded-2xl border p-6 sm:p-8 text-center"
          style={{ borderColor: `${p.color}30`, background: `${p.color}06` }}
        >
          <p className="text-lg font-medium italic" style={{ color: p.color }}>
            {p.quote}
          </p>
        </motion.div>
      </section>

      {/* Share & Actions */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <div
          className="rounded-2xl border p-6 sm:p-8 text-center"
          style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}
        >
          <div className="text-3xl mb-3">{cfg.emoji}</div>
          <h3 className="text-lg font-semibold mb-2">分享你的{cfg.name}结果</h3>
          <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
            把结果发给朋友，看看他们是谁
          </p>

          {/* Share buttons */}
          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={copyShareText}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-border-subtle bg-bg-elevated hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {textCopied ? '已复制 ✓' : '复制文案'}
            </button>
            <button
              onClick={quickShare}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-white"
              style={{ background: p.color }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {copied ? '已复制 ✓' : '复制链接'}
            </button>
          </div>
        </div>
      </section>

      {/* Cross-universe exploration */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <UniverseResultBar slug={p.slug} current={universeId} />
      </section>

      {/* Other types in this universe */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <h3 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
          {cfg.name} 其他人格
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {others.map(o => (
            <Link
              key={o.slug}
              href={`/ugc/${cfg.id}/result/${o.slug}/`}
              className="group rounded-2xl border border-border-subtle bg-bg-elevated p-4 shadow-sm hover:shadow-md hover:border-border transition-all flex flex-col items-center text-center"
            >
              <div
                className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-3"
                style={{ background: `linear-gradient(135deg, ${o.color}08, ${o.color}16)` }}
              >
                <span className="text-5xl">{o.emoji}</span>
              </div>
              <div className="w-full">
                <div className="font-medium text-sm text-text-primary truncate">{o.name}</div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{o.number} · {o.code}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Retest CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/ugc/${cfg.id}/test/`}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-base hover:bg-accent/90 transition-all"
          >
            重新测试
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border-subtle text-text-muted text-sm hover:text-text-secondary hover:border-border transition-all"
          >
            探索更多宇宙
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border-subtle bg-bg-secondary/40 p-5 sm:p-6 text-left">
          <p className="text-sm font-medium text-text-primary mb-2">你也想做一个自己的主题宇宙？</p>
          <p className="text-sm text-text-secondary leading-7 mb-4">
            WTFTI 创作者内测已开放：支持免费主题测试与付费主题测试商城，可查看收益分成与提现流程。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/creator/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              了解创作者计划
            </Link>
            <Link
              href="/creator/apply/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle text-text-secondary text-sm hover:text-text-primary hover:border-border transition-colors"
            >
              申请内测
            </Link>
          </div>
        </div>
      </section>

      <ResultClosureEngine
        currentUniverse={universeId}
        personalitySlug={p.slug}
        personalityName={p.name}
        accent={p.color || cfg.theme.primaryColor}
      />
    </div>
  );
}
