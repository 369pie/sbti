'use client';

import Link from 'next/link';

interface Props {
  variant?: 'default' | 'xpti';
}

export function UgcShareCTA({ variant = 'default' }: Props) {
  const isXpti = variant === 'xpti';
  return (
    <section className="mt-8 text-center">
      <Link
        href="/share-templates/"
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
          isXpti
            ? 'bg-[#1A0C11] border border-[#A3526E]/20 text-[#D4C5C9] hover:text-[#F3E8EB] hover:border-[#A3526E]/35'
            : 'bg-bg-elevated border border-border-subtle text-text-secondary hover:text-accent hover:border-accent/30'
        }`}
      >
        <span>📕</span>
        <span>一键复制分享文案</span>
        <span className={isXpti ? 'text-[#A38A90]' : 'text-text-muted'}>→</span>
      </Link>
    </section>
  );
}
