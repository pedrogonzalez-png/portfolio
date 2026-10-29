import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../stores/ThemeProvider";
import Pages from "../app/pages";

vi.mock("../components/ProjectPanel", () => ({
  ProjectPanel: ({onOpenThemeStudio}: {onOpenThemeStudio?:()=>void}) =>
    <button type="button" onClick={onOpenThemeStudio}>Abrir Hyprland-Themes do carrossel</button>,
}));
vi.mock("../components/SceneIntegration", () => ({default:()=>null}));
vi.mock("../components/KnowledgeTree", () => ({KnowledgeTree:()=>null}));

beforeEach(()=>window.localStorage.clear());
afterEach(()=>{window.localStorage.clear();vi.restoreAllMocks();vi.unstubAllGlobals();});

describe("Hyprland-Themes on its own page",()=>{
  it("opens /hyprland-themes directly without rendering the portfolio home inside it",async()=>{
    const {container}=render(
      <MemoryRouter initialEntries={["/hyprland-themes"]}>
        <ThemeProvider><Pages/></ThemeProvider>
      </MemoryRouter>,
    );
    await screen.findByRole("region",{name:"Exposição dos temas Hyprland"});
    expect(container.querySelector("main.hyprland-dedicated-page")).not.toBeNull();
    expect(screen.queryByText("Uma jornada por projetos, código e criatividade")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button",{name:/Voltar aos projetos/})).toBeInTheDocument();
  });

  it("disintegrates the CURRENT portfolio viewport on Hyprland project entry, then returns",async()=>{
    const {container}=render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider><Pages/></ThemeProvider>
      </MemoryRouter>,
    );
    const original=container.querySelector(".hyprland-route-home");
    expect(original).not.toBeNull();
    expect(container.querySelector(".preset-disintegrating-idle")).not.toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Abrir Hyprland-Themes do carrossel"}));
    await screen.findByRole("region",{name:"Exposição dos temas Hyprland"});
    expect(container.querySelector("main.hyprland-dedicated-page")).not.toBeNull();
    // The home page is the outgoing DOM, not a copy of a wallpaper.
    expect(container.querySelector(".hyprland-route-home.is-leaving")).toBe(original);
    expect(container.querySelector(".preset-fractured-desktop .site-main")).not.toBeNull();
    expect(container.querySelectorAll(".hyprland-route-home .preset-fracture-cell")).toHaveLength(720);
    expect(container.querySelectorAll(".hyprland-route-home .preset-fragment")).toHaveLength(260);
    expect(container.querySelector(".hyprland-dedicated-page .preset-fracture-cell")).toBeNull();
    fireEvent.animationEnd(container.querySelector(".preset-disintegration-lifetime")!);
    expect(container.querySelector(".hyprland-route-home")).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:/Voltar aos projetos/}));
    expect(await screen.findByRole("button",{name:"Abrir Hyprland-Themes do carrossel"})).toBeInTheDocument();
    expect(container.querySelector("main.hyprland-dedicated-page")).toBeNull();
  });

  it("navigates immediately without disintegration when reduced motion is preferred", async()=>{
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches:true,
      addListener:vi.fn(),
      removeListener:vi.fn(),
      addEventListener:vi.fn(),
      removeEventListener:vi.fn(),
    })));
    const {container}=render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider><Pages/></ThemeProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button",{name:"Abrir Hyprland-Themes do carrossel"}));
    await screen.findByRole("region",{name:"Exposição dos temas Hyprland"});
    expect(container.querySelector(".hyprland-route-home")).toBeNull();
    expect(container.querySelector(".preset-fracture-cell")).toBeNull();
  });
});
