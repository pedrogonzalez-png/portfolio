import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContext";
import {
  DEFAULT_THEME_ID, officialTheme, OFFICIAL_THEMES, THEME_CSS_TOKENS,
  THEME_STORAGE_KEY, type Theme, type ThemePalette,
} from "./themes";

const ACCENT_STORAGE = "portfolio.theme.accent.v1";
const validAccent = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex);
const readAccent = ():string|null => {
  try { const color=localStorage.getItem(ACCENT_STORAGE); return color&&validAccent(color)?color:null; }
  catch { return null; }
};
const initialTheme=():Theme=>{
  try {return officialTheme(localStorage.getItem(THEME_STORAGE_KEY)??DEFAULT_THEME_ID)??OFFICIAL_THEMES[0];}
  catch{return OFFICIAL_THEMES[0];}
};

/**
 * Finished themes only. Legacy custom-theme records are intentionally left
 * untouched in storage, but can no longer be created, edited or applied.
 * The visitor may change only one accent-color override.
 */
export function ThemeProvider({children}:{children:React.ReactNode}){
  const [theme,setAppliedTheme]=useState<Theme>(initialTheme);
  const [accentColor,setAccent]=useState<string|null>(readAccent);
  const setTheme=useCallback((id:string)=>{
    const approved=officialTheme(id);
    if(approved)setAppliedTheme(approved);
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
    theme,setTheme,availableThemes:OFFICIAL_THEMES,accentColor,setAccentColor,
  }),[theme,setTheme,accentColor,setAccentColor]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
