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

  it("puts nodes in separate arcs without repeating positions", () => {
    const nodes = KNOWLEDGE_NODES.filter((node) => node.projects.includes("abismo"));
    const orbit = arrangeOrbitSkills(nodes);
    expect(orbit).toHaveLength(nodes.length);
    expect(new Set(orbit.map((node) => node.position.x + ":" + node.position.y)).size).toBe(orbit.length);
    expect(orbit.every((node) => node.position.y === 17 || node.position.y === 84)).toBe(true);
  });
});
