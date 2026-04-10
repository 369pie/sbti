import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CP 配对测试 — SBTI',
  description: '测测你和好友的 SBTI 人格契合度！',
};

export default function CPLandingPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="text-5xl mb-6">💕</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          <span className="gradient-text">CP 配对</span>测试
        </h1>
        <p className="text-text-secondary text-base mb-4 max-w-md mx-auto leading-relaxed">
          先完成 SBTI 人格测试，获取结果后即可邀请好友来测 CP 契合度。
        </p>
        <p className="text-text-muted text-sm mb-10 max-w-md mx-auto">
          27 种人格 × 27 种人格 = 729 种可能的配对组合，每一对都有独特的化学反应。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/test"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accent text-bg-primary font-medium text-base hover:bg-accent-light transition-all"
          >
            先去测试
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-5">
            <div className="text-2xl mb-3">①</div>
            <h3 className="text-sm font-medium mb-1">你先测</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              完成 31 道题的 SBTI 人格测试，得到你的人格类型。
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-5">
            <div className="text-2xl mb-3">②</div>
            <h3 className="text-sm font-medium mb-1">发链接</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              在结果页点击「邀请好友测 CP」，复制专属邀请链接发给 TA。
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-5">
            <div className="text-2xl mb-3">③</div>
            <h3 className="text-sm font-medium mb-1">看结果</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              TA 测完后，自动跳转到 CP 配对结果页，查看 15 维契合度分析。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
