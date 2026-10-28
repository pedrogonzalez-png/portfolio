import { describe, expect, it, vi } from "vitest";

vi.mock("../components/SpineWorld", () => ({ SpineWorld: () => null }));
import { fireEvent, render, screen } from "@testing-library/react";
import { ProjectPanel } from "../components/ProjectPanel";
import { TopMenu } from "../components/TopMenu";
import { ThemeProvider } from "../stores/ThemeProvider";
import { MemoryRouter } from "react-router-dom";

describe("three-panel carousel", () => {
  it("renders only the three allowlisted projects with Abismo centered initially", () => {
    render(<ProjectPanel />);
    const current = screen.getByRole("button", { name: /Abrir detalhes de Abismo/ });
    expect(current).toHaveAttribute("data-position", "center");
    expect(screen.getByRole("button", { name: /Trazer site-3D para o centro/ })).toHaveAttribute("data-position", "right");
    expect(screen.getByRole("button", { name: /Trazer Hyprland-Themes para o centro/ })).toHaveAttribute("data-position", "left");
    expect(screen.queryByText(/dotfiles-Arch/i)).not.toBeInTheDocument();
  });

  it("rotates roles with navigation controls, and opens only the centered project", () => {
    render(<ProjectPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Próximo projeto" }));

    const centered = screen.getByRole("button", { name: /Abrir detalhes de site-3D/ });
    expect(centered).toHaveAttribute("data-position", "center");
    expect(screen.getByRole("button", { name: /Trazer Abismo para o centro/ })).toHaveAttribute("data-position", "left");
    expect(screen.getByRole("button", { name: /Trazer Hyprland-Themes para o centro/ })).toHaveAttribute("data-position", "right");

    fireEvent.click(centered);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Sem demonstração publicada/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver código no GitHub/ }))
      .toHaveAttribute("href", "https://github.com/pedrogonzalez-png/site-3D");
    fireEvent.click(screen.getByRole("button", { name: "Fechar projeto" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(centered).toHaveFocus();
  });

  it("brings a side project to the center instead of opening its modal", () => {
    render(<ProjectPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Trazer Hyprland-Themes para o centro/ }));
    expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ }))
      .toHaveAttribute("data-position", "center");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens Hyprland Theme Studio on card click, leaving other project details intact", () => {
    const openStudio = vi.fn();
    render(<ProjectPanel onOpenThemeStudio={openStudio} />);
    fireEvent.click(screen.getByRole("button", { name: /Trazer Hyprland-Themes para o centro/ }));
    expect(openStudio).not.toHaveBeenCalled();
    const card = screen.getByRole("button", { name: "Abrir Theme Studio de Hyprland-Themes" });
    expect(card).toHaveAttribute("data-position", "center");
    fireEvent.click(card);
    expect(openStudio).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Projeto anterior" }));
    fireEvent.click(screen.getByRole("button", { name: /Abrir detalhes de site-3D/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("responds to wheel input while centered in view and releases scrolling at the final project", () => {
    render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    vi.spyOn(carousel, "getBoundingClientRect").mockReturnValue({
      top: 180, bottom: 600, left: 0, right: 1100, width: 1100, height: 420,
      x: 0, y: 180, toJSON: () => ({}),
    });
    const first = fireEvent.wheel(carousel, { deltaY: 110, deltaMode: 0, cancelable: true });
    expect(first).toBe(false); // preventDefault when changing project
    expect(screen.getByRole("button", { name: /Abrir detalhes de site-3D/ }))
      .toHaveAttribute("data-position", "center");
  });

  it("supports arrow-key navigation without trapping page scroll", () => {
    render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /Abrir detalhes de site-3D/ }))
      .toHaveAttribute("data-position", "center");
    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: /Abrir detalhes de Abismo/ }))
      .toHaveAttribute("data-position", "center");
  });
});

describe("header navigation", () => {
  it("keeps Projects in the menu without a competing Themes button", () => {
    render(<MemoryRouter><ThemeProvider><TopMenu onOpenTerminal={() => {}} /></ThemeProvider></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Projetos" })).toHaveAttribute("href", "#projetos");
    expect(screen.queryByRole("button", { name: /Temas|Theme Studio/i })).not.toBeInTheDocument();
  });
});
