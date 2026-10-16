'use client';

import { useEffect } from 'react';

/**
 * 宇宙暗色页统一主题（防闪白脚本 + 持锁 binder）。
 *
 * 用法（page 顶层一次）：
 *   <CosmicThemeBinder />
 *
 * 机制：
 *  1. 硬加载：根 layout 的 WtftiThemeNoFlashScript 已按路径在首帧前置暗并预上锁；
 *  2. binder（本组件）：设置 cosmicLock 并强制暗色——锁会让全局 WtftiThemeProvider
 *     的 applyTheme 跳过（否则其 hydrate effect 会在子组件 effect 之后执行、
 *     把暗色页翻回 light，即 2026-08-17 的白底白字 bug）；
 *  3. 卸载：解锁并恢复进入前的主题，不污染浅色页。
 *
 * 接入页面：/ (首页) · /today · /bottle · /wtfti/letters
 */

export function CosmicThemeBinder() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const prev = (body.dataset._cosmicPrev ?? body.dataset.theme ?? '') as string;
    body.dataset.cosmicLock = '1';
    body.dataset.theme = 'wtfti-dark';
    document.documentElement.style.colorScheme = 'dark';
    return () => {
      delete body.dataset.cosmicLock;
      if (prev) {
        body.dataset.theme = prev;
        document.documentElement.style.colorScheme =
          prev.includes('dark') || prev === 'galaxy' ? 'dark' : 'light';
      } else {
        delete body.dataset.theme;
        document.documentElement.style.colorScheme = '';
      }
      delete body.dataset._cosmicPrev;
    };
  }, []);

  return null;
}

/** 向后兼容旧名 */
export const HomeCosmosThemeBinder = CosmicThemeBinder;
