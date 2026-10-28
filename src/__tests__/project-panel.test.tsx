import { describe, expect, it, vi } from "vitest";

vi.mock("../components/SpineWorld", () => ({ SpineWorld: () => null }));
import { fireEvent, render, screen } from "@testing-library/react";
import { ProjectPanel } from "../components/ProjectPanel";

describe("ProjectPanel", () => {
  it("shows only the three allowlisted projects", () => {
    render(<ProjectPanel />);
    expect(screen.getByRole("button", { name: /Abrir detalhes de Abismo/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Abrir detalhes de site-3D/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Abrir detalhes de Hyprland-Themes/ })).toBeInTheDocument();
    expect(screen.queryByText(/dotfiles-Arch/i)).not.toBeInTheDocument();
  });

  it("opens and closes a project, preserving focus and unavailable demo status", () => {
    render(<ProjectPanel />);
    const trigger = screen.getByRole("button", { name: /Abrir detalhes de Abismo/ });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Sem demonstração publicada/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver código no GitHub/ })).toHaveAttribute("href", "https://github.com/pedrogonzalez-png/jogo-site");
    fireEvent.click(screen.getByRole("button", { name: "Fechar projeto" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
