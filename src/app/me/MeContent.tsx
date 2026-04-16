'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/supabase/auth';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { getOrCreateCard, getLitCount, getTotalCount, type WtfCardData } from '@/lib/wtf-card';
import { cptiApi } from '@/lib/cpti/cpti-api';

interface MeStats {
  wtfLit: number;
  wtfTotal: number;
  cptiRelationships: number;
  cptiCollected: number;
  cptiTotal: number;
}

export function MeContent() {
  const router = useRouter();
  const { user, isAuthenticated, displayName, loading: authLoading } = useAuth();
  const [card, setCard] = useState<WtfCardData | null>(null);
  const [stats, setStats] = useState<MeStats | null>(null);
  const [profile, setProfile] = useState<{ nickname: string; headline: string; username: string } | null>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login/?next=/me/');
      return;
    }

    const c = getOrCreateCard();
    setCard(c);

    const wtfLit = getLitCount(c);
    const wtfTotal = getTotalCount();

    // Fetch profile + CPTI stats in parallel
    Promise.all([
      fetch('/api/cpti/users/me').then(r => (r.ok ? r.json() : null)).catch(() => null),
      cptiApi.getCollection().catch(() => null),
    ]).then(([profileData, collectionData]) => {
      setProfile({
        nickname: profileData?.nickname ?? displayName ?? '',
        headline: profileData?.headline ?? '',
        username: profileData?.username ?? '',
      });
      setNicknameInput(profileData?.nickname ?? displayName ?? '');

      const collected = collectionData?.collectionProgress?.collected ?? 0;
      const total = collectionData?.collectionProgress?.total ?? 11;
      setStats({
        wtfLit,
        wtfTotal,
        cptiRelationships: collectionData?.stats?.relationshipTypeCount ?? 0,
        cptiCollected: collected,
        cptiTotal: total,
      });
      setPageLoading(false);
    });
  }, [authLoading, isAuthenticated, router, displayName]);

  const handleSaveNickname = useCallback(async () => {
    if (!user) return;
    const trimmed = nicknameInput.trim();
    if (trimmed.length > 32) return;

    setSaving(true);
    try {
      const res = await fetch('/api/cpti/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: trimmed }),
      });
      if (res.ok) {
        // Sync to local WTF Card
        const c = getOrCreateCard();
        c.nickname = trimmed;
        localStorage.setItem('wtf-card', JSON.stringify(c));
        setCard(c);
        setProfile(prev => (prev ? { ...prev, nickname: trimmed } : prev));
        setEditingNickname(false);

        // Refresh auth context so displayName updates
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.refreshSession();
      }
    } finally {
      setSaving(false);
    }
  }, [nicknameInput, user]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await signOut(supabase);
      if (error && !error.toLowerCase().includes('auth session missing')) {
        window.alert(`退出失败：${error}`);
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      window.alert('退出失败，请稍后重试');
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const avatarChar = (profile?.nickname || displayName || '?').charAt(0);
  const wtfPct = stats ? Math.round((stats.wtfLit / stats.wtfTotal) * 100) : 0;
  const cptiPct = stats && stats.cptiTotal > 0 ? Math.round((stats.cptiCollected / stats.cptiTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-xl mx-auto px-6 py-10 sm:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white text-3xl font-bold flex items-center justify-center shadow-md">
            {avatarChar}
          </div>

          {editingNickname ? (
            <div className="flex items-center justify-center gap-2 mb-1">
              <input
                value={nicknameInput}
                onChange={e => setNicknameInput(e.target.value)}
                maxLength={32}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-elevated text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                disabled={saving}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveNickname();
                  if (e.key === 'Escape') setEditingNickname(false);
                }}
              />
              <button
                onClick={handleSaveNickname}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                {saving ? '保存中' : '保存'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-text-primary">
                {profile?.nickname || displayName}
              </h1>
              <button
                onClick={() => setEditingNickname(true)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="修改昵称"
              >
                <EditIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {profile?.username && (
            <p className="text-sm text-text-muted">@{profile.username}</p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 text-center">
            <div className="text-2xl font-bold text-text-primary">{stats?.wtfLit ?? 0}</div>
            <div className="text-xs text-text-muted mt-0.5">已点亮宇宙
            </div>
            <div className="mt-2 h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${wtfPct}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 text-center">
            <div className="text-2xl font-bold text-text-primary">{stats?.cptiCollected ?? 0}</div>
            <div className="text-xs text-text-muted mt-0.5">已收集关系
            </div>
            <div className="mt-2 h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${cptiPct}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-10"
        >
          <h2 className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase">快捷入口</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/card/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-bg-elevated hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <span className="text-xl">🎨</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">WTF Card</div>
                <div className="text-xs text-text-muted">我的多宇宙人格卡</div>
              </div>
            </Link>
            <Link
              href="/cpti/gallery/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-bg-elevated hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <span className="text-xl">💕</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">CP 图鉴</div>
                <div className="text-xs text-text-muted">关系收藏与同步</div>
              </div>
            </Link>
            <Link
              href="/types/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-bg-elevated hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <span className="text-xl">📚</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">人设图鉴</div>
                <div className="text-xs text-text-muted">浏览全部29型</div>
              </div>
            </Link>
            <Link
              href="/mysti/collection/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-bg-elevated hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <span className="text-xl">✨</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">灵鉴收藏</div>
                <div className="text-xs text-text-muted">塔罗卡牌图鉴</div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-5"
        >
          <h2 className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase mb-4">账号</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">用户 ID</span>
              <span className="font-mono text-text-muted">{user?.id.slice(0, 8)}…</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">注册时间</span>
              <span className="text-text-muted">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="pt-3 border-t border-border-subtle">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full py-2.5 rounded-xl border border-border-subtle text-sm text-text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                {isLoggingOut ? '退出中...' : '退出登录'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.125A2.25 2.25 0 0115.75 20.25H5.25A2.25 2.25 0 013 18V7.5A2.25 2.25 0 015.25 5.25H9.375"
      />
    </svg>
  );
}
