import { OFFICIAL_THEMES, type ThemePalette } from "../stores/themes";

/** Gallery selection, separate from the five installed global color schemes. */
export interface GalleryTheme {
  id: string;
  name: string;
  palette: ThemePalette;
}
export interface ThemeShelfMedia {
  cover: string;
  video: string;
  poster: string;
}
export type ShelfThemeId =
  | "changli" | "hiyuki" | "emilia" | "furina" | "hotline-miami"
  | "hsin" | "shorekeeper" | "wuthering" | "doom" | "kyoraku";

/**
 * Dark Quickshell colors extracted from the 10 JSON schemes supplied by the
 * owner on 2026-11-02. These colors apply to the CD gallery ONLY; the
 * portfolio's existing five global color schemes stay unchanged.
 *
 * Columns: bg, surface, surfaceContainer, surfaceContainerHigh, text,
 * textVariant, outline, accentPrimary, accentRed, accentYellow,
 * surfaceDim, fallbackBg. Accent values respect defaults.primary/secondary/
 * tertiary, including each scheme's custom_* colors.
 *
 * IDs "wuthering" and "kyoraku" correspond to the uploaded wuwa.json
 * and kiyoraku.json; media file names retain their original spelling.
 */
const PALETTE_COLUMNS: readonly (keyof ThemePalette)[] = [
  "bg", "surface", "surfaceContainer", "surfaceContainerHigh", "text",
  "textVariant", "outline", "accentPrimary", "accentRed", "accentYellow",
  "surfaceDim", "fallbackBg",
];
const PALETTE_COLORS: Readonly<Record<ShelfThemeId, readonly string[]>> = {
  changli: ["#110A0B", "#1A0F10", "#302020", "#3A2020", "#F7E7D8", "#D7B7A5", "#BC8D77", "#ca5230", "#e17f72", "#e3b37a", "#110A0B", "#140B0C"],
  hiyuki: ["#101118", "#181A22", "#2D3142", "#383C50", "#E7EAF4", "#C8CEDD", "#AFC4E8", "#C96A85", "#C18CB4", "#A0B2DF", "#101118", "#111219"],
  emilia: ["#11091F", "#1A0F30", "#291643", "#341C53", "#D6E8FF", "#B8CBEF", "#A78CCF", "#b787ff", "#576fff", "#91a9ff", "#11091F", "#130A25"],
  furina: ["#0d1525", "#142137", "#1b2a43", "#243653", "#f1f7ff", "#cfdfef", "#9eb7d2", "#9dc7ff", "#92dbea", "#e9ce9b", "#0d1525", "#10192a"],
  "hotline-miami": ["#1b102e", "#2d1c4c", "#372454", "#483063", "#f1b696", "#e7aec3", "#d999be", "#f10d6e", "#f1b696", "#e7aec3", "#1b102e", "#201337"],
  hsin: ["#101015", "#17171c", "#19191e", "#1c1c22", "#f7f5f3", "#cbc8c8", "#888688", "#d94639", "#a93341", "#e7e9ef", "#101015", "#111116"],
  shorekeeper: ["#101015", "#17171c", "#19191e", "#1c1c22", "#f7f5f3", "#cbc8c8", "#888688", "#738ae8", "#73b4e8", "#738de8", "#101015", "#111116"],
  wuthering: ["#101015", "#17171c", "#19191e", "#1c1c22", "#f7f5f3", "#cbc8c8", "#888688", "#4a5cb4", "#a875e0", "#d98da0", "#101015", "#111116"],
  doom: ["#101015", "#17171c", "#19191e", "#1c1c22", "#f7f5f3", "#cbc8c8", "#888688", "#e89073", "#a9e873", "#e8bd73", "#101015", "#111116"],
  kyoraku: ["#101015", "#17171c", "#19191e", "#1c1c22", "#f7f5f3", "#cbc8c8", "#888688", "#d49900", "#c1e839", "#e89b31", "#101015", "#111116"],
};
function makePalette(values: readonly string[]): ThemePalette {
  if (values.length !== PALETTE_COLUMNS.length) {
    throw new Error("Incomplete Hyprland color palette");
  }
  return Object.freeze(Object.fromEntries(
    PALETTE_COLUMNS.map((key, index) => [key, values[index]]),
  ) as unknown as ThemePalette);
}
export const GALLERY_PALETTES: Readonly<Record<ShelfThemeId, ThemePalette>> =
  Object.freeze(Object.fromEntries(
    (Object.keys(PALETTE_COLORS) as ShelfThemeId[]).map(id =>
      [id, makePalette(PALETTE_COLORS[id])],
    ),
  ) as Record<ShelfThemeId, ThemePalette>);

export const ADDITIONAL_GALLERY_THEMES: readonly GalleryTheme[] = Object.freeze([
  { id: "hsin", name: "Hsin", palette: GALLERY_PALETTES.hsin },
  { id: "shorekeeper", name: "Shorekeeper", palette: GALLERY_PALETTES.shorekeeper },
  { id: "wuthering", name: "Wuthering", palette: GALLERY_PALETTES.wuthering },
  { id: "doom", name: "Doom", palette: GALLERY_PALETTES.doom },
  { id: "kyoraku", name: "Kyoraku", palette: GALLERY_PALETTES.kyoraku },
]);
export const GALLERY_THEMES: readonly GalleryTheme[] = Object.freeze([
  ...OFFICIAL_THEMES.map(theme => ({
    id: theme.id,
    name: theme.name,
    palette: GALLERY_PALETTES[theme.id as ShelfThemeId],
  })),
  ...ADDITIONAL_GALLERY_THEMES,
]);

/** File names match the actual published files; do not rename hyuki/wutering. */
export const THEME_SHELF_MEDIA: Readonly<Record<ShelfThemeId, ThemeShelfMedia>> = {
  changli: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/changli.mp4",
    poster: "",
  },
  hiyuki: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/hyuki.mp4",
    poster: "",
  },
  emilia: {
    cover: "/assets/hyprland/temas/foto-fundo/emilia.png",
    video: "",
    poster: "",
  },
  furina: {
    cover: "/assets/hyprland/temas/foto-fundo/furina.png",
    video: "",
    poster: "",
  },
  "hotline-miami": {
    cover: "/assets/hyprland/temas/foto-fundo/tony.png",
    video: "",
    poster: "",
  },
  hsin: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/hsin.mp4",
    poster: "",
  },
  shorekeeper: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/shorekeeper.mp4",
    poster: "",
  },
  wuthering: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/wutering.mp4",
    poster: "",
  },
  doom: {
    cover: "/assets/hyprland/temas/foto-fundo/doom.png",
    video: "",
    poster: "",
  },
  kyoraku: {
    cover: "/assets/hyprland/temas/foto-fundo/kyoraku.png",
    video: "",
    poster: "",
  },
};
