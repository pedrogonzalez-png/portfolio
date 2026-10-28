import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { PLACEHOLDER_PROJECTS } from "./PlaceholderCatalog";
import {
  KNOWLEDGE_DOMAINS,
  KNOWLEDGE_NODES,
  KNOWLEDGE_PROJECTS,
  type KnowledgeDomain,
  type KnowledgeNode,
  type KnowledgeProjectId,
} from "../data/knowledge";
import "../styles/knowledge-tree.css";

const KnowledgeExperience = lazy(() => import("./KnowledgeExperience"));

type Selection = { kind: "skill"; id: string } | { kind: "project"; id: KnowledgeProjectId } | null;
type DomainFilter = KnowledgeDomain | "all";

const domainName = (domain: KnowledgeDomain) =>
  KNOWLEDGE_DOMAINS.find((item) => item.id === domain)?.name ?? domain;

function NodeDetails({
  selection,
  visible,
  onSelect,
}: {
  selection: Selection;
  visible: readonly KnowledgeNode[];
  onSelect: (selection: Selection) => void;
}) {
  const selectedNode = selection?.kind === "skill"
    ? KNOWLEDGE_NODES.find((node) => node.id === selection.id)
    : undefined;
  const selectedProject = selection?.kind === "project"
    ? PLACEHOLDER_PROJECTS.find((project) => project.id === selection.id)
    : undefined;

  if (selectedNode) {
    return (
      <>
        <p className="knowledge-detail-label">TECNOLOGIA / {domainName(selectedNode.domain)}</p>
        <h3>{selectedNode.label}</h3>
        <p>{selectedNode.description}</p>
        <p className="knowledge-detail-label">Vinculada aos projetos</p>
        <div className="knowledge-detail-links">
          {selectedNode.projects.map((id) => {
            const project = PLACEHOLDER_PROJECTS.find((item) => item.id === id);
            return project ? (
              <button key={id} type="button" onClick={() => onSelect({ kind: "project", id })}>
                {project.title}
              </button>
            ) : null;
          })}
        </div>
        <a className="knowledge-source" href={selectedNode.evidenceUrl} target="_blank" rel="noopener noreferrer">
          Ver evidência no GitHub ↗
        </a>
      </>
    );
  }

  if (selectedProject) {
    const related = visible.filter((node) => node.projects.includes(selectedProject.id as KnowledgeProjectId));
    return (
      <>
        <p className="knowledge-detail-label">PROJETO / CONEXÕES</p>
        <h3>{selectedProject.title}</h3>
        <p>Tecnologias relacionadas a este repositório, conforme os arquivos públicos consultados.</p>
        <div className="knowledge-detail-links">
          {related.map((node) => (
            <button key={node.id} type="button" onClick={() => onSelect({ kind: "skill", id: node.id })}>
              {node.label}
            </button>
          ))}
        </div>
        <a className="knowledge-source" href={selectedProject.sourceUrl} target="_blank" rel="noopener noreferrer">
          Explorar repositório ↗
        </a>
      </>
    );
  }

  return (
    <>
      <p className="knowledge-detail-label">EXPLORAÇÃO / CONHECIMENTOS</p>
      <h3>Escolha uma conexão.</h3>
      <p>
        Selecione uma tecnologia para ver onde foi utilizada, ou um projeto para iluminar
        seus vínculos. Cada tecnologia tem uma evidência verificável no GitHub.
      </p>
      <p className="knowledge-note">Esta visualização não atribui níveis, diplomas ou certificações.</p>
    </>
  );
}

