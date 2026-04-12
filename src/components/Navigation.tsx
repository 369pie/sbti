'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/test/', label: '开始测试' },
  { href: '/wtfti/', label: '🤯 WTFTI' },
  { href: '/types/', label: '人设图鉴' },
  { href: '/cp/', label: 'CP配对' },
  { href: '/work/', label: '打工人设' },
  { href: '/love/', label: '恋爱人设' },
  { href: '/daily/', label: '今日模式' },
  { href: '/drunk/', label: '酒后人设' },
  { href: '/squad/', label: '组局测试' },
  { href: '/combo/', label: '人格拼盘' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle"
    >
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest text-accent hover:text-accent/80 transition-colors shrink-0"
        >
          SBTI
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-[13px] sm:text-sm whitespace-nowrap transition-all duration-200 shrink-0 ${
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
