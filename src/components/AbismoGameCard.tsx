import { useEffect, useRef, useState } from "react";
import "../styles/abismo-card.css";
import { LandscapeExperience } from "./LandscapeExperience";

type LoadState = "checking" | "available" | "missing" | "failed";

/** The real Phaser build is served from this portfolio's own /abismo/ folder.
 * A ready.json file is emitted ONLY after npm run sync:abismo succeeds.
 * This avoids displaying the portfolio's SPA fallback as if it were a game.
 */
export function AbismoGameCard({
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fullscreenError, setFullscreenError] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    const verify = async () => {
      setState("checking");
      try {
        const res = await fetch("/abismo/ready.json", {
          signal: abort.signal,
          cache: "no-store",
        });
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          setState("missing");
          return;
        }
        const data: unknown = await res.json();
        if (data && typeof data === "object" && "build" in data &&
            data.build === "abismo" && "base" in data &&
            data.base === "/abismo/") {
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
    const viewport = viewportRef.current;
    if (!viewport?.requestFullscreen) {
      setFullscreenError(true);
      return;
    }
    try {
      await viewport.requestFullscreen();
      setFullscreenError(false);
    } catch {
      setFullscreenError(true);
    }
  };

  return (
    <LandscapeExperience title="Abismo em modo horizontal" closing={closing}>
    <section
      className="abismo-live-card"
      aria-label="Abismo — jogo integrado"
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) {
          onExitComplete?.();
        }
      }}
    >
      <header className="abismo-live-header">
        <button
          type="button"
          className="abismo-live-back"
          onClick={onClose}
          aria-label="Voltar aos projetos"
        >
          <span aria-hidden="true">←</span> Voltar
        </button>
        <div className="abismo-live-brand">
          <span className="abismo-live-kicker">JOGO ORIGINAL / PHASER</span>
          <h3>ABISMO <span>· EXPERIÊNCIA INTERATIVA</span></h3>
        </div>
        <div className="abismo-live-actions">
          {state === "available" && (
            <button type="button" onClick={() => setReload(value => value + 1)}>
              <span className="abismo-live-action-icon" aria-hidden="true">↻</span>
              Reiniciar jogo
            </button>
          )}
          {state === "available" && (
            <button
              type="button"
              className="abismo-live-fullscreen"
              aria-label="Abrir Abismo em tela cheia"
              title="Tela cheia"
              onClick={() => { void openFullscreen(); }}
            >
              <span className="abismo-live-action-icon" aria-hidden="true">⛶</span>
            </button>
          )}
        </div>
      </header>
      <div ref={viewportRef} className="abismo-live-viewport" aria-label="Tela jogável do Abismo">
        {state === "available" ? (
          <iframe key={reload} ref={iframeRef}
            title="Abismo — jogo Phaser integrado ao card"
            src="/abismo/index.html" allow="fullscreen"
            sandbox="allow-scripts allow-same-origin"
            loading="eager"
          />
        ) : (
          <div className="abismo-live-fallback" role="status">
            <span className="abismo-live-symbol" aria-hidden="true">◈</span>
            <strong>{state === "checking" ? "Preparando o portal..." :
              state === "missing" ? "O jogo ainda não foi instalado nesta cópia" :
              "Não foi possível verificar o jogo"}</strong>
            <p>
              {state === "checking" ? "Verificando os arquivos locais do Abismo." :
                "Para carregar o jogo original neste card, execute npm run sync:abismo na pasta do portfólio."}
            </p>
            {state !== "checking" && (
              <button type="button" onClick={() => setCheck(value => value + 1)}>
                Verificar novamente
              </button>
            )}
          </div>
        )}
      </div>
      <footer className="abismo-live-footer">
        <span>1280 × 720 · PHASER 4 · BUILD LOCAL</span>
        <span>{fullscreenError
          ? "O navegador não permitiu abrir em tela cheia."
          : "Clique na área do jogo para usar mouse e teclado. O progresso é salvo pelo Abismo."}</span>
      </footer>
    </section>
    </LandscapeExperience>
  );
}
