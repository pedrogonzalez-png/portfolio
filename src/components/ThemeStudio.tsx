import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES } from "../stores/themes";
import { HyprlandShowcase } from "./HyprlandShowcase";
import "../styles/preset-theme-studio.css";

/** A dedicated, read-only exhibition of finished Hyprland themes. */
export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const activeOfficial = OFFICIAL_THEMES.find(t => t.id === theme.id) ?? OFFICIAL_THEMES[0];

  return (
    <section id="theme-studio" className="preset-studio-inline"
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
          <p>Uma coleção dos temas que construí no Hyprland. Cinco identidades, cada uma com sua própria atmosfera.</p>
        </div>
      </header>

      <HyprlandShowcase themes={OFFICIAL_THEMES} selectedId={activeOfficial.id}
        onChoose={candidate => setTheme(candidate.id)}/>

    </section>
  );
}
