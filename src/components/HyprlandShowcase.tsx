import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { RealDesktopPreview } from "./desktop/RealDesktopPreview";
import { DesktopWidgetEditor } from "./DesktopWidgetEditor";
import { OFFICIAL_THEMES, type Theme, type ThemePalette } from "../stores/themes";
import published from "../data/published-widget-layouts.json";
import {
  validatePublishedLayouts, type WidgetKind,
  type SanitizedDesktopLayouts,
} from "../services/quickshellLayoutImport";
import { readLocalWidgetLayouts, WIDGET_LAYOUT_CHANGED } from "../services/widgetLayoutLocal";
import "../styles/hyprland-showcase.css";

const WIDGET_NAMES: Record<WidgetKind, string> = {
  clock: "Relógio", weather: "Clima", calendar: "Calendário",
  worldClock: "Fuso horário", media: "Reprodutor", visualizer: "Visualizador",
  resources: "Recursos", userCard: "Perfil", todo: "Tarefas", notes: "Notas",
  timers: "Temporizadores", images: "Imagens", customImage: "Imagem livre",
  imageCard: "Card 1", imageCard2: "Card 2", imageCard3: "Card 3",
  imageCard4: "Card 4", imageCard5: "Card 5", imageCard6: "Card 6",
  sticker: "Adesivo", customText: "Texto livre",
};
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

