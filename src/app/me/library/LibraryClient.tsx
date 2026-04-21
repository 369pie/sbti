'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getApiPath } from '@/lib/api';
import { loadXptiResult, loadXptiHistory } from '@/lib/xpti/storage';
import { getXptiPersonalityBySlug } from '@/lib/xpti/personalities';
import { CollectionWall } from '@/components/CollectionWall';

type ModuleKey = 'xpti' | 'soulti' | 'cpti' | 'wtfti' | 'mysti' | 'other';

interface LibraryUnlock {
  orderId: string;
  sku: string;
  resourceId: string;
  title: string;
  module: ModuleKey;
  paidAt: string | null;
  redirectPath: string | null;
}

interface LibraryCoupleEntry {
  id: string;
  shareToken: string;
  pairCode: string;
  status: string;
  pairingId: string | null;
  pairingLabel: string | null;
  inviterNickname: string | null;
  partnerNickname: string | null;
  unlockedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  role: 'inviter' | 'partner';
}

interface LibraryPayload {
  unlocks: LibraryUnlock[];
  xptiCouples: LibraryCoupleEntry[];
  boundDeviceIds: string[];
}

const TABS: Array<{ key: 'all' | ModuleKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'xpti', label: 'XPTI' },
  { key: 'soulti', label: 'SoulTI' },
  { key: 'cpti', label: 'CPTI' },
  { key: 'wtfti', label: 'WTFTI' },
  { key: 'mysti', label: '灵鉴' },
];

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return iso;
  }
}

