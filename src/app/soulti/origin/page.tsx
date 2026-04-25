import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllOrigins } from '@/lib/soulti/origin-index';
import { getSiteUrl } from '@/lib/site';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

export const metadata: Metadata = {
  title: 'SoulTI · 32 位历史女性灵魂原型索引',
  description: '从林徽因到伍尔夫，从上官婉儿到波伏娃——SoulTI 对应的 32 位历史女性灵魂原型完整索引。',
  alternates: { canonical: '/soulti/origin/' },
  openGraph: {
    title: 'SoulTI · 32 位历史女性灵魂原型',
    description: '每一种自然力，对应一位曾以同样方式燃烧过的她。',
    url: getSiteUrl('/soulti/origin/'),
  },
};

export default function Page() {
  const origins = getAllOrigins();
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: 'var(--color-text-muted)', opacity: 0.7 }}>
          SOUL ORIGIN · {origins.length} WOMEN
        </p>
        <h1 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}>
          她们以你的频率燃烧过
        </h1>
        <p className="text-sm sm:text-base" style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)', lineHeight: 2 }}>
          每一种自然力，对应一位历史上的她。<br />
          点开任意一位，阅读她的篇章与对应的自然意象。
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-24">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {origins.map(o => (
            <li key={o.slug}>
              <Link
                href={`/soulti/origin/${o.slug}/`}
                prefetch={false}
                className="block rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--color-bg-secondary)', border: '1px solid rgba(139,115,85,0.15)' }}
              >
                <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ fontFamily: monoFont, color: 'var(--color-text-muted)' }}>
                  {o.era}
                </p>
                <h2 className="text-xl mb-1" style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}>
                  {o.zhName}
                </h2>
                <p className="text-xs mb-3" style={{ fontFamily: monoFont, color: 'var(--color-text-muted)' }}>
                  {o.name}
                </p>
                <p className="text-xs leading-[1.9]" style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)' }}>
                  共振自然力：{o.types.map(t => `#${t.typeSlug}`).join(' · ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <nav className="mt-10 flex flex-wrap justify-center gap-3 text-sm" style={{ fontFamily: serifFont }}>
          <Link href="/soulti/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: 'var(--color-text-secondary)' }}>
            ← 开启测试
          </Link>
          <Link href="/soulti/map/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: 'var(--color-text-secondary)' }}>
            自然图谱 →
          </Link>
        </nav>
      </main>
    </div>
  );
}
