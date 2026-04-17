import Link from 'next/link';
import { SOULTI_PERSONALITY_TYPES, getSoultiRarity, getSoultiResonance } from '@/lib/soulti/personalities';
import { SOULTI_DIMENSIONS } from '@/lib/soulti/dimensions';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

/**
 * Cluster 32 types by T/S (J1 — Tide) × R/W (J2 — Root) into 4 quadrants,
 * then inside each quadrant sort by J3/J4/J5 so related types sit next to each other.
 */
export default function SoultiMapContent() {
  const quadrants: Array<{ id: string; label: string; desc: string; items: typeof SOULTI_PERSONALITY_TYPES }> = [
    { id: 'TR', label: 'T · R — 涌泉与根', desc: '向外涌动 + 扎根现实', items: [] },
    { id: 'TW', label: 'T · W — 涌泉与风', desc: '向外涌动 + 拥抱未知', items: [] },
    { id: 'SR', label: 'S · R — 静潭与根', desc: '向内沉淀 + 扎根现实', items: [] },
    { id: 'SW', label: 'S · W — 静潭与风', desc: '向内沉淀 + 拥抱未知', items: [] },
  ];
  for (const p of SOULTI_PERSONALITY_TYPES) {
    const j1 = p.profile.J1 === 'H' ? 'T' : 'S';
    const j2 = p.profile.J2 === 'H' ? 'R' : 'W';
    const id = `${j1}${j2}`;
    quadrants.find(q => q.id === id)?.items.push(p);
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.7 }}>
          NATURE MAP · 32 TYPES
        </p>
        <h1 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: serifFont, color: '#2D2A26', letterSpacing: '0.02em' }}>
          灵魂图谱
        </h1>
        <p className="text-sm sm:text-base" style={{ fontFamily: serifFont, color: '#6a6054', lineHeight: 2 }}>
          32 种自然力 × 5 轴聚类 · 一眼看清你和每个人的距离
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs" style={{ fontFamily: monoFont, color: '#9a918a' }}>
          {SOULTI_DIMENSIONS.map(d => (
            <span key={d.id} className="px-3 py-1 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.2)' }}>
              {d.id} · {d.name}
            </span>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quadrants.map(q => (
            <section
              key={q.id}
              className="rounded-3xl p-6 sm:p-7"
              style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: monoFont, color: '#8b7355' }}>
                Quadrant {q.id}
              </p>
              <h2 className="text-lg mb-1" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                {q.label}
              </h2>
              <p className="text-xs mb-5" style={{ fontFamily: serifFont, color: '#9a918a' }}>
                {q.desc} · 共 {q.items.length} 种
              </p>

              <ul className="grid grid-cols-2 gap-2">
                {q.items.map(p => {
                  const rarity = getSoultiRarity(p.slug);
                  const r = getSoultiResonance(p.slug);
                  return (
                    <li key={p.slug}>
                      <Link
                        href={`/soulti/result/${p.slug}/`}
                        prefetch={false}
                        className="group block rounded-xl px-3 py-3 transition-all hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${p.color}10, transparent 70%)`,
                          border: `1px solid ${p.color}25`,
                        }}
                      >
                        <div className="flex items-center gap-2">
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
                        <p className="mt-2 text-[10px] flex items-center gap-2" style={{ fontFamily: monoFont, color: rarity.color }}>
                          <span>{rarity.label}</span>
                          <span style={{ color: '#b0a89e' }}>· {rarity.populationPct.toFixed(1)}%</span>
                        </p>
                        {r?.soulOrigin && (
                          <p className="mt-1 text-[10px] truncate" style={{ fontFamily: serifFont, color: '#8a7f72' }}>
                            共振 · {r.soulOrigin.zhName}
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-3 text-sm" style={{ fontFamily: serifFont }}>
          <Link href="/soulti/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            ← 开启测试
          </Link>
          <Link href="/soulti/origin/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            32 位历史女性 →
          </Link>
          <Link href="/soulti/rarity/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            稀有度榜 →
          </Link>
        </nav>
      </main>
    </div>
  );
}
