import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES } from "../stores/themes";
import { HyprlandShowcase } from "./HyprlandShowcase";
import "../styles/preset-theme-studio.css";

/** Read-only exhibition of the author's finished themes.
 * No popup, custom themes, widget editor, imports or layout builder.
 * Only the accent color is visitor-configurable.
 */
export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const activeOfficial=OFFICIAL_THEMES.find(t=>t.id===theme.id)??OFFICIAL_THEMES[0];
  const accent=accentColor??activeOfficial.palette.accentPrimary;
  return (
    <section id="theme-studio" className="preset-studio-inline"
      aria-label="Exposição dos temas Hyprland">
      <header className="preset-studio-heading">
        <div>
          <span className="preset-studio-overline">04 / HYPRLAND THEMES · COLEÇÃO</span>
          <h2>Seu desktop, <em>outros universos.</em></h2>
          <p>Uma exposição dos temas completos que o autor construiu. Escolha o tema e acompanhe a transformação da cena.</p>
        </div>
        <button type="button" className="preset-studio-exit" onClick={onClose}>
          Voltar aos projetos <span aria-hidden="true">↗</span>
        </button>
      </header>
      <HyprlandShowcase themes={OFFICIAL_THEMES} selectedId={activeOfficial.id}
        onChoose={candidate => setTheme(candidate.id)} accentColor={accentColor}/>
      <div className="preset-color-only" aria-label="Personalizar somente a cor">
        <div>
          <strong>Um único detalhe seu: a cor.</strong>
          <p>Escolha a cor de destaque do portfólio. Os temas, widgets, wallpapers e suas posições originais não mudam.</p>
        </div>
        <div className="preset-color-control">
          <label htmlFor="preset-accent-color">Cor de destaque</label>
          <input id="preset-accent-color" type="color" value={accent}
            onChange={event=>setAccentColor(event.target.value)}/>
          <output htmlFor="preset-accent-color">{accent}</output>
          <button type="button" onClick={()=>setAccentColor(null)}
            disabled={!accentColor}>Restaurar cor original</button>
        </div>
      </div>
    </section>
  );
}
