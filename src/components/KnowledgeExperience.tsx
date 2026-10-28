import { useMemo } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { KNOWLEDGE_PROJECTS, type KnowledgeNode, type KnowledgeProjectId } from "../data/knowledge";
import { PLACEHOLDER_PROJECTS } from "./PlaceholderCatalog";
import KnowledgeWorld, { type KnowledgeSelection, type SpatialCoordinate } from "./KnowledgeWorld";
import "../styles/knowledge-experience.css";

type Props = {
  activeProject: KnowledgeProjectId;
  visibleNodes: readonly KnowledgeNode[];
  selection: KnowledgeSelection;
  onSelect: (selection: KnowledgeSelection) => void;
  onProjectChange: (id: KnowledgeProjectId) => void;
  onContextLost: () => void;
};

/** Regular, deliberate arcs: no random overlap or line tangles. */
export function arrangeOrbitSkills(nodes: readonly KnowledgeNode[]): { id: string; position: SpatialCoordinate }[] {
  const topCount = Math.ceil(nodes.length / 2);
  const bottomCount = nodes.length - topCount;
  const row = (count: number, y: number) =>
    Array.from({ length: count }, (_, index) => ({
      x: count === 1 ? 50 : 24 + (52 * index) / (count - 1),
      y,
    }));
  const positions = [...row(topCount, 17), ...row(bottomCount, 84)];
  return nodes.map((node, index) => ({ id: node.id, position: positions[index] }));
}

const META: Record<KnowledgeProjectId, { index: string; eyebrow: string; description: string }> = {
  abismo: {
    index: "01",
    eyebrow: "JOGO / MUNDO PROCEDURAL",
    description: "Um RPG de ação construído com sistemas próprios de combate, progressão e geração de mundo.",
  },
  "site-3d": {
    index: "02",
    eyebrow: "WEB / EXPERIMENTAÇÃO VISUAL",
    description: "Uma experiência de personagens com interface interativa e cenas em vídeo.",
  },
  "hyprland-themes": {
    index: "03",
    eyebrow: "LINUX / INTERFACES",
    description: "Temas e personalizações para Hyprland, Quickshell e o ambiente desktop.",
  },
};

function getProject(id: KnowledgeProjectId) {
  return PLACEHOLDER_PROJECTS.find((project) => project.id === id);
}

export default function KnowledgeExperience({
  activeProject, visibleNodes, selection, onSelect, onProjectChange, onContextLost,
}: Props) {
  const projects = KNOWLEDGE_PROJECTS.map(({ id }) => id);
  const currentIndex = projects.indexOf(activeProject);
  const previous = projects[(currentIndex + projects.length - 1) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];
  const current = getProject(activeProject);
  const related = useMemo(
    () => visibleNodes.filter((node) => node.projects.includes(activeProject)),
    [activeProject, visibleNodes],
  );
  const skillPositions = useMemo(() => arrangeOrbitSkills(related), [related]);
  const activeSkill = selection?.kind === "skill" && related.some((node) => node.id === selection.id)
    ? selection.id : null;
  const navigate = (id: KnowledgeProjectId) => {
    onProjectChange(id);
    onSelect({ kind: "project", id });
  };

  const onCarouselKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(previous);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(next);
    }
  };

  return (
    <div
      id="knowledge-spatial-stage"
      className="kspace-stage"
      role="region"
      aria-label="Ambiente tridimensional de habilidades"
      tabIndex={0}
      onKeyDown={onCarouselKeys}
    >
      <div className="kspace-atmosphere" aria-hidden="true" />
      <div className="kspace-renderer" aria-hidden="true">
        <KnowledgeWorld
          activeProject={activeProject}
          skillPositions={skillPositions}
          activeSkill={activeSkill}
          onContextLost={onContextLost}
        />
      </div>
      <div className="kspace-meta" aria-hidden="true">
        <span><i /> SISTEMA / CONHECIMENTOS</span>
        <span>UMA CONSTELAÇÃO DE PROJETOS REAIS</span>
      </div>

      <div className="kspace-ui">
        {[{ id: previous, side: "left" }, { id: next, side: "right" }].map(({ id, side }) => {
          const project = getProject(id);
          if (!project) return null;
          return (
            <button
              key={id}
              type="button"
              className={"kspace-satellite kspace-satellite-" + side}
              aria-label={"Selecionar projeto: " + project.title}
              onClick={() => navigate(id)}
            >
              <span className="kspace-satellite-number">PROJETO {META[id].index}</span>
              <strong>{project.title}</strong>
              <span className="kspace-satellite-hint">
                {side === "left" ? "←" : "→"} EXPLORAR
              </span>
            </button>
          );
        })}

        <button
          className="kspace-core"
          type="button"
          aria-label={"Destacar projeto: " + (current?.title ?? activeProject)}
          onClick={() => onSelect({ kind: "project", id: activeProject })}
        >
          <span className="kspace-core-top">
            <span className="kspace-core-index">ESTUDO DE CASO / {META[activeProject].index}</span>
            <span className="kspace-core-symbol" aria-hidden="true">✦</span>
          </span>
          <span className="kspace-core-eyebrow">{META[activeProject].eyebrow}</span>
          <strong className="kspace-core-title">{current?.title ?? activeProject}</strong>
          <span className="kspace-core-desc">{META[activeProject].description}</span>
          <span className="kspace-core-bottom">
            <span>{String(related.length).padStart(2, "0")} CONEXÕES</span>
            <span>INSPECIONAR PROJETO <b aria-hidden="true">↗</b></span>
          </span>
        </button>

        {related.map((node) => {
          const position = skillPositions.find((item) => item.id === node.id)?.position;
          if (!position) return null;
          const selected = activeSkill === node.id;
          return (
            <button
              key={node.id}
              type="button"
              className={
                "kspace-tech" +
                (selected ? " is-selected" : "") +
                (activeSkill && !selected ? " is-subdued" : "")
              }
              style={{ left: position.x + "%", top: position.y + "%" }}
              onClick={() => onSelect({ kind: "skill", id: node.id })}
              aria-label={node.label + ", ver conexões"}
              aria-pressed={selected}
            >
              <span className="kspace-tech-icon" aria-hidden="true">✳</span>
              <span>{node.label}</span>
              <span className="kspace-tech-arrow" aria-hidden="true">↗</span>
            </button>
          );
        })}
        {related.length === 0 && (
          <div className="kspace-empty" role="status">
            Nenhuma tecnologia deste projeto corresponde ao filtro. Escolha outra categoria ou Todas.
          </div>
        )}
      </div>

      <div className="kspace-footer">
        <span className="kspace-progress">{META[activeProject].index} <span>/ 03</span></span>
        <span className="kspace-instruction">Selecione um vidro para explorar as conexões</span>
        <div className="kspace-arrows" role="group" aria-label="Navegar entre projetos">
          <button type="button" onClick={() => navigate(previous)} aria-label="Projeto anterior">←</button>
          <button type="button" onClick={() => navigate(next)} aria-label="Próximo projeto">→</button>
        </div>
      </div>
    </div>
  );
}
