/**
 * Relações derivadas de arquivos públicos dos três repositórios autorizados.
 * Mostram evidência de uso, não níveis de domínio ou certificações.
 */
export type KnowledgeProjectId = "abismo" | "site-3d" | "hyprland-themes";
export type KnowledgeDomain = "web" | "games" | "linux" | "automation";

export type KnowledgeNode = {
  id: string;
  label: string;
  domain: KnowledgeDomain;
  description: string;
  projects: readonly KnowledgeProjectId[];
  evidenceUrl: string;
  x: number;
  y: number;
};

export const KNOWLEDGE_DOMAINS: ReadonlyArray<{ id: KnowledgeDomain; name: string }> = [
  { id: "web", name: "Web" },
  { id: "games", name: "Jogos" },
  { id: "linux", name: "Linux" },
  { id: "automation", name: "Automação" },
];

export const KNOWLEDGE_PROJECTS: ReadonlyArray<{ id: KnowledgeProjectId; x: number; y: number }> = [
  { id: "abismo", x: 20, y: 55 },
  { id: "site-3d", x: 50, y: 55 },
  { id: "hyprland-themes", x: 80, y: 55 },
];

export const KNOWLEDGE_NODES: readonly KnowledgeNode[] = [
  {
    id: "javascript", label: "JavaScript", domain: "web",
    description: "Linguagem usada no jogo Abismo e no projeto web de personagens.",
    projects: ["abismo", "site-3d"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/jogo-site/blob/main/src/main.js",
    x: 10, y: 16,
  },
  {
    id: "react", label: "React", domain: "web",
    description: "Interface interativa do site de personagens.",
    projects: ["site-3d"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/site-3D/blob/main/src/App.jsx",
    x: 29, y: 16,
  },
  {
    id: "css", label: "CSS", domain: "web",
    description: "Estilização da experiência visual e dos elementos de interface.",
    projects: ["site-3d"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/site-3D/blob/main/src/App.css",
    x: 48, y: 16,
  },
  {
    id: "vite", label: "Vite", domain: "web",
    description: "Ferramenta de desenvolvimento e build presente nos dois projetos web.",
    projects: ["abismo", "site-3d"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/site-3D/blob/main/package.json",
    x: 67, y: 16,
  },
  {
    id: "phaser", label: "Phaser", domain: "games",
    description: "Motor usado no jogo de ação e exploração Abismo.",
    projects: ["abismo"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/jogo-site/blob/main/package.json",
    x: 86, y: 16,
  },
  {
    id: "procedural", label: "Geração procedural", domain: "games",
    description: "Construção de mundo e salas a partir de regras e sementes.",
    projects: ["abismo"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/jogo-site/blob/main/src/world/WorldGenerator.js",
    x: 10, y: 87,
  },
  {
    id: "indexeddb", label: "IndexedDB", domain: "games",
    description: "Persistência de progresso e estado do jogo no navegador.",
    projects: ["abismo"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/jogo-site/blob/main/src/save/SaveSystem.js",
    x: 26, y: 87,
  },
  {
    id: "hyprland", label: "Hyprland", domain: "linux",
    description: "Configuração e personalização do ambiente de janelas no Linux.",
    projects: ["hyprland-themes"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/Hyprland-Themes/blob/main/dots/.config/hypr/hyprland/general.lua",
    x: 42, y: 87,
  },
  {
    id: "qml", label: "QML", domain: "linux",
    description: "Componentes de interface e ajustes de integração com o desktop.",
    projects: ["hyprland-themes"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/Hyprland-Themes/blob/main/overrides/end4-pC/modules/ii/wallpaperSelector/AnimatedWallpaperGrid.qml",
    x: 58, y: 87,
  },
  {
    id: "shell", label: "Shell", domain: "linux",
    description: "Scripts de instalação e automação do ambiente de desktop.",
    projects: ["hyprland-themes"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/Hyprland-Themes/blob/main/install.sh",
    x: 74, y: 87,
  },
  {
    id: "actions", label: "GitHub Actions", domain: "automation",
    description: "Pipelines de validação automatizada e testes dos repositórios.",
    projects: ["abismo", "hyprland-themes"],
    evidenceUrl: "https://github.com/pedrogonzalez-png/Hyprland-Themes/blob/main/.github/workflows/installer-smoke.yml",
    x: 90, y: 87,
  },
];
