/**
 * M2 — Componente para embed de demo de projeto (Abismo e site-3D).
 * Usado por ProjectPanel. Atua como viewport isolado.
 * Pode renderizar iframe ou fallback (carregando, indisponível).
 */
import { useState, useEffect } from "react";

interface EmbeddedDemoProps {
  projectId: string;
  demoUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmbeddedDemo({ projectId, demoUrl, isOpen, onClose }: EmbeddedDemoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setHasError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultFallback = {
    abismo: {
      title: "Abismo (jogo Phaser)",
      caption: "Demo provisória — carregar da origem do repositório quando disponível.",
    },
    "site-3d": {
      title: "site-3D",
      caption: "Experiência web de seleção de personagens, roleta e vídeos (React).",
    },
  }[projectId] || { title: projectId, caption: "Demo não implementada ainda." };

  if (hasError || !demoUrl) {
    return (
      <div role="status" aria-live="polite" style={{ padding: "1.5rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.05)", textAlign: "center" }}>
        <h3 style={{ margin: 0, color: "var(--color-text)", fontFamily: "var(--font-display)" }}>{defaultFallback.title}</h3>
        <p style={{ color: "var(--color-text-variant)", fontSize: "0.9rem", margin: "0.5rem 0 1rem" }}>{defaultFallback.caption}</p>
        {projectId === "abismo" ? (
          <div>
            <strong>Abismo (jogo-site):</strong><br />Sem URL de deploy do jogo confirmada. Quando confirmada, será renderizada via iframe ou rota própria.
          </div>
        ) : (
          <div>
            <strong>site-3D:</strong><br />Sem URL de deploy do site-3D confirmada. Quando confirmada, será renderizada via iframe ou rota própria.
          </div>
        )}
        <div style={{ marginTop: "1rem" }}>
          <button onClick={onClose} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--color-accent-primary)", color: "#fff", border: "none", cursor: "pointer" }}>Fechar</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <strong>Carregando demo...</strong>
      </div>
    );
  }

  return (
    <div role="region" aria-label={`Demo ${projectId}`} style={{ width: "100%", height: "70vh", border: "none", borderRadius: "0.75rem", overflow: "hidden", background: "#000" }}>
      <iframe
        src={demoUrl}
        title={`${projectId} demo`} width="100%" height="100%" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        style={{ border: "none", width: "100%", height: "100%" }}
      />
    </div>
  );
}
