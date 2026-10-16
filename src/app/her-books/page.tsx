import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '她读书 · WTFTI',
  description: '每周一本与女性成长、财富、心理相关的书摘。WTFTI 她成长内容 IP。',
};

export default function HerBooksPage() {
  return (
    <main className="min-h-screen px-6 py-24 sm:py-32">
      <div className="max-w-2xl mx-auto text-center">
        <span className="serial-number text-xs">HER · BOOKS</span>
        <h1 className="editorial-display text-4xl sm:text-5xl mt-4 mb-6">
          她读书
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-10">
          每周一本与女性成长、财富、心理相关的书摘。
          <br />
          <span className="text-text-muted">—— 她成长内容 IP，即将上线。</span>
        </p>
        <Link href="/" className="btn btn-ink">
          回到首页
        </Link>
      </div>
    </main>
  );
}
