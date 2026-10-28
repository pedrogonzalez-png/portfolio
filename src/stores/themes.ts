import official from "../data/official-theme-schemes.json";

export type ThemeKind = "official" | "custom";
export interface ThemePalette {
  bg: string; surface: string; surfaceContainer: string; surfaceContainerHigh: string;
  text: string; textVariant: string; outline: string; accentPrimary: string;
  accentRed: string; accentYellow: string; surfaceDim: string; fallbackBg: string;
}
export interface Theme {
  id: string; name: string; kind: ThemeKind; palette: ThemePalette;
  basedOnThemeId?: string; sourcePath: string; sourceSha: string; schemaVersion: number;
}
const IDS = ["changli", "hiyuki", "emilia", "furina", "hotline-miami"] as const;
export const DEFAULT_THEME_ID = "changli";
const asHex = (value: string) => /^#[\da-f]{6}$/i.test(value) ? value : "#110A0B";

export const OFFICIAL_THEMES: readonly Theme[] = Object.freeze(IDS.map((id) => {
  const data = official[id];
  const dark = data.dark;
  const accents: Record<string, string> = dark.accents;
  const palette: ThemePalette = Object.freeze({
    bg: asHex(dark.surface_dim), surface: asHex(dark.surface),
    surfaceContainer: asHex(dark.surface_container),
    surfaceContainerHigh: asHex(dark.surface_container_high),
    text: asHex(dark.on_surface), textVariant: asHex(dark.on_surface_variant),
    outline: asHex(dark.outline),
    accentPrimary: asHex(accents[data.defaults.primary]),
    accentRed: asHex(accents[data.defaults.secondary]),
    accentYellow: asHex(accents[data.defaults.tertiary]),
    surfaceDim: asHex(dark.surface_dim), fallbackBg: asHex(dark.surface_container_lowest),
  });
  return Object.freeze({
    id, name: data.name, kind: "official" as const, palette,
    sourcePath: data.sourcePath, sourceSha: data.sourceSha, schemaVersion: 1,
  });
}));
export const officialTheme = (id: string): Theme | null => OFFICIAL_THEMES.find((t) => t.id === id) ?? null;
export const THEME_CSS_TOKENS: Record<keyof ThemePalette, string> = {
  bg: "--color-bg", surface: "--color-surface", surfaceContainer: "--color-surface-container",
  surfaceContainerHigh: "--color-surface-high", text: "--color-text",
  textVariant: "--color-text-variant", outline: "--color-outline",
  accentPrimary: "--color-accent-primary", accentRed: "--color-accent-red",
  accentYellow: "--color-accent-yellow", surfaceDim: "--color-surface-dim",
  fallbackBg: "--color-fallback-bg",
};
export const THEME_STORAGE_KEY = "portfolio.theme.active.v1";
