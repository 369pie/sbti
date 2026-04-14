import Link from 'next/link';
import { SOULTI_MODEL_NAMES, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import type { SoultiModelType } from '@/lib/soulti/dimensions';
import { SOULTI_PERSONALITY_TYPES, getSoultiResonance } from '@/lib/soulti/personalities';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

const AXES: { key: SoultiModelType; poleA: string; poleB: string; question: string }[] = [
  { key: 'tide',  poleA: '涌', poleB: '静', question: '你的能量是向外涌动还是向内沉淀' },
  { key: 'root',  poleA: '根', poleB: '风', question: '你需要确定性的锚还是拥抱未知' },
  { key: 'edge',  poleA: '融', poleB: '壁', question: '你的边界是柔和的还是清晰的' },
  { key: 'spark', poleA: '焰', poleB: '烬', question: '你的内在能量是恒定的还是间歇的' },
  { key: 'metamorphosis', poleA: '生', poleB: '矿', question: '受伤之后，你是生长还是结晶' },
];

/** Generate a unique gradient for each personality type */
function typeGradient(color: string, index: number): string {
  const angles = [135, 150, 120, 165, 140, 155, 125, 170, 130, 145];
  const angle = angles[index % angles.length];
  return `linear-gradient(${angle}deg, ${color}18 0%, ${color}08 50%, transparent 100%)`;
}

/** Thin decorative line SVG */
function DecoLine({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="120" height="12" viewBox="0 0 120 12" fill="none">
        <line x1="0" y1="6" x2="48" y2="6" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="60" cy="6" r="2.5" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <line x1="72" y1="6" x2="120" y2="6" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

export default function SoultiLandingContent() {
  const allTypesWithResonance = SOULTI_PERSONALITY_TYPES.map(type => ({
    type,
    resonance: getSoultiResonance(type.slug),
  }));

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>

      {/* ═══════════════════════════════════════════════
          HERO — abstract nature aesthetic
         ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle radial gradient backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,115,85,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-2xl mx-auto px-6 pt-32 pb-12 text-center relative">
          <div className="animate-fade-up">
            {/* Minimal geometric logo mark */}
            <div className="mb-10 flex justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30">
                <circle cx="24" cy="24" r="22" stroke="#8b7355" strokeWidth="0.5" />
                <circle cx="24" cy="24" r="14" stroke="#8b7355" strokeWidth="0.5" />
                <circle cx="24" cy="24" r="6" stroke="#8b7355" strokeWidth="0.5" />
                <line x1="24" y1="2" x2="24" y2="46" stroke="#8b7355" strokeWidth="0.3" />
                <line x1="2" y1="24" x2="46" y2="24" stroke="#8b7355" strokeWidth="0.3" />
              </svg>
            </div>

            <p
              className="text-xs tracking-[0.35em] uppercase mb-8"
              style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.6 }}
            >
              SoulTI
            </p>

            <h1
              className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.5] mb-6"
              style={{ fontFamily: serifFont, fontWeight: 400, color: '#2D2A26', letterSpacing: '0.02em' }}
            >
              你的灵魂<br />像一种自然力
            </h1>

            <DecoLine className="text-[#8b7355] opacity-30 mb-6" />

            <p
              className="text-base sm:text-lg leading-[2.2] max-w-md mx-auto mb-3"
              style={{ fontFamily: serifFont, color: '#5a5550' }}
            >
              而历史上有个女人，
              <br />
              跟你以同样的方式燃烧过。
            </p>

            <p
              className="text-base sm:text-lg leading-[3] max-w-md mx-auto mb-10"
              style={{ fontFamily: serifFont, color: '#2D2A26' }}
            >
              带着这股共通的力量，作为独一无二的你，
              <br />
              <span style={{ color: '#8b7355' }}>继续热烈地燃烧，永远不熄。</span>
            </p>

            <p
              className="text-sm mb-12"
              style={{ fontFamily: serifFont, color: '#9a918a', fontStyle: 'italic' }}
            >
              五轴深探 · 32 种自然力 · 灵魂共振
            </p>

            <Link
              href="/soulti/test"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #6b5d4d, #8b7355, #a89070)',
                boxShadow: '0 4px 24px rgba(107,93,77,0.20)',
                fontFamily: serifFont,
                letterSpacing: '0.1em',
              }}
            >
              开启共振
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>

            <p
              className="mt-6 text-xs tracking-[0.15em]"
              style={{ fontFamily: monoFont, color: '#a09890' }}
            >
              25 questions · different each time
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NATURE MAP — 32 scrollable gradient cards
         ═══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 mb-8">
          <div className="flex items-baseline justify-between">
            <div>
              <p
                className="text-[10px] tracking-[0.35em] uppercase mb-3"
                style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.5 }}
              >
                NATURE MAP
              </p>
              <h2
                className="text-xl sm:text-2xl"
                style={{ fontFamily: serifFont, color: '#2D2A26' }}
              >
                万物地图
              </h2>
            </div>
            <p
              className="text-xs"
              style={{ fontFamily: monoFont, color: '#a09890' }}
            >
              32 types ←→
            </p>
          </div>
        </div>

        {/* Auto-scrolling marquee — performant CSS-only transform */}
        <style>{`
          @keyframes nature-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .nature-track {
            animation: nature-marquee 90s linear infinite;
            will-change: transform;
          }
          .nature-track:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .nature-track {
              animation: none;
              overflow-x: auto;
              scrollbar-width: none;
            }
            .nature-track::-webkit-scrollbar { display: none; }
          }
        `}</style>

        <div className="overflow-hidden">
          <div className="nature-track flex gap-4 py-2 px-4">
            {[...allTypesWithResonance, ...allTypesWithResonance].map(({ type, resonance }, i) => (
              <Link
                key={`${type.slug}-${i}`}
                href={`/soulti/result/${type.slug}`}
                prefetch={false}
                className="group flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ border: `1px solid ${type.color}20` }}
              >
                {/* Color gradient top area */}
                <div
                  className="h-[100px] sm:h-[120px] relative flex items-center justify-center"
                  style={{
                    background: `linear-gradient(160deg, ${type.color}25 0%, ${type.color}10 60%, #FAF8F5 100%)`,
                  }}
                >
                  <span className="text-4xl sm:text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {type.emoji}
                  </span>
                  <span
                    className="absolute top-3 right-3 text-[9px] tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: monoFont,
                      color: `${type.color}`,
                      background: '#FAF8F5cc',
                    }}
                  >
                    {type.code}
                  </span>
                </div>

                {/* Info area */}
                <div className="px-4 py-4" style={{ background: '#FDFCFA' }}>
                  <p
                    className="text-base mb-1 tracking-[0.1em]"
                    style={{ fontFamily: serifFont, color: type.color }}
                  >
                    {type.name}
                  </p>
                  {resonance && (
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ fontFamily: serifFont, color: '#8a8078' }}
                    >
                      共振 · {resonance.soulOrigin.zhName}
                    </p>
                  )}
                  <p
                    className="text-[11px] mt-2 line-clamp-2 leading-relaxed"
                    style={{ color: '#a09890' }}
                  >
                    {type.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hover hint */}
        <p
          className="text-center mt-4 text-[11px]"
          style={{ fontFamily: monoFont, color: '#b0a89e' }}
        >
          hover to pause · click to explore
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          SOUL RESONANCE — featured pairings
         ═══════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <DecoLine className="text-[#8b7355] opacity-20 mb-12" />

          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.5 }}
          >
            SOUL RESONANCE
          </p>

          <h2
            className="text-xl sm:text-2xl leading-[1.8] mb-4"
            style={{ fontFamily: serifFont, color: '#2D2A26' }}
          >
            灵魂共振
          </h2>

          <p
            className="text-sm leading-[1.9] mb-14"
            style={{ fontFamily: serifFont, color: '#7a7068' }}
          >
            你不只会得到一个名字——你会遇见一个人。
            <br />
            她的伤口和你相似，她的燃烧方式和你一样。
            <br />
            <br />
            <span style={{ color: '#8b7355' }}>跨越时空，你们分享着同一种自然法则，而你将去写下只属于你的生生不息。</span>
          </p>

          {/* Featured pairings — nature card style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['aurora', 'glacier', 'firefly', 'coral', 'butterfly', 'driedflower'] as const).map((slug, i) => {
              const type = SOULTI_PERSONALITY_TYPES.find(p => p.slug === slug)!;
              const resonance = getSoultiResonance(slug)!;
              return (
                <Link
                  key={slug}
                  href={`/soulti/result/${slug}`}
                  prefetch={false}
                  className="group animate-fade-up block rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    background: typeGradient(type.color, i),
                    border: `1px solid ${type.color}15`,
                  }}
                >
                  {/* Top row: emoji + name + code */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{type.emoji}</span>
                    <div className="flex-1">
                      <span
                        className="text-lg tracking-[0.1em]"
                        style={{ fontFamily: serifFont, color: type.color }}
                      >
                        {type.name}
                      </span>
                    </div>
                    <span
                      className="text-[10px] tracking-wider"
                      style={{ fontFamily: monoFont, color: `${type.color}80` }}
                    >
                      {type.code}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="mb-4" style={{ borderTop: `1px solid ${type.color}15` }} />

                  {/* Resonance figure */}
                  <p
                    className="text-sm mb-1"
                    style={{ fontFamily: serifFont, color: '#3d3832' }}
                  >
                    {resonance.soulOrigin.zhName}
                  </p>
                  <p
                    className="text-[11px] mb-3"
                    style={{ fontFamily: monoFont, color: '#a09890' }}
                  >
                    {resonance.soulOrigin.era}
                  </p>
                  <p
                    className="text-sm leading-[1.8]"
                    style={{ fontFamily: serifFont, fontStyle: 'italic', color: '#7a7068' }}
                  >
                    &ldquo;{resonance.quote.split('\n')[0]}&rdquo;
                  </p>

                  {/* Hover hint */}
                  <p
                    className="text-[11px] mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: type.color }}
                  >
                    查看完整共振 →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT — what is SoulTI
         ═══════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <DecoLine className="text-[#8b7355] opacity-20 mb-12" />

          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-10"
            style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.5 }}
          >
            ABOUT
          </p>

          <blockquote
            className="text-lg sm:text-xl leading-[2.2] mb-10"
            style={{ fontFamily: serifFont, color: '#4a443e' }}
          >
            别的测试分析你的行为，
            <br />
            SoulTI 追问行为背后的<em>为什么</em>。
            <br />
            <br />
            潮汐、锚定、界限、火焰、蜕变——
            <br />
            五个轴，不是给你一个标签，
            <br />
            <span style={{ color: '#8b7355' }}>是让你看见：那股一直在你体内燃烧的自然之力。</span>
          </blockquote>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FIVE AXES — clean geometric cards
         ═══════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-3"
            style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.5 }}
          >
            FIVE AXES
          </p>
          <h2
            className="text-xl sm:text-2xl mb-8"
            style={{ fontFamily: serifFont, color: '#2D2A26' }}
          >
            五轴觉察
          </h2>

          <div className="grid gap-3">
            {AXES.map((ax, i) => {
              const color = SOULTI_MODEL_COLORS[ax.key];
              return (
                <div
                  key={ax.key}
                  className="animate-fade-up rounded-xl p-5 sm:p-6 transition-shadow hover:shadow-md"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    background: '#FDFCFA',
                    border: `1px solid ${color.base}12`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Axis indicator */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        fontFamily: serifFont,
                        background: color.bg,
                        color: color.base,
                      }}
                    >
                      {SOULTI_MODEL_NAMES[ax.key][0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-sm tracking-[0.1em]"
                          style={{ fontFamily: serifFont, color: color.base }}
                        >
                          {SOULTI_MODEL_NAMES[ax.key]}
                        </span>
                        <div className="flex items-center gap-3 text-xs" style={{ fontFamily: serifFont }}>
                          <span style={{ color: color.base }}>{ax.poleA}</span>
                          <span style={{ color: `${color.base}30` }}>—</span>
                          <span style={{ color: color.base }}>{ax.poleB}</span>
                        </div>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ fontFamily: serifFont, color: '#7a7068' }}
                      >
                        {ax.question}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          THREE ACTS
         ═══════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-3"
            style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.5 }}
          >
            THREE ACTS
          </p>
          <h2
            className="text-xl sm:text-2xl mb-8"
            style={{ fontFamily: serifFont, color: '#2D2A26' }}
          >
            三幕自问
          </h2>

          <div className="space-y-0">
            {[
              { num: 'I', title: '白天的你', desc: '日常场景里你的自然反应', sub: '看见最表层的自己' },
              { num: 'II', title: '深夜的你', desc: '脆弱时刻的真实选择', sub: '看见藏起来的那一面' },
              { num: 'III', title: '梦里的你', desc: '抽象意象的直觉回应', sub: '看见你还没说出口的自己' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="animate-fade-up flex items-start gap-5 py-6"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderBottom: '1px solid rgba(139,115,85,0.08)',
                }}
              >
                <span
                  className="text-2xl flex-shrink-0 w-10 text-center"
                  style={{ fontFamily: serifFont, fontWeight: 400, color: 'rgba(139,115,85,0.30)' }}
                >
                  {item.num}
                </span>
                <div>
                  <h3
                    className="text-base mb-1"
                    style={{ fontFamily: serifFont, color: '#2D2A26' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: serifFont, color: '#7a7068' }}>
                    {item.desc}——<span style={{ color: '#8b7355' }}>{item.sub}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Comparison — dark card
         ═══════════════════════════════════════════════ */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#1C1B19' }}>
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-8"
              style={{ fontFamily: monoFont, color: 'rgba(255,255,255,0.30)' }}
            >
              SBTI → SoulTI
            </p>

            <div className="space-y-5">
              {[
                { sbti: 'SBTI 问你平时怎么做', soulti: 'SoulTI 问你为什么这样做' },
                { sbti: '15 维行为切面', soulti: '5 轴内在觉察' },
                { sbti: '27 种抽象人格', soulti: '32 种自然人格 + 灵魂共振' },
                { sbti: '给你一个标签', soulti: '给你一面镜子' },
              ].map(row => (
                <div key={row.sbti} className="flex items-center gap-4">
                  <span
                    className="text-sm flex-1 text-right"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {row.sbti}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: '#8b735560' }}
                  >
                    →
                  </span>
                  <span
                    className="text-sm flex-1"
                    style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.80)' }}
                  >
                    {row.soulti}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — closing
         ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto text-center">
          <DecoLine className="text-[#8b7355] opacity-20 mb-12" />

          <p
            className="text-lg sm:text-xl leading-[2] mb-2"
            style={{ fontFamily: serifFont, color: '#3d3832' }}
          >
            你的灵魂里，
            <br />
            <span style={{ color: '#8b7355' }}>藏着哪种自然力？</span>
          </p>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: serifFont, fontStyle: 'italic', color: '#9a918a' }}
          >
            而历史上的哪个她，正以你的频率震动？
          </p>

          <p
            className="text-base sm:text-lg leading-[2] mb-3"
            style={{ fontFamily: serifFont, color: '#2D2A26' }}
          >
            你不需要成为她们。
            <br />
            你只需要，<span style={{ color: '#8b7355' }}>成为你自己</span>。
          </p>
          <p
            className="text-sm mb-12"
            style={{ fontFamily: serifFont, color: '#9a918a' }}
          >
            而这一切，从看见开始。
          </p>

          <Link
            href="/soulti/test"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white text-lg transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #6b5d4d, #8b7355, #a89070)',
              boxShadow: '0 4px 24px rgba(107,93,77,0.20)',
              fontFamily: serifFont,
              letterSpacing: '0.1em',
            }}
          >
            开启共振
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

          <div className="mt-10 flex items-center justify-center gap-4 text-xs" style={{ color: '#b0a89e' }}>
            <Link href="/test/" className="hover:text-[#8b7355] transition-colors" style={{ fontFamily: serifFont }}>
              SBTI 标准版
            </Link>
            <span>·</span>
            <Link href="/xpti/" className="hover:text-[#8b7355] transition-colors" style={{ fontFamily: serifFont }}>
              恋爱XP
            </Link>
            <span>·</span>
            <Link href="/wtfti/" className="hover:text-[#8b7355] transition-colors" style={{ fontFamily: serifFont }}>
              WTF 毒舌版
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
