'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { CptiShareImageGenerator } from '@/components/CptiShareImageGenerator';
import type { CptiShareImageGeneratorHandle } from '@/components/CptiShareImageGenerator';
import { CPTI_DIMENSIONS, CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import {
  CPTI_PERSONALITY_TYPES,
  getCptiRarity,
  getCptiTypeImage,
  getCptiTypeThumbnailImage,
} from '@/lib/cpti/personalities';
import type { CptiPersonalityType } from '@/lib/cpti/personalities';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { useCallback, useRef, useState } from 'react';
import { getSiteUrl } from '@/lib/site';
import { trackCptiEvent } from '@/lib/cpti/analytics';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { loadCptiProfile } from '@/lib/cpti/cpti-profile';
import { encodeCptiInvite } from '@/lib/cpti/cpti-invite';
import { cptiApi } from '@/lib/cpti/cpti-api';
import { ClaimAssetCard } from '@/components/ClaimAssetCard';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';

interface Props {
  personality: CptiPersonalityType;
  dimensionScores: CptiDimensionScore[];
}

export function CptiResultContent({ personality, dimensionScores }: Props) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [heroImageMode, setHeroImageMode] = useState<'thumb' | 'full' | 'emoji'>('thumb');
  const [otherImageModes, setOtherImageModes] = useState<Record<string, 'thumb' | 'full' | 'emoji'>>({});
  const shareRef = useRef<CptiShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/cpti/result/${personality.slug}/`);
  const heroImageSrc = heroImageMode === 'full'
    ? getCptiTypeImage(personality.slug)
    : getCptiTypeThumbnailImage(personality.slug);

  const copyShareText = useCallback(() => {
    const text = `我在关系里的CP角色是 ${personality.code}（${personality.name}）\n${personality.tagline}\n来测测你的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [personality.code, personality.name, personality.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackCptiEvent('cpti_pair_code_copied', { personality: personality.slug, method: 'link' });
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, personality.slug]);

  const quickShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的CP角色是 ${personality.code}（${personality.name}）`,
          text: personality.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    copyLink();
  }, [copyLink, personality.code, personality.name, personality.tagline, shareUrl]);

  const others = CPTI_PERSONALITY_TYPES.filter(p => p.slug !== personality.slug).slice(0, 3);
  const rarity = getCptiRarity(personality.slug);

  const handleHeroImageError = useCallback(() => {
    setHeroImageMode((current) => {
      if (current === 'thumb') return 'full';
      if (current === 'full') return 'emoji';
      return current;
    });
  }, []);

  const getOtherTypeImageSrc = (slug: string) => {
    const mode = otherImageModes[slug] ?? 'thumb';
    return mode === 'full' ? getCptiTypeImage(slug) : getCptiTypeThumbnailImage(slug);
  };

  const handleOtherTypeImageError = useCallback((slug: string) => {
    setOtherImageModes((current) => {
      const mode = current[slug] ?? 'thumb';
      if (mode === 'emoji') return current;
      return {
        ...current,
        [slug]: mode === 'thumb' ? 'full' : 'emoji',
      };
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${personality.color}12, transparent 70%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          {/* Top-right share button */}
          <button
            onClick={() => shareRef.current?.generate()}
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-rose-400 transition-all cursor-pointer"
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
              CP角色鉴定结果
            </div>

            {/* Hero image */}
            {heroImageMode === 'emoji' ? (
              <div
                className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] flex items-center justify-center text-9xl"
                style={{
                  background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
                  boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
                }}
              >
                {personality.emoji}
              </div>
            ) : (
              <div
                className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
                  boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
                }}
              >
                <NextImage
                  src={heroImageSrc}
                  alt={personality.name}
                  fill
                  sizes="(max-width: 768px) 256px, 384px"
                  className="object-contain drop-shadow-2xl w-[88%] h-[88%]"
                  priority
                  onError={handleHeroImageError}
                />
              </div>
            )}

            {/* Code */}
            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: personality.color }}
            >
              {personality.code}
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {personality.name}
            </h1>

            {/* Rarity + population badge */}
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
                仅 {rarity.populationPct}% 的测试者是此角色
              </span>
            </div>

            {/* Tagline */}
            <p className="text-xl text-text-secondary max-w-md mx-auto">
              {personality.tagline}
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
            角色速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {personality.description}
          </p>
        </motion.div>
      </section>

      {/* Dimension Bars */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            {personality.code} 的五维画像
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-5">
            {dimensionScores.map(ds => {
              const dim = CPTI_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = CPTI_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{CPTI_MODEL_NAMES[dim.model]}</span>
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

      <CrossTestRecommendations currentTest="cpti" personalityName={personality.name} />

      {/* Claim Asset Card */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <ClaimAssetCard
            variant="result"
            payload={{
              personalitySlug: personality.slug,
              dimensionScores,
              source: 'self_test',
            }}
            onClaim={() => {
              trackCptiEvent('cpti_profile_saved', {
                personality: personality.slug,
                claimedVia: 'result_page',
              });
            }}
            onIdleSecondaryAction={quickShare}
          />
        </motion.div>
      </section>

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            发给ta看看你是什么角色
          </h2>

          <div className="space-y-3">
            <CptiShareImageGenerator ref={shareRef} personality={personality} dimensionScores={dimensionScores} />

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
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
                className="flex-1 py-3 rounded-xl border border-rose-500/30 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                快速分享
              </button>
              <Link
                href="/cpti/test"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
              >
                重新测试
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Invite & Stealth CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <InviteAndStealthCTA personality={personality} />
        </motion.div>
      </section>

      {/* Leaderboard link */}
      <div className="max-w-2xl mx-auto px-6 pb-10 text-center">
        <Link
          href="/cpti/leaderboard"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors"
        >
          🏆 查看关系图鉴排行榜 →
        </Link>
      </div>

      {/* Other types */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
          还可以看看其他CP角色
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map(p => (
            <Link
              key={p.slug}
              href={`/cpti/result/${p.slug}`}
              className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4"
            >
              {(otherImageModes[p.slug] ?? 'thumb') === 'emoji' ? (
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl mb-3"
                  style={{ background: `${p.color}15` }}
                >
                  {p.emoji}
                </div>
              ) : (
                <div
                  className="relative w-24 h-24 rounded-lg overflow-hidden mb-3"
                  style={{ background: `${p.color}10` }}
                >
                  <NextImage
                    src={getOtherTypeImageSrc(p.slug)}
                    alt={p.name}
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                    onError={() => handleOtherTypeImageError(p.slug)}
                  />
                </div>
              )}
              <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                {p.code}
              </span>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <UniversePreviewCards currentUniverse="cpti" />
    </div>
  );
}

/* ── Invite + Stealth CTA component ── */
function InviteAndStealthCTA({ personality }: { personality: CptiPersonalityType }) {
  const [nickname, setNickname] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [pairCode, setPairCode] = useState('');
  const [pairCodeCopied, setPairCodeCopied] = useState(false);
  const [pairCodeLinkCopied, setPairCodeLinkCopied] = useState(false);
  const [isGeneratingPairCode, setIsGeneratingPairCode] = useState(false);

  const generateInviteLink = useCallback(() => {
    const profile = loadCptiProfile();
    if (!profile) return;
    const code = encodeCptiInvite({
      nickname: nickname.trim() || '朋友',
      dimensions: profile.dimensions,
      personalitySlug: profile.slug,
    });
    setInviteLink(getSiteUrl(`/cpti/invite/?code=${code}`));
  }, [nickname]);

  const copyInviteLink = useCallback(() => {
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }, [inviteLink]);

  const shareInviteLink = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '来测测我们是什么CP关系！',
          text: `我是${personality.code}（${personality.name}），来测测我们是什么关系吧 💕`,
          url: inviteLink,
        });
        return;
      } catch { /* cancelled */ }
    }
    copyInviteLink();
  }, [inviteLink, copyInviteLink, personality.code, personality.name]);

  const generatePairCode = useCallback(async () => {
    if (isGeneratingPairCode) return;
    setIsGeneratingPairCode(true);
    try {
      const profile = loadCptiProfile();
      await cptiApi.bootstrap();
      const result = await cptiApi.createPairCode({
        mode: 'direct',
        personalitySlug: profile?.slug,
        dimensionScores: profile?.dimensions,
        source: 'self_test',
      });
      setPairCode(result.code);
    } catch (err) {
      console.warn('[CPTI] Failed to generate pair code:', err);
    } finally {
      setIsGeneratingPairCode(false);
    }
  }, [isGeneratingPairCode]);

  const copyPairCode = useCallback(() => {
    navigator.clipboard.writeText(pairCode);
    setPairCodeCopied(true);
    setTimeout(() => setPairCodeCopied(false), 2000);
  }, [pairCode]);

  const pairCodeLink = pairCode ? getSiteUrl(`/cpti/invite/?pairCode=${pairCode}`) : '';

  const copyPairCodeLink = useCallback(() => {
    navigator.clipboard.writeText(pairCodeLink);
    setPairCodeLinkCopied(true);
    setTimeout(() => setPairCodeLinkCopied(false), 2000);
  }, [pairCodeLink]);

  return (
    <div className="space-y-3">
      {/* Invite CTA */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8 text-center">
        <div className="text-3xl mb-3">💌</div>
        <h3 className="text-lg font-semibold mb-2">想知道你们是什么关系？</h3>
        <p className="text-sm text-text-muted mb-4">
          邀请ta也来测一份，系统会自动匹配你们的CP关系类型
          <br />
          25种关系图鉴等你解锁
        </p>

        {!showInvitePanel ? (
          <button
            onClick={() => setShowInvitePanel(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-all cursor-pointer"
          >
            生成邀请链接
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        ) : !inviteLink ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <input
              type="text"
              placeholder="输入你的昵称（对方会看到）"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-500/40 transition-colors"
            />
            <button
              onClick={generateInviteLink}
              className="w-full py-3 rounded-xl bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-all cursor-pointer"
            >
              生成邀请链接
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-border-subtle bg-bg-elevated p-3">
              <div className="text-xs text-text-muted text-left mb-1">邀请链接</div>
              <div className="text-xs text-text-secondary break-all text-left font-mono leading-relaxed">
                {inviteLink}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyInviteLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
              >
                {inviteCopied ? '已复制 ✓' : '📋 复制链接'}
              </button>
              <button
                onClick={shareInviteLink}
                className="flex-1 py-3 rounded-xl border border-rose-500/30 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                分享给ta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pair Code CTA */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8 text-center">
        <div className="text-3xl mb-3">🔗</div>
        <h3 className="text-lg font-semibold mb-2">快速配对码</h3>
        <p className="text-sm text-text-muted mb-4">
          生成一个6位配对码，让对方直接输入配对
          <br />
          无需发送链接，更方便快捷
        </p>

        {!pairCode ? (
          <button
            onClick={generatePairCode}
            disabled={isGeneratingPairCode}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingPairCode ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                生成配对码
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-mono font-bold tracking-[0.3em] text-amber-500">
                {pairCode}
              </span>
            </div>
            <p className="text-xs text-text-muted">把这个配对码发给对方</p>
            <button
              onClick={copyPairCode}
              className="w-full py-3 rounded-xl border border-amber-500/30 text-sm text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
            >
              {pairCodeCopied ? '已复制 ✓' : '📋 复制配对码'}
            </button>
            <div className="rounded-xl border border-border-subtle bg-bg-elevated p-3">
              <div className="text-xs text-text-muted text-left mb-1">配对链接</div>
              <div className="text-xs text-text-secondary break-all text-left font-mono leading-relaxed">
                {pairCodeLink}
              </div>
            </div>
            <button
              onClick={copyPairCodeLink}
              className="w-full py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
            >
              {pairCodeLinkCopied ? '已复制 ✓' : '📋 复制配对链接'}
            </button>
          </div>
        )}
      </div>

      {/* Stealth CTA */}
      <Link
        href="/cpti/stealth"
        className="block rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6 text-center hover:bg-purple-500/10 transition-all group"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">🔮</span>
          <div className="text-left">
            <div className="text-base font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
              偷偷测CP感
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              不用发链接，根据你对TA的了解来测试你们的默契
            </div>
          </div>
          <svg className="w-5 h-5 text-text-muted group-hover:text-purple-400 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
