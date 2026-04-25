'use client';

/**
 * SnapshotShareButton (W5) — composes a museum snapshot from local state,
 * encodes it into a URL token, and offers copy / share / view actions.
 *
 * Pure client. The snapshot lives only in the URL itself.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  buildCurrentSnapshot,
  encodeSnapshot,
  loadDisplayName,
  saveDisplayName,
} from '@/lib/museum/share-snapshot';
import { trackMuseum } from '@/lib/museum/analytics';
import { getSiteUrl } from '@/lib/site';

interface SnapshotShareButtonProps {
  unlockedKeys: Set<string>;
  badgeIds: string[];
  accent: string;
}

export default function SnapshotShareButton({ unlockedKeys, badgeIds, accent }: SnapshotShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => {
      const stored = loadDisplayName();
      if (stored) setName(stored);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const onLockBody = useCallback((lock: boolean) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = lock ? 'hidden' : '';
  }, []);

  const onOpen = () => {
    setOpen(true);
    onLockBody(true);
  };
  const onClose = () => {
    setOpen(false);
    onLockBody(false);
    setCopied(false);
  };

  const onGenerate = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed) saveDisplayName(trimmed);
    const snap = buildCurrentSnapshot(unlockedKeys, { name: trimmed, badgeIds });
    const t = encodeSnapshot(snap);
    setToken(t);
    trackMuseum('snapshot_create', { total_unlocked: unlockedKeys.size });
  }, [name, unlockedKeys, badgeIds]);

  const onCopy = useCallback(async () => {
    if (!token) return;
    try {
      const url = getSiteUrl(`/u/share/${token}/`);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { /* swallow */ }
  }, [token]);

  const url = token ? getSiteUrl(`/u/share/${token}/`) : '';

  if (unlockedKeys.size === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="text-[11px] sm:text-xs font-mono tracking-[0.1em] px-2.5 py-1 rounded-full border transition-colors"
        style={{ borderColor: `${accent}55`, color: accent, background: `${accent}08` }}
      >
        🪞 公开我的卡册
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 animate-fade-in"
          style={{ background: 'rgba(31,26,22,0.55)' }}
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border bg-bg-elevated overflow-hidden animate-slide-up"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <span className="serial-number text-xs">Share / 公开卡册</span>
              <h2 className="text-lg sm:text-xl section-headline mt-0.5">生成一个只读的链接</h2>
              <p className="text-[11px] text-text-muted mt-1">链接里包含你解锁的卡片快照 · 不会上传到服务器</p>
            </header>

            <div className="px-5 py-4 space-y-4">
              <label className="block text-[11px] text-text-muted">
                <span className="block mb-1">怎么称呼你（可选，≤ 18 字）</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 18))}
                  placeholder="不填就显示「某位馆主」"
                  className="w-full bg-transparent text-sm border-b border-dashed focus:border-solid outline-none py-1"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                />
              </label>

              <div className="text-[11px] text-text-muted">
                <p>已解锁 <span className="font-mono text-text-primary">{unlockedKeys.size}</span> 张卡 · 收藏的日签和已得徽章会一起带上</p>
              </div>

              {!token && (
                <button
                  type="button"
                  onClick={onGenerate}
                  className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl text-bg-primary"
                  style={{ background: accent }}
                >
                  生成链接 →
                </button>
              )}

              {token && (
                <div className="space-y-2">
                  <code className="block w-full text-[11px] font-mono p-2.5 rounded-lg border break-all" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg)' }}>
                    {url}
                  </code>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onCopy}
                      className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg text-bg-primary"
                      style={{ background: accent }}
                    >
                      {copied ? '已复制 ✓' : '复制链接'}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border text-center"
                      style={{ borderColor: `${accent}55`, color: accent }}
                    >
                      预览 →
                    </a>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    任何人打开链接，都能看到这一刻的快照 · 你之后改了图鉴，链接里仍是当时那一份
                  </p>
                </div>
              )}
            </div>

            <footer className="px-5 py-3 border-t flex justify-end" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button onClick={onClose} className="text-xs text-text-muted hover:text-text-primary">关闭</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
