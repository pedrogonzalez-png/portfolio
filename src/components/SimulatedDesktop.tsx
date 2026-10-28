import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DesktopClockWidget } from "./desktop/DesktopClockWidget";
import { DesktopCharacterCard } from "./desktop/DesktopCharacterCard";
import { DesktopMovable } from "./desktop/DesktopMovable";
import {
  isSupportedCardImage, MAX_SESSION_CARDS, type DesktopImageCard, type DesktopPosition,
} from "../services/desktopElements";
import type { ThemePalette } from "../stores/themes";
import {
  readDesktopLayout, writeDesktopLayout,
} from "../services/desktopPersistence";
import type { StoredDesktopLayout, DesktopScreenMode } from "../services/desktopPersistence";

type DesktopPanel = "inicio" | "paleta" | "sobre";


export function SimulatedDesktop({ palette, themeName }: {
  palette: ThemePalette; themeName: string;
}) {
  const [screenMode, setScreenMode] = useState<DesktopScreenMode>("ultrawide");
  const [panel, setPanel] = useState<DesktopPanel>("inicio");
  const [portraitConfirmed, setPortraitConfirmed] = useState(false);
  const [clockVisible, setClockVisible] = useState(false);
  const [clockPosition, setClockPosition] = useState<DesktopPosition>({ x: 62, y: 7 });
  const [cards, setCards] = useState<DesktopImageCard[]>([]);
  const [imageError, setImageError] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);
  const urlsRef = useRef<Set<string>>(new Set());
  const mediaRef = useRef<Map<string, Blob>>(new Map());
  const aliveRef = useRef(true);
  const editedRef = useRef(false);
  const revisionRef = useRef(0);
  const [storageBusy, setStorageBusy] = useState(false);
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState("Buscando organização salva no navegador...");

  const markEdited = () => {
    editedRef.current = true;
    revisionRef.current += 1;
    setStorageStatus("Alterações não salvas. Use Salvar organização para manter os elementos.");
  };

  const applySnapshot = (layout: StoredDesktopLayout) => {
    const created: DesktopImageCard[] = [];
    const media = new Map<string, Blob>();
    try {
      for (const card of layout.cards) {
        const url = URL.createObjectURL(card.image);
        created.push({ id: card.id, name: card.name, position: { ...card.position }, url });
        media.set(card.id, card.image);
      }
    } catch {
      for (const card of created) URL.revokeObjectURL(card.url);
      throw new Error("Não foi possível recuperar as imagens salvas.");
    }
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = new Set(created.map((card) => card.url));
    mediaRef.current = media;
    setCards(created);
    setClockVisible(layout.clockVisible);
    setClockPosition({ ...layout.clockPosition });
    setScreenMode(layout.screenMode);
    editedRef.current = false;
    revisionRef.current += 1;
    setImageError("");
    setStorageStatus("Organização recuperada do navegador.");
  };

  useEffect(() => {
    aliveRef.current = true;
    const restoreOnOpen = async () => {
      try {
        const layout = await readDesktopLayout();
        if (!aliveRef.current || editedRef.current) return;
        if (layout) applySnapshot(layout);
        else setStorageStatus("Nenhuma organização salva ainda. Monte o desktop e clique em Salvar.");
      } catch (cause) {
        if (aliveRef.current && !editedRef.current) {
          setStorageStatus(cause instanceof Error ? cause.message : "Armazenamento local indisponível.");
        }
      } finally {
        if (aliveRef.current) setStorageLoading(false);
      }
    };
    void restoreOnOpen();
    return () => {
      aliveRef.current = false;
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
      urlsRef.current.clear();
      mediaRef.current.clear();
    };
    // Restore only when the editor first opens. Explicit Restore handles subsequent reads.
  }, []);

  const saveOrganization = async () => {
    if (storageBusy || storageLoading) return;
    setStorageBusy(true);
    setStorageStatus("Salvando organização neste navegador...");
    const revision = revisionRef.current;
    try {
      const storedCards = cards.map((card) => {
        const image = mediaRef.current.get(card.id);
        if (!image) throw new Error("Imagem local não disponível. Reimporte o card antes de salvar.");
        return { id: card.id, name: card.name, position: { ...card.position }, image };
      });
      const layout: StoredDesktopLayout = {
        schemaVersion: 1,
        screenMode, clockVisible, clockPosition: { ...clockPosition },
        cards: storedCards, savedAt: Date.now(),
      };
      await writeDesktopLayout(layout);
      if (!aliveRef.current) return;
      if (revision !== revisionRef.current) {
        setStorageStatus("Organização anterior salva; houve novas alterações. Salve novamente.");
      } else {
        editedRef.current = false;
        setStorageStatus("Organização salva neste navegador! Ela será recuperada ao voltar.");
      }
    } catch (cause) {
      if (aliveRef.current) {
        setStorageStatus(cause instanceof Error ? cause.message : "Falha ao salvar organização.");
      }
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const restoreOrganization = async () => {
    if (storageBusy || storageLoading) return;
    setStorageBusy(true);
    setStorageStatus("Recuperando última organização salva...");
    try {
      const layout = await readDesktopLayout();
      if (!aliveRef.current) return;
      if (layout) applySnapshot(layout);
      else setStorageStatus("Nenhuma organização salva neste navegador.");
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Falha ao recuperar a organização.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

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
        const id = "card-" + (globalThis.crypto?.randomUUID?.() ?? (Date.now() + "-" + index));
        mediaRef.current.set(id, file);
        created.push({
          id, url, name: file.name,
          position: { x: 8 + (index % 4) * 15, y: 22 + (index % 3) * 16 },
        });
      }
      if (created.length) {
        setCards((current) => [...current, ...created]);
        markEdited();
      }
    } catch {
      for (const card of created) {
        urlsRef.current.delete(card.url);
        mediaRef.current.delete(card.id);
        URL.revokeObjectURL(card.url);
      }
      setImageError("Não foi possível abrir a imagem neste navegador.");
    }
  };

  const removeCard = (id: string) => {
    const card = cards.find((item) => item.id === id);
    if (!card) return;
    urlsRef.current.delete(card.url);
    mediaRef.current.delete(id);
    URL.revokeObjectURL(card.url);
    setCards((current) => current.filter((item) => item.id !== id));
    markEdited();
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
            onClick={() => { setScreenMode("ultrawide"); markEdited(); }}>3440 × 1440</button>
          <button type="button" aria-pressed={screenMode === "standard"}
            onClick={() => { setScreenMode("standard"); markEdited(); }}>1920 × 1080</button>
        </div>
      </header>
      <div className="theme-desktop-element-tools" aria-label="Inserir elementos no desktop">
        <button type="button" onClick={() => { setClockVisible((current) => !current); markEdited(); }}>
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
      <div className="theme-desktop-save-tools" aria-label="Salvar e recuperar organização">
        <button type="button" onClick={() => void saveOrganization()}
          disabled={storageLoading || storageBusy}>
          {storageBusy ? "Processando..." : "Salvar organização"}
        </button>
        <button type="button" onClick={() => void restoreOrganization()}
          disabled={storageLoading || storageBusy}>
          Restaurar última organização salva
        </button>
        <p role="status" aria-live="polite">{storageStatus}</p>
      </div>
      <p className="theme-desktop-session-note">
        Imagens, relógio e posições só persistem após Salvar organização (IndexedDB local).
        Restaurar substitui alterações não salvas. Dados ficam neste navegador, sem envio ao servidor;
        limpar os dados do site pode apagá-los.
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
                  <p>Nesta prévia, o relógio local e os cards importados podem ser salvos no IndexedDB do navegador com suas posições. Wallpapers pessoais, múltiplos layouts por resolução, mais widgets e agrupamentos ainda não estão implementados.</p>
                  <p>Trocar as abas da prévia não modifica nem salva o seu tema.</p>
                </div>
              )}
            </div>
          </div>
          <div className="theme-desktop-elements-layer" ref={areaRef}
            aria-label="Elementos posicionáveis do desktop simulado">
            {clockVisible && (
              <DesktopMovable position={clockPosition} onMove={(next) => {
                  setClockPosition(next);
                  markEdited();
                }}
                label="relógio digital" onRemove={() => { setClockVisible(false); markEdited(); }}
                areaRef={areaRef}>
                <DesktopClockWidget palette={palette} />
              </DesktopMovable>
            )}
            {cards.map((card) => (
              <DesktopMovable key={card.id} position={card.position}
                onMove={(position) => {
                  setCards((current) => current.map((item) =>
                    item.id === card.id ? { ...item, position } : item));
                  markEdited();
                }}
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
        Relógio com horário local real; imagens e posições podem ser salvas localmente via IndexedDB. Não há upload, dados fictícios de hardware ou execução de QML.
      </p>
    </section>
  );
}
