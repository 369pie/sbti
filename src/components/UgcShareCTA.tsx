'use client';

import Link from 'next/link';

export function UgcShareCTA() {
  return (
    <section className="mt-8 text-center">
      <Link
        href="/share-templates/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-elevated border border-border-subtle text-sm font-medium text-text-secondary hover:text-accent hover:border-accent/30 transition-all"
      >
        <span>📕</span>
        <span>一键复制分享文案</span>
        <span className="text-text-muted">→</span>
      </Link>
    </section>
  );
}
