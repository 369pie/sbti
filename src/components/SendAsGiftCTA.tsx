'use client';

import Link from 'next/link';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { trackMystiEvent } from '@/lib/mysti/analytics';

interface Props {
  /** Optional context to attach to analytics */
  source?: string;
  /** Pre-select a giftSku option on the gift page */
  giftSku?: 'soul-letter' | 'dual-report' | 'monthly-report' | 'share-atelier';
  /** Override copy */
  label?: string;
  description?: string;
}

/**
 * Compact "send as gift" CTA shown on result pages.
 * Routes to /mysti/gift/ with a pre-selected gift bundle hint.
 */
export function SendAsGiftCTA({
  source = 'result',
  giftSku,
  label = '把这份灵魂内容当礼物送 TA',
  description = '附自定义贺卡 · 微信 / 支付宝 · 朋友圈不撞款',
}: Props) {
  const { theme } = useMystiTheme();
  const href = giftSku
    ? `/mysti/gift/?preset=${encodeURIComponent(giftSku)}&from=${encodeURIComponent(source)}`
    : `/mysti/gift/?from=${encodeURIComponent(source)}`;

  return (
    <Link
      href={href}
      onClick={() => {
        try {
          trackMystiEvent('mysti_gift_cta_click', { source, giftSku });
        } catch {
          /* noop */
        }
      }}
      className="block rounded-2xl px-5 py-4 transition-all hover:scale-[1.01]"
      style={{
        background: `linear-gradient(135deg, ${theme.cardSurface} 0%, ${theme.accentSoft} 100%)`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.accentGold,
        color: theme.text,
        boxShadow: `0 8px 24px ${theme.cardGlow}`,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎁</span>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {label}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: theme.textMuted }}
          >
            {description}
          </p>
        </div>
        <span style={{ color: theme.accent }}>→</span>
      </div>
    </Link>
  );
}
