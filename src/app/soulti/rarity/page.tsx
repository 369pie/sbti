import type { Metadata } from 'next';
import Link from 'next/link';
import { SOULTI_PERSONALITY_TYPES, getSoultiRarity } from '@/lib/soulti/personalities';
import type { SoultiRarityTier } from '@/lib/soulti/personalities';
import { getSiteUrl } from '@/lib/site';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

export const metadata: Metadata = {
  title: 'SoulTI 稀有度榜 · 32 种自然力的稀有等级',
  description: '从极稀有到常见，SoulTI 32 种自然人格的完整稀有度图谱。看看你是不是那个 1.2% 的星核。',
  alternates: { canonical: '/soulti/rarity/' },
  openGraph: {
    title: 'SoulTI 稀有度榜',
    description: '32 种自然力 · 5 级稀有度 · 按 populationPct 排序',
    url: getSiteUrl('/soulti/rarity/'),
  },
};

const TIER_ORDER: SoultiRarityTier[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
const TIER_INFO: Record<SoultiRarityTier, { zh: string; blurb: string }> = {
  legendary: { zh: '极稀有', blurb: '低于 1.5% 的人属于这个人格' },
  epic: { zh: '稀有', blurb: '约 2% 左右' },
  rare: { zh: '较少见', blurb: '约 3% 左右' },
  uncommon: { zh: '少见', blurb: '约 4% 左右' },
  common: { zh: '常见', blurb: '约 5% 左右' },
};

export default function Page() {
  const grouped = TIER_ORDER.map(tier => ({
    tier,
    items: SOULTI_PERSONALITY_TYPES
      .map(p => ({ p, rarity: getSoultiRarity(p.slug) }))
      .filter(x => x.rarity.tier === tier)
      .sort((a, b) => a.rarity.populationPct - b.rarity.populationPct),
  }));

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.7 }}>
          RARITY LEADERBOARD
        </p>
        <h1 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
          稀有度榜
        </h1>
        <p className="text-sm" style={{ fontFamily: serifFont, color: '#6a6054', lineHeight: 2 }}>
          全部 32 种自然力按 populationPct 由稀到常排列。<br />
          看看你是不是那个 1.2% 的星核。
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        {grouped.map(g => (
          <section
            key={g.tier}
            className="rounded-3xl p-6 sm:p-7"
            style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}
          >
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: monoFont, color: getSoultiRarity(g.items[0]?.p.slug ?? '').color }}>
                  {g.tier}
                </p>
                <h2 className="text-xl" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                  {TIER_INFO[g.tier].zh}
                </h2>
              </div>
              <p className="text-[11px]" style={{ fontFamily: monoFont, color: '#9a918a' }}>
                {TIER_INFO[g.tier].blurb} · {g.items.length} 种
              </p>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {g.items.map(({ p, rarity }) => (
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
                      <div className="min-w-0">
                        <p className="text-[10px] tracking-[0.2em]" style={{ fontFamily: monoFont, color: p.color }}>
                          {p.code}
                        </p>
                        <p className="text-sm truncate" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                          {p.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px]" style={{ fontFamily: monoFont, color: rarity.color }}>
                      {rarity.populationPct.toFixed(1)}%
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <nav className="flex flex-wrap justify-center gap-3 text-sm pt-4" style={{ fontFamily: serifFont }}>
          <Link href="/soulti/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            ← 开启测试
          </Link>
          <Link href="/soulti/map/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            自然图谱
          </Link>
          <Link href="/soulti/origin/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            32 位女性
          </Link>
        </nav>
      </main>
    </div>
  );
}
