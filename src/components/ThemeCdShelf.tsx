import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, TouchEvent } from "react";
import { THEME_SHELF_MEDIA } from "../config/themeShelfMedia";
import type { GalleryTheme, ShelfThemeId, ThemeShelfMedia } from "../config/themeShelfMedia";
import { useCompactPlayback } from "../hooks/useCompactPlayback";
import "../styles/theme-cd-shelf.css";

interface ShelfProps {
  themes: readonly GalleryTheme[];
  selectedId: string;
  onChoose: (theme: GalleryTheme) => void;
}

/** All video covers are visible: unselected videos freeze on their first frame. */
function ShelfCover({ media, selected, name, compact }: {
  media: ThemeShelfMedia; selected: boolean; name: string; compact: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [brokenCover, setBrokenCover] = useState(false);
  const [brokenVideo, setBrokenVideo] = useState(false);
  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || compact) return;
    if (selected && !prefersReducedMotion) {
      try {
        const playing = video.play();
        if (playing && typeof playing.catch === "function") void playing.catch(() => {});
      } catch { /* Video playback can be blocked by the browser. */ }
    } else {
      try { video.pause(); } catch { /* Not supported in some test environments. */ }
    }
  }, [selected, prefersReducedMotion, media.video, compact]);

  return (
    <span className="theme-cd-cover">
      <span className="theme-cd-artwork" aria-hidden="true">
        <span className="theme-cd-abstract">
          <span className="theme-cd-halo" />
          <span className="theme-cd-disc" />
          <span className="theme-cd-spark">✧</span>
        </span>
        {(media.cover || media.poster) && !brokenCover && (
          <img src={media.cover || media.poster} alt=""
            loading={selected ? "eager" : "lazy"}
            onError={() => setBrokenCover(true)} />
        )}
        {/* Mobile: the real JPG frame IS the paused video cover. Don't stream
            every MP4 in the carousel while the large preview is loading. */}
        {!compact && media.video && !brokenVideo && (
          <video ref={videoRef} key={media.video} muted playsInline loop
            autoPlay={selected && !prefersReducedMotion} preload="metadata"
            poster={media.poster || media.cover || undefined} aria-hidden="true"
            onLoadedMetadata={(event) => {
              if (!selected) {
                try { event.currentTarget.currentTime = 0.08; } catch { /* Fallback artwork */ }
              }
            }}
            onError={() => setBrokenVideo(true)}>
            <source src={media.video} type="video/mp4" />
          </video>
        )}
      </span>
      <span className="theme-cd-empty-note" aria-hidden="true">
        {!media.cover && !media.video ? "MÍDIA INDISPONÍVEL" : ""}
      </span>
      <span className="theme-cd-cover-title" aria-hidden="true">{name}</span>
    </span>
  );
}

/**
 * A circular jewel-case exhibition. Mouse wheel and horizontal touch swipe
 * rotate the selection; keyboard arrows and explicit controls remain available.
 */
