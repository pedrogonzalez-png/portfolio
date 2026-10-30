import { useState } from "react";
import { PLACEHOLDER_PROJECTS } from "./PlaceholderCatalog";

interface ProjectSelectorProps {
  onProjectSelect?: (projectId?: string) => void;
}

export function ProjectSelector({ onProjectSelect }: ProjectSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section aria-label="Constelação de projetos" style={{ width: "100%", maxWidth: 900, margin: "2rem auto 0" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-text)", marginBottom: "1rem" }}>
        Projetos candidatos (placeholder — não finalizados)
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {PLACEHOLDER_PROJECTS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedId(p.id);
              if (onProjectSelect) onProjectSelect(p.id);
            }}
            style={{
              textAlign: "left", padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "var(--color-text)", cursor: "pointer", transition: "background 0.2s",
            }}
            aria-pressed={selectedId === p.id ? true : undefined}
          >
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", marginBottom: 0.25 }}>{p.title}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-variant)", marginBottom: 0.25 }}>{p.summary.slice(0, 120)}...</p>
            <span style={{ fontSize: "0.7rem", color: "var(--color-outline)" }}>{p.repoFullName} — {p.status} — {p.demoUrl ? "demo disponível" : "demo indisponível"}</span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: "0.78rem", color: "var(--color-text-variant)", marginTop: "0.75rem" }}>
        ⛔ <strong>dotfiles-Arch</strong> excluído por decisão explícita do proprietário (docs 01, 05, 11). Nenhum outro repo sem aprovação manual entra na constelação.
      </p>
    </section>
  );
}
