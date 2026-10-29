import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES, THEME_STORAGE_KEY } from "../stores/themes";
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
  it("lets visitors change ONLY accent color and restore the preset original",()=>{
    const base=OFFICIAL_THEMES[0].palette.accentPrimary;
    render(<ThemeProvider><Probe/><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    fireEvent.change(screen.getByLabelText("Cor de destaque"),{target:{value:"#1358ba"}});
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary")).toBe("#1358ba");
    expect(screen.getByTestId("theme-probe")).toHaveTextContent("Changli|#1358ba");
    expect(localStorage.getItem("portfolio.theme.accent.v1")).toBe("#1358ba");
    fireEvent.click(screen.getByRole("button",{name:"Restaurar cor original"}));
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary")).toBe(base);
    expect(localStorage.getItem("portfolio.theme.accent.v1")).toBeNull();
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
  it("presents one clear exhibition headline and a compact, accent-only control",()=>{
    const {container}=render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(screen.getByRole("heading",{name:/Seu desktop, outros universos/})).toBeInTheDocument();
    expect(container.querySelectorAll(".preset-studio-heading h1")).toHaveLength(1);
    expect(container.querySelectorAll(".preset-gallery-intro h3")).toHaveLength(0);
    expect(container.querySelector(".preset-studio-topline .preset-studio-exit")).not.toBeNull();
    expect(container.querySelector(".preset-color-only .preset-color-control")).not.toBeNull();
    expect(container.querySelectorAll(".preset-theme-choices button")).toHaveLength(5);
  });
  it("returns to projects through the top navigation",()=>{
    const close=vi.fn();
    render(<ThemeProvider><ThemeStudio onClose={close}/></ThemeProvider>);
    fireEvent.click(screen.getByRole("button",{name:/Voltar aos projetos/}));
    expect(close).toHaveBeenCalledOnce();
  });
});
