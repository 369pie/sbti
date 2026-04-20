'use client';

/**
 * View-mode pill switcher (W3+W4) — sits above the card grid.
 *
 * Pure presentation; mode state lives in `TypesContent`. Uses no animation
 * libraries, just CSS transitions.
 */

import { useCallback } from 'react';
import { VIEW_MODE_LABEL, VIEW_MODE_ORDER, type ViewMode } from '@/lib/museum/view-mode';

interface ViewModeSwitchProps {
  active: ViewMode;
  onChange: (mode: ViewMode) => void;
  accent: string;
  /** Hide certain modes if data isn't ready (e.g. constellation needs >0 unlocks). */
  enabled?: Partial<Record<ViewMode, boolean>>;
}

export default function ViewModeSwitch({ active, onChange, accent, enabled }: ViewModeSwitchProps) {
  const handle = useCallback((m: ViewMode) => () => onChange(m), [onChange]);

  return (
    <div
      className="flex gap-1 overflow-x-auto scrollbar-hide pb-1"
      role="tablist"
      aria-label="切换浏览模式"
    >
      {VIEW_MODE_ORDER.map((mode) => {
        const meta = VIEW_MODE_LABEL[mode];
        const isActive = active === mode;
        const isEnabled = enabled?.[mode] !== false;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={!isEnabled}
            onClick={handle(mode)}
            title={meta.hint}
            className="text-[11px] sm:text-xs font-mono tracking-[0.08em] px-2.5 sm:px-3 py-1.5 rounded-full border whitespace-nowrap transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={
              isActive
                ? { background: accent, color: '#fff', borderColor: accent }
                : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-subtle)' }
            }
          >
            <span className="mr-1">{meta.emoji}</span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
