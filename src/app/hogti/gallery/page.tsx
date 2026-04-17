import type { Metadata } from 'next';
import Link from 'next/link';
import { HOG_HOUSES, getHogCharacter } from '@/lib/hogti/characters';
import { HOGTI_PERSONALITIES } from '@/lib/hogti/personalities';
import { withBasePath } from '@/lib/site';

export const metadata: Metadata = {
  title: '霍格沃茨TI · 人格图鉴 | WTFTI',
  description: '29 种人格对应霍格沃茨正典角色，按学院分类浏览。分院帽已就绪，你是哪一位？',
};

const HOUSE_ORDER: Array<keyof typeof HOG_HOUSES> = [
  'gryffindor',
  'slytherin',
  'ravenclaw',
  'hufflepuff',
  'faculty',
];

export default function HogtiGalleryPage() {
  // Group personalities by house
  const grouped = HOUSE_ORDER.map((houseId) => {
    const house = HOG_HOUSES[houseId];
    const items = HOGTI_PERSONALITIES.filter((p) => {
      const char = getHogCharacter(p.characterId);
      return char?.house === houseId;
    });
    return { house, items };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1535 0%, #2e2460 50%, #1a1535 100%)' }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #f5c842 0%, transparent 50%), radial-gradient(circle at 80% 50%, #a62b1f 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            霍格沃茨 · 人格图鉴
          </h1>
          <p className="text-white/70 text-base mb-6">
            29 种人格档案 · 按学院分类 · 点击查看完整分析
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/hogti/test/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: '#f5c842', color: '#1a1535' }}
            >
              ⚡ 测测我是谁
            </Link>
            <Link
              href="/hogti/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery by house */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {grouped.map(({ house, items }) => (
          <section key={house.id}>
            {/* House header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: house.accent + '20', border: `2px solid ${house.accent}40` }}
              >
                {house.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {house.name}
                  <span className="ml-2 text-sm font-normal text-text-muted">{house.nameEn}</span>
                </h2>
                <p className="text-sm text-text-muted">{house.tagline}</p>
              </div>
              <div
                className="ml-auto text-xs font-mono px-2.5 py-1 rounded-full"
                style={{ background: house.accent + '18', color: house.accent }}
              >
                {items.length} 型
              </div>
            </div>

            {/* Character cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {items.map((p) => {
                const char = getHogCharacter(p.characterId);
                return (
                  <Link
                    key={p.slug}
                    href={`/hogti/result/${p.slug}/`}
                    className="group block rounded-xl border border-border-subtle hover:border-opacity-60 bg-bg-elevated hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                    style={{ ['--house-accent' as string]: house.accent }}
                  >
                    {/* Card top: emoji/image area */}
                    <div
                      className="relative aspect-square flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${house.accent}18, ${house.accent}08)`,
                      }}
                    >
                      {/* Emoji fallback (character will be shown if image loads) */}
                      <span className="text-4xl sm:text-5xl">{p.emoji}</span>
                      {/* House badge */}
                      <span
                        className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: house.accent + '25', color: house.accent }}
                      >
                        {house.emoji}
                      </span>
                    </div>

                    {/* Card info */}
                    <div className="px-3 py-3">
                      <div
                        className="text-[10px] font-mono tracking-widest mb-0.5 uppercase"
                        style={{ color: house.accent + 'b0' }}
                      >
                        {p.number} · {char?.nameEn ?? p.characterId}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary truncate mb-1">
                        {char?.name ?? p.characterId}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {p.tagline}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-border-subtle py-12 text-center">
        <p className="text-text-muted text-sm mb-4">还不知道你是哪一型？</p>
        <Link
          href="/hogti/test/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3a2f6b, #7c3aed)' }}
        >
          ⚡ 分院帽测测我
        </Link>
      </div>
    </div>
  );
}
