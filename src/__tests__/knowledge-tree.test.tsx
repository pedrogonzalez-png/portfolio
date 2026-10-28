import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { KnowledgeTree } from "../components/KnowledgeTree";
import { KNOWLEDGE_NODES } from "../data/knowledge";
import { PLACEHOLDER_PROJECTS } from "../components/PlaceholderCatalog";

describe("knowledge graph: approved evidence only", () => {
  it("connects each technology exclusively to approved projects, with a source file", () => {
    const authorized = new Set(PLACEHOLDER_PROJECTS.map((project) => project.id));
    expect(KNOWLEDGE_NODES.length).toBeGreaterThan(0);
    for (const skill of KNOWLEDGE_NODES) {
      expect(skill.projects.length).toBeGreaterThan(0);
      for (const projectId of skill.projects) {
        expect(authorized.has(projectId)).toBe(true);
      }
      expect(skill.evidenceUrl).toMatch(/^https:\/\/github\.com\/pedrogonzalez-png\//);
      expect(skill.evidenceUrl).not.toContain("dotfiles-Arch");
    }
  });
});

describe("KnowledgeTree", () => {
  it("reveals connected projects and an actual source when selecting a technology", () => {
    render(<KnowledgeTree />);
    fireEvent.click(screen.getByRole("button", { name: /React — Web, ver conexões/ }));
    expect(screen.getByRole("heading", { name: "React" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "site-3D" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver evidência no GitHub/ })).toHaveAttribute(
      "href", "https://github.com/pedrogonzalez-png/site-3D/blob/main/src/App.jsx",
    );
  });

  it("highlights related technologies when selecting a real project", () => {
    render(<KnowledgeTree />);
    fireEvent.click(screen.getByRole("button", { name: "Destacar projeto: Abismo" }));
    expect(screen.getByRole("heading", { name: "Abismo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Phaser" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /React — Web, ver conexões/ }))
      .toHaveClass("is-dimmed");
    fireEvent.click(screen.getByRole("button", { name: "Limpar seleção" }));
    expect(screen.getByRole("heading", { name: "Escolha uma conexão." })).toBeInTheDocument();
  });

  it("filters categories while keeping a complete text interface on small screens", () => {
    render(<KnowledgeTree />);
    fireEvent.click(screen.getByRole("button", { name: "Linux" }));
    expect(screen.getByRole("button", { name: /QML — Linux, ver conexões/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /React — Web, ver conexões/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /QML — Linux, ver conexões/ }));
    expect(screen.getByRole("heading", { name: "QML" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Todas" }));
    expect(screen.getByRole("button", { name: /React — Web, ver conexões/ })).toBeInTheDocument();
  });

  it("keeps buttons and text available without depending on WebGL or SVG interaction", () => {
    const { container } = render(<KnowledgeTree />);
    const map = screen.getByRole("group", { name: "Conexões entre tecnologias e projetos" });
    expect(within(map).getAllByRole("button")).toHaveLength(KNOWLEDGE_NODES.length + 3);
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(/não atribui níveis, diplomas ou certificações/)).toBeInTheDocument();
  });
});
