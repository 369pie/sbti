'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';
import { WTFTI_PERSONALITIES, getWtftiTypeImage, getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';
import type { DimensionScore } from '@/lib/scoring';
import { getSiteUrl } from '@/lib/site';
import { WtftiShareImageGenerator } from '@/components/WtftiShareImageGenerator';
import type { WtftiShareImageHandle } from '@/components/WtftiShareImageGenerator';
import { UniverseResultBar } from '@/components/UniverseResultBar';
import { WtfCardCTA } from '@/components/WtfCardCTA';
import { UgcShareCTA } from '@/components/UgcShareCTA';
import { IdentifyViralCTA } from '@/components/IdentifyViralCTA';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { DailyCheckInCTA } from '@/components/DailyCheckInCTA';

interface Props {
  wtftiPersonality: WtftiPersonality;
  dimensionScores: DimensionScore[];
}

export function WtftiResultContent({ wtftiPersonality: p, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<WtftiShareImageHandle>(null);

  const shareUrl = getSiteUrl(`/wtfti/result/${p.slug}/`);

  const copyShareText = useCallback(() => {
    const text = `WTF 我居然是${p.wtftiName}？？\n"${p.tagline}"\n来测测你的 WTF 人格 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [p.wtftiName, p.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `WTF 我居然是${p.wtftiName}？？`,
          text: p.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  }, [copyLink, p.wtftiName, p.tagline, shareUrl]);

  const typeImageUrl = getWtftiTypeImage(p.slug);
  const others = WTFTI_PERSONALITIES.filter(o => o.slug !== p.slug).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${p.color}12, transparent 70%)` }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Top actions */}
          <div className="absolute top-16 right-6 flex items-center gap-2">
            <button
              onClick={() => shareRef.current?.generate()}
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
              WTFTI · WTF {p.number}
            </div>

            {/* Character collectible figure */}
            <div
              className="w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: `${p.color}10` }}
            >
              <NextImage
                src={typeImageUrl}
                alt={p.wtftiName}
                width={280}
                height={280}
                className="w-[85%] h-[85%] object-contain drop-shadow-lg"
                priority
              />
            </div>

            {/* Code */}
            <div className="text-sm font-mono tracking-[0.3em] uppercase mb-2" style={{ color: p.color }}>
              {p.code}
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {p.wtftiName}
            </h1>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              "{p.tagline}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* WTF 一击 */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border bg-bg-elevated p-6 sm:p-8 shadow-sm"
          style={{ borderColor: `${p.color}30` }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            🎯 WTF 一击
          </h2>
          <p className="text-xl font-medium text-accent leading-relaxed">
            "{p.copy.wtfHit}"
          </p>
        </motion.div>
      </section>

      {/* 操作系统翻译 */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            🧬 OS 翻译：你的操作系统
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base whitespace-pre-line">
            {p.copy.osTranslation}
          </p>
        </motion.div>
      </section>

      {/* 隐藏症状清单 */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            📋 隐藏症状清单
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
          <div className="mt-5 pt-4 border-t border-border-subtle text-center">
            <Link
              href={`/wtfti/symptoms/${p.slug}/`}
              prefetch={false}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:brightness-110"
              style={{ color: p.color }}
            >
              发给朋友打勾 — 看 ta 中了几枪 →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 收口 */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-6"
        >
          <p className="text-text-muted text-base leading-relaxed italic">
            {p.copy.closer}
          </p>
        </motion.div>
      </section>

      {/* Share & Actions */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <div
          className="rounded-2xl border p-6 sm:p-8 text-center"
          style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}
        >
          <div className="text-3xl mb-3">🤯</div>
          <h3 className="text-lg font-semibold mb-2">分享你的 WTF 人格</h3>
          <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
            把结果发给朋友，看看谁更 WTF
          </p>

          {/* Share image generator */}
          <div className="max-w-sm mx-auto mb-4">
            <WtftiShareImageGenerator
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
        <UniverseResultBar slug={p.slug} current="wtfti" />
      </section>

      {/* Other types */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <h3 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
          其他 WTF 人格
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {others.map(o => (
            <Link
              key={o.slug}
              href={`/wtfti/result/${o.slug}/`}
              className="group rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-sm hover:shadow-md hover:border-border transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: `${o.color}10` }}>
                  <NextImage
                    src={getWtftiTypeThumbnailImage(o.slug)}
                    alt={o.wtftiName}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-text-primary truncate">{o.wtftiName}</div>
                  <div className="text-xs text-text-muted font-mono">{o.number} · {o.code}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Retest CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/wtfti/test/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-base hover:bg-accent/90 transition-all"
          >
            重新测试
          </Link>
          <Link
            href="/wtfti/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border-subtle text-text-muted text-sm hover:text-text-secondary hover:border-border transition-all"
          >
            返回 WTFTI 首页
          </Link>
        </div>
      </section>

      <DailyCheckInCTA />
      <UniversePreviewCards currentUniverse="wtfti" />
      <IdentifyViralCTA personalityName={p.wtftiName} />
      <WtfCardCTA />
      <UgcShareCTA />
    </div>
  );
}
