import type { ThemePalette } from "../../stores/themes";

/** An independent character image card, never classified as a widget/wallpaper. */
export function DesktopCharacterCard({ name, url, palette }: {
  name: string; url: string; palette: ThemePalette;
}) {
  return (
    <figure className="desktop-character-card"
      style={{ backgroundColor: palette.surfaceContainer, borderColor: palette.outline }}>
      <img src={url} alt={"Imagem do card: " + name} draggable={false} />
      <figcaption title={name} style={{ color: palette.text }}>{name}</figcaption>
    </figure>
  );
}
