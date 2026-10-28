import { useEffect, useRef, useState } from "react";
import { useTheme } from "../stores/themeContext";
import { officialTheme } from "../stores/themes";
import "../styles/theme-studio.css";

/** M4 gallery. No wallpapers, unsanctioned assets or QML widgets. */
export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, availableThemes } = useTheme();
  const [previewId, setPreviewId] = useState(theme.id);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const selected = officialTheme(previewId) ?? theme;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const buttons = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not([disabled])"))
        .filter((element) => element.getClientRects().length > 0);
      if (!buttons.length) return;
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault(); buttons[buttons.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
        event.preventDefault(); buttons[0].focus();
      }
    };
    const contain = (event: FocusEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) closeRef.current?.focus();
    };
    window.addEventListener("keydown", keys);
    document.addEventListener("focusin", contain);
    return () => {
      window.removeEventListener("keydown", keys);
      document.removeEventListener("focusin", contain);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="theme-studio-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div ref={dialogRef} className="theme-studio-dialog" role="dialog"
        aria-modal="true" aria-labelledby="theme-studio-title" aria-describedby="theme-studio-description">
        <header className="theme-studio-header">
          <div>
            <p className="theme-studio-kicker">04 / COLOR ENGINE · HYPRLAND-THEMES</p>
            <h2 id="theme-studio-title">THEME <em>STUDIO.</em></h2>
            <p id="theme-studio-description">Escolha uma paleta oficial. A prévia só muda o site quando você clicar em Aplicar.</p>
          </div>
          <button ref={closeRef} type="button" className="theme-studio-close"
            onClick={onClose} aria-label="Fechar Theme Studio">✕</button>
        </header>
        <div className="theme-studio-gallery" role="group" aria-label="Cinco temas oficiais">
          {availableThemes.map((candidate, index) => (
            <button key={candidate.id} type="button"
              className={"theme-studio-option" + (previewId === candidate.id ? " is-preview" : "")}
              aria-pressed={previewId === candidate.id}
              onClick={() => setPreviewId(candidate.id)}
              style={{ backgroundColor: candidate.palette.surface,
                color: candidate.palette.text,
                borderColor: previewId === candidate.id ? candidate.palette.accentPrimary : "transparent" }}>
              <span className="theme-option-index">0{index + 1} / OFICIAL</span>
              <span className="theme-option-mini" aria-hidden="true">
                <span style={{ background: candidate.palette.surfaceContainer }}>
                  <span className="theme-option-bubble" style={{ background: candidate.palette.accentPrimary }} />
                  <span className="theme-option-bar" style={{ background: candidate.palette.accentRed }} />
                  <span className="theme-option-bar small" style={{ background: candidate.palette.accentYellow }} />
                </span>
              </span>
              <span className="theme-option-name">{candidate.name}</span>
              <span className="theme-option-swatches" aria-hidden="true">
                {[candidate.palette.accentPrimary, candidate.palette.accentRed,
                  candidate.palette.accentYellow, candidate.palette.text].map((color, i) =>
                  <span key={i} style={{ backgroundColor: color }}/>)}
              </span>
              {theme.id === candidate.id && <span className="theme-option-applied">ATIVO</span>}
            </button>
          ))}
        </div>
        <div className="theme-studio-preview" style={{
          background: "linear-gradient(130deg," + selected.palette.bg + "," + selected.palette.surfaceContainer + ")",
          color: selected.palette.text, borderColor: selected.palette.outline }}>
          <div className="theme-preview-info">
            <span>PRÉVIA · {selected.name.toUpperCase()}</span>
            <strong>Seu espaço. Suas cores.</strong>
            <p style={{ color: selected.palette.textVariant }}>A paleta altera o portfólio. Wallpaper e posições dos cards continuam iguais.</p>
          </div>
          <div className="theme-preview-desktop" aria-hidden="true">
            <div className="theme-preview-topbar" style={{ background: selected.palette.surfaceContainerHigh }}>
              <span>⌘</span><span>12:45</span>
            </div>
            <div className="theme-preview-panels">
              <div className="theme-preview-window" style={{ background: selected.palette.surface, borderColor: selected.palette.outline }}>
                <span style={{ background: selected.palette.accentPrimary }} />
                <span style={{ background: selected.palette.accentRed }} />
                <span style={{ background: selected.palette.accentYellow }} />
              </div>
              <div className="theme-preview-orbit" style={{ borderColor: selected.palette.accentPrimary }}>
                <span style={{ background: selected.palette.accentYellow }} />
              </div>
            </div>
            <div className="theme-preview-dock" style={{ background: selected.palette.surfaceContainerHigh }}>
              {[selected.palette.accentPrimary, selected.palette.accentRed, selected.palette.accentYellow].map((color,i) =>
                <span key={i} style={{ background: color }} />)}
            </div>
          </div>
        </div>
        <footer className="theme-studio-footer">
          <div className="theme-studio-disclaimer">
            <strong>{selected.name} · tema oficial imutável</strong>
            <span>Paletas do Hyprland-Themes. Criar temas próprios, wallpapers e widgets chega em etapas seguintes.</span>
          </div>
          <div className="theme-studio-actions">
            <button type="button" className="theme-studio-secondary" onClick={() => setPreviewId(theme.id)}>Restaurar prévia</button>
            <button type="button" className="theme-studio-apply" disabled={selected.id === theme.id}
              onClick={() => setTheme(selected.id)}>
              {selected.id === theme.id ? "Paleta já aplicada" : "Aplicar " + selected.name}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
