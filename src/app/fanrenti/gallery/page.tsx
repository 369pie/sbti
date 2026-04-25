import type { Metadata } from 'next';
import Link from 'next/link';
import { FR_REALMS, getFrCharacter } from '@/lib/fanrenti/characters';
import { FANRENTI_PERSONALITIES } from '@/lib/fanrenti/personalities';

export const metadata: Metadata = {
  title: '凡人TI · 修仙图鉴 | WTFTI',
  description: '29 种人格对应凡人修仙传正典角色，按境界分类浏览。道友请留步——你是哪位散修？',
};

const REALM_ORDER: Array<keyof typeof FR_REALMS> = [
  'mortal',
  'foundation',
  'core',
  'nascent',
  'deity',
  'demon',
];

export default function FanrentiGalleryPage() {
  // Group personalities by realm
  const grouped = REALM_ORDER.map((realmId) => {
    const realm = FR_REALMS[realmId];
    const items = FANRENTI_PERSONALITIES.filter((p) => {
      const char = getFrCharacter(p.characterId);
      return char?.realm === realmId;
    });
    return { realm, items };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2320 0%, #1a3a35 50%, #0f2320 100%)' }}
      >
        <div className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 20% 60%, #4a7a6a30 0%, transparent 60%), radial-gradient(ellipse at 80% 40%, #8b2a1a20 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-4xl mb-3">🪷</div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-bg-primary mb-3"
            style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif' }}
          >
            凡人TI · 修仙图鉴
          </h1>
          <p className="text-bg-primary/70 text-base mb-6">
            29 种道心档案 · 按境界分类 · 点击查看完整人格分析
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/fanrenti/test/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: 'var(--color-sage)', color: 'var(--color-bg-primary)' }}
            >
              🪷 测我的道心
            </Link>
            <Link
              href="/fanrenti/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-white/20 text-bg-primary/80 hover:border-white/40 hover:text-bg-primary transition-all"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery by realm */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {grouped.map(({ realm, items }) => (
          <section key={realm.id}>
            {/* Realm header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: realm.accent + '20', border: `2px solid ${realm.accent}40` }}
              >
                {realm.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {realm.name}
                </h2>
                <p className="text-sm text-text-muted">{realm.tagline}</p>
              </div>
              <div
                className="ml-auto text-xs font-mono px-2.5 py-1 rounded-full"
                style={{ background: realm.accent + '18', color: realm.accent }}
              >
                {items.length} 型
              </div>
            </div>

            {/* Divider with ink style */}
            <div
              className="h-px mb-6 opacity-30"
              style={{ background: `linear-gradient(to right, ${realm.accent}, transparent)` }}
            />

            {/* Character cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {items.map((p) => {
                const char = getFrCharacter(p.characterId);
                return (
                  <Link
                    key={p.slug}
                    href={`/fanrenti/result/${p.slug}/`}
                    className="group block rounded-xl border border-border-subtle bg-bg-elevated hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                  >
                    {/* Card top: emoji / art area */}
                    <div
                      className="relative aspect-square flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${realm.accent}18, ${realm.accent}08)`,
                      }}
                    >
                      <span className="text-4xl sm:text-5xl">{p.emoji}</span>
                      {/* Realm badge */}
                      <span
                        className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: realm.accent + '25', color: realm.accent }}
                      >
                        {realm.emoji}
                      </span>
                      {/* 朱红印章 watermark */}
                      <span
                        className="absolute bottom-1.5 left-2 text-[9px] font-medium opacity-50 tracking-wider rotate-[-3deg]"
                        style={{ color: 'var(--color-text-primary)', fontFamily: 'serif' }}
                      >
                        道友请留步
                      </span>
                    </div>

                    {/* Card info */}
                    <div className="px-3 py-3">
                      <div
                        className="text-[10px] font-mono tracking-widest mb-0.5"
                        style={{ color: realm.accent + 'b0' }}
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
        <p className="text-text-muted text-sm mb-4">道友，还不知道自己的道心？</p>
        <Link
          href="/fanrenti/test/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-bg-primary transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2a4d4f, #1a6b5a)' }}
        >
          🪷 测测我的道心
        </Link>
      </div>
    </div>
  );
}
