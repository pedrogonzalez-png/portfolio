import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { OFFICIAL_THEMES } from "../stores/themes";
import { ThemeStudio } from "../components/ThemeStudio";
import { HyprlandShowcase } from "../components/HyprlandShowcase";

beforeEach(() => window.localStorage.clear());
afterEach(() => { window.localStorage.clear(); vi.restoreAllMocks(); });

describe("Hyprland as the viewer and Configurações as the editor", () => {
  it("opens on Hyprland, offers five published themes, and keeps Settings separate", () => {
    render(<ThemeProvider><ThemeStudio onClose={() => {}} /></ThemeProvider>);
    expect(screen.getByRole("tab", { name:"Hyprland" })).toHaveAttribute("aria-selected","true");
    expect(screen.getByRole("region", {name:"Hyprland — temas e widgets do autor"})).toBeInTheDocument();
    const gallery = screen.getByRole("group", {name:"Escolher tema do desktop"});
    for(const t of OFFICIAL_THEMES){
      expect(within(gallery).getByRole("button", {name:t.name})).toBeInTheDocument();
    }
    expect(within(gallery).getByRole("button", {name:/Hsin/})).toBeInTheDocument();
    expect(screen.queryByRole("group", {name:"Cinco temas oficiais"})).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", {name:"Configurações"}));
    expect(screen.getByRole("group", {name:"Cinco temas oficiais"})).toBeInTheDocument();
    expect(screen.queryByRole("region", {name:"Hyprland — temas e widgets do autor"})).not.toBeInTheDocument();
  });

  it("loads Hiyuki and Hsin public wallpapers while being clear about Hsin's missing palette", () => {
    const change=vi.fn();
    const {container}=render(
      <HyprlandShowcase themes={OFFICIAL_THEMES} selectedId="changli" onChoose={change}/>,
    );
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    // The earlier hutuki video is not the MoeWalls wallpaper chosen by the owner.
    expect(container.querySelector("img.real-desktop-wallpaper")).toBeNull();
    expect(screen.getByRole("link",{name:/ver wallpaper original no MoeWalls/}))
      .toHaveAttribute("href",expect.stringContaining("hiyuki-entrust-your-wishes-to-me"));
    expect(screen.getByLabelText("Carregar wallpaper correto da Hiyuki")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:/Hsin/}));
    expect(container.querySelector("img.real-desktop-wallpaper")).toHaveAttribute(
      "src",expect.stringContaining("/wallpapers/hsin.png"),
    );
    expect(screen.getByText(/JSON de cores Hsin não está publicado/)).toBeInTheDocument();
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("shows sanitized real widget positions without inventing private text", () => {
    render(<HyprlandShowcase themes={OFFICIAL_THEMES} selectedId="changli" onChoose={vi.fn()}/>);
    expect(screen.getByText(/Posições QML importadas disponíveis/)).toBeInTheDocument();
    expect(screen.getByText(/Posições originais importadas/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Importar posições do Quickshell")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Conteúdo privado/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CPU — · RAM —/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Clima · sem dados/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button",{name:"Exportar snapshot público sem dados privados"}))
      .not.toBeInTheDocument();
  });

  it("keeps unsaved personal color edits when switching between the two tabs", () => {
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    fireEvent.click(screen.getByRole("tab",{name:"Configurações"}));
    const options=within(screen.getByRole("group",{name:"Cinco temas oficiais"}));
    fireEvent.click(options.getByRole("button",{name:/Changli/}));
    fireEvent.click(screen.getByRole("button",{name:"Duplicar Changli"}));
    const input=screen.getByRole("textbox",{name:"Nome do meu tema"});
    fireEvent.change(input,{target:{value:"Meu layout experimental"}});
    fireEvent.click(screen.getByRole("tab",{name:"Hyprland"}));
    fireEvent.click(screen.getByRole("tab",{name:"Configurações"}));
    expect(screen.getByRole("textbox",{name:"Nome do meu tema"}))
      .toHaveValue("Meu layout experimental");
    expect(screen.getByRole("button",{name:"Salvar alterações"})).toBeEnabled();
  });

  it("imports real positions in Configurações and displays them in Hyprland without private paths", async () => {
    const {container}=render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(screen.getByRole("region",{name:"Hyprland — temas e widgets do autor"}))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Importar posições do Quickshell")).not.toBeVisible();
    fireEvent.click(screen.getByRole("tab",{name:"Configurações"}));

    const raw={
      version:1,
      profiles:{
        "/home/private/wallpapers/changli.mp4":{
          clock:{enable:true,x:1720,y:360},
          notes:{enable:true,x:250,y:380,text:"Do not publish this personal note"},
        },
      },
    };
    const file=new File([JSON.stringify(raw)],"wallpaper_widget_layouts.json",{type:"application/json"});
    Object.defineProperty(file,"text",{value:async()=>JSON.stringify(raw)});
    fireEvent.change(screen.getByLabelText("Importar posições do Quickshell"),{
      target:{files:[file]},
    });
    await waitFor(()=>{
      expect(screen.getByText(/1 perfil\(is\) importado\(s\)/)).toBeInTheDocument();
    });
    const stored=window.localStorage.getItem("portfolio.hyprland.sanitized.layout.v1")||"";
    expect(stored).not.toContain("/home/private/");
    expect(stored).not.toContain("personal note");
    expect(screen.getByRole("button",{name:"Exportar snapshot público sem dados privados"}))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab",{name:"Hyprland"}));
    const layer=container.querySelector(".hypr-widget-position-layer");
    expect(layer).not.toBeNull();
    const first=layer?.querySelector(".hypr-widget-position") as HTMLElement;
    expect(first.style.left).toBe("50%");
    expect(first.style.top).toBe("25%");
  });

  it("limits animated wallpaper to the Hyprland viewer, not Settings", () => {
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(screen.getByRole("button",{name:"Ativar wallpaper animado"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab",{name:"Configurações"}));
    fireEvent.click(screen.getByRole("button",{name:"Abrir desktop ampliado"}));
    const desktop = screen.getByRole("region",{name:"Desktop simulado"});
    expect(within(desktop).queryByRole("button",{name:"Ativar wallpaper animado"}))
      .not.toBeInTheDocument();
  });
});
