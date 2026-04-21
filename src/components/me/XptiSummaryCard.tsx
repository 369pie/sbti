'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadXptiResult, loadXptiHistory } from '@/lib/xpti/storage';
import { getXptiPersonalityBySlug } from '@/lib/xpti/personalities';

interface XptiSummaryRemote {
  coupleCount?: number;
  unlockCount?: number;
}

export function XptiSummaryCard({ remote }: { remote?: XptiSummaryRemote }) {
  const [hydrated, setHydrated] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const last = loadXptiResult();
    setSlug(last?.slug ?? null);
    setHistoryCount(loadXptiHistory().length);
    setHydrated(true);
  }, []);

  const personality = useMemo(
    () => (slug ? getXptiPersonalityBySlug(slug) : null),
    [slug],
  );

  const coupleCount = remote?.coupleCount ?? 0;
  const unlockCount = remote?.unlockCount ?? 0;

  const title = personality?.name ?? (hydrated && !slug ? '尚未测试' : '加载中…');
  const href = personality
    ? `/xpti/result/${personality.slug}/`
    : slug
      ? `/xpti/result/${slug}/`
      : '/xpti/';

  return (
    <Link
      href={href}
      className="col-span-2 rounded-2xl border border-border-subtle bg-bg-elevated p-5 hover:border-accent/40 transition-all block"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="text-[10px] font-mono tracking-[0.28em] text-text-muted uppercase">
          XPTI · 我的亲密张力
        </div>
        <div className="text-[10px] font-mono tracking-widest text-text-muted">
          合并 {coupleCount} · 解锁 {unlockCount}
        </div>
      </div>
      <div className="mt-2 font-serif italic text-xl text-text-primary">
        {title}
      </div>
      <div className="mt-1 text-xs text-text-muted">
        {historyCount > 0
          ? `历史 ${historyCount} 次 · 30 天后可在合并报告里重测对比`
          : '完成一次 12 题测试，再邀请 ta 生成关系合并报告'}
      </div>
    </Link>
  );
}
