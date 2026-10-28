# DOCUMENTAÇÃO COMPLETA — PORTFÓLIO 3D / ANTIGRAVITY

> Versão única para leitura fácil em qualquer IDE/agente. O arquivo ZIP traz a mesma documentação separada em 11 capítulos, o README de orientação e a captura visual do desktop.
> **Status: especificação; não há código novo nem testes executados.**
> **Regra:** não adicionar funcionalidades além das aprovadas; ler todo o documento antes de implementar.

---

# PORTFÓLIO INTERATIVO 3D — Especificação canônica para Antigravity

**Data de referência:** 27/10/2026  
**Responsável pelo produto:** proprietário do GitHub `pedrogonzalez-png`  
**Status:** PLANEJAMENTO APROVADO; o novo portfólio **ainda não foi implementado**.  
**Idioma da interface:** português brasileiro; preparar internacionalização futura, não traduzir por conta própria.  
**Missão:** criar um portfólio de desenvolvedor imersivo, elegante, interativo e navegável, com projetos realmente experimentáveis, terminal de código conectado a repositórios públicos selecionados e um Theme Studio inspirado no Arch Linux/Hyprland do proprietário.

## LEIA PRIMEIRO — contrato com o agente

1. **Leia todos os 11 documentos em `docs/`, nesta ordem.** Esta é a fonte canônica da conversa de requisitos. O screenshot em `referencias/desktop-linux-referencia.png` é referência visual do desktop, não um asset autorizado a ser exibido publicamente sem avaliação.
2. **Não comece desenvolvendo tudo de uma vez.** Primeiro audite o ambiente e os repositórios; depois gere tarefas pequenas com critérios de aceite e implemente por marcos. A autorização para preparar documentação não significa permissão para alterar repositórios antigos.
3. **Não invente funcionalidades.** O usuário explicitamente pediu para congelar o escopo. Qualquer ideia fora da especificação precisa de autorização.
4. **Preserve os projetos existentes.** Não reescrever Abismo em React; não refatorar `site-3D` só para embutir; não alterar ou instalar a configuração Arch do proprietário.
5. **Não confunda intenção com conclusão.** Um projeto ser selecionado como candidato não garante que está finalizado. Uma automação passar em CI não valida a jogabilidade; a data do último teste precisa ser indicada.
6. **Portfólio ≠ Theme Studio.** MP4 usado como wallpaper do desktop simulado **não vai para o cenário 3D principal**; mudança de tema transfere **paleta**, não mídia de fundo.
7. **Privacidade e segurança:** shell simulado somente leitura; browser não executa código de repositórios arbitrários; nenhum token secreto no frontend. Somente repositórios aprovados manualmente entram no explorador.
8. **Qualidade:** manter fallback 2D e suporte a teclado/reduced-motion; proteger FPS, memória e acessibilidade.
9. **Não prometer fidelidade ao Quickshell sem comparação.** Reproduzir o visual relevante com QML original como referência; não criar um Linux real no navegador.
10. Antes de cada marco, apresentar ao proprietário escopo, arquivos afetados, riscos e como validar. Fazer mudanças em branch/PR quando aplicável; jamais apagar arquivos/dados sem autorização.

## Navegação dos documentos

| Ordem | Arquivo | Finalidade |
|---|---|---|
| 01 | [01_PRODUTO_ESCOPO.md](docs/01_PRODUTO_ESCOPO.md) | Visão do produto, decisões irrevogáveis sem autorização, público e jornadas |
| 02 | [02_DIRECAO_VISUAL_UX.md](docs/02_DIRECAO_VISUAL_UX.md) | Changli, cinco temas, arte, tom, menus e acessibilidade visual |
| 03 | [03_STACK_ARQUITETURA.md](docs/03_STACK_ARQUITETURA.md) | Tecnologia escolhida, módulos, separação dos sistemas e deploy |
| 04 | [04_CENA_3D_NAVEGACAO.md](docs/04_CENA_3D_NAVEGACAO.md) | Câmera, partículas, constelação, painéis, árvore de skills e estados |
| 05 | [05_PROJETOS_EXECUCAO.md](docs/05_PROJETOS_EXECUCAO.md) | Abismo jogável, site-3D experimentável, catálogo aprovado, isolamento |
| 06 | [06_GITHUB_TERMINAL_EDITOR.md](docs/06_GITHUB_TERMINAL_EDITOR.md) | Terminal seguro, árvore de arquivos real, código, histórico e diffs |
| 07 | [07_THEME_STUDIO.md](docs/07_THEME_STUDIO.md) | Especificação detalhada dos temas, desktop, widgets, cards, layouts |
| 08 | [08_DADOS_MIDIAS_PERSISTENCIA.md](docs/08_DADOS_MIDIAS_PERSISTENCIA.md) | Estruturas propostas, IndexedDB, arquivos, exportação, versões, segurança |
| 09 | [09_QUALIDADE_TESTES.md](docs/09_QUALIDADE_TESTES.md) | Performance, mobile, acessibilidade, QA, limites e observabilidade |
| 10 | [10_ROADMAP_CRITERIOS_ACEITE.md](docs/10_ROADMAP_CRITERIOS_ACEITE.md) | Marcos, dependências, Definition of Done, fluxo de trabalho do agente |
| 11 | [11_PENDENCIAS_REFERENCIAS.md](docs/11_PENDENCIAS_REFERENCIAS.md) | Decisões ainda abertas, inventário de repositórios e fontes conferidas |

## Arquitetura em uma linha

**React 19 + TypeScript + Vite**, **Three.js/React Three Fiber** para o mundo 3D, **GSAP** para a coreografia da câmera, **Zustand** para estado, **CodeMirror 6** para código, **GitHub API + índice estático de repositórios aprovados** para exploração, **IndexedDB/Dexie** para temas e mídia, **Vitest/Playwright** para QA. **Abismo roda como app Phaser independente; site-3D permanece app React independente.**

## As três experiências distintas

- **Portfólio:** intro em partículas; constelação navegável com scroll cinematográfico; árvore de conhecimentos; Sobre/Contato; terminal onipresente; áudio opt-in; tema global.
- **Projeto expandido:** o painel holográfico se aproxima, vira interface própria, permite jogar Abismo, experimentar site-3D ou abrir Theme Studio sem perder estado da navegação.
- **Theme Studio:** mini-desktop Linux simulado e editável, cinco temas oficiais intocáveis, cores personalizadas, biblioteca de mídias JPG/PNG/WebP/MP4, cards de personagem, widgets visuais com funções locais, salvar/exportar, layouts responsivos.

## Importante para o primeiro dia

1. Verificar versões atuais, branch, scripts e licença/assets dos três repositórios-fonte.
2. Criar **novo repositório** de portfólio, sem sobrescrever os projetos.
3. Ler especialmente os documentos 01, 03, 05, 07 e 10.
4. Mostrar uma proposta de tarefas para o **Marco 0** e aguardá-la ser autorizada; não disparar implementação massiva.

## Evidências e classificação

- **[DECIDIDO]** = usuário aprovou explicitamente na conversa.
- **[PROPOSTO]** = decisão técnica tomada para orientar a implementação; ajustável se testes demonstrarem incompatibilidade.
- **[PENDENTE]** = faltam material, aprovação, teste ou comprovação.
- **[VETADO]** = fora do escopo e não deve ser implementado.

© Textos deste pacote: briefing original. As marcas, personagens, referências e assets externos têm direitos próprios; não distribuir artes ou vídeos de franquias sem verificar direitos de uso.


---

# 01 — Produto, escopo e requisitos aprovados

## Objetivo e personalidade

Criar um portfólio de desenvolvedor brasileiro que **demonstre capacidade real**, não um site padrão de cards: o visitante explora um ambiente 3D cinematográfico, acessa projetos reais sem abandonar o contexto, percorre código GitHub em terminal Linux simulado, vê conexões entre tecnologias e trabalhos, e experimenta um editor de temas Linux inspirado no desktop pessoal do autor.

A experiência deve ser memorável mas **simples de usar**. O proprietário disse explicitamente que o escopo estava ficando complexo demais. Portanto aplicar **divulgação progressiva**: interface padrão amigável; recursos profundos acessíveis apenas quando solicitados. O visitante **não precisa configurar centenas de propriedades** para criar um tema. Não ampliar escopo por iniciativa do agente.

## Públicos e objetivos

- Recrutadores: entender rapidamente nome, formação/áreas, principais habilidades, projetos e contato, mesmo sem GPU poderosa.
- Desenvolvedores curiosos: abrir terminal, inspecionar repositórios e commits, avaliar arquitetura e código reais.
- Visitantes interessados no jogo: experimentar Abismo, fechar e retomar o portfólio.
- Visitantes criativos: aplicar tema, montar desktop virtual, salvar e continuar depois.

## Fluxo principal [DECIDIDO]

1. Entrada no hero; nome do autor se forma com partículas (texto exato a confirmar).
2. Mouse aproxima/afeta as partículas. **Quando o cursor para sobre o nome**, ocorre uma dispersão e recomposição controlada; não disparar a cada frame nem impedir leitura. No touch usar ação de pressão prolongada se for útil; alternativa acessível por botão.
3. Usuário rola a página: a câmera segue um **trajeto curvo, cinematográfico e reversível** entre painéis holográficos de projetos. Um efeito de **atração magnética suave** desacelera a progressão perto de pontos relevantes, **sem snap rígido**.
4. Ao selecionar projeto: o painel existente gira, se aproxima e **se transforma na interface do projeto**; não parece navegação brusca para outra página. No retorno, câmera e posição de scroll são restauradas.
5. Partículas acompanham cursor, transformação dos painéis e **cor do projeto/tema**. Luz e áudio reagem à proximidade e ativação de painéis.
6. Árvore 3D de tecnologias e projetos; hover/seleção destaca vínculos relevantes.
7. Painel único de vidro ao final reúne **Sobre Mim + Contato**; dados autobiográficos/links somente após fornecimento do autor.
8. Menu superior flutuante e discreto acessa seções, terminal e controle de som. Terminal também representado como objeto no universo 3D e acessível por atalho.

## Rotas internas/estados lógicos [PROPOSTO]

- `/` — experiência principal (hero, constelação, skills, sobre/contato) com câmera persistente.
- `/project/:id` — estado de overlay expansível, sincronizável com URL para compartilhamento e histórico, com animação de abertura/fechamento; fallback por deep link em carregamento direto.
- `/studio` ou `/project/hyprland-themes/studio` — Theme Studio, acessível a partir do painel Hyprland-Themes; usar um modelo consistente, sem criar dois editores.
- Terminal e editor são overlays controlados por estado/URL quando relevante, não um site paralelo.
- Não exigir login. Não permitir edição de repo remoto.

## Projetos [DECIDIDO, publicação condicionada]

