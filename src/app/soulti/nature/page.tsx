import type { Metadata } from 'next';
import Link from 'next/link';
import { SOULTI_PERSONALITY_TYPES } from '@/lib/soulti/personalities';
import { getSiteUrl } from '@/lib/site';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

export const metadata: Metadata = {
  title: 'SoulTI 自然力优先入口 · 从 32 种自然意象开始',
  description: '不从测试题开始，先看 32 种自然力——找到最像你的那一种，再揭示对应的历史女性灵魂原型。',
  alternates: { canonical: '/soulti/nature/' },
  openGraph: {
    title: 'SoulTI · 从自然开始',
    description: '32 种自然力 · 先看自然，再看她',
    url: getSiteUrl('/soulti/nature/'),
  },
};

export default function Page() {
  // Group by dominant element
  const groups: Array<{ key: string; label: string; desc: string; emoji: string; items: typeof SOULTI_PERSONALITY_TYPES }> = [
    { key: 'water', label: '水', desc: '流动、消融、承载', emoji: '💧', items: [] },
    { key: 'earth', label: '土 · 岩', desc: '扎根、封存、沉淀', emoji: '⛰️', items: [] },
    { key: 'fire', label: '火 · 光', desc: '燃烧、明灭、温度', emoji: '🔥', items: [] },
    { key: 'life', label: '生 · 长', desc: '生长、蜕变、繁殖', emoji: '🌱', items: [] },
  ];

  const bucket: Record<string, string> = {
    spring: 'water', glacier: 'water', hotspring: 'water', darkriver: 'water', lake: 'water', dew: 'water', rainbow: 'water', frost: 'water', mountainspring: 'water',
    obsidian: 'earth', geode: 'earth', basalt: 'earth', stalactite: 'earth', shale: 'earth', fossil: 'earth', rocksalt: 'earth', soil: 'earth', amber: 'earth', pearl: 'earth', vein: 'earth',
    firefly: 'fire', aurora: 'fire', starcore: 'fire',
    sprout: 'life', dandelion: 'life', mycelium: 'life', bamboo: 'life', rings: 'life', coral: 'life', butterfly: 'life', petal: 'life', driedflower: 'life',
  };

  for (const p of SOULTI_PERSONALITY_TYPES) {
    const g = groups.find(x => x.key === (bucket[p.slug] ?? 'earth'));
    g?.items.push(p);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: 'var(--color-text-muted)', opacity: 0.7 }}>
          NATURE FIRST
        </p>
        <h1 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}>
          从自然开始
        </h1>
        <p className="text-sm" style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)', lineHeight: 2 }}>
          不从测试题开始。<br />
          先看 32 种自然力——找到那种你一眼认出的，<br />
          再揭示和你同频的她。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/soulti/"
            className="px-4 py-1.5 rounded-full text-xs border"
            style={{ borderColor: 'rgba(139,115,85,0.3)', color: 'var(--color-text-secondary)', fontFamily: serifFont }}
          >
            也可以直接测
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        {groups.map(g => (
          <section
            key={g.key}
            className="rounded-3xl p-6 sm:p-7"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid rgba(139,115,85,0.15)' }}
          >
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl" aria-hidden>{g.emoji}</span>
              <div>
                <h2 className="text-lg" style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}>
                  {g.label}
                </h2>
                <p className="text-xs" style={{ fontFamily: serifFont, color: 'var(--color-text-muted)' }}>
                  {g.desc} · {g.items.length} 种
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {g.items.map(p => (
                <li key={p.slug}>
                  <Link
                    href={`/soulti/result/${p.slug}/`}
                    prefetch={false}
                    className="group block rounded-xl px-3 py-3 transition-all hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}10, transparent 70%)`,
                      border: `1px solid ${p.color}28`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg" aria-hidden>{p.emoji}</span>
                      <p className="text-sm truncate" style={{ fontFamily: serifFont, color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </p>
                    </div>
                    <p className="text-[10px] truncate" style={{ fontFamily: serifFont, color: 'var(--color-text-secondary)' }}>
                      {p.tagline}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
