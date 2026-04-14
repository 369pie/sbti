'use client';

import Link from 'next/link';
import { getLiveUniverses, getUniverseButtonClass } from '@/lib/universes';
import type { Universe } from '@/lib/universes';

interface UniversePickerProps {
  /** The id of the currently-active universe */
  current: string;
  /**
   * Optional callback for universes that should switch in-page (no navigation).
   * Return `true` to prevent the default Link navigation.
   */
  onSelect?: (universe: Universe) => boolean;
}

/**
 * Horizontal scrollable pill bar for switching between test universes.
 * Renders from the central UNIVERSES registry so new entries appear automatically.
 */
export function UniversePicker({ current, onSelect }: UniversePickerProps) {
  const universes = getLiveUniverses();

  return (
    <div className="inline-flex items-center rounded-full bg-bg-secondary/80 border border-border-subtle p-0.5 text-xs overflow-x-auto max-w-full scrollbar-hide">
      {universes.map((u) => {
        const isActive = u.id === current;
        const label = u.emoji ? `${u.emoji} ${u.shortName}` : u.shortName;

        return (
          <Link
            key={u.id}
            href={u.landingPath}
            prefetch={false}
            onClick={(e) => {
              if (onSelect?.(u)) {
                e.preventDefault();
              }
            }}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${getUniverseButtonClass(u, isActive)}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
