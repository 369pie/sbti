import Link from 'next/link';
import NextImage from 'next/image';
import { DAILY_MODEL_NAMES, DAILY_MODEL_COLORS } from '@/lib/daily/dimensions';
import type { DailyModelType } from '@/lib/daily/dimensions';
import { DAILY_STATUS_TYPES, getDailyTypeThumbnailImage } from '@/lib/daily/statuses';
import { DailyTodayCTA } from '@/components/DailyTodayCTA';
import DailyMoonPhasePanel from '@/components/DailyMoonPhasePanel';

const MODELS: { key: DailyModelType; label: string }[] = [
  { key: 'energy', label: '你今天有多少电' },
  { key: 'mood', label: '今天情绪温度如何' },
  { key: 'social', label: '想不想跟人说话' },
  { key: 'focus', label: '大脑今天转不转得动' },
  { key: 'stress', label: '肩上的包袱有多重' },
];

export default function DailyHomeContent() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-2 uppercase">
              Daily Status Check · 每天题目不同
            </span>
            <div className="text-sm font-mono text-teal-400 tracking-wider mb-6">
              {dateStr}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              今天的你
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">开了什么模式</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              5 个维度 · 6 道快问 · 12 张状态卡
              <br />
              一分钟测出你今天开了什么模式。每天题目不一样。
            </p>

            <DailyTodayCTA />
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden animate-fade-up-delay-1">
            {[
              { value: '5 维', label: '状态维度' },
              { value: '12 张', label: '状态卡' },
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

      {/* Moon phase + streak (E-11) */}
      <DailyMoonPhasePanel />

      {/* 5 Dimensions */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="animate-fade-up">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase text-center mb-8">
            五大状态维度
          </h2>

          <div className="grid gap-3">
            {MODELS.map((m, i) => {
              const c = DAILY_MODEL_COLORS[m.key];
              return (
                <div
                  key={m.key}
                  className="animate-fade-up flex items-center gap-4 px-5 py-4 rounded-xl border border-border-subtle bg-bg-elevated shadow-sm"
                  style={{ animationDelay: `${(i + 1) * 80}ms` }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: c.base }}
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-text-primary">
                      {DAILY_MODEL_NAMES[m.key]}
                    </span>
                    <span className="text-text-muted text-sm ml-2">{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Status types preview */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="animate-fade-up-delay-1">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase text-center mb-8">
            12 张今日模式卡
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DAILY_STATUS_TYPES.map((s, i) => (
              <div
                key={s.slug}
                className="animate-fade-up flex flex-col items-center gap-3 p-5 rounded-xl border border-border-subtle bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden"
                  style={{ background: `${s.color}15` }}
                >
                  <NextImage
                    src={getDailyTypeThumbnailImage(s.slug)}
                    alt={s.name}
                    fill
                    sizes="(min-width: 768px) 96px, 80px"
                    className="object-contain p-1"
                  />
                </div>
                <span className="text-sm font-medium text-text-primary">{s.name}</span>
                <span className="text-xs text-text-muted text-center leading-snug">{s.tagline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
