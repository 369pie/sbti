'use client';

/**
 * Sprint 4 客户端收藏按钮（书 / AI 卡）。
 * 仅写本地 localStorage，永远不联网。
 */

import { useSyncExternalStore, type CSSProperties } from 'react';
import { isSaved, toggleSaved, type HermosaSavedScope } from '@/lib/hermosa/contributions-storage';

interface Props {
  id: string;
  scope: HermosaSavedScope;
  size?: 'sm' | 'md';
}

const emptySubscribe = () => () => {};

export function HermosaBookmarkButton({ id, scope, size = 'sm' }: Props) {
  // SSR-safe hydration: false on server, true after first client render.
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const saved = hydrated && isSaved(scope, id);

  const onToggle = () => {
    toggleSaved(scope, id);
    // Force re-read by re-rendering via parent key, or rely on next nav.
    // Cheap local re-render: dispatch a custom event others can subscribe to.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hermosa:saved-change'));
    }
  };

  // Subscribe to storage changes so multiple buttons stay in sync.
  useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('hermosa:saved-change', cb);
      window.addEventListener('storage', cb);
      return () => {
        window.removeEventListener('hermosa:saved-change', cb);
        window.removeEventListener('storage', cb);
      };
    },
    () => (typeof window === 'undefined' ? '' : `${scope}:${id}:${isSaved(scope, id) ? '1' : '0'}`),
    () => '',
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      style={{
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'md' ? '8px 18px' : '6px 14px',
        borderRadius: 0,
        fontSize: size === 'md' ? 11 : 10,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        background: saved ? '#C0512F' : 'transparent',
        color: saved ? '#F5F0E8' : '#1A1530',
        border: `1px solid ${saved ? '#C0512F' : 'rgba(26, 21, 48, 0.14)'}`,
        opacity: hydrated ? 1 : 0.6,
      }}
    >
      {saved ? '✦ SAVED' : '+ SAVE'}
    </button>
  );
}
