import { validatePublishedLayouts, type SanitizedDesktopLayouts } from "./quickshellLayoutImport";

export const WIDGET_LAYOUT_STORAGE_KEY = "portfolio.hyprland.sanitized.layout.v1";
export const WIDGET_LAYOUT_CHANGED = "portfolio-hyprland-layout-changed";

export function readLocalWidgetLayouts(): SanitizedDesktopLayouts | null {
  try {
    const value = window.localStorage.getItem(WIDGET_LAYOUT_STORAGE_KEY);
    return value ? validatePublishedLayouts(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}
