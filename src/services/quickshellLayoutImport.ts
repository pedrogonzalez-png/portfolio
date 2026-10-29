/**
 * Public, geometry-only projection of WallpaperLayouts.qml.
 * No original path, note, image, custom text or machine data is persisted.
 * Each original wallpaper has an independent variant; do not merge multiple
 * wallpapers of the same theme into one layout.
 */
export const WIDGET_KINDS = [
  "clock", "weather", "calendar", "worldClock", "media", "visualizer",
  "resources", "userCard", "todo", "notes", "timers", "images",
  "customImage", "imageCard", "imageCard2", "imageCard3", "imageCard4",
  "imageCard5", "imageCard6", "sticker", "customText",
] as const;
export type WidgetKind = typeof WIDGET_KINDS[number];
export type WidgetPlacement = {
  kind: WidgetKind;
  x: number; y: number; width: number; height: number;
  z?: number;
  sizeMode?: string;
  vertical?: boolean;
};
export type SanitizedProfile = {
  themeId: string;
  variantId?: string;
  label?: string;
  widgets: WidgetPlacement[];
};
export type SanitizedDesktopLayouts = {
  schemaVersion: 1;
  source: "sanitized-quickshell";
  profiles: SanitizedProfile[];
};

const validKinds = new Set<string>(WIDGET_KINDS);
const themes = ["changli", "hiyuki", "hsin", "emilia", "furina", "hotline-miami", "outros"];
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const numeric = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const range = (value: number, min: number, max: number) => Math.min(max, Math.max(min,value));
const normalized = (px: number, max: number) => Math.round(px / max * 1000000) / 10000;
const validMode = (v: unknown): v is string =>
  typeof v === "string" && /^[123]x[123]$/.test(v);

/** Use filenames ONLY during parsing. Never put them in published output. */
function themeForPath(path: string): string | null {
  const lower = path.replaceAll("\\", "/").toLowerCase();
  if (!/\.(?:mp4|webm|mov|png|jpe?g|webp)$/.test(lower)) return null;
  if (lower.includes("changli")) return "changli";
  if (lower.includes("hiyuki") || lower.includes("hutuki")) return "hiyuki";
  if (lower.includes("hsin")) return "hsin";
  if (lower.includes("emilia")) return "emilia";
  if (lower.includes("furina")) return "furina";
  if (lower.includes("hotline-miami")) return "hotline-miami";
  return "outros";
}

/** All pixel positions reference the owner's 3440x1440 monitor.
 *  Dimensions are exact ONLY for cards with cardWidth/cardHeight; other
 *  types rely on QML runtime sizeMode and display-only fallback dimensions.
 */
export function sanitizeQuickshellProfiles(json: unknown): SanitizedDesktopLayouts {
  if (!object(json) || !object(json.profiles)) {
    throw new Error("O arquivo precisa conter profiles do wallpaper_widget_layouts.json.");
  }
  const counts: Record<string,number> = {};
  const profiles: SanitizedProfile[] = [];
  let files = 0;
  for (const [path, raw] of Object.entries(json.profiles)) {
    if (++files > 100) throw new Error("Quantidade de perfis excede o limite de segurança.");
    if (!object(raw)) continue;
    const themeId = themeForPath(path);
    if (!themeId) continue;
    const number = counts[themeId] = (counts[themeId] ?? 0) + 1;
    const widgets: WidgetPlacement[] = [];

    for (const kind of WIDGET_KINDS) {
      const item = raw[kind];
      if (!object(item) || item.enable !== true ||
          !numeric(item.x) || !numeric(item.y) ||
          item.x < -6000 || item.x > 6000 || item.y < -6000 || item.y > 6000) continue;
      const isCard = kind.startsWith("imageCard");
      const widthPx = numeric(item.cardWidth) ? item.cardWidth :
        numeric(item.width) ? item.width :
        kind === "visualizer" && numeric(item.ringSize) ? item.ringSize :
        isCard ? 276 : 260;
      const heightPx = numeric(item.cardHeight) ? item.cardHeight :
        numeric(item.height) ? item.height : kind === "clock" ? 140 : 125;
      const widget: WidgetPlacement = {
        kind, x: normalized(item.x, 3440), y: normalized(item.y, 1440),
        width: range(normalized(widthPx, 3440), 4, 40),
        height: range(normalized(heightPx, 1440), 6, 100),
      };
      if (numeric(item.z) && Math.abs(item.z) <= 5000) widget.z = item.z;
      if (validMode(item.sizeMode)) widget.sizeMode = item.sizeMode;
      if (typeof item.vertical === "boolean") widget.vertical = item.vertical;
      widgets.push(widget);
    }
    profiles.push({
      themeId,
      variantId: themeId + "-" + number,
      label: themeId === "outros" ? "Wallpaper extra " + number : "Layout " + number,
      widgets,
    });
  }
  if (!profiles.length) throw new Error("Nenhum perfil de wallpaper reconhecido foi encontrado.");
  return { schemaVersion: 1, source: "sanitized-quickshell", profiles };
}

