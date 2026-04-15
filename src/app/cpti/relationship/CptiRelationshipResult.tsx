'use client';

import { useSyncExternalStore, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import type { CptiRelationshipType } from '@/lib/cpti/relationships';
import {
  RELATIONSHIP_TIER_INFO,
  CPTI_RELATIONSHIP_TYPES,
  getCptiRelationshipTypeImage,
  getCptiRelationshipTypeThumbnailImage,
} from '@/lib/cpti/relationships';
import type { DimensionPair } from '@/lib/cpti/relationship-matching';
import { CPTI_DIMENSIONS, CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { getCptiPersonalityBySlug, getCptiTypeImage, getCptiTypeThumbnailImage } from '@/lib/cpti/personalities';
import { getSiteUrl } from '@/lib/site';
import { encodeRelationshipLink, decodeRelationshipLink } from '@/lib/cpti/cpti-relationship-link';
import { CptiRelationshipShareImageGenerator } from '@/components/CptiRelationshipShareImageGenerator';
import type { CptiRelationshipShareImageGeneratorHandle } from '@/components/CptiRelationshipShareImageGenerator';
import { ClaimAssetCard } from '@/components/ClaimAssetCard';

const emptySubscribe = () => () => {};

interface StoredRelationshipData {
  relationship: CptiRelationshipType;
  pairs: DimensionPair[];
  compatibility: number;
  nicknameA: string;
  personalitySlugA: string;
  personalitySlugB: string;
  dimsA: CptiDimensionScore[];
  dimsB: CptiDimensionScore[];
}

interface BackendRelationshipData {
  relationship: {
    id: string;
    slug: string;
    tier: string;
    compatibility: number;
  };
  participantProfile?: {
    personality: {
      slug: string;
    };
    dimensions: CptiDimensionScore[];
  };
  collectionProgress?: {
    collected: number;
    total: number;
  };
}

function levelNum(l: string): number {
  return l === 'H' ? 3 : l === 'M' ? 2 : 1;
}

function getCptiPersonalityImageSrc(slug: string, mode: 'full' | 'thumb' | 'emoji'): string {
  if (mode === 'emoji') return '';
  return mode === 'full' ? getCptiTypeImage(slug) : getCptiTypeThumbnailImage(slug);
}

export function CptiRelationshipResult() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [returnLinkCopied, setReturnLinkCopied] = useState(false);
  const [relImageMode, setRelImageMode] = useState<'full' | 'thumb' | 'emoji'>('full');
  const [aImageMode, setAImageMode] = useState<'full' | 'thumb' | 'emoji'>('thumb');
  const [bImageMode, setBImageMode] = useState<'full' | 'thumb' | 'emoji'>('thumb');
  const shareRef = useRef<CptiRelationshipShareImageGeneratorHandle>(null);

  const { data, backendData, fromLink } = useMemo(() => {
    if (!mounted) {
      return {
        data: null as StoredRelationshipData | null,
        backendData: null as BackendRelationshipData | null,
        fromLink: false,
      };
    }

    const rParam = searchParams.get('r');
    if (rParam) {
      const decoded = decodeRelationshipLink(rParam);
      if (decoded) {
        const rel = CPTI_RELATIONSHIP_TYPES.find(r => r.slug === decoded.relationshipSlug);
        if (rel) {
          return {
            data: {
              relationship: rel,
              pairs: [],
              compatibility: decoded.compatibility,
              nicknameA: decoded.nicknameA,
              personalitySlugA: decoded.personalitySlugA,
              personalitySlugB: decoded.personalitySlugB,
              dimsA: [],
              dimsB: [],
            },
            backendData: null,
            fromLink: true,
          };
        }
      }
    }

    try {
      const raw = sessionStorage.getItem('cpti-relationship');
      if (raw) {
        const nextData = JSON.parse(raw) as StoredRelationshipData;
        let nextBackendData: BackendRelationshipData | null = null;

        try {
          const backendRaw = sessionStorage.getItem('cpti-relationship-backend');
          if (backendRaw) {
            nextBackendData = JSON.parse(backendRaw) as BackendRelationshipData;
          }
        } catch {
          nextBackendData = null;
        }

        return {
          data: nextData,
          backendData: nextBackendData,
          fromLink: false,
        };
      }
    } catch {
      // ignore storage failures
    }

    const typeParam = searchParams.get('type');
    if (typeParam) {
      const rel = CPTI_RELATIONSHIP_TYPES.find(r => r.slug === typeParam);
      if (rel) {
        return {
          data: {
            relationship: rel,
            pairs: [],
            compatibility: 0,
            nicknameA: '',
            personalitySlugA: '',
            personalitySlugB: '',
            dimsA: [],
            dimsB: [],
          },
          backendData: null,
          fromLink: true,
        };
      }
    }

    return {
      data: null,
      backendData: null,
      fromLink: false,
    };
  }, [mounted, searchParams]);

  const shareUrl = getSiteUrl('/cpti/');

  const getReturnLink = useCallback(() => {
    if (!data) return '';
    return getSiteUrl(`/cpti/relationship/?r=${encodeRelationshipLink({
      relationshipSlug: data.relationship.slug,
      compatibility: data.compatibility,
      personalitySlugA: data.personalitySlugA,
      personalitySlugB: data.personalitySlugB,
      nicknameA: data.nicknameA || '朋友',
      nicknameB: '你',
    })}`);
  }, [data]);

  const copyReturnLink = useCallback(() => {
    const link = getReturnLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setReturnLinkCopied(true);
    setTimeout(() => setReturnLinkCopied(false), 2000);
  }, [getReturnLink]);

  const copyShareText = useCallback(() => {
    if (!data) return;
    const text = `我们的CP关系类型是「${data.relationship.name}」${data.relationship.emoji}\n${data.relationship.tagline}\n来测测你们的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [data, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold mb-2">没有找到关系数据</h1>
          <p className="text-text-muted text-sm mb-6">请先完成CPTI配对测试。</p>
          <Link
            href="/cpti/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all"
          >
            开始测试
          </Link>
        </div>
      </div>
    );
  }

  const { relationship, pairs, compatibility, nicknameA, personalitySlugA, personalitySlugB } = data;
  const personalityA = getCptiPersonalityBySlug(personalitySlugA);
  const personalityB = getCptiPersonalityBySlug(personalitySlugB);
  const tierInfo = RELATIONSHIP_TIER_INFO[relationship.tier];

  const relationshipImageSrc =
    relImageMode === 'emoji'
      ? ''
      : relImageMode === 'full'
        ? getCptiRelationshipTypeImage(relationship.slug)
        : getCptiRelationshipTypeThumbnailImage(relationship.slug);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${relationship.color}15, transparent 65%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-14 pb-10 text-center relative">
          {/* Share button */}
          <button
            onClick={() => shareRef.current?.generate()}
            className="absolute top-14 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-rose-400 transition-all cursor-pointer"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-5">
              CP关系鉴定结果
            </div>

            {/* Relationship card image */}
            {relImageMode === 'emoji' ? (
              <div
                className="w-56 h-72 sm:w-64 sm:h-80 mx-auto mb-6 rounded-2xl flex items-center justify-center text-7xl sm:text-8xl shadow-sm"
                style={{ background: `${relationship.color}15` }}
              >
                {relationship.emoji}
              </div>
            ) : (
              <div
                className="relative w-56 h-72 sm:w-64 sm:h-80 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg"
                style={{
                  background: `${relationship.color}10`,
                  boxShadow: `0 16px 48px -12px ${relationship.color}25`,
                }}
              >
                <NextImage
                  src={relationshipImageSrc}
                  alt={relationship.name}
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-contain p-1"
                  priority
                  onError={() =>
                    setRelImageMode(m => {
                      if (m === 'full') return 'thumb';
                      if (m === 'thumb') return 'emoji';
                      return m;
                    })
                  }
                />
              </div>
            )}

            {/* Dual portrait */}
            <div className="flex items-center justify-center gap-4 mb-5">
              {personalityA && (
                <div className="text-center">
                  {aImageMode === 'emoji' ? (
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl mx-auto"
                      style={{ background: `${personalityA.color}15` }}
                    >
                      {personalityA.emoji}
                    </div>
                  ) : (
                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mx-auto"
                      style={{ background: `${personalityA.color}10` }}
                    >
                      <NextImage
                        src={getCptiPersonalityImageSrc(personalitySlugA, aImageMode)}
                        alt={personalityA.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        onError={() =>
                          setAImageMode(m => {
                            if (m === 'full') return 'thumb';
                            if (m === 'thumb') return 'emoji';
                            return m;
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="text-xs text-text-muted mt-1.5">{nicknameA || 'A'}</div>
                  <div className="text-[10px] font-mono" style={{ color: personalityA.color }}>{personalityA.code}</div>
                </div>
              )}

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: `${relationship.color}12`, color: relationship.color }}
              >
                ×
              </div>

              {personalityB && (
                <div className="text-center">
                  {bImageMode === 'emoji' ? (
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl mx-auto"
                      style={{ background: `${personalityB.color}15` }}
                    >
                      {personalityB.emoji}
                    </div>
                  ) : (
                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mx-auto"
                      style={{ background: `${personalityB.color}10` }}
                    >
                      <NextImage
                        src={getCptiPersonalityImageSrc(personalitySlugB, bImageMode)}
                        alt={personalityB.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        onError={() =>
                          setBImageMode(m => {
                            if (m === 'full') return 'thumb';
                            if (m === 'thumb') return 'emoji';
                            return m;
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="text-xs text-text-muted mt-1.5">你</div>
                  <div className="text-[10px] font-mono" style={{ color: personalityB.color }}>{personalityB.code}</div>
                </div>
              )}
            </div>

            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: relationship.color }}
            >
              {relationship.code}
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              {relationship.name}
            </h1>

            {/* Tier badge + compatibility */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ color: tierInfo.color, background: tierInfo.bgColor, borderColor: `${tierInfo.color}30` }}
              >
                {tierInfo.label}
              </span>
              {compatibility > 0 && (
                <span className="text-xs text-text-muted">
                  契合度 {compatibility}%
                </span>
              )}
            </div>

            <p className="text-lg text-text-secondary max-w-md mx-auto">
              {relationship.tagline}
            </p>

            {/* Backend sync badge + collection progress */}
            {backendData && !fromLink && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/5 text-emerald-500">
                  ✓ 已同步到双方图鉴
                </span>
                {backendData.collectionProgress != null && (
                  <span className="text-xs text-text-muted">
                    已收集 {backendData.collectionProgress.collected}/{backendData.collectionProgress.total} 种关系
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            关系速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {relationship.description}
          </p>
        </motion.div>
      </section>

      {backendData && !fromLink && (
        <section className="max-w-2xl mx-auto px-6 pb-14">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <ClaimAssetCard
              variant="relationship"
              payload={{
                relationshipId: backendData.relationship.id,
                currentPersonalitySlug: backendData.participantProfile?.personality.slug,
                currentDimensionScores: backendData.participantProfile?.dimensions,
                currentSource: 'pair_flow',
              }}
            />
          </motion.div>
        </section>
      )}

      {/* Dimension comparison (only available from session, not from link) */}
      {!fromLink && pairs.length > 0 && (
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            五维对比
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-6">
            {pairs.map(pair => {
              const dim = CPTI_DIMENSIONS.find(d => d.id === pair.id);
              if (!dim) return null;
              const color = CPTI_MODEL_COLORS[dim.model];
              const pctA = ((levelNum(pair.levelA) - 1) / 2) * 100;
              const pctB = ((levelNum(pair.levelB) - 1) / 2) * 100;

              return (
                <div key={pair.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{pair.id}</span>
                      <span className="text-sm text-text-primary">{CPTI_MODEL_NAMES[dim.model]}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      {pair.levelA} vs {pair.levelB}
                    </span>
                  </div>

                  {/* A bar */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-muted w-6">{nicknameA?.[0] || 'A'}</span>
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full opacity-70"
                        style={{ background: color.base }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pctA, 5)}%` }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {/* B bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-6">你</span>
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color.light }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pctB, 5)}%` }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {pair.pattern === 'both-high' && (
                    <p className="text-xs text-emerald-400 mt-1.5">✦ 双高 — 你们在这个维度上都很强</p>
                  )}
                  {pair.pattern === 'both-low' && (
                    <p className="text-xs text-text-muted mt-1.5">双低 — 你们在这个维度上都偏弱</p>
                  )}
                  {pair.pattern === 'gap' && (
                    <p className="text-xs text-amber-400 mt-1.5">⚡ 大差异 — 这个维度上你们截然不同</p>
                  )}
                  {pair.pattern === 'complement' && (
                    <p className="text-xs text-sky-400 mt-1.5">互补 — 你们在这个维度上恰好互补</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>
      )}

      {/* Return link — let the other person see this result */}
      {!fromLink && (
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6 text-center">
            <div className="text-2xl mb-2">💌</div>
            <p className="text-sm text-text-secondary mb-3">
              把结果发给{nicknameA || 'ta'}，让ta也能看到你们的关系类型
            </p>
            <button
              onClick={copyReturnLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-500/30 text-sm text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
            >
              {returnLinkCopied ? '已复制回传链接 ✓' : '📋 复制回传链接'}
            </button>
          </div>
        </motion.div>
      </section>
      )}

      {/* Share */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            分享你们的关系鉴定
          </h2>

          <div className="space-y-3">
            <CptiRelationshipShareImageGenerator
              ref={shareRef}
              relationship={relationship}
              nicknameA={nicknameA}
              nicknameB="你"
            />

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

      {/* CTA back to CPTI */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="text-center">
          <Link
            href="/cpti/"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 返回CPTI首页
          </Link>
        </div>
      </section>
    </div>
  );
}
