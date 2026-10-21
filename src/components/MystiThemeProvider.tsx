'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import {
  MYSTI_THEMES_V2,
  MYSTI_THEME_V2_DEFAULT,
} from '@/lib/mysti/themes-v2';
import type { MystiThemeV2, MystiThemeV2Id } from '@/lib/mysti/types';
import { useWtftiTheme } from '@/components/wtfti/WtftiThemeProvider';

interface MystiThemeContextValue {
  themeId: MystiThemeV2Id;
  theme: MystiThemeV2;
  setTheme: (id: MystiThemeV2Id) => void;
  cycleTheme: () => void;
  isManual: boolean;
  resetToAuto: () => void;
}

const MystiThemeContext = createContext<MystiThemeContextValue | null>(null);

export function MystiThemeProvider({
  children,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: MystiThemeV2Id;
}) {
  const { theme: rootTheme, toggle, setTheme: setRootTheme } = useWtftiTheme();
  
  // 映射全局 WtftiTheme 到 MystiTheme
  // B09 (2026-10-21): old /mysti pages align with the homepage skin-journal look —
  // always render the light journal palette, regardless of the global dark toggle.
  void rootTheme;
  const themeId: MystiThemeV2Id = 'aurora';
  const theme = MYSTI_THEMES_V2[themeId];

  // 抹平旧的控制接口，将它们映射到全局 toggle
  const cycleTheme = useCallback(() => {
    toggle();
  }, [toggle]);

  const setTheme = useCallback((id: MystiThemeV2Id) => {
    setRootTheme(id === 'aurora' ? 'light' : 'dark');
  }, [setRootTheme]);

  const resetToAuto = useCallback(() => {
    // 空实现，依靠全局
  }, []);

  const value = useMemo<MystiThemeContextValue>(
    () => ({ themeId, theme, setTheme, cycleTheme, isManual: false, resetToAuto }),
    [themeId, theme, setTheme, cycleTheme, resetToAuto],
  );

  return <MystiThemeContext.Provider value={value}>{children}</MystiThemeContext.Provider>;
}

export function useMystiTheme(): MystiThemeContextValue {
  const ctx = useContext(MystiThemeContext);
  if (!ctx) {
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
