import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { PLACEHOLDER_PROJECTS, type Project } from "./PlaceholderCatalog";
import { EmbeddedDemo } from "./EmbeddedDemo";
import { SpineWorld } from "./SpineWorld";
import { ProjectArtwork } from "./ProjectArtwork";
import "../styles/project-cards.css";

const CARD_DETAILS: Record<string, { eyebrow: string; headline: string; description: string }> = {
  abismo: {
    eyebrow: "GAME DESIGN / PHASER",
    headline: "Entre no desconhecido.",
    description: "RPG de exploração e combate, com mundo procedural e identidade ASCII.",
  },
  "site-3d": {
    eyebrow: "EXPERIÊNCIA WEB / REACT",
    headline: "O digital em movimento.",
    description: "Uma roleta interativa de personagens, vídeos e transições imersivas.",
  },
  "hyprland-themes": {
    eyebrow: "LINUX / PERSONALIZAÇÃO",
    headline: "Um desktop, cinco mundos.",
    description: "Temas personalizados para ambientes Hyprland, com paletas e widgets.",
  },
};

function handleCardPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
  if (event.pointerType === "touch") return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  card.style.setProperty("--light-x", (x * 100).toFixed(2) + "%");
  card.style.setProperty("--light-y", (y * 100).toFixed(2) + "%");
  card.style.setProperty("--tilt-x", ((0.5 - y) * 8).toFixed(2) + "deg");
  card.style.setProperty("--tilt-y", ((x - 0.5) * 10).toFixed(2) + "deg");
}

function resetCardPointer(event: ReactPointerEvent<HTMLButtonElement>) {
  const card = event.currentTarget;
  card.style.setProperty("--light-x", "50%");
  card.style.setProperty("--light-y", "40%");
  card.style.setProperty("--tilt-x", "0deg");
  card.style.setProperty("--tilt-y", "0deg");
}

export function ProjectPanel() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

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
      <div id="spine-stage" className="spine-stage">
        <SpineWorld />
        <div className="spine-guide" aria-hidden="true">
          <span>02 / NÚCLEO CRIATIVO</span>
          <span>TRÊS PROJETOS · UMA JORNADA</span>
        </div>
        <div className="project-grid orbit-grid">
          {PLACEHOLDER_PROJECTS.filter((p) => p.featured && p.status !== "hidden").map((project, index) => {
            const content = CARD_DETAILS[project.id];
            return (
              <button
                key={project.id}
                className={"project-card orbit-card orbit-card-" + index}
                type="button"
                onPointerMove={handleCardPointerMove}
                onPointerLeave={resetCardPointer}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(project);
                }}
                aria-label={"Abrir detalhes de " + project.title}
              >
                <span className="orbital-card-glow" aria-hidden="true" />
                <span className="orbital-card-index">
                  <span className="orbital-card-number">0{index + 1}</span>
                  <span className="orbital-card-index-label">/ PROJETO SELECIONADO</span>
                  <span className="orbital-card-indicator" aria-hidden="true"><span /></span>
                </span>

                <ProjectArtwork projectId={project.id} />

                <span className="orbital-card-content">
                  <span className="orbital-card-eyebrow">{content.eyebrow}</span>
                  <span className="orbital-card-title">{project.title}</span>
                  <span className="orbital-card-headline">{content.headline}</span>
                  <span className="orbital-card-description">{content.description}</span>
                  <span className="orbital-card-tech">{project.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</span>
                </span>
                <span className="orbital-card-footer">
                  <span className="orbital-card-draft"><span className="orbital-status-dot" /> EM DESENVOLVIMENTO</span>
                  <span className="orbital-card-cta">EXPLORAR <span aria-hidden="true">↗</span></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="projects-disclaimer">Três projetos selecionados · Em desenvolvimento · Demonstrações ainda indisponíveis</p>
      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
            <button className="modal-close" type="button" ref={closeButton} onClick={close} aria-label="Fechar projeto">✕</button>
            <p className="eyebrow">EXPLORAR PROJETO / {selected.status.toUpperCase()}</p>
            <h2 id="project-dialog-title">{selected.title}</h2>
            <p className="dialog-summary">{selected.summary.split(" Status:")[0]}</p>
            <div className="dialog-tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <p className="dialog-status">{selected.isFinalizedConfirmed ? "Finalização confirmada" : "Projeto ainda não finalizado"} · {selected.demoUrl ? "Demo configurada" : "Sem demonstração publicada"}</p>
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
