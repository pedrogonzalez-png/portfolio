# Portfólio 3D — Antigravity

> Marco 0: Base reprodutível construída. Ambiente inicial, build, lint, typecheck, tests passam.

## Stack (M0)

- React 19 + TypeScript (strict) + Vite 8
- React Router 7
- ESLint + Prettier + Vitest + jsdom
- Tokens CSS derivados do tema **Changli** (fonte: `Hyprland-Themes/end4-pC/changli.json`)

## Estrutura M0

```
src/
  app/
    App.tsx           # Providers (Theme, Accessibility) + HomePage
    pages.tsx         # Rotas placeholder + HomePage
  components/
    TopMenu.tsx       # Menu pill translúcido + seletor de tema + audio toggle
    ProjectCard.tsx   # Card de projeto (placeholder)
    PlaceholderCatalog.ts  # Catálogo de 3 projetos candidatos + exclusão
    AccessibilityProvider.tsx  # Reduced motion + audio opt-in
  stores/
    ThemeProvider.tsx # Zustand-like context (placeholder M0)
  styles/
    changli.ts        # Tokens do tema Changli (exatos do JSON oficial)
    globals.css       # CSS variables semânticas + reset
  __tests__/
    base.test.ts      # Smoke test do ambiente
    theme.test.ts     # Validação dos tokens Changli
```

## Projetos Candidatos (Placeholder — Não Finalizados)

| ID | Título | Repositório | Status |
|----|--------|-------------|--------|
| abismo | Abismo | `pedrogonzalez-png/jogo-site` | draft |
| site-3d | site-3D | `pedrogonzalez-png/site-3D` | draft |
| hyprland-themes | Hyprland-Themes | `pedrogonzalez-png/Hyprland-Themes` | draft |

**Excluído:** `dotfiles-Arch` (decisão explícita do proprietário — doc 01, 11)

## Conteúdo Pessoal — Pendente (Placeholders)

- Nome de exibição: `[NOME DO AUTOR — PLACEHOLDER]`
- Cargo/função: pendente
- Bio curta/longa: `[BIO PENDENTE]`
- Contatos (GitHub, email, etc.): `[LINKS PENDENTES]`
- Skills dominadas: pendente

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # tsc + vite build
npm run lint       # ESLint
npm run format     # Prettier --write
npm run test       # Vitest run
npm run typecheck  # tsc --noEmit
```

## Critérios de Aceite M0 (doc 10)

- [x] App vazio inicializa
- [x] Build/lint/typecheck/test básicos passam
- [x] Tela HTML acessível exibe nome/links placeholders identificados
- [x] Arquitetura do repo corresponde aos docs (estrutura, tokens Changli, catálogo placeholder, providers)

## Próximos Marcos (resumo)

| Marco | Foco |
|-------|------|
| M1 | Hero particulado, constelação mock, câmera spline, fallback, tema Changli |
| M2 | Host isolado + lazy load Abismo + site-3D, UI expandido |
| M3 | GitHub terminal + explorer + CodeMirror |
| M4 | 5 temas oficiais, tokens globais, transição, galeria |
| M5 | Theme Studio essencial (desktop DOM, wallpaper, cards, widgets, autosave) |
| M6 | Theme Studio avançado (grupos, perfis, histórico, export/import) |
| M7 | Polimento, QA, deploy público |

---

© 2026 — Especificação canônica dos docs 01-11. Nenhum asset externo usado sem autorização.