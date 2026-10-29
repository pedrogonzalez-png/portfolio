import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HyprlandShowcase } from "../components/HyprlandShowcase";
import { OFFICIAL_THEMES } from "../stores/themes";

beforeEach(()=>localStorage.clear());
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});
describe("finished Hyprland gallery and dissolving transition",()=>{
  it("offers five finished presets, without editors or custom theme creation",()=>{
    render(<HyprlandShowcase themes={OFFICIAL_THEMES} selectedId="changli"/>);
    const gallery=screen.getByRole("navigation",{name:"Escolher tema pronto"});
    expect(gallery.querySelectorAll("button")).toHaveLength(5);
    for(const theme of OFFICIAL_THEMES)expect(screen.getByRole("button",{name:theme.name})).toBeInTheDocument();
    for(const name of ["Adicionar Relógio","Ampliar desktop","Restaurar referência","Limpar widgets"]){
      expect(screen.queryByRole("button",{name})).not.toBeInTheDocument();
    }
    expect(screen.queryByLabelText("Carregar wallpaper correto da Hiyuki")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Importar posições do Quickshell")).not.toBeInTheDocument();
  });
  it("removes the outgoing desktop from right to left and displays colored fragments",()=>{
    const changed=vi.fn();
    const {container}=render(<HyprlandShowcase themes={OFFICIAL_THEMES} selectedId="changli" onChoose={changed}/>);
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    expect(changed).toHaveBeenCalledWith(OFFICIAL_THEMES[1]);
    expect(container.querySelector(".preset-dissolve-out")).not.toBeNull();
    expect(container.querySelectorAll(".preset-dissolve-dust span")).toHaveLength(90);
    expect(screen.getAllByText(/Hiyuki —/).length).toBeGreaterThan(0);
    const outgoing=container.querySelector(".preset-dissolve-out")!;
    fireEvent.animationEnd(outgoing);
    expect(container.querySelector(".preset-dissolve-out")).toBeNull();
  });
  it("preserves published positions in read-only presentation, with no misleading private data",()=>{
    const {container}=render(<HyprlandShowcase selectedId="changli"/>);
    const first=container.querySelector('[data-changli-slot="notes"]') as HTMLElement;
    expect(first.style.left).toMatch(/%/);
    expect(first.style.top).toMatch(/%/);
    expect(container.querySelectorAll("[data-changli-slot]").length).toBe(11);
    expect(screen.queryByText(/CPU —/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Conteúdo privado/)).not.toBeInTheDocument();
  });
  it("shows correct Hiyuki source without loading the old incorrect video",()=>{
    const {container}=render(<HyprlandShowcase selectedId="changli"/>);
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    const link=screen.getByRole("link",{name:/Wallpaper original Hiyuki/});
    expect(link).toHaveAttribute("href",expect.stringContaining("hiyuki-entrust-your-wishes-to-me"));
    expect(container.querySelector("video")).toBeNull();
  });
  it("offers layout variants but not a visitor widget builder",()=>{
    render(<HyprlandShowcase selectedId="changli"/>);
    const combo=screen.getByRole("combobox",{name:"Outras composições prontas"});
    expect(combo.querySelectorAll("option")).toHaveLength(4);
    fireEvent.change(combo,{target:{value:"changli-2"}});
    expect(combo).toHaveValue("changli-2");
  });
});
