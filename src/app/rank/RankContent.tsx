'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONALITY_TYPES, getTypeThumbnailImage, getTypeMediumImage } from '@/lib/personalities';
import {
  analyzeRank,
  encodeRankParams,
  decodeRankParams,
  generateRankShareText,
} from '@/lib/rank';
import type { RankMember, RankResult } from '@/lib/rank';
import { getSiteUrl } from '@/lib/site';

// ─── Add member form ─────────────────────────────────────

function JoinForm({
  groupName,
  onJoin,
}: {
  groupName: string;
  onJoin: (member: RankMember) => void;
}) {
  const [name, setName] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const regular = PERSONALITY_TYPES.filter(p => !p.isSpecial);

  const handleSubmit = () => {
    if (!name.trim() || !selectedSlug) return;
    onJoin({ name: name.trim(), slug: selectedSlug });
    setName('');
    setSelectedSlug(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary mb-1">加入排行榜</h2>
        <p className="text-sm text-text-muted">
          填入昵称 + 选择你的人格类型
          <br />
          <Link href="/test/" className="text-accent hover:underline">还没测？先去测一下</Link>
        </p>
      </div>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && selectedSlug && handleSubmit()}
        placeholder="你的昵称"
        maxLength={10}
        className="w-full max-w-xs mx-auto block rounded-xl border border-border-subtle bg-bg-secondary px-4 py-2.5 text-center text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {regular.map(p => (
          <button
            key={p.slug}
            onClick={() => setSelectedSlug(p.slug)}
            className={`group relative rounded-xl border p-2 text-center transition-all cursor-pointer ${
              selectedSlug === p.slug
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-1 rounded-lg overflow-hidden" style={{ background: `${p.color}15` }}>
              <NextImage src={getTypeThumbnailImage(p.slug)} alt={p.name} width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div className="text-[10px] font-mono tracking-wider truncate" style={{ color: p.color }}>{p.code}</div>
            <div className="text-xs text-text-primary truncate">{p.name}</div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !selectedSlug}
          className="px-8 py-2.5 rounded-xl bg-accent text-bg-primary font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
        >
          加入 {groupName}
        </button>
      </div>
    </div>
  );
}

// ─── Ranking display ─────────────────────────────────────

function RankDisplay({
  result,
  onAddMore,
}: {
  result: RankResult;
  onAddMore: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareUrl = getSiteUrl(`/rank/?${encodeRankParams(result.groupName, result.members)}`);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ok */ }
  }, [shareUrl]);

  const handleCopyText = useCallback(async () => {
    try {
      const text = generateRankShareText(result, shareUrl);
      await navigator.clipboard.writeText(text);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    } catch { /* ok */ }
  }, [result, shareUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          Personality Rank
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
          {result.groupName}
        </h2>
        <p className="text-sm text-text-muted">
          {result.totalMembers} 人 · {result.uniqueTypes} 种人格
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden">
        {[
          { value: `${result.totalMembers}`, label: '总人数' },
          { value: `${result.uniqueTypes}`, label: '人格种类' },
          { value: `${result.diversityScore}%`, label: '多样性' },
        ].map(stat => (
          <div key={stat.label} className="bg-bg-secondary/60 px-4 py-5 text-center">
            <div className="text-xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top type hero */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border-2 p-6 text-center"
        style={{ borderColor: result.topType.personality.color, background: `${result.topType.personality.color}08` }}
      >
        <div className="text-sm text-text-muted mb-2">🏆 最多人格</div>
        <div
          className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden border-2"
          style={{ borderColor: `${result.topType.personality.color}40`, background: `${result.topType.personality.color}12` }}
        >
          <NextImage
            src={getTypeMediumImage(result.topType.personality.slug)}
            alt={result.topType.personality.name}
            width={80}
            height={80}
            className="w-full h-full object-contain"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
          />
        </div>
        <div className="text-sm font-mono tracking-wider mb-1" style={{ color: result.topType.personality.color }}>
          {result.topType.personality.code}
        </div>
        <h3 className="text-xl font-bold text-text-primary">{result.topType.personality.name}</h3>
        <p className="text-sm text-text-secondary mt-1">{result.topType.personality.tagline}</p>
        <div className="mt-3 text-sm text-text-muted">
          {result.topType.count} 人（{result.topType.pct}%）· {result.topType.members.join('、')}
        </div>
      </motion.div>

      {/* Full ranking */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-muted">完整排行</h3>
        {result.ranked.map((r, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
          return (
            <motion.div
              key={r.personality.slug}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated p-3"
            >
              <span className="text-lg w-8 text-center flex-shrink-0">{medal}</span>
              <div
                className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: `${r.personality.color}12` }}
              >
                <NextImage
                  src={getTypeThumbnailImage(r.personality.slug)}
                  alt={r.personality.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{r.personality.name}</span>
                  <span className="text-xs font-mono" style={{ color: r.personality.color }}>{r.personality.code}</span>
                </div>
                <div className="text-xs text-text-muted truncate">{r.members.join('、')}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-bold text-text-primary">{r.count}</div>
                <div className="text-[10px] text-text-muted">{r.pct}%</div>
              </div>
              {/* Bar */}
              <div className="w-16 h-2 bg-bg-tertiary rounded-full overflow-hidden flex-shrink-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.pct}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: r.personality.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Members list */}
      <div className="flex flex-wrap gap-2 justify-center">
        {result.members.map((m, i) => (
          <div
            key={`${m.name}-${i}`}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-secondary pl-1 pr-2.5 py-1"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden" style={{ background: `${m.personality.color}15` }}>
              <NextImage src={getTypeThumbnailImage(m.slug)} alt="" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs text-text-primary">{m.name}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onAddMore}
            className="px-6 py-2.5 rounded-xl bg-accent text-bg-primary font-medium text-sm hover:bg-accent/90 transition-all cursor-pointer"
          >
            ➕ 邀请更多人加入
          </button>
          <button
            onClick={handleCopyLink}
            className="px-6 py-2.5 rounded-xl border border-border-subtle text-text-secondary font-medium text-sm hover:bg-bg-secondary transition-all cursor-pointer"
          >
            {copied ? '已复制 ✓' : '复制邀请链接'}
          </button>
        </div>
        <button
          onClick={handleCopyText}
          className="w-full py-3 rounded-xl border border-accent/20 bg-accent-dim text-sm text-accent hover:bg-accent/10 transition-all cursor-pointer"
        >
          {textCopied ? '已复制排行榜文案 ✓' : '📋 复制排行榜文案，发到群里'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Create group step ───────────────────────────────────

function CreateGroupStep({
  onNext,
}: {
  onNext: (name: string) => void;
}) {
  const [name, setName] = useState('');

  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold mb-2">给你的群取个名</h2>
      <p className="text-sm text-text-muted mb-6">群名 / 宿舍号 / 班级 / 闺蜜团</p>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && onNext(name.trim())}
        placeholder="例：306宿舍 / 营销部 / 秃头姐妹花"
        maxLength={20}
        className="w-full max-w-xs mx-auto block rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      <button
        onClick={() => name.trim() && onNext(name.trim())}
        disabled={!name.trim()}
        className="mt-6 px-8 py-2.5 rounded-xl bg-accent text-bg-primary font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
      >
        创建排行榜
      </button>
    </div>
  );
}

// ─── Main content ────────────────────────────────────────

export default function RankContent() {
  const searchParams = useSearchParams();
  const restored = useMemo(() => decodeRankParams(searchParams), [searchParams]);

  const [groupName, setGroupName] = useState(restored?.groupName ?? '');
  const [members, setMembers] = useState<RankMember[]>(restored?.members ?? []);
  const [showJoin, setShowJoin] = useState(false);

  const result = useMemo(() => {
    if (!groupName || members.length === 0) return null;
    return analyzeRank(groupName, members);
  }, [groupName, members]);

  const handleCreate = useCallback((name: string) => {
    setGroupName(name);
    setShowJoin(true);
  }, []);

  const handleJoin = useCallback((member: RankMember) => {
    setMembers(prev => {
      const next = [...prev, member];
      // Update URL
      const params = encodeRankParams(groupName, next);
      window.history.replaceState(null, '', `?${params}`);
      return next;
    });
    setShowJoin(false);
  }, [groupName]);

  const handleAddMore = useCallback(() => {
    setShowJoin(true);
  }, []);

  // If restored from URL and not yet joined
  const isViewing = restored && !showJoin;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12 text-center"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          Group Personality Rank
        </span>
        {!result && !showJoin && (
          <>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
              群组人格排行榜
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md mx-auto">
              你们群里最多的人格是什么？<br />
              创建排行榜，发到群里让大家来加入。
            </p>
          </>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Create group name (only if no restore) */}
        {!groupName && !showJoin && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <CreateGroupStep onNext={handleCreate} />
          </motion.div>
        )}

        {/* Step 2: Join form (add yourself or more) */}
        {showJoin && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <JoinForm groupName={groupName} onJoin={handleJoin} />
            {result && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowJoin(false)}
                  className="text-sm text-text-muted hover:text-text-secondary cursor-pointer"
                >
                  ← 返回排行榜
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Ranking display */}
        {result && !showJoin && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RankDisplay result={result} onAddMore={handleAddMore} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
