import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import { TopMenu } from "../components/TopMenu";
import { ProjectPanel } from "../components/ProjectPanel";
import { LandscapeExperience } from "../components/LandscapeExperience";
import SceneIntegration from "../components/SceneIntegration";
import { ThemeDisintegration } from "../components/desktop/ThemeDisintegration";
import { OFFICIAL_THEMES } from "../stores/themes";
import "../styles/hyprland-entry-transition.css";
import "../styles/cinematic-polish.css";
import "../styles/wuwa-art-direction.css";
import "../styles/author-profile.css";

const Terminal = lazy(() => import("../components/Terminal").then((module) => ({ default: module.Terminal })));
const ThemeStudio = lazy(() => import("../components/ThemeStudio").then((module) => ({ default: module.ThemeStudio })));

function HomePage({onOpenHyprland}:{onOpenHyprland:()=>void}) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#projetos") return;
    const frame = window.requestAnimationFrame(() =>
      document.getElementById("projetos")?.scrollIntoView?.({ behavior: "instant", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

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
            <p className="hero-overline">Phaser · React · Hyprland</p>
            <div className="hero-name-stage"><h1 id="hero-name" className="hero-title"><span className="hero-title-fallback">PEDRO GONZALEZ</span></h1><SceneIntegration /></div>
            <p className="hero-placeholder">PEDRO HENRIQUE MARIANO GONZALEZ</p>
            <p className="hero-description">
              Estudante de desenvolvimento de sistemas, com experiência em hardware e projetos de jogos, web e personalização Linux.
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
            <p>Abismo em Phaser, site-3D em React e uma galeria de temas Hyprland. Três projetos para explorar diretamente.</p>
          </div>
          <ProjectPanel onOpenThemeStudio={onOpenHyprland} />
        </section>

        <section id="sobre" className="about-area" aria-label="Sobre e contato">
          <div className="about-copy">
            <p className="eyebrow">03 / SOBRE & CONTATO</p>
            <h2>O código conta <em>uma história.</em></h2>
            <p className="author-identity">Pedro Henrique Mariano Gonzalez</p>
            <p>Sou estudante de ensino médio técnico em desenvolvimento de sistemas (2025–2027), com interesse em tecnologia e experiência em montagem, diagnóstico e manutenção de computadores, incluindo identificação de componentes e plataformas AMD AM3, AM4 e AM5.</p>
            <p>Minha formação inclui redes de computadores, bancos de dados, segurança da informação e projetos de TI. Tenho conhecimentos básicos de Python, HTML e CSS.</p>
            <ul className="author-skills" aria-label="Conhecimentos apresentados no currículo">
              <li>Montagem e diagnóstico de PCs</li>
              <li>Python · HTML · CSS — básico</li>
              <li>Formação técnica em desenvolvimento de sistemas</li>
            </ul>
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
      <footer className="site-footer">
        <span>PORTFÓLIO / PROJETOS</span>
        <span>Abismo · site-3D · Hyprland-Themes</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </>
  );
}

function HyprlandThemesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // A dedicated page should always open from its beginning, including after
    // coming from a scrolled project carousel. The exit link returns to Projects.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <LandscapeExperience title="Hyprland-Themes em modo horizontal">
    <main className="hyprland-dedicated-page">
      <Suspense fallback={<p role="status">Carregando exposição Hyprland-Themes...</p>}>
        <ThemeStudio onClose={() => navigate("/#projetos")} />
      </Suspense>
    </main>
    </LandscapeExperience>
  );
}

/**
 * Only the PROJECT ENTRY has a disintegration transition.
 * Keep the SAME HomePage React subtree alive while the route changes so the
 * old carousel, scroll position and WebGL scene do not reset on click.
 * The dedicated Hyprland page mounts underneath before the fragments vanish.
 */
export default function Pages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [leavingHome,setLeavingHome] = useState<{scrollY:number;accent:string;secondary:string}|null>(null);

  const openHyprland = useCallback(() => {
    if (location.pathname !== "/") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      navigate("/hyprland-themes");
      return;
    }
    const css = getComputedStyle(document.documentElement);
    setLeavingHome({
      scrollY:window.scrollY,
      accent:css.getPropertyValue("--color-accent-primary").trim() || OFFICIAL_THEMES[0].palette.accentPrimary,
      secondary:css.getPropertyValue("--color-accent-yellow").trim() || OFFICIAL_THEMES[0].palette.accentYellow,
    });
    navigate("/hyprland-themes");
  }, [location.pathname,navigate]);

  const renderHome = location.pathname === "/" || leavingHome !== null;
  return <>
    {location.pathname === "/hyprland-themes" && <HyprlandThemesPage />}
    {renderHome && (
      <div className={"hyprland-route-home" + (leavingHome ? " is-leaving" : "")}
        style={leavingHome ? {"--exit-scroll-y": leavingHome.scrollY+"px"} as CSSProperties : undefined}>
        <ThemeDisintegration active={leavingHome !== null}
          oldAccent={leavingHome?.accent ?? OFFICIAL_THEMES[0].palette.accentPrimary}
          oldSecondary={leavingHome?.secondary ?? OFFICIAL_THEMES[0].palette.accentYellow}
          newAccent={OFFICIAL_THEMES[0].palette.accentPrimary}
          onFinished={() => setLeavingHome(null)}>
          <div className="hyprland-route-home-content">
            <HomePage onOpenHyprland={openHyprland}/>
          </div>
        </ThemeDisintegration>
      </div>
    )}
  </>;
}
