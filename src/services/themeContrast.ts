import type { ThemePalette } from "../stores/themes";

function luminance(hex: string): number {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error("Cor hexadecimal inválida.");
  const channel = (start: number) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG 2.x contrast ratio, based on actual relative sRGB luminance. */
export function contrastRatio(first: string, second: string): number {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export interface ContrastCheck {
  id: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  threshold: number;
  passes: boolean;
}

/** Indicative checks for typical UI pairs, not a certification of the whole site. */
export function auditThemeContrast(palette: ThemePalette): ContrastCheck[] {
  const checks = [
    { id: "body", label: "Texto sobre o fundo", foreground: palette.text, background: palette.bg, threshold: 4.5 },
    { id: "surface", label: "Texto sobre painéis", foreground: palette.text, background: palette.surface, threshold: 4.5 },
    { id: "secondary", label: "Texto secundário sobre painéis", foreground: palette.textVariant, background: palette.surface, threshold: 4.5 },
    { id: "accent", label: "Destaque sobre o fundo (elementos gráficos)", foreground: palette.accentPrimary, background: palette.bg, threshold: 3 },
  ];
  return checks.map((item) => {
    const ratio = contrastRatio(item.foreground, item.background);
    return { ...item, ratio, passes: ratio >= item.threshold };
  });
}

/** Suggest a single text color that maximizes the worst contrast of both surfaces. */
export function suggestReadableText(palette: ThemePalette): string {
  const candidates = ["#FFFFFF", "#000000"];
  return candidates.reduce((best, color) => {
    const minimum = (value: string) => Math.min(
      contrastRatio(value, palette.bg), contrastRatio(value, palette.surface),
    );
    return minimum(color) > minimum(best) ? color : best;
  });
}
