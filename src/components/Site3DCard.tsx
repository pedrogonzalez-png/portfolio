import { useEffect, useRef, useState } from "react";
import "../styles/abismo-card.css";
import { LandscapeExperience } from "./LandscapeExperience";

/** The original React/Vite site is built separately into public/site-3d/.
 * Never show the portfolio's SPA fallback as though it were the project.
 */
type LoadState = "checking" | "available" | "missing" | "failed";

export function Site3DCard({
  onClose,
  onExitComplete,
  closing = false,
}: {
  onClose: () => void;
  onExitComplete?: () => void;
  closing?: boolean;
}) {
  const [state, setState] = useState<LoadState>("checking");
  const [reload, setReload] = useState(0);
  const [check, setCheck] = useState(0);
  const [fullscreenError, setFullscreenError] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const abort = new AbortController();
    const verify = async () => {
      setState("checking");
      try {
        const res = await fetch("/site-3d/ready.json", {
          cache: "no-store", signal: abort.signal,
        });
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          setState("missing");
          return;
        }
        const data: unknown = await res.json();
        if (data && typeof data === "object" && "build" in data &&
            data.build === "site-3d" && "base" in data &&
            data.base === "/site-3d/") {
          setState("available");
        } else {
          setState("missing");
        }
      } catch {
        if (!abort.signal.aborted) setState("failed");
      }
    };
    void verify();
    return () => abort.abort();
  }, [check]);

  const openFullscreen = async () => {
    if (!viewportRef.current?.requestFullscreen) {
      setFullscreenError(true);
      return;
    }
    try {
      await viewportRef.current.requestFullscreen();
      setFullscreenError(false);
    } catch {
      setFullscreenError(true);
    }
  };

  return (
    <LandscapeExperience title="Site 3D em modo horizontal" closing={closing}>
    <section
      className="abismo-live-card site3d-live-card"
      aria-label="Site 3D — experiência integrada"
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) onExitComplete?.();
      }}
    >
      <header className="abismo-live-header">
        <button type="button" className="abismo-live-back" onClick={onClose}
          aria-label="Voltar aos projetos">
          <span aria-hidden="true">←</span> Voltar
        </button>
        <div className="abismo-live-brand">
          <span className="abismo-live-kicker">PROJETO ORIGINAL / REACT + VITE</span>
          <h3>SITE 3D <span>· GALERIA INTERATIVA</span></h3>
        </div>
        <div className="abismo-live-actions">
          {state === "available" && (
            <>
              <button type="button" onClick={() => setReload(value => value + 1)}>
                <span className="abismo-live-action-icon" aria-hidden="true">↻</span>
                Recarregar
              </button>
              <button type="button" className="abismo-live-fullscreen"
                aria-label="Abrir Site 3D em tela cheia" title="Tela cheia"
                onClick={() => { void openFullscreen(); }}>
                <span className="abismo-live-action-icon" aria-hidden="true">⛶</span>
              </button>
            </>
          )}
        </div>
      </header>

      <div ref={viewportRef} className="abismo-live-viewport" aria-label="Área interativa do Site 3D">
        {state === "available" ? (
          <iframe key={reload}
            title="Site 3D — projeto React original integrado ao card"
            src="/site-3d/index.html"
            sandbox="allow-scripts allow-same-origin"
            allow="fullscreen"
            loading="eager"
          />
        ) : (
          <div className="abismo-live-fallback" role="status">
            <span className="abismo-live-symbol" aria-hidden="true">◈</span>
            <strong>{state === "checking" ? "Preparando a experiência…" :
              state === "missing" ? "O Site 3D ainda não foi instalado nesta cópia" :
                "Não foi possível verificar o Site 3D"}</strong>
            <p>{state === "checking" ? "Verificando a build local do projeto original." :
              "Execute npm run sync:site3d na pasta do portfólio para carregar o projeto real neste card."}</p>
            {state !== "checking" && (
              <button type="button" onClick={() => setCheck(value => value + 1)}>
                Verificar novamente
              </button>
            )}
          </div>
        )}
      </div>
      <footer className="abismo-live-footer">
        <span>REACT · VITE · GALERIA DE PERSONAGENS</span>
        <span>{fullscreenError ? "O navegador não permitiu tela cheia." :
          "Explore os personagens com mouse, rolagem e pesquisa dentro da experiência."}</span>
      </footer>
    </section>
    </LandscapeExperience>
  );
}
