import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { TopMenu } from "../components/TopMenu";
import { ProjectPanel } from "../components/ProjectPanel";
import { ProjectSelector } from "../components/ProjectSelector";
import SceneIntegration from "../components/SceneIntegration";

function HomePage({ onProjectSelect }: { onProjectSelect?: () => void }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "4rem 2rem 2rem",
        gap: "2rem",
      }}
    >
      <section aria-label="Hero de entrada">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          <span
            aria-label="Nome do autor — placeholder"
            style={{
              background: "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-yellow))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            [NOME DO AUTOR — PLACEHOLDER]
          </span>
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-variant)",
            fontSize: "1.1rem",
            maxWidth: "38ch",
            margin: "0 auto",
          }}
        >
          Desenvolvedor brasileiro — portfólio interativo 3D.
          <br />
          <strong style={{ color: "var(--color-text)" }}>Status M0:</strong>{ " "}
          base reprodutível construída; conteúdo pessoal e 3D em desenvolvimento.
        </p>
      </section>

      <section aria-label="Projetos candidatos">
        <ProjectSelector onProjectSelect={onProjectSelect} />
      </section>

      <section aria-label="Contatos">
        <p>
          Contato: [LINKS PENDENTES — aguardando autorização do proprietário]
        </p>
        <p style={{ fontSize: "0.85rem", marginTop: 0.25 }}>
          Sobre mim: [BIO PENDENTE — placeholders conforme doc 01, 11]
        </p>
      </section>

      <footer
        style={{
          paddingTop: "2rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--color-text-variant)",
        }}
      >
        <p>
          Portfólio 3D — Antigravity. Marco 0: base reprodutível construída.
          Nenhum conteúdo pessoal inventado.
        </p>
      </footer>
    </main>
  );
}

export default function Pages() {
  const [projectPanelOpen, setProjectPanelOpen] = useState(false);

  return (
    <div>
      <TopMenu />
      <Routes>
        <Route
          path="/"
          element={(
            <>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 0, pointerEvents: "none" }}>
                <SceneIntegration />
              </div>
              <HomePage onProjectSelect={() => setProjectPanelOpen(true)} />
              <ProjectPanel open={projectPanelOpen} onClose={() => setProjectPanelOpen(false)} />
            </>
          )}
        />
      </Routes>
    </div>
  );
}