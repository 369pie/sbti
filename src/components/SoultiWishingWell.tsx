'use client';

/**
 * SoulTI Wishing Well · 匿名许愿池
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E10)
 *
 * Per-personality anonymous one-liner pool. Mounts on the result page below
 * Soul Letter subscribe. Three modes (no extra dependencies):
 *   - empty   : invite to be the first
 *   - browsing: shows up to 24 cards in a soft drift carousel
 *   - posting : inline composer
 *
 * Designed to be the "tribe" moment: even if you don't share the result on
 * Xiaohongshu, you can drop one line for the next person of the same type
 * and read what others left behind.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Wish {
  id: string;
  slug: string;
  text: string;
  signature: string | null;
  created_at: string;
}

interface Props {
  personalitySlug: string;
  personalityName: string;
  accent?: string;
}

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const STORAGE_PREFIX = 'soulti-wish-posted:'; // soulti-wish-posted:<slug>=<isoDate>
const MAX_LEN = 140; // we cap UI tighter than DB to keep cards beautiful
const SIG_MAX_LEN = 16;

function relTime(iso: string, now = Date.now()): string {
  const diff = (now - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

export function SoultiWishingWell({
  personalitySlug,
  personalityName,
  accent = '#8b7355',
}: Props) {
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState('');
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazy: detect "have I posted before" without effect setState
  const justPostedKey = `${STORAGE_PREFIX}${personalitySlug}`;
  const [postedAt, setPostedAt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(justPostedKey);
  });

  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/soulti/wishes?slug=${encodeURIComponent(personalitySlug)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error('fetch_failed');
      const json = (await res.json()) as { wishes?: Wish[] };
      setWishes(Array.isArray(json.wishes) ? json.wishes : []);
    } catch {
      setWishes([]);
    }
  }, [personalitySlug]);

  // Initial fetch — defer to idle to avoid competing with first paint
  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchWishes();
    }, 600);
    return () => window.clearTimeout(id);
  }, [fetchWishes]);

  const remaining = MAX_LEN - text.length;
  const canSubmit = text.trim().length > 0 && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/soulti/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: personalitySlug,
          text: text.trim(),
          signature: signature.trim() || undefined,
        }),
      });
      if (res.status === 429) {
        setError('一小时只能写 3 条 · 留点空间给下一个人');
        return;
      }
      if (!res.ok) {
        setError('网络好像睡了，稍后再试');
        return;
      }
      const now = new Date().toISOString();
      window.localStorage.setItem(justPostedKey, now);
      setPostedAt(now);
      setText('');
      setSignature('');
      setComposerOpen(false);
      await fetchWishes();
    } catch {
      setError('网络好像睡了，稍后再试');
    } finally {
      setSubmitting(false);
    }
  }

  const headerLine = useMemo(() => {
    if (wishes === null) return '正在打开许愿池…';
    if (wishes.length === 0) return `「${personalityName}」的许愿池还空着——你愿意做第一个吗？`;
    return `已经有 ${wishes.length} 个「${personalityName}」在这里留下了一句话。`;
  }, [wishes, personalityName]);

  return (
    <motion.section
      className="max-w-2xl mx-auto px-6 pb-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      aria-label="匿名许愿池"
    >
      <div
        data-soulti-surface="cream"
        className="rounded-2xl border p-6 sm:p-7"
        style={{ borderColor: `${accent}22`, background: '#FDFCFA' }}
      >
        <div className="flex items-baseline justify-between mb-3">
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ fontFamily: serifFont, color: accent }}
          >
            WISHING WELL · 许愿池
          </p>
          {postedAt && (
            <span
              className="text-[10px]"
              style={{ fontFamily: serifFont, color: '#a89f93' }}
            >
              你 {relTime(postedAt)}留过一句
            </span>
          )}
        </div>

        <p
          className="text-[14px] leading-[1.95] mb-4"
          style={{ fontFamily: serifFont, color: '#2D2A26' }}
        >
          {headerLine}
        </p>

        {/* Wish list */}
        {wishes && wishes.length > 0 && (
          <ul className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1" role="list">
            <AnimatePresence initial={false}>
              {wishes.map((w) => (
                <motion.li
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl px-3.5 py-2.5"
                  style={{
                    background: '#fff',
                    border: `1px solid ${accent}15`,
                  }}
                >
                  <p
                    className="text-[13px] leading-[1.85]"
                    style={{ fontFamily: serifFont, color: '#3a352f' }}
                  >
                    {w.text}
                  </p>
                  <p
                    className="mt-1 text-[10px] tracking-[0.1em]"
                    style={{ fontFamily: serifFont, color: '#a89f93' }}
                  >
                    — {w.signature ? w.signature : '匿名的同型人'} · {relTime(w.created_at)}
                  </p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* Composer */}
        {!composerOpen ? (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="w-full px-5 py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
            style={{
              fontFamily: serifFont,
              border: `1px dashed ${accent}40`,
              color: accent,
              background: `${accent}06`,
              letterSpacing: '0.06em',
            }}
          >
            + 留一句给下一个「{personalityName}」
          </button>
        ) : (
          <form onSubmit={submit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              placeholder="今晚你最想对自己说的一句话…"
              rows={3}
              className="w-full px-3.5 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{
                fontFamily: serifFont,
                borderColor: `${accent}30`,
                background: '#fff',
                color: '#2D2A26',
                lineHeight: 1.85,
              }}
              maxLength={MAX_LEN}
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between">
              <input
                type="text"
                value={signature}
                onChange={(e) =>
                  setSignature(e.target.value.replace(/[\r\n]/g, '').slice(0, SIG_MAX_LEN))
                }
                placeholder="留个名字（可空）"
                className="flex-1 mr-3 px-3 py-2 rounded-lg border text-[12px] outline-none"
                style={{
                  fontFamily: serifFont,
                  borderColor: `${accent}20`,
                  background: '#fff',
                  color: '#3a352f',
                }}
                maxLength={SIG_MAX_LEN}
              />
              <span
                className="text-[10px]"
                style={{
                  fontFamily: serifFont,
                  color: remaining < 20 ? '#b07850' : '#a89f93',
                }}
              >
                {remaining}
              </span>
            </div>

            {error && (
              <p
                className="mt-3 text-[11px]"
                style={{ color: '#b07850', fontFamily: serifFont }}
              >
                {error}
              </p>
            )}

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setComposerOpen(false);
                  setError(null);
                }}
                className="px-4 py-2 rounded-lg text-[12px]"
                style={{ fontFamily: serifFont, color: '#7A6A5A' }}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-5 py-2 rounded-lg text-white text-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: serifFont,
                  background: accent,
                  letterSpacing: '0.06em',
                }}
              >
                {submitting ? '寄出中…' : '投进许愿池'}
              </button>
            </div>
          </form>
        )}

        <p
          className="mt-5 text-[10px] tracking-[0.18em]"
          style={{ fontFamily: serifFont, color: '#a89f93' }}
        >
          · 完全匿名 · 一小时最多 3 句 · 保护你的，也保护别人的边界 ·
        </p>
      </div>
    </motion.section>
  );
}
