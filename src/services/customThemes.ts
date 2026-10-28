import {
  officialTheme, type Theme, type ThemePalette,
} from "../stores/themes";

export const CUSTOM_THEME_STORAGE_KEY = "portfolio.theme.custom.v1";
export const APPLIED_CUSTOM_SNAPSHOT_KEY = "portfolio.theme.applied-custom.v1";
export const MAX_CUSTOM_THEMES = 12;
const MAX_STORAGE_CHARS = 45000;

const paletteKeys: (keyof ThemePalette)[] = [
  "bg", "surface", "surfaceContainer", "surfaceContainerHigh",
  "text", "textVariant", "outline", "accentPrimary", "accentRed",
  "accentYellow", "surfaceDim", "fallbackBg",
];

export function validPalette(palette: unknown): palette is ThemePalette {
  if (!palette || typeof palette !== "object") return false;
  const candidate = palette as Record<string, unknown>;
  return paletteKeys.every((key) => typeof candidate[key] === "string" &&
    /^#[\da-f]{6}$/i.test(candidate[key] as string));
}

export function validCustomTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Theme>;
  const base = typeof item.basedOnThemeId === "string" ? officialTheme(item.basedOnThemeId) : null;
  return item.kind === "custom" && item.schemaVersion === 1 &&
    typeof item.id === "string" && /^custom-[a-z0-9-]{8,70}$/.test(item.id) &&
    typeof item.name === "string" && item.name.trim().length > 0 &&
    item.name.length <= 48 && Boolean(base) && item.sourcePath === base?.sourcePath &&
    item.sourceSha === base?.sourceSha && validPalette(item.palette);
}

export function readCustomThemes(): Theme[] {
  try {
    const value = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (!value || value.length > MAX_STORAGE_CHARS) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length > MAX_CUSTOM_THEMES) return [];
    const seen = new Set<string>();
    return parsed.filter((item): item is Theme => {
      if (!validCustomTheme(item) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch {
    return [];
  }
}

/** Store *before* updating React state: failed/quota writes must never look saved. */
export function writeCustomThemes(themes: readonly Theme[]): void {
  if (themes.length > MAX_CUSTOM_THEMES ||
      themes.some((item) => !validCustomTheme(item)) ||
      new Set(themes.map((item) => item.id)).size !== themes.length) {
    throw new Error("Coleção de temas inválida ou limite de 12 cópias alcançado.");
  }
  const serialized = JSON.stringify(themes);
  if (serialized.length > MAX_STORAGE_CHARS) throw new Error("Armazenamento de temas excedeu o limite seguro.");
  try {
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, serialized);
  } catch {
    throw new Error("Não foi possível salvar neste navegador. Verifique espaço ou permissões.");
  }
}

function newCustomId(existing: readonly Theme[]): string {
  for (let i = 0; i < 8; i++) {
    const id = "custom-" + (globalThis.crypto?.randomUUID?.() ??
      (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 13)));
    if (!existing.some((item) => item.id === id)) return id;
  }
  throw new Error("Não foi possível criar identificador único para o tema.");
}

export function duplicateTheme(base: Theme, existing: readonly Theme[]): Theme {
  if (existing.length >= MAX_CUSTOM_THEMES) throw new Error("Limite de 12 temas personalizados alcançado.");
  const sourceId = base.kind === "official" ? base.id : base.basedOnThemeId;
  const official = sourceId ? officialTheme(sourceId) : null;
  if (!official) throw new Error("Tema de origem inválido.");
  return {
    id: newCustomId(existing), name: (base.name + " · Minha versão").slice(0, 48),
    kind: "custom", basedOnThemeId: official.id,
    sourcePath: official.sourcePath, sourceSha: official.sourceSha,
    palette: { ...base.palette }, schemaVersion: 1,
  } as Theme;
}

export function updateCustomTheme(base: Theme, name: string, palette: ThemePalette): Theme {
  const trimmed = name.trim();
  if (!validCustomTheme(base) || !trimmed || trimmed.length > 48) {
    throw new Error("Escolha um nome de 1 a 48 caracteres para a sua cópia.");
  }
  if (!validPalette(palette)) throw new Error("Todas as cores precisam ser valores hexadecimais válidos.");
  return { ...base, name: trimmed, palette: { ...palette } };
}

interface AppliedSnapshot {
  schemaVersion: 1;
  id: string;
  name: string;
  palette: ThemePalette;
}

export function readAppliedTheme(customThemes: readonly Theme[], id: string): Theme | null {
  const current = customThemes.find((theme) => theme.id === id);
  if (!current) return null;
  try {
    const serialized = localStorage.getItem(APPLIED_CUSTOM_SNAPSHOT_KEY);
    if (!serialized || serialized.length > 4000) return current;
    const snapshot: AppliedSnapshot = JSON.parse(serialized) as AppliedSnapshot;
    if (snapshot.schemaVersion !== 1 || snapshot.id !== id ||
        !validPalette(snapshot.palette) || typeof snapshot.name !== "string" ||
        snapshot.name.length > 48) return current;
    return { ...current, name: snapshot.name, palette: { ...snapshot.palette } };
  } catch { return current; }
}

/** The global applied snapshot is independent from editing/saving a draft. */
export function storeAppliedTheme(theme: Theme): void {
  try {
    if (theme.kind === "custom") {
      localStorage.setItem(APPLIED_CUSTOM_SNAPSHOT_KEY, JSON.stringify({
        schemaVersion: 1, id: theme.id, name: theme.name, palette: theme.palette,
      } satisfies AppliedSnapshot));
    } else {
      localStorage.removeItem(APPLIED_CUSTOM_SNAPSHOT_KEY);
    }
  } catch {
    // The palette still updates for this session. Stored theme data stays intact.
  }
}
