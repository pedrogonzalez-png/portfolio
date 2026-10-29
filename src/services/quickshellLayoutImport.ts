/**
 * Sanitized, display-only projection of the owner's Quickshell
 * WallpaperLayouts.qml JsonAdapter. We NEVER retain paths, text, notes,
 * media files, system info or the source file itself. Import is local only.
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
  x: number;
  y: number;
  width: number;
  height: number;
};
export type SanitizedProfile = {
  themeId: string;
  widgets: WidgetPlacement[];
};
export type SanitizedDesktopLayouts = {
  schemaVersion: 1;
  source: "sanitized-quickshell";
  profiles: SanitizedProfile[];
};
const kindSet = new Set<string>(WIDGET_KINDS);
const themeNames = ["changli", "hiyuki", "hsin", "emilia", "furina", "hotline-miami"];
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const reasonable = (n: unknown): n is number => typeof n === "number" &&
  Number.isFinite(n) && n >= -6000 && n <= 6000;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function themeForFile(path: string): string | null {
  const file = path.replaceAll("\\", "/").split("/").pop()?.toLowerCase() ?? "";
  const basename = file.replace(/\.(?:mp4|webm|mov|png|jpg|jpeg|webp)$/i, "");
  if (basename.includes("changli")) return "changli";
  if (basename.includes("hiyuki") || basename.includes("hutuki")) return "hiyuki";
  if (basename.includes("hsin")) return "hsin";
  if (basename.includes("emilia")) return "emilia";
  if (basename.includes("furina")) return "furina";
  if (basename.includes("hotline")) return "hotline-miami";
  return null;
}

/**
 * Parses the REAL wallpaper_widget_layouts.json from end4-pC. Positions in
 * Quickshell are pixels, relative to the source desktop, not percentages.
 * Assumes the owner's 3440x1440 monitor for display projection; the original
 * file does not record monitor resolution. The site does not publish raw paths.
 */
export function sanitizeQuickshellProfiles(json: unknown): SanitizedDesktopLayouts {
  if (!isObject(json) || !isObject(json.profiles)) {
    throw new Error("O arquivo precisa conter profiles do wallpaper_widget_layouts.json.");
  }
  const result = new Map<string, WidgetPlacement[]>();
  let files = 0;
  for (const [path, raw] of Object.entries(json.profiles)) {
    if (++files > 100) throw new Error("Quantidade de perfis excede o limite de segurança.");
    if (!isObject(raw)) continue;
    const theme = themeForFile(path);
    if (!theme) continue;
    const widgets: WidgetPlacement[] = [];
    for (const kind of WIDGET_KINDS) {
      const value = raw[kind];
      if (!isObject(value) || value.enable !== true) continue;
      if (!reasonable(value.x) || !reasonable(value.y)) continue;
      const width = reasonable(value.cardWidth) ? value.cardWidth :
        reasonable(value.width) ? value.width : kind.startsWith("imageCard") ? 276 : 260;
      const height = reasonable(value.cardHeight) ? value.cardHeight :
        reasonable(value.height) ? value.height : kind === "clock" ? 140 : 125;
      widgets.push({
        kind,
        x: clamp(value.x / 3440 * 100, 0, 96),
        y: clamp(value.y / 1440 * 100, 0, 91),
        width: clamp(width / 3440 * 100, 4, 28),
        height: clamp(height / 1440 * 100, 7, 34),
      });
    }
    result.set(theme, widgets);
  }
  if (!result.size) throw new Error("Nenhum perfil de tema conhecido foi encontrado. Confira o arquivo QML.");
  return {
    schemaVersion: 1,
    source: "sanitized-quickshell",
    profiles: Array.from(result, ([themeId, widgets]) => ({ themeId, widgets })),
  };
}

/** Published version has NO paths or private content, just geometry. */
export function validatePublishedLayouts(value: unknown): SanitizedDesktopLayouts {
  if (!isObject(value) || value.schemaVersion !== 1 ||
    value.source !== "sanitized-quickshell" || !Array.isArray(value.profiles) ||
    value.profiles.length > themeNames.length) {
    throw new Error("Snapshot público inválido.");
  }
  const seen = new Set<string>();
  const profiles: SanitizedProfile[] = [];
  for (const p of value.profiles) {
    if (!isObject(p) || typeof p.themeId !== "string" ||
      !themeNames.includes(p.themeId) || seen.has(p.themeId) ||
      !Array.isArray(p.widgets) || p.widgets.length > 30) {
      throw new Error("Perfil público inválido.");
    }
    seen.add(p.themeId);
    const widgets: WidgetPlacement[] = [];
    for (const raw of p.widgets) {
      if (!isObject(raw) || typeof raw.kind !== "string" || !kindSet.has(raw.kind) ||
        ![raw.x,raw.y,raw.width,raw.height].every((n) => typeof n === "number" && Number.isFinite(n)) ||
        (raw.x as number) < 0 || (raw.x as number) > 100 ||
        (raw.y as number) < 0 || (raw.y as number) > 100 ||
        (raw.width as number) < 0 || (raw.width as number) > 40 ||
        (raw.height as number) < 0 || (raw.height as number) > 40) {
        throw new Error("Geometria de widget inválida.");
      }
      widgets.push({
        kind: raw.kind as WidgetKind,
        x: raw.x as number, y: raw.y as number,
        width: raw.width as number, height: raw.height as number,
      });
    }
    profiles.push({ themeId:p.themeId, widgets });
  }
  return { schemaVersion:1, source:"sanitized-quickshell", profiles };
}
