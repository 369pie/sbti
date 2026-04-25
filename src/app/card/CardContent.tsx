'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ASSET_SYNC_EVENT, type AssetSummary, type AssetSyncEventDetail } from '@/lib/assets/asset-contract';
import { getApiPath, readApiJson } from '@/lib/api';
import { hasBrowserSupabaseSession } from '@/lib/supabase/client';
import type { SoultiLayeredResult } from '@/lib/soulti/scoring';
import { getCollectionCount } from '@/lib/mysti/collection';
import {
  getOrCreateCard, saveCard, loadCard, decodeCardData,
  encodeCardData, getLitCount, getTotalCount,
  calculateSimilarity, getComparisonRoast,
  togglePinnedUniverse,
  CARD_UNIVERSE_IDS,
  type WtfCardData,
  type RelationshipRecord,
} from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';
import { SHARE_SITE_URL } from '@/lib/site';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
const WtfCardShareImageGenerator = dynamic(
  () => import('@/components/WtfCardShareImageGenerator').then((m) => m.WtfCardShareImageGenerator),
  { ssr: false },
);
import type { WtfCardShareImageGeneratorHandle } from '@/components/WtfCardShareImageGenerator';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';
import { IdentifyHistoryPanel } from '@/components/IdentifyHistoryPanel';
import {
  CPTI_RELATIONSHIP_TYPES,
  RELATIONSHIP_TIER_INFO,
  type CptiRelationshipType,
} from '@/lib/cpti/relationships';
import { cptiApi } from '@/lib/cpti/cpti-api';
import { getGachaRarityStyle } from '@/lib/gacha';
import { PersonaShardOrb } from '@/components/PersonaShardOrb';
import { useShardState, recordCardVisit } from '@/lib/persona-shard';

interface CardAssetsResponse {
  assets?: {
    'wtf-card'?: WtfCardData | null;
  };
  summary?: {
    wtfCard?: AssetSummary['wtfCard'];
  };
}

function compactMark(value: string | undefined, fallback: string) {
  const source = (value || fallback).replace(/[^\dA-Za-z\u4e00-\u9fa5]/g, '');
  return (source.slice(0, 3) || fallback.slice(0, 2) || 'TI').toUpperCase();
}

function ArrowIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function CodeMark({
  code,
  label,
  color,
  className = 'h-11 w-11',
}: {
  code?: string;
  label: string;
  color?: string;
  className?: string;
}) {
  return (
    <span className={`site-code-mark ${className}`} style={color ? { color } : undefined}>
      {compactMark(code, label)}
    </span>
  );
}

// Deterministic per-slug rarity — same hash as gacha.slugRarity so badges
// match anywhere (E-07 per-card rarity badge).
function cardRarity(slug: string): 'S' | 'A' | 'B' | 'C' | 'D' {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff;
  const bucket = Math.abs(hash) % 100;
  if (bucket < 1) return 'S';
  if (bucket < 5) return 'A';
  if (bucket < 20) return 'B';
  if (bucket < 55) return 'C';
  return 'D';
}

// ─── Badge component ─────────────────────────────────────

// ─── Shard preview row (added 2026-04-17) ───────────────────────────────────

function ShardPreviewRow({ card }: { card: WtfCardData }) {
  let firstLit: { uid: string; slug: string } | null = null;
  for (const uid of CARD_UNIVERSE_IDS) {
    const r = card.results[uid];
    if (r?.slug) {
      firstLit = { uid, slug: r.slug };
      break;
    }
  }

  useEffect(() => {
    recordCardVisit();
  }, []);

  if (!firstLit) return null;
  return <ShardPreviewInner uid={firstLit.uid} slug={firstLit.slug} />;
}

