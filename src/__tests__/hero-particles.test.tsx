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
    const heading = screen.getByRole("heading", { level: 1, name: "PORTFÓLIO 3D" });
    expect(heading).toHaveAttribute("id", "hero-name");
    expect(heading.querySelectorAll(".hero-title-fallback")).toHaveLength(1);
    expect(screen.getAllByText("PORTFÓLIO 3D")).toHaveLength(1);
  });
});
