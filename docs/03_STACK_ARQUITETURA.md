# 03 — Stack e arquitetura técnica [PROPOSTA TÉCNICA]

## Stack escolhida e justificativa

- **React 19 + TypeScript (strict) + Vite 8**: componentes de UI e build SPA, boa produtividade para muitas interfaces. Não exigir Next.js/SSR por padrão; o conteúdo 3D já depende do navegador. Vite/React devem usar versões estáveis compatíveis, registradas em lockfile.
- **Three.js + `@react-three/fiber` 9 + `@react-three/drei`**: cena 3D declarativa no ecossistema React 19; não usar a versão alpha de R3F 10/WebGPU como base sem necessidade.
- **GSAP com ScrollTrigger** (ou controle próprio pequeno se testes mostrarem vantagem): animações de câmera e sequência temporal; centralizar progresso e pausas, sem misturar várias bibliotecas de smooth scroll ao acaso. Preferir scroll nativo e controle de progressão; bibliotecas auxiliares só se necessário.
- **Zustand**: stores pequenas e isoladas para tema, navegação, foco/overlays, configurações de áudio, status dos projetos, UI do terminal e editor. Não armazenar por frame valores do mouse no React state.
- **React Router**: deep links e URLs de projetos, sem perder a cena principal; considerar hash router apenas se hospedagem não tiver rewrite para SPA.
- **TanStack Query / fetch**: cache controlado de leitura de dados GitHub (ou serviço estático) com retry/backoff e estados de offline/limite de API.
- **CodeMirror 6 readonly + renderização segura de Markdown**: editor visual de código com abas, linhas, busca e tema; menor peso que incluir Monaco inteiro no primeiro marco. Diff viewer pode usar pacote de parser de diff específico + componentes próprios.
- **Dexie sobre IndexedDB**: dados do Theme Studio, assets Blob, metadados, versões, notas e tarefas; usar transações.
- **CSS Modules ou CSS com tokens semânticos**: variáveis de tema, sem framework de design obrigatório. Decisões de Tailwind/shadcn ficam abertas para a implementação se justificadas; não acumular stacks UI.
- **Web Audio API**: controle de trilha/FX após gesto, com fallback sem áudio; não criar backend apenas para isso.
- **Vitest + React Testing Library + Playwright** e testes de acessibilidade (axe). TypeScript/ESLint/Prettier/CI.

Docs oficiais consultadas: `https://r3f.docs.pmnd.rs/getting-started/installation`, `https://vite.dev/guide/static-deploy`, `https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria`.

## Estrutura de pastas proposta (do novo repo)

```text
portfolio/
  public/                         # assets próprios autorizados, miniaturas leves
  src/
    app/                            # bootstrap, rotas, providers
    core/                           # constantes, contratos, theme engine, erros
    scene/                          # Canvas/R3F, câmera, partículas, materiais
      hero/
      constellation/
      skills/
      transitions/
    ui/                             # menu, overlay, painéis, sobre/contato
    projects/                       # catálogo aprovado, project host
      abismo/
      site3d/
      hyprland/
    github/                         # adapter API, catálogo, virtual FS, Git history
    terminal/                       # parser readonly, autocomplete, help, stdout
    code-viewer/                    # árvore de arquivos, tabs, markdown, diffs
    studio/                         # editor, canvas 2D DOM, widgets, cards, perfis
      components/
      widgets/
      data/
      persistence/
    audio/
    accessibility/
    tests/
  scripts/                           # geração de índices públicos, validações
  content/                           # dados revisados do portfólio e allowlists
  .github/workflows/
  docs/                              # documentação
```

**Não copiar** automaticamente os repositórios dos projetos para dentro de `src/`. Cada projeto demonstrável tem seu build/deploy e ciclo de vida próprio. Pode existir workspace auxiliar para orquestrar builds em CI, mas preservar autonomia.

## Fronteiras explícitas

- `scene`: só efeitos, materiais, câmera, interações 3D; conhece projetos por dados simplificados e IDs. Não implementa lógica de jogo, shell ou IndexedDB.
- `project host`: camada de expansão do painel; carrega build isolado do demo quando necessário; reconcilia botão voltar, foco e áudio.
- `github`: **somente leitura**. Não depende de projetos jogáveis; pode indexar repositórios separadamente.
- `studio`: aplicativo 2D estilo desktop, independente do Canvas 3D; muda paleta global ao receber comando Aplicar, mas não injeta wallpaper no mundo 3D.
- `theme`: fonte única de tokens semânticos; fornece variantes CSS e parâmetros para materiais Three.js; tema oficial inalterável, personalizações clonadas.

## Hospedagem proposta

- SPA estática hospedável em **Cloudflare Pages, Netlify, Vercel ou GitHub Pages** (escolher pelo comportamento de rutas, domínios e assets, não por preferência cega). GitHub Pages pode requerer `base` `/REPO/` e cuidado com deep links/rewrite.
- Abismo e site-3D: publicar **builds próprios** em subdomínios/subcaminhos **de mesma origem, quando viável**. Alternativa iframe sob origem separada com política de sandbox permissiva só ao necessário; verificar CSP, fullscreen, teclado, áudio e IndexedDB (saves em origem diferente ficam separados). Não assumir que iframe de GitHub renderiza app.
- API GitHub pública: para muitos acessos, preferir **índice estático gerado via GitHub Actions**, com token só em CI e snapshot versionado. Navegação nos arquivos/commits pode fazer fetch sob demanda a partir de caminhos aprovados; tratar quotas e cache. Apenas se houver necessidade, adicionar backend serverless para proxy/cache **read-only**; sem segredos enviados ao cliente.
- Imagens pesadas, fontes, modelos: compressão e carregamento tardio; preferir imagens AVIF/WebP quando próprias e licenciadas. Construir um manifesto de assets.

## Estado e fluxo de dados

```text
UI input / scroll / keyboard
    -> Navigation/Overlay store
    -> 3D Scene Controller + project host

Theme selection
    -> Theme engine -> CSS tokens + Three.js uniforms + terminal skin
    -> Local preferences

Terminal/editor
    -> Approved Repo Manifest -> Static Index/API adapter -> File/code view

Theme Studio
    -> editor model (widgets/cards/groups/layout profiles)
    -> validation -> Dexie/IndexedDB -> snapshots/versions/export
    -> Apply palette ONLY -> Theme engine
```

## Princípios de engenharia

- Estado da câmera/scroll é fonte única e reversível; não acoplar múltiplos listeners com resultados concorrentes.
- Separar `config` (dados declarativos) de `render` (Three/DOM) e `storage` (IndexedDB) por interfaces versionadas.
- Evitar alocar geometria/material por frame; pooling, instancing e uniforms nos efeitos.
- Otimização adaptativa baseada em capacidades/testes, não apenas largura da tela.
- Não confiar em arquivo de repositório como código executável; mostrar texto e diffs, nunca `eval`.
- Scripts de setup devem ser idempotentes e não apagar arquivos do usuário.
- Sem backend inicial, sem autenticação inicial, sem banco remoto de usuários.
