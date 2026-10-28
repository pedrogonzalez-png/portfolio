import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContext";
import { DEFAULT_THEME_ID, officialTheme, OFFICIAL_THEMES, THEME_CSS_TOKENS, THEME_STORAGE_KEY } from "./themes";

function readSavedTheme(): string {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored && officialTheme(stored) ? stored : DEFAULT_THEME_ID;
  } catch { return DEFAULT_THEME_ID; }
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState(readSavedTheme);
  const theme = useMemo(() => officialTheme(activeId) ?? OFFICIAL_THEMES[0], [activeId]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    for (const token of Object.keys(THEME_CSS_TOKENS) as (keyof typeof theme.palette)[]) {
      root.style.setProperty(THEME_CSS_TOKENS[token], theme.palette[token]);
    }
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme.id); }
    catch { /* Private mode: switch works during current session. */ }
  }, [theme]);
  const setTheme = useCallback((id: string) => {
    if (officialTheme(id)) setActiveId(id);
  }, []);
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, availableThemes: OFFICIAL_THEMES }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