- `pedrogonzalez-png/jogo-site` = **Abismo**: sessão jogável dentro do painel; projeto independente Phaser.
- `pedrogonzalez-png/site-3D` = experiência web interativa de seleção de personagens, com vídeos; abrir demonstração dentro do painel. O nome `site-3D` **não comprova uso de WebGL/Three.js**: não inventar essa tecnologia para o projeto antigo.
- `pedrogonzalez-png/Hyprland-Themes` = galeria de cinco temas + entrada para Theme Studio.
- `dotfiles-Arch` = **EXCLUÍDO** do portfólio e do explorador, por decisão explícita do proprietário.
- Todos os demais repos: **ocultos por padrão** até aprovação manual. Destaques só para projetos **finalizados** conforme proprietário; trabalhos incompletos, quando aprovados, podem aparecer **somente no explorador do terminal**, não na constelação. Os três acima são alvos desejados de destaque, sujeitos à validação de conclusão/publicação.

## Superfícies globais [DECIDIDO]

- Menu superior tipo pill translúcido; ações Projetos, Skills, Sobre/Contato, Terminal, Som, Temas.
- Tema padrão **Changli**, aplicado a fundo escuro, luzes, hologramas, partículas, texto e painéis. Outros quatro temas oficiais e temas criados pelo visitante poderão mudar a paleta global.
- Áudio adaptativo **desligado inicialmente**, ativado após gesto explícito; botão claro de mute e preferências por categoria.
- Mobile com cena 3D adaptativa, qualidade reduzida e interações por toque. Theme Studio mostra aviso de **preferência por orientação horizontal** em telefone vertical, sem bloquear.

## Fora do escopo [VETADO OU ADIADO]

- Criar sistema operacional Linux funcional no navegador; executar processos/shell reais.
- Executar arbitrariamente software de repositórios explorados.
- Reescrever Abismo, site-3D ou Quickshell só para adequá-los ao portfólio.
- IA para conversar com visitante: **removida da proposta**.
- Novos minijogos, multiplayer e gamificação: **adiados**. Abismo jogável é diferente de criar outro minijogo.
- Atualizar catálogo automaticamente sempre que surgir repo GitHub novo.
- Copiar literalmente sites de referência e suas marcas/assets.
- Wallpaper MP4 do Theme Studio aplicado ao mundo 3D principal.
- Exportador instalável de temas no Linux **não aprovado**; registrar como decisão em aberto, não incluir na primeira entrega.

## Conteúdo pessoal a preencher [PENDENTE]

Nome exibido, função/título, descrição curta e longa, tecnologias realmente dominadas, links públicos de contato, imagens/screenshots autorizados dos projetos, status de conclusão de cada projeto. Usar placeholders claramente rotulados e nunca inventar currículo, experiência ou certificações.

## Princípio de aceitação

Um visitante consegue descobrir quem é o desenvolvedor e onde contatá-lo em poucos segundos, navegar reversivelmente pelos projetos, testar os dois apps selecionados, explorar somente código público aprovado e criar um tema visual local sem precisar ler manual de Linux.


---

# 02 — Direção artística, temas, áudio e UX

## Inspirações [DECIDIDO]

- `https://oryzo.ai/` — qualidade de imersão e transições.
- `https://www.igloo.inc/` — intro em partículas e sua reação/fragmentação ao cursor parado sobre o nome.
- `https://activetheory.net/` — referência de atmosfera escura com vidro, profundidade, painéis flutuantes, luz, partículas.

**Inspiração, não clonagem.** Criar linguagem própria, com identidade Changli (Wuthering Waves), e não utilizar imagens, fontes ou assets de referência sem permissão/licença.

## Paleta padrão: Changli [DADO REAL]

Fonte: `Hyprland-Themes/end4-pC/changli.json` (`dark`). Tokens significativos:

| Token | Hex |
|---|---|
| surface_dim / fundo | `#110A0B` |
| surface | `#1A0F10` |
| surface_container | `#302020` |
| surface_container_high | `#3A2020` |
| on_surface / texto | `#F7E7D8` |
| on_surface_variant | `#D7B7A5` |
| outline | `#BC8D77` |
| accents.red | `#E17F72` |
| accents.orange / primary | `#C96A42` |
| accents.yellow / tertiary | `#E3B37A` |

Não congelar todos os materiais nessas constantes: criar mapeamento semântico `--color-bg`, `--color-surface`, `--color-text`, `--accent-primary`, etc., derivado do JSON. Para uso em Three.js, converter sRGB para espaço correto e animar sem destruir contraste. Cores de erro/sucesso podem precisar de verificação de contraste.

## Outros quatro temas oficiais [DADOS REAIS]

| Tema | Fundo `surface_dim` | Acentos referenciais |
|---|---|---|
| Hiyuki | `#101118` | red `#C96A85`, cyan `#AFC4E8`, purple `#C18CB4` |
| Emilia | `#11091F` | purple `#B787FF`, cyan `#76C7FF`, red `#E786CA` |
| Furina | `#0D1525` | blue `#9DC7FF`, cyan `#92DBEA`, yellow `#E9CE9B` |
| Hotline Miami | `#1B102E` | red `#F10D6E`, yellow `#F1B696`, purple `#E7AEC3` |

Cada tema oficial deve ser carregado de seu arquivo JSON real, incluindo superfícies, outlines, `on_surface`, `accents` e `term`; esses valores acima são apenas destaques. A paleta é a **identidade cromática do portfólio**; imagens de projetos e vídeos não são recoloridos artificialmente.

## Sistema de estilos

- Fundo near-black com profundidade e neblina discreta; não criar tela preta ilegível.
- Painéis com **vidro dinâmico**: translúcidos em estado ocioso, mais opacos quando abertos, com texto legível, borda/fresnel controlados e brilho de contato.
- Tipografia: fonte de UI limpa/licenciada; família monoespaçada para terminal/código; fontes decorativas opcionais no hero sem sacrificar acessibilidade.
- Hologramas 3D com foco e hierarquia: um projeto dominante por vez e sinais discretos dos próximos; evitar excesso de partículas e lens flare.
- Controles e informações essenciais como HTML semântico sobre canvas; não depender de texto renderizado como textura de baixa resolução.
- Padrão de movimento: exploração sutil; momentos importantes com efeitos mais dramáticos de energia/fênix Changli; alterar linguagem cromática ao trocar tema, não criar cinco animações incompatíveis.
- Menu flutuante sempre identificável, visível via teclado; partículas nunca interceptam cliques.

## Transição de temas globais [DECIDIDO]

1. Selecionar Changli/Hiyuki/Emilia/Furina/Hotline Miami ou tema local salvo.
2. Resolver paleta de superfícies/textos/luzes/hologramas/partículas/terminal/skills.
3. Animar transição em duração moderada; sem recarregar página, sem reiniciar jogo nem perder scroll/câmera.
4. Theme Studio: wallpaper JPEG/PNG/WebP/MP4 permanece **somente dentro do desktop simulado**; ao aplicar tema personalizado, somente cores/identidade visual global migram para portfólio.
5. Respeitar `prefers-reduced-motion`, reduzir ou desligar transições nesse modo.

## Áudio [DECIDIDO]

- Ambiente adaptativo ao trecho da jornada e proximidade de projetos; SFX de ativação de painel, partículas, terminal, mudança de seção.
- Nenhum autoplay sonoro antes de interação explícita. Preferências ao menos: mute global, ambiente, efeitos e volume geral; persistência local.
- Áudio não transmite informações exclusivas; equivalente visual e legendas onde necessário.
- Quando Abismo ou site-3D estiver ativo, evitar conflito de som: reduzir/pausar trilha ambiente do portfólio; devolver controle ao fechar.
- Não adicionar locução ou música licenciada sem asset fornecido.

## UX e navegação

- Scroll desktop = progressão da câmera, não rolagem de uma página convencional; evitar capturar wheel ao digitar, rolar terminal/código ou jogar.
- Escape fecha camada prioritária; tab/shift-tab percorre UI e jamais prende foco dentro de canvas.
- Ao abrir projeto, parar navegação cinematográfica; ao fechar, restaurar scroll e foco de origem.
- Botões visíveis para avançar/voltar em mobile e alternativa a scroll quando teclado ou redução de movimento.
- Conteúdo de contexto deve existir em DOM para leitores de tela/SEO, mesmo que apresentação 3D se degrade.

## Media de referência

- `../referencias/desktop-linux-referencia.png`: screenshot fornecido pelo proprietário. **Regra semântica obrigatória:** imagens independentes de personagens são **cards**; relógio, calendário, CPU, música, tarefas, clima etc. são **widgets**; imagem grande de fundo é **wallpaper**. Partes fixas da interface são **dock/barra/menu**, não cards. Não confundir miniaturas inseridas em widgets (ex.: capa de álbum) com card independente.
- O screenshot não inclui todas as configurações/estados do Quickshell; para fidelidade consultar código na versão-base e, depois, obter capturas adicionais se necessário.


---

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


---

# 04 — Cena 3D, câmera, partículas, painéis e navegação

## Visão espacial [DECIDIDO]

Uma única jornada 3D cinematográfica, **não um jogo de movimentação livre**. A câmera segue curva autoral, acionada pelo scroll e controlada por um estado de navegação. Conteúdo em sequência: (A) intro/nome, (B) constelação de projetos, (C) árvore de conhecimentos, (D) painel final Sobre/Contato. Terminal pode aparecer como objeto contextual no mundo e estar acessível globalmente no menu/atalho; sua existência não requer seção extra nem reordenar a jornada.

Referências de sensação (não layout copiado): igloo.inc para partículas; activetheory.net para vidro/ambiente; oryzo.ai para fluidez.

## Estados da experiência [PROPOSTO]

| Estado | Controle | Cena | Interações |
|---|---|---|---|
| `INTRO` | scroll/cursor | nome nasce das partículas | dispersar/reformar, iniciar exploração |
| `EXPLORING` | scroll/teclas/gestos | câmera ao longo de spline | apontar/focar projeto, navegar |
| `PROJECT_FOCUS` | input temporariamente limitado | painel se aproxima/transforma | open, voltar, CTA |
| `PROJECT_OPEN` | rolagem da cena suspensa | conteúdo completo do projeto em overlay | jogar/experimentar/explorar |
| `TERMINAL_OPEN` | terminal captura teclado/foco | cena ao fundo atenuada | comandos readonly |
| `SKILLS` | scroll/hover/tap | nós conectados em 3D | evidências e projetos relacionados |
| `CONTACT` | navegação por scroll/menu | painel final | links e retorno ao início |
| `ACCESSIBLE_FALLBACK` | UI sem canvas ou efeitos reduzidos | conteúdo equivalente em DOM | toda informação relevante |

Criar um **único controlador de transições** com cancelamento/interrupt: não abrir dois painéis ao mesmo tempo, não guardar estados impossíveis, restaurar progresso e foco. Animação deve ser reversible e não perder contexto.

## Câmera

