import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { OFFICIAL_THEMES, type Theme, type ThemePalette } from "../stores/themes";
import { RealDesktopPreview } from "./desktop/RealDesktopPreview";
import { ChangliDesktop } from "./desktop/ChangliDesktop";
import { ThemeCdShelf } from "./ThemeCdShelf";
import { validatePublishedLayouts, type WidgetPlacement, type WidgetKind } from "../services/quickshellLayoutImport";
import published from "../data/published-widget-layouts.json";
import "../styles/preset-theme-gallery.css";

const NAMES: Partial<Record<WidgetKind,string>> = {
  calendar:"CALENDÁRIO", clock:"RELÓGIO", weather:"CLIMA", resources:"SISTEMA",
  visualizer:"ÁUDIO", todo:"TAREFAS", userCard:"PERFIL", media:"MÍDIA",
  worldClock:"HORÁRIO MUNDIAL", imageCard:"IMAGEM", imageCard2:"IMAGEM",
  imageCard3:"IMAGEM", imageCard4:"IMAGEM", imageCard5:"IMAGEM", imageCard6:"IMAGEM",
  notes:"NOTAS", timers:"TEMPO", customImage:"IMAGEM", images:"GALERIA",
};

type View = { id:string; name:string; palette:ThemePalette; variant:string; widgets:WidgetPlacement[] };
const collection = validatePublishedLayouts(published).profiles;

