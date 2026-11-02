/**
 * HYPRLAND THEMES — media published by the owner in /public/assets/hyprland/temas/.
 *
 * A CD with a video plays it only while selected; covers remain visible on
 * their CDs. Empty fields use the existing CSS art instead of broken links.
 * The filenames below match the original files exactly (including hyuki.mp4).
 *
 * These five mappings are intentionally limited to the FIVE official themes.
 * Extra artwork (doom, kyoraku, hsin, shorekeeper, wutering) is untouched.
 */
export interface ThemeShelfMedia {
  cover: string;
  video: string;
  poster: string;
}
export type OfficialShelfThemeId =
  | "changli" | "hiyuki" | "emilia" | "furina" | "hotline-miami";

export const THEME_SHELF_MEDIA: Readonly<Record<OfficialShelfThemeId, ThemeShelfMedia>> = {
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
};
