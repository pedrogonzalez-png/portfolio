import { useMemo, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { RealDesktopPreview } from "./desktop/RealDesktopPreview";
import { OFFICIAL_THEMES, type Theme, type ThemePalette } from "../stores/themes";
import published from "../data/published-widget-layouts.json";
import {
  sanitizeQuickshellProfiles, validatePublishedLayouts,
  WIDGET_KINDS, type WidgetKind, type SanitizedDesktopLayouts,
  type WidgetPlacement,
} from "../services/quickshellLayoutImport";
import "../styles/hyprland-showcase.css";

const LOCAL_POSITIONS_KEY = "portfolio.hyprland.sanitized.layout.v1";
const WIDGET_NAMES: Record<WidgetKind, string> = {
  clock: "Relógio", weather: "Clima", calendar: "Calendário",
  worldClock: "Fuso horário", media: "Reprodutor", visualizer: "Visualizador",
  resources: "Recursos", userCard: "Perfil", todo: "Tarefas", notes: "Notas",
  timers: "Temporizadores", images: "Imagens", customImage: "Imagem livre",
  imageCard: "Card 1", imageCard2: "Card 2", imageCard3: "Card 3",
  imageCard4: "Card 4", imageCard5: "Card 5", imageCard6: "Card 6",
  sticker: "Adesivo", customText: "Texto livre",
};
const DEMO_WIDGETS: WidgetKind[] = [
  "clock", "weather", "calendar", "media", "visualizer", "resources",
  "notes", "todo", "imageCard", "timers", "worldClock", "customText",
];

function WidgetFace({ kind }: { kind: WidgetKind }) {
  const now = new Date();
  const hhmm = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(now);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(now);
  return (
    <div className={"hypr-widget hypr-widget-" + kind}>
      <span className="hypr-widget-caption">{WIDGET_NAMES[kind]}</span>
      {kind === "clock" ? <strong className="hypr-widget-clock">{hhmm}</strong> :
        kind === "calendar" ? <strong className="hypr-widget-clock">{day}</strong> :
        kind === "worldClock" ? <strong>UTC · {new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit", minute: "2-digit", timeZone: "UTC",
        }).format(now)}</strong> :
        kind === "weather" ? <strong>Clima · sem dados</strong> :
        kind === "resources" ? <span>CPU — · RAM —</span> :
        kind === "media" ? <span>♫ Sem reprodução</span> :
        kind === "visualizer" ? <div className="hypr-widget-bars" aria-hidden="true">
          {[2,4,3,5,2,4,6,3,5,2,4,3].map((h,i)=><i key={i} style={{height:h*3+"px"}} />)}
        </div> :
        kind === "todo" ? <span>☐ Tarefas não publicadas</span> :
        kind === "notes" || kind === "customText" ? <span>Conteúdo privado</span> :
        kind === "timers" ? <span>00:00 · Inativo</span> :
        kind.startsWith("image") || kind === "sticker" ? <span className="hypr-widget-image-mark">✧</span> :
        <span>Widget Quickshell</span>}
    </div>
  );
}

