import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllOriginSlugs, getOriginBySlug } from '@/lib/soulti/origin-index';
import { getSoultiPersonalityBySlug, getSoultiRarity } from '@/lib/soulti/personalities';
import { getSiteUrl } from '@/lib/site';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllOriginSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const o = getOriginBySlug(slug);
  if (!o) return {};
  return {
    title: `${o.zhName}（${o.name}） · SoulTI 灵魂原型`,
    description: `${o.zhName}（${o.era}）— ${o.description.slice(0, 80)}`,
    alternates: { canonical: `/soulti/origin/${slug}/` },
    openGraph: {
      title: `${o.zhName} · SoulTI 灵魂原型`,
      description: o.description.slice(0, 120),
      url: getSiteUrl(`/soulti/origin/${slug}/`),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const o = getOriginBySlug(slug);
  if (!o) notFound();

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.7 }}>
          SOUL ORIGIN · {o.era}
        </p>
        <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
          {o.zhName}
        </h1>
        <p className="text-sm mb-8" style={{ fontFamily: monoFont, color: '#9a918a' }}>
          {o.name}
        </p>

        <blockquote
          className="mx-auto max-w-xl px-6 py-5 rounded-2xl"
          style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.18)', fontFamily: serifFont, color: '#2D2A26' }}
        >
          <p className="text-base leading-[2]" style={{ whiteSpace: 'pre-line' }}>&ldquo;{o.quote}&rdquo;</p>
          <p className="mt-3 text-[11px] tracking-[0.2em]" style={{ color: '#8b7355', fontFamily: monoFont }}>
            — {o.quoteSource}
          </p>
        </blockquote>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-16">
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ fontFamily: monoFont, color: '#8b7355' }}>
            Her Story
          </p>
          <p className="text-[15px] leading-[2.1]" style={{ fontFamily: serifFont, color: '#3a352f' }}>
            {o.description}
          </p>
        </section>

        <section className="mt-8">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4 text-center" style={{ fontFamily: monoFont, color: '#8b7355' }}>
            Resonates with · 共振的自然力
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {o.types.map(t => {
              const p = getSoultiPersonalityBySlug(t.typeSlug);
              if (!p) return null;
              const rarity = getSoultiRarity(p.slug);
              return (
                <Link
                  key={t.typeSlug}
                  href={`/soulti/result/${t.typeSlug}/`}
                  prefetch={false}
                  className="block rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${p.color}10, transparent 70%)`,
                    border: `1px solid ${p.color}28`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl" aria-hidden>{p.emoji}</span>
                    <div>
                      <p className="text-[10px] tracking-[0.25em]" style={{ fontFamily: monoFont, color: p.color }}>
                        {p.code}
                      </p>
                      <p className="text-base" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
                        {p.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-[1.8] mb-2" style={{ fontFamily: serifFont, color: '#6a6054' }}>
                    {p.tagline}
                  </p>
                  <p className="text-[10px]" style={{ fontFamily: monoFont, color: rarity.color }}>
                    {rarity.label} · 仅 {rarity.populationPct.toFixed(1)}% 的人是这种
                  </p>
                  <p className="mt-2 text-[10px]" style={{ fontFamily: serifFont, color: '#8a7f72' }}>
                    {t.tags.slice(0, 4).join(' · ')}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <nav className="mt-10 flex flex-wrap justify-center gap-3 text-sm" style={{ fontFamily: serifFont }}>
          <Link href="/soulti/origin/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            ← 返回 32 位
          </Link>
          <Link href="/soulti/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            开启共振
          </Link>
        </nav>
      </main>
    </div>
  );
}
