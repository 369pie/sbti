import Link from 'next/link';
import NextImage from 'next/image';
import { XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '../../lib/xpti/dimensions';
import type { XptiModelType } from '../../lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiTypeThumbnailImage } from '../../lib/xpti/personalities';

/* XPTI 主调：枯玫瑰 + 深酒红，作为 paper 上的 accent，与首页 editorial 系统统一。 */
const VELVET_DARK_WINE = '#6A2A3E';
const VELVET_ROSE = '#A85A6E';

const DIMS: { key: XptiModelType; poleHigh: string; poleLow: string; question: string }[] = [
  { key: 'dominance', poleHigh: '指挥官', poleLow: '乖顺流', question: '你在亲密关系里是导演还是女主' },
  { key: 'exposure', poleHigh: '坦白局', poleLow: '面具系', question: '你愿意暴露多少真实的自己' },
  { key: 'sensory', poleHigh: '通感体', poleLow: '钝感力', question: '一次触碰能让你过电吗' },
  { key: 'tempo', poleHigh: '微波炉', poleLow: '慢火锅', question: '你喜欢快节奏还是慢慢升温' },
  { key: 'mirror', poleHigh: '镜子型', poleLow: '自足型', question: '你需要对方的确认来获取自信吗' },
  { key: 'boundary', poleHigh: '弹力绳', poleLow: '铁闸门', question: '你的「可以/不可以」边界有多灵活' },
  { key: 'fantasy', poleHigh: '编剧魂', poleLow: '现实派', question: '你脑内剧本的丰富程度' },
  { key: 'attachment', poleHigh: '黏人精', poleLow: '独行猫', question: '你对亲密连接的需求有多强' },
  { key: 'repetition', poleHigh: '回味党', poleLow: '探索癖', question: '你偏好熟悉的深入还是新鲜的刺激' },
];

const FEATURED_SLUGS = ['switch', 'mind-theater', 'synesthete', 'night-writer', 'screamer', 'sober-addict'] as const;

const STEPS = [
  { num: '01', title: '进入题库', desc: '27 道随机情境题，每次抽题不同', sub: '没有对错，只有你的真实反应' },
  { num: '02', title: '解码图谱', desc: '9 维定位你的亲密张力', sub: '细到你会怀疑它怎么这么懂你' },
  { num: '03', title: '遇见原型', desc: '12 种关系原型，哪一种最像你', sub: '结果页可以丢给那个你想试探的人' },
];

/** 极简 9 维雷达预览 —— 编辑稿风的细线插画。 */
function XptiRadarPreview() {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const levels = [0.25, 0.5, 0.75, 1];
  const sampleScores = [0.82, 0.61, 0.74, 0.57, 0.65, 0.69, 0.8, 0.53, 0.71];

  const nodes = DIMS.map((dim, idx) => {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / DIMS.length;
    const score = sampleScores[idx] ?? 0.6;
    const valueX = center + Math.cos(angle) * radius * score;
    const valueY = center + Math.sin(angle) * radius * score;
    const axisX = center + Math.cos(angle) * radius;
    const axisY = center + Math.sin(angle) * radius;
    const labelX = center + Math.cos(angle) * (radius + 16);
    const labelY = center + Math.sin(angle) * (radius + 16);
    const textAnchor: 'start' | 'middle' | 'end' =
      labelX > center + 8 ? 'start' : labelX < center - 8 ? 'end' : 'middle';
    return { dim, valueX, valueY, axisX, axisY, labelX, labelY, textAnchor, idx };
  });
  const polygon = nodes.map(n => `${n.valueX},${n.valueY}`).join(' ');

  return (
    <div className="flex justify-center my-2 sm:my-4">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[320px] h-auto"
        role="img"
        aria-label="九维亲密偏好雷达预览"
      >
        {levels.map(level => {
          const points = nodes
            .map(n => {
              const x = center + (n.axisX - center) * level;
              const y = center + (n.axisY - center) * level;
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="var(--color-rule-soft)"
              strokeWidth="0.8"
            />
          );
        })}
        {nodes.map(n => (
          <line
            key={`axis-${n.idx}`}
            x1={center}
            y1={center}
            x2={n.axisX}
            y2={n.axisY}
            stroke="var(--color-rule-soft)"
            strokeWidth="0.6"
          />
        ))}
        <polygon points={polygon} fill={`${VELVET_ROSE}22`} stroke={VELVET_DARK_WINE} strokeWidth="1.2" />
        {nodes.map(n => (
          <circle key={`dot-${n.idx}`} cx={n.valueX} cy={n.valueY} r="2.4" fill={VELVET_DARK_WINE} />
        ))}
        {nodes.map(n => (
          <text
            key={`label-${n.idx}`}
            x={n.labelX}
            y={n.labelY}
            fill="var(--color-ink-mute)"
            fontSize="9.5"
            textAnchor={n.textAnchor}
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}
          >
            D{n.idx + 1}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function XptiHomeContent() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      <style>{`
        @keyframes xpti-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .xpti-marquee-track { animation: xpti-marquee 90s linear infinite; will-change: transform; }
        .xpti-marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .xpti-marquee-track { animation: none; overflow-x: auto; scrollbar-width: none; }
          .xpti-marquee-track::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 sm:pt-28 pb-16 sm:pb-24">
          <div className="animate-fade-up">
            <div className="flex items-center gap-4 mb-10">
              <span className="serial-number text-sm">Issue · XPTI</span>
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <span className="eyebrow">Intimacy Preference Atlas</span>
            </div>

            <h1 className="mb-8 leading-[0.95]">
              <span
                className="brand-wtf block text-[26vw] sm:text-[12rem] md:text-[14rem]"
                style={{ color: VELVET_DARK_WINE }}
              >
                XP
                <span
                  className="brand-ti text-[18vw] sm:text-[8rem] md:text-[9rem] ml-2"
                  style={{ color: 'var(--color-ink)' }}
                >
                  ti
                </span>
              </span>
            </h1>

            <div className="max-w-2xl">
              <p className="editorial-display text-3xl sm:text-5xl md:text-6xl mb-6">
                MBTI 测你是什么人
                <br />
                XPTI 测<span className="editorial-italic" style={{ color: VELVET_DARK_WINE }}>你想要的是谁</span>
              </p>
              <hr className="editorial-rule w-24 mb-6" />
              <p className="text-base sm:text-lg leading-[1.8] text-text-secondary max-w-xl">
                9 维亲密张力 · 12 种关系原型。
                <br className="hidden sm:block" />
                54 题中随机抽 27 题，每次重测都不一样。
              </p>
            </div>

            <div className="mt-10 sm:mt-14 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/xpti/test/"
                prefetch={false}
                className="btn"
                style={{
                  background: VELVET_DARK_WINE,
                  color: '#FFFFFF',
                  borderColor: VELVET_DARK_WINE,
                }}
              >
                开始测试 <span className="opacity-70">→</span>
              </Link>
              <Link href="/types/" prefetch={false} className="btn btn-ghost">
                先翻翻 12 种原型
              </Link>
              <Link
                href="/"
                prefetch={false}
                className="eyebrow ml-1 hover:text-text-primary transition-colors"
              >
                ← 返回 WTFti
              </Link>
            </div>
          </div>
        </div>
        <hr className="editorial-rule-soft max-w-5xl mx-6 sm:mx-auto" />
      </section>

      {/* ── Stats ─────────────────────────────────── */}
      <section className="px-6 sm:px-10">
        <div
          className="max-w-5xl mx-auto grid grid-cols-3"
          style={{ borderBottom: '1px solid var(--color-rule-soft)' }}
        >
          {[
            { value: '9', label: '亲密维度' },
            { value: '12', label: '关系原型' },
            { value: '3 min', label: '完成测试' },
          ].map((s, idx) => (
            <div
              key={s.label}
              className="py-8 sm:py-10 text-center"
              style={{ borderLeft: idx > 0 ? '1px solid var(--color-rule-soft)' : 'none' }}
            >
              <div className="stat-value text-3xl sm:text-5xl text-text-primary leading-none">
                {s.value}
              </div>
              <div className="eyebrow mt-3">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Manifesto ─────────────────────────── */}
      <section className="py-16 sm:py-24 px-6 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">02</span>
            <span className="eyebrow">Manifesto · 靠近宣言</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              别人问你是 I 还是 E，
              <br />
              我们更想知道
              <br />
              <span className="editorial-italic" style={{ color: VELVET_DARK_WINE }}>
                你会为怎样的靠近卸下防备？
              </span>
            </h2>
          </div>

          <div style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
            {[
              { old: '你是哪种人', xpti: '你会被怎样的人打动' },
              { old: '行为模式分类', xpti: '9 维亲密张力' },
              { old: '给你一个标签', xpti: '照见你的靠近方式' },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8 py-5"
                style={{ borderBottom: '1px solid var(--color-rule-soft)' }}
              >
                <span className="text-sm sm:text-base text-text-muted text-right">{row.old}</span>
                <span className="serial-number text-xs" style={{ color: VELVET_ROSE }}>→</span>
                <span
                  className="text-sm sm:text-base"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                  }}
                >
                  {row.xpti}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nine Dimensions ─────────────────── */}
      <section
        className="py-16 sm:py-24 px-6 sm:px-10"
        style={{ borderTop: '1px solid var(--color-rule-soft)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">03</span>
            <span className="eyebrow">Nine dimensions · 九条线索</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              亲密偏好的<span className="editorial-italic">九条线</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              每一条都是你靠近一个人时，悄悄被点亮的频率。
            </p>
          </div>

          <XptiRadarPreview />

          <div
            className="grid gap-px mt-10"
            style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}
          >
            {DIMS.map((ax, i) => {
              const color = XPTI_MODEL_COLORS[ax.key];
              return (
                <div
                  key={ax.key}
                  className="flex items-center gap-5 sm:gap-7 px-5 sm:px-8 py-5 sm:py-6 animate-fade-up"
                  style={{ background: 'var(--color-bg-elevated)', animationDelay: `${i * 50}ms` }}
                >
                  <span
                    className="serial-number text-base sm:text-lg flex-shrink-0 w-12"
                    style={{ color: color.base }}
                  >
                    D{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-base sm:text-lg leading-snug mb-1"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        color: 'var(--color-ink)',
                      }}
                    >
                      {XPTI_MODEL_NAMES[ax.key]}
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{ax.question}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs flex-shrink-0">
                    <span style={{ color: color.base }}>{ax.poleLow}</span>
                    <span className="h-px w-6" style={{ background: color.base, opacity: 0.5 }} />
                    <span style={{ color: color.base }}>{ax.poleHigh}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Personality archive marquee ───── */}
      <section className="py-16 sm:py-20" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 mb-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <span className="serial-number text-xs mr-3">04</span>
              <span className="eyebrow">Personality archive</span>
              <h2 className="section-headline text-2xl sm:text-4xl mt-3">
                12 种<span className="editorial-italic">关系原型</span>
              </h2>
            </div>
            <span className="eyebrow hidden sm:inline">12 types ←→</span>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="xpti-marquee-track flex gap-3 sm:gap-4 py-2 px-4">
            {[...XPTI_PERSONALITY_TYPES, ...XPTI_PERSONALITY_TYPES].map((p, i) => (
              <Link
                key={`${p.slug}-${i}`}
                href={`/xpti/result/${p.slug}/`}
                prefetch={false}
                className="group flex-shrink-0 w-[155px] sm:w-[185px] transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-rule-soft)',
                }}
              >
                <div
                  className="h-[110px] sm:h-[130px] relative flex items-center justify-center"
                  style={{ background: 'var(--color-paper-warm)' }}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-105 transition-transform duration-300">
                    <NextImage
                      src={getXptiTypeThumbnailImage(p.slug)}
                      alt={p.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <span
                    className="absolute top-2.5 right-2.5 text-[9px] tracking-wider px-1.5 py-0.5"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: p.color,
                      background: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {p.code}
                  </span>
                </div>
                <div className="px-3.5 py-3.5">
                  <p
                    className="text-sm mb-0.5 tracking-wide"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {p.name}
                  </p>
                  <p className="text-[11px] line-clamp-1 leading-relaxed text-text-muted">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <p className="text-center mt-4 eyebrow">悬停可暂停 · 点击进入人格页</p>
      </section>

      {/* ── Curated featured types ─────────── */}
      <section
        className="py-16 sm:py-24 px-6 sm:px-10"
        style={{ borderTop: '1px solid var(--color-rule-soft)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">05</span>
            <span className="eyebrow">Curated</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              关系原型<span className="editorial-italic">速览</span>
            </h2>
            <p className="display-tagline text-text-secondary mt-4 text-base sm:text-lg max-w-xl">
              每种原型都是一种靠近人的方式——你最像哪一个？
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px"
            style={{ background: 'var(--color-rule-soft)', border: '1px solid var(--color-rule-soft)' }}
          >
            {FEATURED_SLUGS.map((slug, i) => {
              const type = XPTI_PERSONALITY_TYPES.find(
                (p: (typeof XPTI_PERSONALITY_TYPES)[number]) => p.slug === slug,
              );
              if (!type) return null;
              return (
                <Link
                  key={slug}
                  href={`/xpti/result/${slug}/`}
                  prefetch={false}
                  className="group block p-6 sm:p-8 transition-colors duration-500 animate-fade-up"
                  style={{ background: 'var(--color-bg-elevated)', animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="serial-number text-xs">N°{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-xs font-mono tracking-wider" style={{ color: type.color }}>
                      {type.code}
                    </span>
                  </div>
                  <div className="text-4xl mb-5">{type.emoji}</div>
                  <div
                    className="text-lg sm:text-xl text-text-primary mb-2"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {type.name}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{type.tagline}</p>
                  <span
                    className="block mt-6 h-px transition-all duration-500 group-hover:w-12"
                    style={{ background: type.color, width: 8, opacity: 0.6 }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3-step decode ──────────────────── */}
      <section
        className="py-16 sm:py-24 px-6 sm:px-10"
        style={{ borderTop: '1px solid var(--color-rule-soft)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 sm:mb-14 animate-fade-up">
            <span className="serial-number text-xs mr-3">06</span>
            <span className="eyebrow">Decode</span>
            <h2 className="section-headline text-2xl sm:text-4xl mt-3">
              三步<span className="editorial-italic">照见你的亲密偏好</span>
            </h2>
          </div>

          <div style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
            {STEPS.map((item, i) => (
              <div
                key={item.num}
                className="flex items-start gap-6 sm:gap-10 py-6 sm:py-8 animate-fade-up"
                style={{
                  borderBottom: '1px solid var(--color-rule-soft)',
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span
                  className="serial-number text-xl sm:text-2xl flex-shrink-0 w-12 sm:w-16"
                  style={{ color: VELVET_DARK_WINE }}
                >
                  {item.num}
                </span>
                <div className="flex-1">
                  <h3
                    className="text-lg sm:text-xl mb-2 text-text-primary"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    {item.desc}，<span style={{ color: VELVET_DARK_WINE }}>{item.sub}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────── */}
      <section
        className="py-20 sm:py-32 px-6 sm:px-10 text-center"
        style={{ borderTop: '1px solid var(--color-rule-soft)' }}
      >
        <div className="max-w-2xl mx-auto">
          <span className="serial-number text-xs mr-3">07</span>
          <span className="eyebrow">Ready</span>
          <h2 className="editorial-display text-3xl sm:text-5xl md:text-6xl mt-6 mb-4">
            你的亲密偏好，
            <br />
            <span className="editorial-italic" style={{ color: VELVET_DARK_WINE }}>
              藏在这 12 种原型里
            </span>
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-10 leading-[1.8]">
            一份给当代女性的亲密关系图谱。
            <br className="sm:hidden" />
            等你来认领。
          </p>
          <hr className="editorial-rule w-16 mx-auto mb-10" />
          <Link
            href="/xpti/test/"
            prefetch={false}
            className="btn"
            style={{ background: VELVET_DARK_WINE, color: '#FFFFFF', borderColor: VELVET_DARK_WINE }}
          >
            测测你的靠近方式 <span className="opacity-70">→</span>
          </Link>

          <div className="mt-10 flex items-center justify-center gap-4 text-xs eyebrow">
            <Link href="/test/" className="hover:text-text-primary transition-colors">
              经典人格版
            </Link>
            <span>·</span>
            <Link href="/soulti/" className="hover:text-text-primary transition-colors">
              SoulTI 觉察版
            </Link>
            <span>·</span>
            <Link href="/wtfti/" className="hover:text-text-primary transition-colors">
              WTF 毒舌版
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
