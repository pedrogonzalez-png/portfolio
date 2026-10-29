import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
    expect(container.querySelector("img.real-desktop-wallpaper")).toHaveAttribute(
      "src",expect.stringContaining("hutuki.mp4.jpg"),
    );
    fireEvent.click(screen.getByRole("button",{name:/Hsin/}));
    expect(container.querySelector("img.real-desktop-wallpaper")).toHaveAttribute(
      "src",expect.stringContaining("/wallpapers/hsin.png"),
    );
    expect(screen.getByText(/JSON de cores Hsin não está publicado/)).toBeInTheDocument();
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("does not claim unpublished widget positions or invent private text", () => {
    render(<HyprlandShowcase themes={OFFICIAL_THEMES} selectedId="changli" onChoose={vi.fn()}/>);
    expect(screen.getByText(/Posições reais não publicadas/)).toBeInTheDocument();
    expect(screen.getByText(/Importe o arquivo de layouts/)).toBeInTheDocument();
    expect(screen.getByLabelText("Importar posições do Quickshell")).toBeInTheDocument();
    expect(screen.getByText(/Conteúdo privado/)).toBeInTheDocument();
    expect(screen.getByText(/CPU — · RAM —/)).toBeInTheDocument();
    expect(screen.getByText(/Clima · sem dados/)).toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Exportar snapshot público sem dados privados"}))
      .not.toBeInTheDocument();
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