/** Refuse unknown keys/IDs, control chars, invalid coordinates and media paths. */
export function validatePublishedLayouts(value: unknown): SanitizedDesktopLayouts {
  if (!object(value) || value.schemaVersion !== 1 ||
      value.source !== "sanitized-quickshell" ||
      !Array.isArray(value.profiles) || value.profiles.length > 100) {
    throw new Error("Snapshot público inválido.");
  }
  const seen = new Set<string>();
  const profiles: SanitizedProfile[] = [];
  for (const record of value.profiles) {
    if (!object(record) || typeof record.themeId !== "string" ||
        !themes.includes(record.themeId) || !Array.isArray(record.widgets) ||
        record.widgets.length > 30) throw new Error("Perfil público inválido.");
    const variant = record.variantId;
    if (variant !== undefined &&
        (typeof variant !== "string" || !/^[a-z0-9-]{3,64}$/.test(variant))) {
      throw new Error("ID da variante inválido.");
    }
    const key = record.themeId + ":" + (variant ?? "default");
    if (seen.has(key)) throw new Error("Variante repetida.");
    seen.add(key);
    const label = record.label;
    if (label !== undefined &&
        (typeof label !== "string" || label.length > 40 ||
         !/^[A-Za-zÀ-ÿ0-9 -]+$/.test(label))) {
      throw new Error("Rótulo da variante inválido.");
    }
    const widgets: WidgetPlacement[] = [];
    const usedKinds = new Set<string>();
    for (const raw of record.widgets) {
      if (!object(raw) || typeof raw.kind !== "string" ||
          !validKinds.has(raw.kind) || usedKinds.has(raw.kind) ||
          ![raw.x,raw.y,raw.width,raw.height].every(numeric) ||
          (raw.x as number) < -10 || (raw.x as number) > 120 ||
          (raw.y as number) < -10 || (raw.y as number) > 120 ||
          (raw.width as number) < 4 || (raw.width as number) > 40 ||
          (raw.height as number) < 6 || (raw.height as number) > 100) {
        throw new Error("Geometria de widget inválida.");
      }
      usedKinds.add(raw.kind);
      const widget: WidgetPlacement = {
        kind: raw.kind as WidgetKind,
        x: raw.x as number, y: raw.y as number,
        width: raw.width as number, height: raw.height as number,
      };
      if (raw.z !== undefined) {
        if (!numeric(raw.z) || Math.abs(raw.z) > 5000) throw new Error("Camada inválida.");
        widget.z = raw.z;
      }
      if (raw.sizeMode !== undefined) {
        if (!validMode(raw.sizeMode)) throw new Error("Tamanho de QML inválido.");
        widget.sizeMode = raw.sizeMode;
      }
      if (raw.vertical !== undefined) {
        if (typeof raw.vertical !== "boolean") throw new Error("Orientação inválida.");
        widget.vertical = raw.vertical;
      }
      widgets.push(widget);
    }
    profiles.push({
      themeId: record.themeId,
      ...(typeof variant === "string" ? { variantId: variant } : {}),
      ...(typeof label === "string" ? { label } : {}),
      widgets,
    });
  }
  return { schemaVersion: 1, source: "sanitized-quickshell", profiles };
}
