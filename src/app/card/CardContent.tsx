'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getOrCreateCard, loadCard, saveCard, decodeCardData,
  encodeCardData, getLitCount, getTotalCount,
  calculateSimilarity, getComparisonRoast,
  CARD_UNIVERSE_IDS,
  type WtfCardData,
} from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';
import { SHARE_SITE_URL } from '@/lib/site';
import { WtfCardShareImageGenerator } from '@/components/WtfCardShareImageGenerator';
import type { WtfCardShareImageGeneratorHandle } from '@/components/WtfCardShareImageGenerator';

// ─── Badge component ─────────────────────────────────────

function UniverseBadge({
  universeId,
  slug,
  delay,
}: {
  universeId: string;
  slug: string | null;
  delay: number;
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
    >
      {isLit ? (
        <Link
          href={`${universe.resultPrefix}/result/${slug}/`}
          className="group block rounded-2xl border border-border-subtle bg-bg-elevated p-3 text-center transition-all hover:border-border hover:shadow-sm"
        >
          <div
            className="text-2xl mb-1.5"
            role="img"
            aria-label={universe.name}
          >
            {resolved.emoji}
          </div>
          <div className="text-[10px] font-mono tracking-wider text-text-muted">
            {universe.shortName}
          </div>
          <div className="text-xs font-medium text-text-primary mt-0.5 leading-tight">
            {resolved.name}
          </div>
        </Link>
      ) : (
        <Link
          href={universe.testPath}
          className="group block rounded-2xl border border-dashed border-border bg-bg-secondary/50 p-3 text-center transition-all hover:border-accent/40 hover:bg-accent-dim"
        >
          <div className="text-2xl mb-1.5 opacity-30">
            {universe.emoji || '❓'}
          </div>
          <div className="text-[10px] font-mono tracking-wider text-text-muted">
            {universe.shortName}
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            去测试
          </div>
        </Link>
      )}
    </motion.div>
  );
}

// ─── Progress ring ───────────────────────────────────────

function ProgressRing({ lit, total }: { lit: number; total: number }) {
  const pct = total > 0 ? lit / total : 0;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle
          cx="40" cy="40" r={r}
          fill="none" stroke="var(--color-border-subtle)" strokeWidth="6"
        />
        <motion.circle
          cx="40" cy="40" r={r}
          fill="none" stroke="var(--color-accent)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-text-primary">{lit}</span>
        <span className="text-[10px] text-text-muted">/ {total}</span>
      </div>
    </div>
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
        <div className="text-3xl mb-3">⚡</div>
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-medium text-sm transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #ff4d6d, #e06088)',
              boxShadow: '0 4px 16px rgba(255,77,109,0.25)',
            }}
          >
            开始经典测试 →
          </Link>
          <Link
            href="/wtfti/test/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary text-sm font-medium hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            🤯 毒舌版测试
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
        className="text-xs px-2 py-1 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer"
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
        className="w-full py-3 rounded-xl border border-accent/20 bg-accent-dim text-sm text-accent hover:bg-accent/10 transition-all cursor-pointer"
      >
        {challengeCopied ? '已复制对比挑战文案 ✓' : '📩 复制对比挑战文案，发给好友'}
      </button>
    </div>
  );
}

// ─── Main content ────────────────────────────────────────

export function CardContent() {
  const searchParams = useSearchParams();
  const theirEncoded = searchParams.get('c');

  const [card, setCard] = useState<WtfCardData | null>(null);
  const [theirCard, setTheirCard] = useState<WtfCardData | null>(null);

  const shareRef = useRef<WtfCardShareImageGeneratorHandle>(null);

  // Load cards on mount
  useEffect(() => {
    const myCard = getOrCreateCard();
    setCard(myCard);

    if (theirEncoded) {
      const decoded = decodeCardData(theirEncoded);
      if (decoded) setTheirCard(decoded);
    }
  }, [theirEncoded]);

  const handleNicknameChange = useCallback((name: string) => {
    setCard(prev => {
      if (!prev) return prev;
      const updated = { ...prev, nickname: name };
      saveCard(updated);
      return updated;
    });
  }, []);

  const handleShareImage = useCallback(() => {
    shareRef.current?.generate();
  }, []);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const litCount = getLitCount(card);
  const totalCount = getTotalCount();

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
            ⚡ {theirCard.nickname || '好友'}发来了对比挑战
          </div>
        )}
        <p className="section-label mb-2">WTF CARD</p>
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
        <p className="text-xs text-text-muted text-center mt-2">
          {litCount === 0 && '还没测过任何宇宙，快去试试'}
          {litCount > 0 && litCount < totalCount && `已点亮 ${litCount} / ${totalCount} 个宇宙`}
          {litCount === totalCount && '🎉 恭喜全宇宙点亮！'}
        </p>
      </motion.div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {CARD_UNIVERSE_IDS.map((uid, i) => (
          <UniverseBadge
            key={uid}
            universeId={uid}
            slug={card.results[uid]?.slug ?? null}
            delay={0.3 + i * 0.05}
          />
        ))}
      </div>

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
            className="inline-block px-5 py-2 rounded-full bg-bg-secondary text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
          >
            继续测试 →
          </Link>
        </motion.div>
      )}

      {/* Hidden share image generator */}
      <WtfCardShareImageGenerator ref={shareRef} card={card} />
    </div>
  );
}
