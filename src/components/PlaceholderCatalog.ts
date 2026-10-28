import APPROVED_GITHUB_REPOS from "../data/approved-repos.json";
/**
 * M0 — Catálogo de projetos aprovados (MANIFESTO VERSÃO M2-01).
 * Atualizado conforme PR-M2-01 (apenas documentação — sem URLs falsas,
 * sem alteração nos repositórios originais, sem alteração em dotfiles-Arch).
 * Nenhum projeto é declarado finalizado sem confirmação do proprietário.
 */
export type ProjectStatus = "draft" | "review" | "approved" | "hidden";

export interface Project {
  id: string;
  repoFullName: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  isFinalizedConfirmed: boolean;
  featured: boolean;
  explorerApproved: boolean;
  demoKind: "game" | "webapp" | "gallery" | null;
  demoUrl: string | null;
  tags: string[];
  credits?: string;
  sourceUrl: string;
  lastReviewed: string;
}

/**
 * Projeto A — ABISMO (jogo-site).
 * Candidato aprovado para destaque (featured) com status draft.
 * Nenhuma URL de demo confirmada até aprovação do proprietário.
 */
export const ABISMO: Project = {
  id: "abismo",
  repoFullName: APPROVED_GITHUB_REPOS["abismo"],
  title: "Abismo",
  summary:
    "RPG ação/exploração top-down com ASCII de alta densidade, combate souls-like, mundo procedural e saves IndexedDB. (Phaser 4, Vite 8, JS ESM.) Status: draft — não finalizado até confirmação do proprietário.",
  status: "draft",
  isFinalizedConfirmed: false,
  featured: true,
  explorerApproved: true,
  demoKind: "game",
  demoUrl: null,
  tags: ["Phaser", "RPG", "Procedural", "IndexedDB"],
  sourceUrl: "https://github.com/pedrogonzalez-png/jogo-site",
  lastReviewed: "2026-10-27",
};

/**
 * Projeto B — SITE-3D (site-3D).
 * Candidato aprovado para destaque (featured) com status draft.
 * Nenhuma URL de demo confirmada até aprovação do proprietário.
 */
export const SITE3D: Project = {
  id: "site-3d",
  repoFullName: APPROVED_GITHUB_REPOS["site-3d"],
  title: "site-3D",
  summary:
    "Experiência web interativa de seleção de personagens com roleta em arco, vídeos intro/idle e busca. (React 19, Vite 8.) Status: draft — não finalizado até confirmação do proprietário.",
  status: "draft",
  isFinalizedConfirmed: false,
  featured: true,
  explorerApproved: true,
  demoKind: "webapp",
  demoUrl: null,
  tags: ["React", "WebGL", "Video"],
  sourceUrl: "https://github.com/pedrogonzalez-png/site-3D",
  lastReviewed: "2026-10-27",
};

/**
 * Projeto C — HYPRLAND-THEMES.
 * Candidato aprovado para destaque (featured) com status draft.
 * Nenhuma URL de demo confirmada até aprovação do proprietário.
 */
export const HYPRLAND_THEMES: Project = {
  id: "hyprland-themes",
  repoFullName: APPROVED_GITHUB_REPOS["hyprland-themes"],
  title: "Hyprland-Themes",
  summary:
    "Galeria dos cinco temas oficiais (Changli, Hiyuki, Emilia, Furina, Hotline Miami) com tokens JSON e entrada para Theme Studio. Status: draft — não finalizado até confirmação do proprietário.",
  status: "draft",
  isFinalizedConfirmed: false,
  featured: true,
  explorerApproved: true,
  demoKind: "gallery",
  demoUrl: null,
  tags: ["Themes", "QML", "JSON"],
  sourceUrl: "https://github.com/pedrogonzalez-png/Hyprland-Themes",
  lastReviewed: "2026-10-27",
};

/**
 * Catálogo completo dos candidatos aprovados.
 * Nenhum projeto é considerado aprovado sem explícita confirmação.
 * `dotfiles-Arch` está definitivamente EXCLUÍDO (decisão explícita — docs 01, 05, 11).
 */
export const PLACEHOLDER_PROJECTS: Project[] = [ABISMO, SITE3D, HYPRLAND_THEMES];

/**
 * Lista de repositórios EXCLUÍDOS do portfólio (decisão do proprietário).
 */
export const EXCLUDED_REPOS = ["dotfiles-Arch"];
