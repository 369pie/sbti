'use client';

/**
 * Shard Detail — full-screen profile for a single persona shard.
 *
 * URL: /card/shard/?universe={universeId}&slug={personalitySlug}
 *
 * Static-export compatible: client-only, no dynamic route params.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMemo, useEffect, useCallback } from 'react';
import { getUniverse } from '@/lib/universes';
import { getPersonalityBySlug } from '@/lib/personalities';
import { PersonaShardOrb } from '@/components/PersonaShardOrb';
import { useShardState, recordCardVisit } from '@/lib/persona-shard';

export function ShardDetailContent() {
  const searchParams = useSearchParams();
  const universeId = searchParams.get('universe') ?? '';
  const slug = searchParams.get('slug') ?? '';

  // Stable mount effect — only side effect is localStorage write + event dispatch,
  // no setState call, so the react-hooks/set-state-in-effect rule is satisfied.
  useEffect(() => {
    recordCardVisit();
  }, []);

  const universe = useMemo(() => getUniverse(universeId), [universeId]);
  const personality = useMemo(() => getPersonalityBySlug(slug), [slug]);
  const accent = universe?.accent ?? personality?.color ?? '#888';
  const displayName = personality?.name ?? slug;
  const symbol = personality?.emoji ?? universe?.emoji ?? '✦';

  const hasValidParams = !!universeId && !!slug;

  // Always call hooks unconditionally — even when params are missing we just
  // pass empty strings; the derived state is safe.
  const shardState = useShardState(universeId || 'unknown', slug || 'unknown');

  const handleShareCopy = useCallback(() => {
    if (typeof window === 'undefined') return;
    const line = shardState.line.line;
    const text = `我的 ${universe?.name ?? universeId} 碎片今天说：「${line}」\n去 WTFTI 看看你的人格碎片 → ${window.location.origin}/card/`;
    navigator.clipboard?.writeText(text).catch(() => {});
  }, [shardState.line.line, universe?.name, universeId]);

  if (!hasValidParams) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-text-muted mb-4">需要指定 universe 和 slug 参数。</p>
        <Link href="/card/" className="text-sm underline">返回 WTF Card</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="max-w-2xl mx-auto px-6 pt-8 pb-4">
        <Link
          href="/card/"
          className="text-xs text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回多宇宙档案
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border-subtle bg-bg-secondary/30 px-6 py-10"
        >
          <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-center text-text-muted mb-1">
            Persona Shard · {universe?.shortName ?? universeId}
          </p>
          <h1 className="text-center text-lg font-semibold mb-8" style={{ color: accent }}>
            {universe?.name ?? universeId} · {displayName}
          </h1>

          <PersonaShardOrb
            state={shardState}
            accent={accent}
            symbol={symbol}
            size={220}
          />
        </motion.div>
      </section>

      {/* Shard anatomy */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '语气', value: shardState.traits.voice },
            { label: '节拍', value: shardState.traits.pace },
            { label: '能量', value: shardState.traits.energy },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-2xl border border-border-subtle bg-bg-secondary/20 px-4 py-3 text-center"
            >
              <p className="text-[10px] font-mono tracking-wider uppercase text-text-muted mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold" style={{ color: accent }}>
                {item.value}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Stage progress */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border-subtle bg-bg-secondary/20 px-5 py-4"
        >
          <p className="text-[11px] font-mono tracking-wider uppercase text-text-muted mb-3">
            碎片进化
          </p>
          <div className="flex items-center gap-2">
            {(['dormant', 'awake', 'resonant'] as const).map((stage, i) => {
              const active = shardState.stage === stage;
              const reached =
                (shardState.stage === 'awake' && i <= 1) ||
                (shardState.stage === 'resonant');
              return (
                <div key={stage} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full h-1 rounded-full transition-all"
                    style={{
                      background: reached || active ? accent : 'var(--border-subtle, #33333322)',
                      opacity: active ? 1 : reached ? 0.6 : 0.25,
                    }}
                  />
                  <p
                    className="text-[10px] mt-1.5"
                    style={{ color: active ? accent : reached ? 'inherit' : 'var(--text-muted, #888)', opacity: active ? 1 : 0.6 }}
                  >
                    {stage === 'dormant' ? '沉睡' : stage === 'awake' ? '苏醒' : '共鸣'}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
            {shardState.stage === 'dormant' && '再测 1 个宇宙，这枚碎片会苏醒。'}
            {shardState.stage === 'awake' && `再测 ${Math.max(1, 3 - shardState.totalTested)} 个宇宙，并在本周再来看一次，碎片会进入共鸣态。`}
            {shardState.stage === 'resonant' && '这枚碎片正在共鸣——跨宇宙的你已经形成回响。'}
          </p>
        </motion.div>
      </section>

      {/* CTAs */}
      <section className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            type="button"
            onClick={handleShareCopy}
            className="rounded-2xl border border-border-subtle bg-bg-secondary/20 px-4 py-4 text-center transition-all hover:shadow-md active:scale-[0.98]"
          >
            <div className="text-xl mb-1">📋</div>
            <p className="text-xs font-semibold text-text-primary">复制今日碎片说</p>
            <p className="text-[11px] text-text-muted mt-0.5">分享到任意平台</p>
          </button>
          <Link
            href="/card/"
            className="rounded-2xl border px-4 py-4 text-center transition-all hover:shadow-md active:scale-[0.98]"
            style={{ borderColor: `${accent}33`, background: `${accent}0d` }}
          >
            <div className="text-xl mb-1">🗂️</div>
            <p className="text-xs font-semibold" style={{ color: accent }}>看所有碎片</p>
            <p className="text-[11px] text-text-muted mt-0.5">多宇宙档案</p>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