- Spline suave parametrizada por progresso `0..1` da jornada; keyframes para hero, cada projeto, skills, contato. A câmera gira/eleva lentamente e enquadra cada vidro com look-at interpolado.
- Scroll para frente e para trás, **sem teleporte**. Atração magnética local: curva de easing/desaceleração perto do centro de interesse; o visitante ainda pode ultrapassar qualquer projeto sem clicar.
- Inércia e transições curtas; o usuário precisa sentir controle, não assistir a vídeo de duração fixa. Limitar impulso por roda/trackpad para não avançar vários pontos acidentalmente.
- Menu superior pode navegar para seção por tween controlado; Escape/Voltar retornam ao estado salvo.
- Enquanto iframe, jogo, Theme Studio, terminal ou code editor estiver focado, inputs de wheel/teclado não movem câmera.
- No mobile: swipe vertical controlado ou progressão via botões; inclinação/giroscópio NÃO está no escopo.

## Hero particulado

- Texto do nome do autor (placeholder enquanto nome de apresentação não confirmado) amostrado em pontos para as posições-alvo de partículas; implementável com buffer geometry / instancing / shader, evitando um React component por partícula.
- Entrada: partículas se convergem em letras legíveis; repouso respirando de forma suave.
- Movimento de cursor: influência espacial/repulsão ou atração de baixo custo.
- Cursor parado **sobre o nome** por intervalo debounced: letras se fragmentam e se recompõem; não trigger repetidamente enquanto permanecer parado e não produzir epilepsia/pisca-pisca.
- Touch: longa pressão opcional e controle acessível alternativo; reduced motion: texto estático/leve fade, sem dispersão.
- Desmontar partículas de densidade alta fora da intro quando não visíveis.

## Constelação de projetos [DECIDIDO]

- Painéis de vidro 3D em alturas, profundidades e orientações diferentes; cada projeto tem ID, título, uma descrição breve, thumbnail autorizada, tecnologias, status e ações possíveis.
- Estados do painel: `idle`, `hover`, `near`, `opening`, `expanded`, `closing`. Só um expanded.
- Aproximação: a própria superfície gira/alinha em direção à câmera, expande e revela interface de conteúdo (HTML acessível em camada com clipping/transform combinados); não criar um segundo site visualmente desconectado.
- Vidro inativo translúcido; no conteúdo expandido aumentar opacidade com fundo contrastante; não mostrar código branco sobre partículas agitadas.
- Feedback: partículas convergem brevemente na borda do painel; luz ambiente aquece/cor muda; efeito sonoro somente com áudio ativado.
- Cada painel aceita estrutura e direção de arte personalizadas; **não** converter isso em sistemas animados totalmente independentes sem necessidade.
- Fechar projeto devolve câmera, scroll, foco e contexto exatamente de onde veio.

## Integração visual de conteúdos

- Painel expande para UI DOM 2D sobre a cena 3D, preservando continuidade visual (transformação do plano de vidro para modal/página de projeto). A renderização 3D fica atenuada ou pausada enquanto um aplicativo pesado roda.
- Habilitar fullscreen para jogos/demos quando navegador e iframe permitirem; trazer controle de pausa/retorno e indicador de foco.
- O Theme Studio é 2D DOM interativo dentro da moldura expansível, não um desktop todo feito com objetos Three.js.

## Árvore interativa de conhecimentos

- Grafo de nós de tecnologias e experiências (categoria Linux, Web, Jogos, Versionamento etc.) com arestas vinculadas a projetos **reais**. Um nó de skill destaca projetos que comprovam trabalho correspondente; clicar projeto destaca skills utilizadas.
- Não criar certificações, níveis numéricos ou conhecimentos não fornecidos/confirmados pelo autor.
- Renderização reduzida e lista textual equivalente em mobile/acessibilidade. Evitar gráfico ilegível como único meio de descobrir o currículo.

## Sobre Mim + Contato

- Um painel final grande de vidro; mini-biografia real e editável por manifesto de conteúdo; GitHub e canais fornecidos pelo dono.
- Links claros e funcionais, sem formulário de envio obrigatório, sem inventar email/telefone.
- Botão voltar ao início e navegação por menu.

## Performance funcional mínima

- Render loop Three.js não força re-render React para eventos de pointer/frames.
- Partículas/vidro em LOD; blur/glow limitados; desligar/refinar sombras em mobile e dispositivos lentos.
- Não depender de um número fixo de FPS para progressão do scroll ou áudio. Medir frame time real.
- Se WebGL ausente/contexto perdido: tela textual funcional com projetos, experiências e contato.

## Aceite desta frente

1. Introdução forma o nome e responde à parada de cursor somente sobre letras.
2. Rolar para frente/trás percorre projetos e retorna sem saltos bruscos; atração magnética não trava navegação.
3. Um projeto abre/fecha preservando local da câmera; teclado/ESC/back funcionam.
4. Painéis e UI têm contraste, foco e loading/fallback.
5. Troca Changli → Hiyuki afeta cena e UI sem perder progressão.
6. Reduced motion e fallback sem WebGL dão acesso ao conteúdo essencial.


---

# 05 — Projetos reais, aprovação e demos integradas

## Política do catálogo [DECIDIDO]

Dois catálogos distintos e aprovados manualmente:

- **`featured` / constelação 3D:** projetos **finalizados** e aprovados explicitamente pelo proprietário. O jogo Abismo, site-3D e Hyprland-Themes foram apontados como candidatos desejados. Conclusão precisa ser confirmada por ele e validada tecnicamente antes da publicação.
- **`explorer` / terminal GitHub:** subconjunto aprovado de repositórios públicos, incluindo projetos em desenvolvimento se o dono permitir. Não incluir repositórios por detecção automática nem só por serem públicos.
- **EXCLUSÃO EXPRESSA:** `dotfiles-Arch` não aparece nem em featured nem em explorer.
- Repositórios novos surgem invisíveis até revisão e alteração explícita do manifesto de aprovação.
- Repo `Esquelote-corrigido` tem histórico de correção de código de um amigo: **não reivindicar autoria integral** sem atribuição/consentimento caso venha a ser selecionado.

## Manifesto de projetos [PROPOSTO, modelo de conteúdo]

Cada entrada precisa: `id`, `repoFullName`, `title`, `summary`, `status` (draft/review/approved/hidden), `isFinalizedConfirmed`, `featured`, `explorerApproved`, `demoKind`, `demoUrl` validada, screenshots autorizados, tags/skills reais, `credits`, `sourceUrl`, `lastReviewed`. Usar **allowlist versionada**, não auto-descoberta indiscriminada. Não inserir URLs `demoUrl` fictícias na produção.

## A — ABISMO / `pedrogonzalez-png/jogo-site`

**Verificado em 27/10/2026 no repositório:**

- `package.json`: JavaScript ES Modules, Vite `^8.3.0`, Phaser `^4.2.1`, comandos `dev`, `build`, `preview`, `test`.
- `src/main.js`: Phaser `AUTO`, canvas base 1280x720, Arcade physics top-down, Scale.FIT, CENTER_BOTH, scenes Boot/Menu/Game.
- README/GEMINI: RPG ação/exploração top-down com ASCII de alta densidade, combate souls-like, mundo procedural, saves IndexedDB; testes históricos e QA exaustivo pendente.
- **Regra do próprio repo:** NÃO usar React no jogo nem reescrever o motor; antes de editar consultar `docs/ANTIGRAVITY_LEIA_PRIMEIRO.md` e documentação específica do Abismo. A documentação local do jogo tem precedência para sua lógica.

**Integração desejada:**

1. Projeto aparece como painel; ao abrir, apresentação breve, controles, requisitos e CTA **Jogar**.
2. Carregar build público do jogo isolado (preferencialmente app hospedado à parte e incorporado em iframe quando permitido); evitar importar módulos Phaser dentro da mesma raiz React do portfólio.
3. Foco vai ao jogo; scroll da câmera, teclas de navegação e som ambiente do portfólio ficam suspensos; ESC de saída do **portfólio** não deve roubar Escape necessário ao próprio jogo — oferecer botão Voltar permanente e definir contrato de teclas.
4. Loading, erro, fullscreen, pausa/retorno; mostrar como salvar e explicar que saves IndexedDB vivem na origem do app do jogo. Nunca prometer compartilhamento de saves entre origens.
5. Testar uso de keyboard/gamepad somente se jogo tiver suporte real; não assumir suporte a touch sem verificar. No mobile incompatível, fornecer explicação e link do demo em página apropriada, sem mascarar.
6. Não garantir que terminado/100% QA; obter declaração final do proprietário antes de colocar no featured.

**Riscos do iframe:** `sandbox`, same-origin, autoplay, permissões fullscreen, política de cookies/storage e foco. Se iframe não for viável em certos browsers, fallback por rota same-origin/reverse proxy/build sob caminho próprio em deploy com isolamento de runtime, sem reescrita do jogo.

## B — SITE-3D / `pedrogonzalez-png/site-3D`

**Verificado em 27/10/2026:**

- React `^19.2.8`, Vite `^8.2.0`, JSX; `src/App.jsx` exibe seleção de personagens em **arco/roleta** com scroll, detalhes da personagem, busca e sequência de vídeo intro/idle.
- `src/charactersData.js` importa avatares e vídeos WebM da própria pasta de assets.
- README no GitHub é template React+Vite e não indica explicitamente estado de conclusão; não chamar o projeto de jogo 3D WebGL por causa do nome.

**Integração desejada:** abrir painel com botão **Experimentar site** e montar build próprio em iframe isolado ou rota incorporada. O vídeo é **conteúdo deste projeto**, separado da regra de wallpaper MP4 do Theme Studio; regra de MP4 não proíbe reproduzir mídia do projeto demonstrado. Suspender scroll global enquanto o visitante rola a roleta interna. Carregar vídeos somente ao abrir a demo; verificar codecs e tamanho antes do deploy. Respeitar licenças de imagens/vídeos de personagens.

## C — HYPRLAND-THEMES / `pedrogonzalez-png/Hyprland-Themes`

**Verificado:** configs `end4-pC/{changli,hiyuki,emilia,furina,hotline-miami}.json`, predefinições Fastfetch, dotfiles públicos parciais, customização `overrides/end4-pC`/QML, instaladores e README. JSONs de cores reais, não artwork. O repositório **não inclui** wallpapers e artes de personagens; não distribuí-los sem autorização.

**Integração desejada:** painel transformado com vitrine dos cinco temas oficiais e botão **Abrir Theme Studio**. A seleção de tema oficial aplica **cores globalmente** no portfólio; ao entrar no Studio a pessoa pode criar cópia editável e montar desktop virtual. Não confundir CLI `install-desktop.sh` experimental com algo seguro a executar no navegador. O aplicativo web é **reprodução/simulação**, não o próprio Quickshell rodando.

## Política de integração e segurança