function ShardPreviewInner({ uid, slug }: { uid: string; slug: string }) {
  const universe = getUniverse(uid);
  const resolved = resolvePersonality(uid, slug);
  const accent = universe?.accent ?? '#888';
  const symbol = compactMark(slug, universe?.shortName ?? 'TI');
  const shardState = useShardState(uid, slug);

  if (!universe) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mb-6 rounded-3xl border border-border-subtle bg-bg-secondary/30 px-5 py-6"
    >
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="shrink-0">
          <PersonaShardOrb state={shardState} accent={accent} symbol={symbol} size={120} showLineInitially={false} />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-text-muted mb-1">
            Persona Shard · {universe.shortName}
          </p>
          <p className="text-sm font-semibold mb-1" style={{ color: accent }}>
            {resolved?.name ?? slug}
          </p>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            你的多宇宙人格开始有生命了——每枚碎片会根据你的行为改变心绪、苏醒、共鸣。
          </p>
          <Link
            href={`/card/shard/?universe=${encodeURIComponent(uid)}&slug=${encodeURIComponent(slug)}`}
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: accent }}
          >
            进入碎片档案
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function UniverseBadge({
  universeId,
  slug,
  delay,
  isPinned,
  onTogglePin,
}: {
  universeId: string;
  slug: string | null;
  delay: number;
  isPinned?: boolean;
  onTogglePin?: (uid: string) => void;
}) {
  const universe = getUniverse(universeId);
  if (!universe) return null;

  const resolved = slug ? resolvePersonality(universeId, slug) : null;
  const isLit = !!resolved;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="relative"
    >
      {isLit ? (
        <Link
          href={`${universe.resultPrefix}/result/${slug}/`}
          className={`group block rounded-2xl border p-3 text-center transition hover:shadow-sm ${
            isPinned
              ? 'border-accent/40 bg-accent-dim ring-1 ring-accent/20'
              : 'border-border-subtle bg-bg-elevated hover:border-border'
          }`}
        >
          {isPinned && (
            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[8px] font-mono tracking-[0.12em] text-bg-primary">
              PIN
            </span>
          )}
          <CodeMark code={slug ?? universe.shortName} label={resolved.name} color={universe.accent} className="mx-auto mb-2 h-10 w-10 text-[10px]" />
          <div className="text-[10px] font-mono tracking-wider text-text-muted">
            {universe.shortName}
          </div>
          <div className="text-xs font-medium text-text-primary mt-0.5 leading-tight">
            {resolved.name}
          </div>
          {/* Per-card rarity badge (E-07) */}
          {slug && (() => {
            const rarity = cardRarity(slug);
            const style = getGachaRarityStyle(rarity);
            return (
              <span
                className="absolute top-1.5 right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                style={{ color: style.color, background: style.glow, border: `1px solid ${style.color}40` }}
              >
                {rarity}
              </span>
            );
          })()}
        </Link>
      ) : (
        <Link
          href={universe.testPath}
          className="group block rounded-2xl border border-dashed p-3 text-center transition hover:scale-[1.03]"
          style={{
            borderColor: `${universe.accent}30`,
            background: `linear-gradient(145deg, ${universe.accent}08, ${universe.accent}04)`,
          }}
        >
          <div
            className="text-3xl mb-1 transition-opacity"
            style={{
              opacity: 0.6,
              animation: `slot-breathe 3s ease-in-out infinite`,
              animationDelay: `${delay * 400}ms`,
            }}
          >
            ?
          </div>
          <div className="text-[10px] font-mono tracking-wider" style={{ color: `${universe.accent}90` }}>
            {universe.shortName}
          </div>
          <div
            className="text-[11px] mt-0.5 font-medium transition-colors"
            style={{ color: `${universe.accent}99` }}
          >
            去解锁
          </div>
        </Link>
      )}
      {/* Pin button for lit badges */}
      {isLit && onTogglePin && (
        <button
          onClick={(e) => { e.preventDefault(); onTogglePin(universeId); }}
          className={`absolute -top-1 -left-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition cursor-pointer ${
            isPinned
              ? 'bg-accent text-bg-primary shadow-sm'
              : 'bg-bg-secondary border border-border-subtle text-text-muted hover:border-accent/40 hover:text-accent opacity-0 group-hover:opacity-100'
          }`}
          title={isPinned ? '取消置顶' : '置顶到展柜'}
        >
          {isPinned ? 'P' : '+'}
        </button>
      )}
    </motion.div>
  );
}

// ─── Progress ring ───────────────────────────────────────

function getProgressTitle(lit: number, total: number): { title: string; isMax: boolean } {
  if (lit >= total) return { title: '全宇宙觉醒者', isMax: true };
  if (lit >= Math.ceil(total * 0.8)) return { title: '宇宙旅行者', isMax: false };
  if (lit >= Math.ceil(total * 0.5)) return { title: '人格收藏家', isMax: false };
  if (lit >= Math.ceil(total * 0.25)) return { title: '多面探索者', isMax: false };
  return { title: '初入多元宇宙', isMax: false };
}

