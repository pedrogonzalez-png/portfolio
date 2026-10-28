import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { TopMenu } from "../components/TopMenu";
import { ProjectPanel } from "../components/ProjectPanel";
import SceneIntegration from "../components/SceneIntegration";
import { KnowledgeTree } from "../components/KnowledgeTree";

const Terminal = lazy(() => import("../components/Terminal").then((module) => ({ default: module.Terminal })));
const ThemeStudio = lazy(() => import("../components/ThemeStudio").then((module) => ({ default: module.ThemeStudio })));

function HomePage() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);
  const openStudio = useCallback(() => setStudioOpen(true), []);
  const closeStudio = useCallback(() => setStudioOpen(false), []);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "Backquote") {
        event.preventDefault();
        setTerminalOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  return (
    <>
      <TopMenu onOpenTerminal={openTerminal} />
      <main className="site-main">
        <section id="inicio" className="hero" aria-label="Apresentação">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-line" /> PORTFÓLIO / EXPERIÊNCIA INTERATIVA</div>
            <p className="hero-overline">Uma jornada por projetos, código e criatividade</p>
            <div className="hero-name-stage"><h1 id="hero-name" className="hero-title"><span className="hero-title-fallback">NOME DO AUTOR</span></h1><SceneIntegration /></div>
            <p className="hero-placeholder">NOME DE APRESENTAÇÃO PENDENTE</p>
            <p className="hero-description">
              Desenvolvimento web, jogos e personalização Linux. Explore três projetos reais em construção.
            </p>
            <a className="primary-action" href="#projetos">
              Explorar projetos <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className="hero-bottom" aria-hidden="true">
            <span>01 / INTRODUÇÃO</span>
            <span className="scroll-indicator">ROLE PARA EXPLORAR ↓</span>
            <span>PROJETOS / CRIAÇÃO</span>
          </div>
        </section>

        <section id="projetos" className="projects-area" aria-label="Projetos">
          <div className="section-heading">
            <p className="eyebrow">02 / PROJETOS SELECIONADOS</p>
            <h2>Um universo de <em>possibilidades.</em></h2>
            <p>Projetos do catálogo autorizado, ainda em desenvolvimento. Abra um painel para conhecer os detalhes.</p>
          </div>
          <ProjectPanel onOpenThemeStudio={openStudio} />
        </section>

        <section id="habilidades" className="knowledge-area" aria-label="Habilidades e conhecimentos">
          <div className="section-heading">
            <p className="eyebrow">03 / ÁRVORE DE CONHECIMENTOS</p>
            <h2>Ideias que se <em>conectam.</em></h2>
            <p>Tecnologias utilizadas nos três repositórios selecionados. Explore as conexões e veja as evidências no código.</p>
          </div>
          <KnowledgeTree />
        </section>

        <section id="sobre" className="about-area" aria-label="Sobre e contato">
          <div className="about-copy">
            <p className="eyebrow">04 / SOBRE & CONTATO</p>
            <h2>O código conta <em>uma história.</em></h2>
            <p>A apresentação pessoal e os canais de contato serão adicionados após confirmação. Por enquanto, conheça os trabalhos pelo GitHub.</p>
            <a className="text-action" href="https://github.com/pedrogonzalez-png" target="_blank" rel="noopener noreferrer">Ver perfil no GitHub ↗</a>
          </div>
          <div className="about-orbit" aria-hidden="true"><span>DESIGN</span><span>CODE</span><span>LINUX</span></div>
        </section>
      </main>
      {terminalOpen && (
        <Suspense fallback={<div role="status">Carregando terminal...</div>}>
          <Terminal onClose={closeTerminal} />
        </Suspense>
      )}
      {studioOpen && (
        <Suspense fallback={<div role="status">Carregando Theme Studio...</div>}>
          <ThemeStudio onClose={closeStudio} />
        </Suspense>
      )}
      <footer className="site-footer">
        <span>PORTFÓLIO / PROJETOS</span>
        <span>Protótipo em desenvolvimento — sem demos publicadas</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </>
  );
}

export default function Pages() {
  return <Routes><Route path="/" element={<HomePage />} /></Routes>;
}
