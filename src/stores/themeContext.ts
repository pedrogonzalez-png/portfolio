import { createContext, useContext } from "react";
import type { Theme } from "./themes";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: string) => void;
  availableThemes: readonly Theme[];
  accentColor: string | null;
  setAccentColor: (hex: string | null) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
