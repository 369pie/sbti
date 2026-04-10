'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/test', label: '开始测试' },
  { href: '/types', label: '人格图鉴' },
  { href: '/cp', label: 'CP配对' },
];

export function Navigation() {
  const pathname = usePathname();
  const isTestPage = pathname === '/test';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isTestPage
          ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle'
          : 'bg-bg-primary/60 backdrop-blur-xl border-b border-border-subtle'
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm tracking-widest text-text-secondary hover:text-accent transition-colors"
        >
          SBTI
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-text-primary bg-bg-tertiary'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
