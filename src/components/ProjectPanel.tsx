import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER_PROJECTS, type Project } from "./PlaceholderCatalog";
import { EmbeddedDemo } from "./EmbeddedDemo";
import { SpineWorld } from "./SpineWorld";

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
        {PLACEHOLDER_PROJECTS.filter((p) => p.featured && p.status !== "hidden").map((project, index) => (
          <button
            key={project.id}
            className={"project-card orbit-card orbit-card-" + index}
            type="button"
            onClick={(event) => {
              trigger.current = event.currentTarget;
              setSelected(project);
            }}
            aria-label={"Abrir detalhes de " + project.title}
          >
            <span className="card-topline"><span>0{index + 1} / PROJETO</span><span className="card-arrow">↗</span></span>
            <span className={"card-art card-art-" + index} aria-hidden="true"><span className="card-art-core" /></span>
            <span className="card-information">
              <span className="card-title">{project.title}</span>
              <span className="card-description">{project.summary.split(" Status:")[0]}</span>
              <span className="card-tags">{project.tags.slice(0, 3).join(" · ")}</span>
              <span className="card-status">EM DESENVOLVIMENTO · DEMO INDISPONÍVEL</span>
            </span>
          </button>
        ))}
        </div>
      </div>
      <p className="projects-disclaimer">Apenas os três projetos autorizados. Nenhum projeto é apresentado como finalizado ou com demo disponível sem confirmação.</p>
      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
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
