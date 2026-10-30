/**
 * M0 — Card placeholder para projetos do catálogo.
 * Usado na constelação 3D. Contém apenas conteúdo textual; visual 3D
 * ainda não implementado (M1/M2).
 */
import { Project } from "./PlaceholderCatalog";

interface ProjectCardProps {
  project: Project;
  onSelect?: () => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      style={{
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
    >
      <h3 style={{ color: "var(--color-text)", marginBottom: 0.5 }}>
        {project.title}
      </h3>
      <p
        style={{
          color: "var(--color-text-variant)",
          fontSize: 0.875,
          marginTop: 0.25,
        }}
      >
        {project.summary}
      </p>
    </div>
  );
}