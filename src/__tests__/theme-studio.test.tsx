import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES, THEME_STORAGE_KEY } from "../stores/themes";
import { GALLERY_THEMES } from "../config/themeShelfMedia";
import { ThemeStudio } from "../components/ThemeStudio";

beforeEach(()=>localStorage.clear());
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});

function Probe(){
  const {theme,accentColor}=useTheme();
  return <span data-testid="theme-probe">{theme.name+"|"+(accentColor??"default")}</span>;
}
describe("preset-only theme experience",()=>{
  it("preserves the five official palettes unchanged",()=>{
    expect(OFFICIAL_THEMES.map(t=>t.name)).toEqual([
      "Changli","Hiyuki","Emilia","Furina","Hotline Miami",
    ]);
    expect(OFFICIAL_THEMES.map(t=>t.palette.accentPrimary)).toEqual([
      "#C96A42","#C96A85","#B787FF","#9dc7ff","#f10d6e",
    ]);
    expect(OFFICIAL_THEMES.every(t=>Object.isFrozen(t.palette))).toBe(true);
  });
  it("changes the selected official theme directly and persists the selection",()=>{
    render(<ThemeProvider><Probe/><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    expect(screen.getByTestId("theme-probe")).toHaveTextContent("Hiyuki|default");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("hiyuki");
    expect(screen.getByRole("region",{name:"Exposição dos temas Hyprland"})).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("applies and persists the original palette of ALL ten CDs globally", () => {
    const {container}=render(
      <ThemeProvider><Probe/><ThemeStudio onClose={()=>{}}/></ThemeProvider>,
    );
    const root=document.documentElement;
    expect(root.dataset.theme).toBe("changli");
    expect(root.style.getPropertyValue("--color-accent-primary"))
      .toBe(GALLERY_THEMES[0].palette.accentPrimary);

    for (let index=1; index<GALLERY_THEMES.length; index++) {
      fireEvent.click(screen.getByRole("button",{name:"Próximo tema"}));
      const chosen=GALLERY_THEMES[index];
      expect(screen.getByTestId("theme-probe")).toHaveTextContent(chosen.name+"|default");
      expect(root.dataset.theme).toBe(chosen.id);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(chosen.id);
      expect(root.style.getPropertyValue("--color-bg")).toBe(chosen.palette.bg);
      expect(root.style.getPropertyValue("--color-accent-primary"))
        .toBe(chosen.palette.accentPrimary);
      expect(container.querySelector("#theme-studio"))
        .toHaveStyle({"--color-bg":chosen.palette.bg,
          "--color-accent-primary":chosen.palette.accentPrimary});
    }
  });

  it("discards a stale accent override when a CD is selected", () => {
    localStorage.setItem("portfolio.theme.accent.v1","#123456");
    const {unmount}=render(
      <ThemeProvider><Probe/><ThemeStudio onClose={()=>{}}/></ThemeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary"))
      .toBe("#123456");
    for(let index=0;index<5;index++) {
      fireEvent.click(screen.getByRole("button",{name:"Próximo tema"}));
    }
    expect(document.documentElement.dataset.theme).toBe("hsin");
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary"))
      .toBe("#d94639");
    expect(localStorage.getItem("portfolio.theme.accent.v1")).toBeNull();
    unmount();
    render(<ThemeProvider><Probe/></ThemeProvider>);
    expect(screen.getByTestId("theme-probe")).toHaveTextContent("Hsin|default");
    expect(document.documentElement.dataset.theme).toBe("hsin");
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary"))
      .toBe("#d94639");
  });

  it("removes the entire color customization strip from the Hyprland page",()=>{
    const {container}=render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(container.querySelector(".preset-color-only")).toBeNull();
    expect(screen.queryByLabelText("Cor de destaque")).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Restaurar cor original"})).not.toBeInTheDocument();
  });
  it("offers no builder, clone, named versions, movable widgets, or custom scheme controls",()=>{
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    for(const name of ["Duplicar Changli","Abrir desktop ampliado","Criar versão do layout salvo",
      "Adicionar Relógio","Salvar alterações"]){
      expect(screen.queryByRole("button",{name})).not.toBeInTheDocument();
    }
    expect(screen.queryByLabelText("Importar posições do Quickshell")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox",{name:"Nome do meu tema"})).not.toBeInTheDocument();
  });
  it("presents one clear exhibition headline without a color customization strip",()=>{
    const {container}=render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(screen.getByRole("heading",{name:/Seu desktop, outros universos/})).toBeInTheDocument();
    expect(container.querySelectorAll(".preset-studio-heading h1")).toHaveLength(1);
    expect(container.querySelectorAll(".preset-gallery-intro h3")).toHaveLength(0);
    expect(container.querySelector(".preset-studio-topline .preset-studio-exit")).not.toBeNull();
    expect(container.querySelector(".preset-color-only")).toBeNull();
    expect(container.querySelectorAll(".preset-theme-choices button")).toHaveLength(10);
  });
  it("applies the original palette to the whole exhibition, not just the CD frame", () => {
    const {container}=render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    const section=container.querySelector("#theme-studio")!;
    expect(section).toHaveStyle({"--color-accent-primary":"#ca5230"});
    expect(section).toHaveStyle({"--quickshell-dark-surface-dim":"#110A0B"});
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    expect(section).toHaveStyle({"--color-accent-primary":"#C96A85"});
    fireEvent.click(screen.getByRole("button",{name:"Próximo tema"}));
    expect(section).toHaveStyle({"--color-accent-primary":"#b787ff"});
  });

  it("returns to projects through the top navigation",()=>{
    const close=vi.fn();
    render(<ThemeProvider><ThemeStudio onClose={close}/></ThemeProvider>);
    fireEvent.click(screen.getByRole("button",{name:/Voltar aos projetos/}));
    expect(close).toHaveBeenCalledOnce();
  });
});
