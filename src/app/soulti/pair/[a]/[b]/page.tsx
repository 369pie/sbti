import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSoultiPair, normalizePairSlugs } from '@/lib/soulti/pair';
import { getAllSoultiSlugs, getSoultiResonance } from '@/lib/soulti/personalities';
import { getSiteUrl } from '@/lib/site';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

type PageProps = { params: Promise<{ a: string; b: string }> };

export async function generateStaticParams() {
  // Pre-render only canonical (a<b) pairs to avoid 32*32 = 1024 pages. 32*31/2 = 496.
  const slugs = getAllSoultiSlugs();
  const pairs: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      pairs.push({ a: slugs[i], b: slugs[j] });
    }
  }
  return pairs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { a, b } = await params;
  const [ca, cb] = normalizePairSlugs(a, b);
  const pair = getSoultiPair(ca, cb);
  if (!pair) return {};
  return {
    title: `${pair.a.name} × ${pair.b.name} · SoulTI 双人共振`,
    description: `${pair.label} · ${pair.tagline}`,
    alternates: { canonical: `/soulti/pair/${ca}/${cb}/` },
    openGraph: {
      title: `${pair.a.name} × ${pair.b.name} · ${pair.label}`,
      description: pair.tagline,
      url: getSiteUrl(`/soulti/pair/${ca}/${cb}/`),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { a, b } = await params;
  const [ca, cb] = normalizePairSlugs(a, b);
  const pair = getSoultiPair(ca, cb);
  if (!pair) notFound();

  const aR = getSoultiResonance(pair.a.slug);
  const bR = getSoultiResonance(pair.b.slug);

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.7 }}>
          SoulTI × Pair
        </p>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5">
          <div className="text-center">
            <div className="text-4xl mb-1" aria-hidden>{pair.a.emoji}</div>
            <p className="text-[10px] tracking-[0.2em]" style={{ fontFamily: monoFont, color: pair.a.color }}>{pair.a.code}</p>
            <p className="text-base" style={{ fontFamily: serifFont, color: '#2D2A26' }}>{pair.a.name}</p>
          </div>
          <div className="text-2xl opacity-40" style={{ fontFamily: serifFont }}>×</div>
          <div className="text-center">
            <div className="text-4xl mb-1" aria-hidden>{pair.b.emoji}</div>
            <p className="text-[10px] tracking-[0.2em]" style={{ fontFamily: monoFont, color: pair.b.color }}>{pair.b.code}</p>
            <p className="text-base" style={{ fontFamily: serifFont, color: '#2D2A26' }}>{pair.b.name}</p>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
          {pair.label}
        </h1>
        <p className="text-sm mb-6" style={{ fontFamily: serifFont, color: '#6a6054', lineHeight: 2 }}>
          {pair.tagline}
        </p>

        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full" style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.2)' }}>
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: monoFont, color: '#8b7355' }}>
            共振指数
          </span>
          <span className="text-xl" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
            {pair.resonanceScore}
          </span>
          <span className="text-[10px]" style={{ fontFamily: monoFont, color: '#9a918a' }}>/ 100</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-16 space-y-6">
        {/* 5 axes */}
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355' }}>
            Five Axes · 五轴对比
          </p>
          <ul className="space-y-5">
            {pair.dimensions.map(d => (
              <li key={d.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                    {d.id} · {d.name}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: monoFont, color: d.distance === 'same' ? '#5b8a72' : d.distance === 'near' ? '#c9a96e' : '#b07850' }}>
                    {d.distance === 'same' ? '同频' : d.distance === 'near' ? '相近' : '极性'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] mb-2" style={{ fontFamily: monoFont, color: '#6a6054' }}>
                  <span className="px-2 py-0.5 rounded" style={{ background: '#F2ECE4' }}>A · {d.poleA}/{d.poleB} · {d.aLevel}</span>
                  <span className="px-2 py-0.5 rounded" style={{ background: '#F2ECE4' }}>B · {d.poleA}/{d.poleB} · {d.bLevel}</span>
                </div>
                <p className="text-[13px] leading-[1.9]" style={{ fontFamily: serifFont, color: '#3a352f' }}>
                  {d.commentary}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Narrative */}
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355' }}>
            Three Chapters · 三章
          </p>
          <div className="space-y-5 text-[14px] leading-[2]" style={{ fontFamily: serifFont, color: '#3a352f' }}>
            <div>
              <p className="text-xs mb-2" style={{ fontFamily: monoFont, color: '#5b8a72', letterSpacing: '0.2em' }}>BEST · 最好的章节</p>
              <p>{pair.narrative.bestChapter}</p>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ fontFamily: monoFont, color: '#b07850', letterSpacing: '0.2em' }}>SHADOW · 阴影章节</p>
              <p>{pair.narrative.shadowChapter}</p>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ fontFamily: monoFont, color: '#7a6b8a', letterSpacing: '0.2em' }}>GROWTH · 成长章节</p>
              <p>{pair.narrative.growthChapter}</p>
            </div>
          </div>
        </section>

        {/* Historical women */}
        {(aR || bR) && (
          <section className="rounded-3xl p-6 sm:p-8 text-center" style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355' }}>
              Historical Resonance · 历史共振
            </p>
            <p className="text-sm" style={{ fontFamily: serifFont, color: '#3a352f', lineHeight: 2 }}>
              {aR?.soulOrigin?.zhName}（{aR?.soulOrigin?.era}）× {bR?.soulOrigin?.zhName}（{bR?.soulOrigin?.era}）<br />
              她们在历史里没能相遇，但你们此刻相遇了。
            </p>
          </section>
        )}

        <nav className="mt-6 flex flex-wrap justify-center gap-3 text-sm" style={{ fontFamily: serifFont }}>
          <Link href={`/soulti/result/${pair.a.slug}/`} className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            {pair.a.name} 详情
          </Link>
          <Link href={`/soulti/result/${pair.b.slug}/`} className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            {pair.b.name} 详情
          </Link>
          <Link href="/soulti/pair/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            测试另一对
          </Link>
        </nav>
      </main>
    </div>
  );
}
