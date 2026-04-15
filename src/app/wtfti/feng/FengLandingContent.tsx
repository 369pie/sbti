import Link from 'next/link';
import { FENG_PERSONALITIES } from '@/lib/feng/personalities';

const FEATURED = FENG_PERSONALITIES.slice(0, 8);
const NEON_ACCENT = '#39ff14';

const floatingEmojis = ['💀', '⚡', '🌀', '🔥', '✨', '🤯', '🌐', '🧬'];

export default function FengLandingContent() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      {/* Noise / scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-40 feng-scanlines opacity-10" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Giant radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${NEON_ACCENT}12, transparent 65%)` }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingEmojis.map((emoji, i) => (
            <span
              key={i}
              className="absolute text-xl sm:text-2xl opacity-20 select-none feng-float"
              style={{
                left: `${10 + i * 11}%`,
                top: `${15 + (i % 3) * 18}%`,
                animationDelay: `${i * 0.7}s`,
                filter: `drop-shadow(0 0 8px ${NEON_ACCENT})`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center relative">
          <div className="animate-fade-up">
            <span
              className="inline-block text-[10px] font-mono tracking-[0.35em] mb-6 uppercase border border-white/10 px-3 py-1.5 rounded-full"
              style={{ color: `${NEON_ACCENT}cc`, textShadow: `0 0 12px ${NEON_ACCENT}40` }}
            >
              WTFTI · 发疯宇宙 · V2.0
            </span>

            <h1 className="relative mb-6">
              <span
                className="block text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] feng-glitch"
                style={{
                  color: '#fff',
                  textShadow: `0 0 28px ${NEON_ACCENT}30`,
                }}
                data-text="疯TI"
              >
                疯TI
              </span>
              <span
                className="block text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-3"
                style={{
                  color: NEON_ACCENT,
                  textShadow: `0 0 32px ${NEON_ACCENT}60, 0 0 64px ${NEON_ACCENT}30`,
                }}
              >
                发疯人格图鉴
              </span>
            </h1>

            <p
              className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10"
              style={{ color: '#ffffffa0' }}
            >
              同一个你，在互联网上的发疯翻译版。
              <br />
              <span className="text-white/60">15 维度人格测试，测完直达 29 张纯文本 meme 图鉴卡。</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/wtfti/feng/test/"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 overflow-hidden"
                style={{ background: NEON_ACCENT, color: '#050505' }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white" />
                <span className="relative">开始发疯测试</span>
                <svg className="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/wtfti/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border text-sm transition-all hover:bg-white/5"
                style={{ borderColor: '#ffffff20', color: '#ffffff90' }}
              >
                经典 WTFTI 版
              </Link>
            </div>
          </div>

          {/* Stats - system diagnostics style */}
          <div className="mt-16 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
            {[
              { value: '29', unit: '种', label: '发疯人格' },
              { value: '0', unit: '插画', label: '纯文本梗' },
              { value: '~31', unit: '题', label: '共用题包' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="relative rounded-2xl border px-4 py-6 text-center overflow-hidden group"
                style={{ borderColor: '#ffffff10', background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${NEON_ACCENT}10, transparent 60%)`,
                  }}
                />
                <div className="relative">
                  <div
                    className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
                    style={{ color: NEON_ACCENT, textShadow: `0 0 16px ${NEON_ACCENT}50` }}
                  >
                    {stat.value}
                    <span className="text-sm ml-0.5 opacity-70">{stat.unit}</span>
                  </div>
                  <div className="text-[10px] mt-1 font-mono tracking-wider uppercase" style={{ color: '#ffffff50' }}>
                    {stat.label}
                  </div>
                </div>
                {/* Corner brackets */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Different - feature cards as collectible cards */}
      <section className="py-20 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span
              className="text-[10px] font-mono tracking-[0.25em] uppercase block mb-3"
              style={{ color: `${NEON_ACCENT}aa` }}
            >
              // SYSTEM_FEATURES
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: '#fff', textShadow: `0 0 20px ${NEON_ACCENT}25` }}
            >
              同一个你，发疯翻译版
            </h2>
            <p className="mt-3 leading-relaxed max-w-md" style={{ color: '#ffffff80' }}>
              同样的 15 维度测试，全新的互联网发疯解读。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: '😈', title: '互联网嘴替映射', desc: '29 种人格对应 29 种你在互联网上的样子：是 Excel 成精还是电子仓鼠症晚期？' },
              { emoji: '💀', title: ' meme 梗全覆盖', desc: 'KPI、收藏夹、已读不回、情绪稳定……你的日常习惯就是你的人格写照' },
              { emoji: '✨', title: '纯 CSS 霓虹图鉴', desc: '零插画成本，纯 CSS + 文本霓虹卡。每张都是朋友圈可以直接转发的梗' },
              { emoji: '📲', title: '一键分享', desc: '"测完发现我是全场唯一活爹💀" 截图直接发小红书' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative rounded-2xl border p-5 sm:p-6 animate-fade-up overflow-hidden"
                style={{
                  borderColor: `${NEON_ACCENT}20`,
                  background: 'linear-gradient(145deg, rgba(57,255,20,0.03), rgba(255,255,255,0.01))',
                }}
              >
                {/* Glow border on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px ${NEON_ACCENT}10`,
                  }}
                />
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${NEON_ACCENT}60, transparent)`,
                  }}
                />
                <div className="relative flex gap-4 items-start">
                  <span
                    className="text-3xl flex-shrink-0"
                    style={{ filter: `drop-shadow(0 0 10px ${NEON_ACCENT}40)` }}
                  >
                    {item.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-white/30">0{i + 1}</span>
                      <h3 className="text-base font-bold" style={{ color: '#fff' }}>
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#ffffff90' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                {/* Decorative corner */}
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/20 rotate-90">◢</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured types preview */}
      <section className="py-16 px-6 border-t relative" style={{ borderColor: '#ffffff08' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 animate-fade-up flex items-end justify-between">
            <div>
              <span
                className="text-[10px] font-mono tracking-[0.25em] uppercase block mb-3"
                style={{ color: `${NEON_ACCENT}aa` }}
              >
                // ARCHIVE_PREVIEW
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
                style={{ color: '#fff', textShadow: `0 0 20px ${NEON_ACCENT}20` }}
              >
                先看看你可能是谁
              </h2>
            </div>
            <div className="hidden sm:block text-xs font-mono text-white/30">SCROLL →</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {FEATURED.map((p) => (
              <Link
                key={p.slug}
                href={`/wtfti/feng/result/${p.slug}/`}
                className="group relative rounded-2xl border overflow-hidden transition-all hover:-translate-y-1"
                style={{
                  borderColor: `${p.color}35`,
                  background: '#080808',
                }}
              >
                {/* Animated glow border */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    boxShadow: `inset 0 0 24px ${p.color}20`,
                  }}
                />
                <div
                  className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${p.color}15, transparent 55%)`,
                  }}
                >
                  {/* Rotated code label */}
                  <div
                    className="absolute top-2 left-2 text-[9px] font-mono tracking-widest text-white/40 -rotate-12"
                  >
                    {p.code}
                  </div>
                  <span
                    className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none"
                    style={{ filter: `drop-shadow(0 0 24px ${p.color}60)` }}
                  >
                    {p.emoji}
                  </span>
                  {/* Corner star */}
                  <div
                    className="absolute bottom-2 right-2 text-[10px]"
                    style={{ color: `${p.color}80` }}
                  >
                    ✦
                  </div>
                </div>
                <div className="px-3 py-3 relative">
                  <span
                    className="text-[10px] font-mono tracking-widest block mb-0.5"
                    style={{ color: p.color }}
                  >
                    {p.number}
                  </span>
                  <h3 className="text-sm font-bold truncate" style={{ color: '#fff' }}>
                    {p.fengName}
                  </h3>
                  <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: '#ffffff60' }}>
                    {p.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Slash-through divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px w-full relative overflow-hidden" style={{ background: '#ffffff08' }}>
          <div
            className="absolute inset-y-0 left-0 w-1/3"
            style={{
              background: `linear-gradient(90deg, transparent, ${NEON_ACCENT}40, transparent)`,
              transform: 'skewX(-45deg)',
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 px-6 text-center relative">
        {/* Background aura */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${NEON_ACCENT}08, transparent 60%)` }}
        />
        <div className="max-w-md mx-auto relative">
          <div className="text-4xl mb-4 feng-float inline-block" style={{ animationDelay: '0.2s' }}>
            🧬
          </div>
          <p className="text-sm mb-8" style={{ color: '#ffffff60' }}>
            29 种发疯人格，总有一种是你 —— 或者你的互联网嘴替
          </p>
          <Link
            href="/wtfti/feng/test/"
            className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base transition-all overflow-hidden"
            style={{ background: NEON_ACCENT, color: '#050505' }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white" />
            <span className="relative">开始发疯人格测试</span>
            <svg className="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <div className="mt-6 text-[10px] font-mono tracking-widest text-white/20">
            [ WARNING: RESULTS MAY BE TOO REAL ]
          </div>
        </div>
      </section>
    </div>
  );
}
