import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContext";
import {
  DEFAULT_THEME_ID, officialTheme, OFFICIAL_THEMES, THEME_CSS_TOKENS,
  THEME_STORAGE_KEY, type Theme, type ThemePalette,
} from "./themes";
import {
  duplicateTheme, readAppliedTheme, readCustomThemes,
  storeAppliedTheme, updateCustomTheme, writeCustomThemes,
} from "../services/customThemes";

const ACCENT_STORAGE = "portfolio.theme.accent.v1";
const validAccent = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex);
function readAccent(): string | null {
  try { const v = localStorage.getItem(ACCENT_STORAGE); return v && validAccent(v) ? v : null; }
  catch { return null; }
}

function initialTheme(customThemes: readonly Theme[]): Theme {
  try {
    const savedId = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
    return officialTheme(savedId) ?? readAppliedTheme(customThemes, savedId) ?? OFFICIAL_THEMES[0];
  } catch { return OFFICIAL_THEMES[0]; }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [customThemes, setCustomThemes] = useState<Theme[]>(readCustomThemes);
  const [theme, setAppliedTheme] = useState<Theme>(() => initialTheme(customThemes));
  const [accentColor, setAccent] = useState<string | null>(readAccent);
  const availableThemes = useMemo(
    () => [...OFFICIAL_THEMES, ...customThemes], [customThemes]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    for (const token of Object.keys(THEME_CSS_TOKENS) as (keyof ThemePalette)[]) {
      root.style.setProperty(THEME_CSS_TOKENS[token], theme.palette[token]);
    }
    root.style.setProperty(THEME_CSS_TOKENS.accentPrimary, accentColor ?? theme.palette.accentPrimary);
    try { if (accentColor) localStorage.setItem(ACCENT_STORAGE, accentColor);
      else localStorage.removeItem(ACCENT_STORAGE); } catch { /* optional preference */ }
    try { localStorage.setItem(THEME_STORAGE_KEY, theme.id); }
    catch { /* Private mode: UI remains functional for this session. */ }
    storeAppliedTheme(theme);
  }, [theme, accentColor]);

  const setTheme = useCallback((id: string) => {
    const next = officialTheme(id) ?? customThemes.find((candidate) => candidate.id === id);
    if (next) setAppliedTheme({ ...next, palette: { ...next.palette } });
  }, [customThemes]);

  const createCustomTheme = useCallback((baseId: string): Theme => {
    const base = officialTheme(baseId) ?? customThemes.find((candidate) => candidate.id === baseId);
    if (!base) throw new Error("Tema de origem desconhecido.");
    const copy = duplicateTheme(base, customThemes);
    const updated = [...customThemes, copy];
    writeCustomThemes(updated);
    setCustomThemes(updated);
    return copy;
  }, [customThemes]);

  const saveCustomTheme = useCallback((id: string, name: string, palette: ThemePalette): Theme => {
    const current = customThemes.find((candidate) => candidate.id === id);
    if (!current) throw new Error("Somente cópias personalizadas podem ser editadas.");
    const updated = updateCustomTheme(current, name, palette);
    const collection = customThemes.map((candidate) => candidate.id === id ? updated : candidate);
    writeCustomThemes(collection);
    setCustomThemes(collection);
    // Notice: saving does not update the applied snapshot.
    return updated;
  }, [customThemes]);

  const setAccentColor = useCallback((hex: string | null) => {
    if (hex === null || validAccent(hex)) setAccent(hex);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, availableThemes, createCustomTheme, saveCustomTheme, accentColor, setAccentColor }),
    [theme, setTheme, availableThemes, createCustomTheme, saveCustomTheme, accentColor, setAccentColor],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
