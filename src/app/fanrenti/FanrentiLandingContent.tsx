'use client';

import Link from 'next/link';
import { FR_CHARACTERS, FR_REALMS } from '@/lib/fanrenti/characters';
import { FanrentiTheme, FanrentiSealIcon, FanrentiScrollOrnament } from '@/components/fanrenti/FanrentiTheme';

const FEATURED = FR_CHARACTERS.slice(0, 8);

export default function FanrentiLandingContent() {
  return (
    <FanrentiTheme>
      {/* Hero */}
      <section className="relative">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
          <div className="animate-fade-up">
            <span className="inline-block text-[11px] tracking-[0.35em] mb-6 uppercase" style={{ color: 'var(--color-text-secondary)' }}>
              WTFTI · 凡人修仙宇宙
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.15] mb-4 fr-ink-text"
                style={{ fontFamily: "'Noto Serif SC', 'Songti SC', serif" }}>
              凡人TI · 修仙
            </h1>
            <p className="text-lg sm:text-xl mb-4" style={{ color: 'var(--color-text-secondary)', fontFamily: "'Noto Serif SC', serif" }}>
              你在凡人修仙传里，是哪一号修士？
            </p>

            <div className="max-w-xs mx-auto my-6">
              <FanrentiScrollOrnament />
            </div>

            <p className="max-w-xl mx-auto text-base leading-relaxed mb-8" style={{ color: 'var(--color-text-primary)' }}>
              3 分钟情境题，把你对号入座到 <b>12 位正典角色 + 6 个境界</b>。
              <br className="hidden sm:inline" />
              结果卡是一张<b>入门令牌</b>，可直接发朋友圈。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/fanrenti/test/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-base transition-all shadow-lg"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg-primary)',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                ? 开始入门试炼
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/wtfti/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border text-sm transition-all"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                经典 WTFTI
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: '12 位', label: '正典角色' },
              { value: '6 境', label: '修为气质' },
              { value: '~ 3 分钟', label: '试炼时长' },
            ].map(stat => (
              <div key={stat.label} className="fr-paper-card rounded-2xl px-4 py-5 text-center">
                <div className="text-xl sm:text-2xl font-semibold fr-ink-text" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {stat.value}
                </div>
                <div className="text-[11px] mt-1 tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Realms */}
      <section className="relative py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs tracking-[0.35em] uppercase block mb-2" style={{ color: 'var(--color-gold)' }}>
              · Six Realms ·
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold fr-ink-text" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              六个境界，六种道心
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {(['mortal', 'foundation', 'core', 'nascent', 'deity', 'demon'] as const).map(id => {
              const r = FR_REALMS[id];
              return (
                <div
                  key={id}
                  className="fr-paper-card rounded-2xl p-5 text-center"
                  style={{ borderColor: `${r.accent}40` }}
                >
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      background: `${r.accent}18`,
                      border: `1.5px solid ${r.accent}45`,
                    }}
                  >
                    {r.emoji}
                  </div>
                  <div
                    className="text-base font-semibold mb-1"
                    style={{ color: r.textAccent, fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {r.name}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                    {r.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured characters */}
      <section className="relative py-12 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <span className="text-xs tracking-[0.35em] uppercase block mb-2" style={{ color: 'var(--color-gold)' }}>
              · Possible Matches ·
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold fr-ink-text" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              你可能是谁
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURED.map((c, i) => {
              const r = FR_REALMS[c.realm];
              return (
                <div
                  key={c.id}
                  className="fr-paper-card rounded-2xl p-4 flex flex-col items-center text-center animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms`, borderColor: `${r.accent}35` }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-xl"
                    style={{
                      background: `${r.accent}20`,
                      border: `1.5px solid ${r.accent}45`,
                    }}
                  >
                    {r.emoji}
                  </div>
                  <div
                    className="text-sm font-semibold fr-ink-text leading-tight"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {c.name}
                  </div>
                  <div className="text-[10px] mt-1 tracking-widest" style={{ color: r.textAccent }}>
                    {r.name}
                  </div>
                  <p className="text-[11px] mt-2 leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                    {c.traits[0]}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10 flex items-center justify-center gap-3">
            <FanrentiSealIcon text="凡人" />
            <Link
              href="/fanrenti/test/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium shadow"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-bg-primary)',
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              入门问道 →
            </Link>
            <Link
              href="/fanrenti/gallery/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-accent)',
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              📖 修士图鉴
            </Link>
          </div>
        </div>
      </section>
    </FanrentiTheme>
  );
}
