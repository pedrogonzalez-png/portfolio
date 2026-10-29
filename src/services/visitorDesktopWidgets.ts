/** Visitor widget layouts are independent of the owner's readonly QML profiles.
 * Never overwrite or publish the source desktop positions. */
import { WIDGET_KINDS, type WidgetKind, type WidgetPlacement } from "./quickshellLayoutImport";
export type VisitorWidget = WidgetPlacement & { id: string };
const PREFIX = "portfolio.viewer.widgets.v1:";
export const MAX_VISITOR_WIDGETS = 24;

const known = new Set<string>(WIDGET_KINDS);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const validTheme = (s: string) => /^[a-z0-9-]{1,64}$/.test(s);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function validVisitorWidgets(value: unknown): value is VisitorWidget[] {
  if (!Array.isArray(value) || value.length > MAX_VISITOR_WIDGETS) return false;
  const ids=new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") return false;
    const p=item as Partial<VisitorWidget>;
    if (typeof p.id !== "string" || !/^widget-[\w-]{3,80}$/.test(p.id) || ids.has(p.id) ||
        typeof p.kind !== "string" || !known.has(p.kind) ||
        ![p.x,p.y,p.width,p.height].every(finite) ||
        p.x! < -10 || p.x! > 110 || p.y! < -10 || p.y! > 110 ||
        p.width! < 4 || p.width! > 40 || p.height! < 6 || p.height! > 100) return false;
    ids.add(p.id);
  }
  return true;
}
export function loadVisitorWidgets(theme: string): VisitorWidget[] | null {
  if (!validTheme(theme)) return null;
  try {
    const raw=window.localStorage.getItem(PREFIX+theme);
    if(raw===null)return null;
    const value:unknown=JSON.parse(raw);
    return validVisitorWidgets(value)?value:null;
  }catch{return null;}
}
export function saveVisitorWidgets(theme: string, widgets: VisitorWidget[]): void {
  if (!validTheme(theme) || !validVisitorWidgets(widgets))
    throw new Error("Organização inválida ou número máximo de widgets excedido.");
  window.localStorage.setItem(PREFIX+theme,JSON.stringify(widgets));
}
export function createVisitorWidget(kind: WidgetKind,x=42,y=39): VisitorWidget {
  const id=typeof crypto!=="undefined" && typeof crypto.randomUUID==="function"
    ? crypto.randomUUID() : Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
  return {
    id:"widget-"+id,
    kind,
    x:clamp(x,0,90),y:clamp(y,0,90),
    width:kind==="clock"?17:kind.startsWith("imageCard")?17:14,
    height:kind==="clock"?19:kind.startsWith("imageCard")?17:16,
  };
}
export function fromSourceWidgets(widgets: WidgetPlacement[]|undefined): VisitorWidget[] {
  return (widgets??[]).slice(0,MAX_VISITOR_WIDGETS).map((item,i)=>({
    ...item,id:"widget-imported-"+i,
    x:clamp(item.x,-10,110),y:clamp(item.y,-10,110),
    width:clamp(item.width,4,40),height:clamp(item.height,6,100),
  }));
}
export function moveVisitorWidget(widget: VisitorWidget,x: number,y: number): VisitorWidget {
  return { ...widget,x:clamp(x,0,100-widget.width),y:clamp(y,0,100-widget.height) };
}
export function resizeVisitorWidget(widget:VisitorWidget,delta:number):VisitorWidget {
  const width=clamp(widget.width+delta,6,38);
  const height=clamp(widget.height+delta*0.66,7,95);
  return moveVisitorWidget({...widget,width,height},widget.x,widget.y);
}

/** Convert desktop drop pixels into coordinates, independent of DOM APIs. */
export function widgetPositionFromClientPoint(
  clientX:number,clientY:number,rect:{left:number;top:number;width:number;height:number},
):{x:number;y:number}{
  if(!Number.isFinite(rect.width)||!Number.isFinite(rect.height)||rect.width<=0||rect.height<=0)
    return {x:40,y:36};
  return {
    x:(clientX-rect.left)/rect.width*100,
    y:(clientY-rect.top)/rect.height*100,
  };
}
