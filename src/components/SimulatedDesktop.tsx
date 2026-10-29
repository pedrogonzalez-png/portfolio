import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { DesktopClockWidget } from "./desktop/DesktopClockWidget";
import { DesktopCharacterCard } from "./desktop/DesktopCharacterCard";
import { DesktopMovable } from "./desktop/DesktopMovable";
import { RealDesktopPreview, CHANGLI_THEME_SOURCE_URL } from "./desktop/RealDesktopPreview";
import {
  isSupportedCardImage, MAX_SESSION_CARDS, type DesktopImageCard, type DesktopPosition,
} from "../services/desktopElements";
import type { ThemePalette } from "../stores/themes";
import {
  DESKTOP_LAYOUT_SLOTS, defaultDesktopLayoutNames, readDesktopLayout, readDesktopLayoutNames,
  writeDesktopLayout, writeDesktopLayoutName,
  createDesktopVersion, readDesktopVersions, restoreDesktopVersion, deleteDesktopVersion,
  MAX_DESKTOP_VERSIONS,
} from "../services/desktopPersistence";
import type {
  StoredDesktopLayout, DesktopScreenMode, DesktopLayoutSlot, DesktopLayoutNames, DesktopLayoutVersion,
} from "../services/desktopPersistence";
import { BACKUP_EXTENSION, createDesktopBackup, parseDesktopBackup } from "../services/desktopBackup";
import {
  checkpointPositions, emptyPositionHistory, redoPositions, snapshotPositions, undoPositions,
} from "../services/desktopHistory";
import type { PositionSnapshot } from "../services/desktopHistory";