function ProgressRing({ lit, total }: { lit: number; total: number }) {
  const pct = total > 0 ? lit / total : 0;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const { title, isMax } = getProgressTitle(lit, total);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle
            cx="40" cy="40" r={r}
            fill="none" stroke="var(--color-border-subtle)" strokeWidth="6"
          />
          <motion.circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={isMax ? '#f59e0b' : 'var(--color-accent)'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        {isMax && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${isMax ? 'text-amber-500' : 'text-text-primary'}`}>{lit}</span>
          <span className="text-[10px] text-text-muted">/ {total}</span>
        </div>
      </div>
      <span className={`text-xs font-medium ${isMax ? 'text-amber-500' : 'text-text-secondary'}`}>
        {title}
      </span>
    </div>
  );
}

// ─── Comparison view ─────────────────────────────────────

function RelationshipCollection({
  relationships,
  syncedSlugs,
}: {
  relationships: RelationshipRecord[];
  syncedSlugs: Set<string>;
}) {
  const collectedSlugs = new Set(relationships.map(r => r.slug));
  const total = CPTI_RELATIONSHIP_TYPES.length;
  const collected = collectedSlugs.size;

  // Group all 25 types by tier
  const tiers: { key: 'viral' | 'deep' | 'rare'; types: CptiRelationshipType[] }[] = [
    { key: 'viral', types: CPTI_RELATIONSHIP_TYPES.filter(t => t.tier === 'viral') },
    { key: 'deep', types: CPTI_RELATIONSHIP_TYPES.filter(t => t.tier === 'deep') },
    { key: 'rare', types: CPTI_RELATIONSHIP_TYPES.filter(t => t.tier === 'rare') },
  ];

  // Find latest record for a given slug (for tooltip details)
  const latestFor = (slug: string) =>
    relationships.find(r => r.slug === slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <CodeMark code="CP" label="CP关系图鉴" color="var(--color-rose)" className="h-7 w-7 text-[9px]" />
          CP 关系图鉴
        </h3>
        <span className="text-xs font-mono text-text-muted">
          {collected} / {total}
        </span>
      </div>

      {collected === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-secondary/30 p-6 text-center">
          <CodeMark code="CP" label="CP关系" color="var(--color-rose)" className="mx-auto mb-3 h-12 w-12" />
          <p className="text-sm text-text-muted mb-3">
            还没有收集到任何CP关系类型
          </p>
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/cpti/"
              className="inline-flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-300 transition-colors"
            >
              去做CPTI测试 <ArrowIcon />
            </Link>
            <Link
              href="/cpti/gallery/"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-rose-400 transition-colors"
            >
              查看25种关系图鉴 <ArrowIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tiers.map(({ key, types }) => {
            const tierInfo = RELATIONSHIP_TIER_INFO[key];
            const tierCollected = types.filter(t => collectedSlugs.has(t.slug));
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: tierInfo.color }}
                  />
                  <span className="text-xs font-medium" style={{ color: tierInfo.color }}>
                    {tierInfo.label}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {tierCollected.length}/{types.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {types.map(relType => {
                    const isCollected = collectedSlugs.has(relType.slug);
                    const record = isCollected ? latestFor(relType.slug) : null;
                    return (
                      <div
                        key={relType.slug}
                        className={`relative group rounded-lg p-2 text-center transition ${
                          isCollected
                            ? 'bg-bg-elevated border border-border-subtle'
                            : 'bg-bg-secondary/40 border border-dashed border-border/50 opacity-50'
                        }`}
                        title={
                          isCollected && record
                            ? `${relType.name} · ${record.partnerNickname} · ${record.compatibility}%`
                            : relType.name
                        }
                      >
                        {isCollected ? (
                          <>
                            <span
                              className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                                syncedSlugs.has(relType.slug) ? 'bg-emerald-400' : 'bg-amber-400/60'
                              }`}
                              title={syncedSlugs.has(relType.slug) ? '已同步' : '仅本地'}
                            />
                            <CodeMark code={relType.code} label={relType.name} color={relType.color} className="mx-auto h-7 w-7 text-[8px]" />
                            <div className="text-[9px] mt-1 leading-tight truncate text-text-secondary">
                              {relType.name}
                            </div>
                          </>
                        ) : (
                          <Link
                            href="/cpti/join"
                            className="block hover:opacity-100 transition-opacity"
                          >
                            <CodeMark code={relType.code} label={relType.name} color={relType.color} className="mx-auto h-7 w-7 text-[8px] opacity-60" />
                            <div className="text-[9px] mt-1 leading-tight truncate text-text-muted">
                              {relType.name}
                            </div>
                            <div className="text-[8px] mt-0.5 text-rose-400/70 font-medium">
                              去配对
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {collected > 0 && collected < total && (
        <div className="mt-3 text-center">
          <Link
            href="/cpti/gallery/"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-rose-400 transition-colors"
          >
            查看完整图鉴 · 邀请更多人测试 <ArrowIcon className="h-3 w-3" />
          </Link>
        </div>
      )}

      {collected === total && (
        <div className="mt-3 text-center">
          <p className="text-xs text-rose-400 mb-1">已集齐全部 {total} 种 CP 关系类型</p>
          <Link
            href="/cpti/gallery/"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-rose-400 transition-colors"
          >
            查看完整图鉴 <ArrowIcon className="h-3 w-3" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// ─── Comparison view ─────────────────────────────────────

function ComparisonView({ myCard, theirCard }: { myCard: WtfCardData; theirCard: WtfCardData }) {
  const similarity = calculateSimilarity(myCard, theirCard);
  const roast = similarity != null ? getComparisonRoast(similarity) : null;
  const theirLit = getLitCount(theirCard);
  const myLit = getLitCount(myCard);

  // If the viewer has no tests yet, show a challenge-style CTA
  if (myLit === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border-2 border-accent/30 bg-gradient-to-b from-accent-dim to-transparent p-6 text-center"
      >
        <CodeMark code="VS" label="对比挑战" color="var(--color-accent)" className="mx-auto mb-3 h-12 w-12" />
        <p className="text-sm text-text-muted mb-1">
          {theirCard.nickname || '对方'} 已点亮 {theirLit} 个宇宙
        </p>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          来测测你们有多像？
        </h3>
        <p className="text-xs text-text-secondary mb-5">
          完成任意宇宙测试后，自动生成你的 WTF Card 并对比灵魂相似度
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/test/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-bg-primary font-medium text-sm transition hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, var(--color-rose), var(--color-rose-deep))',
              boxShadow: '0 4px 16px color-mix(in oklab, var(--color-rose-deep) 25%, transparent)',
            }}
          >
            开始经典测试 <ArrowIcon />
          </Link>
          <Link
            href="/wtfti/test/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary text-sm font-medium hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            毒舌版测试 <ArrowIcon />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-2xl border border-accent/20 bg-accent-dim p-5 text-center"
    >
      <p className="text-xs text-text-muted mb-1">
        {theirCard.nickname || '匿名'} 的卡片 · 已点亮 {theirLit} 个宇宙
      </p>
      {similarity != null ? (
        <>
          <div className="text-4xl font-bold text-accent mt-2">{similarity}%</div>
          <p className="text-sm text-text-secondary mt-1">灵魂相似度</p>
          {roast && (
            <p className="text-sm text-text-primary mt-3 italic">&ldquo;{roast}&rdquo;</p>
          )}
        </>
      ) : (
        <p className="text-sm text-text-secondary mt-2">
          你们还没有共同的测试结果，无法比较
        </p>
      )}
    </motion.div>
  );
}

// ─── Nickname editor ─────────────────────────────────────

function NicknameEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim().slice(0, 12);
    onChange(trimmed);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="inline-flex items-center gap-1.5 text-lg font-semibold text-text-primary hover:text-accent transition-colors"
      >
        {value || '点击设置昵称'}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-text-muted">
          <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); }}
        maxLength={12}
        placeholder="输入昵称"
        className="w-32 px-2 py-1 text-sm rounded-lg border border-border bg-bg-elevated focus:border-accent focus:outline-none"
      />
      <button
        onClick={save}
        className="text-xs px-2 py-1 rounded-lg bg-accent text-bg-primary hover:bg-accent/90 transition-colors"
      >
        确定
      </button>
    </div>
  );
}

