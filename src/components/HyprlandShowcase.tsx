import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { GALLERY_THEMES, THEME_SHELF_MEDIA, type GalleryTheme, type ShelfThemeId } from "../config/themeShelfMedia";
import { ThemeCdShelf } from "./ThemeCdShelf";
import "../styles/preset-theme-gallery.css";

/** Show only the selected CD's image or video, without desktop widgets. */
function ThemeMediaPreview({ theme }: { theme: GalleryTheme }) {
  const media = THEME_SHELF_MEDIA[theme.id as ShelfThemeId];
  const [failed, setFailed] = useState(false);
  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  return (
    <div className="preset-desktop-scene preset-media-only"
      aria-label={"Mídia de " + theme.name}>
      {media?.video && !failed ? (
        <video className="preset-media-wallpaper" src={media.video}
          poster={media.poster || media.cover || undefined}
          autoPlay={!reducedMotion} muted loop playsInline preload="metadata"
          aria-label={"Vídeo de " + theme.name}
          onError={() => setFailed(true)} />
      ) : media?.cover && !failed ? (
        <img className="preset-media-wallpaper" src={media.cover}
          alt={"Imagem de " + theme.name} decoding="async"
          onError={() => setFailed(true)} />
      ) : (
        <div className="preset-media-fallback"
          aria-label={"Mídia indisponível para " + theme.name} />
      )}
    </div>
  );
}

export function HyprlandShowcase({
  themes = GALLERY_THEMES, selectedId = "changli", onChoose, accentColor = null,
}: {
  themes?: readonly GalleryTheme[];
  selectedId?: string;
  onChoose?: (theme: GalleryTheme) => void;
  accentColor?: string | null;
  active?: boolean;
}) {
  const approvedThemes = useMemo(
    () => themes, [themes],
  );
  const [id, setId] = useState(selectedId);
  const [format, setFormat] = useState<"ultrawide" | "standard">("ultrawide");
  const theme = approvedThemes.find((candidate) => candidate.id === id) ?? GALLERY_THEMES[0];
  const chosenMedia = THEME_SHELF_MEDIA[theme.id as ShelfThemeId];

  useEffect(() => {
    setId(selectedId);
  }, [selectedId]);

  const switchTo = (next: GalleryTheme) => {
    if (next.id === id) return;
    setId(next.id);
    onChoose?.(next);
  };

  return (
    <div className="preset-theme-gallery" aria-label="Galeria de temas Hyprland prontos">
      <div className="preset-gallery-intro">
        <span className="preset-eyebrow"><span aria-hidden="true">01</span> / ESCOLHA SEU UNIVERSO</span>
        <span className="preset-gallery-status">
          {approvedThemes.length.toString().padStart(2, "0")} TEMAS DISPONÍVEIS
        </span>
      </div>

      <ThemeCdShelf themes={approvedThemes} selectedId={theme.id} onChoose={switchTo} />

      <div className="preset-view-toolbar">
        <span className="preset-theme-label">
          <i aria-hidden="true" /><strong>{theme.name}</strong>
          <span className="preset-theme-divider" aria-hidden="true">/</span>
          <span>{chosenMedia?.video ? "Vídeo" : "Imagem"}</span>
        </span>
        <div role="group" aria-label="Proporção da prévia">
          <button type="button" aria-pressed={format === "ultrawide"}
            onClick={() => setFormat("ultrawide")}>21:9</button>
          <button type="button" aria-pressed={format === "standard"}
            onClick={() => setFormat("standard")}>16:9</button>
        </div>
      </div>

      <div className={"preset-stage preset-stage-" + format}
        style={{ "--stage-accent": accentColor ?? theme.palette.accentPrimary } as CSSProperties}
        aria-label={"Prévia de mídia: " + theme.name}>
        <ThemeMediaPreview key={theme.id} theme={theme} />
      </div>

      <div className="preset-gallery-foot">
        <div>
          <strong>{theme.name} <span aria-hidden="true">·</span> {chosenMedia?.video ? "Vídeo" : "Imagem"}</strong>
          <p>A mídia do tema selecionado ocupa toda a prévia, sem widgets nem elementos sobrepostos.</p>
        </div>
      </div>
    </div>
  );
}
