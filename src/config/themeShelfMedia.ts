import { THEME_CSS_TOKENS, type ThemePalette } from "../stores/themes";
import changli from "../data/hyprland-color-schemes/changli.json";
import hiyuki from "../data/hyprland-color-schemes/hiyuki.json";
import emilia from "../data/hyprland-color-schemes/emilia.json";
import furina from "../data/hyprland-color-schemes/furina.json";
import hotlineMiami from "../data/hyprland-color-schemes/hotline-miami.json";
import hsin from "../data/hyprland-color-schemes/hsin.json";
import shorekeeper from "../data/hyprland-color-schemes/shorekeeper.json";
import wuwa from "../data/hyprland-color-schemes/wuwa.json";
import doom from "../data/hyprland-color-schemes/doom.json";
import kiyoraku from "../data/hyprland-color-schemes/kiyoraku.json";

export interface GalleryTheme {
  id: string;
  name: string;
  palette: ThemePalette;
}
export interface ThemeShelfMedia {
  cover: string;
  video: string;
  /** Original first frame; stays visible until the video actually decodes. */
  poster: string;
  /** Lightweight H.264 / yuv420p / faststart variant for mobile devices. */
  mobileVideo?: string;
}
export type ShelfThemeId =
  | "changli" | "hiyuki" | "emilia" | "furina" | "hotline-miami"
  | "hsin" | "shorekeeper" | "wuthering" | "doom" | "kyoraku";

interface SchemeMode {
  surface_dim: string;
  surface: string;
  surface_container_lowest: string;
  surface_container: string;
  surface_container_high: string;
  on_surface: string;
  on_surface_variant: string;
  outline: string;
  accents: Record<string, string>;
  term: string[];
}
export interface QuickshellColorScheme {
  name: string;
  defaults: { primary: string; secondary: string; tertiary: string };
  dark: SchemeMode;
  light: SchemeMode;
}

/** These are the owner's original files, NOT manually reconstructed palettes. */
export const GALLERY_SCHEMES: Readonly<Record<ShelfThemeId, QuickshellColorScheme>> =
  Object.freeze({
    changli,
    hiyuki,
    emilia,
    furina,
    "hotline-miami": hotlineMiami,
    hsin,
    shorekeeper,
    wuthering: wuwa,
    doom,
    kyoraku: kiyoraku,
  });

function paletteFromScheme(scheme: QuickshellColorScheme): ThemePalette {
  const dark = scheme.dark;
  const accent = (which: "primary" | "secondary" | "tertiary") => {
    const name = scheme.defaults[which];
    const color = dark.accents[name];
    if (!color) throw new Error(`Missing ${which} accent (${name}) for ${scheme.name}`);
    return color;
  };
  return Object.freeze({
    bg: dark.surface_dim,
    surface: dark.surface,
    surfaceContainer: dark.surface_container,
    surfaceContainerHigh: dark.surface_container_high,
    text: dark.on_surface,
    textVariant: dark.on_surface_variant,
    outline: dark.outline,
    accentPrimary: accent("primary"),
    accentRed: accent("secondary"),
    accentYellow: accent("tertiary"),
    surfaceDim: dark.surface_dim,
    fallbackBg: dark.surface_container_lowest,
  });
}

export const GALLERY_PALETTES: Readonly<Record<ShelfThemeId, ThemePalette>> =
  Object.freeze(Object.fromEntries(
    (Object.entries(GALLERY_SCHEMES) as [ShelfThemeId, QuickshellColorScheme][])
      .map(([id, scheme]) => [id, paletteFromScheme(scheme)]),
  ) as Record<ShelfThemeId, ThemePalette>);

/**
 * Expose every supplied surface, accent and terminal color as scoped CSS vars.
 * Styling stays inside Hyprland Themes; other portfolio pages are unaffected.
 */
export function gallerySchemeVariables(id: ShelfThemeId): Record<string, string> {
  const scheme = GALLERY_SCHEMES[id];
  const tokens: Record<string, string> = {};
  for (const mode of ["dark", "light"] as const) {
    const data = scheme[mode];
    for (const [key, value] of Object.entries(data)) {
      if (key === "accents" || key === "term") continue;
      if (typeof value === "string") {
        tokens[`--quickshell-${mode}-${key.replaceAll("_", "-")}`] = value;
      }
    }
    for (const [key, value] of Object.entries(data.accents)) {
      tokens[`--quickshell-${mode}-accent-${key.replaceAll("_", "-")}`] = value;
    }
    data.term.forEach((value, index) => {
      tokens[`--quickshell-${mode}-term-${index}`] = value;
    });
  }
  return tokens;
}

/** Real Quickshell colors exposed to components and visual styles. */
export function galleryCssTokens(id: ShelfThemeId): Record<string, string> {
  const palette = GALLERY_PALETTES[id];
  const base = Object.fromEntries(
    (Object.entries(THEME_CSS_TOKENS) as [keyof ThemePalette, string][])
      .map(([key, name]) => [name, palette[key]]),
  ) as Record<string, string>;
  return { ...base, ...gallerySchemeVariables(id) };
}

export const GALLERY_THEMES: readonly GalleryTheme[] = Object.freeze(
  ([
    ["changli", "Changli"],
    ["hiyuki", "Hiyuki"],
    ["emilia", "Emilia"],
    ["furina", "Furina"],
    ["hotline-miami", "Hotline Miami"],
    ["hsin", "Hsin"],
    ["shorekeeper", "Shorekeeper"],
    ["wuthering", "Wuthering"],
    ["doom", "Doom"],
    ["kyoraku", "Kyoraku"],
  ] as const).map(([id, name]) => Object.freeze({
    id, name, palette: GALLERY_PALETTES[id],
  })),
);

/** File names match the actual published files; do not rename hyuki/wutering. */
export const THEME_SHELF_MEDIA: Readonly<Record<ShelfThemeId, ThemeShelfMedia>> = {
  changli: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/changli.mp4",
    poster: "/assets/hyprland/temas/posters/changli.jpg",
    mobileVideo: "/assets/hyprland/temas/videos-mobile/changli.mp4",
  },
  hiyuki: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/hyuki.mp4",
    poster: "/assets/hyprland/temas/posters/hyuki.jpg",
    mobileVideo: "/assets/hyprland/temas/videos-mobile/hyuki.mp4",
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
    poster: "/assets/hyprland/temas/posters/hsin.jpg",
    mobileVideo: "/assets/hyprland/temas/videos-mobile/hsin.mp4",
  },
  shorekeeper: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/shorekeeper.mp4",
    poster: "/assets/hyprland/temas/posters/shorekeeper.jpg",
    mobileVideo: "/assets/hyprland/temas/videos-mobile/shorekeeper.mp4",
  },
  wuthering: {
    cover: "",
    video: "/assets/hyprland/temas/videos-fundo/wutering.mp4",
    poster: "/assets/hyprland/temas/posters/wutering.jpg",
    mobileVideo: "/assets/hyprland/temas/videos-mobile/wutering.mp4",
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