export function SimulatedDesktop({ palette, themeName }: {
  palette: ThemePalette; themeName: string;
}) {
  const [screenMode, setScreenMode] = useState<DesktopScreenMode>("ultrawide");
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
  const [activeSlot, setActiveSlot] = useState<DesktopLayoutSlot>("default");
  const [layoutNames, setLayoutNames] = useState<DesktopLayoutNames>(defaultDesktopLayoutNames);
  const [nameDraft, setNameDraft] = useState("Principal");
  const [pendingImport, setPendingImport] = useState<{ fileName: string; layout: StoredDesktopLayout } | null>(null);
  const [history, setHistory] = useState(emptyPositionHistory);
  const [versionName, setVersionName] = useState("");
  const [versions, setVersions] = useState<DesktopLayoutVersion[]>([]);
  const [versionStatus, setVersionStatus] = useState("Carregando versões salvas...");
  const [pendingVersion, setPendingVersion] = useState<{ id: string; action: "restore" | "delete" } | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState("Buscando organização salva no navegador...");

  const markEdited = () => {
    editedRef.current = true;
    revisionRef.current += 1;
    setStorageStatus("Alterações não salvas. Use Salvar organização para manter os elementos.");
  };

  const checkpoint = () => {
    const before = snapshotPositions(clockPosition, cards);
    setHistory((current) => checkpointPositions(current, before));
  };

  const restorePositions = (snapshot: PositionSnapshot) => {
    setClockPosition({ ...snapshot.clock });
    const positions = new Map(snapshot.cards.map((item) => [item.id, item.position]));
    setCards((current) => current.map((item) => {
      const position = positions.get(item.id);
      return position ? { ...item, position: { ...position } } : item;
    }));
    markEdited();
  };

  const undo = () => {
    const result = undoPositions(history, snapshotPositions(clockPosition, cards));
    if (!result.snapshot) return;
    setHistory(result.history);
    restorePositions(result.snapshot);
  };
  const redo = () => {
    const result = redoPositions(history, snapshotPositions(clockPosition, cards));
    if (!result.snapshot) return;
    setHistory(result.history);
    restorePositions(result.snapshot);
  };

  const clearPositionHistory = () => setHistory(emptyPositionHistory());

  const resetEmptySlot = () => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current.clear();
    mediaRef.current.clear();
    setCards([]);
    setClockVisible(false);
    setClockPosition({ x: 62, y: 7 });
    setScreenMode("ultrawide");
    clearPositionHistory();
    editedRef.current = false;
    revisionRef.current += 1;
    setImageError("");
  };

  const applySnapshot = useCallback((layout: StoredDesktopLayout) => {
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
    setHistory(emptyPositionHistory());
    editedRef.current = false;
    revisionRef.current += 1;
    setImageError("");
    setStorageStatus("Organização recuperada do navegador.");
  }, []);

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
    void readDesktopLayoutNames().then((names) => {
      if (!aliveRef.current) return;
      setLayoutNames(names);
      setNameDraft(names.default);
    }).catch(() => {
      // The old default layout remains usable even if custom labels are unavailable.
    });
    return () => {
      aliveRef.current = false;
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
      urlsRef.current.clear();
      mediaRef.current.clear();
    };
    // Restore only when the editor first opens. Explicit Restore handles subsequent reads.
  }, [applySnapshot]);

  useEffect(() => {
    let cancelled = false;
    setPendingVersion(null);
    setVersions([]);
    setVersionStatus("Carregando versões da organização...");
    void readDesktopVersions(activeSlot).then((items) => {
      if (cancelled) return;
      setVersions(items);
      setVersionStatus(items.length
        ? items.length + " versão(ões) disponível(is) nesta organização."
        : "Nenhuma versão nomeada neste layout.");
    }).catch((cause) => {
      if (!cancelled) setVersionStatus(
        cause instanceof Error ? cause.message : "Histórico de versões indisponível.",
      );
    });
    return () => { cancelled = true; };
  }, [activeSlot]);

  const createVersion = async () => {
    if (storageBusy || storageLoading) return;
    if (editedRef.current || nameDraft !== layoutNames[activeSlot]) {
      setVersionStatus("Salve a organização e seu nome antes de criar uma versão.");
      return;
    }
    setStorageBusy(true);
    try {
      const created = await createDesktopVersion(activeSlot, versionName);
      if (!aliveRef.current) return;
      setVersions(await readDesktopVersions(activeSlot));
      setVersionName("");
      setVersionStatus("Versão " + created.name + " guardada neste navegador.");
    } catch (cause) {
      if (aliveRef.current) setVersionStatus(
        cause instanceof Error ? cause.message : "Falha ao criar versão.",
      );
    } finally { if (aliveRef.current) setStorageBusy(false); }
  };

  const applyVersionAction = async () => {
    if (!pendingVersion || storageBusy || storageLoading) return;
    if (editedRef.current || nameDraft !== layoutNames[activeSlot]) {
      setVersionStatus("Salve ou restaure suas alterações antes de usar uma versão.");
      return;
    }
    setStorageBusy(true);
    const selected = pendingVersion;
    const slot = activeSlot;
    const revision = revisionRef.current;
    try {
      if (selected.action === "restore") {
        const layout = await restoreDesktopVersion(slot, selected.id);
        if (!aliveRef.current) return;
        if (revision !== revisionRef.current) {
          setVersionStatus("Dados restaurados no navegador. Reabra a organização para visualizar.");
        } else {
          applySnapshot(layout);
          setVersionStatus("Versão restaurada! O estado anterior foi guardado como versão de segurança.");
        }
      } else {
        await deleteDesktopVersion(slot, selected.id);
        if (!aliveRef.current) return;
        setVersionStatus("Versão excluída. A organização atual foi preservada.");
      }
      setVersions(await readDesktopVersions(slot));
      setPendingVersion(null);
    } catch (cause) {
      if (aliveRef.current) setVersionStatus(
        cause instanceof Error ? cause.message : "Falha na operação. Organização preservada.",
      );
    } finally { if (aliveRef.current) setStorageBusy(false); }
  };

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
      await writeDesktopLayout(layout, activeSlot);
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
      const layout = await readDesktopLayout(activeSlot);
      if (!aliveRef.current) return;
      if (layout) applySnapshot(layout);
      else {
        resetEmptySlot();
        setStorageStatus("Layout vazio restaurado. Nenhuma organização salva neste slot.");
      }
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Falha ao recuperar a organização.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const saveLayoutName = async () => {
    if (storageBusy || storageLoading) return;
    setStorageBusy(true);
    try {
      const name = await writeDesktopLayoutName(activeSlot, nameDraft);
      if (!aliveRef.current) return;
      setLayoutNames((current) => ({ ...current, [activeSlot]: name }));
      setNameDraft(name);
      setStorageStatus("Nome salvo para esta organização.");
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Falha ao salvar o nome.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const exportLayout = async () => {
    if (storageBusy || storageLoading) return;
    if (editedRef.current || nameDraft !== layoutNames[activeSlot]) {
      setStorageStatus("Salve as alterações e o nome do layout antes de exportar.");
      return;
    }
    setStorageBusy(true);
    try {
      const stored = await readDesktopLayout(activeSlot);
      if (!aliveRef.current) return;
      if (!stored) { setStorageStatus("Salve esta organização antes de exportar."); return; }
      const backup = createDesktopBackup(stored);
      const url = URL.createObjectURL(backup);
      const anchor = document.createElement("a");
      const name = layoutNames[activeSlot].normalize("NFKD")
        .replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "layout";
      anchor.href = url;
      anchor.download = name + BACKUP_EXTENSION;
      document.body.appendChild(anchor);
      try { anchor.click(); } finally {
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 3000);
      }
      setStorageStatus("Backup do layout ativo preparado para download, com imagens originais.");
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Falha ao exportar backup.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const selectBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || storageBusy || storageLoading) return;
    if (editedRef.current) {
      setStorageStatus("Salve ou restaure as alterações atuais antes de importar.");
      return;
    }
    setStorageBusy(true);
    setPendingImport(null);
    setStorageStatus("Validando arquivo de backup...");
    try {
      if (!file.name.toLowerCase().endsWith(BACKUP_EXTENSION))
        throw new Error("Selecione um arquivo .ptsbackup exportado pelo Theme Studio.");
      const layout = await parseDesktopBackup(file);
      if (!aliveRef.current) return;
      setPendingImport({ fileName: file.name, layout });
      setStorageStatus("Backup validado. Confirme para substituir o layout selecionado.");
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Backup inválido.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const confirmImport = async () => {
    if (!pendingImport || storageBusy || storageLoading || editedRef.current) return;
    setStorageBusy(true);
    setStorageStatus("Importando backup para o layout ativo...");
    try {
      await writeDesktopLayout(pendingImport.layout, activeSlot);
      if (!aliveRef.current) return;
      applySnapshot(pendingImport.layout);
      setPendingImport(null);
      setStorageStatus("Backup importado e salvo nesta organização.");
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Falha ao importar o backup.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const switchSlot = async (slot: DesktopLayoutSlot) => {
    if (slot === activeSlot || storageBusy || storageLoading) return;
    if (editedRef.current || nameDraft !== layoutNames[activeSlot]) {
      setStorageStatus("Salve ou restaure as alterações atuais antes de trocar de layout.");
      return;
    }
    setStorageBusy(true);
    setStorageStatus("Carregando " + DESKTOP_LAYOUT_SLOTS.find((item) => item.id === slot)?.label + "...");
    const originalRevision = revisionRef.current;
    try {
      const layout = await readDesktopLayout(slot);
      if (!aliveRef.current) return;
      if (editedRef.current || originalRevision !== revisionRef.current) {
        setStorageStatus("Houve alterações enquanto o layout carregava. Troca cancelada.");
        return;
      }
      if (layout) applySnapshot(layout);
      else {
        resetEmptySlot();
        setStorageStatus("Layout vazio. Monte sua organização e clique em Salvar.");
      }
      setActiveSlot(slot);
      setNameDraft(layoutNames[slot]);
      setPendingImport(null);
      setPendingVersion(null);
    } catch (cause) {
      if (aliveRef.current) setStorageStatus(
        cause instanceof Error ? cause.message : "Falha ao carregar outro layout.",
      );
    } finally {
      if (aliveRef.current) setStorageBusy(false);
    }
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement &&
        target.closest("input,textarea,select,[contenteditable='true']")) return;
    const key = event.key.toLowerCase();
    if (key === "z" || key === "y") {
      event.preventDefault();
      if (key === "y" || event.shiftKey) redo();
      else undo();
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
        clearPositionHistory();
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
    clearPositionHistory();
    markEdited();
  };


  return (
    <section className="theme-desktop-section" aria-label="Desktop simulado" onKeyDown={handleKeyboard}>
      <header className="theme-desktop-controls">
        <div>
          <h3>Desktop simulado</h3>
          <p>Wallpaper e paleta do GitHub do proprietário, com barra e dock ilustrativos. Não executa Quickshell nem acessa seu Arch ao vivo.</p>
        </div>
        <div className="theme-desktop-resolutions" role="group" aria-label="Formato da prévia">
          <button type="button" aria-pressed={screenMode === "ultrawide"}
            onClick={() => { setScreenMode("ultrawide"); markEdited(); }}>3440 × 1440</button>
          <button type="button" aria-pressed={screenMode === "standard"}
            onClick={() => { setScreenMode("standard"); markEdited(); }}>1920 × 1080</button>
        </div>
      </header>
      <div className="theme-desktop-element-tools" aria-label="Inserir elementos no desktop">
        <button type="button" onClick={() => { setClockVisible((current) => !current); clearPositionHistory(); markEdited(); }}>
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
      <div className="theme-desktop-layout-picker">
        <label htmlFor="desktop-layout-select">Organização do desktop</label>
        <select id="desktop-layout-select" aria-label="Organização do desktop"
          value={activeSlot} disabled={storageLoading || storageBusy}
          onChange={(event) => void switchSlot(event.target.value as DesktopLayoutSlot)}>
          {DESKTOP_LAYOUT_SLOTS.map((slot) =>
            <option key={slot.id} value={slot.id}>{layoutNames[slot.id]}</option>)}
        </select>
        <span>Quatro organizações locais independentes. A Principal mantém seu salvamento anterior.</span>
        <label htmlFor="desktop-layout-name">Nome da organização</label>
        <input id="desktop-layout-name" aria-label="Nome da organização" type="text"
          maxLength={32} value={nameDraft} disabled={storageLoading || storageBusy}
          onChange={(event) => setNameDraft(event.target.value)} />
        <button type="button" onClick={() => void saveLayoutName()}
          disabled={storageLoading || storageBusy || nameDraft === layoutNames[activeSlot]}>
          Salvar nome
        </button>
      </div>
      <div className="theme-desktop-undo-tools" aria-label="Desfazer e refazer posições">
        <button type="button" onClick={undo} disabled={!history.past.length}>↶ Desfazer movimento</button>
        <button type="button" onClick={redo} disabled={!history.future.length}>↷ Refazer movimento</button>
        <span>Ctrl+Z / Ctrl+Shift+Z. Até 30 movimentos por sessão.</span>
      </div>
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
      <section className="theme-desktop-versions" aria-label="Versões nomeadas do layout">
        <h4>Versões do layout</h4>
        <p>Guarde marcos antes de experimentar mudanças. Até {MAX_DESKTOP_VERSIONS} versões por organização,
          incluindo cópias de segurança criadas durante a restauração.</p>
        <div className="theme-desktop-version-create">
          <label htmlFor="desktop-version-name">Nome da nova versão</label>
          <input id="desktop-version-name" type="text" maxLength={32}
            value={versionName} disabled={storageLoading || storageBusy}
            onChange={(event) => setVersionName(event.target.value)}
            placeholder="Ex.: Layout Changli final" />
          <button type="button" disabled={storageLoading || storageBusy || !versionName.trim()}
            onClick={() => void createVersion()}>Criar versão do layout salvo</button>
        </div>
        <ul className="theme-desktop-version-list">
          {versions.map((version) => (
            <li key={version.id}>
              <span><strong>{version.name}</strong>
                <small>{new Date(version.createdAt).toLocaleString("pt-BR")}</small></span>
              <button type="button" disabled={storageLoading || storageBusy}
                onClick={() => setPendingVersion({ id: version.id, action: "restore" })}>
                Restaurar
              </button>
              <button type="button" disabled={storageLoading || storageBusy}
                onClick={() => setPendingVersion({ id: version.id, action: "delete" })}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
        <p role="status" aria-live="polite">{versionStatus}</p>
        {pendingVersion && (
          <div className="theme-desktop-version-confirm" role="group" aria-label="Confirmar ação da versão">
            <p>{pendingVersion.action === "restore"
              ? "Restaurar substituirá o layout salvo. Uma versão de segurança do estado atual será criada primeiro."
              : "Excluir removerá apenas esta versão histórica. O layout ativo não será apagado."}</p>
            <button type="button" disabled={storageBusy}
              onClick={() => void applyVersionAction()}>
              {pendingVersion.action === "restore" ? "Confirmar restauração segura" : "Confirmar exclusão da versão"}
            </button>
            <button type="button" disabled={storageBusy} onClick={() => setPendingVersion(null)}>
              Cancelar
            </button>
          </div>
        )}
      </section>
      <div className="theme-desktop-backup-tools" aria-label="Backup portátil do layout">
        <button type="button" disabled={storageLoading || storageBusy}
          onClick={() => void exportLayout()}>Exportar backup do layout</button>
        <label className="theme-desktop-backup-import">
          Selecionar backup para importar
          <input type="file" aria-label="Selecionar arquivo de backup"
            accept=".ptsbackup,application/octet-stream"
            disabled={storageLoading || storageBusy} onChange={(event) => void selectBackup(event)} />
        </label>
        {pendingImport && (
          <div className="theme-desktop-backup-review" role="group" aria-label="Confirmar substituição do layout">
            <p>Arquivo: <strong>{pendingImport.fileName}</strong>. Contém {pendingImport.layout.cards.length}
              {pendingImport.layout.cards.length === 1 ? " card" : " cards"} e
              {pendingImport.layout.clockVisible ? " um relógio" : " nenhum relógio"}.
              Confirmar substituirá os dados salvos de <strong>{layoutNames[activeSlot]}</strong>.</p>
            <button type="button" disabled={storageBusy} onClick={() => void confirmImport()}>
              Confirmar importação e substituir
            </button>
            <button type="button" onClick={() => {
              setPendingImport(null);
              setStorageStatus("Importação cancelada. Nenhum dado foi substituído.");
            }}>Cancelar importação</button>
          </div>
        )}
      </div>
      <p className="theme-desktop-session-note">
        Cada organização e seu nome são salvos separadamente no IndexedDB local.
        O backup exporta apenas o layout ativo, incluindo suas imagens; confira a origem antes de importar.
        Para trocar de layout, salve
        ou restaure as alterações atuais. Desfazer/refazer cobre apenas posições e é temporário.
        Restaurar substitui alterações não salvas. Nada é enviado ao servidor;
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
          <RealDesktopPreview palette={palette} themeName={themeName} animationEnabled={false} />
          <div className="theme-desktop-elements-layer" ref={areaRef}
            aria-label="Elementos posicionáveis do desktop simulado">
            {clockVisible && (
              <DesktopMovable position={clockPosition} onMoveStart={checkpoint} onMove={(next) => {
                  setClockPosition(next);
                  markEdited();
                }}
                label="relógio digital" onRemove={() => { setClockVisible(false); clearPositionHistory(); markEdited(); }}
                areaRef={areaRef}>
                <DesktopClockWidget palette={palette} />
              </DesktopMovable>
            )}
            {cards.map((card) => (
              <DesktopMovable key={card.id} position={card.position} onMoveStart={checkpoint}
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
        </div>
      </div>
      <p className="theme-desktop-footnote">
        Changli usa o wallpaper verdadeiro do repositório dotfiles-Arch e a paleta oficial do Hyprland-Themes. Barra e dock são uma reprodução HTML/CSS, não o desktop conectado. Versões, cards e relógio ficam apenas no seu navegador.{" "} <a href={CHANGLI_THEME_SOURCE_URL} target="_blank" rel="noopener noreferrer">Ver configuração Changli no GitHub</a>.
      </p>
    </section>
  );
}
