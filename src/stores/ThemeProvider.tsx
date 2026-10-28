import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { changliTokens } from "../styles/changli";

export type ThemeKind = "official" | "custom";

export interface Theme {
  id: string;
  name: string;
  kind: ThemeKind;
  basedOnThemeId?: string;
  palette: typeof changliTokens;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export const OFFICIAL_THEMES: Theme[] = [
  {
    id: "changli",
    name: "Changli",
    kind: "official",
    palette: changliTokens,
    createdAt: "2026-10-27T00:00:00Z",
    updatedAt: "2026-10-27T00:00:00Z",
    schemaVersion: 1,
  },
];

export const DEFAULT_THEME_ID = "changli";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

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

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}