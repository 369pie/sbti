'use client';

/**
 * SoulTI Soul Letter Subscribe — 灵魂来信订阅
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E6)
 *
 * Captures email or weixin OpenID at the result page so we can deliver:
 *   - D+1: 复盘信  (free)
 *   - D+3: 镜像信  (paid · ¥9.9 single / included in ¥19.9 deep report)
 *   - D+7: 修复处方信  (paid)
 *
 * MVP behavior:
 *   - Optional, never blocks the result.
 *   - Email is the only required field for v1; we hand off to API stub.
 *   - Stores subscription metadata in localStorage for instant in-product UX
 *     (so the result page can show "已订阅 D+1" state on revisit).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  personalitySlug: string;
  personalityName: string;
  personalityCode: string;
  /** Tear rate percent (0-100) — stored with subscription so the D+1 letter can reference it */
  tearRatePercent?: number;
  accent?: string;
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const STORAGE_KEY = 'soulti-soul-letter-sub';

interface SubscriptionRecord {
  email: string;
  slug: string;
  code: string;
  tearRatePercent?: number;
  /** ISO timestamp */
  subscribedAt: string;
  /** D+3 / D+7 are paid; D+1 always included */
  optedExtended: boolean;
}

function readStored(): SubscriptionRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SubscriptionRecord) : null;
  } catch {
    return null;
  }
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function SoultiSoulLetterSubscribe({
  personalitySlug,
  personalityName,
  personalityCode,
  tearRatePercent,
  accent = '#8b7355',
}: Props) {
  const [email, setEmail] = useState('');
  const [optedExtended, setOptedExtended] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  // Lazy init to avoid synchronous setState in effect (react-hooks/set-state-in-effect)
  const [existing, setExisting] = useState<SubscriptionRecord | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = readStored();
    return stored && stored.slug === personalitySlug ? stored : null;
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('请填写一个真实的邮箱，我们才能在明天把信寄给你');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/soulti/soul-letter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          slug: personalitySlug,
          code: personalityCode,
          tearRatePercent,
          optedExtended,
        }),
      });
      if (!res.ok) {
        // Soft-fail: still store locally so user feels confirmed
        // but flag a console warning for ops
        console.warn('[soul-letter] subscribe API non-ok', res.status);
      }
      const record: SubscriptionRecord = {
        email: email.trim(),
        slug: personalitySlug,
        code: personalityCode,
        tearRatePercent,
        subscribedAt: new Date().toISOString(),
        optedExtended,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setExisting(record);
      setStatus('success');
    } catch (err) {
      console.warn('[soul-letter] subscribe failed', err);
      setStatus('error');
      setError('网络好像睡了，稍后再试一次');
    }
  }

  if (existing) {
    return (
      <motion.section
        className="max-w-2xl mx-auto px-6 pb-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          data-soulti-surface="cream"
          className="rounded-2xl border p-6 sm:p-7 text-center"
          style={{ borderColor: `${accent}22`, background: 'var(--color-bg-secondary)' }}
        >
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: serifFont, color: accent }}
          >
            SOUL LETTER · 灵魂来信
          </p>
          <p className="text-sm leading-[1.9]" style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}>
            已订阅 · 明天这个时间，第一封信会寄到 {maskEmail(existing.email)}
          </p>
          <p
            className="mt-2 text-[11px]"
            style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}
          >
            {existing.optedExtended
              ? 'D+3 镜像信 · D+7 修复信 已加入队列'
              : '只寄 D+1 一封 · 想要 D+3 / D+7 可在那天的信里继续解锁'}
          </p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="max-w-2xl mx-auto px-6 pb-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.36 }}
      aria-label="灵魂来信"
    >
      <form
        onSubmit={submit}
        data-soulti-surface="cream"
        className="rounded-2xl border p-6 sm:p-7"
        style={{ borderColor: `${accent}22`, background: 'var(--color-bg-secondary)' }}
      >
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-3"
          style={{ fontFamily: serifFont, color: accent }}
        >
          SOUL LETTER · 灵魂来信
        </p>
        <p
          className="text-base leading-[1.9] mb-2"
          style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}
        >
          明天这个时间，让一封专属于「{personalityName}」的信，寄到你的邮箱。
        </p>
        <p
          className="text-[12px] leading-[1.9] mb-5"
          style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)' }}
        >
          D+1 复盘信 · 免费<br />
          D+3 镜像信 / D+7 修复信 · 解锁 ¥19.9（在第一封信里再决定）
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="你的邮箱"
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
            style={{
              fontFamily: serifFont,
              borderColor: error ? '#b07850' : `${accent}30`,
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 rounded-xl text-sm text-bg-primary transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              fontFamily: serifFont,
              background: `linear-gradient(135deg, ${accent}cc, ${accent})`,
              letterSpacing: '0.08em',
            }}
          >
            {status === 'loading' ? '寄出中…' : '让信寄过来'}
          </button>
        </div>

        <label
          className="mt-4 flex items-start gap-2 text-[11px] cursor-pointer"
          style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)' }}
        >
          <input
            type="checkbox"
            checked={optedExtended}
            onChange={(e) => setOptedExtended(e.target.checked)}
            className="mt-0.5"
            style={{ accentColor: accent }}
          />
          <span>
            同时把 D+3 / D+7 也排进来（可以随时一键退订；解锁需付费）
          </span>
        </label>

        {error && (
          <p className="mt-3 text-[11px]" style={{ color: 'var(--color-text-muted)', fontFamily: serifFont }}>
            {error}
          </p>
        )}
        {status === 'error' && !error && (
          <p className="mt-3 text-[11px]" style={{ color: 'var(--color-text-muted)', fontFamily: serifFont }}>
            网络好像睡了，稍后再试一次。
          </p>
        )}

        <p
          className="mt-4 text-[10px] tracking-[0.18em]"
          style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}
        >
          · 邮箱只用于寄这几封信 · 不会出现在任何分享物料里 ·
        </p>
      </form>
    </motion.section>
  );
}

function maskEmail(v: string): string {
  const [local, domain] = v.split('@');
  if (!domain) return v;
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}
