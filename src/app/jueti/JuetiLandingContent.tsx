import Link from 'next/link';
import { JUETI_MODEL_NAMES, JUETI_MODEL_COLORS } from '@/lib/jueti/dimensions';
import type { JuetiModelType } from '@/lib/jueti/dimensions';
import { JUETI_PERSONALITY_TYPES } from '@/lib/jueti/personalities';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

const AXES: { key: JuetiModelType; poleA: string; poleB: string; question: string }[] = [
  { key: 'tide',  poleA: '涌', poleB: '静', question: '你的能量是向外涌动还是向内沉淀' },
  { key: 'root',  poleA: '根', poleB: '风', question: '你需要确定性的锚还是拥抱未知' },
  { key: 'edge',  poleA: '融', poleB: '壁', question: '你的边界是柔和的还是清晰的' },
  { key: 'spark', poleA: '焰', poleB: '烬', question: '你的内在能量是恒定的还是间歇的' },
];

export default function JuetiLandingContent() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Hero — literary serif style */}
      <section className="relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-24 text-center relative">
          <div className="animate-fade-up">
            {/* Pro badge */}
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs tracking-[0.15em] mb-10 border"
              style={{
                fontFamily: serifFont,
                color: '#8b7355',
                background: 'rgba(139,115,85,0.06)',
                borderColor: 'rgba(139,115,85,0.15)',
              }}
            >
              ✦ 全新觉察版本
            </span>

            <p
              className="text-base text-text-muted/70 mb-6 tracking-wider"
              style={{ fontFamily: serifFont }}
            >
              你知道吗？
            </p>

            <h1
              className="text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.5] mb-4"
              style={{ fontFamily: serifFont, fontWeight: 400, color: '#2D2A26' }}
            >
              <span className="line-through decoration-1 opacity-50">SBTI</span>{' '}
              测的是你怎么活
              <br />
              <span style={{ color: '#8b7355' }}>觉TI</span> 看的是你为什么
            </h1>

            <p
              className="text-lg sm:text-xl text-text-secondary leading-[1.9] max-w-md mx-auto mb-3"
              style={{ fontFamily: serifFont }}
            >
              从行为到内在，
              <br />
              同一个你，更深一层的翻译。
            </p>

            <p
              className="text-sm text-text-muted/60 mb-12 tracking-wider"
              style={{ fontFamily: serifFont, fontStyle: 'italic' }}
            >
              — 不是标签，是一面安静的镜子
            </p>

            <Link
              href="/jueti/test"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-medium text-base transition-all duration-300 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #8b7355, #b09a78)',
                boxShadow: '0 8px 32px rgba(139,115,85,0.25)',
              }}
            >
              开始觉察 →
            </Link>

            <p className="mt-5 text-xs text-text-muted/50 tracking-wider">
              预计用时 3 分钟 · 20 道自问 · 16 种自然人格
            </p>
          </div>

          {/* Stats — elegant serif style */}
          <div className="mt-20 flex items-center justify-center gap-8 sm:gap-14 animate-fade-up-delay-1">
            {[
              { value: '4', label: '觉察轴' },
              { value: '16', label: '自然人格' },
              { value: '3', label: '分钟' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl sm:text-4xl mb-1"
                  style={{ fontFamily: serifFont, fontWeight: 400, color: '#8b7355' }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] tracking-[0.2em] text-text-muted/50" style={{ fontFamily: serifFont }}>
                  {stat.label}
                </div>
                {i < 2 && (
                  <span className="hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t" style={{ borderColor: 'rgba(139,115,85,0.12)' }} />
      </div>

      {/* What is觉TI — poetic intro */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-10"
            style={{ fontFamily: serifFont, color: 'rgba(139,115,85,0.4)' }}
          >
            ABOUT 觉TI
          </p>

          <blockquote
            className="text-lg sm:text-xl leading-[2.2] text-text-primary/75 mb-10"
            style={{ fontFamily: serifFont }}
          >
            SBTI 通过 15 个维度翻译你的行为模式，
            <br />
            觉TI 换了一种问法——不问你做了什么，问你为什么这样。
            <br />
            <br />
            潮汐、锚定、界限、火焰，
            <br />
            四个轴，照出的不是性格，
            <span style={{ color: '#8b7355' }}>是你还没说出口的自己。</span>
          </blockquote>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-xs mx-auto px-6">
        <div className="border-t" style={{ borderColor: 'rgba(139,115,85,0.12)' }} />
      </div>

      {/* 4 Axes — minimal serif cards */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-10"
            style={{ fontFamily: serifFont, color: 'rgba(139,115,85,0.4)' }}
          >
            FOUR AXES · 四轴
          </p>

          <div className="grid gap-4">
            {AXES.map((ax, i) => {
              const color = JUETI_MODEL_COLORS[ax.key];
              return (
                <div
                  key={ax.key}
                  className="animate-fade-up rounded-2xl p-6 sm:p-8 transition-shadow hover:shadow-md"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    background: '#FDFCFA',
                    border: `1px solid ${color.base}15`,
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        fontFamily: serifFont,
                        background: color.bg,
                        color: color.base,
                      }}
                    >
                      {JUETI_MODEL_NAMES[ax.key][0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-base tracking-[0.1em]"
                          style={{ fontFamily: serifFont, color: color.base }}
                        >
                          {JUETI_MODEL_NAMES[ax.key]}
                        </span>
                      </div>
                      <p
                        className="text-sm text-text-secondary/80 leading-relaxed mb-4"
                        style={{ fontFamily: serifFont }}
                      >
                        {ax.question}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ fontFamily: serifFont }}>
                        <span className="tracking-wider" style={{ color: color.base }}>{ax.poleA}</span>
                        <span className="flex-1 border-t" style={{ borderColor: `${color.base}20` }} />
                        <span className="tracking-wider" style={{ color: color.base }}>{ax.poleB}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3-act structure — literary style */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-10"
            style={{ fontFamily: serifFont, color: 'rgba(139,115,85,0.4)' }}
          >
            THREE ACTS · 三幕自问
          </p>

          <div className="space-y-6">
            {[
              { num: 'I', title: '白天的你', desc: '日常场景里你的自然反应', sub: '看见最表层的自己' },
              { num: 'II', title: '深夜的你', desc: '脆弱时刻的真实选择', sub: '看见藏起来的那一面' },
              { num: 'III', title: '梦里的你', desc: '抽象意象的直觉回应', sub: '看见你还没说出口的自己' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="animate-fade-up flex items-start gap-6 py-6"
                style={{ animationDelay: `${i * 100}ms`, borderBottom: '1px solid rgba(139,115,85,0.08)' }}
              >
                <span
                  className="text-2xl sm:text-3xl flex-shrink-0 w-12"
                  style={{ fontFamily: serifFont, fontWeight: 400, color: 'rgba(139,115,85,0.25)' }}
                >
                  {item.num}
                </span>
                <div>
                  <h3
                    className="text-base sm:text-lg mb-1"
                    style={{ fontFamily: serifFont, color: '#2D2A26' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary/70 leading-relaxed" style={{ fontFamily: serifFont }}>
                    {item.desc}——<span style={{ color: '#8b7355' }}>{item.sub}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark comparison card — SBTI vs 觉TI */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: '#1C1B19' }}>
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-8"
              style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.25)' }}
            >
              SBTI → 觉TI
            </p>

            <div className="space-y-6">
              {[
                { sbti: 'SBTI 问你平时怎么做', jueti: '觉TI 问你为什么这样做' },
                { sbti: '15 维行为切面', jueti: '4 轴内在觉察' },
                { sbti: '27 种抽象人格', jueti: '16 种自然人格' },
                { sbti: '给你一个标签', jueti: '给你一面镜子' },
              ].map(row => (
                <div key={row.sbti} className="flex items-center gap-4">
                  <span className="text-sm flex-1 text-right" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    {row.sbti}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(139,115,85,0.6)' }}>→</span>
                  <span
                    className="text-sm flex-1"
                    style={{ fontFamily: serifFont, color: 'rgba(255,255,255,0.75)' }}
                  >
                    {row.jueti}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 16 Types preview */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-10"
            style={{ fontFamily: serifFont, color: 'rgba(139,115,85,0.4)' }}
          >
            16 TYPES · 自然人格
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {JUETI_PERSONALITY_TYPES.map((p, i) => (
              <div
                key={p.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  href={`/jueti/result/${p.slug}`}
                  prefetch={false}
                  className="block p-5 rounded-2xl text-center transition-all hover:shadow-md"
                  style={{
                    background: '#FDFCFA',
                    border: `1px solid ${p.color}15`,
                  }}
                >
                  <div className="text-3xl mb-3">{p.emoji}</div>
                  <div
                    className="text-base tracking-[0.08em] leading-none mb-2"
                    style={{ fontFamily: serifFont, color: p.color }}
                  >
                    {p.code}
                  </div>
                  <div className="text-sm text-text-primary" style={{ fontFamily: serifFont }}>{p.name}</div>
                  <p className="text-xs text-text-muted/60 mt-1 line-clamp-1" style={{ fontFamily: serifFont }}>
                    {p.tagline}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — minimal literary */}
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="max-w-xs mx-auto mb-8">
            <div className="border-t" style={{ borderColor: 'rgba(139,115,85,0.12)' }} />
          </div>

          <p
            className="text-base text-text-muted/60 mb-8 tracking-wider"
            style={{ fontFamily: serifFont, fontStyle: 'italic' }}
          >
            准备好向内看见了吗？
          </p>

          <Link
            href="/jueti/test"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-medium text-lg transition-all duration-300 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #8b7355, #b09a78)',
              boxShadow: '0 8px 32px rgba(139,115,85,0.25)',
            }}
          >
            开始觉察 →
          </Link>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-text-muted/40">
            <Link href="/test/" className="hover:text-text-muted transition-colors" style={{ fontFamily: serifFont }}>
              SBTI 标准版
            </Link>
            <span>·</span>
            <Link href="/xpti/" className="hover:text-text-muted transition-colors" style={{ fontFamily: serifFont }}>
              恋爱XP
            </Link>
            <span>·</span>
            <Link href="/wtfti/" className="hover:text-text-muted transition-colors" style={{ fontFamily: serifFont }}>
              WTF 毒舌版
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
