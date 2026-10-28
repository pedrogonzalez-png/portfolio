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
