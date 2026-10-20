import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '她财富',
  description: '她财富不是理财课，而是「用女生听得懂的语言，建立投资意识」。AI 量化交易引擎提供市场情绪信号，但决策权在你。',
};

export default function HerWealthPage() {
  return (
    <main className="min-h-screen px-6 py-24 sm:py-32">
      <div className="max-w-2xl mx-auto text-center">
        <span className="serial-number text-xs">HER · WEALTH</span>
        <h1 className="editorial-display text-4xl sm:text-5xl mt-4 mb-6">
          她财富
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-10">
          不是理财课，而是「用女生听得懂的语言，建立投资意识」。
          <br />
          AI 量化交易引擎提供市场情绪信号，但决策权始终在你。
          <br />
          <span className="text-text-muted">—— 内容 IP 与轻工具，即将上线。</span>
        </p>
        <Link href="/" className="btn btn-ink">
          回到首页
        </Link>
      </div>
    </main>
  );
}
