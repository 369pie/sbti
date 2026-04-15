import Link from 'next/link';
import NextImage from 'next/image';
import { XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '../../lib/xpti/dimensions';
import type { XptiModelType } from '../../lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiTypeThumbnailImage } from '../../lib/xpti/personalities';

/* ─── XPTI 专属字体栈 ──────────────────────────────────────
  headingFont: 轻戏剧化衬线，提升“暧昧/编辑感”
  monoFont: 数据/代码标注用 */
const headingFont = "var(--font-display), 'Iowan Old Style', 'Times New Roman', serif";
const monoFont = "var(--font-mono), ui-monospace, monospace";

const DIMS: { key: XptiModelType; poleHigh: string; poleLow: string; question: string }[] = [
  { key: 'dominance', poleHigh: '指挥官', poleLow: '乖顺流', question: '你在亲密关系里是导演还是女主' },
  { key: 'exposure', poleHigh: '坦白局', poleLow: '面具系', question: '你愿意暴露多少真实的自己' },
  { key: 'sensory', poleHigh: '通感体', poleLow: '钝感力', question: '一次触碰能让你过电吗' },
  { key: 'tempo', poleHigh: '微波炉', poleLow: '慢火锅', question: '你喜欢快节奏还是慢慢升温' },
  { key: 'mirror', poleHigh: '镜子型', poleLow: '自足型', question: '你需要对方的确认来获取自信吗' },
  { key: 'boundary', poleHigh: '弹力绳', poleLow: '铁闸门', question: '你的“可以/不可以”边界有多灵活' },
  { key: 'fantasy', poleHigh: '编剧魂', poleLow: '现实派', question: '你脑内剧本的丰富程度' },
  { key: 'attachment', poleHigh: '黏人精', poleLow: '独行猫', question: '你对亲密连接的需求有多强' },
  { key: 'repetition', poleHigh: '回味党', poleLow: '探索癖', question: '你偏好熟悉的深入还是新鲜的刺激' },
];

/** Featured types for showcase cards */
const FEATURED_SLUGS = ['switch', 'mind-theater', 'synesthete', 'night-writer', 'screamer', 'sober-addict'] as const;

/** XPTI 丝绒/干枯玫瑰高级色系（告别AI霓虹感，走向高定编辑风） */
const VELVET_DARK_WINE = '#6A2A3E'; // 深红酒/丝绒
const VELVET_ROSE      = '#A3526E'; // 枯玫瑰
const VELVET_BLUSH     = '#E6CDD5'; // 晨雾粉
const NIGHT_PLUM       = '#20181A'; // 极暗黑李子色（深色卡片用）
const CHAMPAGNE        = '#D6C5B3'; // 香槟金
const VOID_BG          = '#0D0608';
const CARD_BG          = '#1A0C11';

/** Thin decorative line SVG */
function XptiDecoLine({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={style}>
      <svg width="120" height="12" viewBox="0 0 120 12" fill="none">
        <line x1="0" y1="6" x2="48" y2="6" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="60" cy="6" r="2.5" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <line x1="72" y1="6" x2="120" y2="6" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

function XptiRadarPreview() {
  const size = 280;
  const center = size / 2;
  const radius = 92;
  const levels = [0.25, 0.5, 0.75, 1];
  const sampleScores = [0.82, 0.61, 0.74, 0.57, 0.65, 0.69, 0.8, 0.53, 0.71];

  const nodes = DIMS.map((dim, idx) => {
    const angle = (-Math.PI / 2) + (idx * 2 * Math.PI) / DIMS.length;
    const score = sampleScores[idx] ?? 0.6;
    const valueX = center + Math.cos(angle) * radius * score;
    const valueY = center + Math.sin(angle) * radius * score;
    const axisX = center + Math.cos(angle) * radius;
    const axisY = center + Math.sin(angle) * radius;
    const labelX = center + Math.cos(angle) * (radius + 16);
    const labelY = center + Math.sin(angle) * (radius + 16);
    const textAnchor: 'start' | 'middle' | 'end' = labelX > center + 8 ? 'start' : labelX < center - 8 ? 'end' : 'middle';

    return { dim, valueX, valueY, axisX, axisY, labelX, labelY, textAnchor, idx };
  });

  const polygon = nodes.map((n) => `${n.valueX},${n.valueY}`).join(' ');

  return (
    <div className="rounded-2xl border border-[#A3526E]/25 bg-[#1A0C11] p-4 sm:p-5 mb-6">
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] h-auto" role="img" aria-label="九维情欲雷达预览图">
          {levels.map((level) => {
            const points = nodes
              .map((n) => {
                const x = center + (n.axisX - center) * level;
                const y = center + (n.axisY - center) * level;
                return `${x},${y}`;
              })
              .join(' ');

            return <polygon key={level} points={points} fill="none" stroke="rgba(214,197,179,0.22)" strokeWidth="1" />;
          })}

          {nodes.map((n) => (
            <line key={`axis-${n.idx}`} x1={center} y1={center} x2={n.axisX} y2={n.axisY} stroke="rgba(214,197,179,0.18)" strokeWidth="1" />
          ))}

          <polygon points={polygon} fill="rgba(163,82,110,0.25)" stroke="#E6CDD5" strokeWidth="1.6" />

          {nodes.map((n) => (
            <circle key={`dot-${n.idx}`} cx={n.valueX} cy={n.valueY} r="2.8" fill="#E6CDD5" />
          ))}

          {nodes.map((n) => (
            <text
              key={`label-${n.idx}`}
              x={n.labelX}
              y={n.labelY}
              fill="#A38A90"
              fontSize="10"
              textAnchor={n.textAnchor}
            >
              D{n.idx + 1}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function XptiHomeContent() {
  return (
    <div className="min-h-screen text-white/90" style={{ background: VOID_BG }}>
      {/* Scoped marquee animation */}
      <style>{`
        @keyframes xpti-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .xpti-marquee-track {
          animation: xpti-marquee 90s linear infinite;
          will-change: transform;
        }
        .xpti-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .xpti-marquee-track {
            animation: none;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .xpti-marquee-track::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          HERO — geometric constellation on warm canvas
         ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Soft radial blush — XPTI 的微醺暗场 */}
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            animationDuration: '4s',
            background: `
              radial-gradient(ellipse 70% 80% at 50% 30%, rgba(114, 47, 55, 0.2) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 80% 50%, rgba(222, 49, 99, 0.15) 0%, transparent 60%)
            `,
          }}
          aria-hidden="true"
        />

        <div className="max-w-2xl mx-auto px-6 pt-32 pb-14 text-center relative">
          <div className="animate-fade-up">
            {/* Constellation mark — XPTI 的九维星座感标记 */}
            <div className="mb-10 flex justify-center" aria-hidden="true">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="opacity-30">
                <circle cx="26" cy="8" r="2.5" stroke={VELVET_DARK_WINE} strokeWidth="0.8" fill="none" />
                <circle cx="8" cy="26" r="2.5" stroke={VELVET_ROSE} strokeWidth="0.8" fill="none" />
                <circle cx="44" cy="26" r="2.5" stroke="#E6CDD5" strokeWidth="0.8" fill="none" />
                <circle cx="26" cy="44" r="2.5" stroke="#6A2A3E" strokeWidth="0.8" fill="none" />
                <line x1="26" y1="8" x2="8" y2="26" stroke={VELVET_DARK_WINE} strokeWidth="0.4" opacity="0.5" />
                <line x1="26" y1="8" x2="44" y2="26" stroke="#E6CDD5" strokeWidth="0.4" opacity="0.5" />
                <line x1="8" y1="26" x2="26" y2="44" stroke="#6A2A3E" strokeWidth="0.4" opacity="0.5" />
                <line x1="44" y1="26" x2="26" y2="44" stroke={VELVET_ROSE} strokeWidth="0.4" opacity="0.5" />
              </svg>
            </div>

            <p
              className="text-xs tracking-[0.35em] uppercase mb-8"
              style={{ fontFamily: monoFont, color: '#B8A2AA' }}
            >
              XPTI · 亲密偏好图谱
            </p>

            <h1
              className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.5] mb-6 text-balance"
              style={{ fontFamily: headingFont, fontWeight: 600, color: '#F3E8EB', letterSpacing: '-0.01em' }}
            >
              MBTI 测你是什么人
              <br />
              XPTI 测你
              <span
                className="relative inline-block mx-0.5"
                style={{
                  background: `linear-gradient(90deg, ${VELVET_DARK_WINE}, ${VELVET_ROSE})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                你想要的是谁
              </span>
            </h1>

            <XptiDecoLine className="mb-6" style={{ color: `${VELVET_DARK_WINE}40` }} />

            <p
              className="text-base sm:text-lg leading-[2] max-w-md mx-auto mb-3"
              style={{ color: '#D4C5C9' }}
            >
              9 维亲密张力 · 12 种关系原型
              <br />
              54 题随机抽 27 题，每次都不一样
            </p>

            <p
              className="text-sm mb-12"
              style={{ fontFamily: monoFont, color: '#AA949D' }}
            >
              27 questions · 3 min · different each time
            </p>

            <Link
              href="/xpti/test"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: VELVET_ROSE, color: '#FFF',
                boxShadow: `0 12px 36px -12px rgba(163,82,110,0.55)`,
                letterSpacing: '0.06em',
              }}
            >
              开始测试
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>

            <p
              className="mt-5 text-xs tracking-[0.15em]"
              style={{ fontFamily: monoFont, color: '#AA949D' }}
            >
              预计用时 3 分钟 · 重测会换题
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 flex items-center justify-center gap-10 sm:gap-16 animate-fade-up-delay-1">
            {[
              { value: '9', label: '情欲维度', color: '#e8729c' },
              { value: '12', label: '关系原型', color: VELVET_DARK_WINE },
              { value: '3', label: 'min', color: '#6A2A3E' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-semibold mb-1.5"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ fontFamily: monoFont, color: '#AA949D' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SIGNAL — narrative hook card
         ═══════════════════════════════════════════════ */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
            style={{
              background: CARD_BG,
              border: `1px solid ${VELVET_ROSE}35`,
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 100% 0%, rgba(214,197,179,0.3) 0%, transparent 60%)`,
              }}
              aria-hidden="true"
            />

            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-8 relative"
              style={{ fontFamily: monoFont, color: '#AE98A1' }}
            >
              MANIFESTO · 靠近宣言
            </p>

            <p className="text-lg leading-[2.2] mb-8 relative" style={{ color: '#D4C5C9' }}>
              别人问你是 I 还是 E，
              <br />
              我们更想知道
              <br />
              <span style={{ color: VELVET_BLUSH }}>你会为怎样的靠近卸下防备？</span>
            </p>

            <div className="space-y-0 relative">
              {[
                { old: '你是哪种人', xpti: '你会被怎样的人打动' },
                { old: '行为模式分类', xpti: '9 维亲密张力' },
                { old: '给你一个标签', xpti: '照见你的靠近方式' },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 py-4"
                  style={{ borderBottom: i < 2 ? '1px solid rgba(163,82,110,0.22)' : 'none' }}
                >
                  <span className="text-sm flex-1 text-right" style={{ color: '#AA949D' }}>
                    {row.old}
                  </span>
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ fontFamily: monoFont, color: `${VELVET_ROSE}50` }}
                  >
                    →
                  </span>
                  <span className="text-sm flex-1" style={{ color: '#E6CDD5' }}>
                    {row.xpti}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

        {/* ═══════════════════════════════════════════════
          NINE DIMENSIONS — with geometric accent
         ═══════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-3"
              style={{ fontFamily: monoFont, color: '#AE98A1' }}
            >
              NINE DIMENSIONS · 九条靠近线索
            </p>
            <h2
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
              style={{ fontFamily: headingFont, color: '#F3E8EB' }}
            >
              亲密偏好的九条线
            </h2>
          </div>

          <XptiRadarPreview />

          <div className="grid gap-3">
            {DIMS.map((ax, i) => {
              const color = XPTI_MODEL_COLORS[ax.key];
              return (
                <div
                  key={ax.key}
                  className="animate-fade-up rounded-xl p-5 sm:p-6 transition-all duration-200 hover:shadow-lg"
                  style={{
                    animationDelay: `${i * 70}ms`,
                    background: `linear-gradient(155deg, ${color.base}18 0%, rgba(26,12,17,0.95) 56%, rgba(13,6,8,0.95) 100%)`,
                    border: `1px solid ${color.base}24`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Axis node */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-sm"
                        style={{
                          fontFamily: monoFont,
                          fontWeight: 500,
                          background: color.bg,
                          color: color.base,
                        }}
                      >
                        D{i + 1}
                      </div>
                      {/* Accent dot */}
                      <div
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{ background: color.base, opacity: 0.7 }}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm tracking-wide" style={{ color: color.base }}>
                          {XPTI_MODEL_NAMES[ax.key]}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <span style={{ color: color.base }}>{ax.poleLow}</span>
                          <span style={{ color: `${color.base}30` }}>—</span>
                          <span style={{ color: color.base }}>{ax.poleHigh}</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#C9BAC0' }}>
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
          CONSTELLATION MAP — marquee of 12 personality cards
         ═══════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 mb-8">
          <div className="flex items-baseline justify-between">
            <div>
              <p
                className="text-[10px] tracking-[0.35em] uppercase mb-3"
                style={{ fontFamily: monoFont, color: '#AE98A1' }}
              >
                PERSONALITY ARCHIVE
              </p>
              <h2
                className="text-xl sm:text-2xl font-semibold tracking-tight"
                style={{ fontFamily: headingFont, color: '#F3E8EB' }}
              >
                12 种关系原型
              </h2>
            </div>
            <p
              className="text-xs"
              style={{ fontFamily: monoFont, color: '#AA949D' }}
            >
              12 types ←→
            </p>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="xpti-marquee-track flex gap-4 py-2 px-4">
            {[...XPTI_PERSONALITY_TYPES, ...XPTI_PERSONALITY_TYPES].map((p, i) => (
              <Link
                key={`${p.slug}-${i}`}
                href={`/xpti/result/${p.slug}`}
                prefetch={false}
                className="group flex-shrink-0 w-[155px] sm:w-[175px] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ border: `1px solid ${p.color}18` }}
              >
                {/* Image area with gradient */}
                <div
                  className="h-[105px] sm:h-[125px] relative flex items-center justify-center"
                  style={{
                    background: `linear-gradient(160deg, ${p.color}20 0%, ${p.color}10 60%, #1A0C11 100%)`,
                  }}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-110 transition-transform duration-300">
                    <NextImage
                      src={getXptiTypeThumbnailImage(p.slug)}
                      alt={p.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <span
                    className="absolute top-2.5 right-2.5 text-[9px] tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: monoFont,
                      color: p.color,
                      background: 'rgba(13,6,8,0.76)',
                    }}
                  >
                    {p.code}
                  </span>
                </div>

                {/* Info */}
                <div className="px-3.5 py-3.5" style={{ background: '#1A0C11' }}>
                  <p className="text-sm mb-0.5 tracking-wide" style={{ color: p.color }}>
                    {p.name}
                  </p>
                  <p
                    className="text-[11px] line-clamp-1 leading-relaxed"
                    style={{ color: '#B49FA6' }}
                  >
                    {p.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p
          className="text-center mt-4 text-[11px]"
          style={{ fontFamily: monoFont, color: '#97828A' }}
        >
          悬停可暂停 · 点击进入人格页
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          SPOTLIGHT — featured personality cards
         ═══════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <XptiDecoLine className="mb-12" style={{ color: `${VELVET_DARK_WINE}30` }} />

          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: monoFont, color: '#AE98A1' }}
          >
            CURATED TYPES
          </p>
          <h2
            className="text-xl sm:text-2xl font-semibold tracking-tight mb-4"
            style={{ fontFamily: headingFont, color: '#F3E8EB' }}
          >
            关系原型速览
          </h2>
          <p className="text-sm leading-[1.9] mb-12" style={{ color: '#D4C5C9' }}>
            每种原型都是一种靠近人的方式，
            <br />
            你最像哪一种？
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_SLUGS.map((slug, i) => {
              const type = XPTI_PERSONALITY_TYPES.find((p: (typeof XPTI_PERSONALITY_TYPES)[number]) => p.slug === slug);
              if (!type) return null;
              return (
                <Link
                  key={slug}
                  href={`/xpti/result/${slug}`}
                  prefetch={false}
                  className="group animate-fade-up block rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    animationDelay: `${i * 70}ms`,
                    background: `linear-gradient(155deg, ${type.color}16 0%, ${type.color}08 50%, rgba(13,6,8,0.95) 100%)`,
                    border: `1px solid ${type.color}26`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{type.emoji}</span>
                    <div className="flex-1">
                      <span className="text-base tracking-wide" style={{ color: type.color }}>
                        {type.name}
                      </span>
                    </div>
                    <span
                      className="text-[10px] tracking-wider"
                      style={{ fontFamily: monoFont, color: `${type.color}70` }}
                    >
                      {type.code}
                    </span>
                  </div>

                  <div className="mb-3" style={{ borderTop: `1px solid ${type.color}12` }} />

                  <p className="text-sm" style={{ color: '#C5B2BA' }}>
                    {type.tagline}
                  </p>

                  <p
                    className="text-[11px] mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: type.color }}
                  >
                    查看完整人格 →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          DECODE — three-step flow
         ═══════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-3"
            style={{ fontFamily: monoFont, color: `${VELVET_DARK_WINE}50` }}
          >
            DECODE
          </p>
          <h2
            className="text-xl sm:text-2xl font-semibold tracking-tight mb-10"
            style={{ fontFamily: headingFont, color: '#F3E8EB' }}
          >
            三步照见你的亲密偏好
          </h2>

          <div className="space-y-0">
            {[
              { num: '01', title: '进入题库', desc: '27 道随机情境题，每次抽题不同', sub: '没有对错，只有你的真实反应' },
              { num: '02', title: '解码图谱', desc: '9 维定位你的亲密张力', sub: '细到你会怀疑它怎么这么懂你' },
              { num: '03', title: '遇见原型', desc: '12 种关系原型，哪一种最像你', sub: '结果页可以直接丢给那个你想试探的人' },
            ].map((item, i) => (
              <div
                key={item.num}
                className="animate-fade-up flex items-start gap-5 py-6"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderBottom: i < 2 ? `1px solid ${VELVET_DARK_WINE}08` : 'none',
                }}
              >
                <span
                  className="text-2xl flex-shrink-0 w-10 text-center"
                  style={{ fontFamily: monoFont, fontWeight: 400, color: `${VELVET_DARK_WINE}25` }}
                >
                  {item.num}
                </span>
                <div>
                  <h3 className="text-base mb-1" style={{ color: '#F3E8EB' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#D4C5C9' }}>
                    {item.desc}，<span style={{ color: VELVET_DARK_WINE }}>{item.sub}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — final call
         ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 60%, rgba(168,85,247,0.04) 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        <div className="max-w-md mx-auto text-center relative">
          <XptiDecoLine className="mb-10" style={{ color: `${VELVET_DARK_WINE}30` }} />

          <p className="text-lg leading-[2] mb-10" style={{ color: '#D4C5C9' }}>
            你的亲密偏好，
            <br />
            <span style={{ color: VELVET_ROSE }}>藏在这 12 种原型里</span>，等你来认领
          </p>

          <Link
            href="/xpti/test"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white text-lg transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: VELVET_ROSE, color: '#FFF',
              boxShadow: '0 6px 28px rgba(168,85,247,0.20)',
              letterSpacing: '0.06em',
            }}
          >
            测测你的靠近方式
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-text-muted/40">
            <Link href="/test/" className="hover:text-text-muted transition-colors">
              经典人格版
            </Link>
            <span>·</span>
            <Link href="/soulti/" className="hover:text-text-muted transition-colors">
              SoulTI 觉察版
            </Link>
            <span>·</span>
            <Link href="/wtfti/" className="hover:text-text-muted transition-colors">
              WTF 毒舌版
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
