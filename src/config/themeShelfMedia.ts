/**
 * HYPRLAND THEMES / CD SHELF — ÚNICO LUGAR PARA COLOCAR SUAS MÍDIAS
 *
 * 1. Envie os arquivos para public/media/themes/<tema>/ no repositório.
 * 2. Preencha as strings abaixo, por exemplo:
 *       cover: "/media/themes/changli/cover.webp",
 *       video: "/media/themes/changli/preview.mp4",
 *       poster: "/media/themes/changli/poster.webp",
 * 3. Uma string vazia usa a capa abstrata de vidro (sem imagens quebradas).
 *
 * cover = foto / captura do desktop na caixa de CD.
 * video = gravação mostrada APENAS na caixa selecionada (sem áudio).
 * poster = quadro estático opcional antes de iniciar o vídeo.
 *
 * Não use imports do bundler nem edite JSX/CSS para trocar as mídias.
 * Links HTTPS também funcionam, se o servidor permitir exibir a mídia.
 * Nenhum arquivo, print ou vídeo foi fabricado ou incluído nesta etapa.
 */
export interface ThemeShelfMedia {
  cover: string;
  video: string;
  poster: string;
}
export type OfficialShelfThemeId =
  | "changli" | "hiyuki" | "emilia" | "furina" | "hotline-miami";

export const THEME_SHELF_MEDIA: Readonly<Record<OfficialShelfThemeId, ThemeShelfMedia>> = {
  changli: { cover: "", video: "", poster: "" },
  hiyuki: { cover: "", video: "", poster: "" },
  emilia: { cover: "", video: "", poster: "" },
  furina: { cover: "", video: "", poster: "" },
  "hotline-miami": { cover: "", video: "", poster: "" },
};
