/**
 * M0 — Base reprodutível: tokens semânticos derivados do tema Changli
 * (fonte real: Hyprland-Themes/end4-pC/changli.json — dark)
 * Nenhum valor inventado; todos mapeados de dados confirmados no repo.
 */
export const changliTokens = {
  // Fundos (surface / background)
  bg: "#110A0B",
  surface: "#1A0F10",
  surfaceContainer: "#302020",
  surfaceContainerHigh: "#3A2020",

  // Texto
  text: "#F7E7D8",
  textVariant: "#D7B7A5",

  // Contorno / outlines
  outline: "#BC8D77",

  // Acentos (characrterizados no JSON oficial)
  accentPrimary: "#C96A42",   // orange / primary
  accentRed: "#E17F72",        // red
  accentYellow: "#E3B37A",     // yellow / tertiary

  // Surface dim (para overlays / terminal)
  surfaceDim: "#110A0B",

  // Fallback 2D inicial: cor neutra segura
  fallbackBg: "#0f0f12",
} as const;

export type ChangliTokens = typeof changliTokens;
