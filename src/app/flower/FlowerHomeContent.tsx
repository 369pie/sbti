import Link from 'next/link';
import { FLOWER_MODEL_NAMES, FLOWER_MODEL_COLORS } from '@/lib/flower/dimensions';
import type { FlowerModelType } from '@/lib/flower/dimensions';
import { FLOWER_PERSONALITY_TYPES } from '@/lib/flower/personalities';

const AXES: { key: FlowerModelType; poleA: string; poleB: string; question: string }[] = [
  { key: 'photosynthesis', poleA: '向光', poleB: '趋暗', question: '你的能量从人群中来还是独处中来' },
  { key: 'bloom', poleA: '盛放', poleB: '蓄蕾', question: '你的情绪写在脸上还是藏在心底' },
  { key: 'root', poleA: '主根', poleB: '须根', question: '你的关系是深深扎根还是四处蔓延' },
  { key: 'armor', poleA: '带刺', poleB: '无刺', question: '你保护自己是竖起刺还是敞开怀' },
];

export default function FlowerHomeContent() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFAF5 0%, #FFF5F0 40%, #FFFAF5 100%)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-24 text-center relative">
          <div className="animate-fade-up">
            {/* Pro badge */}
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs tracking-[0.15em] mb-10"
              style={{
                color: '#e11d48',
                background: 'rgba(225,29,72,0.06)',
                border: '1px solid rgba(225,29,72,0.12)',
              }}
            >
              ✿ 花格鉴定
            </span>

            <p className="text-base text-text-muted/70 mb-6 tracking-wider">
              每个人心里都住着一朵花
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight leading-[1.4] mb-5">
              你像自然界的
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                哪朵花？
              </span>
            </h1>

            <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto mb-3">
              用植物学的方式解读你的性格，
              <br />
              找到属于你的那朵花。
            </p>

            <p className="text-sm text-text-muted/50 mb-12">
              4 大花格轴 · 20 道灵魂拷问 · 16 种花格
            </p>

            <Link
              href="/flower/test"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-medium text-base transition-all duration-300 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                boxShadow: '0 8px 32px rgba(236,72,153,0.25)',
              }}
            >
              开始测试 →
            </Link>

            <p className="mt-5 text-xs text-text-muted/50 tracking-wider">
              预计用时 3 分钟 · 测出你的专属花格
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 flex items-center justify-center gap-8 sm:gap-14 animate-fade-up-delay-1">
            {[
              { value: '4', label: '花格轴', color: '#f59e0b' },
              { value: '16', label: '种花格', color: '#ec4899' },
              { value: '3', label: '分钟', color: '#e11d48' },
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

      {/* What is flower test — promo section */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{ background: 'linear-gradient(135deg, #2D2820, #3D2F28)' }}
          >
            <p className="text-[10px] tracking-[0.35em] uppercase mb-8" style={{ color: 'rgba(245,158,11,0.5)' }}>
              FLOWER PERSONALITY
            </p>

            <p className="text-lg leading-[2] mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
              植物的生存策略和人的性格，
              <br />
              本质上是同一套逻辑。
            </p>

            <div className="space-y-4">
              {[
                { left: '向光 or 趋暗', right: '你从哪获得能量' },
                { left: '盛放 or 蓄蕾', right: '你怎么表达情绪' },
                { left: '主根 or 须根', right: '你要深度还是广度' },
                { left: '带刺 or 无刺', right: '你怎么保护自己' },
              ].map(row => (
                <div key={row.left} className="flex items-center gap-4 text-sm">
                  <span className="flex-1 text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {row.left}
                  </span>
                  <span style={{ color: 'rgba(245,158,11,0.5)' }}>→</span>
                  <span className="flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {row.right}
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
              FOUR AXES · 四大花格轴
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              花的四种生存智慧
            </h2>
          </div>

          <div className="grid gap-4">
            {AXES.map((ax, i) => {
              const color = FLOWER_MODEL_COLORS[ax.key];
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
                        {FLOWER_MODEL_NAMES[ax.key]}
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

      {/* 16 Flower Types */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-[10px] tracking-[0.35em] text-text-muted/40 uppercase block mb-3">
              SIXTEEN FLOWERS · 十六朵花
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              你是哪一朵？
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FLOWER_PERSONALITY_TYPES.map((p, i) => (
              <Link
                key={p.slug}
                href={`/flower/result/${p.slug}`}
                className="animate-fade-up group rounded-2xl p-4 transition-all hover:shadow-md text-center"
                style={{
                  animationDelay: `${i * 40}ms`,
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div className="text-3xl mb-2">{p.emoji}</div>
                <span
                  className="text-[10px] font-mono tracking-[0.2em] block mb-1"
                  style={{ color: p.color }}
                >
                  {p.code}
                </span>
                <div className="text-sm font-semibold text-text-primary mb-0.5">{p.flower}</div>
                <div className="text-xs text-text-muted">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <Link
          href="/flower/test"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-medium text-base transition-all duration-300 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            boxShadow: '0 8px 32px rgba(236,72,153,0.25)',
          }}
        >
          测测你像哪朵花 →
        </Link>
      </section>

      {/* Footer links */}
      <section className="pb-24 px-6 text-center">
        <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
          <Link href="/" className="hover:text-text-secondary transition-colors">WTFTI</Link>
          <Link href="/xpti/" className="hover:text-text-secondary transition-colors">XPTI</Link>
          <Link href="/soulti/" className="hover:text-text-secondary transition-colors">SoulTI</Link>
          <Link href="/wtfti/" className="hover:text-text-secondary transition-colors">WTF毒舌版</Link>
        </div>
      </section>
    </div>
  );
}
