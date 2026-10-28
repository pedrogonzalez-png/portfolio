import { useState } from "react";
import type { ThemePalette } from "../stores/themes";

type DesktopPanel = "inicio" | "paleta" | "sobre";
type ScreenMode = "ultrawide" | "standard";

export function SimulatedDesktop({ palette, themeName }: {
  palette: ThemePalette; themeName: string;
}) {
  const [screenMode, setScreenMode] = useState<ScreenMode>("ultrawide");
  const [panel, setPanel] = useState<DesktopPanel>("inicio");
  const [portraitConfirmed, setPortraitConfirmed] = useState(false);
  const swatches = [
    ["Principal", palette.accentPrimary], ["Secundária", palette.accentRed],
    ["Destaque", palette.accentYellow], ["Superfície", palette.surface],
    ["Fundo", palette.bg], ["Texto", palette.text],
  ] as const;

  return (
    <section className="theme-desktop-section" aria-label="Desktop simulado">
      <header className="theme-desktop-controls">
        <div>
          <h3>Desktop simulado</h3>
          <p>Prévia 2D das cores e estrutura. Não é o seu Arch real nem executa Quickshell.</p>
        </div>
        <div className="theme-desktop-resolutions" role="group" aria-label="Formato da prévia">
          <button type="button" aria-pressed={screenMode === "ultrawide"}
            onClick={() => setScreenMode("ultrawide")}>3440 × 1440</button>
          <button type="button" aria-pressed={screenMode === "standard"}
            onClick={() => setScreenMode("standard")}>1920 × 1080</button>
        </div>
      </header>
      {!portraitConfirmed && (
        <div className="theme-desktop-portrait-note">
          <p>Para uma melhor experiência, recomendamos usar o celular na horizontal. A edição com ele em pé não é recomendada.</p>
          <button type="button" onClick={() => setPortraitConfirmed(true)}>Continuar assim mesmo</button>
        </div>
      )}
      <div className="theme-desktop-scroll">
        <div className={"theme-desktop-canvas theme-desktop-" + screenMode}
          style={{
            backgroundColor: palette.bg, color: palette.text,
            backgroundImage: "radial-gradient(ellipse at 74% 33%, " +
              palette.accentPrimary + "48, transparent 40%), radial-gradient(ellipse at 22% 73%, " +
              palette.accentRed + "28, transparent 47%)",
          }}>
          <div className="theme-desktop-bar"
            style={{ backgroundColor: palette.surfaceContainerHigh, borderColor: palette.outline }}>
            <span className="theme-desktop-mark" style={{ color: palette.accentYellow }}>◈</span>
            <span>ARCH · HYPRLAND / VISUALIZAÇÃO</span>
            <span className="theme-desktop-bar-right">THEME / {themeName}</span>
          </div>

          <div className="theme-desktop-content">
            <nav className="theme-desktop-side"
              aria-label="Navegação do desktop simulado"
              style={{ backgroundColor: palette.surfaceContainer, borderColor: palette.outline }}>
              {([
                ["inicio", "Visão geral"],
                ["paleta", "Paleta"],
                ["sobre", "Sobre"],
              ] as const).map(([id, label]) => (
                <button type="button" key={id} aria-pressed={panel === id}
                  onClick={() => setPanel(id)}
                  style={panel === id ? { backgroundColor: palette.accentPrimary, color: palette.bg } : undefined}>
                  {label}
                </button>
              ))}
            </nav>
            <div className="theme-desktop-window" role="group"
              aria-label={"Janela de prévia: " + (panel === "inicio" ? "Visão geral" : panel === "paleta" ? "Paleta" : "Sobre")}
              style={{ backgroundColor: palette.surface, borderColor: palette.outline }}>
              <div className="theme-desktop-window-title"
                style={{ borderColor: palette.outline }}>
                <span className="theme-desktop-window-dot" style={{ backgroundColor: palette.accentRed }} />
                <span>{panel === "inicio" ? "VISÃO GERAL" : panel === "paleta" ? "CORES DO TEMA" : "SOBRE A PRÉVIA"}</span>
              </div>
              {panel === "inicio" && (
                <div className="theme-desktop-overview">
                  <div className="theme-desktop-hero"
                    style={{ background: palette.surfaceContainer, borderColor: palette.outline }}>
                    <span style={{ color: palette.accentYellow }}>THEME STUDIO / PREVIEW</span>
                    <strong>{themeName}</strong>
                    <p style={{ color: palette.textVariant }}>Uma simulação de desktop com estrutura de barra, painéis e dock.</p>
                  </div>
                  <div className="theme-desktop-tiles" aria-hidden="true">
                    {[palette.accentPrimary, palette.accentRed, palette.accentYellow].map((color, index) =>
                      <div key={index} style={{
                        background: palette.surfaceContainer,
                        border: "1px solid " + palette.outline,
                      }}>
                        <span style={{ backgroundColor: color }} />
                        <i style={{ backgroundColor: palette.textVariant }} />
                      </div>)}
                  </div>
                </div>
              )}
              {panel === "paleta" && (
                <div className="theme-desktop-swatch-grid">
                  {swatches.map(([label, color]) =>
                    <div key={label}>
                      <span style={{ backgroundColor: color }} />
                      <strong>{label}</strong><code>{color}</code>
                    </div>)}
                </div>
              )}
              {panel === "sobre" && (
                <div className="theme-desktop-about">
                  <strong>Uma base para o futuro editor</strong>
                  <p>Esta visualização mostra apenas layout e paleta. Cards de personagens, widgets reais, wallpapers pessoais, arraste e salvamento de layouts ainda não estão implementados aqui.</p>
                  <p>Trocar as abas da prévia não modifica nem salva o seu tema.</p>
                </div>
              )}
            </div>
          </div>
          <div className="theme-desktop-dock" style={{
            backgroundColor: palette.surfaceContainerHigh,
            borderColor: palette.outline,
          }} aria-hidden="true">
            {[palette.accentPrimary,palette.accentRed,palette.accentYellow].map((color,i) =>
              <span key={i} style={{ backgroundColor: color }} />)}
          </div>
        </div>
      </div>
      <p className="theme-desktop-footnote">
        A visualização usa somente cores e formas CSS; sem imagens de terceiros, relógio ou indicadores de hardware fictícios.
      </p>
    </section>
  );
}
