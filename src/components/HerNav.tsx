'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

// Audit 2026-10-20 Phase 1: 测试 · 今日 · 我和他 · 美我 · 我 (树洞 is reached from 今日).
const TABS = [
  { href: '/start/', label: '测试', match: ['/start/', '/test/'] },
  { href: '/today/', label: '今日', match: ['/today/', '/bottle/'] },
  { href: '/xpti/couple/', label: '我和他', match: ['/xpti/couple/'] },
  { href: '/mirror/', label: '美我', match: ['/mirror/'] },
  { href: '/me/', label: '我', match: ['/me/'] },
];

// The bottom tab bar only shows on hub pages, never inside a quiz / result / couple flow,
// so it can't cover the first answer option.
const TAB_BAR_PATHS = new Set(['/', '/start/', '/today/', '/mirror/', '/me/', '/bottle/']);

function isActive(pathname: string, tab: (typeof TABS)[number]) {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return tab.match.some((m) => (m === '/start/' || m === '/today/' || m === '/me/' || m === '/bottle/' ? p === m : p.startsWith(m)));
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
                style={{ color: isActive(pathname, t) ? 'var(--s-accent-text)' : 'var(--s-ink-2)', fontWeight: isActive(pathname, t) ? 500 : 400 }}
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
              const on = isActive(pathname, t);
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