function readLocal(): SanitizedDesktopLayouts | null {
  try {
    const stored = window.localStorage.getItem(LOCAL_POSITIONS_KEY);
    return stored ? validatePublishedLayouts(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function HyprlandShowcase({
  themes, onChoose, selectedId, active = true,
}: {
  themes: readonly Theme[];
  selectedId: string;
  onChoose: (theme: Theme) => void;
  active?: boolean;
}) {
  const [selected, setSelected] = useState(selectedId);
  const [localProfiles, setLocalProfiles] = useState<SanitizedDesktopLayouts | null>(readLocal);
  const [message, setMessage] = useState("");
  const [previewFormat, setPreviewFormat] = useState<"ultrawide"|"standard">("ultrawide");

  const theme = themes.find((t) => t.id === selected) ?? OFFICIAL_THEMES[0];
  const hsin = selected === "hsin";
  const palette: ThemePalette = hsin ? OFFICIAL_THEMES[0].palette : theme.palette;
  const themeName = hsin ? "Hsin" : theme.name;
  const profileId = hsin ? "hsin" : theme.kind === "custom" ? theme.basedOnThemeId ?? theme.id : theme.id;
  const publishedProfiles = useMemo(() => validatePublishedLayouts(published), []);
  const activeLayout = (localProfiles?.profiles ?? []).find((p) => p.themeId === profileId) ??
    publishedProfiles.profiles.find((p) => p.themeId === profileId) ?? null;
  const hasLayout = activeLayout !== null;
  const kindLabels = WIDGET_KINDS.map((k) => WIDGET_NAMES[k]);

  const importLayouts = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      if (!file.name.endsWith(".json") || file.size > 1024*1024) {
        throw new Error("Selecione um JSON do Quickshell com até 1 MB.");
      }
      const parsed: unknown = JSON.parse(await file.text());
      const sanitized = sanitizeQuickshellProfiles(parsed);
      // Retains ONLY widget types and numeric positions — never wallpaper
      // file paths, notes, custom text or private card images.
      window.localStorage.setItem(LOCAL_POSITIONS_KEY, JSON.stringify(sanitized));
      setLocalProfiles(sanitized);
      setMessage(sanitized.profiles.length + " perfil(is) importado(s) somente neste navegador. Os dados privados não foram salvos.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Arquivo inválido.");
    }
  };

  const exportClean = () => {
    if (!localProfiles) return;
    const blob = new Blob([JSON.stringify(localProfiles, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "widget-layouts-publico.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 3000);
    setMessage("Snapshot público gerado sem caminhos privados ou conteúdo de widgets. Para os visitantes verem as posições, publique esse JSON no GitHub.");
  };

  return (
    <section className="hypr-showcase" aria-label="Hyprland — temas e widgets do autor">
      <header className="hypr-showcase-header">
        <div>
          <span className="hypr-kicker">ARCH / HYPRLAND / END4-PC</span>
          <h3>Meu desktop, <em>meus temas.</em></h3>
          <p>Visualização com os wallpapers e as paletas que estão publicados no GitHub.</p>
        </div>
        <span className="hypr-source-note">QML como referência · sem acesso ao seu PC em tempo real</span>
      </header>

      <div className="hypr-theme-selector" role="group" aria-label="Escolher tema do desktop">
        {themes.map((t) => (
          <button key={t.id} type="button" aria-pressed={selected===t.id}
            className={selected===t.id ? "is-selected" : ""}
            onClick={() => {setSelected(t.id);onChoose(t);}}
            style={{ "--hypr-swatch": t.palette.accentPrimary } as CSSProperties}>
            <i aria-hidden="true" />{t.name}
          </button>
        ))}
        <button type="button" className={hsin ? "is-selected" : ""} aria-pressed={hsin}
          onClick={() => setSelected("hsin")}
          style={{ "--hypr-swatch": "#86b8b3" } as CSSProperties}>
          <i aria-hidden="true" />Hsin <small>Paleta ainda não publicada</small>
        </button>
      </div>

      <div className="hypr-view-options" role="group" aria-label="Proporção do desktop Hyprland">
        <button type="button" aria-pressed={previewFormat==="ultrawide"}
          onClick={() => setPreviewFormat("ultrawide")}>3440 × 1440</button>
        <button type="button" aria-pressed={previewFormat==="standard"}
          onClick={() => setPreviewFormat("standard")}>1920 × 1080</button>
        <span>{hasLayout
          ? "Posições de widgets importadas · projeção em 3440 × 1440"
          : "Posições reais não publicadas · sem posicionamentos inventados"}</span>
      </div>

      <div className="hypr-desktop-scroll">
        <div className={"hypr-desktop-stage hypr-desktop-" + previewFormat}>
          <RealDesktopPreview palette={palette} themeName={themeName} animationEnabled={active} />
          {hasLayout && (
            <div className="hypr-widget-position-layer" aria-label="Posições importadas do Quickshell">
              {activeLayout.widgets.map((widget: WidgetPlacement, i) => (
                <div key={widget.kind+"-"+i} className="hypr-widget-position"
                  style={{
                    left: widget.x+"%", top: widget.y+"%",
                    width: "max(98px, " + widget.width + "%)",
                    minHeight: "max(58px, " + widget.height + "%)",
                  }}>
                  <WidgetFace kind={widget.kind}/>
                </div>
              ))}
            </div>
          )}
          {!hasLayout && <div className="hypr-no-layout">
            <span>Desktop e tema do GitHub</span>
            <small>Importe o arquivo de layouts para exibir as posições exatas dos widgets.</small>
          </div>}
        </div>
      </div>

      {hsin && <p className="hypr-source-warning">
        O wallpaper Hsin está no GitHub, mas o JSON de cores Hsin não está publicado.
        As cores exibidas neste momento são provisórias, não a paleta real do seu PC.
      </p>}
      {["emilia","furina","hotline-miami"].includes(profileId) &&
        <p className="hypr-source-warning">A paleta {themeName} é original do repositório Hyprland-Themes,
          mas ainda não há wallpaper próprio desse tema nos arquivos públicos consultados.</p>}

      <section className="hypr-widget-catalog" aria-label="Catálogo de widgets do Quickshell">
        <h4>Widgets encontrados no seu código QML</h4>
        <p>Modelos visuais simplificados, sem inventar métricas de hardware, conteúdo das notas ou imagens privadas.
          As posições acima são exibidas somente quando os dados reais estão disponíveis.</p>
        <div className="hypr-widget-catalog-grid">
          {DEMO_WIDGETS.map((kind)=><WidgetFace key={kind} kind={kind}/>)}
        </div>
        <p className="hypr-widget-count">O serviço <code>WallpaperLayouts.qml</code> reconhece {kindLabels.length} tipos/slots de widgets, incluindo seis cards de imagem.</p>
      </section>

      <div className="hypr-layout-import">
        <div>
          <strong>Mostrar as posições reais do seu Arch</strong>
          <p>Selecione <code>~/.config/quickshell/end4-pC/wallpaper_widget_layouts.json</code>.
            O navegador lê o arquivo localmente e guarda somente coordenadas e tipos de widgets;
            caminhos, imagens, textos e notas são descartados.</p>
        </div>
        <label>Importar posições do Quickshell
          <input type="file" accept=".json,application/json" aria-label="Importar posições do Quickshell"
            onChange={(event) => void importLayouts(event)} />
        </label>
        {localProfiles && <button type="button" onClick={exportClean}>
          Exportar snapshot público sem dados privados
        </button>}
        {message && <p role="status">{message}</p>}
        <small>O arquivo local não é enviado ao GitHub automaticamente. Para todos os visitantes verem seu layout,
          é necessário adicionar o snapshot higienizado ao repositório.</small>
      </div>
    </section>
  );
}