// ─── Share button ────────────────────────────────────────

function ShareButton({ card, onShareImage }: { card: WtfCardData; onShareImage: () => void }) {
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);

  const shareUrl = `${SHARE_SITE_URL}card/?c=${encodeCardData(card)}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const copyChallenge = useCallback(async () => {
    const text = `我的 WTF Card 已点亮 ${getLitCount(card)}/${getTotalCount()} 个宇宙，来看看你和我有多像？\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 2000);
    } catch { /* ok */ }
  }, [card, shareUrl]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        <button
          onClick={onShareImage}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-accent text-bg-primary text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer"
        >
          生成分享卡片
        </button>
        <button
          onClick={copyLink}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-border text-text-secondary text-sm font-medium hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
        >
          {copied ? '✓ 已复制' : '复制链接'}
        </button>
      </div>
      <button
        onClick={copyChallenge}
        className="w-full py-3 rounded-xl border border-accent/20 bg-accent-dim text-sm text-accent hover:bg-accent/10 transition cursor-pointer"
      >
        {challengeCopied ? '已复制对比挑战文案' : '复制对比挑战文案，发给好友'}
      </button>
    </div>
  );
}

// ─── Main content ────────────────────────────────────────

// ─── Appraisal section (鉴定 tab) ─────────────────────────