export function ThemeCdShelf({ themes, selectedId, onChoose }: ShelfProps) {
  const compact = useCompactPlayback();
  const stageRef = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClick = useRef(false);
  const count = themes.length;
  const activeIndex = Math.max(0, themes.findIndex(theme => theme.id === selectedId));
  const active = themes[activeIndex];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || count === 0) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 5) return;
      // Contain wheel navigation to the exhibition, not the entire webpage.
      event.preventDefault();
      const now = Date.now();
      if (now - lastWheel.current < 310) return;
      lastWheel.current = now;
      const direction = delta > 0 ? 1 : -1;
      onChoose(themes[(activeIndex + direction + count) % count]);
    };
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => stage.removeEventListener("wheel", wheel);
  }, [themes, count, activeIndex, onChoose]);

  if (!active) return null;

  const step = (direction: number) => {
    onChoose(themes[(activeIndex + direction + count) % count]);
  };
  const arrows = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    }
  };
  const touchBegin = (event: TouchEvent<HTMLElement>) => {
    const point = event.touches[0];
    touchStart.current = point ? { x: point.clientX, y: point.clientY ?? 0 } : null;
  };
  const touchFinish = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const end = event.changedTouches[0];
    const dx = (end?.clientX ?? start.x) - start.x;
    const dy = (end?.clientY ?? start.y) - start.y;
    // A diagonal or vertical swipe must scroll the mobile page, not change CDs.
    if (Math.abs(dx) < 42 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
    suppressNextClick.current = true;
    window.setTimeout(() => { suppressNextClick.current = false; }, 360);
    step(dx < 0 ? 1 : -1);
  };

  return (
    <section className="theme-cd-exhibition" aria-label="Estante de temas em vidro">
      <div className="theme-cd-topline">
        <span>ACERVO / {String(count).padStart(2, "0")} EDIÇÕES</span>
        <span>GLASS CASES · HYPRLAND</span>
      </div>
      <div ref={stageRef} className="theme-cd-stage"
        aria-label="Role o mouse ou arraste horizontalmente para mudar de CD"
        style={{
          "--cd-spotlight": active.palette.accentPrimary,
          "--cd-rim": active.palette.accentYellow,
        } as CSSProperties}>
        <div className="theme-cd-stage-grain" aria-hidden="true" />
        <div className="theme-cd-light-cone" aria-hidden="true" />
        <nav className="preset-theme-choices theme-cd-shelf"
          aria-label="Escolher tema pronto" onKeyDown={arrows}
          onTouchStart={touchBegin} onTouchEnd={touchFinish}
          onTouchCancel={() => { touchStart.current = null; }}>
          {themes.map((theme, index) => {
            const slot = ((index - activeIndex + count + Math.floor(count / 2)) % count)
              - Math.floor(count / 2);
            const hidden = Math.abs(slot) > 2;
            const media = THEME_SHELF_MEDIA[theme.id as ShelfThemeId] ??
              { cover: "", video: "", poster: "" };
            return (
              <button key={theme.id} type="button"
                className="theme-cd-case" data-cd-slot={slot}
                data-cd-hidden={hidden ? "true" : "false"}
                data-cd-active={slot === 0 ? "true" : "false"}
                aria-label={theme.name} aria-pressed={slot === 0}
                aria-hidden={hidden || undefined} tabIndex={hidden ? -1 : 0}
                onClick={() => {
                  if (suppressNextClick.current) { suppressNextClick.current = false; return; }
                  onChoose(theme);
                }}
                style={{ "--cd-case-color": theme.palette.accentPrimary } as CSSProperties}>
                <span className="theme-cd-glass-frame">
                  <span className="theme-cd-spine" aria-hidden="true">{theme.name}</span>
                  <ShelfCover key={theme.id} media={media} selected={slot === 0} name={theme.name} compact={compact} />
                  <span className="theme-cd-reflection" aria-hidden="true" />
                  <span className="theme-cd-case-corner" aria-hidden="true">✦</span>
                </span>
                <span className="theme-cd-case-shadow" aria-hidden="true" />
              </button>
            );
          })}
        </nav>
        <div className="theme-cd-shelf-plank" aria-hidden="true" />
        <div className="theme-cd-shelf-support" aria-hidden="true" />
        <div className="theme-cd-floor-light" aria-hidden="true" />
      </div>
      <div className="theme-cd-controls">
        <button type="button" className="theme-cd-arrow" aria-label="Tema anterior"
          onClick={() => step(-1)}><span aria-hidden="true">←</span></button>
        <div className="theme-cd-selection" role="status" aria-live="polite">
          <span>EDIÇÃO {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
          <strong>{active.name}</strong>
          <small>Roda do mouse, toque ou setas para navegar</small>
        </div>
        <button type="button" className="theme-cd-arrow" aria-label="Próximo tema"
          onClick={() => step(1)}><span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
