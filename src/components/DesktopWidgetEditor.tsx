import { useEffect, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { WIDGET_KINDS, type WidgetKind, type WidgetPlacement } from "../services/quickshellLayoutImport";
import {
  MAX_VISITOR_WIDGETS, createVisitorWidget, fromSourceWidgets, loadVisitorWidgets,
  moveVisitorWidget, resizeVisitorWidget, saveVisitorWidgets, widgetPositionFromClientPoint, type VisitorWidget,
} from "../services/visitorDesktopWidgets";

type Gesture = {
  id:string; pointerId:number; clientX:number;clientY:number;x:number;y:number;
};
const known = new Set<string>(WIDGET_KINDS);

export function DesktopWidgetEditor({
  themeId, sourceWidgets, format, background, renderWidget, widgetNames,
}:{
  themeId:string;
  sourceWidgets?:WidgetPlacement[];
  format:"ultrawide"|"standard";
  background:ReactNode;
  renderWidget:(kind:WidgetKind)=>ReactNode;
  widgetNames:Record<WidgetKind,string>;
}) {
  const [widgets,setWidgets]=useState<VisitorWidget[]>(()=>
    loadVisitorWidgets(themeId)??fromSourceWidgets(sourceWidgets));
  const widgetsRef=useRef(widgets);
  const [status,setStatus]=useState("");
  const [expanded,setExpanded]=useState(false);
  const [expandedKind,setExpandedKind]=useState<WidgetKind>("clock");
  const canvasRef=useRef<HTMLDivElement>(null);
  const gestureRef=useRef<Gesture|null>(null);
  const draggingKindRef=useRef<WidgetKind|null>(null);
  const originalRef=useRef<VisitorWidget[]>(widgets);
  const sourceCount=sourceWidgets?.length??0;
  const edited=loadVisitorWidgets(themeId)!==null;
  const put=(items:VisitorWidget[])=>{
    try {
      saveVisitorWidgets(themeId,items);
      widgetsRef.current=items;
      setWidgets(items);
      setStatus("Layout salvo no navegador para este tema.");
    }catch(error){
      setStatus(error instanceof Error?error.message:"Não foi possível salvar o layout.");
    }
  };

  useEffect(()=>{
    const current=loadVisitorWidgets(themeId)??fromSourceWidgets(sourceWidgets);
    widgetsRef.current=current;
    setWidgets(current);
    gestureRef.current=null;
    setStatus("");
  },[themeId,sourceWidgets]);

  useEffect(()=>{
    if(!expanded)return;
    const close=(event:globalThis.KeyboardEvent)=>{
      if(event.key==="Escape")setExpanded(false);
    };
    window.addEventListener("keydown",close);
    return()=>window.removeEventListener("keydown",close);
  },[expanded]);

  const add=(kind:WidgetKind,x=40,y=36)=>{
    if(widgetsRef.current.length>=MAX_VISITOR_WIDGETS){
      setStatus("Limite de "+MAX_VISITOR_WIDGETS+" widgets atingido.");return;
    }
    put([...widgetsRef.current,createVisitorWidget(kind,x,y)]);
  };

  const coordinate=(clientX:number,clientY:number)=>{
    const rect=canvasRef.current?.getBoundingClientRect();
    if(!rect)return {x:40,y:36};
    return widgetPositionFromClientPoint(clientX,clientY,rect);
  };

  const onDrop=(event:DragEvent<HTMLDivElement>)=>{
    event.preventDefault();
    const value=event.dataTransfer?.getData("application/x-hypr-widget") || draggingKindRef.current || "";
    draggingKindRef.current=null;
    if(!known.has(value))return;
    const pos=coordinate(event.clientX,event.clientY);
    add(value as WidgetKind,pos.x,pos.y);
  };

  const onPointerDown=(event:PointerEvent<HTMLDivElement>,widget:VisitorWidget)=>{
    if((event.target as HTMLElement).closest("button"))return;
    if(event.button!==0 && event.button!==undefined)return;
    originalRef.current=widgetsRef.current;
    gestureRef.current={
      id:widget.id,pointerId:event.pointerId,clientX:event.clientX,clientY:event.clientY,
      x:widget.x,y:widget.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove=(event:PointerEvent<HTMLDivElement>)=>{
    const gesture=gestureRef.current;
    const rect=canvasRef.current?.getBoundingClientRect();
    if(!gesture||gesture.pointerId!==event.pointerId||!rect?.width||!rect.height)return;
    const widget=widgetsRef.current.find((w)=>w.id===gesture.id);
    if(!widget)return;
    const moved=moveVisitorWidget(
      widget,gesture.x+(event.clientX-gesture.clientX)/rect.width*100,
      gesture.y+(event.clientY-gesture.clientY)/rect.height*100,
    );
    const next=widgetsRef.current.map(w=>w.id===gesture.id?moved:w);
    widgetsRef.current=next;
    setWidgets(next);
  };
  const finish=(event:PointerEvent<HTMLDivElement>,cancel=false)=>{
    if(gestureRef.current?.pointerId!==event.pointerId)return;
    gestureRef.current=null;
    if(cancel){
      widgetsRef.current=originalRef.current;
      setWidgets(originalRef.current);
    } else put(widgetsRef.current);
  };
  const keyboard=(event:KeyboardEvent<HTMLDivElement>,widget:VisitorWidget)=>{
    if(event.key==="Delete"||event.key==="Backspace"){
      event.preventDefault();
      put(widgetsRef.current.filter((w)=>w.id!==widget.id));
      return;
    }
    const direction:Record<string,[number,number]>={
      ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],
    };
    const offset=direction[event.key];
    if(!offset)return;
    event.preventDefault();
    const step=event.shiftKey?5:1;
    put(widgetsRef.current.map((w)=>w.id===widget.id?
      moveVisitorWidget(w,w.x+offset[0]*step,w.y+offset[1]*step):w));
  };

  return (
    <section className="hypr-widget-editor" aria-label="Editor de widgets do desktop">
      <div className="hypr-editor-heading">
        <div><strong>Monte seu desktop</strong>
          <p>Arraste um widget para a tela ou clique para adicionar. Arraste os widgets instalados para mover.</p>
        </div>
        <div className="hypr-editor-buttons">
          <button type="button" aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>
            {expanded?"Fechar tela ampliada":"Ampliar desktop"}
          </button>
          <button type="button" onClick={()=>{
            if(window.confirm("Limpar apenas o layout de widgets deste tema?"))put([]);
          }}>Limpar widgets</button>
          <button type="button" onClick={()=>{
            if(window.confirm("Restaurar o layout publicado ou importado deste tema?")){
              put(fromSourceWidgets(sourceWidgets));
            }
          }}>Restaurar referência</button>
        </div>
      </div>
      <div className={"hypr-desktop-scroll"+(expanded?" is-expanded":"")}>
        <div className={"hypr-desktop-stage hypr-desktop-"+format} ref={canvasRef}
          onDragOver={(event)=>event.preventDefault()} onDrop={onDrop}
          aria-label="Área para soltar widgets no desktop">
          {background}
          <div className="hypr-widget-position-layer" aria-label="Widgets adicionados e posicionáveis">
            {widgets.map(widget=>(
              <div key={widget.id} className="hypr-widget-position hypr-widget-interactive"
                role="group" aria-label={"Widget "+widgetNames[widget.kind]}
                tabIndex={0}
                onPointerDown={(event)=>onPointerDown(event,widget)}
                onPointerMove={onPointerMove}
                onPointerUp={(event)=>finish(event)}
                onPointerCancel={(event)=>finish(event,true)}
                onKeyDown={(event)=>keyboard(event,widget)}
                style={{
                  left:widget.x+"%",top:widget.y+"%",width:widget.width+"%",
                  height:widget.height+"%",
                }}>
                {renderWidget(widget.kind)}
                <div className="hypr-widget-actions" aria-label={"Ações do widget "+widgetNames[widget.kind]}>
                  <button type="button" aria-label={"Diminuir "+widgetNames[widget.kind]}
                    onClick={()=>put(widgetsRef.current.map(w=>w.id===widget.id?resizeVisitorWidget(w,-2):w))}>−</button>
                  <button type="button" aria-label={"Aumentar "+widgetNames[widget.kind]}
                    onClick={()=>put(widgetsRef.current.map(w=>w.id===widget.id?resizeVisitorWidget(w,2):w))}>+</button>
                  <button type="button" aria-label={"Remover "+widgetNames[widget.kind]}
                    onClick={()=>put(widgetsRef.current.filter(w=>w.id!==widget.id))}>×</button>
                </div>
              </div>
            ))}
          </div>
          {widgets.length===0&&<div className="hypr-no-layout">
            <strong>Desktop livre</strong>
            <small>Pegue um widget na coleção abaixo e solte nesta tela.</small>
          </div>}
          {expanded&&(
            <div className="hypr-expanded-tray">
              <label htmlFor="hypr-expanded-select">Adicionar widget
                <select id="hypr-expanded-select" value={expandedKind}
                  onChange={(event)=>setExpandedKind(event.target.value as WidgetKind)}>
                  {WIDGET_KINDS.map(kind=><option value={kind} key={kind}>{widgetNames[kind]}</option>)}
                </select>
              </label>
              <button type="button" onClick={()=>add(expandedKind,38,36)}>Colocar na tela</button>
              <button type="button" className="hypr-editor-close"
                onClick={()=>setExpanded(false)} aria-label="Fechar desktop ampliado">Fechar ×</button>
            </div>
          )}
        </div>
      </div>
      <p className="hypr-editor-status" role="status">{status||
        (edited?"Organização personalizada salva apenas neste navegador.":
          sourceCount?"Posições originais importadas; mova ou adicione widgets para criar sua cópia.":
            "Nenhuma posição original disponível: arraste e monte seu próprio layout.")}</p>
      <div className="hypr-widget-catalog" aria-label="Catálogo de widgets do Quickshell">
        <h4>Widgets disponíveis · arraste e solte</h4>
        <p>Use o mouse para arrastar ou clique para inserir. Após inserir, use +, −, × ou as setas do teclado.
          Os layouts são independentes para cada tema e permanecem neste navegador.</p>
        <div className="hypr-widget-catalog-grid">
          {WIDGET_KINDS.map(kind=>(
            <button type="button" className="hypr-widget-source" key={kind} draggable
              onDragStart={(event)=>{
                draggingKindRef.current=kind;
                event.dataTransfer?.setData("application/x-hypr-widget",kind);
                if(event.dataTransfer)event.dataTransfer.effectAllowed="copy";
              }} onClick={()=>add(kind)} aria-label={"Adicionar "+widgetNames[kind]}>
              {renderWidget(kind)}
            </button>
          ))}
        </div>
        <p className="hypr-widget-count">{WIDGET_KINDS.length} tipos/slots reais identificados em WallpaperLayouts.qml,
          com conteúdo visual de exemplo quando a informação pessoal não é pública.</p>
      </div>
    </section>
  );
}
