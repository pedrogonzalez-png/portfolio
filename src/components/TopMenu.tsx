import { Link } from "react-router-dom";
import { useTheme } from "../stores/themeContext";

export function TopMenu({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const { theme } = useTheme();
  return (
    <header className="site-header">
      <Link className="site-logo" to="/" aria-label="Voltar ao início">
        <span className="site-logo-mark" aria-hidden="true">✦</span>
        PORTFÓLIO<span className="logo-dot">.</span>
      </Link>
      <nav className="site-nav" aria-label="Navegação principal">
        <a href="#inicio">Início</a>
        <a href="#projetos">Projetos</a>
        <a href="#habilidades">Habilidades</a>
        <a href="#sobre">Sobre / Contato</a>
      </nav>
      <button type="button" className="site-terminal-button" onClick={onOpenTerminal} title="Abrir terminal (Ctrl + `)">⌘_ Terminal</button>
      <div className="theme-indicator"><span className="theme-dot" /> {theme.name}</div>
    </header>
  );
}
