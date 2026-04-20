'use client';

import { useEffect } from 'react';

/**
 * 把 body 标记为 data-theme="galaxy"，在 /wtfti/galaxy/** 激活暮光 token。
 * 保留原值以防其他 layout 嵌套时误伤。
 */
export function GalaxyThemeBinder() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const prev = body.dataset.theme;
    body.dataset.theme = 'galaxy';
    return () => {
      if (prev === undefined) {
        delete body.dataset.theme;
      } else {
        body.dataset.theme = prev;
      }
    };
  }, []);

  return null;
}
