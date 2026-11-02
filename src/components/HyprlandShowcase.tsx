import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { GALLERY_THEMES, THEME_SHELF_MEDIA, galleryCssTokens, type GalleryTheme, type ShelfThemeId } from "../config/themeShelfMedia";
import { ThemeCdShelf } from "./ThemeCdShelf";
import { useCompactPlayback } from "../hooks/useCompactPlayback";
import "../styles/preset-theme-gallery.css";

/** The large preview is the ONLY moving video on compact/touch devices. */
function ThemeMediaPreview({ theme }: { theme: GalleryTheme }) {
  const media = THEME_SHELF_MEDIA[theme.id as ShelfThemeId];
  const compact = useCompactPlayback();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(!compact);
  const [playing, setPlaying] = useState(false);
  const [tapRequired, setTapRequired] = useState(false);
  const [failed, setFailed] = useState(false);
  const [originalFallback, setOriginalFallback] = useState(false);
  const [retry, setRetry] = useState(0);
  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const poster = media?.poster || media?.cover || "";
  const videoSource = compact && media?.mobileVideo && !originalFallback
    ? media.mobileVideo : media?.video || "";
  const shouldLoadVideo = !compact || near;

  useEffect(() => {
    if (!compact || !media?.video) {
      setNear(true);
      return;
    }
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setNear(Boolean(entry?.isIntersecting));
    }, { rootMargin: "180px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [compact, media?.video]);

  useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current || failed || prefersReducedMotion) return;
    const video = videoRef.current;
    try {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        void attempt.catch((error: {name?: string}) => {
          if (error?.name === "NotAllowedError") setTapRequired(true);
        });
      }
    } catch {
      setTapRequired(true);
    }
  }, [videoSource, shouldLoadVideo, failed, retry, prefersReducedMotion]);

  const onVideoError = () => {
    setPlaying(false);
    // Mobile files are preferred, but older deployments may not have them yet.
    if (compact && media?.mobileVideo && !originalFallback) {
      setOriginalFallback(true);
    } else {
      setFailed(true);
    }
  };

  const retryPlayback = () => {
    if (failed) {
      setFailed(false);
      setOriginalFallback(false);
      setPlaying(false);
      setRetry(value => value + 1);
      setTapRequired(false);
      return;
    }
    const attempt = videoRef.current?.play();
    if (attempt && typeof attempt.then === "function") {
      void attempt.then(() => setTapRequired(false)).catch(() => setTapRequired(true));
    }
  };

  return (
    <div ref={containerRef} className="preset-desktop-scene preset-media-only"
      aria-label={"Mídia de " + theme.name}>
      {media?.video ? (
        <>
          {/* Keep a real JPEG frame visible while mobile video is fetching,
              waiting for user gesture, or falling back to the original MP4. */}
          {poster && <img src={poster} alt="" className="preset-media-wallpaper"
            aria-hidden="true" decoding="async" />}
          {!poster && <div className="preset-media-fallback" aria-hidden="true" />}
          {shouldLoadVideo && !failed && (
            <video key={videoSource + retry} ref={videoRef}
              className={"preset-media-wallpaper preset-media-player" + (playing ? " is-playing" : "")}
              src={videoSource} poster={poster || undefined}
              autoPlay={!prefersReducedMotion}
              muted loop playsInline preload={compact ? "metadata" : "auto"}
              aria-label={"Vídeo de " + theme.name}
              onPlaying={() => { setPlaying(true); setTapRequired(false); }}
              onPause={() => setPlaying(false)}
              onError={onVideoError} />
          )}
          {compact && (tapRequired || failed || (prefersReducedMotion && !playing)) && (
            <button className="preset-media-play-retry" type="button"
              onClick={retryPlayback}>
              {failed ? "Tentar carregar o vídeo" : "Reproduzir vídeo"}
            </button>
          )}
        </>
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
  const theme = approvedThemes.find((candidate) => candidate.id === id) ?? GALLERY_THEMES[0];
  const chosenMedia = THEME_SHELF_MEDIA[theme.id as ShelfThemeId];
  // Scope every color token to this gallery: changing CDs does not change
  // the portfolio's global theme or other pages.
  const galleryStyle = galleryCssTokens(theme.id as ShelfThemeId) as CSSProperties;

  useEffect(() => {
    setId(selectedId);
  }, [selectedId]);

  const switchTo = (next: GalleryTheme) => {
    if (next.id === id) return;
    setId(next.id);
    onChoose?.(next);
  };

  return (
    <div className="preset-theme-gallery" style={galleryStyle}
      aria-label="Galeria de temas Hyprland prontos">
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
      </div>

      <div className="preset-stage preset-stage-ultrawide"
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
