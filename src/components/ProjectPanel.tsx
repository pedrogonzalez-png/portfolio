import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
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

const WHEEL_THRESHOLD = 36;
const WHEEL_COOLDOWN_MS = 530;

/**
 * Consume the wheel only while the project stage is actually centered on
 * screen. At the first/last project the visitor is free to scroll out in the
 * same direction; the carousel never traps page navigation.
 */
function useCarouselWheel(
  stageRef: React.RefObject<HTMLDivElement | null>,
  activeRef: React.RefObject<number>,
  count: number,
  setActive: (index: number) => void,
  modalOpen: boolean,
) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || count <= 1) return;

    let accumulation = 0;
    let previousWheelAt = 0;
    let lastChangeAt = -Infinity;

    const onWheel = (event: WheelEvent) => {
      if (modalOpen || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
      const viewport = stage.getBoundingClientRect();
      // Don't hijack normal scrolling when the carousel isn't in view.
      if (viewport.top > window.innerHeight * 0.68 ||
          viewport.bottom < window.innerHeight * 0.32) return;

      const current = activeRef.current;
      const direction = Math.sign(event.deltaY);
      if (!direction || !Number.isFinite(event.deltaY)) return;
      const next = current + direction;
      if (next < 0 || next >= count) {
        accumulation = 0;
        // Absorb leftover trackpad inertia from the last change, then let
        // a subsequent wheel gesture leave the carousel naturally.
        if (performance.now() - lastChangeAt < WHEEL_COOLDOWN_MS) {
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();
      const now = performance.now();
      if (now - lastChangeAt < WHEEL_COOLDOWN_MS) return;
      if (now - previousWheelAt > 230 || Math.sign(accumulation) !== direction) {
        accumulation = 0;
      }
      previousWheelAt = now;
      // Respect wheel deltaMode: lines/pages should count as distinct steps.
      const factor = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? 120 : 1;
      accumulation += event.deltaY * factor;
      if (Math.abs(accumulation) >= WHEEL_THRESHOLD) {
        accumulation = 0;
        lastChangeAt = now;
        setActive(next);
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [stageRef, activeRef, count, setActive, modalOpen]);
}

export function ProjectPanel() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const projects = useMemo(
    () => PLACEHOLDER_PROJECTS.filter((p) => p.featured && p.status !== "hidden"),
    [],
  );

  const activate = useCallback((index: number) => {
    const next = Math.max(0, Math.min(projects.length - 1, index));
    activeRef.current = next;
    setActiveIndex(next);
  }, [projects.length]);

  useCarouselWheel(stageRef, activeRef, projects.length, activate, selected !== null);

  const onCarouselKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (selected || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      activate(activeRef.current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      activate(activeRef.current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      activate(0);
    } else if (event.key === "End") {
      event.preventDefault();
      activate(projects.length - 1);
    }
  };

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
      <div
        id="spine-stage"
        className="spine-stage project-carousel"
        ref={stageRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Carrossel de projetos"
        tabIndex={0}
        onKeyDown={onCarouselKeyDown}
      >
        <SpineWorld />
        <div className="project-grid orbit-grid immersive-panels arc-carousel" aria-label="Projetos em destaque">
          {projects.map((project, index) => {
            const meta = PANEL_META[project.id] ?? { category: "PROJECT / DEVELOPMENT", headline: project.title };
            const relative = (index - activeIndex + projects.length) % projects.length;
            const position = relative === 0 ? "center" : relative === 1 ? "right" : "left";
            return (
              <button
                key={project.id}
                className={"project-card orbit-card cinematic-panel cinematic-panel-" + index + " carousel-" + position}
                data-position={position}
                aria-current={position === "center" ? "true" : undefined}
                type="button"
                onPointerMove={handlePanelMove}
                onPointerLeave={handlePanelLeave}
                onClick={(event) => {
                  if (index !== activeIndex) {
                    activate(index);
                  } else {
                    trigger.current = event.currentTarget;
                    setSelected(project);
                  }
                }}
                aria-label={index === activeIndex
                  ? "Abrir detalhes de " + project.title
                  : "Trazer " + project.title + " para o centro"}
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
                  <span className="cinematic-panel-explore">
                    {index === activeIndex ? "EXPLORAR" : "FOCAR"} <span>↗</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="carousel-controls" aria-label="Navegação dos projetos">
        <button type="button" aria-label="Projeto anterior" onClick={() => activate(activeIndex - 1)} disabled={activeIndex === 0}>←</button>
        <div className="carousel-progress" role="status" aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <strong>{projects[activeIndex]?.title}</strong>
        </div>
        <button type="button" aria-label="Próximo projeto" onClick={() => activate(activeIndex + 1)} disabled={activeIndex === projects.length - 1}>→</button>
      </div>
      <p className="carousel-instructions">Use a rodinha do mouse sobre os painéis ou as setas para alternar projetos.</p>
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
