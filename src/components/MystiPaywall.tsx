'use client';

/**
 * MystiPaywall — thin wrapper around <PremiumPaywall> that injects the
 * mysti v2 dynamic theme. Existing call sites keep working unchanged.
 */

import { useMystiTheme } from '@/components/MystiThemeProvider';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import type { MystiSku } from '@/lib/mysti/unlock';
import type { PaywallTheme } from '@/lib/payments/brand-themes';

interface Props {
  sku: MystiSku;
  resourceId: string;
  lockedTitle: string;
  preview: React.ReactNode;
  children: React.ReactNode;
}

export function MystiPaywall({ sku, resourceId, lockedTitle, preview, children }: Props) {
  const { theme } = useMystiTheme();

  const paywallTheme: PaywallTheme = {
    bg: theme.bg,
    bgGradientEnd: theme.bgGradient[1],
    text: theme.text,
    textMuted: theme.textMuted,
    textSubtle: theme.textSubtle,
    accent: theme.accent,
    accentSoft: theme.accentSoft,
    accentGold: theme.accentGold,
    cardSurface: theme.cardSurface,
    cardBorder: theme.cardBorder,
    cardGlow: theme.cardGlow,
    ctaGradientFrom: theme.ctaGradientFrom,
    ctaGradientTo: theme.ctaGradientTo,
  };

  return (
    <PremiumPaywall
      sku={sku}
      resourceId={resourceId}
      brand="mysti"
      lockedTitle={lockedTitle}
      preview={preview}
      theme={paywallTheme}
    >
      {children}
    </PremiumPaywall>
  );
}
