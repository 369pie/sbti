import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '宝宝起名 · Mysti 灵鉴',
  description: '结合八字喜忌、音韵笔画、典故诗词，为宝宝起一个耐看的名字。WTFTI 女性友好的轻玄学工具。',
};

export default function NamingPage() {
  return (
    <main className="min-h-screen px-6 py-24 sm:py-32">
      <div className="max-w-2xl mx-auto text-center">
        <span className="serial-number text-xs">MYSTI · NAMING</span>
        <h1 className="editorial-display text-4xl sm:text-5xl mt-4 mb-6">
          宝宝起名
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-10">
          结合八字喜忌、音韵笔画、典故诗词，为宝宝起一个耐看的名字。
          <br />
          <span className="text-text-muted">—— 女性友好的轻玄学工具，即将上线。</span>
        </p>
        <Link href="/" className="btn btn-ink">
          回到首页
        </Link>
      </div>
    </main>
  );
}
