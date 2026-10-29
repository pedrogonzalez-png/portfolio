import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { DesktopWidgetEditor } from "../components/DesktopWidgetEditor";
import { WIDGET_KINDS, type WidgetKind } from "../services/quickshellLayoutImport";
import { loadVisitorWidgets, saveVisitorWidgets, validVisitorWidgets } from "../services/visitorDesktopWidgets";

const names=Object.fromEntries(WIDGET_KINDS.map(k=>[k,k])) as Record<WidgetKind,string>;
const renderEditor=(themeId="changli")=>render(
  <DesktopWidgetEditor key={themeId} themeId={themeId} format="ultrawide"
    background={<div data-testid="wallpaper"/>}
    renderWidget={kind=><span>{kind}</span>} widgetNames={names}/>,
);
beforeEach(()=>localStorage.clear());
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});

describe("M6 draggable user widgets",()=>{
  it("adds a widget on click, supports keyboard movement and persists on theme-specific key",()=>{
    renderEditor();
    const stage=screen.getByLabelText("Widgets adicionados e posicionáveis");
    expect(within(stage).queryByRole("group",{name:"Widget clock"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Adicionar clock"}));
    const widget=within(stage).getByRole("group",{name:"Widget clock"});
    expect(widget).toHaveStyle({left:"40%",top:"36%"});
    fireEvent.keyDown(widget,{key:"ArrowRight"});
    expect(within(stage).getByRole("group",{name:"Widget clock"})).toHaveStyle({left:"41%"});
    expect(loadVisitorWidgets("changli")?.[0].x).toBe(41);
    expect(loadVisitorWidgets("hiyuki")).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Remover clock"}));
    expect(within(stage).queryByRole("group",{name:"Widget clock"})).not.toBeInTheDocument();
  });

  it("drops cards at actual pointer coordinates inside the large desktop",()=>{
    const {container}=renderEditor();
    const stage=container.querySelector(".hypr-desktop-stage") as HTMLDivElement;
    vi.spyOn(stage,"getBoundingClientRect").mockReturnValue({
      left:100,top:100,width:1000,height:420,
      right:1100,bottom:520,x:100,y:100,toJSON:()=>({}),
    });
    fireEvent.drop(stage,{
      clientX:600,clientY:310,
      dataTransfer:{getData:(type:string)=>type==="application/x-hypr-widget"?"calendar":""},
    });
    expect(loadVisitorWidgets("changli")?.[0]).toMatchObject({kind:"calendar",x:50,y:50});
  });

  it("repositions with mouse pointer events and permits changing widget dimensions",()=>{
    const {container}=renderEditor();
    fireEvent.click(screen.getByRole("button",{name:"Adicionar weather"}));
    const stage=container.querySelector(".hypr-desktop-stage") as HTMLDivElement;
    vi.spyOn(stage,"getBoundingClientRect").mockReturnValue({
      left:0,top:0,width:1000,height:500,right:1000,bottom:500,x:0,y:0,toJSON:()=>({}),
    });
    const widget=screen.getByRole("group",{name:"Widget weather"});
    fireEvent.pointerDown(widget,{button:0,pointerId:1,clientX:200,clientY:150});
    fireEvent.pointerMove(widget,{pointerId:1,clientX:300,clientY:200});
    fireEvent.pointerUp(widget,{pointerId:1,clientX:300,clientY:200});
    expect(loadVisitorWidgets("changli")?.[0].x).toBe(50);
    expect(loadVisitorWidgets("changli")?.[0].y).toBe(46);
    const width=loadVisitorWidgets("changli")?.[0].width??0;
    fireEvent.click(screen.getByRole("button",{name:"Aumentar weather"}));
    expect(loadVisitorWidgets("changli")?.[0].width).toBeGreaterThan(width);
  });

  it("switches to a larger screen and protects layouts against invalid local storage",()=>{
    renderEditor();
    fireEvent.click(screen.getByRole("button",{name:"Ampliar desktop"}));
    expect(screen.getByRole("button",{name:"Fechar tela ampliada"})).toHaveAttribute("aria-pressed","true");
    fireEvent.keyDown(window,{key:"Escape"});
    expect(screen.getByRole("button",{name:"Ampliar desktop"})).toBeInTheDocument();
    expect(validVisitorWidgets([{id:"widget-a",kind:"script",x:0,y:0,width:10,height:10}])).toBe(false);
    expect(()=>saveVisitorWidgets("../secrets",[])).toThrow();
  });

  it("never overwrites an imported original: updates live in a separate per-visitor key",()=>{
    const imported={schemaVersion:1,source:"sanitized-quickshell",profiles:[
      {themeId:"changli",widgets:[{kind:"clock",x:30,y:20,width:14,height:17}]},
    ]};
    localStorage.setItem("portfolio.hyprland.sanitized.layout.v1",JSON.stringify(imported));
    render(<DesktopWidgetEditor themeId="changli" format="ultrawide"
      sourceWidgets={imported.profiles[0].widgets as {kind:WidgetKind;x:number;y:number;width:number;height:number}[]}
      background={<div/>} renderWidget={kind=><span>{kind}</span>} widgetNames={names}/>);
    expect(screen.getByRole("group",{name:"Widget clock"})).toHaveStyle({left:"30%"});
    fireEvent.keyDown(screen.getByRole("group",{name:"Widget clock"}),{key:"ArrowRight"});
    expect(localStorage.getItem("portfolio.hyprland.sanitized.layout.v1")).toBe(JSON.stringify(imported));
    expect(loadVisitorWidgets("changli")?.[0].x).toBe(31);
  });
});
