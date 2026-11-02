import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { Theme } from "../stores/themes";
import { THEME_SHELF_MEDIA } from "../config/themeShelfMedia";
import type { OfficialShelfThemeId, ThemeShelfMedia } from "../config/themeShelfMedia";
import "../styles/theme-cd-shelf.css";

interface ShelfProps {
  themes: readonly Theme[];
  selectedId: string;
  onChoose: (theme: Theme) => void;
}

function ShelfCover({ media, selected, name }: {
  media: ThemeShelfMedia; selected: boolean; name: string;
}) {
  const [brokenCover, setBrokenCover] = useState(false);
  const [brokenVideo, setBrokenVideo] = useState(false);
  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  return (
    <span className="theme-cd-cover">
      <span className="theme-cd-artwork" aria-hidden="true">
        <span className="theme-cd-abstract">
          <span className="theme-cd-halo" />
          <span className="theme-cd-disc" />
          <span className="theme-cd-spark">✧</span>
        </span>
        {media.cover && !brokenCover && (
          <img src={media.cover} alt="" loading={selected ? "eager" : "lazy"}
            onError={() => setBrokenCover(true)} />
        )}
        {selected && media.video && !brokenVideo && (
          <video key={media.video} muted playsInline loop autoPlay={!prefersReducedMotion}
            preload="metadata" poster={media.poster || media.cover || undefined}
            aria-hidden="true" onError={() => setBrokenVideo(true)}>
            <source src={media.video} type="video/mp4" />
          </video>
        )}
      </span>
      <span className="theme-cd-empty-note" aria-hidden="true">
        {!media.cover && !media.video ? "INSIRA SUA CAPA / VÍDEO" : ""}
      </span>
      <span className="theme-cd-cover-title" aria-hidden="true">{name}</span>
    </span>
  );
}

/**
 * A physical-looking row of illuminated glass jewel cases, not a theme editor.
 * Selection still drives the published read-only Quickshell desktop below.
 */
export function ThemeCdShelf({ themes, selectedId, onChoose }: ShelfProps) {
  const count = themes.length;
  const activeIndex = Math.max(0, themes.findIndex((theme) => theme.id === selectedId));
  const active = themes[activeIndex];
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
  return (
    <section className="theme-cd-exhibition" aria-label="Estante de temas em vidro">
      <div className="theme-cd-topline">
        <span>ACERVO / 05 EDIÇÕES</span>
        <span>GLASS CASES · HYPRLAND</span>
      </div>
      <div className="theme-cd-stage" style={{
        "--cd-spotlight": active.palette.accentPrimary,
        "--cd-rim": active.palette.accentYellow,
      } as CSSProperties}>
        <div className="theme-cd-stage-grain" aria-hidden="true" />
        <div className="theme-cd-light-cone" aria-hidden="true" />
        <nav className="preset-theme-choices theme-cd-shelf"
          aria-label="Escolher tema pronto" onKeyDown={arrows}>
          {themes.map((theme, index) => {
            // Circular positions put two covers on each side of the selected CD.
            const slot = ((index - activeIndex + count + Math.floor(count / 2)) % count)
              - Math.floor(count / 2);
            const media = THEME_SHELF_MEDIA[theme.id as OfficialShelfThemeId] ??
              { cover: "", video: "", poster: "" };
            return (
              <button key={theme.id} type="button"
                className="theme-cd-case" data-cd-slot={slot}
                data-cd-active={slot === 0 ? "true" : "false"}
                aria-label={theme.name} aria-pressed={slot === 0}
                onClick={() => onChoose(theme)}
                style={{ "--cd-case-color": theme.palette.accentPrimary } as CSSProperties}>
                <span className="theme-cd-glass-frame">
                  <span className="theme-cd-spine" aria-hidden="true">{theme.name}</span>
                  <ShelfCover key={theme.id} media={media} selected={slot === 0} name={theme.name} />
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
          <small>Selecione uma caixa para ver o desktop publicado abaixo</small>
        </div>
        <button type="button" className="theme-cd-arrow" aria-label="Próximo tema"
          onClick={() => step(1)}><span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