export function LibraryClient() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [payload, setPayload] = useState<LibraryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | ModuleKey>('all');
  const [bindStatus, setBindStatus] = useState<'idle' | 'binding' | 'done' | 'error'>('idle');
  const [localXpti, setLocalXpti] = useState<{ slug: string | null; historyCount: number }>({
    slug: null,
    historyCount: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath('/me/library'), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setPayload((await res.json()) as LibraryPayload);
      } else {
        setPayload(null);
      }
    } catch {
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load local-only fallback (always — useful for both anon + as a quick teaser)
  useEffect(() => {
    const last = loadXptiResult();
    setLocalXpti({ slug: last?.slug ?? null, historyCount: loadXptiHistory().length });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void load();
  }, [authLoading, isAuthenticated, load]);

  // One-shot device bind on mount: picks up legacy device id from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    let deviceId: string | null = null;
    try {
      deviceId =
        window.localStorage.getItem('mysti.deviceId') ||
        window.localStorage.getItem('sbti.deviceId') ||
        window.localStorage.getItem('deviceId');
    } catch {
      deviceId = null;
    }
    if (!deviceId) return;
    setBindStatus('binding');
    fetch(getApiPath('/me/bind-device'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bind failed'))))
      .then((j: { backfilled?: number }) => {
        setBindStatus('done');
        if ((j.backfilled ?? 0) > 0) void load();
      })
      .catch(() => setBindStatus('error'));
  }, [isAuthenticated, load]);

  const filteredUnlocks = useMemo(() => {
    if (!payload) return [];
    if (activeTab === 'all') return payload.unlocks;
    return payload.unlocks.filter((u) => u.module === activeTab);
  }, [payload, activeTab]);

  const showCouples = activeTab === 'all' || activeTab === 'xpti';

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── Anonymous fallback ─────────────────────────────────────
  if (!isAuthenticated) {
    const personality = localXpti.slug ? getXptiPersonalityBySlug(localXpti.slug) : null;
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
          <header className="mb-8">
            <div className="text-xs font-mono tracking-[0.32em] text-text-muted uppercase mb-2">
              Library · 我的解锁库
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-text-primary">
              当前是这台设备的本地视图
            </h1>
            <p className="text-sm text-text-secondary mt-3 leading-7">
              登录后可跨设备同步所有付费内容，并把这台设备已经付过的订单合并到账号下。
            </p>
            <div className="mt-5 flex gap-3 flex-wrap">
              <Link
                href="/auth/login/?next=/me/library/"
                className="inline-block px-5 py-2 rounded-full bg-text-primary text-bg-primary text-sm font-medium hover:opacity-90 transition-opacity"
              >
                登录跨设备同步 →
              </Link>
              <Link
                href="/xpti/"
                className="inline-block px-5 py-2 rounded-full border border-border-subtle text-text-primary text-sm hover:border-accent/50 transition-all"
              >
                先去做个测试
              </Link>
            </div>
          </header>

          <section className="mb-8">
            <h2 className="text-xs font-mono tracking-[0.28em] text-text-muted uppercase mb-3">
              本机数据 · XPTI
            </h2>
            <div className="p-5 rounded-2xl border border-border-subtle bg-bg-elevated">
              {personality ? (
                <Link href={`/xpti/result/${personality.slug}/`} className="block">
                  <div className="font-serif italic text-xl text-text-primary">
                    {personality.name}
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    本机历史 {localXpti.historyCount} 次 · 点击查看上次结果
                  </div>
                </Link>
              ) : (
                <div className="text-sm text-text-muted">
                  这台设备还没有完成过 XPTI 测试。
                </div>
              )}
            </div>
          </section>

          <p className="text-xs text-text-muted">
            付费记录、合并报告等需登录后才能跨设备查看。当前仅展示本机 localStorage 的内容。
          </p>
        </div>
      </div>
    );
  }

  if (!payload) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <header className="mb-8">
          <div className="text-xs font-mono tracking-[0.32em] text-text-muted uppercase mb-2">
            Library · 我的解锁库
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-text-primary">
            所有你付过的内容，在同一张书架上
          </h1>
          <p className="text-sm text-text-secondary mt-3 leading-7">
            这里汇总 XPTI / SoulTI / CPTI / WTFTI / 灵鉴 的付费解锁记录。换手机、换浏览器不会丢——只要你登录的是同一个账号。
          </p>
          {bindStatus === 'binding' && (
            <p className="mt-2 text-xs text-text-muted">正在把匿名设备的历史订单迁移到当前账号…</p>
          )}
        </header>

        {/* Collection Wall Overview */}
        <section className="mb-8">
          <h2 className="text-xs font-mono tracking-[0.28em] text-text-muted uppercase mb-3">
            宇宙图鉴·收集进度
          </h2>
          <CollectionWall />
        </section>

        <nav id="xpti" className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={
                  'px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all ' +
                  (active
                    ? 'bg-text-primary text-bg-primary'
                    : 'border border-border-subtle text-text-secondary hover:border-accent/50')
                }
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Couple reports */}
        {showCouples && payload.xptiCouples.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-mono tracking-[0.28em] text-text-muted uppercase mb-3">
              XPTI · 合并报告
            </h2>
            <div className="space-y-3">
              {payload.xptiCouples.map((c) => {
                const unlocked = Boolean(c.unlockedAt);
                return (
                  <Link
                    key={c.id}
                    href={`/xpti/couple/?token=${c.shareToken}`}
                    className="block p-5 rounded-2xl border border-border-subtle bg-bg-elevated hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="text-sm font-medium text-text-primary">
                        {c.inviterNickname ?? '你'} × {c.partnerNickname ?? 'ta'}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        {unlocked ? '已解锁' : c.status === 'completed' ? '待解锁' : '等待 ta 完成'}
                      </div>
                    </div>
                    {c.pairingLabel && (
                      <div className="mt-2 font-serif italic text-lg text-text-primary">
                        {c.pairingLabel}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-text-muted">
                      你的身份：{c.role === 'inviter' ? '发起方' : '受邀方'} · 创建于 {fmtDate(c.createdAt)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Generic unlocks */}
        <section>
          <h2 className="text-xs font-mono tracking-[0.28em] text-text-muted uppercase mb-3">
            付费解锁 · {filteredUnlocks.length} 项
          </h2>
          {filteredUnlocks.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border-subtle text-center text-sm text-text-muted">
              这个分类下还没有付费解锁的内容。
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredUnlocks.map((u) => {
                const href = u.redirectPath ?? '/';
                return (
                  <li key={u.orderId}>
                    <Link
                      href={href}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border-subtle bg-bg-elevated hover:border-accent/40 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{u.title}</div>
                        <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">
                          {u.module} · {u.sku}
                        </div>
                      </div>
                      <div className="text-xs text-text-muted whitespace-nowrap">
                        {fmtDate(u.paidAt)}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/me/"
            className="text-xs font-mono tracking-widest text-text-muted hover:text-text-primary"
          >
            ← 返回个人中心
          </Link>
        </div>
      </div>
    </div>
  );
}