- Não embutir editor JSX live nem executar código do GitHub; todo conteúdo do terminal é **texto readonly**.
- Builds de demos são publicados/assinados/revisados pelo proprietário, com CSP, sandbox e versões rastreáveis; não usar branch `main` como URL de execução arbitrária.
- Sem iframe de terceiros não confiáveis; permitir somente origins aprovadas.
- Se demos isoladas estiverem indisponíveis, painel continua útil com imagens, descrição, link do GitHub e aviso honesto: **Demo indisponível**.
- Otimização de recursos: ao abrir demo, pausar/limitar renderer 3D e áudio; ao fechar, liberar iframe/vídeos ou pausar com política explícita para evitar consumo.

## Matriz mínima de teste

| Caso | Critério |
|---|---|
| Abismo inicia | Vê menu do jogo e joga, sem página externa, no desktop suportado |
| Abismo salva | Save persiste conforme comportamento do jogo e origem de hospedagem |
| Teclas de jogo | Não disparam scroll/atalhos globais enquanto jogo ativo |
| Site-3D abre | Roleta, seleção e vídeos funcionam sem arrastar câmera da constelação |
| Fechar demos | Retorno suave ao painel/local e sem áudio/vídeo oculto consumindo recursos |
| GitHub links | URL real para repo correspondente; projeto não aprovado fica oculto |
| falha carregamento | Exibe mensagem e alternativa, sem quebrar o portfólio |


---

# 06 — Terminal Linux simulado, explorer de código, Git e histórico 3D

## Experiência [DECIDIDO]

O terminal é parte do mundo visual (objeto 3D), mas pode ser aberto pelo menu/atalho a qualquer momento. O design evoca Kitty/Arch/Fish no estilo cromático do tema selecionado. Diferentemente de um terminal fake, o visitante pode explorar **pastas e arquivos reais** dos repositórios GitHub **públicos e aprovados** pelo dono, diretamente no site, sem obrigar link externo.

Abrir `code src/main.js` revela painel adjacente estilo VS Code: syntax highlighting, numeração de linhas, abas, árvore de diretórios e Markdown seguro. Terminal, explorador e visualizador compartilham `repo + branch/ref + current path`.

## Política de acesso

- Somente leitura, **sem shell real, sem processo do sistema, sem acesso ao dispositivo, sem `eval`, sem execução de scripts**.
- Catálogo explicitamente aprovado: nenhum repo fora da allowlist, mesmo que seja público. `dotfiles-Arch` excluído.
- Comandos retornam resultados de um filesystem **virtual mapeado** à árvore real do repo selecionado; sanitizar e normalizar caminhos (`..`, symlinks, encodings). Nunca aceitar URLs arbitrárias fornecidas em terminal para `fetch`.
- Aplicar limite de tamanho/tempo/resposta em busca e arquivos; arquivos binários exibidos como preview autorizado ou mensagem amigável.
- Deixar evidente que o terminal é uma simulação readonly e que dados vêm do GitHub público, com data/branch/commit do snapshot.

## Comandos definidos [DECIDIDO / sintaxe proposta]

| Comando | Resultado |
|---|---|
| `help` | lista e exemplos dos comandos disponíveis |
| `whoami` | apresentação fictícia do terminal / informações do portfólio, não identidade real do visitante |
| `pwd` | caminho virtual atual |
| `ls [-la] [path]` | arquivos/diretórios do repo atual |
| `cd path`, `cd ..` | navegação entre pastas permitidas |
| `tree [path]` | árvore com limites de profundidade e paginação |
| `cat path` | conteúdo textual da fonte real, com limites |
| `find [path] [name]` | busca de nomes nos índices permitidos |
| `grep pattern [path]` | busca textual no conjunto disponível; resultados parciais rotulados se não indexados |
| `code path` | abre visualizador readonly e sincroniza seleção |
| `repos` | mostra lista de repos aprovados |
| `open repo-id` | altera repo corrente; exige ID da allowlist |
| `goto projects|skills|about|contact` | navega seções do portfólio, não executa programa |
| `neofetch` | saída decorativa estilo Linux com informações públicas do portfólio, sem afirmar ser estado real do PC |
| `git log` | commits reais do repo/ref e carregamento paginado |
| `git show SHA` | metadados/diff real de commit acessível |
| `git diff A B [-- path]` | diff real apenas se dados disponíveis pelo GitHub; nunca fabricar |
| `clear`, `history` | utilidades locais |

Qualquer comando desconhecido responde com erro gentil e `help`. **Não implementar** `sudo`, `rm`, `curl` arbitrário, `git push`, `npm install`, `ssh`, escrita de arquivos, pipe de shell real. Parser de comandos finito, seguro e testado; suportar strings entre aspas nas opções necessárias.

## Navegador/editor de código [DECIDIDO]

- Árvore de diretórios real, estado expandido recolhível; breadcrumbs, busca local, abas fecháveis, seletor de repo/ref, botão para URL original GitHub, copiar caminho/código.
- CodeMirror 6 em readonly, temas integrados à paleta do portfólio, syntax highlighting por extensão carregado sob demanda, números de linha e desempenho para grandes arquivos (limites configuráveis).
- Markdown seguro renderizado em preview com sanitização rigorosa; imagens do repo somente se permitidas e em URL pública verificada. HTML/JS de Markdown nunca executa.
- Conteúdo fiel ao arquivo real: título com repo, path, SHA/ref, timestamp de atualização; não inventar arquivos para preencher UI.
- Mobile: terminal e editor em abas/stack, sem dividir largura em duas colunas estreitas; teclado touch e ações quick command.

## Git history [DECIDIDO]

- **Linha do tempo dentro do editor**, lista de commits, autor, data, assunto, diff contextual e visualização lado a lado quando possível.
- **Grafo 3D opcional** de nós brilhantes representa commits com arestas de parent SHAs reais. Não criar ligações cronológicas falsas nem posicionar merge como cadeia simples.
- Alternância: **Marcos importantes** (curadoria explícita; não inferir importância só por título) e **Histórico completo acessível**, com paginação lazy. Evitar prometer todo histórico de todos os branches se API não entregou esses dados: mostrar ref e cobertura consultada.
- Comandos `git log`, `git show`, `git diff` sincronizados com painel visual. Não renderizar diffs monstruosos integralmente; cap/virtualização.
- Fechar grafo 3D ao perder foco/abrir jogo; não gastar GPU em duas cenas 3D simultaneamente.

## Estratégia GitHub e rate-limit

A API REST GitHub sem autenticação costuma limitar o cliente por IP a **60 requisições/hora** e pode aplicar limites secundários. Portanto não fazer uma consulta por partícula, por linha de código ou por cada card. Preferir:

1. **Índice estático construído no CI** (`approved-repos-manifest`, árvores, metadados, thumbnails próprias, marcos aprovados), atualizado em builds controlados com token do CI nunca entregue ao navegador.
2. Conteúdos/commits reais sob demanda, com cache e backoff; URLs geradas somente para owner/repos/paths aprovados.
3. Estados `loading`, `offline`, `rate-limited`, `not-found`, `too-large` e aviso de snapshot desatualizado.
4. Em escala de tráfego maior, serviço cache readonly autorizado em hospedagem serverless. Isto é possível evolução técnica, **não exigência inicial**.
5. Não guardar tokens de usuário e não pedir login no GitHub para acessar portfólio público.

## Exemplos de sessão (saída ilustrativa, não inventar arquivos)

```text
visitor@portfolio:~$ repos
# lista dos repositórios expressamente aprovados
visitor@portfolio:~$ open jogo-site
visitor@portfolio:jogo-site/$ ls
# usa índice real do repo
visitor@portfolio:jogo-site/$ code src/main.js
# abre código real de entrada do Phaser no painel lateral
visitor@portfolio:jogo-site/$ git log
# commits reais da branch/ref atual, paginados
```

## Aceite

- Abrir um arquivo real do Abismo pelo terminal e pelo explorer gera a **mesma versão** de conteúdo.
- Repo não aprovado ou path fora da allowlist falha sem request arbitrário; `dotfiles-Arch` não aparece.
- `git log` e grafos representam dados reais; histórico grande tem paginação e avisos de cobertura.
- Teclas/scroll no editor não movimentam cena 3D por trás; Escape e foco restaurados.
- Estilos e acentos seguem mudança de tema; código permanece legível.


---

# 07 — THEME STUDIO — Especificação funcional canônica

> **Regra prioritária do proprietário:** não complicar demais. O Theme Studio deve ser divertido e intuitivo para usuários comuns; não é um sistema operacional no navegador, nem um editor profissional CAD. Não inventar dezenas de ajustes a cada iteração. Preservar o que já foi aprovado, deixar funções avançadas atrás de interface simples.

## 0. Resumo da experiência

Dentro do painel expandido do projeto **Hyprland-Themes**, o visitante pode: (1) explorar cinco temas prontos; (2) aplicar um tema e mudar as cores do portfólio inteiro; (3) criar sua própria cópia ou tema do zero; (4) editar uma simulação visual do desktop Arch Linux/Hyprland/Quickshell, com **wallpaper estático ou MP4**, **cards com imagens de personagens**, **widgets semelhantes aos reais**, organização por arraste e grupo, layouts por wallpaper/resolução; (5) salvar, versionar, exportar/importar e aplicar somente a paleta ao portfólio. Sem login e sem alterar o Linux de verdade.

## 1. Classificação obrigatória — da screenshot do autor

**Imagem de personagem independente sobre o desktop = CARD.** Não confundir com widget nem com plano de fundo.

**Relógio, data, calendário, clima, notas, To-Do, player musical, CPU/RAM/disco, relógio mundial, recursos, timers, texto etc. = WIDGETS.** Uma imagem interna de widget (capa do álbum, avatar) não vira card separado.

**Imagem gigante do fundo = WALLPAPER.** Pode ser JPG/PNG/WebP estático ou MP4 em loop. O vídeo nunca é wallpaper do **portfólio 3D principal**, somente do desktop simulado do Theme Studio.

**Dock, barra, menus e painéis = ELEMENTOS ESTRUTURAIS DO DESKTOP**, com controles visuais próprios, não cards soltos.

Referência visual do proprietário: `../referencias/desktop-linux-referencia.png`. Implementação QML de referência: `pctrade/end4-pC` no commit pinado pelo repo `Hyprland-Themes`: `8fbb6716cba628a13103e665e9538021683a7250`. O repo do autor contém personalizações próprias; comparar baseline + patch, não assumir versão genérica atual igual.

## 2. Temas oficiais e personalizados [DECIDIDO]

**Oficiais e imutáveis:** Changli (DEFAULT), Hiyuki, Emilia, Furina, Hotline Miami. Fonte primária dos tokens: arquivos `Hyprland-Themes/end4-pC/*.json`. O usuário **pode aplicar e visualizar**, mas **não alterar, sobrescrever nem excluir** os cinco originais.

Criação personalizada:

- Criar do zero OU **duplicar** qualquer tema existente para uma instância editável própria.
- Editar nome, cores, wallpaper, widgets, cards e layouts sem afetar os oficiais.
- **Salvar** = persistir localmente; **Aplicar** = tornar a paleta ativa no portfólio; **Criar versão** = checkpoint manual; **Exportar** = backup portátil.
- Trocar tema global: todo o portfólio 3D muda fundo, partículas, iluminação, vidro, menús, terminal, árvore de skills, contato etc., preferencialmente em transição animada. **Somente tokens de cor** são transferidos do Studio; wallpaper e posições dos widgets não saem do Studio.
- Prévia temporária dentro do editor não aplica tema global até ação Aplicar.

## 3. Fluxo mínimo para visitante leigo

1. **Abrir Theme Studio** → mostra temas oficiais em galeria + botão **Criar meu tema**.
2. Escolher base ou começar do zero, nomear.
3. Escolher wallpaper da galeria (mídias autorizadas) ou **importar arquivo pessoal**; imagens ou MP4; MP4 só no fundo do desktop.
4. Entrar no desktop simulado, selecionar cards e widgets por biblioteca. **No desktop:** arrastar item para o canvas ou clicar para inseri-lo. **No touch:** tocar no item e escolher posição, sem exigir drag contínuo.
5. Arrastar, redimensionar, duplicar, esconder, bloquear, girar quando aplicável, organizar em camadas; guias de alinhamento magnético/grade **opcionais** (posicionamento híbrido C).
6. Botão de prévia esconde controles de edição e deixa widgets locais funcionarem; editar de novo a qualquer momento.
7. Autosave local; botão Salvar, versões, exportar; botão Aplicar paleta global quando quiser.

**Não exigir** seleção de dezenas de campos antes de mostrar primeira prévia. Usar defaults bonitos e exemplo pronto. Sem onboarding que aprisione usuário.

## 4. Desktop e posicionamento [DECIDIDO]

- Canvas DOM/CSS 2D proporcional e zoom/pan de edição, NÃO scene Three.js 3D para cada widget.
- Posição livre; **snap magnético opcional**, guias/grade opcional; nunca rearranjar elementos manualmente colocados sem ação explícita.
- Editor de camadas (lista legível): selecionar, ordenar frente/trás, ocultar/mostrar, bloquear/desbloquear, duplicar/excluir.
- Seleção múltipla e **grupos** de elementos heterogêneos (cards + widgets); mover grupo inteiro ou editar componente interno. Redimensionar grupo com escolha entre **escala proporcional** ou **reorganização inteligente**. Desagrupar mantém itens e posições.
- Undo/redo para ações de edição, com gestão de histórico e limites de memória.
- Card tem imagem individual, posição X/Y, largura/altura, crop, rotação, borda, formato/opacidade, ordem de camada. Não limitar a seis imageCard slots do QML original; permitir múltiplas instâncias identificadas por ID e limitar só por desempenho.
- Widgets individuais admitem posição, formatos nativos (quando houver), visibilidade e tamanho mínimo, mantendo conteúdo legível. Alguns itens (dock, barra) são estruturais: posição/visibilidade/estilo próprios, sem duplicação indiscriminada.

## 5. Widgets: fidelidade e funções locais [DECIDIDO]

**Não usar caixas genéricas.** Ler QML real, extrair aparência, proporções, variantes, cores, fontes, border-radius e comportamentos relevantes, então recriar em React/CSS. O objetivo é visual semelhante à screenshot do proprietário, não instalar Qt no browser. Quickshell QML executável **não roda dentro do React**.

Catálogo inicial, sujeito a comparação exata com o desktop/versão base:

| Família | Identificadores originais observados | Interação no web |
|---|---|---|
| Relógios | `clock`, `worldClock` | hora/data real local, formato e fuso (quando fizer sentido) |
| Calendário | `calendar` | navegar meses, hoje |
| Clima | `weather` | **dados demonstrativos** até decidir integração real; nunca apresentar como medição real |
| Recursos | `resources` | CPU/RAM/disco demonstrativos, rótulo de simulação |
| Player | `media` | reprodução local simples ou faixa demo autorizada, capa/controles |
| Visualizador | `visualizer` | animação visual coerente; áudio somente se permitido |
| Produtividade | `todo`, `notes` | listas e notas editáveis persistentes locais |
| Timer | `timers` | cronômetro/contagem regressiva funcional onde suportado |
| Perfil | `userCard` | avatar e texto configurável, não ler identidade do dispositivo |
| Texto | `customText` | texto editável, tipografia |
| Imagens | `customImage`, `imageCard[1..6]`, `sticker` | **cards visuais** segundo regra de classificação do proprietário |
| `images` | precisa inspeção visual da versão pinada | não presumir que é um card separado |
| Estrutura | dock/barra/menu Quickshell | aparência e controles de desktop simulado, funções não precisam ser OS reais |

**Dados reais de QML conferidos:** `ClockWidget.qml` oferece estilos `cookie`, `digital`, `daily`, `pixel`; `DigitalClock.qml` expõe família/tamanho/peso da fonte, alinhamento/orientação e data; `MediaWidget.qml`, `WeatherWidget.qml`, `CalendarWidget.qml`, `ImageCardWidget.qml` trabalham com variações como `1x2`, `2x2`, `2x3` conforme o caso; `ResourcesWidget.qml` organiza cards com dimensões fixas aproximadas; `CustomTextWidget.qml` edita e redimensiona texto.

### Modo Original vs Avançado [DECIDIDO]

- **Original (default):** widgets usam aparência e layouts compatíveis com a referência QML, herdando as cores da paleta. Expor só controles úteis, como posição, tamanho nativo e conteúdo.
- **Avançado (opcional):** permitir ajustar tipografia, recortes, arredondamento, opacity, espaçamentos e reorganização interna **quando a estrutura suportar**, sem quebrar legibilidade. Não obrigar visitante a conhecer CSS/QML.
- **Restaurar aparência:** volta estilo interno ao padrão sem apagar posição, conteúdo, agrupamento nem mídias. Restauração completa da instância deve ser ação separada com confirmação.
- **Cores de widget individuais vs globais:** **AINDA NÃO DECIDIDO**. O proprietário interrompeu antes de escolher entre herança integral, cores independentes ou substituições. Default provisório conservador: herdar tema; não implementar UI complexa de overrides antes de aprovação.

## 6. Layouts por wallpaper [DECIDIDO: modo híbrido C]

- O mesmo tema contém diversos wallpapers, cada um podendo associar um **perfil de layout** próprio ou reutilizar o layout-base atual.
- Ao trocar wallpaper, oferecer preservar organização ou usar layout associado existente; nunca apagar sem avisar.
- Perfis guardam widgets/cards, grupos, camadas, posições, conteúdo e personalizações adequadas. Cores são **do tema** e normalmente comuns aos wallpapers.
- Duplicar perfil e copiar organização entre wallpapers. Histórico protege configuração anterior à troca.
- Inspirar-se no `WallpaperLayouts.qml` real, que captura estados X/Y/Z/dimensões e preserva perfis por wallpaper, mas **não copiar sua implementação QML literalmente**.

## 7. Layouts por resolução [DECIDIDO: sistema adaptativo C]

- Um layout-base independente de px físicos, com tamanho de referência e coordenadas normalizadas. Modos conceituais: ultrawide **3440×1440**, desktop 16:9 **1920×1080** e celular **horizontal**; não supor serem as únicas resoluções.
- Mudança de resolução: adaptar proporções e ancoragens automaticamente, com ajustes individuais salvos só para aquele breakpoint/formato.
- Modificar layout mobile não altera ultrawide. Se um widget extrapolar a tela, aplicar limite/clamp ou sugerir reposicionamento, nunca descartar dados silenciosamente.
- **Mobile vertical:** ao entrar no editor exibir aviso **"Para uma melhor experiência, recomendamos usar o celular na horizontal. A edição com ele em pé não é recomendada."**. Botão **Continuar assim mesmo**; rotação faz aviso desaparecer e mantém layout. Portfólio principal funciona na vertical sem essa restrição.
- Mobile editor pode recolher biblioteca e propriedades para maximizar área útil.

## 8. Biblioteca de mídias [DECIDIDO]

- Uma **biblioteca compartilhada** por visitante entre seus temas personalizados; importar uma vez e reutilizar. Galeria pronta (apenas mídias com permissão) + importação pessoal.
- Imagens de cards: JPEG/PNG/WebP; wallpaper estático idem; wallpaper vídeo: MP4. Vídeos autorais/providos devem ter licença apropriada. O repo de temas do proprietário não entrega wallpapers/artes; não inventar essa mídia na produção.
- Toda instância de card guarda ID de asset; alterar recorte/posição de um card não altera outras instâncias que compartilham a imagem.
- **Exclusão segura**: bloquear exclusão de asset referenciado por tema, wallpaper, card ou versão salva; mostrar dependências e opção de desvincular/substituir antes. Remover um card não apaga o arquivo de biblioteca. Arquivo original do dispositivo jamais é deletado.
- Pausar vídeos invisíveis, mute por padrão, previews leves, validar formato/tamanho. Não autocarregar toda a biblioteca na entrada.

## 9. Salvamento, versões e exportação [DECIDIDO]

- Armazenamento local via IndexedDB para configs, blobs e conteúdos locais; em primeiro acesso explicar de forma amigável que sem backup externo a limpeza de dados do navegador pode apagar criações.
- **Autosave** com debounce e confirmação de persistência; `dirty` e erro/quota visíveis; não confirmar sucesso antes de completar transação.
- **Versões automáticas** em momentos relevantes, sujeitas a retenção de espaço; **versões manuais nomeadas** não são apagadas por limpeza automática.
- Restauração cria snapshot de segurança do estado atual. Referências a mídias usadas por versões nomeadas impedem exclusão até serem liberadas.
- Exportação/importação do projeto em arquivo portátil versionado, preferencialmente `.zip` (manifesto JSON + arquivos opcionais), validando conteúdos antes de substituir. Um export pequeno só com configurações pode avisar caso não contenha mídias locais.
- **Exportação para instalar o tema no Linux real é PENDENTE**, não prometer. Implementar, se aprovado futuramente, como opção separada com validação da versão end4-pC e sem sobrescrever dotfiles automaticamente.
- Não publicar temas/criações de um visitante para outros. Sem login, sem cloud storage por padrão.

## 10. Limites e performance

- Preview no editor 2D; reduzir renderer 3D de fundo, pausar animação de wallpaper e desativar canvases invisíveis.
- Usar limite de tamanho de mídia, contagem de elementos e avisos baseados em testes do navegador, **sem inventar limite fixo de seis cards**.
- User-generated SVG/HTML arbitrário não é parte da importação; vídeo MP4 no fundo exige compatibilidade de codec; mostrar fallback se arquivo não puder ser decodificado.
- Se storage exceder quota, não perder último snapshot válido; avisar e permitir exportar/apagar mídias não referenciadas.

## 11. Critérios de aceitação do Theme Studio

