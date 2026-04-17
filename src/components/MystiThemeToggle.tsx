'use client';

import { useMystiTheme } from '@/components/MystiThemeProvider';
import { MYSTI_THEMES_V2 } from '@/lib/mysti/themes-v2';

const ICONS: Record<string, string> = {
  twilight: '🌆',
  nocturne: '🌙',
  aurora: '☀️',
};

/**
 * 浮动主题切换器 — 固定在右下角，适配 mysti 全部页面
 * 暮光 → 深夜 → 晨光 三态轮播
 */
export function MystiThemeToggle({ className = '' }: { className?: string }) {
  const { themeId, theme, cycleTheme } = useMystiTheme();
  const meta = MYSTI_THEMES_V2[themeId];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`切换主题 — 当前：${meta.label}`}
      title={`${meta.label} · ${meta.description}`}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 ${className}`}
      style={{
        background: theme.isDark
          ? 'rgba(37, 26, 58, 0.85)'
          : 'rgba(255, 253, 249, 0.92)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.cardBorderStrong,
        color: theme.text,
        boxShadow: `0 8px 28px ${theme.cardGlow}, 0 0 0 1px ${theme.cardBorder}`,
      }}
    >
      <span aria-hidden="true">{ICONS[themeId] ?? '✦'}</span>
      <span>{meta.label}</span>
    </button>
  );
}
