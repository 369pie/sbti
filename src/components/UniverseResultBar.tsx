'use client';

import Link from 'next/link';
import { getLiveUniverses } from '@/lib/universes';

interface UniverseResultBarProps {
  /** Personality slug (e.g. 'boss') — used to build links to the same type in other universes */
  slug: string;
  /** The id of the current universe being viewed */
  current: string;
}

/**
 * Floating bar shown on result pages encouraging users to explore their
 * personality in other universes.
 */
export function UniverseResultBar({ slug, current }: UniverseResultBarProps) {
  const others = getLiveUniverses().filter(u => u.id !== current);

  if (others.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated/80 backdrop-blur-sm p-4 sm:p-5">
      <p className="text-sm text-text-secondary mb-3">
        <span className="mr-1.5">🌌</span>
        看看你在其他宇宙长什么样：
      </p>
      <div className="flex flex-wrap gap-2">
        {others.map(u => (
          <Link
            key={u.id}
            href={`${u.resultPrefix}/result/${slug}/${u.id === 'xiuxian' ? '?skin=xiuxian' : ''}`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
            style={{
              color: u.accent,
              background: `${u.accent}10`,
              border: `1px solid ${u.accent}20`,
            }}
          >
            {u.emoji && <span>{u.emoji}</span>}
            {u.shortName}版
          </Link>
        ))}
      </div>
    </div>
  );
}
