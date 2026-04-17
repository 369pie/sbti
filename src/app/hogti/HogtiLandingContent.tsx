'use client';

import Link from 'next/link';
import { HOG_CHARACTERS, HOG_HOUSES } from '@/lib/hogti/characters';
import { HogtiTheme, HogtiCrestFrame } from '@/components/hogti/HogtiTheme';

const FEATURED = HOG_CHARACTERS.slice(0, 8);

export default function HogtiLandingContent() {
  return (
    <HogtiTheme>
      {/* Hero */}
      <section className="relative">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="animate-fade-up">
            <span className="inline-block text-[11px] font-mono tracking-[0.3em] text-amber-100/90 mb-6 uppercase">
              WTFTI · 魔法宇宙
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.12] mb-5 text-amber-50 drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              <span className="block" style={{ fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}>
                Hogwarts · TI
              </span>
              <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl text-amber-200/90 tracking-wide">
                你是哪位霍格沃茨同学？
              </span>
            </h1>

            <p className="text-amber-50/90 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-9">
              3 分钟情境题，把你对号入座到 <b>15 位标志性角色 + 4 个学院</b>。
              <br className="hidden sm:inline" />
              结果卡可直接发小红书 / 朋友圈，附魔法录取通知书风格。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/hogti/test/"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-100 text-[#2a1e0f] font-medium text-base hover:bg-amber-50 transition-all duration-200 shadow-lg"
                style={{ fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}
              >
                ⚡ 开始分院
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/wtfti/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-amber-200/30 text-amber-100/80 text-sm hover:text-amber-50 hover:border-amber-200/60 transition-all"
              >
                经典 WTFTI
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: '15 位', label: '主角角色' },
              { value: '4 个', label: '学院' },
              { value: '~ 3 分钟', label: '分院时长' },
            ].map(stat => (
              <div
                key={stat.label}
                className="hogti-parchment-card rounded-2xl px-4 py-5 text-center"
              >
                <div className="text-xl sm:text-2xl font-semibold hogti-ink font-mono tracking-tight">{stat.value}</div>
                <div className="text-[11px] mt-1 tracking-widest uppercase" style={{ color: '#6a4e1f' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Houses section */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-[0.3em] uppercase hogti-ink/70 block mb-2" style={{ color: '#8a6a2f' }}>
              · The Four Houses ·
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold hogti-ink">
              四个学院，四种人格底色
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {(['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'] as const).map(id => {
              const h = HOG_HOUSES[id];
              return (
                <div
                  key={id}
                  className="hogti-parchment-card rounded-2xl p-5 text-center"
                  style={{ borderColor: `${h.accent}40` }}
                >
                  <HogtiCrestFrame className="w-16 h-16 mx-auto mb-3" color={h.accent}>
                    <span className="text-2xl">{h.emoji}</span>
                  </HogtiCrestFrame>
                  <div
                    className="text-base font-semibold mb-1"
                    style={{ color: h.textAccent, fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}
                  >
                    {h.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: h.accent }}>
                    {h.nameEn}
                  </div>
                  <p className="text-xs leading-relaxed hogti-ink/80" style={{ color: '#4a3a1e' }}>
                    {h.tagline}
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
            <span className="text-xs font-mono tracking-[0.3em] uppercase block mb-2" style={{ color: '#8a6a2f' }}>
              · Possible Outcomes ·
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold hogti-ink">你可能是谁</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURED.map((c, i) => {
              const h = HOG_HOUSES[c.house];
              return (
                <div
                  key={c.id}
                  className="hogti-parchment-card rounded-2xl p-4 flex flex-col items-center text-center animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms`, borderColor: `${h.accent}35` }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-2xl shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${h.accent}25, ${h.accent}10)`,
                      border: `1.5px solid ${h.accent}50`,
                    }}
                  >
                    {h.emoji}
                  </div>
                  <div className="text-sm font-semibold hogti-ink leading-tight" style={{ fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}>
                    {c.name}
                  </div>
                  <div className="text-[10px] mt-1 tracking-widest uppercase" style={{ color: h.accent }}>
                    {h.nameEn}
                  </div>
                  <p className="text-[11px] mt-2 leading-snug" style={{ color: '#4a3a1e' }}>
                    {c.traits[0]}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/hogti/test/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium"
              style={{
                background: '#3a2f6b',
                color: '#fbf3df',
                fontFamily: "'EB Garamond', 'Noto Serif SC', serif",
              }}
            >
              戴上分院帽 →
            </Link>
            <Link
              href="/hogti/gallery/"
              className="ml-3 inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium border"
              style={{
                borderColor: '#3a2f6b60',
                color: '#3a2f6b',
                fontFamily: "'EB Garamond', 'Noto Serif SC', serif",
              }}
            >
              📖 浏览人格图鉴
            </Link>
          </div>
        </div>
      </section>
    </HogtiTheme>
  );
}
