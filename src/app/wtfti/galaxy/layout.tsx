import type { ReactNode } from 'react';

import { StardustDueBanner } from '@/components/galaxy/StardustDueBanner';

/**
 * Galaxy (人格神域) 统一布局
 * - 主题由父级 src/app/wtfti/layout.tsx 的 WtftiThemeProvider 统一管理
 *   (LUMINA dark / BE TRUE light)，此处不再单独挂 data-theme="galaxy"
 * - 保留 StardustDueBanner 星尘信件提醒
 */
export default function GalaxyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StardustDueBanner />
      {children}
    </>
  );
}
