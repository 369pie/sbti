'use client';

/**
 * 「我和他」 funnel card (audit 2026-10-20 decision 3).
 * Every CPTI SEO page / legacy CPTI flow points here → ONE entry: /xpti/couple/
 * (先测你 → 邀请他 → 双人报告). One paywall lives there.
 */

import Link from 'next/link';

import { enqueueProductEvent } from '@/lib/analytics/product-events';

export function WoheFunnelCard({
  source,
  title = '想知道你和他到底合不合？',
  desc = '你先测，再把链接发给他。你们都测完，就能看到两个人的关系报告。',
  cta = '开始「我和他」',
}: {
  source: string;
  title?: string;
  desc?: string;
  cta?: string;
}) {
  return (
    <section className="skin-journal" style={{ background: 'transparent', padding: '0 20px', margin: '0 auto 28px', maxWidth: 672 }}>
      <Link
        href="/xpti/couple/"
        prefetch={false}
        className="s-card s-card--lined"
        style={{ display: 'block', padding: '20px 18px 18px', position: 'relative' }}
        onClick={() => enqueueProductEvent('test', 'wohe_funnel_click', { step: 'wohe_click', props: { source } })}
        data-wohe-funnel={source}
      >
        <span className="s-tape s-tape--peach" />
        <span className="s-eyebrow">我和他 · 双人</span>
        <span className="s-title" style={{ display: 'block', fontSize: 21, margin: '8px 0 6px' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 14, lineHeight: 1.7, color: 'var(--s-ink-2)', marginBottom: 14 }}>{desc}</span>
        <span className="s-btn">{cta}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--s-mute)', marginTop: 10 }}>约 5 分钟 · 免费测 · 双人报告可单买，会员免费</span>
      </Link>
    </section>
  );
}
