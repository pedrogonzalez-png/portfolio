import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES } from "../stores/themes";
import { GALLERY_THEMES, galleryCssTokens, type ShelfThemeId } from "../config/themeShelfMedia";
import { HyprlandShowcase } from "./HyprlandShowcase";
import "../styles/preset-theme-studio.css";

/** Original five palettes remain global; additional media themes are local to the exhibition. */
export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const [selectedId, setSelectedId] = useState(theme.id);
  useEffect(() => setSelectedId(theme.id), [theme.id]);
  const studioStyle = galleryCssTokens(selectedId as ShelfThemeId) as CSSProperties;

  return (
    <section id="theme-studio" className="preset-studio-inline" style={studioStyle}
      aria-label="Exposição dos temas Hyprland">
      <header className="preset-studio-heading">
        <div className="preset-studio-topline">
          <span className="preset-studio-overline">
            <span className="preset-studio-index">04</span> / HYPRLAND THEMES
          </span>
          <button type="button" className="preset-studio-exit" onClick={onClose}>
            <span aria-hidden="true">←</span> Voltar aos projetos
          </button>
        </div>
        <div className="preset-studio-hero-copy">
          <span className="preset-studio-kicker">
            <span className="preset-studio-glow-dot" aria-hidden="true" />
            Coleção de desktops
          </span>
          <h1>Seu desktop, <em>outros universos.</em></h1>
          <p>Dez capas de vidro: selecione ou deslize para visualizar cada vídeo ou imagem em tamanho grande, sem widgets sobrepostos.</p>
        </div>
      </header>

      <HyprlandShowcase themes={GALLERY_THEMES} selectedId={selectedId}
        onChoose={candidate => {
          setSelectedId(candidate.id);
          if (OFFICIAL_THEMES.some(t => t.id === candidate.id)) {
            setTheme(candidate.id);
          }
        }}/>
    </section>
  );
}
