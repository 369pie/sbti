import type { Metadata } from 'next';
import Link from 'next/link';
import { WTFI_AXES } from '@/lib/wtfi/axes';
import { DEFAULT_THEORY_FOR_UNIVERSE } from '@/lib/wtfi/scoring';
import { CciPanel } from '@/components/CciPanel';

export const metadata: Metadata = {
  title: 'WTFTI 理论 · 你为什么"在不同场合像不同人" | WTFTI',
  description:
    'WTFTI 用 4 条情境维度 W-T-F-I（触发反应 · 情绪倾斜 · 应对弹性 · 印记锚点）解释你为什么在不同宇宙里像不同人。基于 Mischel & Shoda (1995) CAPS 框架的本土化。',
  alternates: { canonical: '/theory/' },
};

export default function TheoryPage() {
  return (
    <main className="min-h-screen bg-paper text-text-primary">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-text-muted">
            WTFTI · The Theory
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-display tracking-tight">
            你不是 16 种人格，你是 4 条情境维度。
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            MBTI 说人格是稳定的。WTFTI 说：人格是被场景"激活"的。
            你在恋爱里像 ENFP，在职场里像 INTJ——不是你装，是 4 条「情境维度」在不同宇宙被点亮的方式不同。
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4">W · T · F · I — 4 条情境维度</h2>
          <p className="mb-6 text-text-secondary">
            理论锚点：Mischel & Shoda (1995) <em>Cognitive-Affective Personality System (CAPS)</em>。
            人格不是 trait，是"<strong>if 情境 then 反应</strong>"的结构性签名。
            WTFTI 把 CAPS 的 5 个核心单元本土化为 4 条可测量的情境维度。
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {WTFI_AXES.map(a => (
              <div
                key={a.id}
                className="rounded-xl border border-border-subtle bg-bg-secondary p-5"
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: a.color }}
                  >
                    {a.id}
                  </span>
                  <div>
                    <div className="text-base font-semibold">{a.name}</div>
                    <div className="text-[11px] tracking-wide uppercase text-text-muted">
                      {a.english} · {a.capsUnit}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-text-secondary">{a.testing}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-bg-primary p-2">
                    <div className="font-semibold text-text-primary">+ {a.high.label}</div>
                    <div className="mt-0.5 text-text-muted leading-snug">
                      {a.high.description}
                    </div>
                  </div>
                  <div className="rounded-lg bg-bg-primary p-2">
                    <div className="font-semibold text-text-primary">- {a.low.label}</div>
                    <div className="mt-0.5 text-text-muted leading-snug">
                      {a.low.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4">每个宇宙激活哪几条轴？</h2>
          <p className="mb-4 text-text-secondary">
            同一套 4 轴框架下，不同宇宙有不同的"激活配置"。
            修仙宇宙看你的「触发反应 + 应对弹性」，恋爱宇宙看「情绪倾斜 + 印记锚点」——
            这就是为什么你在不同测试里"像不同人"。
          </p>
          <div className="overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary text-text-muted text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 text-left">宇宙</th>
                  <th className="px-4 py-2 text-left">激活轴</th>
                  <th className="px-4 py-2 text-left">说明</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(DEFAULT_THEORY_FOR_UNIVERSE)
                  .filter(([k]) => k !== 'default' && k !== 'classic')
                  .map(([key, cfg]) => (
                    <tr key={key} className="border-t border-border-subtle">
                      <td className="px-4 py-2 font-medium uppercase tracking-wide text-xs">
                        {key}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          {(cfg.activatedAxes ?? []).map(a => {
                            const def = WTFI_AXES.find(x => x.id === a)!;
                            return (
                              <span
                                key={a}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{
                                  background: `${def.color}20`,
                                  color: def.color,
                                }}
                              >
                                {a}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-text-secondary text-xs">
                        {cfg.axisNote}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4">CCI · 你的跨情境一致性</h2>
          <p className="mb-4 text-text-secondary">
            完成多个宇宙的测试后，WTFTI 会算出你的 CCI（Cross-Context Consistency Index）：
            把你在每个宇宙的 W/T/F/I 画像对齐，看你"在不同情境下有多稳定"。
            <strong>高 CCI = 一以贯之；低 CCI = 高度情境化（更"WTF"）。</strong>
          </p>
          <CciPanel />
        </section>

        <section className="mb-12 rounded-2xl bg-bg-secondary p-6">
          <h2 className="text-xl font-display mb-3">你想做什么？</h2>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Link
              href="/test/wtfi-preview/"
              className="rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 hover:border-gold/40 transition-colors"
            >
              <div className="font-semibold">体验 WTFI 30 题</div>
              <div className="mt-1 text-xs text-text-muted">
                4 轴正式题库内测预览
              </div>
            </Link>
            <Link
              href="/test/"
              className="rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 hover:border-gold/40 transition-colors"
            >
              <div className="font-semibold">3 分钟初见</div>
              <div className="mt-1 text-xs text-text-muted">最短入口</div>
            </Link>
            <Link
              href="/types/"
              className="rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 hover:border-gold/40 transition-colors"
            >
              <div className="font-semibold">人格图鉴馆</div>
              <div className="mt-1 text-xs text-text-muted">420 张抽象人设卡</div>
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-border-subtle pt-6 text-xs text-text-muted leading-relaxed">
          <p>
            理论锚点：Mischel, W. &amp; Shoda, Y. (1995). A cognitive-affective system theory of personality.{' '}
            <em>Psychological Review</em>, 102(2), 246–268.
          </p>
          <p className="mt-2">
            WTFTI 不是诊断工具。所有结果用于自我观察与社交娱乐，不替代专业心理评估。
          </p>
        </footer>
      </article>
    </main>
  );
}
