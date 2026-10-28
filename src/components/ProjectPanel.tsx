import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { PLACEHOLDER_PROJECTS, type Project } from "./PlaceholderCatalog";
import { EmbeddedDemo } from "./EmbeddedDemo";
import { SpineWorld } from "./SpineWorld";
import { ProjectArtwork } from "./ProjectArtwork";
import "../styles/project-cards.css";

const PANEL_META: Record<string, { category: string; headline: string }> = {
  abismo: { category: "GAME / PROCEDURAL WORLD", headline: "ABISMO" },
  "site-3d": { category: "EXPERIMENTAL WEB / INTERACTIVE", headline: "site-3D" },
  "hyprland-themes": { category: "LINUX / CREATIVE DESKTOP", headline: "HYPRLAND THEMES" },
};

function handlePanelMove(event: ReactPointerEvent<HTMLButtonElement>) {
  if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  element.style.setProperty("--light-x", (100 * x).toFixed(2) + "%");
  element.style.setProperty("--light-y", (100 * y).toFixed(2) + "%");
  element.style.setProperty("--tilt-x", ((0.5 - y) * 5).toFixed(2) + "deg");
  element.style.setProperty("--tilt-y", ((x - 0.5) * 7).toFixed(2) + "deg");
}

function handlePanelLeave(event: ReactPointerEvent<HTMLButtonElement>) {
  const element = event.currentTarget;
  element.style.setProperty("--light-x", "50%");
  element.style.setProperty("--light-y", "50%");
  element.style.setProperty("--tilt-x", "0deg");
  element.style.setProperty("--tilt-y", "0deg");
}

function useStageScroll(stageRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = stage.getBoundingClientRect();
        const length = window.innerHeight + rect.height;
        const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, length)));
        stage.style.setProperty("--journey", progress.toFixed(4));
        stage.style.setProperty("--float-a", ((0.5 - progress) * 95).toFixed(1) + "px");
        stage.style.setProperty("--float-b", ((progress - 0.5) * 110).toFixed(1) + "px");
        stage.style.setProperty("--float-c", ((0.5 - progress) * 80).toFixed(1) + "px");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [stageRef]);
}

export function ProjectPanel() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  useStageScroll(stageRef);

  useEffect(() => {
    if (!selected) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDemo(false);
        setSelected(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger.current?.focus();
    };
  }, [selected]);

  const close = () => {
    setShowDemo(false);
    setSelected(null);
  };

  return (
    <>
      <div id="spine-stage" className="spine-stage" ref={stageRef}>
        <SpineWorld />
        <div className="spine-guide" aria-hidden="true">
          <span>02 / NÚCLEO CRIATIVO</span>
          <span>TRÊS PROJETOS · UMA JORNADA</span>
        </div>
        <div className="project-grid orbit-grid immersive-panels">
          {PLACEHOLDER_PROJECTS.filter((p) => p.featured && p.status !== "hidden").map((project, index) => {
            const meta = PANEL_META[project.id] ?? { category: "PROJECT / DEVELOPMENT", headline: project.title };
            return (
              <button
                key={project.id}
                className={"project-card orbit-card cinematic-panel cinematic-panel-" + index}
                type="button"
                onPointerMove={handlePanelMove}
                onPointerLeave={handlePanelLeave}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(project);
                }}
                aria-label={"Abrir detalhes de " + project.title}
              >
                <span className="cinematic-panel-visual" aria-hidden="true">
                  <ProjectArtwork projectId={project.id} />
                </span>
                <span className="cinematic-panel-reflection" aria-hidden="true" />
                <span className="cinematic-panel-top" aria-hidden="true">
                  <span>0{index + 1} / SELECTED WORK</span>
                  <span className="cinematic-panel-corner">✦</span>
                </span>
                <span className="cinematic-panel-hero" aria-hidden="true">
                  <span className="cinematic-panel-category">{meta.category}</span>
                  <span className="cinematic-panel-title">{meta.headline}</span>
                </span>
                <span className="cinematic-panel-bottom" aria-hidden="true">
                  <span className="cinematic-panel-note">CONCEITO VISUAL · EM DESENVOLVIMENTO</span>
                  <span className="cinematic-panel-explore">EXPLORE <span>↗</span></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="projects-disclaimer">
        Três projetos autorizados · As artes são conceituais; nenhuma demonstração foi publicada
      </p>
      {selected && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <div className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
            <button className="modal-close" type="button" ref={closeButton} onClick={close} aria-label="Fechar projeto">✕</button>
            <p className="eyebrow">EXPLORAR PROJETO / {selected.status.toUpperCase()}</p>
            <h2 id="project-dialog-title">{selected.title}</h2>
            <p className="dialog-summary">{selected.summary.split(" Status:")[0]}</p>
            <div className="dialog-tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <p className="dialog-status">
              {selected.isFinalizedConfirmed ? "Finalização confirmada" : "Projeto ainda não finalizado"} · {selected.demoUrl ? "Demo configurada" : "Sem demonstração publicada"}
            </p>
            {showDemo && selected.demoUrl && selected.isFinalizedConfirmed && selected.status === "approved" && (
              <EmbeddedDemo projectId={selected.id} demoUrl={selected.demoUrl} isOpen={showDemo} onClose={() => setShowDemo(false)} />
            )}
            <div className="dialog-actions">
              <a className="primary-action" href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">Ver código no GitHub ↗</a>
              {selected.demoUrl && selected.isFinalizedConfirmed && selected.status === "approved" && (
                <button className="secondary-action" type="button" onClick={() => setShowDemo(true)}>Abrir demonstração</button>
              )}
              <button className="secondary-action" type="button" onClick={close}>Voltar à constelação</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
