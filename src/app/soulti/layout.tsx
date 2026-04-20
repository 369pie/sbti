import type { ReactNode } from 'react';
import { SoultiNightMode } from '@/components/SoultiNightMode';

/**
 * SoulTI shell layout · injects the always-on Night Mode controller
 * (auto-triggers between 22:00–06:00 local time).
 *
 * Strategy: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E2)
 */
export default function SoultiLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SoultiNightMode />
    </>
  );
}
