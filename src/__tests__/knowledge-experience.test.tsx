import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import KnowledgeExperience from "../components/KnowledgeExperience";
import { arrangeOrbitSkills } from "../services/knowledgeOrbit";
import { KNOWLEDGE_NODES, type KnowledgeProjectId } from "../data/knowledge";
import type { KnowledgeSelection } from "../components/KnowledgeWorld";

vi.mock("../components/KnowledgeWorld", () => ({
  default: () => <div data-testid="decorative-webgl" />,
}));

function TestHarness() {
  const [activeProject, setActiveProject] = useState<KnowledgeProjectId>("abismo");
  const [selection, setSelection] = useState<KnowledgeSelection>(null);
  return (
    <KnowledgeExperience
      activeProject={activeProject}
      visibleNodes={KNOWLEDGE_NODES}
      selection={selection}
      onSelect={setSelection}
      onProjectChange={setActiveProject}
      onContextLost={() => {}}
    />
  );
}

describe("redesigned spatial knowledge experience", () => {
  it("shows one prominent project and only its linked skills", () => {
    render(<TestHarness />);
    expect(screen.getByRole("button", { name: "Destacar projeto: Abismo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Phaser, ver conexões/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /QML, ver conexões/ })).not.toBeInTheDocument();
    expect(screen.getByTestId("decorative-webgl")).toBeInTheDocument();
  });

  it("switches between projects with buttons and arrow keys", () => {
    render(<TestHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Próximo projeto" }));
    expect(screen.getByRole("button", { name: "Destacar projeto: site-3D" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /React, ver conexões/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Phaser, ver conexões/ })).not.toBeInTheDocument();
    const stage = screen.getByRole("region", { name: "Ambiente tridimensional de habilidades" });
    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Destacar projeto: Hyprland-Themes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /QML, ver conexões/ })).toBeInTheDocument();
  });

  it("changes projects with wheel scrolling and releases the page at both endpoints", () => {
    render(<TestHarness />);
    const stage = screen.getByRole("region", { name: "Ambiente tridimensional de habilidades" });
    vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 40, top: 40, left: 0, right: 1100, bottom: 700,
      width: 1100, height: 660, toJSON: () => ({}),
    } as DOMRect);
    const clock = vi.spyOn(performance, "now");
    let time = 1000;
    clock.mockImplementation(() => time);
    const wheel = (deltaY: number) => {
      const event = new WheelEvent("wheel", { deltaY, cancelable: true, bubbles: true });
      fireEvent(stage, event);
      return event;
    };

    // At the first project, upwards wheel must scroll the document normally.
    expect(wheel(-110).defaultPrevented).toBe(false);
    expect(wheel(110).defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "Destacar projeto: site-3D" })).toBeInTheDocument();

    // Repeated touchpad events in the same gesture may not skip another project.
    expect(wheel(100).defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "Destacar projeto: site-3D" })).toBeInTheDocument();

    time += 240;
    expect(wheel(110).defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "Destacar projeto: Hyprland-Themes" })).toBeInTheDocument();
    // At the final project, natural page scrolling resumes.
    expect(wheel(110).defaultPrevented).toBe(false);

    time += 240;
    expect(wheel(-110).defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "Destacar projeto: site-3D" })).toBeInTheDocument();
    clock.mockRestore();
  });

  it("navigates all three glass projects with clickable progress indicators", () => {
    render(<TestHarness />);
    const first = screen.getByRole("button", { name: "Ir para projeto: Abismo" });
    const third = screen.getByRole("button", { name: "Ir para projeto: Hyprland-Themes" });
    expect(first).toHaveAttribute("aria-current", "step");
    expect(third).not.toHaveAttribute("aria-current");
    fireEvent.click(third);
    expect(screen.getByRole("button", { name: "Destacar projeto: Hyprland-Themes" })).toBeInTheDocument();
    expect(third).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /QML, ver conexões/ })).toBeInTheDocument();
    fireEvent.click(first);
    expect(screen.getByRole("button", { name: "Destacar projeto: Abismo" })).toBeInTheDocument();
    expect(first).toHaveAttribute("aria-current", "step");
  });

  it("puts nodes in separate arcs without repeating positions", () => {
    const nodes = KNOWLEDGE_NODES.filter((node) => node.projects.includes("abismo"));
    const orbit = arrangeOrbitSkills(nodes);
    expect(orbit).toHaveLength(nodes.length);
    expect(new Set(orbit.map((node) => node.position.x + ":" + node.position.y)).size).toBe(orbit.length);
    expect(orbit.every((node) => node.position.y === 17 || node.position.y === 84)).toBe(true);
  });
});
