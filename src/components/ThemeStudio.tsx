import { useEffect, useRef, useState } from "react";
import { useTheme } from "../stores/themeContext";
import type { Theme, ThemePalette } from "../stores/themes";
import "../styles/theme-studio.css";

const EDITABLE_COLORS: { key: keyof ThemePalette; label: string }[] = [
  { key: "accentPrimary", label: "Cor principal" },
  { key: "accentRed", label: "Cor secundária" },
  { key: "accentYellow", label: "Cor de destaque" },
  { key: "bg", label: "Fundo" },
  { key: "surface", label: "Superfície" },
  { key: "text", label: "Texto" },
];

type Draft = { id: string; name: string; palette: ThemePalette };

function draftOf(theme: Theme): Draft {
  return { id: theme.id, name: theme.name, palette: { ...theme.palette } };
}
function sameColors(a: ThemePalette, b: ThemePalette): boolean {
  return Object.keys(a).every((key) => a[key as keyof ThemePalette] === b[key as keyof ThemePalette]);
}

/** M4 personal color editor, never writes to the five source JSON files. */
export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, availableThemes, createCustomTheme, saveCustomTheme } = useTheme();
  const [previewId, setPreviewId] = useState(theme.id);
  const [draft, setDraft] = useState<Draft | null>(theme.kind === "custom" ? draftOf(theme) : null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const selected = availableThemes.find((item) => item.id === previewId) ?? theme;
  const editing = selected.kind === "custom" && draft?.id === selected.id ? draft : null;
  const palette = editing?.palette ?? selected.palette;
  const editingName = editing?.name ?? selected.name;
  const dirty = Boolean(editing && (editing.name !== selected.name || !sameColors(editing.palette, selected.palette)));
  const alreadyApplied = theme.id === selected.id && theme.name === selected.name &&
    sameColors(theme.palette, selected.palette);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]),input:not([disabled]),a[href]',
    ) ?? []).filter((element) => element.getClientRects().length > 0);
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const nodes = focusable();
      if (!nodes.length) return;
      const target = document.activeElement;
      if (event.shiftKey && (target === nodes[0] || !dialogRef.current.contains(target))) {
        event.preventDefault(); nodes[nodes.length - 1].focus();
      } else if (!event.shiftKey && (target === nodes[nodes.length - 1] || !dialogRef.current.contains(target))) {
        event.preventDefault(); nodes[0].focus();
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

  const choose = (candidate: Theme) => {
    setPreviewId(candidate.id);
    setDraft(candidate.kind === "custom" ? draftOf(candidate) : null);
    setNotice("");
    setError("");
  };

  const clone = () => {
    setError("");
    try {
      const copy = createCustomTheme(selected.id);
      setPreviewId(copy.id);
      setDraft(draftOf(copy));
      setNotice("Cópia salva neste navegador. Agora personalize o nome e as cores!");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar a cópia.");
    }
  };

  const save = () => {
    if (!editing) return;
    setError("");
    try {
      const updated = saveCustomTheme(editing.id, editing.name, editing.palette);
      setDraft(draftOf(updated));
      setNotice("Tema personalizado salvo neste navegador. Clique em Aplicar para mudar o portfólio.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar o tema.");
    }
  };

  const apply = () => {
    if (dirty) {
      setError("Salve as alterações antes de aplicar a nova paleta.");
      return;
    }
    setError("");
    setTheme(selected.id);
    setNotice("Paleta " + selected.name + " aplicada ao portfólio!");
  };

  const renderOption = (candidate: Theme, index: number) => (
    <button key={candidate.id} type="button"
      className={"theme-studio-option" + (previewId === candidate.id ? " is-preview" : "")}
      aria-pressed={previewId === candidate.id} onClick={() => choose(candidate)}
      style={{
        backgroundColor: candidate.palette.surface, color: candidate.palette.text,
        borderColor: previewId === candidate.id ? candidate.palette.accentPrimary : "transparent",
      }}>
      <span className="theme-option-index">0{index + 1} / {candidate.kind === "official" ? "OFICIAL" : "MINHA CÓPIA"}</span>
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
          <span key={i} style={{ backgroundColor: color }} />)}
      </span>
      {theme.id === candidate.id && <span className="theme-option-applied">ATIVO</span>}
    </button>
  );

  return (
    <div className="theme-studio-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div ref={dialogRef} className="theme-studio-dialog" role="dialog" aria-modal="true"
        aria-labelledby="theme-studio-title" aria-describedby="theme-studio-description">
        <header className="theme-studio-header">
          <div>
            <p className="theme-studio-kicker">04 / COLOR ENGINE · HYPRLAND-THEMES</p>
            <h2 id="theme-studio-title">THEME <em>STUDIO.</em></h2>
            <p id="theme-studio-description">Escolha uma paleta, crie sua cópia e experimente à vontade. Só o botão Aplicar muda o site.</p>
          </div>
          <button ref={closeRef} type="button" className="theme-studio-close"
            onClick={onClose} aria-label="Fechar Theme Studio">✕</button>
        </header>

        <h3 className="theme-studio-section-title">Temas oficiais <span>originais protegidos</span></h3>
        <div className="theme-studio-gallery" role="group" aria-label="Cinco temas oficiais">
          {availableThemes.filter((item) => item.kind === "official").map(renderOption)}
        </div>

        {availableThemes.some((item) => item.kind === "custom") && (
          <>
            <h3 className="theme-studio-section-title">Minhas criações <span>salvas apenas neste navegador</span></h3>
            <div className="theme-studio-gallery theme-studio-gallery-custom"
              role="group" aria-label="Temas personalizados">
              {availableThemes.filter((item) => item.kind === "custom").map(renderOption)}
            </div>
          </>
        )}

        <div className="theme-studio-preview" style={{
          background: "linear-gradient(130deg," + palette.bg + "," + palette.surfaceContainer + ")",
          color: palette.text, borderColor: palette.outline }}>
          <div className="theme-preview-info">
            <span>PRÉVIA · {editingName.toUpperCase()}</span>
            <strong>Seu espaço. Suas cores.</strong>
            <p style={{ color: palette.textVariant }}>Esta prévia não altera o tema aplicado até você confirmar.</p>
          </div>
          <div className="theme-preview-desktop" aria-hidden="true">
            <div className="theme-preview-topbar" style={{ background: palette.surfaceContainerHigh }}>
              <span>⌘</span><span>12:45</span>
            </div>
            <div className="theme-preview-panels">
              <div className="theme-preview-window" style={{ background: palette.surface, borderColor: palette.outline }}>
                <span style={{ background: palette.accentPrimary }} />
                <span style={{ background: palette.accentRed }} />
                <span style={{ background: palette.accentYellow }} />
              </div>
              <div className="theme-preview-orbit" style={{ borderColor: palette.accentPrimary }}>
                <span style={{ background: palette.accentYellow }} />
              </div>
            </div>
            <div className="theme-preview-dock" style={{ background: palette.surfaceContainerHigh }}>
              {[palette.accentPrimary, palette.accentRed, palette.accentYellow].map((color,i) =>
                <span key={i} style={{ background: color }}/>)}
            </div>
          </div>
        </div>

        {editing && (
          <section className="theme-studio-editor" aria-label="Editar meu tema">
            <div className="theme-editor-heading">
              <h3>Personalizar minha cópia</h3>
              <span>{dirty ? "ALTERAÇÕES NÃO SALVAS" : "SALVO"}</span>
            </div>
            <label className="theme-editor-name">
              Nome do meu tema
              <input type="text" maxLength={48} value={editing.name}
                onChange={(event) => {
                  setDraft({ ...editing, name: event.target.value });
                  setNotice("");
                }} />
            </label>
            <div className="theme-color-grid">
              {EDITABLE_COLORS.map(({ key, label }) => (
                <label key={key} className="theme-color-control">
                  <span>{label}</span>
                  <span className="theme-color-input">
                    <input aria-label={label} type="color" value={editing.palette[key]}
                      onChange={(event) => {
                        setDraft({ ...editing, palette: { ...editing.palette, [key]: event.target.value } });
                        setNotice("");
                      }} />
                    <code>{editing.palette[key]}</code>
                  </span>
                </label>
              ))}
            </div>
            <button className="theme-studio-save" type="button" disabled={!dirty} onClick={save}>
              Salvar alterações
            </button>
          </section>
        )}

        <footer className="theme-studio-footer">
          <div className="theme-studio-disclaimer">
            <strong>{selected.name} · {selected.kind === "official" ? "oficial imutável" : "cópia pessoal"}</strong>
            <span>Duplicar e editar nunca altera os cinco originais. As criações estão apenas neste navegador;
              limpar os dados pode apagá-las. Faça backup quando a exportação estiver disponível.</span>
            {error && <p className="theme-studio-error" role="alert">{error}</p>}
            {notice && <p className="theme-studio-notice" role="status">{notice}</p>}
          </div>
          <div className="theme-studio-actions">
            <button type="button" className="theme-studio-secondary" onClick={clone}>
              Duplicar {selected.name}
            </button>
            <button type="button" className="theme-studio-secondary" onClick={() => choose(theme)}>
              Restaurar prévia
            </button>
            <button type="button" className="theme-studio-apply"
              disabled={dirty || alreadyApplied} onClick={apply}>
              {dirty ? "Salve antes de aplicar" : alreadyApplied ? "Paleta já aplicada" : "Aplicar " + selected.name}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