1. Changli abre por padrão; troca Hiyuki muda paleta do **portfólio inteiro** sem trocar wallpaper 3D.
2. Cinco oficiais podem ser aplicados, nunca sobrescritos, renomeados nem excluídos; duplicar gera cópia editável.
3. Importar imagem cria card; vários cards com mesma imagem têm transformações independentes.
4. Importar MP4 e aplicá-lo como wallpaper no desktop simulado, nunca como fundo principal da constelação.
5. Inserir widget clicando ou arrastando; relógio/data/todo/notas têm funcionalidade local, sistema/clima demonstrativos.
6. Snap/grid opcionais; grupos com escala ou reflow; bloqueio/camadas/undo/redo.
7. Troca wallpaper restaura layout específico se existir sem sobrescrever layout anterior; breakpoints possuem overrides próprios.
8. Autosave confirmado, versão nomeada restaurável e export/import com mídia; mídia compartilhada usada por versão não é apagada.
9. Celular vertical recebe aviso, pode prosseguir e não perde mudanças quando gira.
10. Modo original lembra o Quickshell da screenshot; avançado é opt-in e restauração não apaga conteúdo/posições.

## 12. O que NÃO implementar

- Editor de desktop Linux inteiro, gerenciador de janelas real, processos systemd, filesystem do visitante, terminal root, clima real sem API/consentimento, captura real de RAM/CPU no navegador, alteração real do Arch Linux.
- Loja/social de temas, comunidade, sincronização multi-dispositivo, marketplace, IA de criação de temas.
- MP4 ao fundo do portfólio principal; execução de QML no browser.
- Microconfigurações não pedidas que dificultam o uso básico.


---

# 08 — Modelos de dados, armazenamento, mídia e integridade

> **Modelos abaixo são contratos propostos**, não código já existente. O Antigravity pode ajustar nomes/campos com migrações documentadas e testes, preservando comportamento aprovado.

## 1. Entidades propostas

### Theme

```ts
interface Theme {
  id: string;
  name: string;
  kind: 'official' | 'custom';
  basedOnThemeId?: string;
  palette: ColorTokens;
  activeWallpaperProfileId?: string;
  createdAt: string; updatedAt: string;
  schemaVersion: number;
}
```

- Temas oficiais: origem de JSON versionado; **não persistir edições** sobre eles.
- Temas customizados: IDs estáveis UUID, nomes livres e cópia de tokens de origem; aplicação global usa paleta resolvida.
- `ColorTokens` preserva semântica próxima ao JSON end4-pC: superfícies, on-surface, outline, accents, terminal e mapping dos defaults; não usar nomes de cores de personagem como chaves programáticas rígidas.

### MediaAsset

```ts
interface MediaAsset {
  id: string;
  hash?: string;
  kind: 'image' | 'video';
  mimeType: string;
  originalName: string;
  bytes: number;
  width?: number; height?: number; durationSeconds?: number;
  source: 'bundled' | 'user';
  createdAt: string;
  blobKey?: string; // somente para mídias importadas
}
```

- **Biblioteca compartilhada:** asset existe 1 vez, referenciado por múltiplos temas, wallpapers, cards e snapshots. Deduplicação por hash de conteúdo quando viável, não apenas por nome; hashing de arquivos grandes pode ser trabalhado fora da thread principal.
- Metadados e blobs armazenados separadamente; **object URLs** temporárias devem ser revogadas ao desmontar componente.
- Mídias da galeria são referências estáticas/licenciadas; não copiar para IndexedDB sem necessidade.

### Element, Group e Layout

```ts
type ElementKind = 'imageCard' | 'widget' | 'structural';
interface DesktopElement {
  id: string; kind: ElementKind; componentType: string;
  title?: string; parentGroupId?: string;
  x: number; y: number; width: number; height: number; zIndex: number;
  rotationDeg?: number; opacity?: number;
  visible: boolean; locked: boolean;
  mediaAssetId?: string;
  settings: Record<string, unknown>; // validado por schema de cada componente
}
interface DesktopGroup {
  id: string; childIds: string[];
  resizeMode: 'proportional' | 'reflow';
  visible: boolean; locked: boolean;
  transform: {x:number;y:number;scale:number;rotationDeg:number};
}
interface LayoutProfile {
  id: string; themeId: string; wallpaperAssetId: string | null;
  baseViewport: {width:number;height:number};
  elements: DesktopElement[]; groups: DesktopGroup[];
  responsiveOverrides: Record<string, Partial<LayoutProfile>>;
  updatedAt: string;
}
```

**Atenção:** tipo recursivo acima é ilustrativo; ao implementar criar tipo de override **não recursivo** e normalizar entidades no storage para não serializar auto-referências ou repetir mídias. Coordenadas armazenadas no espaço lógico do canvas; arredondamentos/constraints aplicados no render, não destrutivamente nos dados-base.

### VersionSnapshot

```ts
interface VersionSnapshot {
  id: string; themeId: string;
  label?: string; kind: 'auto'|'manual';
  createdAt: string; schemaVersion: number;
  themeState: unknown;  // JSON validado/versionado
  referencedAssetIds: string[];
}
```

Snapshots **não contêm cópias de blobs**. Cada asset referenciado por versão manual deve ser preservado; referências atualizadas transacionalmente. Rotinas de GC de mídia só apagam itens **sem referências em temas, perfis, notas anexadas e snapshots protegidos**.

### RepositoryManifest

```ts
interface RepositoryManifestEntry {
  id: string; repoFullName: string;
  approvedForExplorer: boolean; approvedAsFeatured: boolean;
  ownerConfirmedFinalized: boolean;
  defaultRef: string; lastIndexedCommitSha?: string;
  milestones?: Array<{sha:string; label:string}>;
}
```

- Manifesto fornecido/revisado manualmente pelo proprietário. Bloquear inclusões implícitas.
- Manter **versão de índice** separada do `latest` para saber exatamente quais arquivos/commits o terminal está exibindo.
- Data de indexação e last SHA visíveis quando relevantes.

## 2. Armazenamento local

Banco Dexie/IndexedDB em tabelas normalizadas, por exemplo: `themes`, `media`, `mediaBlobs`, `layouts`, `versions`, `widgetData`, `preferences`, `migrations`. Event log de Undo/Redo pode viver primariamente em memória, com checkpoints persistentes. Nome final e índices exigem revisão antes de implementar.

### Transações e segurança

- Nova mídia: validar MIME por conteúdo quando possível; medir metadata; gravar blob e metadata; se escrita falhar, não criar referências órfãs.
- Novo card: referenciar asset existente e ID único; não duplicar blob.
- Excluir card: remover instância; asset mantido até GC aprovado.
- Excluir asset: consultar dependências em **todos** os temas/perfis/versões, bloquear caso haja referência; oferecer substituição/desvinculação com preview, nunca remoção silenciosa.
- Troca de wallpaper: gravar estado atual validado → carregar/criar destino → confirmar recuperação antes de liberar autosave; evitar sobrescrever destino com layout intermediário.
- Restaurar snapshot: capturar versão atual → validar formato e mídias → restaurar transacionalmente; se alguma mídia faltando, parar com aviso e pedir relink, não apagar itens indiscriminadamente.
- Autosave `debounce` sem mentir sobre sucesso: `pending → saving → saved` ou `error`. Em erro de quota manter última versão válida.

## 3. Versionamento/migrações

- Incrementar `schemaVersion` em alterações incompatíveis. Manter migrations puras testáveis e backup/recovery.
- Temas oficiais carregados do repositório possuem versão de paleta; tema customizado baseado em oficial **não deve mudar silenciosamente** se paleta original sofrer atualização futura.
- Versões automáticas: retenção configurável por armazenamento; manuais são protegidas contra GC automático, mas usuário pode apagá-las.
- Export zip contém `manifest.json` com versão/formato, tokens, perfis, widgets, grupos, assets listados e, quando selecionado, blobs de mídia. Não incluir dados privados do navegador, credenciais ou histórico de URL.
- Import valida schema/limites, hash, path traversal, mídia, inconsistências. Em conflito de IDs, gerar novos IDs para cópias; informar o que foi importado. Não executar nenhum JS/SVG/HTML do pacote.

## 4. UX de armazenamento

- Após importar MP4 grande, mostrar tamanho, duração e previsão do espaço ocupado; sem prometer que quota será suficiente.
- Mostrar resumo local: temas, arquivos, espaço aproximado e possibilidade de limpar **somente itens não utilizados**.
- Oferecer botão Exportar para backup antes de limpeza/importação destrutiva; não pedir login.
- `navigator.storage.estimate()` e `navigator.storage.persist()` podem ajudar, mas não garantem quota nem retenção em todos os browsers; explicar que dados locais podem ser apagados.
- Não enviar mídia pessoal do visitante para analytics, GitHub, serviços de nuvem ou compartilhamento remoto automaticamente.

## 5. Segurança de conteúdo e código

- Conteúdos GitHub são **dados não confiáveis**: tratar strings como texto; Markdown sanitizado; CSP, política para imagens remotas e links externos seguros.
- Não renderizar SVG de usuário sem sanitização/isolation; na primeira versão importação de mídia somente JPEG/PNG/WebP/MP4.
- Arquivos do explorador (`.js`, `.html`, `.sh`) jamais rodam dentro da página. Exibição via CodeMirror readonly.
- Iframes de projetos em origins aprovadas com permissões mínimas; revisar responsabilidades de áudio, fullscreen, cross-origin e storage; jamais usar `allow-same-origin` + `allow-scripts` em documento não confiável hospedado na mesma origem sem isolamento arquitetural.
- Secrets GitHub/API em CI ou server-side protegido, nunca no bundle React nem em comandos do terminal simulado.

## 6. Pseudofluxos críticos

```text
Criar card:
 selecionar asset existente | importar novo
 -> validar/registrar asset uma vez
 -> criar ID da instância e propriedades padrão
 -> adicionar ao layout ativo
 -> autosave transacional, criar evento Undo

Trocar wallpaper:
 snapshot seguro do layout A
 -> selecionar B
 -> se B tem perfil próprio: restaurar B
 -> senão: usuário escolhe manter layout base/cópia
 -> validar posições e referências
 -> mostrar B / confirmar autosave

Restaurar versão:
 snapshot de segurança do estado presente
 -> confirmar conteúdo/mídias da versão alvo
 -> restaurar atomically / rollback em erro
 -> manter versões manuais + assets referenciados

Aplicar tema ao portfólio:
 validar theme.palette -> resolver tokens semânticos
 -> persistir activeThemeId
 -> transição das cores CSS/uniforms Three.js
 -> manter scroll, câmera, projetos e wallpaper próprio do Studio
```


---

# 09 — Qualidade, acessibilidade, mobile, performance e segurança

## Princípio geral

Este portfólio só estará pronto quando for **usável, rápido, correto e acessível**, além de bonito. Uma animação perfeita não compensa página travada, conteúdo ilegível, demo que não carrega ou tema que perde dados. Testar com dispositivos reais, não apenas build/CI.

