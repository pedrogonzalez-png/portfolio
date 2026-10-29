import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { ThemePalette } from "../stores/themes";
import "../styles/real-desktop-preview.css";

// Public media owned by the visitor's source repository, referenced rather
// than copied into the portfolio or mistaken for a live Linux connection.
// The video is NEVER requested until a visitor explicitly opts in.
export const CHANGLI_WALLPAPER_URL =
  "https://raw.githubusercontent.com/pedrogonzalez-png/dotfiles-Arch/main/wallpapers/changli.png";
export const CHANGLI_VIDEO_URL =
  "https://raw.githubusercontent.com/pedrogonzalez-png/dotfiles-Arch/main/wallpapers/changli.mp4";
export const CHANGLI_THEME_SOURCE_URL =
  "https://github.com/pedrogonzalez-png/Hyprland-Themes/blob/main/end4-pC/changli.json";

function currentClock() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  }).format(new Date());
}

export function RealDesktopPreview({
  palette, themeName,
}: {
  palette: ThemePalette;
  themeName: string;
}) {
  const changli = themeName.trim().toLowerCase() === "changli";
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [wallpaperError, setWallpaperError] = useState(false);
  const [time, setTime] = useState(currentClock);

  useEffect(() => {
    const update = () => setTime(currentClock());
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    setVideoEnabled(false);
    setVideoError(false);
    setWallpaperError(false);
  }, [changli]);

  const variables = {
    "--real-desktop-surface": palette.surface,
    "--real-desktop-panel": palette.surfaceContainer,
    "--real-desktop-border": palette.outline,
    "--real-desktop-text": palette.text,
    "--real-desktop-muted": palette.textVariant,
    "--real-desktop-accent": palette.accentPrimary,
    "--real-desktop-gold": palette.accentYellow,
  } as CSSProperties;

  return (
    <div className="real-desktop-preview" style={variables}
      aria-label={changli ? "Prévia do desktop Changli com wallpaper original do GitHub" :
        "Prévia de cores do tema " + themeName}>
      {changli && !wallpaperError ? (
        <img className="real-desktop-wallpaper" src={CHANGLI_WALLPAPER_URL}
          alt="" aria-hidden="true" decoding="async"
          onError={() => setWallpaperError(true)} />
      ) : (
        <div className="real-desktop-wallpaper-fallback" aria-hidden="true" />
      )}
      {changli && videoEnabled && !videoError && (
        <video className="real-desktop-wallpaper" autoPlay loop muted playsInline
          preload="metadata" poster={CHANGLI_WALLPAPER_URL}
          aria-label="Wallpaper animado Changli do repositório do proprietário"
          onError={() => {
            setVideoError(true);
            setVideoEnabled(false);
          }}>
          <source src={CHANGLI_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      <div className="real-desktop-dim" aria-hidden="true" />

      <div className="real-desktop-topbar" aria-label="Barra visual inspirada na configuração Quickshell end4">
        <span className="real-desktop-brand" aria-hidden="true">✦</span>
        <span className="real-desktop-active" aria-hidden="true">Arch · Hyprland</span>
        <div className="real-desktop-workspaces" aria-hidden="true">
          <span className="is-active">01</span><span>02</span><span>03</span><span>04</span>
        </div>
        <span className="real-desktop-theme" aria-hidden="true">CHANGLI</span>
        <time className="real-desktop-time">{time}</time>
      </div>

      {!changli && (
        <p className="real-desktop-no-wallpaper">
          A paleta {themeName} está ativa nesta prévia. O wallpaper Changli não é aplicado a outros temas.
        </p>
      )}
      {changli && wallpaperError && (
        <p className="real-desktop-wallpaper-error" role="status">
          Não foi possível carregar o wallpaper do GitHub. Confira sua conexão.
        </p>
      )}

      {/* Representative static dock; not a claim to run the user's actual apps. */}
      <div className="real-desktop-dock" aria-label="Dock visual do desktop Quickshell">
        <span aria-hidden="true" title="Launcher">✦</span>
        <span aria-hidden="true" title="Terminal">▣</span>
        <span aria-hidden="true" title="Arquivos">▤</span>
        <span aria-hidden="true" title="Navegador">◉</span>
        <span aria-hidden="true" title="Configurações">⚙</span>
      </div>
      {changli && (
        <button type="button" className="real-desktop-video-toggle"
          aria-pressed={videoEnabled} title="Vídeo de wallpaper público; aproximadamente 36 MB"
          onClick={() => {
            setVideoError(false);
            setVideoEnabled((current) => !current);
          }}>
          {videoEnabled ? "Pausar wallpaper animado" : "Ativar wallpaper animado"}
        </button>
      )}
      {videoError && (
        <span className="real-desktop-video-error" role="status">
          MP4 indisponível neste navegador; imagem estática mantida.
        </span>
      )}
    </div>
  );
}