function ProfileDesktop({ view, active, accent }: { view:View; active:boolean; accent:string | null }) {
  const palette = accent ? { ...view.palette, accentPrimary:accent } : view.palette;
  return (
    <div className="preset-desktop-scene" style={{"--preset-glow":palette.accentPrimary} as CSSProperties}>
      {view.id==="changli" ? <ChangliDesktop active={active} accent={accent}/> : (
        <>
          <RealDesktopPreview palette={palette} themeName={view.name} animationEnabled={active}/>
      <div className="preset-desktop-widgets" aria-label={"Widgets publicados de "+view.name}>
        {view.widgets.map((widget,i) => (
          <div key={widget.kind+"-"+i} className={"preset-widget preset-"+widget.kind}
            style={{
              left:widget.x+"%",top:widget.y+"%",width:widget.width+"%",
              height:widget.height+"%",zIndex:Math.max(0,Math.min(3000,(widget.z??0)+1100)),
            }}>
            {widget.kind.startsWith("imageCard") ? (
              <span className="preset-widget-image" aria-label="Imagem original não publicada">✧</span>
            ) : widget.kind==="visualizer" ? (
              <span className="preset-widget-visualizer" aria-hidden="true">
                {Array.from({length:13},(_,n)=><i key={n} style={{height:(5+(n*7%17))+"px"}}/>)}
              </span>
            ) : (
              <>
                <small>{NAMES[widget.kind] ?? widget.kind}</small>
                {widget.kind==="clock" || widget.kind==="worldClock" ?
                  <strong>⌾</strong> : widget.kind==="weather" ? <strong>☁</strong> :
                    widget.kind==="media" ? <strong>♫</strong> : <span className="preset-widget-mark">✦</span>}
              </>
            )}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}

export function HyprlandShowcase({
  themes = OFFICIAL_THEMES, selectedId = "changli", onChoose, accentColor = null,
}:{
  themes?:readonly Theme[];
  selectedId?:string;
  onChoose?:(theme:Theme)=>void;
  accentColor?:string|null;
  active?:boolean;
}) {
  const approvedThemes=useMemo(()=>themes.filter(t=>t.kind==="official"),[themes]);
  const [id,setId]=useState(selectedId);
  const [variant,setVariant]=useState("");
  const [format,setFormat]=useState<"ultrawide"|"standard">("ultrawide");
  const theme=approvedThemes.find(t=>t.id===id)??OFFICIAL_THEMES[0];
  const variants=collection.filter(p=>p.themeId===theme.id);
  const chosen=variants.find(p=>p.variantId===variant)??variants[0];
  const current:View={
    id:theme.id,name:theme.name,palette:theme.palette,
    variant:chosen?.variantId??"default",widgets:chosen?.widgets??[],
  };

  useEffect(()=>{
    // Synchronize external selection without turning an already-selected theme into an animation.
    setId(selectedId);
  },[selectedId]);

  const switchTo=(nextId:string,nextVariant?:string)=>{
    const nextTheme=approvedThemes.find(t=>t.id===nextId);
    if(!nextTheme)return;
    const nextOptions=collection.filter(p=>p.themeId===nextId);
    const next=nextOptions.find(p=>p.variantId===nextVariant)??nextOptions[0];
    const nextKey=next?.variantId??"default";
    if(nextId===id && nextKey===current.variant)return;
    setId(nextId);
    setVariant(nextKey);
    if(nextId!==id)onChoose?.(nextTheme);
  };

  return (
    <div className="preset-theme-gallery" aria-label="Galeria de temas Hyprland prontos">
      <div className="preset-gallery-intro">
        <span className="preset-eyebrow"><span aria-hidden="true">01</span> / ESCOLHA SEU UNIVERSO</span>
        <span className="preset-gallery-status">{approvedThemes.length.toString().padStart(2,"0")} TEMAS ORIGINAIS</span>
      </div>

      <ThemeCdShelf themes={approvedThemes} selectedId={theme.id}
        onChoose={(candidate)=>switchTo(candidate.id)} />

      <div className="preset-view-toolbar">
        <span className="preset-theme-label"><i aria-hidden="true"/>
          <strong>{theme.name}</strong><span className="preset-theme-divider" aria-hidden="true">/</span>
          <span>{theme.id==="changli"?"Composição de referência":chosen?.label??"Composição original"}</span>
        </span>
        <div role="group" aria-label="Proporção da prévia">
          <button type="button" aria-pressed={format==="ultrawide"} onClick={()=>setFormat("ultrawide")}>21:9</button>
          <button type="button" aria-pressed={format==="standard"} onClick={()=>setFormat("standard")}>16:9</button>
        </div>
      </div>

      <div className={"preset-stage preset-stage-"+format+(theme.id==="changli"?" preset-stage-changli":"")}
        style={{"--stage-accent":accentColor??theme.palette.accentPrimary} as CSSProperties}
        aria-label={"Desktop pronto de "+theme.name}>
        <ProfileDesktop view={current} active accent={accentColor}/>

      </div>

      <div className="preset-gallery-foot">
        <div>
          <strong>{theme.name} <span aria-hidden="true">·</span> {theme.id==="changli"?"Desktop de referência":current.widgets.length+" widgets da composição original"}</strong>
          <p>Prévia em código baseada nas configurações do Quickshell. Os CDs exibem as imagens e vídeos publicados para cada tema.</p>
        </div>
        {variants.length>1&&theme.id!=="changli"&&(
          <div className="preset-variant-controls">
            <label htmlFor="preset-variant-select">Outras composições prontas</label>
            <select id="preset-variant-select" value={current.variant}
              onChange={e=>switchTo(id,e.target.value)}>
              {variants.map((p,i)=><option key={p.variantId??i} value={p.variantId}>
                {p.label??"Layout "+(i+1)}
              </option>)}
            </select>
          </div>
        )}
      </div>
      {theme.id==="hiyuki"&&(
        <p className="preset-source-note">
          <a href="https://moewalls.com/anime/hiyuki-entrust-your-wishes-to-me-wuthering-waves-live-wallpaper/"
             target="_blank" rel="noopener noreferrer">Wallpaper original Hiyuki — MoeWalls</a>.
          O vídeo local da Hiyuki aparece no CD selecionado; a prévia do desktop abaixo continua independente.
        </p>
      )}
    </div>
  );
}