## Alvos de desempenho [PROPOSTO, medir e ajustar]

- Desktop razoável: buscar experiência próxima a **60 FPS** durante exploração, medindo frametime e evitando quedas perceptíveis em transições. Não prometer em todos dispositivos.
- Mobile intermediário: atingir interações confortáveis; adaptar alvo efetivo próximo a **30–60 FPS** conforme capacidade e bateria; priorizar responsividade sobre efeito visual.
- Evitar long tasks, layout thrashing e retenção de vídeos/iframes quando invisíveis; medir memória e GPU periodicamente em perfis de desenvolvimento.
- Orçamentos iniciais a calibrar com testes: DPR máximo adaptativo; LOD progressivo; partículas instanciadas; textura compressa; importação lazy do Phaser/site-3D; assets sem preload indiscriminado.
- Testar cold load com network throttling e cache vazia; hero legível antes da cena completa; não bloquear contato/GitHub enquanto WebGL carrega.

## Estratégia de graceful degradation

1. WebGL robusto disponível: cena completa, partículas densas ajustadas, vidro e reações.
2. GPU modesta/mobile: reduzir partículas/postprocessing/reflexos, qualidade de blur/sombras e resolução interna, preservando texto e navegação.
3. Reduced motion: câmera com transições mínimas ou navegação alternativa direta, intro estática e efeitos menos intensos; **todo conteúdo permanece acessível**.
4. Sem WebGL/context lost: HTML funcional com hero, projetos, skills, GitHub links e contato. Theme Studio pode continuar como UI 2D.
5. Offline/rate-limit GitHub: mensagens honestas, índice cacheado quando válido, links originais e estados de erro sem tela em branco.
6. Browser sem suporte MP4/codec: aviso e imagem/poster estático alternativo; não travar editor.

## Acessibilidade

- Semântica HTML para links/menu/terminal/editor; não depender só de canvas para nomes/descrições/contato.
- Foco visível, tab sequence estável, labels, atalhos documentados, escape/back consistente, role/dialog e focus trap apenas dentro de modais quando adequado.
- Não capturar scroll/teclas de terminal, CodeMirror, Abismo, site-3D ou Theme Studio para mover câmera 3D.
- Contraste de texto normal alvo WCAG AA na UI sempre que viável, mesmo ao personalizar paleta; alertar sobre combinações ilegíveis.
- `prefers-reduced-motion`, som opt-in, controle de volume, botão de mutar evidente; evitar flashes rápidos e efeito que cause náusea.
- Mobile com alvos tocáveis generosos, editor pode ser usado com telefone deitado, mas vertical não bloqueado; aviso apenas dentro do criador.
- Zoom do navegador: controles e textos sobrevivem 200% quando praticável; não travar viewport.
- Imagens têm alt text de conteúdo ou são decorativas corretamente marcadas.

## Matriz de dispositivos

| Cenário | Validar |
|---|---|
| Desktop 3440x1440 | constelação e Theme Studio sem esticar elementos |
| Desktop 1920x1080 | foco legível, cards e UI adaptados |
| Notebook 1366x768 | overlay não transborda; terminal utilizável |
| Android retrato | portfólio funciona; editor alerta que horizontal é melhor |
| Android paisagem | editor com painéis recolhíveis, toque e drag sem conflito |
| iOS Safari retrato/paisagem | storage, vídeos, gestos, aviso e fallback quando codecs limitados |
| `prefers-reduced-motion` | navegação sem animações obrigatórias |
| Sem suporte WebGL | acesso a conteúdo/contact |
| Rede lenta/offline parcial | estados de loading/erro e retries sem bloqueio |

## Plano de testes automatizados

- **Unitários (Vitest):** parser terminal permitido/negado, normalização de caminhos, tema tokens e contraste básico, geometria dos layouts e overrides responsivos, referência de mídia, dedupe, migrações schema, cálculo de grupos proportional/reflow, undo/redo, troca de perfis de wallpaper.
- **Componentes (React Testing Library):** cinco temas imutáveis, cópia editável, painel de propriedades, gerenciador camadas, modal de exclusão de mídia referenciada, aviso mobile, estados de erro.
- **E2E (Playwright):** scroll/abertura/retorno de painel; trocar tema sem resetar câmera; abrir Abismo/site-3D em mock/controlado e verificar isolamento de wheel/keyboard; terminal `ls/cd/cat/code`; snapshots/version/export/import; mobile orientações; fallback sem WebGL.
- **Visuais:** screenshots comparativos com desktop original do proprietário, por tema e widget; tolerâncias de diferenças documentadas. Não usar snapshot generativo como única evidência de fidelidade.
- **Acessibilidade:** axe em menus, modais, forms, editor, overlays de demo, leitura por teclado; testes manuais com leitor de tela.
- **Segurança:** XSS via Markdown/nomes de arquivos, path traversal em comandos/import ZIP, mime spoofing, iframe CSP, URLs maliciosas, oversized repos/arquivos/assets, quotas IndexedDB.

## Lista de testes manuais indispensáveis

1. Da página inicial até o contato sem mouse, apenas teclado.
2. Cursor parado sobre letras gera desagregação só quando desejado; não pisca repetidamente.
3. Abismo realmente jogável com controle e salvamento adequado na origem, quando disponível; se não, registrar **não testado** ou **falhou**.
4. site-3D executa roleta de personagem, busca e vídeos reais; scroll interno não afeta a câmera do portfólio.
5. Tema Changli → Hiyuki muda partículas, vidro, menus, editor e skills; jogo aberto não é reiniciado indevidamente.
6. Criar tema, importar duas imagens, criar quatro cards e três widgets, organizar e salvar; recarregar browser preserva.
7. Trocar wallpaper recupera layout, depois mudar resolução e retornar mantém overrides.
8. Criar versão nomeada, alterar layout, restaurar versão; arquivo de mídia ainda existe.
9. Tentar excluir arquivo compartilhado ainda referenciado: bloqueio e dependências visíveis.
10. Simular quota excedida durante autosave: alerta, sem afirmar sucesso e sem corromper última versão.
11. Sem WebGL/reduced motion: currículo, links e projetos continuam acessíveis.

## Logging e evidências

- Erros operacionais sem expor dados do visitante; coleta de analytics **não é requisito**. Não registrar conteúdo das notas ou mídias importadas.
- Para cada marco, o agente deve apresentar comandos executados, resultados, screenshots/testes, lista de arquivos alterados, riscos e pendências. Se não executou em ambiente real, escrever **NÃO EXECUTADO**.
- Alertas de links 404, GitHub rate limit, asset quebrado, demo offline ou falha de índice devem ser observáveis em desenvolvimento.

## Segurança de dependências e CI

- Lockfile versionado, `npm ci`, ESLint/typecheck/build/tests, verificação de vulnerabilidades e auditoria razoável de scripts de instalação.
- CI não deve editar ou publicar repositórios antigos por default; permissões mínimas GitHub Actions.
- Jamais inserir GitHub PAT em frontend, arquivos `.env` enviados ao GitHub ou logs.
- Atualizar libs somente com compatibilidade confirmada; React 19 e R3F v9 são a escolha de base, não alpha R3F/WebGPU.


---

# 10 — Plano de execução para Antigravity, dependências e critérios de aceite

## Regras do agente

- **O proprietário pediu planejamento detalhado para o Antigravity, não uma execução cega.** Ler o pacote e produzir um plano de PRs/tasks com dependências. Antes de alterar código ou configurar deploy, confirmar início do marco com proprietário. Uma vez autorizado, implementar incrementalmente e **não recriar sistemas fora de escopo**.
- Trabalhar em **novo repositório do portfólio**, sem sobrescrever `jogo-site`, `site-3D`, `Hyprland-Themes` ou arquivos pessoais do Linux. Projetos de demo recebem alterações próprias apenas se expressamente aprovadas.
- Antes de mexer em jogo, ler `jogo-site/GEMINI.md` e `jogo-site/docs/ANTIGRAVITY_LEIA_PRIMEIRO.md`. Não marcar projeto concluído sem QA.
- Sempre registrar `DONE`, `IN_PROGRESS`, `BLOCKED` e evidências. Não declarar concluído só com mock ou `npm run build` verde.

## M0 — Auditoria e base reprodutível

**Entrada:** novo repo vazio e docs. **Saída:** decisão documentada de hospedagem, scripts, estrutura, catálogo placeholder e guia de ambiente. Sem 3D complexa.

Tarefas: identificar versão Node compatível com Vite, fixar dependências React19 + R3F9, inicializar TS strict/Vite, ESLint/Prettier/Vitest/Playwright, CI, CSS tokens para Changli, rotas + fallback de conteúdo em DOM. Investigar assets/licenças, deploys das demos, estado de conclusão e Branch/commit dos repositórios.

**Aceite:** app vazio inicializa, build/lint/typecheck/test básico passam; tela HTML acessível exibe nome/links placeholders identificados; arquitetura do repo corresponde aos docs.

## M1 — Identidade e navegação central

Hero com nome/partículas responsivas; menu global; constelação mock com 3 painéis; câmera reversível por scroll e atração suave; sobre/contato; transição de painel; fallback e tema Changli. Sons **não** bloqueiam interação e ficam desligados até opt-in.

**Aceite:** navegação desktop + mobile, abrir/fechar sem perder câmera, texto legível, reduced-motion funcional, sem travar em GPU modesta.

## M2 — Projetos demonstráveis

Implementar host isolado e lazy loading. Publicar/testar **build** do Abismo e **build** do site-3D separadamente ou na mesma origem em caminhos isolados, com URLs reais. UI de projeto expandido, fullscreen, foco, scroll isolation, som e estados de erro. Projeto deve manter sua própria identidade e dados.

**Gate:** proprietário confirma quais dos candidatos estão finalizados/publicáveis. Se não confirmados, manter projeto como draft, disponibilizando apenas onde permitido.

**Aceite:** usuário consegue jogar Abismo e usar site-3D sem quebrar o host; verificações manuais em navegador e scripts existentes dos repos executados quando possível.

## M3 — Github, terminal, editor

Manifesto manual de repositórios aprovados; índice estático/adapter GitHub; terminal com parser seguro; árvore CodeMirror readonly, Markdown seguro, tabs; `ls cd cat code tree grep find help repos open goto`; histórico real `git log/show/diff`, alternar marcos/histórico sob demanda, grafo 3D opcional depois de UI estável.

**Aceite:** conteúdo de arquivo real bate com GitHub, repo fora de allowlist não é acessível, quota API não bloqueia página inteira, terminal funciona no touch/teclado.

## M4 — Vitrine dos cinco temas + theme engine

Carregar os cinco JSONs oficiais, derivar tokens CSS/Three/terminal, aplicar Changli padrão, transições globais, galeria. Os cinco oficiais são imutáveis; criar cópia customizada com nome/paleta.

