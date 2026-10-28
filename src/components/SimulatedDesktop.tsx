import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DesktopClockWidget } from "./desktop/DesktopClockWidget";
import { DesktopCharacterCard } from "./desktop/DesktopCharacterCard";
import { DesktopMovable } from "./desktop/DesktopMovable";
import {
  isSupportedCardImage, MAX_SESSION_CARDS, type DesktopImageCard, type DesktopPosition,
} from "../services/desktopElements";
import type { ThemePalette } from "../stores/themes";

type DesktopPanel = "inicio" | "paleta" | "sobre";
type ScreenMode = "ultrawide" | "standard";

export function SimulatedDesktop({ palette, themeName }: {
  palette: ThemePalette; themeName: string;
}) {
  const [screenMode, setScreenMode] = useState<ScreenMode>("ultrawide");
  const [panel, setPanel] = useState<DesktopPanel>("inicio");
  const [portraitConfirmed, setPortraitConfirmed] = useState(false);
  const [clockVisible, setClockVisible] = useState(false);
  const [clockPosition, setClockPosition] = useState<DesktopPosition>({ x: 62, y: 7 });
  const [cards, setCards] = useState<DesktopImageCard[]>([]);
  const [imageError, setImageError] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);
  const urlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Each imported image is local to this preview session.
    const owned = urlsRef.current;
    return () => { for (const url of owned) URL.revokeObjectURL(url); owned.clear(); };
  }, []);

  const onImportCards = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!incoming.length) return;
    const remaining = Math.max(0, MAX_SESSION_CARDS - cards.length);
    const accepted = incoming.filter(isSupportedCardImage).slice(0, remaining);
    const rejected = incoming.length - accepted.length;
    setImageError(rejected ? rejected + " imagem(ns) recusada(s). Use PNG, JPG ou WebP até 8 MB, no máximo " +
      MAX_SESSION_CARDS + " cards por sessão." : "");
    const created: DesktopImageCard[] = [];
    try {
      for (const file of accepted) {
        const url = URL.createObjectURL(file);
        urlsRef.current.add(url);
        const index = cards.length + created.length;
        created.push({
          id: "card-" + (globalThis.crypto?.randomUUID?.() ?? (Date.now() + "-" + index)),
          url, name: file.name,
          position: { x: 8 + (index % 4) * 15, y: 22 + (index % 3) * 16 },
        });
      }
      setCards((current) => [...current, ...created]);
    } catch {
      for (const card of created) {
        urlsRef.current.delete(card.url);
        URL.revokeObjectURL(card.url);
      }
      setImageError("Não foi possível abrir a imagem neste navegador.");
    }
  };

  const removeCard = (id: string) => {
    const card = cards.find((item) => item.id === id);
    if (!card) return;
    urlsRef.current.delete(card.url);
    URL.revokeObjectURL(card.url);
    setCards((current) => current.filter((item) => item.id !== id));
  };

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
      <div className="theme-desktop-element-tools" aria-label="Inserir elementos no desktop">
        <button type="button" onClick={() => setClockVisible((current) => !current)}>
          {clockVisible ? "Remover relógio" : "Adicionar relógio digital"}
        </button>
        <label className="theme-desktop-import">
          Importar card de personagem
          <input type="file" multiple accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            aria-label="Selecionar imagens para cards" onChange={onImportCards} />
        </label>
        <small>Widgets e cards são elementos diferentes. Mova arrastando a alça ou com as setas.</small>
      </div>
      {imageError && <p role="alert" className="theme-desktop-import-error">{imageError}</p>}
      <p className="theme-desktop-session-note">
        Prévia temporária: imagens e posições ainda não são salvas. Os arquivos nunca são enviados ao servidor.
      </p>
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
                  <p>Cards de personagens, widgets reais: agora esta prévia já permite importar imagens como cards independentes e usar um relógio digital com hora local. Wallpapers pessoais, mais widgets, layouts permanentes e agrupamentos ainda não estão implementados.</p>
                  <p>Trocar as abas da prévia não modifica nem salva o seu tema.</p>
                </div>
              )}
            </div>
          </div>
          <div className="theme-desktop-elements-layer" ref={areaRef}
            aria-label="Elementos posicionáveis do desktop simulado">
            {clockVisible && (
              <DesktopMovable position={clockPosition} onMove={setClockPosition}
                label="relógio digital" onRemove={() => setClockVisible(false)}
                areaRef={areaRef}>
                <DesktopClockWidget palette={palette} />
              </DesktopMovable>
            )}
            {cards.map((card) => (
              <DesktopMovable key={card.id} position={card.position}
                onMove={(position) => setCards((current) =>
                  current.map((item) => item.id === card.id ? { ...item, position } : item))}
                label={"card " + card.name} onRemove={() => removeCard(card.id)}
                areaRef={areaRef}>
                <DesktopCharacterCard name={card.name} url={card.url} palette={palette}/>
              </DesktopMovable>
            ))}
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
        Relógio com horário local real; cards usam somente imagens importadas neste navegador. Não há dados fictícios de hardware nem execução de QML.
      </p>
    </section>
  );
}
