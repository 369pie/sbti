'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/test', label: '开始测试' },
  { href: '/types', label: '人格图鉴' },
  { href: '/cp', label: 'CP配对' },
  { href: '/work', label: '打工人格' },
  { href: '/love', label: '恋爱人格' },
  { href: '/daily', label: '今日状态' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle"
    >
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest text-accent hover:text-accent/80 transition-colors"
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
