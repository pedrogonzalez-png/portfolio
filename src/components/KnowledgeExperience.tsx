import { useCallback, useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { KNOWLEDGE_PROJECTS, type KnowledgeNode, type KnowledgeProjectId } from "../data/knowledge";
import { PLACEHOLDER_PROJECTS } from "./PlaceholderCatalog";
import KnowledgeWorld, { type KnowledgeSelection } from "./KnowledgeWorld";
import { arrangeOrbitSkills } from "../services/knowledgeOrbit";
import "../styles/knowledge-experience.css";

type Props = {
  activeProject: KnowledgeProjectId;
  visibleNodes: readonly KnowledgeNode[];
  selection: KnowledgeSelection;
  onSelect: (selection: KnowledgeSelection) => void;
  onProjectChange: (id: KnowledgeProjectId) => void;
  onContextLost: () => void;
};

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

const PROJECT_IDS = KNOWLEDGE_PROJECTS.map(({ id }) => id);

function getProject(id: KnowledgeProjectId) {
  return PLACEHOLDER_PROJECTS.find((project) => project.id === id);
}

export default function KnowledgeExperience({
  activeProject, visibleNodes, selection, onSelect, onProjectChange, onContextLost,
}: Props) {
  const projects = PROJECT_IDS;
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelGesture = useRef({ lastAt: 0, delta: 0, consumed: false });

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
  const navigate = useCallback((id: KnowledgeProjectId) => {
    onProjectChange(id);
    onSelect({ kind: "project", id });
  }, [onProjectChange, onSelect]);

  // Native, non-passive wheel handler: React's delegated wheel listeners
  // can be passive, making preventDefault ineffective in Chromium.
  // Only intercept when most of the scene is visible AND another project
  // exists in the requested direction. At the endpoints normal page scroll
  // continues, so the portfolio never traps the user in this gallery.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (!event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.deltaY === 0) return;

      const rect = stage.getBoundingClientRect();
      const heightVisible = Math.min(rect.bottom, window.innerHeight)
        - Math.max(rect.top, 0);
      if (heightVisible < Math.min(rect.height * 0.58, window.innerHeight * 0.55)) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const index = projects.indexOf(activeProject);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= projects.length) return;

      // Scrolling within the gallery changes a project instead of moving
      // the document; line/page wheel modes also work on Linux mice.
      event.preventDefault();
      const now = performance.now();
      const gesture = wheelGesture.current;
      if (now - gesture.lastAt > 190) {
        gesture.delta = 0;
        gesture.consumed = false;
      }
      gesture.lastAt = now;
      if (gesture.consumed) return;

      const unit = event.deltaMode === 1 ? 16
        : event.deltaMode === 2 ? window.innerHeight : 1;
      gesture.delta += Math.min(160, Math.abs(event.deltaY * unit));
      if (gesture.delta < 38) return;

      gesture.consumed = true;
      gesture.delta = 0;
      navigate(projects[target]);
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [activeProject, navigate, projects]);

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
      ref={stageRef}
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
        <span className="kspace-instruction">Role para alternar projetos · clique para explorar</span>
        <div className="kspace-arrows" role="group" aria-label="Navegar entre projetos">
          <button type="button" onClick={() => navigate(previous)} aria-label="Projeto anterior">←</button>
          <button type="button" onClick={() => navigate(next)} aria-label="Próximo projeto">→</button>
        </div>
      </div>
    </div>
  );
}
