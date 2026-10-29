import { describe, expect, it, vi } from "vitest";

vi.mock("../components/SpineWorld", () => ({ SpineWorld: () => null }));
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProjectPanel } from "../components/ProjectPanel";
import { TopMenu } from "../components/TopMenu";
import { ThemeProvider } from "../stores/ThemeProvider";
import { MemoryRouter } from "react-router-dom";

describe("three-panel carousel", () => {
  it("renders only the three allowlisted projects with Abismo centered initially", () => {
    render(<ProjectPanel />);
    const current = screen.getByRole("button", { name: /Jogar Abismo no card/ });
    expect(current).toHaveAttribute("data-position", "center");
    expect(screen.getByRole("button", { name: /Trazer site-3D para o centro/ })).toHaveAttribute("data-position", "right");
    expect(screen.getByRole("button", { name: /Trazer Hyprland-Themes para o centro/ })).toHaveAttribute("data-position", "left");
    expect(screen.queryByText(/dotfiles-Arch/i)).not.toBeInTheDocument();
  });


  it("opens the real Abismo game viewport INSIDE the centered card, not a dialog", async () => {
    const { container } = render(<ProjectPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Abismo no card" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.querySelector(".spine-stage.is-abismo-playing")).not.toBeNull();
    expect(screen.getByRole("region", { name: "Abismo — jogo integrado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar aos projetos" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Projeto anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próximo projeto" })).not.toBeInTheDocument();
    expect(screen.queryByText("01 / 03")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar aos projetos" }));
    expect(container.querySelector(".spine-stage.is-abismo-closing")).not.toBeNull();
    expect(screen.getByRole("region", { name: "Abismo — jogo integrado" })).toBeInTheDocument();
    fireEvent.animationEnd(screen.getByRole("region", { name: "Abismo — jogo integrado" }), {
      animationName: "abismo-card-retreat",
    });
    expect(container.querySelector(".spine-stage.is-abismo-closing")).toBeNull();
    expect(screen.getByRole("button", { name: "Projeto anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jogar Abismo no card" })).toBeInTheDocument();
  });

  it("disables carousel navigation while the playable Abismo card is expanded", () => {
    render(<ProjectPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Jogar Abismo no card" }));
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    expect(screen.queryByRole("button", { name: "Projeto anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próximo projeto" })).not.toBeInTheDocument();
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(screen.getByRole("region", { name: "Abismo — jogo integrado" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("region", { name: "Abismo — jogo integrado" })).toBeInTheDocument();
    fireEvent.animationEnd(screen.getByRole("region", { name: "Abismo — jogo integrado" }), {
      animationName: "abismo-card-retreat",
    });
    expect(screen.queryByRole("region", { name: "Abismo — jogo integrado" })).not.toBeInTheDocument();
  });

  it("rotates the carousel then opens site-3D inside its own card", async () => {
    const { container } = render(<ProjectPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Próximo projeto" }));
    const centered = screen.getByRole("button", { name: "Explorar site-3D no card" });
    expect(centered).toHaveAttribute("data-position", "center");
    expect(screen.getByRole("button", { name: /Trazer Abismo para o centro/ }))
      .toHaveAttribute("data-position", "left");

    fireEvent.click(centered);
    expect(container.querySelector(".spine-stage.is-site3d-playing")).not.toBeNull();
    expect(screen.getByRole("region", { name: "Site 3D — experiência integrada" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Projeto anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próximo projeto" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar aos projetos" }));
    expect(container.querySelector(".spine-stage.is-site3d-closing")).not.toBeNull();
    fireEvent.animationEnd(screen.getByRole("region", { name: "Site 3D — experiência integrada" }), {
      animationName: "abismo-card-retreat",
    });
    expect(container.querySelector(".spine-stage.is-site3d-closing")).toBeNull();
    await waitFor(() => expect(screen.getByRole("button", { name: "Explorar site-3D no card" })).toHaveFocus());
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
    const card = screen.getByRole("button", { name: "Abrir página de Hyprland-Themes" });
    expect(card).toHaveAttribute("data-position", "center");
    fireEvent.click(card);
    expect(openStudio).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Projeto anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Explorar site-3D no card" }));
    expect(screen.getByRole("region", { name: "Site 3D — experiência integrada" })).toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: /Explorar site-3D no card/ }))
      .toHaveAttribute("data-position", "center");
  });

  it("supports arrow-key navigation without trapping page scroll", () => {
    render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /Explorar site-3D no card/ }))
      .toHaveAttribute("data-position", "center");
    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: /Jogar Abismo no card/ }))
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
