import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES } from "../stores/themes";
import { HyprlandShowcase } from "./HyprlandShowcase";
import "../styles/preset-theme-studio.css";

/** A dedicated, read-only exhibition. Visitors choose a finished theme
 * and may override just its accent color; the desktops themselves stay intact.
 */
export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const activeOfficial = OFFICIAL_THEMES.find(t => t.id === theme.id) ?? OFFICIAL_THEMES[0];
  const accent = accentColor ?? activeOfficial.palette.accentPrimary;

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
          <h2>Seu desktop, <em>outros universos.</em></h2>
          <p>Uma coleção dos temas que construí no Hyprland. Cinco identidades, cada uma com sua própria atmosfera.</p>
        </div>
      </header>

      <HyprlandShowcase themes={OFFICIAL_THEMES} selectedId={activeOfficial.id}
        onChoose={candidate => setTheme(candidate.id)} accentColor={accentColor}/>

      <div className="preset-color-only" aria-label="Personalizar somente a cor">
        <div className="preset-color-copy">
          <span className="preset-color-eyebrow">PERSONALIZAÇÃO</span>
          <strong>Seu toque de cor.</strong>
          <p>Altere apenas a cor de destaque. Os temas, os wallpapers e os widgets permanecem originais.</p>
        </div>
        <div className="preset-color-control">
          <label htmlFor="preset-accent-color">Cor de destaque</label>
          <input id="preset-accent-color" type="color" value={accent}
            onChange={event => setAccentColor(event.target.value)}/>
          <output htmlFor="preset-accent-color">{accent.toUpperCase()}</output>
          <button type="button" onClick={() => setAccentColor(null)}
            disabled={!accentColor}>Restaurar cor original</button>
        </div>
      </div>
    </section>
  );
}
