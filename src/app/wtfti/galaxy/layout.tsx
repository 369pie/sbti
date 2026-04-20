import type { ReactNode } from 'react';

import { StardustDueBanner } from '@/components/galaxy/StardustDueBanner';
import { GalaxyThemeBinder } from '@/components/galaxy/GalaxyThemeBinder';

/**
 * Galaxy (人格神域) 统一布局
 * - 挂 data-theme="galaxy" → globals.css 暮光 token 接管，解决主站米白与神域的视觉割裂
 * - 保留 StardustDueBanner 星尘信件提醒
 */
export default function GalaxyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GalaxyThemeBinder />
      <StardustDueBanner />
      {children}
    </>
  );
}
