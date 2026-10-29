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
afterEach(()=>{window.localStorage.clear();vi.restoreAllMocks();});

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

  it("navigates from the portfolio project to the dedicated page and back",async()=>{
    const {container}=render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider><Pages/></ThemeProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button",{name:"Abrir Hyprland-Themes do carrossel"}));
    await screen.findByRole("region",{name:"Exposição dos temas Hyprland"});
    expect(container.querySelector("main.hyprland-dedicated-page")).not.toBeNull();
    fireEvent.click(screen.getByRole("button",{name:/Voltar aos projetos/}));
    expect(await screen.findByRole("button",{name:"Abrir Hyprland-Themes do carrossel"})).toBeInTheDocument();
    expect(container.querySelector("main.hyprland-dedicated-page")).toBeNull();
  });
});
