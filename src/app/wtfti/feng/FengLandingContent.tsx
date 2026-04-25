import Link from 'next/link';
import { FENG_PERSONALITIES } from '@/lib/feng/personalities';

const FEATURED = FENG_PERSONALITIES.slice(0, 8);
const NEON_ACCENT = '#39ff14';

const floatingEmojis = ['💀', '⚡', '🌀', '🔥', '✨', '🤯', '🌐', '🧬', '☠️', '💥', '🧨', '🩸'];
const floatingSymbols = ['!', '?', '✗', '●', '▲', '■', '✦', '⟁', '⨯', '⬡', '⚠', '⌘'];

const errorCodes = ['SYS_FAILURE', '404', 'NULL_PTR', 'STACK_OVERFLOW', 'SEG_FAULT', 'CORE_DUMP'];
const bsodHex = ['0x0000007B', '0xC000021A', '0x80070057', '0xDEADBEEF', '0xBADF00D', '0xCAFEBABE'];

export default function FengLandingContent() {
  return (
    <div className="min-h-screen bg-bg-primary text-bg-primary relative overflow-x-hidden">
      {/* Noise / scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-40 feng-scanlines opacity-20" />

      {/* Top warning marquee */}
      <div className="relative z-30 overflow-hidden border-b border-white/10 bg-black/40">
        <div className="whitespace-nowrap feng-marquee flex items-center gap-8 py-1.5 text-[10px] font-mono tracking-widest uppercase text-red-400">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
            WARNING: SANITY LEVELS CRITICAL
          </span>
          <span>SYSTEM UNSTABLE // DO NOT TRUST THE UI</span>
          <span>⚠ 29 PERSONALITIES DETECTED</span>
          <span>⚡ 0 ILLUSTRATIONS FOUND</span>
          <span>🌀 PURE CSS MEME OVERDRIVE</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
            WARNING: SANITY LEVELS CRITICAL
          </span>
          <span>SYSTEM UNSTABLE // DO NOT TRUST THE UI</span>
          <span>⚠ 29 PERSONALITIES DETECTED</span>
          <span>⚡ 0 ILLUSTRATIONS FOUND</span>
          <span>🌀 PURE CSS MEME OVERDRIVE</span>
        </div>
      </div>

      {/* Hero with fake OS window chrome */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-6">
        {/* Giant radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${NEON_ACCENT}15, transparent 60%)` }}
        />

        {/* Floating debris */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingEmojis.map((emoji, i) => (
            <span
              key={`e-${i}`}
              className="absolute text-xl sm:text-2xl select-none feng-float-chaos"
              style={{
                left: `${8 + i * 8}%`,
                top: `${10 + (i % 4) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                filter: `drop-shadow(0 0 10px ${NEON_ACCENT})`,
              }}
            >
              {emoji}
            </span>
          ))}
          {floatingSymbols.map((sym, i) => (
            <span
              key={`s-${i}`}
              className="absolute text-sm sm:text-base font-black select-none feng-jitter"
              style={{
                left: `${15 + i * 7}%`,
                top: `${55 + (i % 3) * 12}%`,
                animationDelay: `${i * 0.3}s`,
                color: i % 2 === 0 ? 'var(--color-accent)' : '#00ffff',
                opacity: 0.25,
              }}
            >
              {sym}
            </span>
          ))}
        </div>

        {/* ERROR CODE blocks floating in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={`errblk-${i}`}
              className="absolute font-mono text-[10px] sm:text-xs text-bg-primary/10 border border-white/5 px-2 py-1 rounded feng-jitter"
              style={{
                left: `${5 + i * 16}%`,
                top: `${15 + (i % 3) * 28}%`,
                animationDelay: `${i * 0.7}s`,
              }}
            >
              <div>ERR_{errorCodes[i % errorCodes.length]}</div>
              <div className="text-[9px] opacity-60">{bsodHex[i % bsodHex.length]}</div>
            </div>
          ))}
        </div>

        {/* Fake OS Window Chrome */}
        <div className="relative z-10 max-w-3xl mx-auto mt-4">
          {/* Window frame */}
          <div className="rounded-xl border border-white/15 bg-black/60 overflow-hidden shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 text-[6px] flex items-center justify-center">×</span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 text-[6px] flex items-center justify-center">−</span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 text-[6px] flex items-center justify-center">□</span>
              </div>
              <div className="text-[10px] font-mono text-bg-primary/40 tracking-wider">疯TI.exe — 未响应</div>
              <div className="w-12" />
            </div>

            {/* Window content */}
            <div className="relative px-4 sm:px-8 pt-10 pb-10 text-center">
              {/* Diagonal CRITICAL warning tape */}
              <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
                <div className="absolute top-4 -right-8 w-40 h-5 feng-warning-tape text-[9px] flex items-center justify-center rotate-45">
                  CRITICAL
                </div>
              </div>

              <div className="animate-fade-up">
                <span
                  className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] mb-5 uppercase border border-white/10 px-3 py-1.5 rounded-full feng-shake-lite"
                  style={{ color: `${NEON_ACCENT}cc`, textShadow: `0 0 12px ${NEON_ACCENT}40` }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                  WTFTI · 发疯宇宙 · V3.0
                </span>

                <h1 className="relative mb-6">
                  <span
                    className="block text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1.05]"
                    style={{
                      color: 'var(--color-bg-primary)',
                      textShadow: `0 0 28px ${NEON_ACCENT}40`,
                    }}
                  >
                    <span className="feng-char-jitter inline-block" style={{ animationDelay: '0s' }}>疯</span>
                    <span className="feng-char-jitter inline-block" style={{ animationDelay: '0.08s' }}>T</span>
                    <span className="feng-char-jitter inline-block" style={{ animationDelay: '0.16s' }}>I</span>
                  </span>
                  <span
                    className="block text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-3 feng-rgb-split"
                    style={{ color: NEON_ACCENT }}
                  >
                    发疯人格图鉴
                  </span>
                </h1>

                <p
                  className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-6"
                  style={{ color: 'color-mix(in oklab, var(--color-bg-primary) 63%, transparent)' }}
                >
                  同一个你，在互联网上的发疯译本。
                  <br />
                  <span className="text-bg-primary/60">
                    15 维度人格测试，测完直达 29 张纯文本发疯图鉴卡。
                  </span>
                </p>

                {/* CPU OVERLOAD progress bar */}
                <div className="max-w-xs mx-auto mb-8">
                  <div className="flex items-center justify-between text-[10px] font-mono text-red-300 mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
                      CPU OVERLOAD
                    </span>
                    <span>99%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
                    <div
                      className="h-full feng-progress-throb rounded-full"
                      style={{
                        width: '99%',
                        background: 'linear-gradient(90deg, var(--color-accent), #ff3333, var(--color-accent))',
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/wtfti/feng/test/"
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-base transition-all duration-200 overflow-hidden feng-explode"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-bg-primary)', boxShadow: '0 0 30px color-mix(in oklab, var(--color-accent) 50%, transparent)' }}
                  >
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity bg-white" />
                    <span className="relative inline-block">🚨 开始发疯测试</span>
                    <svg className="w-4 h-4 relative group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/wtfti/"
                    prefetch={false}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border text-sm transition-all hover:bg-white/5 feng-tilt-n1"
                    style={{ borderColor: 'color-mix(in oklab, var(--color-bg-primary) 12%, transparent)', color: 'color-mix(in oklab, var(--color-bg-primary) 56%, transparent)' }}
                  >
                    经典 WTFTI 版
                  </Link>
                </div>
              </div>

              {/* Stats - corrupted diagnostics */}
              <div className="mt-12 grid grid-cols-3 gap-3 animate-fade-up-delay-1">
                {[
                  { value: '29', unit: '种', label: '发疯人格', code: 'OK' },
                  { value: '0', unit: '插画', label: '纯文本梗', code: '404' },
                  { value: '~31', unit: '题', label: '共用题包', code: 'ERR' },
                ].map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`relative rounded-2xl border px-3 py-5 text-center overflow-hidden group ${idx === 1 ? 'feng-tilt-n1' : idx === 2 ? 'feng-tilt-1' : ''}`}
                    style={{ borderColor: 'color-mix(in oklab, var(--color-bg-primary) 6%, transparent)', background: 'color-mix(in oklab, var(--color-bg-primary) 2%, transparent)' }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${NEON_ACCENT}12, transparent 60%)`,
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
                      <div className="text-[10px] mt-1 font-mono tracking-wider uppercase" style={{ color: 'color-mix(in oklab, var(--color-bg-primary) 31%, transparent)' }}>
                        {stat.label}
                      </div>
                      <div className="mt-2 text-[9px] font-mono text-red-400/80 tracking-widest">
                        {stat.code}
                      </div>
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20" />
                    <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20" />
                    {/* Progress bar strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                      <div
                        className="h-full"
                        style={{
                          width: `${30 + idx * 25}%`,
                          background: `linear-gradient(90deg, ${NEON_ACCENT}60, transparent)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fake BSOD snippet */}
          <div className="mt-4 rounded-lg border border-accent/40 feng-bsod-block px-4 py-3 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 mb-2 text-[10px] text-text-secondary">
              <span>◆</span>
              <span>SYSTEM_DUMP_0x7F3A</span>
            </div>
            <div className="space-y-0.5 text-text-muted">
              <div>A problem has been detected and Windows has been shut down to prevent damage to your sanity.</div>
              <div className="text-[10px] text-text-muted mt-2">
                {bsodHex.join(' ')} ▓▒░ 0x00000000 0xFFFFFFFF 0xDEADBEEF
              </div>
              <div className="text-[10px] text-text-muted">
                Collecting data for crash dump ...
                <span className="feng-blink">_</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middle ticker */}
      <div className="relative z-20 overflow-hidden border-y border-white/5 py-2 bg-white/[0.02] mt-8">
        <div className="whitespace-nowrap feng-marquee flex items-center gap-10 text-[11px] font-mono tracking-widest text-bg-primary/40">
          <span>SYS_FAILURE ────────────────────</span>
          <span style={{ color: NEON_ACCENT }}>29 TYPES LOADED</span>
          <span>──────────────────── STACK_OVERFLOW</span>
          <span className="text-red-400">WARNING: REALITY BUFFER FULL</span>
          <span>──────────────────── NULL_POINTER_EXCEPTION</span>
          <span style={{ color: NEON_ACCENT }}>MEME DENSITY: 99.9%</span>
          <span>SYS_FAILURE ────────────────────</span>
          <span style={{ color: NEON_ACCENT }}>29 TYPES LOADED</span>
          <span>──────────────────── STACK_OVERFLOW</span>
          <span className="text-red-400">WARNING: REALITY BUFFER FULL</span>
          <span>──────────────────── NULL_POINTER_EXCEPTION</span>
          <span style={{ color: NEON_ACCENT }}>MEME DENSITY: 99.9%</span>
        </div>
      </div>

      {/* What's Different - feature cards as corrupted collectible cards */}
      <section className="py-16 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 animate-fade-up">
            <span
              className="text-[10px] font-mono tracking-[0.25em] uppercase block mb-3"
              style={{ color: `${NEON_ACCENT}aa` }}
            >
              // SYSTEM_FEATURES
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: 'var(--color-bg-primary)', textShadow: `0 0 20px ${NEON_ACCENT}25` }}
            >
              同一个你，发疯翻译版
            </h2>
            <p className="mt-3 leading-relaxed max-w-md" style={{ color: 'color-mix(in oklab, var(--color-bg-primary) 50%, transparent)' }}>
              同样的 15 维度测试，全新的互联网发疯解读。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: '😈', title: '互联网嘴替图鉴', desc: '29 种人格对应 29 种你在互联网上的样子：是 Excel 成精还是电子仓鼠症晚期？' },
              { emoji: '💀', title: '发疯梗全覆盖', desc: 'KPI、收藏夹、已读不回、情绪稳定……你的日常习惯就是你的人格写照' },
              { emoji: '✨', title: '纯 CSS 霓虹图鉴', desc: '零插画成本，纯 CSS 霓虹图鉴卡。每张都是朋友圈可以直接转发的梗' },
              { emoji: '📲', title: '一键分享', desc: '"测完发现我竟然是全场隐形BOSS💀" 截图直接发小红书' },
            ].map((item, i) => {
              const tilts = ['feng-tilt-n2', 'feng-tilt-1', 'feng-tilt-2', 'feng-tilt-n1'];
              const margins = ['-mt-2', 'mt-1', '-mb-2', 'mt-0'];
              return (
                <div
                  key={item.title}
                  className={`group relative rounded-2xl border p-5 sm:p-6 animate-fade-up overflow-hidden ${tilts[i]} ${margins[i]}`}
                  style={{
                    borderColor: `${NEON_ACCENT}20`,
                    background: 'linear-gradient(145deg, rgba(57,255,20,0.03), rgba(255,255,255,0.01))',
                    animationDelay: `${i * 80}ms`,
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
                  {/* Random error code badge */}
                  <div className="absolute top-3 right-3 text-[9px] font-mono text-bg-primary/25 rotate-6">
                    {errorCodes[i % errorCodes.length]}
                  </div>
                  <div className="relative flex gap-4 items-start">
                    <span
                      className="text-3xl flex-shrink-0"
                      style={{ filter: `drop-shadow(0 0 10px ${NEON_ACCENT}40)` }}
                    >
                      {item.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-bg-primary/30">0{i + 1}</span>
                        <h3 className="text-base font-bold" style={{ color: 'var(--color-bg-primary)' }}>
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in oklab, var(--color-bg-primary) 56%, transparent)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  {/* Decorative corner */}
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-bg-primary/20 rotate-90">◢</div>
                  {/* Scribble line */}
                  <div
                    className="absolute bottom-8 right-8 w-10 h-px opacity-20"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${NEON_ACCENT}, transparent)`,
                      transform: 'rotate(-12deg)',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured types preview */}
      <section className="py-14 px-6 border-t relative" style={{ borderColor: 'color-mix(in oklab, var(--color-bg-primary) 3%, transparent)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up flex items-end justify-between">
            <div>
              <span
                className="text-[10px] font-mono tracking-[0.25em] uppercase block mb-3"
                style={{ color: `${NEON_ACCENT}aa` }}
              >
                // ARCHIVE_PREVIEW
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
                style={{ color: 'var(--color-bg-primary)', textShadow: `0 0 20px ${NEON_ACCENT}20` }}
              >
                先看看你可能是谁
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-bg-primary/30">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current feng-blink" />
              SCROLL →
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {FEATURED.map((p, idx) => {
              const tilt = idx % 2 === 0 ? 'feng-tilt-1' : 'feng-tilt-n1';
              return (
                <Link
                  key={p.slug}
                  href={`/wtfti/feng/result/${p.slug}/`}
                  className={`group relative rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 ${tilt}`}
                  style={{
                    borderColor: `${p.color}35`,
                    background: 'var(--color-bg-primary)',
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
                    <div className="absolute top-2 left-2 text-[9px] font-mono tracking-widest text-bg-primary/40 -rotate-12">
                      {p.code}
                    </div>
                    <span
                      className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none"
                      style={{ filter: `drop-shadow(0 0 24px ${p.color}60)` }}
                    >
                      {p.emoji}
                    </span>
                    {/* Corner star */}
                    <div className="absolute bottom-2 right-2 text-[10px]" style={{ color: `${p.color}80` }}>
                      ✦
                    </div>
                    {/* Floating warning */}
                    <div className="absolute top-2 right-2 text-[8px] font-mono text-red-400/70 rotate-6">
                      {idx % 3 === 0 ? 'HOT' : 'NEW'}
                    </div>
                  </div>
                  <div className="px-3 py-3 relative">
                    <span className="text-[10px] font-mono tracking-widest block mb-0.5" style={{ color: p.color }}>
                      {p.number}
                    </span>
                    <h3 className="text-sm font-bold truncate" style={{ color: 'var(--color-bg-primary)' }}>
                      {p.fengName}
                    </h3>
                    <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: 'color-mix(in oklab, var(--color-bg-primary) 38%, transparent)' }}>
                      {p.tagline}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Slash-through divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px w-full relative overflow-hidden" style={{ background: 'color-mix(in oklab, var(--color-bg-primary) 3%, transparent)' }}>
          <div
            className="absolute inset-y-0 left-0 w-1/3 feng-skew"
            style={{
              background: `linear-gradient(90deg, transparent, ${NEON_ACCENT}50, transparent)`,
            }}
          />
          <div
            className="absolute inset-y-0 left-1/3 w-1/3 feng-skew"
            style={{
              background: `linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-accent) 31%, transparent), transparent)`,
              animationDelay: '0.5s',
            }}
          />
          <div
            className="absolute inset-y-0 left-2/3 w-1/3 feng-skew"
            style={{
              background: `linear-gradient(90deg, transparent, #00ffff50, transparent)`,
              animationDelay: '1s',
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 px-6 text-center relative">
        {/* Background aura */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${NEON_ACCENT}10, transparent 60%)` }}
        />
        <div className="max-w-md mx-auto relative">
          <div className="text-4xl mb-3 feng-float inline-block" style={{ animationDelay: '0.2s' }}>
            🧬
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-red-400 border border-red-400/40 px-2 py-0.5 rounded">⚠ WARNING</span>
            <span className="text-[10px] font-mono text-bg-primary/40 border border-white/10 px-2 py-0.5 rounded">CONTAGIOUS</span>
          </div>
          <p className="text-sm mb-6" style={{ color: 'color-mix(in oklab, var(--color-bg-primary) 38%, transparent)' }}>
            29 种发疯人格，总有一种是你。
          </p>
          <Link
            href="/wtfti/feng/test/"
            className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-base transition-all overflow-hidden feng-explode"
            style={{ background: 'var(--color-accent)', color: 'var(--color-bg-primary)', boxShadow: '0 0 40px color-mix(in oklab, var(--color-accent) 45%, transparent)' }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity bg-white" />
            <span className="relative inline-block">🚨 开始发疯人格测试</span>
            <svg className="w-4 h-4 relative group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <div className="mt-5 text-[10px] font-mono tracking-widest text-bg-primary/20 flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
            [ WARNING: RESULTS MAY BE TOO REAL ]
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 feng-flash" />
          </div>
        </div>
      </section>
    </div>
  );
}
