import { useState } from "react";
import { PLACEHOLDER_PROJECTS, type Project } from "./PlaceholderCatalog";

interface ProjectPanelProps {
  open?: boolean;
  onClose?: () => void;
}

export function ProjectPanel({ open: _open, onClose }: ProjectPanelProps) {
  const [selected, setSelected] = useState<Project | null>(null);

  if (selected) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Painel do projeto ${selected.title}`}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(17, 10, 11, 0.92)",
          backdropFilter: "blur(16px)", zIndex: 200,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "2rem",
        }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "var(--color-text)", fontSize: "1.5rem", cursor: "pointer" }}
          aria-label="Fechar painel"
        >
          ✕
        </button>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", marginBottom: "1rem" }}>
          {selected.title}
        </h2>
        <p style={{ color: "var(--color-text-variant)", maxWidth: 640, textAlign: "center" }}>
          {selected.summary}
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ color: "var(--color-outline)", fontSize: "0.85rem" }}>
            Repo: {selected.repoFullName}
          </span>
          <span style={{ color: "var(--color-outline)", fontSize: "0.85rem" }}>
            Status: {selected.status} — {selected.isFinalizedConfirmed ? "finalizado" : "não confirmado"}
          </span>
        </div>
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <a
            href={selected.sourceUrl}
            target="_blank" rel="noopener noreferrer"
            style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", background: "var(--color-accent-primary)", color: "#fff", textDecoration: "none" }}
          >
            Repositório
          </a>
          {selected.demoUrl ? (
            <a href={selected.demoUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", background: "var(--color-surface-high)", color: "var(--color-text)", textDecoration: "none" }}>
              Demonstrar
            </a>
          ) : (
            <span style={{ padding: "0.6rem 1.2rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.05)", color: "var(--color-text-variant)", fontSize: "0.875rem" }}>
              Demo indisponível (aguarda confirmação do proprietário)
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Constelação de projetos" style={{ width: "100%", maxWidth: 900, margin: "2rem auto" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-text)", marginBottom: "1rem" }}>
        Projetos demonstráveis
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {PLACEHOLDER_PROJECTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            style={{
              textAlign: "left", padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "var(--color-text)", cursor: "pointer", transition: "background 0.2s",
            }}
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