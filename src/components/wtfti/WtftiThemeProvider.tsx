'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * WTFTI 主题：
 *  - dark  · LUMINA RITUAL  (女性感性的宇宙仪式感, 默认)
 *  - light · BE TRUE        (温柔奶油玫瑰编辑式)
 *
 * 实现方式：在 <body> 上挂 data-theme="wtfti-dark|wtfti-light"，
 * globals.css 通过 token 重映射切换两套配色，无需逐组件改写。
 */
export type WtftiTheme = 'dark' | 'light';

const STORAGE_KEY = 'wtfti.theme';
// 默认 = BE TRUE 浅色（与现有米白主站一致，避免首次访问突然翻黑）
const DEFAULT_THEME: WtftiTheme = 'light';

type WtftiThemeContextValue = {
  theme: WtftiTheme;
  setTheme: (next: WtftiTheme) => void;
  toggle: () => void;
};

const WtftiThemeContext = createContext<WtftiThemeContextValue | null>(null);

function readStoredTheme(): WtftiTheme {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage === 'light' || fromStorage === 'dark') return fromStorage;
  } catch {
    /* ignore */
  }

  const fromBody = document.body.dataset.wtftiTheme;
  if (fromBody === 'light' || fromBody === 'dark') return fromBody;

  return DEFAULT_THEME;
}

function applyTheme(next: WtftiTheme, persist = true) {
  if (typeof document === 'undefined') return;
  const body = document.body;
  const html = document.documentElement;
  body.dataset.theme = `wtfti-${next}`;
  body.dataset.wtftiTheme = next;
  html.style.colorScheme = next === 'dark' ? 'dark' : 'light';
  if (!persist) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

export function useWtftiTheme(): WtftiThemeContextValue {
  const ctx = useContext(WtftiThemeContext);
  if (!ctx) {
    throw new Error('useWtftiTheme must be used within <WtftiThemeProvider>');
  }
  return ctx;
}

export function WtftiThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<WtftiTheme>(DEFAULT_THEME);
  const canApplyThemeRef = useRef(false);

  useEffect(() => {
    if (!canApplyThemeRef.current) return;
    applyTheme(theme);
  }, [theme]);

  // Hydrate from localStorage after the first client render so SSR markup stays stable.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const html = document.documentElement;
    const prevTheme = body.dataset.theme;
    const prevWtfti = body.dataset.wtftiTheme;
    const prevColorScheme = html.style.colorScheme;

    let cancelled = false;
    const storedTheme = readStoredTheme();
    canApplyThemeRef.current = true;
    applyTheme(storedTheme);
    queueMicrotask(() => {
      if (!cancelled) setThemeState(storedTheme);
    });

    return () => {
      cancelled = true;
      canApplyThemeRef.current = false;
      if (prevTheme === undefined) delete body.dataset.theme;
      else body.dataset.theme = prevTheme;
      if (prevWtfti === undefined) delete body.dataset.wtftiTheme;
      else body.dataset.wtftiTheme = prevWtfti;
      html.style.colorScheme = prevColorScheme;
    };
  }, []);

  const setTheme = useCallback((next: WtftiTheme) => setThemeState(next), []);
  const toggle = useCallback(
    () => setThemeState((cur) => (cur === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo<WtftiThemeContextValue>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return (
    <WtftiThemeContext.Provider value={value}>
      {children}
    </WtftiThemeContext.Provider>
  );
}
