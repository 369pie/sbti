'use client';

import { useWtftiTheme } from './WtftiThemeProvider';

type Props = {
  className?: string;
  /** 'fixed' (默认) 右下角悬浮；'inline' 跟随父容器 */
  position?: 'fixed' | 'inline';
};

/**
 * SUMMER BLUSH ↔ LUMINA RITUAL · 主题切换
 * 视觉哲学：huashu-design「一个细节做到 120%」—— 博物馆标签风极小胶囊：
 *  · 不抢戏（小尺寸 + 半透明 elevated 底 + monospace 标签）
 *  · 唯一 accent 是当前主题的 rose dot
 *  · 颜色完全走 token，自动随主题翻转 / 跟正文同温
 */
export function WtftiThemeToggle({ className = '', position = 'fixed' }: Props) {
  const { theme, toggle } = useWtftiTheme();
  const isDark = theme === 'dark';

  const positionCls =
    position === 'fixed'
      ? 'fixed bottom-4 right-4 z-40 md:bottom-5 md:right-5'
      : '';

  const label = isDark ? 'LUMINA' : 'BLUSH';
  const modeHint = isDark ? 'Light' : 'Dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? '切换到 Summer Blush 浅色主题' : '切换到 LUMINA 暗色主题'}
      title={isDark ? 'LUMINA · 切到 Summer Blush' : 'Summer Blush · 切到 LUMINA'}
      className={`${positionCls} ${className} group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] transition-[transform,background-color,border-color,color,box-shadow] duration-300 active:scale-[0.98]`}
      style={{
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        color: 'var(--color-text-secondary)',
        background:
          'color-mix(in oklab, var(--color-bg-elevated) 88%, transparent)',
        backdropFilter: 'blur(10px) saturate(1.05)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.05)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow:
          '0 1px 0 color-mix(in oklab, var(--color-accent) 12%, transparent), 0 8px 24px -12px color-mix(in oklab, var(--color-text-primary) 30%, transparent)',
      }}
    >
      <span
        aria-hidden
        className="relative inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background: 'var(--color-accent)',
          boxShadow:
            '0 0 8px color-mix(in oklab, var(--color-accent) 60%, transparent)',
        }}
      />
      <span className="font-medium">{label}</span>
      <span aria-hidden className="ml-0.5 hidden opacity-50 sm:inline">
        {modeHint}
      </span>
    </button>
  );
}
