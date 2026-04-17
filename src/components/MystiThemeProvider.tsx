'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  MYSTI_THEMES_V2,
  MYSTI_THEME_V2_DEFAULT,
  MYSTI_THEME_V2_STORAGE_KEY,
  getAutoTimeTheme,
  migrateLegacyTheme,
} from '@/lib/mysti/themes-v2';
import type { MystiThemeV2, MystiThemeV2Id } from '@/lib/mysti/types';

interface MystiThemeContextValue {
  themeId: MystiThemeV2Id;
  theme: MystiThemeV2;
  setTheme: (id: MystiThemeV2Id) => void;
  cycleTheme: () => void;
  /** 用户是否手动覆盖了自动模式 */
  isManual: boolean;
  resetToAuto: () => void;
}

const MystiThemeContext = createContext<MystiThemeContextValue | null>(null);

const MANUAL_FLAG_KEY = 'mysti-theme-v2-manual';
const LEGACY_THEME_KEY = 'mysti-theme-preference';

function resolveClientTheme(defaultTheme?: MystiThemeV2Id): {
  themeId: MystiThemeV2Id;
  isManual: boolean;
} {
  const stored = window.localStorage.getItem(MYSTI_THEME_V2_STORAGE_KEY);
  if (stored && stored in MYSTI_THEMES_V2) {
    return {
      themeId: stored as MystiThemeV2Id,
      isManual: true,
    };
  }

  const legacy = window.localStorage.getItem(LEGACY_THEME_KEY);
  if (legacy) {
    return {
      themeId: migrateLegacyTheme(legacy),
      isManual: true,
    };
  }

  return {
    themeId: defaultTheme ?? getAutoTimeTheme(),
    isManual: false,
  };
}

export function MystiThemeProvider({
  children,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: MystiThemeV2Id;
}) {
  // 首帧严格对齐服务端，挂载后再补读 localStorage / 自动时段，避免 hydration mismatch。
  const [themeId, setThemeId] = useState<MystiThemeV2Id>(defaultTheme ?? MYSTI_THEME_V2_DEFAULT);
  const [isManual, setIsManual] = useState(false);
  const [hasResolvedInitialTheme, setHasResolvedInitialTheme] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const next = resolveClientTheme(defaultTheme);
      setThemeId(prev => (prev === next.themeId ? prev : next.themeId));
      setIsManual(prev => (prev === next.isManual ? prev : next.isManual));
      setHasResolvedInitialTheme(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [defaultTheme]);

  // 自动模式下：监听小时变化并刷新主题
  useEffect(() => {
    if (!hasResolvedInitialTheme || isManual) return;
    const tick = () => {
      const auto = getAutoTimeTheme();
      setThemeId(prev => (prev === auto ? prev : auto));
    };
    tick();
    const id = window.setInterval(tick, 60 * 1000); // 每分钟检查一次
    return () => window.clearInterval(id);
  }, [hasResolvedInitialTheme, isManual]);

  const setTheme = useCallback((next: MystiThemeV2Id) => {
    setThemeId(next);
    setIsManual(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MYSTI_THEME_V2_STORAGE_KEY, next);
      window.localStorage.setItem(MANUAL_FLAG_KEY, '1');
    }
  }, []);

  const cycleTheme = useCallback(() => {
    const order: MystiThemeV2Id[] = ['twilight', 'nocturne', 'aurora'];
    setThemeId(prev => {
      const idx = order.indexOf(prev);
      const next = order[(idx + 1) % order.length];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(MYSTI_THEME_V2_STORAGE_KEY, next);
        window.localStorage.setItem(MANUAL_FLAG_KEY, '1');
      }
      return next;
    });
    setIsManual(true);
  }, []);

  const resetToAuto = useCallback(() => {
    setIsManual(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(MANUAL_FLAG_KEY);
      window.localStorage.removeItem(MYSTI_THEME_V2_STORAGE_KEY);
    }
    setThemeId(getAutoTimeTheme());
  }, []);

  const theme = MYSTI_THEMES_V2[themeId];

  const value = useMemo<MystiThemeContextValue>(
    () => ({ themeId, theme, setTheme, cycleTheme, isManual, resetToAuto }),
    [themeId, theme, setTheme, cycleTheme, isManual, resetToAuto],
  );

  return <MystiThemeContext.Provider value={value}>{children}</MystiThemeContext.Provider>;
}

export function useMystiTheme(): MystiThemeContextValue {
  const ctx = useContext(MystiThemeContext);
  if (!ctx) {
    // 容错：在 Provider 之外调用时返回默认 twilight 主题（避免崩溃）
    const id = MYSTI_THEME_V2_DEFAULT;
    return {
      themeId: id,
      theme: MYSTI_THEMES_V2[id],
      setTheme: () => {},
      cycleTheme: () => {},
      isManual: false,
      resetToAuto: () => {},
    };
  }
  return ctx;
}
