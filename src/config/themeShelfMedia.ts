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
 * The original five retain their verified Quickshell palettes. For the five
 * additional media-only entries, a neutral exhibition light is intentional:
 * it is NOT a claim about their real color schemes. Official colors can be
 * supplied and configured later without changing any of the media paths.
 */
const neutralPalette: ThemePalette = Object.freeze({
  ...OFFICIAL_THEMES[0].palette,
  accentPrimary: "#B9B7BD",
  accentRed: "#B9B7BD",
  accentYellow: "#D0CDD2",
});
export const ADDITIONAL_GALLERY_THEMES: readonly GalleryTheme[] = Object.freeze([
  { id: "hsin", name: "Hsin", palette: neutralPalette },
  { id: "shorekeeper", name: "Shorekeeper", palette: neutralPalette },
  { id: "wuthering", name: "Wuthering", palette: neutralPalette },
  { id: "doom", name: "Doom", palette: neutralPalette },
  { id: "kyoraku", name: "Kyoraku", palette: neutralPalette },
]);
export const GALLERY_THEMES: readonly GalleryTheme[] = Object.freeze([
  ...OFFICIAL_THEMES,
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
