'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadCard, getLitCount, getTotalCount } from '@/lib/wtf-card';

/**
 * Inline CTA shown on result pages to guide users to their WTF Card.
 * Reads localStorage to show personalized progress.
 */
export function WtfCardCTA() {
  const [lit, setLit] = useState<number | null>(null);
  const total = getTotalCount();

  useEffect(() => {
    const card = loadCard();
    if (card) setLit(getLitCount(card));
  }, []);

  return (
    <section className="max-w-2xl mx-auto px-6 pb-8">
      <Link
        href="/card/"
        className="group block rounded-2xl border border-border-subtle hover:border-accent/30 bg-bg-secondary/40 hover:bg-accent-dim transition-all p-5 text-center"
      >
        <span className="text-2xl">🃏</span>
        <p className="text-sm font-semibold text-text-primary mt-2">查看我的 WTF Card</p>
        {lit != null && lit > 0 ? (
          <p className="text-xs text-text-muted mt-1">
            已点亮 {lit} / {total} 个宇宙 · {lit < total ? '继续收集' : '🎉 全部点亮'}
          </p>
        ) : (
          <p className="text-xs text-text-muted mt-1">
            集齐所有宇宙测试，解锁你的多面人格卡
          </p>
        )}
      </Link>
    </section>
  );
}