export function HyprlandShowcase({
  themes, onChoose, selectedId, active = true,
}: {
  themes: readonly Theme[];
  selectedId: string;
  onChoose: (theme: Theme) => void;
  active?: boolean;
}) {
  const [selected, setSelected] = useState(selectedId);
  const [variantChoice, setVariantChoice] = useState<string>("");
  useEffect(() => { setSelected(selectedId); }, [selectedId]);
  const [localProfiles, setLocalProfiles] = useState<SanitizedDesktopLayouts | null>(readLocalWidgetLayouts);
  const [previewFormat, setPreviewFormat] = useState<"ultrawide"|"standard">("ultrawide");
  const [hiyukiWallpaper, setHiyukiWallpaper] = useState<{url:string;type:"video"|"image"}|null>(null);
  const hiyukiUrlRef = useRef<string|null>(null);
  const [hiyukiMessage,setHiyukiMessage] = useState("");
  useEffect(()=>()=>{if(hiyukiUrlRef.current)URL.revokeObjectURL(hiyukiUrlRef.current);},[]);
  const loadHiyuki = (event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.currentTarget.files?.[0];
    event.currentTarget.value="";
    if(!file)return;
    const video=file.type==="video/mp4"||file.type==="video/webm";
    const image=file.type==="image/png"||file.type==="image/jpeg"||file.type==="image/webp";
    if((!video&&!image)||file.size>150*1024*1024){
      setHiyukiMessage("Use MP4, WebM, PNG, JPG ou WebP até 150 MB.");return;
    }
    const url=URL.createObjectURL(file);
    if(hiyukiUrlRef.current)URL.revokeObjectURL(hiyukiUrlRef.current);
    hiyukiUrlRef.current=url;
    setHiyukiWallpaper({url,type:video?"video":"image"});
    setHiyukiMessage("Wallpaper escolhido carregado localmente, sem upload.");
  };
  useEffect(() => {
    const refresh = () => setLocalProfiles(readLocalWidgetLayouts());
    window.addEventListener(WIDGET_LAYOUT_CHANGED, refresh);
    return () => window.removeEventListener(WIDGET_LAYOUT_CHANGED, refresh);
  }, []);

  const theme = themes.find((t) => t.id === selected) ?? OFFICIAL_THEMES[0];
  const hsin = selected === "hsin";
  const extras = selected === "outros";
  const palette: ThemePalette = hsin || extras ? OFFICIAL_THEMES[0].palette : theme.palette;
  const themeName = extras ? "Wallpapers extras" : hsin ? "Hsin" : theme.name;
  const profileId = extras ? "outros" : hsin ? "hsin" :
    theme.kind === "custom" ? theme.basedOnThemeId ?? theme.id : theme.id;
  const publishedProfiles = useMemo(() => validatePublishedLayouts(published), []);
  // Keep individual wallpapers for the same theme independent. Never merge
  // Changli variants or overwrite the owner's originals with visitor edits.
  const localForTheme = (localProfiles?.profiles ?? []).filter(p => p.themeId === profileId);
  const profilesForTheme = localForTheme.length
    ? localForTheme : publishedProfiles.profiles.filter(p => p.themeId === profileId);
  const activeLayout = profilesForTheme.find(p => (p.variantId ?? "default") === variantChoice) ??
    profilesForTheme[0] ?? null;
  const activeVariantId = activeLayout?.variantId ?? "default";
  const hasLayout = activeLayout !== null;

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
        {publishedProfiles.profiles.some(p => p.themeId === "outros") && (
          <button type="button" className={extras ? "is-selected" : ""}
            aria-pressed={extras} onClick={() => setSelected("outros")}
            style={{ "--hypr-swatch": "#c1a89c" } as CSSProperties}>
            <i aria-hidden="true" />Outros wallpapers
          </button>
        )}
      </div>

      {profilesForTheme.length > 0 && (
        <div className="hypr-variant-selector">
          <label htmlFor="hypr-wallpaper-version">Organização original por wallpaper</label>
          <select id="hypr-wallpaper-version" value={activeVariantId}
            onChange={(event) => setVariantChoice(event.target.value)}
            aria-label="Escolher versão do wallpaper">
            {profilesForTheme.map(p => (
              <option key={p.variantId ?? "default"} value={p.variantId ?? "default"}>
                {p.label ?? "Layout padrão"} · {p.widgets.length} widgets ativados
              </option>
            ))}
          </select>
          <small>Posições do arquivo Quickshell original, sem caminhos pessoais</small>
        </div>
      )}
      <div className="hypr-view-options" role="group" aria-label="Proporção do desktop Hyprland">
        <button type="button" aria-pressed={previewFormat==="ultrawide"}
          onClick={() => setPreviewFormat("ultrawide")}>3440 × 1440</button>
        <button type="button" aria-pressed={previewFormat==="standard"}
          onClick={() => setPreviewFormat("standard")}>1920 × 1080</button>
        <span>{hasLayout
          ? "Posições QML importadas disponíveis · personalize sem alterar a referência"
          : "Posições reais do autor não publicadas · crie seu próprio layout"}</span>
      </div>


      {profileId === "hiyuki" && (
        <div className="hypr-hiyuki-source">
          <div>
            <strong>Hiyuki · Entrust Your Wishes to Me</strong>
            <p>Referência correta indicada pelo autor:
              {" "}<a href="https://moewalls.com/anime/hiyuki-entrust-your-wishes-to-me-wuthering-waves-live-wallpaper/"
                target="_blank" rel="noopener noreferrer">ver wallpaper original no MoeWalls</a>.
              O vídeo anterior foi removido. Baixe a mídia na origem e selecione o arquivo para vê-la nesta prévia.
              Nenhum vídeo de terceiros é republicado no GitHub.</p>
          </div>
          <label className="hypr-hiyuki-upload">Carregar wallpaper da Hiyuki
            <input type="file" accept="video/mp4,video/webm,image/png,image/jpeg,image/webp,.mp4,.webm,.png,.jpg,.jpeg,.webp"
              aria-label="Carregar wallpaper correto da Hiyuki" onChange={loadHiyuki}/>
          </label>
          {hiyukiMessage&&<p role="status">{hiyukiMessage}</p>}
        </div>
      )}
      <DesktopWidgetEditor key={profileId + ":" + activeVariantId}
        themeId={profileId + "-" + activeVariantId}
        sourceWidgets={activeLayout?.widgets} format={previewFormat}
        background={<RealDesktopPreview palette={palette} themeName={themeName}
          animationEnabled={active} localWallpaper={profileId==="hiyuki"?(hiyukiWallpaper??undefined):undefined} />}
        renderWidget={(kind)=><WidgetFace kind={kind}/>}
        widgetNames={WIDGET_NAMES}/>

      {hsin && <p className="hypr-source-warning">
        O wallpaper Hsin está no GitHub, mas o JSON de cores Hsin não está publicado.
        As cores exibidas neste momento são provisórias, não a paleta real do seu PC.
      </p>}
      {["emilia","furina","hotline-miami"].includes(profileId) &&
        <p className="hypr-source-warning">A paleta {themeName} é original do repositório Hyprland-Themes,
          mas ainda não há wallpaper próprio desse tema nos arquivos públicos consultados.</p>}

      <p className="hypr-source-warning">
        {hasLayout
          ? "Os posicionamentos exibidos vêm do snapshot sanitizado do Quickshell. Os widgets de outros visitantes são cópias editáveis, não uma conexão ao seu computador."
          : "Sem posições disponíveis. Importe o arquivo wallpaper_widget_layouts.json em Configurações para usar sua própria referência."}
      </p>
    </section>
  );
}
