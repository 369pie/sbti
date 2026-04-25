'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { loadCard, recordUniverseResult, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';

// Client-only shard section — avoid any SSR/prerender interaction by design.
const ShardSection = dynamic(() => import('./ShardSection'), { ssr: false });

// ─── Universe Switcher Teasers ───────────────────────────────────────────────

const UNIVERSE_TEASERS: Record<string, string> = {
  standard: '经典版的你是什么人设？',
  xiuxian: '你的修仙体质是什么？',
  wtfti: '毒舌版会怎么骂你？',
  banti: '你在办公室是什么角色？',
  kings: '你在峡谷是什么英雄？',
  bird: '你是什么鸟？',
  flower: '你像哪朵花？',
  delta: '你在战场是什么人设？',
  soulti: '安静地看见你自己',
  xpti: '你的靠近方式是什么？',
  cpti: '你在关系里是什么角色？',
  feng: '你的疯狂人设是什么？',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  /** Current universe ID (e.g. 'standard', 'wtfti', 'bird') */
  currentUniverse: string;
  /** Current personality slug */
  personalitySlug: string;
  /** Current personality name for display */
  personalityName: string;
  /** Accent color */
  accent?: string;
  /** Visual variant */
  variant?: 'default' | 'xpti';
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Result page closure engine — replaces scattered CTAs with a unified,
 * ordered set of engagement hooks:
 * 1. Universe Switcher: "同一个你，换个宇宙会变成谁？"
 * 2. Save to WTF Card: progress bar + save action
 * 3. Relationship Entry: CP/friend testing nudge
 */
export function ResultClosureEngine({
  currentUniverse,
  personalitySlug,
  personalityName,
  accent = '#e8729c',
  variant = 'default',
}: Props) {
  const isXpti = variant === 'xpti';
  const [cardState, setCardState] = useState<{ lit: number; total: number; saved: boolean } | null>(null);
  const [switcherCards, setSwitcherCards] = useState<{ id: string; emoji: string; name: string; teaser: string; testPath: string; accent: string; tested: boolean }[]>([]);

  useEffect(() => {
    const card = loadCard();
    const tested = new Set<string>();
    if (card) {
      for (const uid of CARD_UNIVERSE_IDS) {
        if (card.results[uid]) tested.add(uid);
      }
    }

    // Card progress
    const lit = tested.size;
    const total = CARD_UNIVERSE_IDS.length;
    const saved = tested.has(currentUniverse);
    setCardState({ lit, total, saved });

    // Universe switcher: pick 3 untested (or random if all tested), excluding current
    let candidates = CARD_UNIVERSE_IDS.filter(uid => uid !== currentUniverse && !tested.has(uid));
    if (candidates.length === 0) {
      candidates = CARD_UNIVERSE_IDS.filter(uid => uid !== currentUniverse);
    }
    // Shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const picks = candidates.slice(0, 3);
    setSwitcherCards(picks.map(uid => {
      const u = getUniverse(uid);
      return {
        id: uid,
        emoji: u?.emoji || '✨',
        name: u?.name || uid,
        teaser: UNIVERSE_TEASERS[uid] ?? `去${u?.name ?? uid}看看`,
        testPath: u?.testPath || '/',
        accent: u?.accent || '#888',
        tested: tested.has(uid),
      };
    }));
  }, [currentUniverse]);

  // Save current result to WTF Card
  const handleSave = useCallback(() => {
    recordUniverseResult(currentUniverse, personalitySlug);
    setCardState(prev => prev ? { ...prev, lit: prev.lit + (prev.saved ? 0 : 1), saved: true } : prev);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('persona-shard:refresh'));
    }
  }, [currentUniverse, personalitySlug]);

  return (
    <>
      {/* ── 0. Persona Shard Orb (client-only via dynamic import) ── */}
      <ShardSection
        currentUniverse={currentUniverse}
        personalitySlug={personalitySlug}
        personalityName={personalityName}
        accent={accent}
        isXpti={isXpti}
      />

      {/* ── 1. Universe Switcher ── */}
      {switcherCards.length > 0 && (
        <section className="max-w-2xl mx-auto px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div
              aria-hidden
              className="mx-auto mb-3 h-px w-10"
              style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-leaf, #C9A676), transparent)' }}
            />
            <h2
              className="text-[11px] font-mono tracking-[0.32em] uppercase text-center mb-1.5"
              style={{ color: 'var(--color-gold, #B8905A)' }}
            >
              同一个你 · 换个宇宙
            </h2>
            <p className="text-xs text-center mb-5 italic text-text-secondary">
              你已经是 {personalityName}，在其他宇宙里呢？
            </p>
            <div className="grid gap-3">
              {switcherCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                >
                  <Link
                    href={card.testPath}
                    className="group flex items-center gap-4 rounded-2xl border bg-bg-elevated p-4 shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
                    style={{
                      borderColor: `${card.accent}33`,
                      backgroundImage: `linear-gradient(135deg, ${card.accent}08 0%, transparent 60%)`,
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${card.accent}14`, border: `1px solid ${card.accent}22` }}
                    >
                      {card.emoji || '✨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold group-hover:brightness-95 transition-colors"
                        style={{ color: 'var(--color-text-primary, #1F1A16)' }}
                      >
                        {card.teaser}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                        <span>{card.name}</span>
                        {card.tested && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: 'rgba(122, 138, 130, 0.16)', color: 'var(--color-sage, #5B6E6A)' }}
                          >
                            ✓ 已测
                          </span>
                        )}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                      style={{ color: card.accent }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── 2. Save to WTF Card ── */}
      {cardState && (
        <section className="max-w-2xl mx-auto px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden>🃏</span>
                <div className="flex-1">
                  <p
                    className="text-[10px] font-mono tracking-[0.32em] uppercase mb-0.5"
                    style={{ color: 'var(--color-gold, #B8905A)' }}
                  >
                    Multiverse Archive
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    你的多宇宙人格档案
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    已收集 {cardState.lit} / {cardState.total} 个宇宙
                  </p>
                </div>
                {!cardState.saved ? (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-bg-primary transition-all cursor-pointer hover:brightness-110"
                    style={{ background: accent }}
                  >
                    收藏此结果
                  </button>
                ) : (
                  <Link
                    href="/card/"
                    className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary border border-border-subtle hover:text-text-primary hover:border-border transition-all"
                  >
                    查看档案 →
                  </Link>
                )}
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden bg-bg-tertiary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max((cardState.lit / cardState.total) * 100, 4)}%`,
                    background: `linear-gradient(90deg, ${accent}, var(--color-gold-leaf, #C9A676))`,
                  }}
                />
              </div>
              {cardState.lit < cardState.total && (
                <p className="text-[11px] text-text-secondary mt-2 italic">
                  再测 {cardState.total - cardState.lit} 个宇宙就能集齐完整人格档案
                </p>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── 3. Relationship Entry ── */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cpti/"
              className="group rounded-2xl border border-border-subtle bg-bg-elevated p-4 text-center shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
              style={{ backgroundImage: 'linear-gradient(180deg, rgba(192,122,142,0.10), transparent 70%)' }}
            >
              <div className="text-2xl mb-2" aria-hidden>💕</div>
              <h3 className="text-sm font-semibold mb-1 text-text-primary">
                测段关系
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                你们的化学反应是什么型？
              </p>
            </Link>
            <Link
              href="/identify/"
              className="group rounded-2xl border border-border-subtle bg-bg-elevated p-4 text-center shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
              style={{ backgroundImage: 'linear-gradient(180deg, rgba(201,166,118,0.12), transparent 70%)' }}
            >
              <div className="text-2xl mb-2" aria-hidden>🔍</div>
              <h3 className="text-sm font-semibold mb-1 text-text-primary">
                鉴定好友
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                偷偷测 ta 是什么人
              </p>
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