export function KnowledgeTree() {
  const [filter, setFilter] = useState<DomainFilter>("all");
  const [selection, setSelection] = useState<Selection>(null);
  const [activeProject, setActiveProject] = useState<KnowledgeProjectId>("abismo");
  const [immersive, setImmersive] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    const update = () => {
      observer?.disconnect();
      observer = null;
      let capable = !webglFailed && !motion.matches && window.innerWidth >= 920;
      if (capable) {
        try {
          const probe = document.createElement("canvas");
          capable = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
        } catch {
          capable = false;
        }
      }
      if (!capable) { setImmersive(false); return; }
      if (typeof IntersectionObserver === "undefined" || !stageRef.current) {
        setImmersive(true);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setImmersive(Boolean(entry?.isIntersecting)),
        { rootMargin: "240px" },
      );
      observer.observe(stageRef.current);
    };
    update();
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      motion.removeEventListener("change", update);
    };
  }, [webglFailed]);
  const visibleNodes = useMemo(
    () => KNOWLEDGE_NODES.filter((node) => filter === "all" || node.domain === filter),
    [filter],
  );

  const highlighted = (node: KnowledgeNode) => {
    if (!selection) return true;
    if (selection.kind === "skill") return node.id === selection.id;
    return node.projects.includes(selection.id);
  };

  const projectName = (id: KnowledgeProjectId) =>
    PLACEHOLDER_PROJECTS.find((project) => project.id === id)?.title ?? id;

  const chooseSelection = (next: Selection) => {
    setSelection(next);
    if (next?.kind === "project") setActiveProject(next.id);
    if (next?.kind === "skill") {
      const node = KNOWLEDGE_NODES.find((candidate) => candidate.id === next.id);
      if (node && !node.projects.includes(activeProject)) setActiveProject(node.projects[0]);
    }
  };

  return (
    <div className="knowledge-shell">
      <div className="knowledge-controls" role="group" aria-label="Filtrar tecnologias por área">
        <button
          type="button"
          className={filter === "all" ? "is-active" : ""}
          aria-pressed={filter === "all"}
          onClick={() => { setFilter("all"); setSelection(null); }}
        >
          Todas
        </button>
        {KNOWLEDGE_DOMAINS.map((domain) => (
          <button
            key={domain.id}
            type="button"
            className={filter === domain.id ? "is-active" : ""}
            aria-pressed={filter === domain.id}
            onClick={() => { setFilter(domain.id); setSelection(null); }}
          >
            {domain.name}
          </button>
        ))}
      </div>

      <div
        ref={stageRef}
        className={"knowledge-visual" + (immersive ? " knowledge-immersive" : "")}
        role="group"
        aria-label="Conexões entre tecnologias e projetos"
      >
        {immersive ? (
          <Suspense fallback={<div className="knowledge-loading" role="status">Carregando espaço 3D...</div>}>
            <KnowledgeExperience
              activeProject={activeProject}
              visibleNodes={visibleNodes}
              selection={selection}
              onSelect={chooseSelection}
              onProjectChange={setActiveProject}
              onContextLost={() => setWebglFailed(true)}
            />
          </Suspense>
        ) : (
          <>
        <svg
          className="knowledge-edges"
          aria-hidden="true"
          viewBox="0 0 1000 520"
          preserveAspectRatio="none"
          focusable="false"
        >
          {visibleNodes.flatMap((node) =>
            node.projects.map((projectId) => {
              const hub = KNOWLEDGE_PROJECTS.find((item) => item.id === projectId);
              if (!hub) return null;
              const bright = highlighted(node) &&
                (!selection || selection.kind !== "skill" || selection.id === node.id) &&
                (!selection || selection.kind !== "project" || selection.id === projectId);
              return (
                <line
                  key={node.id + "-" + projectId}
                  x1={node.x * 10}
                  y1={node.y * 5.2}
                  x2={hub.x * 10}
                  y2={hub.y * 5.2}
                  className={bright ? "is-highlighted" : "is-muted"}
                />
              );
            }),
          )}
        </svg>

        {KNOWLEDGE_PROJECTS.map((hub) => (
          <button
            key={hub.id}
            type="button"
            className={"knowledge-hub" +
              (selection?.kind === "project" && selection.id === hub.id ? " is-selected" : "") +
              (selection?.kind === "skill" && !KNOWLEDGE_NODES.some((node) =>
                node.id === selection.id && node.projects.includes(hub.id)) ? " is-dimmed" : "")}
            style={{ left: hub.x + "%", top: hub.y + "%" }}
            onClick={() => chooseSelection({ kind: "project", id: hub.id })}
            aria-label={"Destacar projeto: " + projectName(hub.id)}
            aria-pressed={selection?.kind === "project" && selection.id === hub.id}
          >
            <span className="knowledge-hub-mark" aria-hidden="true">✦</span>
            <span>{projectName(hub.id)}</span>
            <small>PROJETO</small>
          </button>
        ))}

        {visibleNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={"knowledge-node knowledge-domain-" + node.domain +
              (selection?.kind === "skill" && selection.id === node.id ? " is-selected" : "") +
              (!highlighted(node) ? " is-dimmed" : "")}
            style={{ left: node.x + "%", top: node.y + "%" }}
            onClick={() => chooseSelection({ kind: "skill", id: node.id })}
            aria-label={node.label + " — " + domainName(node.domain) + ", ver conexões"}
            aria-pressed={selection?.kind === "skill" && selection.id === node.id}
          >
            <span className="knowledge-node-dot" aria-hidden="true" />
            <span>{node.label}</span>
          </button>
        ))}
          </>
        )}
      </div>

      <div className="knowledge-detail" aria-live="polite" aria-atomic="true">
        <div className="knowledge-detail-content">
          <NodeDetails selection={selection} visible={visibleNodes} onSelect={chooseSelection} />
        </div>
        {selection && (
          <button
            className="knowledge-clear"
            type="button"
            onClick={() => setSelection(null)}
          >
            Limpar seleção
          </button>
        )}
      </div>
    </div>
  );
}
