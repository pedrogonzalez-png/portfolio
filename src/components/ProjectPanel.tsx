import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from "react";
import { PLACEHOLDER_PROJECTS, type Project } from "./PlaceholderCatalog";
import { EmbeddedDemo } from "./EmbeddedDemo";
import { AbismoGameCard } from "./AbismoGameCard";
import { Site3DCard } from "./Site3DCard";
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
 * Cycle indefinitely while the user scrolls over the project stage.
 * Outside this stage, wheel scrolling continues through the normal page.
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
      const next = (current + direction + count) % count;

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

export function ProjectPanel({ onOpenThemeStudio }: { onOpenThemeStudio?: () => void } = {}) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [abismoOpen, setAbismoOpen] = useState(false);
  const [abismoClosing, setAbismoClosing] = useState(false);
  const [site3dOpen, setSite3dOpen] = useState(false);
  const [site3dClosing, setSite3dClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [forceCarouselMotion, setForceCarouselMotion] = useState(false);
  const [carouselDirection, setCarouselDirection] = useState<"next" | "previous">("next");
  const [hasSwitched, setHasSwitched] = useState(false);
  const activeRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressSwipeClick = useRef(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const refresh = () => setSystemReducedMotion(query.matches);
    refresh();
    query.addEventListener?.("change", refresh);
    return () => query.removeEventListener?.("change", refresh);
  }, []);

  const projects = useMemo(
    () => PLACEHOLDER_PROJECTS.filter((p) => p.featured && p.status !== "hidden"),
    [],
  );

  const activate = useCallback((index: number) => {
    if (projects.length < 2) return;
    const next = ((index % projects.length) + projects.length) % projects.length;
    const current = activeRef.current;
    if (next === current) return;
    // Determine the shortest circular direction, including last -> first.
    const stepsForward = (next - current + projects.length) % projects.length;
    const stepsBackward = (current - next + projects.length) % projects.length;
    setCarouselDirection(stepsForward <= stepsBackward ? "next" : "previous");
    setHasSwitched(true);
    setPreviousIndex(current);
    setIsChanging(true);
    activeRef.current = next;
    setActiveIndex(next);
  }, [projects.length]);

  useEffect(() => {
    if (!isChanging) return;
    // Covers reduced-motion browsers (no animationend) and interrupted swipes.
    const timeout = window.setTimeout(() => setIsChanging(false), 920);
    return () => window.clearTimeout(timeout);
  }, [isChanging, activeIndex]);

  const onCarouselTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (abismoOpen || site3dOpen || selected || event.touches.length !== 1) return;
    suppressSwipeClick.current = false;
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const onCarouselTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || abismoOpen || site3dOpen || selected || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    // Horizontal swipe changes project; vertical swipes keep normal page scroll.
    if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressSwipeClick.current = true;
      activate(activeRef.current + (dx < 0 ? 1 : -1));
    }
  };

  useCarouselWheel(stageRef, activeRef, projects.length, activate, selected !== null || abismoOpen || site3dOpen);

  const onCarouselKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (selected || abismoOpen || site3dOpen || event.altKey || event.ctrlKey || event.metaKey) return;
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

  const finishCloseAbismo = useCallback(() => {
    setAbismoOpen(false);
    setAbismoClosing(false);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('[data-project-id="abismo"]')?.focus();
    });
  }, []);

  // Retain the playable panel until its closing animation has completed.
  // In reduced-motion mode close immediately without waiting for animationend.
  const closeAbismo = useCallback(() => {
    if (abismoClosing) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      finishCloseAbismo();
    } else {
      setAbismoClosing(true);
    }
  }, [abismoClosing, finishCloseAbismo]);

  useEffect(() => {
    if (!abismoOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      // Fullscreen escape should leave the game open.
      if (event.key === "Escape" && !document.fullscreenElement) {
        closeAbismo();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [abismoOpen, closeAbismo]);

  const finishCloseSite3D = useCallback(() => {
    setSite3dOpen(false);
    setSite3dClosing(false);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('[data-project-id="site-3d"]')?.focus();
    });
  }, []);

  const closeSite3D = useCallback(() => {
    if (site3dClosing) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      finishCloseSite3D();
    } else {
      setSite3dClosing(true);
    }
  }, [site3dClosing, finishCloseSite3D]);

  useEffect(() => {
    if (!site3dOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) closeSite3D();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [site3dOpen, closeSite3D]);

  const close = () => {
    setShowDemo(false);
    setSelected(null);
  };

  return (
    <>
      <div
        id="spine-stage"
        data-carousel-direction={carouselDirection}
        data-carousel-switched={hasSwitched ? "true" : "false"}
        data-force-motion={forceCarouselMotion ? "true" : "false"}
        className={"spine-stage project-carousel" + (hasSwitched ? " has-switched" : "") + (abismoOpen ? (abismoClosing ? " is-abismo-closing" : " is-abismo-playing") : site3dOpen ? (site3dClosing ? " is-site3d-closing" : " is-site3d-playing") : "")}
        ref={stageRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Carrossel de projetos"
        tabIndex={0}
        aria-describedby="project-carousel-help"
        onKeyDown={onCarouselKeyDown}
        onTouchStart={onCarouselTouchStart}
        onTouchEnd={onCarouselTouchEnd}
        onTouchCancel={() => { touchStart.current = null; }}
        onClickCapture={(event) => {
          if (!suppressSwipeClick.current) return;
          suppressSwipeClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {systemReducedMotion && !abismoOpen && !site3dOpen && (
          <button
            className="carousel-motion-toggle"
            type="button"
            aria-pressed={forceCarouselMotion}
            onClick={() => setForceCarouselMotion((value) => !value)}
          >
            {forceCarouselMotion ? "Desativar animação" : "Animar troca de cards"}
          </button>
        )}
        <SpineWorld />
        <div className="project-grid orbit-grid immersive-panels arc-carousel" aria-label="Projetos em destaque">
          {projects.map((project, index) => {
            const meta = PANEL_META[project.id] ?? { category: "PROJECT / DEVELOPMENT", headline: project.title };
            const relative = (index - activeIndex + projects.length) % projects.length;
            const position = relative === 0 ? "center" : relative === 1 ? "right" : "left";
            const switchRole = isChanging
              ? index === activeIndex ? " carousel-entering"
                : index === previousIndex ? " carousel-exiting"
                  : " carousel-wrapping"
              : "";
            if (abismoOpen && project.id === "abismo" && position === "center") {
              return <AbismoGameCard key={project.id} onClose={closeAbismo} closing={abismoClosing} onExitComplete={finishCloseAbismo}/>;
            }
            if (site3dOpen && project.id === "site-3d" && position === "center") {
              return <Site3DCard key={project.id} onClose={closeSite3D} closing={site3dClosing} onExitComplete={finishCloseSite3D}/>;
            }
            return (
              <button
                key={project.id}
                className={"project-card orbit-card cinematic-panel cinematic-panel-" + index + " carousel-" + position + switchRole}
                data-position={position}
                data-switch-role={isChanging ? (index === activeIndex ? "entering" : index === previousIndex ? "exiting" : "wrapping") : "idle"}
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget && event.animationName === "carousel-panel-enter") {
                    setIsChanging(false);
                  }
                }}
                data-project-id={project.id}
                tabIndex={abismoOpen || site3dOpen ? -1 : undefined}
                aria-hidden={abismoOpen || site3dOpen ? true : undefined}
                aria-current={position === "center" ? "true" : undefined}
                type="button"
                onPointerMove={handlePanelMove}
                onPointerLeave={handlePanelLeave}
                onClick={(event) => {
                  if (index !== activeIndex) {
                    activate(index);
                  } else if (project.id === "hyprland-themes" && onOpenThemeStudio) {
                    onOpenThemeStudio();
                  } else if (project.id === "abismo") {
                    setAbismoClosing(false);
                    setAbismoOpen(true);
                  } else if (project.id === "site-3d") {
                    setSite3dClosing(false);
                    setSite3dOpen(true);
                  } else {
                    trigger.current = event.currentTarget;
                    setSelected(project);
                  }
                }}
                aria-label={index === activeIndex
                  ? (project.id === "hyprland-themes" && onOpenThemeStudio
                      ? "Abrir página de " + project.title
                      : project.id === "abismo" ? "Jogar Abismo no card"
                      : project.id === "site-3d" ? "Explorar site-3D no card"
                      : "Abrir detalhes de " + project.title)
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
          {hasSwitched && !abismoOpen && !site3dOpen && (
            <span key={activeIndex} className="carousel-change-trail" aria-hidden="true" />
          )}
        </div>
      </div>
      <p id="project-carousel-help" className="carousel-accessibility-hint">
        Role o mouse sobre os cards, use as setas do teclado ou deslize horizontalmente no celular para percorrer os projetos em ciclo.
      </p>
      <span className="carousel-accessibility-hint" role="status" aria-live="polite">
        Projeto {activeIndex + 1} de {projects.length}: {projects[activeIndex]?.title}
      </span>
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
