import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../components/SceneIntegration", () => ({ default: () => null }));
vi.mock("../components/ProjectPanel", () => ({ ProjectPanel: () => null }));
vi.mock("../components/TopMenu", () => ({ TopMenu: () => null }));

import Pages from "../app/pages";

describe("particle hero integration", () => {
  it("keeps one semantic name with a static no-WebGL fallback", () => {
    render(<MemoryRouter><Pages /></MemoryRouter>);
    const heading = screen.getByRole("heading", { level: 1, name: "PEDRO GONZALEZ" });
    expect(heading).toHaveAttribute("id", "hero-name");
    expect(heading.querySelectorAll(".hero-title-fallback")).toHaveLength(1);
    expect(screen.getAllByText("PEDRO GONZALEZ")).toHaveLength(1);
    expect(screen.getAllByText("PEDRO HENRIQUE MARIANO GONZALEZ")).toHaveLength(1);
  });

  it("uses only résumé-backed experience and preserves the public GitHub contact", () => {
    render(<MemoryRouter><Pages /></MemoryRouter>);
    const about = screen.getByRole("region", { name: "Sobre e contato" });
    expect(about).toHaveTextContent("Pedro Henrique Mariano Gonzalez");
    expect(about).toHaveTextContent("2025–2027");
    expect(about).toHaveTextContent("AM3, AM4 e AM5");
    expect(about).toHaveTextContent("conhecimentos básicos de Python, HTML e CSS");
    expect(screen.getByRole("link", { name: /Ver perfil no GitHub/ }))
      .toHaveAttribute("href", "https://github.com/pedrogonzalez-png");
    expect(about.querySelector('a[href^="tel:"]')).toBeNull();
    expect(about.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
