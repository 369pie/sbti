'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

// Design system v3 §6: five tabs, no universe mega-menu.
const TABS = [
  { href: '/today/', label: '今日' },
  { href: '/start/', label: '测我' },
  { href: '/mirror/', label: '美我' },
  { href: '/bottle/', label: '懂我' },
  { href: '/me/', label: '我的' },
];

// The bottom tab bar only shows on tab roots, so it never covers a quiz or result flow.
const TAB_BAR_PATHS = new Set(['/', ...TABS.map((t) => t.href)]);

function isActive(pathname: string, href: string) {
  return pathname === href || pathname === href.slice(0, -1);
}

export function HerNav() {
  const pathname = usePathname() ?? '/';
  const { isAuthenticated, loading } = useAuth();
  const showTabBar = TAB_BAR_PATHS.has(pathname.endsWith('/') ? pathname : `${pathname}/`);

  return (
    <>
      <header className="skin-journal sticky top-0 z-40 border-b" style={{ borderColor: 'var(--s-line)', background: 'color-mix(in oklab, var(--s-bg) 88%, transparent)', backdropFilter: 'blur(14px)' }}>
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" prefetch={false} className="s-en text-[21px] font-semibold tracking-[0.16em]" style={{ color: 'var(--s-ink)' }}>
            WTFTI
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                prefetch={false}
                className="text-sm transition-colors"
                style={{ color: isActive(pathname, t.href) ? 'var(--s-accent-text)' : 'var(--s-ink-2)', fontWeight: isActive(pathname, t.href) ? 500 : 400 }}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          {!loading && !isAuthenticated && (
            <Link href="/auth/login/" prefetch={false} className="text-[13px]" style={{ color: 'var(--s-ink-2)' }}>
              登录
            </Link>
          )}
        </div>
      </header>

      {showTabBar && (
        <>
          <nav
            className="her-tabbar skin-journal fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
            style={{ borderColor: 'var(--s-line)', background: 'color-mix(in oklab, var(--s-bg) 90%, transparent)', backdropFilter: 'blur(16px)' }}
          >
            {TABS.map((t) => {
              const on = isActive(pathname, t.href);
              return (
                <Link key={t.href} href={t.href} prefetch={false} className="flex h-[64px] flex-col items-center justify-center gap-1.5 text-[11px]" style={{ color: on ? 'var(--s-accent-text)' : 'var(--s-mute)', fontWeight: on ? 500 : 400 }}>
                  <span className="h-[22px] w-[22px] rounded-full border-[1.5px]" style={{ borderColor: 'currentColor', background: on ? 'var(--s-accent-soft)' : 'transparent' }} />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </>
  );
}
