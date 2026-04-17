import Link from 'next/link';
import NextImage from 'next/image';
import { DRUNK_MODEL_NAMES, DRUNK_MODEL_COLORS } from '@/lib/drunk/dimensions';
import type { DrunkModelType } from '@/lib/drunk/dimensions';
import { DRUNK_PERSONA_TYPES, getDrunkTypeThumbnailImage } from '@/lib/drunk/personas';

const MODELS: { key: DrunkModelType; label: string }[] = [
  { key: 'talk', label: '喝完酒你的嘴巴有多停不下来' },
  { key: 'feels', label: '酒后你的情绪有多猛' },
  { key: 'chaos', label: '你喝了酒能有多敢' },
  { key: 'memory', label: '第二天你还记得多少' },
  { key: 'thirst', label: '你有多想继续喝下去' },
];

export default function DrunkHomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Drunk Persona · 酒后人设鉴定
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              喝醉了的你
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">是什么人设</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              5 个醉态维度 · 6 道灵魂拷问 · 12 张酒后人设卡
              <br />
              一分钟测出你喝醉后会变成什么样的人。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/drunk/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-bg-elevated font-medium text-base hover:bg-gold-leaf transition-all duration-200"
              >
                测一测你的酒后人设
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
              >
                ← 返回首页
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden animate-fade-up-delay-1">
            {[
              { value: '5 维', label: '醉态维度' },
              { value: '12 张', label: '酒后人设卡' },
              { value: '6 题', label: '约1分钟' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Dimensions */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="animate-fade-up">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase text-center mb-8">
            五大醉态维度
          </h2>

          <div className="grid gap-3">
            {MODELS.map(m => {
              const color = DRUNK_MODEL_COLORS[m.key];
              return (
                <div
                  key={m.key}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border border-border-subtle bg-bg-secondary/30"
                >
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-semibold"
                    style={{ background: color.bg, color: color.base }}
                  >
                    {m.key.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{DRUNK_MODEL_NAMES[m.key]}</div>
                    <div className="text-xs text-text-muted">{m.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12 Personas Preview */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="animate-fade-up-delay-1">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase text-center mb-8">
            12 种酒后人设
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DRUNK_PERSONA_TYPES.map(p => (
              <Link
                key={p.slug}
                href={`/drunk/result/${p.slug}`}
                prefetch={false}
                className="group rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4 text-center"
              >
                <div
                  className="relative w-16 h-16 rounded-lg overflow-hidden mx-auto mb-2"
                  style={{ background: `${p.color}15` }}
                >
                  <NextImage
                    src={getDrunkTypeThumbnailImage(p.slug)}
                    alt={p.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
                <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                  {p.code}
                </span>
                <span className="text-sm font-medium text-text-primary group-hover:text-text-primary">
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