**Aceite:** cores mudam globalmente em todos os módulos principais, sem recarregar cena/perder estado; temas oficiais nunca editados. Wallpapers ainda não presentes fora do Studio.

## M5 — Theme Studio essencial (valor alto)

Fidelidade inicial à screenshot e QML, canvas desktop React DOM, preview + modo edição, wallpaper imagem/MP4 só dentro do Studio, galeria/licenças e importação local, cards de personagens ilimitados dentro de limites de desempenho, widgets essenciais com funções locais (relógio, calendário, notas, To-Do, recursos simulados, player/visualizer básico), drag/click-to-add, snap/grade, camadas, bloquear, duplicar, ocultar. Autosave IndexedDB.

**Aceite:** usuário consegue criar um tema bonito **sem tutorial longo**, fechar/reabrir e recuperar desktop, aplicar só paleta ao portfólio; mobile vertical avisa e deixa prosseguir; importação de MP4 não aparece no cenário 3D.

## M6 — Theme Studio avançado aprovado

Grupos com proporcional/reflow, tamanhos nativos + modo avançado, perfis por wallpaper, overrides por resolução, biblioteca compartilhada e exclusão segura, histórico automático/manual nomeado, export/import, migrações. Apenas controles úteis; excluir experimentalismos visuais extras. Revisar componentes com QML real; separar fidelidade fiel de extensão autoral.

**Aceite:** teste transacional do storage, restore/version, dedupe e referências, mobile landscape, idempotência da importação, nenhum dado perdido por troca de wallpaper.

## M7 — Polimento, performance e publicação

Iluminação reativa refinada, sons contextuais e controle de preferências, grafo Git 3D opcional, qualidade adaptativa, testes visuais e acessibilidade, imagens finais autorizadas, texto real Sobre/Contato, CDN/build sizes, fallback, deploy e smoke test público.

**Aceite:** checklist de QA assinado pelo proprietário; links e demos funcionais em URL pública, assets com licença correta, relatórios sem alegações falsas, rollback/versionamento de build.

## Priorização para não transformar o projeto em outro sistema operacional

1. **Primeiro** navegação e projetos realmente utilizáveis; cenas funcionais e simples antes de efeitos de luxo.
2. **Depois** terminal útil e trocador global de cores.
3. **Depois** Theme Studio essencial, a parte divertida; não começar por versionamento complexo.
4. **Por último** perfis múltiplos, snapshots avançados e microcontroles; pertencem ao escopo aprovado, mas não impedem demonstração dos marcos anteriores.
5. **Sem extras não pedidos**: marketplace, login, multiplayer, IA, exportador Linux instalável, captação de dados de CPU real, gestão de arquivos reais.

## Padrão de PR/entrega

Cada PR/MR deve conter: escopo/requisito referenciado, arquivos alterados, screenshots/gravacões quando UI muda, testes executados/pendentes, como rodar, impactos no jogo/deploy, limitações, link para demo quando disponível. Mudanças de dados/schema incluem migrações e teste de rollback.

## Definition of Done por funcionalidade

`DONE` somente se: implementação integrada; build, types, lint e unit quando aplicáveis; pelo menos um teste manual/E2E relevante executado; fluxo de erro e teclado/mobile verificados; documentação atualizada; aceite funcional conferido. Falta de access/asset/demo deve ser `BLOCKED`, não `DONE`.

## Ao receber esta documentação, o Antigravity deve responder

1. **Resumo da compreensão** (sistemas, stack, principais decisões, o que está fora do escopo).
2. **Auditoria M0** do ambiente/repo atual, apontando lacunas sem inventar arquivos.
3. **Roadmap em issues/tarefas** ordenadas, pequenos PRs e dependencies.
4. **Perguntas BLOQUEANTES somente** (conteúdo pessoal, confirmação de projeto finalizado, licença dos assets, URLs de demos, escolha deploy).
5. **Plano do primeiro PR**; só começar a codificar depois de autorização do proprietário.


---

# 11 — Pendências reais, fontes e limites do conhecimento

## O que já está definitivamente escolhido

- Portfólio 3D cinematográfico, partícula-nome, reação ao cursor imóvel, constelação de hologramas, scroll magnético suave, expansão do próprio painel, árvore de skills, Sobre/Contato, menu top, terminal/vis/code real, commits e grafo 3D opcional, som adaptativo opt-in, mobile adaptativo.
- Tema Changli padrão + quatro oficiais Hiyuki/Emilia/Furina/Hotline Miami; troca de paleta global; wallpapers MP4 só no Theme Studio.
- Projetos-alvo Abismo jogável, site-3D experimentável, Hyprland-Themes galeria/Studio. `dotfiles-Arch` excluído. Aprovação manual de outros repositórios; só finalizados na constelação.
- Theme Studio visual de desktop Linux: imagens independentes de personagem são cards, demais instrumentos são widgets, grande imagem do fundo é wallpaper. Gallery+import local; cards múltiplos; pos. híbrido; adicionar elementos arrastando ou clicando; editor mobile paisagem recomendado/vertical permitido.
- Widgets visualmente fiéis com funções locais simples; modo original + avançado opt-in; agrupamento proportional/reflow; layout híbrido por wallpaper; adaptação por resolução com overrides; biblioteca mídia compartilhada; autosave/versionamento automático+manual; export/import local; exclusão segura de arquivos referenciados.
- IA/assistente retirada; novos minijogos adiados; sem arquitetura de Linux funcional no browser.

## Perguntas em aberto realmente importantes — NÃO BLOQUEAR trabalho independente

| Pendente | Por que importa | Quando resolver |
|---|---|---|
| Nome **exato de exibição** e cargo | texto do hero e SEO | antes do M1 publicar |
| Texto Sobre Mim e contato (links/autorização de email) | conteúdo final verdadeiro | antes de M7; placeholders marcados antes |
| Projetos realmente **finalizados** | regra de constelação | antes de featured público no M2 |
| Lista de repos permitidos no terminal além dos candidatos | evitar publicação automática | antes do M3 indexar |
| URLs de deploy do Abismo e site-3D | demos precisam rodar sob host aprovado | M2 |
| Licenças/arquivos de wallpapers, personagens, vídeos e música | direitos/autorização e desempenho | antes de usar assets em M2/M5 |
| Host/dominio escolhido | regras de rotas/cross-origin/storage de saves | M0/M2 |
| Detalhes de perfis/cor individuais dos widgets | visitante interrompeu seleção de herança de cores; não está aprovado | M6 se fizer falta; default herdar tema |
| Exportar tema instalável para Linux real | **não** confirmado, diferente de exportar backup portátil | não incluir no plano inicial |
| Teclas do Abismo/mobile/estado de conclusão | garantir uso real e evitar sobrescritas | M2 antes de anúncio final |
| Lista exata de skills dominadas e evidências | árvore não deve mentir | M1/M7 |

Não transformar estes pontos em dezenas de perguntas para o usuário. Usar placeholders honestos e avançar em tarefas não bloqueadas. **O proprietário pediu explicitamente que o escopo pare de crescer.**

## Repositórios reais verificados em 27/10/2026 (fontes GitHub)

### `https://github.com/pedrogonzalez-png/jogo-site`

- `package.json`: Phaser `^4.2.1`, Vite `^8.3.0`, JS ESM, teste `node --test`.
- `src/main.js`: Phaser.AUTO 1280×720, Arcade physics, BootScene, MainMenuScene, GameScene.
- `README.md`, `GEMINI.md`: regras do Abismo, documentos, pendências de QA; não reescrever com React.
- Antes de modificá-lo, ler `docs/ANTIGRAVITY_LEIA_PRIMEIRO.md`, GDD e plano QA deste repo. Status final não verificado.

### `https://github.com/pedrogonzalez-png/site-3D`

- `package.json`: React `^19.2.8`, Vite `^8.2.0`.
- `src/App.jsx`: seleção por roleta em arco com wheel, conteúdo de personagem, vídeos intro/idle, campo de busca.
- `src/charactersData.js`: assets de imagens e vídeo `.webm` importados. README template; finalização/licenças dependem de auditoria. Não declarar que roda Three.js/WebGL.

### `https://github.com/pedrogonzalez-png/Hyprland-Themes`

- `end4-pC/{changli,hiyuki,emilia,furina,hotline-miami}.json`: paletas oficiais (incluem `dark`, `light`, acentos, cores de terminal).
- `README.md`: cinco temas, instaladores, Fastfetch, alterações do Quickshell, aviso de que wallpapers e artes de personagens **não são distribuídos** no repo.
- `overrides/end4-pC/services/WallpaperLayouts.qml`: perfis de layout por wallpaper, lista de widgets, propriedades `x/y/z`, dimensões, rotação, ativação/restauração e proteção de autosave em caso de restauração incompleta.
- `overrides/end4-pC/modules/ii/wallpaperSelector/AnimatedWallpaperGrid.qml`: recursos nativos para wallpapers animados.
- Commit base pinado do end4-pC: `8fbb6716cba628a13103e665e9538021683a7250` (confirmado no README do repo do proprietário). Comparar QML nessa ref e patch do repo próprio.
- `https://github.com/pctrade/end4-pC/tree/8fbb6716cba628a13103e665e9538021683a7250/modules/ii/background/widgets`: diretórios e widgets reais; clock `cookie/digital/daily/pixel`, media, calendar, weather, resources, images, usercard, todo, notes, timers, customtext etc.
- Captura de tela fornecida: `../referencias/desktop-linux-referencia.png`.

## Referências públicas técnicas (acessadas em 27/10/2026)

- React Three Fiber v9 + React 19: `https://r3f.docs.pmnd.rs/getting-started/installation`.
- Vite deployment e GitHub Pages base: `https://vite.dev/guide/static-deploy`.
- GitHub REST unauthenticated limit: `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` (limite primário usual 60 requisições/hora por IP; sujeito a políticas de GitHub).
- MDN quotas/eviction/storage persist: `https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria`.
- Referências de estética, NÃO para copiar: `https://oryzo.ai/`, `https://www.igloo.inc/`, `https://activetheory.net/`.

## Honestidade de status

Este pacote registra requisitos e verificações estáticas de arquivos públicos do GitHub. **Não foram executados builds, testes nem demos dos projetos neste trabalho documental; não foi criado código do portfólio.** Interfaces e APIs propostas só existem como especificação. O agente precisa comprovar sua implementação no ambiente real e no navegador.

## Regras de revisão da especificação

- Qualquer alteração de comportamento aprovado só mediante decisão explícita do proprietário; anotar em changelog de requisitos.
- Questões técnicas podem receber decisão pragmática se preservarem experiência e respeitarem critérios de aceite; documentar justificativa.
- Não interpretar recomendações que o assistente apresentou mas o usuário não selecionou como decisões aprovadas (por exemplo: exportador instalável de Linux, paletas individuais por widget, novas mini-games).
- Não colocar conteúdo particular ou dados pessoais do Linux sem consentimento; screenshots só como material de referência interna até autorização.
