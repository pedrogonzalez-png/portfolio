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
    expect(screen.queryByRole("button", { name: "Projeto anterior" })).not.toBeInTheDocument();
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
    fireEvent.keyDown(screen.getByRole("region", { name: "Carrossel de projetos" }), { key: "ArrowRight" });
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
    fireEvent.keyDown(screen.getByRole("region", { name: "Carrossel de projetos" }), { key: "ArrowLeft" });
    fireEvent.click(screen.getByRole("button", { name: "Explorar site-3D no card" }));
    expect(screen.getByRole("region", { name: "Site 3D — experiência integrada" })).toBeInTheDocument();
  });

  it("wraps endlessly with wheel input and only handles scrolling while in view", () => {
    render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    const getBounds = vi.spyOn(carousel, "getBoundingClientRect").mockReturnValue({
      top: 180, bottom: 600, left: 0, right: 1100, width: 1100, height: 420,
      x: 0, y: 180, toJSON: () => ({}),
    });
    const clock = vi.spyOn(performance, "now");
    let now = 1000;
    clock.mockImplementation(() => now);
    try {
      const wheel = (deltaY: number) =>
        fireEvent.wheel(carousel, { deltaY, deltaMode: 0, cancelable: true });
      expect(wheel(110)).toBe(false);
      expect(screen.getByRole("button", { name: "Explorar site-3D no card" }))
        .toHaveAttribute("data-position", "center");

      now += 610;
      expect(wheel(110)).toBe(false);
      expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ }))
        .toHaveAttribute("data-position", "center");

      now += 610;
      expect(wheel(110)).toBe(false);
      expect(screen.getByRole("button", { name: "Jogar Abismo no card" }))
        .toHaveAttribute("data-position", "center");

      now += 610;
      expect(wheel(-110)).toBe(false);
      expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ }))
        .toHaveAttribute("data-position", "center");

      getBounds.mockReturnValue({
        top: 1200, bottom: 1700, left: 0, right: 1100, width: 1100, height: 500,
        x: 0, y: 1200, toJSON: () => ({}),
      });
      now += 610;
      expect(wheel(110)).toBe(true);
      expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ }))
        .toHaveAttribute("data-position", "center");
    } finally {
      clock.mockRestore();
      getBounds.mockRestore();
    }
  });

  it("supports circular swipe navigation on mobile without hijacking vertical gestures", () => {
    render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    fireEvent.touchStart(carousel, { touches: [{ clientX: 280, clientY: 200 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 120, clientY: 205 }] });
    expect(screen.getByRole("button", { name: "Explorar site-3D no card" }))
      .toHaveAttribute("data-position", "center");

    fireEvent.touchStart(carousel, { touches: [{ clientX: 170, clientY: 200 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 175, clientY: 70 }] });
    expect(screen.getByRole("button", { name: "Explorar site-3D no card" }))
      .toHaveAttribute("data-position", "center");

    fireEvent.touchStart(carousel, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 300, clientY: 205 }] });
    expect(screen.getByRole("button", { name: "Jogar Abismo no card" }))
      .toHaveAttribute("data-position", "center");
  });

  it("starts an accessible directional reveal on each project change", () => {
    const { container } = render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    expect(carousel).toHaveAttribute("data-carousel-switched", "false");
    expect(container.querySelector(".carousel-change-trail")).toBeNull();

    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(carousel).toHaveAttribute("data-carousel-direction", "next");
    expect(carousel).toHaveAttribute("data-carousel-switched", "true");
    expect(container.querySelectorAll(".carousel-change-trail")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Explorar site-3D no card" }))
      .toHaveClass("carousel-center");

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(carousel).toHaveAttribute("data-carousel-direction", "previous");
    expect(screen.getByRole("button", { name: "Jogar Abismo no card" }))
      .toHaveClass("carousel-center");

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(carousel).toHaveAttribute("data-carousel-direction", "previous");
    expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ }))
      .toHaveClass("carousel-center");
  });

  it("supports endless arrow-key navigation in both directions", () => {
    render(<ProjectPanel />);
    const carousel = screen.getByRole("region", { name: "Carrossel de projetos" });
    expect(screen.queryByRole("button", { name: "Próximo projeto" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Três projetos selecionados/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Use a rodinha do mouse sobre os painéis/)).not.toBeInTheDocument();

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ }))
      .toHaveAttribute("data-position", "center");
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Jogar Abismo no card" }))
      .toHaveAttribute("data-position", "center");
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Explorar site-3D no card" }))
      .toHaveAttribute("data-position", "center");

  });
});

describe("header navigation", () => {
  it("keeps Projects in the menu without a competing Themes button", () => {
    render(<MemoryRouter><ThemeProvider><TopMenu onOpenTerminal={() => {}} /></ThemeProvider></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Projetos" })).toHaveAttribute("href", "#projetos");
    expect(screen.queryByRole("link", { name: "Habilidades" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Temas|Theme Studio/i })).not.toBeInTheDocument();
  });
});
