import { Route, Routes } from "react-router-dom";
import { TopMenu } from "../components/TopMenu";
import { ProjectPanel } from "../components/ProjectPanel";
import SceneIntegration from "../components/SceneIntegration";

function HomePage() {
  return (
    <>
      <SceneIntegration />
      <TopMenu />
      <main className="site-main">
        <section id="inicio" className="hero" aria-label="Apresentação">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-line" /> PORTFÓLIO / EXPERIÊNCIA INTERATIVA</div>
            <p className="hero-overline">Uma jornada por projetos, código e criatividade</p>
            <h1 id="hero-name" className="hero-title">NOME DO AUTOR</h1>
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
            <span>CHANGli / DARK</span>
          </div>
        </section>

        <section id="projetos" className="projects-area" aria-label="Projetos">
          <div className="section-heading">
            <p className="eyebrow">02 / PROJETOS SELECIONADOS</p>
            <h2>Um universo de <em>possibilidades.</em></h2>
            <p>Projetos do catálogo autorizado, ainda em desenvolvimento. Abra um painel para conhecer os detalhes.</p>
          </div>
          <ProjectPanel />
        </section>

        <section id="sobre" className="about-area" aria-label="Sobre e contato">
          <div className="about-copy">
            <p className="eyebrow">03 / SOBRE & CONTATO</p>
            <h2>O código conta <em>uma história.</em></h2>
            <p>A apresentação pessoal e os canais de contato serão adicionados após confirmação. Por enquanto, conheça os trabalhos pelo GitHub.</p>
            <a className="text-action" href="https://github.com/pedrogonzalez-png" target="_blank" rel="noopener noreferrer">Ver perfil no GitHub ↗</a>
          </div>
          <div className="about-orbit" aria-hidden="true"><span>DESIGN</span><span>CODE</span><span>LINUX</span></div>
        </section>
      </main>
      <footer className="site-footer">
        <span>PORTFÓLIO / CHANGLI</span>
        <span>Protótipo em desenvolvimento — sem demos publicadas</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </>
  );
}

export default function Pages() {
  return <Routes><Route path="/" element={<HomePage />} /></Routes>;
}
