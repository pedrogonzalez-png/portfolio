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
