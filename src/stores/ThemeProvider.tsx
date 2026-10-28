import { useCallback, useMemo, useState } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContext";
import { DEFAULT_THEME_ID, OFFICIAL_THEMES } from "./themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState(DEFAULT_THEME_ID);

  const theme = useMemo(
    () => OFFICIAL_THEMES.find((t) => t.id === activeId) ?? OFFICIAL_THEMES[0],
    [activeId],
  );

  const setTheme = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, availableThemes: OFFICIAL_THEMES }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
