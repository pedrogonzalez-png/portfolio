import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContext";
import {
  DEFAULT_THEME_ID, officialTheme, THEME_CSS_TOKENS,
  THEME_STORAGE_KEY, type Theme, type ThemePalette,
} from "./themes";
import { GALLERY_THEMES } from "../config/themeShelfMedia";

const ACCENT_STORAGE = "portfolio.theme.accent.v1";
const validAccent = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex);
const readAccent = ():string|null => {
  try { const color=localStorage.getItem(ACCENT_STORAGE); return color&&validAccent(color)?color:null; }
  catch { return null; }
};
/**
 * The CD gallery's published JSONs are the single source of truth for all ten
 * globally selectable themes. The former five official presets keep their
 * metadata; the five additional presets have their own bundled JSONs.
 */
const appliedThemes: readonly Theme[] = Object.freeze(GALLERY_THEMES.map((entry) => {
  const original = officialTheme(entry.id);
  return Object.freeze({
    id: entry.id,
    name: entry.name,
    kind: "official" as const,
    palette: entry.palette,
    sourcePath: original?.sourcePath ??
      `src/data/hyprland-color-schemes/${entry.id === "wuthering" ? "wuwa" : entry.id}.json`,
    sourceSha: original?.sourceSha ?? "",
    schemaVersion: original?.schemaVersion ?? 1,
  });
}));
const appliedThemeById = (id: string): Theme | null =>
  appliedThemes.find((candidate) => candidate.id === id) ?? null;
const initialTheme=():Theme=>{
  try {
    return appliedThemeById(localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID)
      ?? appliedThemes[0];
  } catch { return appliedThemes[0]; }
};

/**
 * Finished published CD presets only. Selecting any of the ten schemes
 * updates the whole portfolio and persists across navigation/reloads.
 * Custom-theme records remain untouched in storage and are not selectable.
 */
export function ThemeProvider({children}:{children:React.ReactNode}){
  const [theme,setAppliedTheme]=useState<Theme>(initialTheme);
  const [accentColor,setAccent]=useState<string|null>(readAccent);
  const setTheme=useCallback((id:string)=>{
    const approved=appliedThemeById(id);
    if (approved) {
      // An obsolete accent override must not replace the selected CD's
      // original palette on the home page.
      setAccent(null);
      setAppliedTheme(approved);
    }
  },[]);
  const setAccentColor=useCallback((color:string|null)=>{
    if(color===null||validAccent(color))setAccent(color);
  },[]);

  useLayoutEffect(()=>{
    const root=document.documentElement;
    root.dataset.theme=theme.id;
    for(const name of Object.keys(THEME_CSS_TOKENS) as (keyof ThemePalette)[]){
      root.style.setProperty(THEME_CSS_TOKENS[name],theme.palette[name]);
    }
    root.style.setProperty(THEME_CSS_TOKENS.accentPrimary,accentColor??theme.palette.accentPrimary);
    try{
      localStorage.setItem(THEME_STORAGE_KEY,theme.id);
      if(accentColor)localStorage.setItem(ACCENT_STORAGE,accentColor);
      else localStorage.removeItem(ACCENT_STORAGE);
    }catch{ /* Browsers with disabled storage can still display the session */ }
  },[theme,accentColor]);

  const value=useMemo<ThemeContextValue>(()=>({
    theme,setTheme,availableThemes:appliedThemes,accentColor,setAccentColor,
  }),[theme,setTheme,accentColor,setAccentColor]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
