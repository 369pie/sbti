'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/supabase/auth';
import { Logo } from '@/components/Logo';

// ─── Phase 1 导航：3 个主入口 + 我的，其余收进「更多」 ────────────────────────

const PRIMARY_LINKS = [
  { href: '/mysti/daily/', label: '今日一牌' },
  { href: '/xpti/', label: '关系报告' },
  { href: '/test/', label: '经典测试' },
];

const MORE_LINKS = [
  { href: '/cpti/', label: '我们合不合', desc: '双人关系深测' },
  { href: '/soulti/', label: '灵魂长信', desc: '安静地看见自己' },
  { href: '/mysti/', label: 'Mysti 灵鉴', desc: '塔罗陪伴 · 月卡' },
  { href: '/xpti/pricing/', label: '关系报告价格', desc: '单人 / 双人 / 年度' },
  { href: '/love/', label: '恋爱人设', desc: '你在爱里的样子' },
  { href: '/daily/', label: '今日状态', desc: '6 题看看今天的你' },
  { href: '/types/', label: '人格图鉴', desc: '全部类型一览' },
  { href: '/card/', label: '我的 WTF Card', desc: '你的人格档案' },
  { href: '/guide/', label: '测试说明', desc: '' },
  { href: '/about/', label: '关于我们', desc: '' },
];

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

export function Navigation() {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, displayName, loading: authLoading, refresh } = useAuth();
  const closeMore = useCallback(() => setMoreOpen(false), []);
  const closeUser = useCallback(() => setUserOpen(false), []);
  const moreRef = useClickOutside(moreOpen, closeMore);
  const userRef = useClickOutside(userOpen, closeUser);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client');
      const { error } = await signOut(createBrowserSupabaseClient());
      if (error && !error.toLowerCase().includes('auth session missing')) {
        window.alert(`退出失败：${error}`);
        return;
      }
      await refresh();
      setUserOpen(false);
      setMobileOpen(false);
      router.refresh();
    } catch {
      window.alert('退出失败，请稍后重试');
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, refresh, router]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="wtfti-global-nav sticky top-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4" aria-label="主导航">
        <Link href="/" prefetch={false} className="shrink-0 text-text-primary transition-opacity hover:opacity-80">
          <Logo height={26} />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-border-subtle bg-bg-secondary/75 p-1">
          {PRIMARY_LINKS.map(l => (
            <Link key={l.href} href={l.href} prefetch={false} className="nav-link">{l.label}</Link>
          ))}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              className={`nav-link inline-flex items-center gap-1 ${moreOpen ? 'nav-link-active' : ''}`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen(v => !v)}
            >
              更多 <span aria-hidden="true" className={`text-xs transition-transform ${moreOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {moreOpen && (
              <div className="nav-dropdown right-0 w-80 p-3">
                <div className="grid grid-cols-2 gap-1">
                  {MORE_LINKS.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      prefetch={false}
                      onClick={closeMore}
                      className="rounded-2xl px-3 py-2.5 hover:bg-bg-secondary transition-colors"
                    >
                      <span className="block text-sm font-medium text-text-primary">{l.label}</span>
                      {l.desc ? <span className="block text-xs text-text-muted">{l.desc}</span> : null}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {authLoading ? (
            <span className="site-skeleton h-9 w-16" />
          ) : isAuthenticated ? (
            <div ref={userRef} className="relative">
              <button type="button" className="nav-link" onClick={() => setUserOpen(v => !v)} aria-expanded={userOpen}>
                {displayName || '我的'}
              </button>
              {userOpen && (
                <div className="nav-dropdown right-0 w-44 p-2">
                  <Link href="/me/" prefetch={false} onClick={closeUser} className="block rounded-xl px-3 py-2 text-sm hover:bg-bg-secondary">个人中心</Link>
                  <Link href="/card/" prefetch={false} onClick={closeUser} className="block rounded-xl px-3 py-2 text-sm hover:bg-bg-secondary">我的 WTF Card</Link>
                  <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="block w-full text-left rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-bg-secondary">
                    {isLoggingOut ? '退出中…' : '退出登录'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/me/" prefetch={false} className="nav-link">我的</Link>
          )}
          <Link href="/xpti/test/" prefetch={false} className="btn btn-ink !min-h-0 !py-2 !px-4 text-sm">和 ta 一起测</Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle text-text-primary"
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto bg-bg-primary px-5 pb-10 pt-4">
          <div className="space-y-2">
            {PRIMARY_LINKS.map(l => (
              <Link key={l.href} href={l.href} prefetch={false} onClick={closeMobile} className="block rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-4 text-base font-medium text-text-primary">
                {l.label}
              </Link>
            ))}
            <Link href="/me/" prefetch={false} onClick={closeMobile} className="block rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-4 text-base font-medium text-text-primary">
              我的{isAuthenticated && displayName ? ` · ${displayName}` : ''}
            </Link>
          </div>
          <Link href="/xpti/test/" prefetch={false} onClick={closeMobile} className="btn btn-ink mt-5 w-full">和 ta 一起测</Link>
          <details className="mt-6 rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-text-secondary">更多</summary>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MORE_LINKS.map(l => (
                <Link key={l.href} href={l.href} prefetch={false} onClick={closeMobile} className="rounded-xl px-2 py-2 text-sm text-text-primary hover:bg-bg-secondary">
                  {l.label}
                </Link>
              ))}
            </div>
          </details>
          {isAuthenticated && (
            <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="mt-6 text-sm text-text-muted underline">
              {isLoggingOut ? '退出中…' : '退出登录'}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
