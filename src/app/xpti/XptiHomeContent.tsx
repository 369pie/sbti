import Link from 'next/link';
import NextImage from 'next/image';
import { XPTI_MODEL_NAMES, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import type { XptiModelType } from '@/lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiTypeThumbnailImage } from '@/lib/xpti/personalities';

const AXES: { key: XptiModelType; poleA: string; poleB: string; question: string }[] = [
  { key: 'power', poleA: '女王', poleB: '配合', question: '你在关系里主导还是被安排' },
  { key: 'sense', poleA: '氛围', poleB: '直觉', question: '你的心动靠仪式感还是电光火石' },
  { key: 'focus', poleA: '纯爱', poleB: '反转', question: '你在感情里专一还是享受不确定' },
  { key: 'imagine', poleA: '脑补', poleB: '务实', question: '你的理想型活在脑子里还是Excel里' },
];

export default function XptiHomeContent() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #fdf2f8 40%, #faf5ff 100%)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-24 text-center relative">
          <div className="animate-fade-up">
            {/* Pro badge */}
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs tracking-[0.15em] mb-10"
              style={{
                color: '#a855f7',
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              ✦ 全新恋爱测试
            </span>

            <p className="text-base text-text-muted/70 mb-6 tracking-wider">
              你知道吗？
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight leading-[1.4] mb-5">
              <span className="line-through decoration-1 opacity-40">SBTI</span>{' '}
              一夜之间就 out 了
              <br />
              现在登场的是
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                恋爱XP体质测试——XPTI
              </span>
            </h1>

            <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto mb-3">
              MBTI 测你是什么人，
              <br />
              XPTI 测你爱上什么人。
            </p>

            <p className="text-sm text-text-muted/50 mb-12">
              4 大恋爱轴 · 随机 20 题 · 16 种XP体质
            </p>

            <Link
              href="/xpti/test"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-medium text-base transition-all duration-300 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                boxShadow: '0 8px 32px rgba(168,85,247,0.30)',
              }}
            >
              开始测试 →
            </Link>

            <p className="mt-5 text-xs text-text-muted/50 tracking-wider">
              预计用时 3 分钟 · 大题池随机抽题，重测会换题
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 flex items-center justify-center gap-8 sm:gap-14 animate-fade-up-delay-1">
            {[
              { value: '4', label: '恋爱轴', color: '#ec4899' },
              { value: '16', label: 'XP体质', color: '#a855f7' },
              { value: '3', label: '分钟', color: '#c084fc' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-semibold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] tracking-[0.15em] text-text-muted/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is XPTI — promo section */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{ background: 'linear-gradient(135deg, #1e1b2e, #2d1f3d)' }}
          >
            <p className="text-[10px] tracking-[0.35em] uppercase mb-8" style={{ color: 'rgba(168,85,247,0.5)' }}>
              SBTI → XPTI
            </p>

            <p className="text-lg leading-[2] mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
              SBTI 告诉你「你是哪种怪」，
              <br />
              XPTI 告诉你「你会爱上哪种怪」。
            </p>

            <div className="space-y-4">
              {[
                { sbti: '15 维行为模式', xpti: '4 轴恋爱体质' },
                { sbti: '抽象人格标签', xpti: 'XP体质DNA' },
                { sbti: '你平时怎么活', xpti: '你在爱里怎么疯' },
              ].map(row => (
                <div key={row.sbti} className="flex items-center gap-4 text-sm">
                  <span className="flex-1 text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {row.sbti}
                  </span>
                  <span style={{ color: 'rgba(236,72,153,0.5)' }}>→</span>
                  <span className="flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {row.xpti}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Axes */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-[10px] tracking-[0.35em] text-text-muted/40 uppercase block mb-3">
              FOUR AXES · 四大恋爱轴
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              爱情的四个维度
            </h2>
          </div>

          <div className="grid gap-4">
            {AXES.map((ax, i) => {
              const color = XPTI_MODEL_COLORS[ax.key];
              return (
                <div
                  key={ax.key}
                  className="animate-fade-up rounded-2xl p-6 transition-shadow hover:shadow-md"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    background: 'rgba(255,255,255,0.7)',
                    border: `1px solid ${color.base}18`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold flex-shrink-0"
                      style={{ background: color.bg, color: color.base }}
                    >
                      {ax.key[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium mb-1" style={{ color: color.base }}>
                        {XPTI_MODEL_NAMES[ax.key]}
                      </div>
                      <p className="text-sm text-text-secondary/80 leading-relaxed mb-3">
                        {ax.question}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span
                          className="px-3 py-1 rounded-full"
                          style={{ background: `${color.base}10`, color: color.base }}
                        >
                          {ax.poleA}
                        </span>
                        <span className="flex-1 border-t" style={{ borderColor: `${color.base}15` }} />
                        <span
                          className="px-3 py-1 rounded-full"
                          style={{ background: `${color.base}10`, color: color.base }}
                        >
                          {ax.poleB}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 16 XP Types */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-[10px] tracking-[0.35em] text-text-muted/40 uppercase block mb-3">
              16 TYPES · XP体质
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">16 种恋爱XP体质</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {XPTI_PERSONALITY_TYPES.map((p, i) => (
              <div
                key={p.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  href={`/xpti/result/${p.slug}`}
                  prefetch={false}
                  className="block p-4 rounded-2xl text-center transition-all hover:shadow-md"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: `1px solid ${p.color}18`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 rounded-2xl overflow-hidden"
                    style={{ background: `${p.color}10` }}
                  >
                    <NextImage
                      src={getXptiTypeThumbnailImage(p.slug)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="text-lg font-mono tracking-[0.06em] leading-none mb-1.5" style={{ color: p.color }}>
                    {p.code}
                  </div>
                  <div className="text-sm font-medium text-text-primary">{p.name}</div>
                  <p className="text-xs text-text-muted/60 mt-1 line-clamp-1">{p.tagline}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-text-muted/60 text-sm mb-8">
            准备好测出你的恋爱DNA了吗？
          </p>
          <Link
            href="/xpti/test"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-medium text-lg transition-all duration-300 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #a855f7)',
              boxShadow: '0 8px 32px rgba(168,85,247,0.25)',
            }}
          >
            测测你的XP体质 →
          </Link>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-text-muted/40">
            <Link href="/test/" className="hover:text-text-muted transition-colors">
              SBTI 标准版
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