function AppraisalSection() {
  const [soultiData, setSoultiData] = useState<SoultiLayeredResult | null>(null);
  const [collectionCount, setCollectionCount] = useState(0);
  const [identifyHistoryLoaded, setIdentifyHistoryLoaded] = useState(false);
  const [hasIdentifyHistory, setHasIdentifyHistory] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem('soulti-layered');
        if (raw) setSoultiData(JSON.parse(raw) as SoultiLayeredResult);
      } catch { /* ignore */ }

      setCollectionCount(getCollectionCount());
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const hasSoulti = !!soultiData;
  const hasMysti = collectionCount > 0;
  const showEmptyState = identifyHistoryLoaded && !hasIdentifyHistory && !hasSoulti && !hasMysti;

  if (showEmptyState) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-bg-secondary/30 p-8 text-center">
        <CodeMark code="ID" label="鉴定" color="var(--color-accent)" className="mx-auto mb-3 h-12 w-12 opacity-70" />
        <p className="text-sm text-text-muted mb-4">
          还没有任何鉴定结果
        </p>
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/identify/"
            className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            去鉴定一个朋友 <ArrowIcon />
          </Link>
          <Link
            href="/soulti/"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
          >
            做灵魂三镜测试 <ArrowIcon className="h-3 w-3" />
          </Link>
          <Link
            href="/mysti/"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
          >
            去灵鉴抽卡 <ArrowIcon className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IdentifyHistoryPanel
        variant="card"
        onLoaded={(hasAny) => {
          setIdentifyHistoryLoaded(true);
          setHasIdentifyHistory(hasAny);
        }}
      />

      {/* SoulTI three-layer summary */}
      {hasSoulti && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-bg-elevated p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <CodeMark code="SO" label="灵魂三镜" color="var(--color-accent)" className="h-7 w-7 text-[9px]" />
              灵魂三镜
            </h3>
            <Link
              href={`/soulti/result/${soultiData!.overall.slug}/`}
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              查看完整报告 <ArrowIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'daySelf', label: '白天', data: soultiData!.daySelf },
              { key: 'nightSelf', label: '深夜', data: soultiData!.nightSelf },
              { key: 'dreamTendency', label: '梦里', data: soultiData!.dreamTendency },
            ] as const).map(({ key, label, data }) => (
              <div
                key={key}
                className="rounded-xl bg-bg-secondary/60 p-3 text-center"
              >
                <p className="text-xs text-text-muted mb-1">{label}</p>
                <p className="text-sm font-mono font-semibold text-text-primary tracking-wider">
                  {data.code}
                </p>
              </div>
            ))}
          </div>
          {soultiData!.daySelf.slug !== soultiData!.nightSelf.slug && (
            <p className="text-xs text-text-muted mt-3 text-center italic">
              白天是 {soultiData!.daySelf.code}，深夜变成 {soultiData!.nightSelf.code}
            </p>
          )}
        </motion.div>
      )}

      {/* Mysti collection summary */}
      {hasMysti && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-bg-elevated p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <CodeMark code="MY" label="灵鉴图鉴" color="var(--color-accent)" className="h-7 w-7 text-[9px]" />
              灵鉴图鉴
            </h3>
            <Link
              href="/mysti/collection/"
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              查看全部 <ArrowIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-[width] duration-500"
                style={{ width: `${Math.min(100, (collectionCount / 70) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-text-muted whitespace-nowrap">
              {collectionCount} 张
            </span>
          </div>
          <Link
            href="/mysti/"
            className="mt-3 inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
          >
            继续抽卡 <ArrowIcon className="h-3 w-3" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────

export function CardContent() {
  const searchParams = useSearchParams();
  const theirEncoded = searchParams.get('c');
  const { isAuthenticated, displayName } = useAuth();

  const [card, setCard] = useState<WtfCardData | null>(null);
  const [backendSynced, setBackendSynced] = useState(false);
  const [remoteCardSummary, setRemoteCardSummary] = useState<AssetSummary['wtfCard'] | null>(null);
  const [syncedSlugs, setSyncedSlugs] = useState<Set<string>>(new Set());
  const [cardTab, setCardTab] = useState<'universe' | 'relationship' | 'appraisal'>('universe');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const hydrateLocalCard = useCallback(() => {
    const nextCard = getOrCreateCard();
    setCard(nextCard);
    setPinnedIds(nextCard.pinnedUniverses ?? []);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => hydrateLocalCard(), 0);
    return () => window.clearTimeout(t);
  }, [hydrateLocalCard]);

  useEffect(() => {
    const refreshCard = (event?: Event) => {
      const nextCard = loadCard();
      if (nextCard) {
        setCard(nextCard);
        setPinnedIds(nextCard.pinnedUniverses ?? []);
      } else {
        hydrateLocalCard();
      }

      const detail = event instanceof CustomEvent
        ? (event.detail as AssetSyncEventDetail | undefined)
        : undefined;
      if (detail?.summary?.wtfCard) {
        setRemoteCardSummary(detail.summary.wtfCard);
        setBackendSynced(true);
      }
    };

    window.addEventListener(ASSET_SYNC_EVENT, refreshCard);
    return () => window.removeEventListener(ASSET_SYNC_EVENT, refreshCard);
  }, [hydrateLocalCard]);

  // Sync auth nickname to WTF Card when logged in and card nickname is empty
  useEffect(() => {
    if (!isAuthenticated || !displayName || displayName === '旅行者') return;
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => {
      setCard(prev => {
        if (!prev || prev.nickname?.trim()) return prev;
        const updated = { ...prev, nickname: displayName };
        saveCard(updated);
        return updated;
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [isAuthenticated, displayName]);

  const shareRef = useRef<WtfCardShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef, WtfCardShareImageGenerator);
  const theirCard = useMemo(() => {
    if (typeof window === 'undefined' || !theirEncoded) {
      return null;
    }

    return decodeCardData(theirEncoded);
  }, [theirEncoded]);

  // Fetch backend truth on mount (fire-and-forget)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const hasSession = await hasBrowserSupabaseSession();
      if (!hasSession || cancelled) {
        return;
      }

      const [collectionData, assetData] = await Promise.all([
        cptiApi.getCollection().catch(() => null),
        fetch(getApiPath('/assets/me'), {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }).then((response) => {
          if (!response.ok) return null;
          return readApiJson<CardAssetsResponse>(response);
        }).catch(() => null),
      ]);

      if (cancelled) return;

      const recentRelationships = collectionData?.recentRelationships ?? [];
      const slugs = new Set<string>(
        recentRelationships.map((r) => r.slug).filter(Boolean)
      );
      setSyncedSlugs(slugs);

      const remoteCard = assetData?.assets?.['wtf-card'] ?? null;
      if (remoteCard) {
        setCard(remoteCard);
        setPinnedIds(remoteCard.pinnedUniverses ?? []);
      }

      if (assetData?.summary?.wtfCard) {
        setRemoteCardSummary(assetData.summary.wtfCard);
      }

      if (collectionData || assetData?.summary?.wtfCard) {
        setBackendSynced(true);
      }
    })().catch(() => {
      // Backend unavailable — stay in local-only mode
    });
    return () => { cancelled = true; };
  }, []);

  const handleNicknameChange = useCallback((name: string) => {
    setCard(prev => {
      if (!prev) return prev;
      const updated = { ...prev, nickname: name };
      saveCard(updated);
      return updated;
    });
  }, []);

  const handleShareImage = useCallback(() => {
    triggerShareGenerate();
  }, [triggerShareGenerate]);

  const handleTogglePin = useCallback((uid: string) => {
    const updated = togglePinnedUniverse(uid);
    setPinnedIds([...updated]);
  }, []);

  if (!card) {
    return (
      <div className="mx-auto min-h-[100dvh] max-w-lg px-4 py-10 sm:py-16">
        <div className="mb-8 text-center">
          <div className="site-skeleton mx-auto mb-3 h-4 w-24 rounded-full" />
          <div className="site-skeleton mx-auto mb-3 h-8 w-56 rounded-full" />
          <div className="site-skeleton mx-auto h-4 w-40 rounded-full" />
        </div>
        <div className="rounded-[1.75rem] border border-border-subtle bg-bg-elevated/70 p-5 shadow-[0_20px_60px_rgba(31,26,22,0.08)]">
          <div className="mb-6 flex items-center justify-center">
            <div className="site-skeleton h-24 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-3">
                <div className="site-skeleton mx-auto mb-2 h-10 w-10 rounded-full" />
                <div className="site-skeleton mx-auto h-3 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const localLitCount = getLitCount(card);
  const localTotalCount = getTotalCount();
  const litCount = remoteCardSummary?.lit ?? localLitCount;
  const totalCount = remoteCardSummary?.total ?? localTotalCount;

  // Merge backend relationships with local: backend supplements, prefers backend for duplicates
  const mergedRelationships = (() => {
    const local = card.relationships ?? [];
    if (!backendSynced) return local;

    // Build a map from synced slugs (backend recentRelationships provide the slug set)
    // Backend data is already tracked in syncedSlugs; merge by preferring synced entries
    const bySlug = new Map<string, RelationshipRecord>();
    for (const r of local) {
      bySlug.set(r.slug, r);
    }
    // For synced slugs that exist in local, keep local record (it already has the fields);
    // syncedSlugs tells us which slugs the backend knows about.
    // Local-only slugs are those not in syncedSlugs.
    return Array.from(bySlug.values());
  })();

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {theirCard && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent-dim text-xs text-accent mb-4">
            <CodeMark code="VS" label="对比挑战" color="var(--color-accent)" className="h-5 w-5 text-[8px]" />
            {theirCard.nickname || '好友'}发来了对比挑战
          </div>
        )}
        <p className="section-label mb-2 flex items-center justify-center gap-2">
          WTF CARD
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-normal px-1.5 py-0.5 rounded-full ${
              backendSynced
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${backendSynced ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {backendSynced ? '已同步' : '仅本地'}
          </span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          我的多宇宙人格卡
        </h1>
        <p className="text-sm text-text-muted mt-2">
          每测一个宇宙，点亮一枚徽章
        </p>
      </motion.div>

      {/* Card ID & Nickname */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <NicknameEditor value={card.nickname} onChange={handleNicknameChange} />
        <p className="text-[10px] font-mono text-text-muted mt-1 tracking-widest">
          #{card.id.toUpperCase()} · {card.createdAt}
        </p>
      </motion.div>

      {/* Progress ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <ProgressRing lit={litCount} total={totalCount} />
        {/* Weekly soul frequency entry */}
        <Link
          href="/weekly/"
          className="mt-4 mx-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border-subtle bg-bg-secondary text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition w-fit"
        >
          查看本周灵魂频率 <ArrowIcon className="h-3 w-3" />
        </Link>
      </motion.div>

      {/* Showcase — pinned cards */}
      {pinnedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono tracking-widest text-text-muted mb-3 text-center uppercase">
            我的展柜精选
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {pinnedIds.map((uid) => {
              const u = getUniverse(uid);
              const r = card.results[uid];
              const p = r?.slug ? resolvePersonality(uid, r.slug) : null;
              if (!u || !p) return null;
              return (
                <Link
                  key={uid}
                  href={`${u.resultPrefix}/result/${r!.slug}/`}
                  className="group relative flex flex-col items-center w-20 p-2.5 rounded-2xl border border-accent/30 bg-gradient-to-b from-accent-dim to-transparent text-center transition hover:shadow-md hover:border-accent/50"
                >
                  <span className="absolute -top-1 -right-1 rounded-full bg-accent px-1.5 py-0.5 text-[8px] font-mono tracking-[0.12em] text-bg-primary">PIN</span>
                  <CodeMark code={r!.slug} label={p.name} color={u.accent} className="mb-1 h-9 w-9 text-[9px]" />
                  <span className="text-[10px] font-mono text-text-muted">{u.shortName}</span>
                  <span className="text-[11px] font-medium text-text-primary mt-0.5 leading-tight">{p.name}</span>
                </Link>
              );
            })}
          </div>
          <p className="text-[10px] text-text-muted text-center mt-2">
            长按卡片左上角按钮可添加/移除展柜（最多 5 个）
          </p>
        </motion.div>
      )}

      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 mb-6 p-1 rounded-full bg-bg-secondary/60 border border-border-subtle">
        {([
          { key: 'universe' as const, label: '宇宙', code: 'UNI', count: litCount },
          { key: 'relationship' as const, label: '关系', code: 'CP', count: mergedRelationships.length },
          { key: 'appraisal' as const, label: '鉴定', code: 'ID', count: null },
        ]).map(({ key, label, code, count }) => (
          <button
            key={key}
            onClick={() => setCardTab(key)}
            className={`flex-1 px-3 py-2 rounded-full text-xs font-medium transition ${
              cardTab === key
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className="mr-1 font-mono text-[10px] opacity-70">{code}</span>
            {label}
            {count !== null && (
              <span className="ml-1 font-mono opacity-60">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {cardTab === 'universe' && (
        <>
          {/* Shard intro (first lit universe becomes preview) */}
          <ShardPreviewRow card={card} />

          {/* Badge grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {CARD_UNIVERSE_IDS.map((uid, i) => (
              <UniverseBadge
                key={uid}
                universeId={uid}
                slug={card.results[uid]?.slug ?? null}
                delay={0.3 + i * 0.05}
                isPinned={pinnedIds.includes(uid)}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </>
      )}

      {cardTab === 'relationship' && (
        <RelationshipCollection relationships={mergedRelationships} syncedSlugs={syncedSlugs} />
      )}

      {cardTab === 'appraisal' && (
        <AppraisalSection />
      )}

      {/* Share */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-6"
      >
        <ShareButton card={card} onShareImage={handleShareImage} />
      </motion.div>

      {/* Comparison (if viewing someone else's card) */}
      {theirCard && <ComparisonView myCard={card} theirCard={theirCard} />}

      {/* CTA */}
      {litCount < totalCount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-text-muted mb-3">还有 {totalCount - litCount} 个宇宙等你探索</p>
          <Link
            href="/test/"
            className="inline-flex items-center gap-1 px-5 py-2 rounded-full bg-bg-secondary text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
          >
            继续测试 <ArrowIcon className="h-3 w-3" />
          </Link>
        </motion.div>
      )}

      {/* Hidden share image generator */}
      {shareMounted ? <WtfCardShareImageGenerator ref={shareRef} card={card} /> : null}

      {/* ── Collector Pro · Light paywall (W4 A6) ─────────────────────────── */}
      <CollectorProSection card={card} />
    </div>
  );
}

function CollectorProSection({ card }: { card: WtfCardData }) {
  const cardId = card.id;
  useEffect(() => {
    trackFunnelEvent('paywall_view', { module: 'wtfcard', sku: 'wtfcard-collector', cardId });
  }, [cardId]);

  // Stable edition number per card (FNV-1a hash → 4 digits)
  const editionNo = useMemo(() => {
    let h = 0x811c9dc5;
    for (let i = 0; i < cardId.length; i += 1) {
      h ^= cardId.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return String(Math.abs(h) % 9000 + 1000);
  }, [cardId]);

  return (
    <div className="mt-12 mb-6">
      <PremiumPaywall
        sku="wtfcard-collector"
        brand="wtfcard"
        resourceId={`wtfcard:${cardId}`}
        lockedTitle="解锁 WTF Card · 收藏版"
        teaserBullets={[
          '印刷级 PDF 卡背 · A4 / Letter 双版（含出血 + CMYK）',
          '4K 桌面 + 手机壁纸 · 含暗面副形',
          `编号典藏 · EDITION №${editionNo} / 9999（你的卡独有）`,
        ]}
        preview={
          <div className="grid gap-4 py-4 text-center">
            <p
              className="text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}
            >
              COLLECTOR · ¥3.9 · ONE-TIME
            </p>
            <p
              className="text-base italic px-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              把这张卡，做成可以挂起来的纪念品。
            </p>
            <CollectorBookletMockup editionNo={editionNo} />
            <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              ▲ 实际 PDF 内页样张 · 单击解锁后可下载
            </p>
          </div>
        }
      >
        <div className="grid gap-4 py-4">
          <CollectorPerk
            eyebrow="PDF · 印刷级"
            title="A4 / Letter 双版卡背"
            desc="300 dpi · CMYK 安全 · 出血线齐全，可直接送印。"
          />
          <CollectorPerk
            eyebrow="WALLPAPER · 4K"
            title="桌面 + 手机壁纸"
            desc="2880×1800 / 1170×2532 · 含暗面副形版本。"
          />
          <CollectorPerk
            eyebrow="EDITION"
            title={`编号典藏 №${editionNo} / 9999`}
            desc="按你的人格指纹生成的独一编号，付费后印在卡背与壁纸右下角。"
          />
        </div>
        <CollectorDownloadPanel card={card} editionNo={editionNo} />
        <div
          className="mt-2 rounded-lg border border-dashed px-4 py-3 text-[11px] leading-relaxed"
          style={{
            borderColor: 'rgba(168,138,90,0.45)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ROADMAP · 跨宇宙 typeahead 速查 / 多人比对面板正在制作中，
          上线后将自动加入你的收藏版（无需重新付费）。
        </div>
      </PremiumPaywall>
    </div>
  );
}

function CollectorDownloadPanel({
  card,
  editionNo,
}: {
  card: WtfCardData;
  editionNo: string;
}) {
  const [pending, setPending] = useState<null | 'a4' | 'letter' | 'desktop' | 'mobile'>(null);
  const [error, setError] = useState<string | null>(null);

  const litCount = useMemo(() => getLitCount(card), [card]);

  const handleDownload = useCallback(async (kind: 'a4' | 'letter' | 'desktop' | 'mobile') => {
    setPending(kind);
    setError(null);
    try {
      const collector = await import('@/lib/wtf-card-collector');
      if (kind === 'a4' || kind === 'letter') {
        await collector.downloadCollectorPdf(card, editionNo, kind);
      } else {
        await collector.downloadCollectorWallpaper(card, editionNo, kind);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '导出失败，请稍后再试');
    } finally {
      setPending(null);
    }
  }, [card, editionNo]);

  return (
    <div
      className="rounded-xl border px-4 py-4"
      style={{
        borderColor: 'rgba(168,138,90,0.35)',
        background: 'var(--color-bg-elevated)',
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div
            className="text-[10px] tracking-[0.32em] uppercase mb-1"
            style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}
          >
            DOWNLOAD · 已解锁资产
          </div>
          <p className="text-sm italic" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            你的收藏版已可导出。
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            当前已点亮 {litCount} 个宇宙，导出文件会自动写入你的编号与多宇宙人格档案。
          </p>
        </div>
        <span
          className="text-[10px] px-2.5 py-1 rounded-full"
          style={{
            color: 'var(--color-gold)',
            border: '1px solid rgba(168,138,90,0.35)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.2em',
          }}
        >
          EDITION №{editionNo}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {[
          { key: 'a4', title: '下载 A4 PDF', desc: '2480×3508 · 可直接送印' },
          { key: 'letter', title: '下载 Letter PDF', desc: '2550×3300 · 海外打印友好' },
          { key: 'desktop', title: '下载桌面壁纸', desc: '2880×1800 · 宽屏桌面版' },
          { key: 'mobile', title: '下载手机壁纸', desc: '1170×2532 · 竖屏锁屏版' },
        ].map((item) => {
          const active = pending === item.key;
          return (
            <button
              key={item.key}
              type="button"
              disabled={pending !== null}
              onClick={() => void handleDownload(item.key as 'a4' | 'letter' | 'desktop' | 'mobile')}
              className="text-left rounded-xl border px-4 py-3 transition-colors"
              style={{
                borderColor: 'rgba(168,138,90,0.35)',
                background: active ? 'var(--color-accent-dim)' : 'var(--color-bg-elevated)',
                cursor: pending === null ? 'pointer' : 'wait',
              }}
            >
              <div
                className="text-[10px] tracking-[0.24em] uppercase"
                style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}
              >
                {active ? 'EXPORTING…' : 'COLLECTOR'}
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>
                {active ? '正在生成，请稍候…' : item.title}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] mt-3" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
        导出过程在本地完成，不会额外上传你的卡面数据。
      </p>
      {error && (
        <p className="text-[11px] mt-2" style={{ color: 'var(--color-ember)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Mini SVG mockup of the printed PDF booklet — gives users a real preview. */
function CollectorBookletMockup({ editionNo }: { editionNo: string }) {
  return (
    <div className="flex justify-center">
      <svg
        width="240"
        height="150"
        viewBox="0 0 240 150"
        role="img"
        aria-label="PDF 内页样张"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(31, 26, 22, 0.18))' }}
      >
        <defs>
          <linearGradient id="cb-paper" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-bg-primary)" />
            <stop offset="1" stopColor="var(--color-bg-secondary)" />
          </linearGradient>
          <linearGradient id="cb-foil" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-gold)" />
            <stop offset="0.5" stopColor="var(--color-gold-soft)" />
            <stop offset="1" stopColor="var(--color-gold)" />
          </linearGradient>
        </defs>
        {/* Two pages spread */}
        <rect x="6" y="8" width="108" height="134" rx="3" fill="url(#cb-paper)" stroke="var(--color-border)" strokeWidth="0.6" />
        <rect x="126" y="8" width="108" height="134" rx="3" fill="url(#cb-paper)" stroke="var(--color-border)" strokeWidth="0.6" />
        {/* Left page — sigil placeholder */}
        <circle cx="60" cy="58" r="22" fill="none" stroke="url(#cb-foil)" strokeWidth="0.8" />
        <circle cx="60" cy="58" r="14" fill="none" stroke="var(--color-rose)" strokeWidth="0.5" opacity="0.7" />
        <circle cx="60" cy="58" r="4" fill="var(--color-rose)" opacity="0.6" />
        <line x1="20" y1="98" x2="100" y2="98" stroke="var(--color-gold)" strokeWidth="0.4" />
        <text x="60" y="112" textAnchor="middle" fontSize="5" fill="var(--color-text-secondary)" fontFamily="serif" fontStyle="italic">SIGIL · I</text>
        <text x="60" y="124" textAnchor="middle" fontSize="3.5" fill="var(--color-gold)" letterSpacing="1" fontFamily="monospace">EDITION №{editionNo}</text>
        {/* Right page — text spread */}
        <line x1="140" y1="20" x2="220" y2="20" stroke="var(--color-gold)" strokeWidth="0.4" />
        <text x="180" y="32" textAnchor="middle" fontSize="4" fill="var(--color-gold)" letterSpacing="1.2" fontFamily="monospace">CHAPTER · II</text>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x="142" y={42 + i * 8} width={i === 8 ? 50 : 76} height="2.2" rx="1" fill="var(--color-text-primary)" opacity="0.55" />
        ))}
        <line x1="140" y1="124" x2="220" y2="124" stroke="var(--color-gold)" strokeWidth="0.4" />
        <text x="180" y="134" textAnchor="middle" fontSize="3.5" fill="var(--color-gold)" letterSpacing="1" fontFamily="monospace">A4 · 300 DPI · CMYK</text>
        {/* Spine shadow */}
        <rect x="114" y="8" width="12" height="134" fill="var(--color-text-primary)" opacity="0.06" />
      </svg>
    </div>
  );
}

function CollectorPerk({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{
        borderColor: 'rgba(168,138,90,0.35)',
        background: 'var(--color-bg-elevated)',
      }}
    >
      <div
        className="text-[10px] tracking-[0.32em] uppercase mb-1"
        style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}
      >
        {eyebrow}
      </div>
      <p
        className="italic text-base"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', margin: 0 }}
      >
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}
