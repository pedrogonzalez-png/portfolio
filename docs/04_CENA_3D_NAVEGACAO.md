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
- **Refinamento de referência Igloo (28/10/2026):** o próprio nome legível deve ser formado por partículas, sem duplicar texto sólido sobre o canvas. Entrar com o cursor em uma letra provoca dispersão apenas naquela região e nas letras vizinhas; letras distantes permanecem legíveis e intactas. O cursor também agita as partículas próximas com esteira e brilho proporcional à velocidade; molas amortecidas recompõem rapidamente a palavra após a interação. A intensidade deve cair suavemente com a distância e acompanhar o ponto efetivo do cursor, não a palavra inteira. O canvas deve permitir movimento para fora da altura das letras, sem cortes visuais. Cursor parado sobre uma letra produz uma dispersão curta uma única vez antes de recompor. Alinhar o canvas à área do título em qualquer resolução; manter texto HTML sem WebGL e com movimento reduzido. Não copiar shaders ou assets do site de referência.

## Constelação de projetos [DECIDIDO]

**Decisão visual atual (27/10/2026):** remover o objeto decorativo vermelho em formato de coluna/medula. Manter a constelação de painéis de vidro 3D, as partículas de ambiente, a câmera e as interações previstas neste documento. Não substituir o centro por outro objeto anatômico nem recriar essa estrutura sem pedido explícito.

**Atualização de apresentação (28/10/2026):** os três painéis devem ficar lado a lado em um arco perspectivo, conforme esboço do proprietário: painel central maior e frontal, painel esquerdo inclinado para o centro e painel direito inclinado simetricamente. A rodinha do mouse sobre a área da constelação troca o projeto central com transição suave, um por gesto; nos extremos, o scroll volta a rolar a página normalmente (não prender o visitante). Os botões de anterior/próximo, as setas do teclado e a seleção por clique/touch devem oferecer o mesmo controle. Clicar em um painel lateral o coloca no centro; clicar no painel central abre os detalhes. Preservar a refração dos vidros, transparência, projetos autorizados, modais e fallback com movimento reduzido. Esta alteração substitui a disposição de cartões escalonados verticalmente, sem criar seção adicional.


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

## Entrega incremental — árvore de conhecimentos (28/10/2026)

- Seção "Habilidades" adicionada entre os projetos e Sobre/Contato, com acesso pelo menu.
- Grafo interativo DOM/SVG: clicar em uma tecnologia revela projetos relacionados e um arquivo de evidência; clicar no projeto ilumina as tecnologias; filtros por Web, Jogos, Linux e Automação.
- Dados explícitos em `src/data/knowledge.ts`, restritos a Abismo, site-3D e Hyprland-Themes. Nenhum score de proficiência, certificado, repositório excluído ou informação pessoal inventada.
- Tema acompanha tokens CSS globais do Theme Studio; no mobile, os mesmos nós aparecem como botões em lista; o SVG é somente decorativo e não depende de WebGL.
- Testes automatizados de allowlist, filtros, conexões e interação por botões em `src/__tests__/knowledge-tree.test.tsx`.
- **Status: IN_PROGRESS** até CI e revisão visual/manual no navegador real. O grafo 3D integrado à câmera cinematográfica não é reivindicado como implementado; esta é a primeira versão navegável e acessível.

## Refinamento visual — espaço tridimensional de conhecimentos (28/10/2026)

- O grafo plano mostrado na primeira versão passa a oferecer **cena Three.js real** em navegadores desktop com WebGL e movimento permitido.
- Três placas centrais de vidro físico com diferentes coordenadas Z, onze placas menores em constelação espacial, linhas curvas 3D, anéis distantes e campo de partículas. A câmera reage suavemente ao cursor e se aproxima um pouco da seleção; não prende o scroll nem altera a navegação geral.
- Rótulos continuam **botões DOM focáveis** projetados sobre cada objeto via Drei Html. Filtro por categoria, seleção de tecnologia/projeto e links de evidência permanecem funcionais.
- Material utiliza transparência, clearcoat e transmissão moderada; cores acompanham o tema global. Sem cópia de shaders/assets de Active Theory — somente referência conceitual de profundidade e atmosfera WebGL.
- Até 919px, com movimento reduzido, sem WebGL ou fora do viewport, o sistema mantém a versão DOM/SVG. A renderização WebGL pesada é montada apenas quando a seção entra em vista. Evento de perda de contexto volta para a alternativa leve.
- **Aceite ainda pendente:** inspeção visual em navegador no Arch, teste de perda de contexto e desempenho medido em GPU integrada/dedicada. Build e testes automatizados não substituem QA visual.

## Correção da direção visual — foco e legibilidade (28/10/2026)

A captura enviada pelo proprietário mostrou três problemas concretos na versão anterior: conexões sobrepostas de três projetos ao mesmo tempo, vidro marrom opaco/sem hierarquia e o título de Abismo ausente no cartão. Essa direção **não foi aprovada** e foi substituída.

A segunda composição utiliza:
- **Um projeto principal por vez** em um grande painel de vidro central; dois outros projetos aparecem recuados nas laterais com ações de navegação. O foco muda por setas e clique; sem captura do scroll global.
- **Somente conexões comprovadas do projeto em foco**: os chips técnicos ocupam arcos superior/inferior calculados sem posições repetidas, e os filamentos saem apenas do centro. Sem teia cruzando três núcleos.
- Vidro mais transparente e escuro com reflexo fino, contraste claro para título e descrição, brilho Changli usado com parcimônia, anéis e partículas em diferentes camadas Z.
- A geometria de vidro, o campo de partículas e os fios luminosos são WebGL real; **texto, chips, botões e navegação ficam em HTML sobre o canvas**, não dentro dele. Isso elimina a oclusão de títulos observada na primeira captura.
- Os detalhes e os filtros existentes continuam compartilhados com a versão DOM/SVG acessível, usada em mobile e quando WebGL/movimento não estiver disponível.
- A inspeção visual continua pendente; nenhuma alegação de equivalência à Active Theory. Trata-se de uma referência conceitual de profundidade, ritmo, foco e imersão.

## Refração óptica real — pesquisa e revisão (28/10/2026)

Após pesquisa de referências públicas da Active Theory, o usuário reforçou que desejava **vidro óptico translúcido e refrativo**, e não cards escuros imitando vidro com CSS. A referência visual são painéis claros refratando cenas WebGL luminosas, com bordas espectrais; nenhuma geometria, mídia, fonte, shader ou código da Active Theory foi copiado.

Implementação original no `src/components/KnowledgeWorld.tsx`:

- O cenário de fundo possui véu procedimental shader GLSL, filamentos tridimensionais orgânicos, anéis distantes e partículas, todos **atrás** das placas. As superfícies mudam visualmente o que se vê por trás.
- Uma única captura offscreen por frame usando **useFBO** renderiza o fundo sem as placas; um shader próprio compartilha essa textura por todos os vidros. O fragment shader desloca a amostra de acordo com a curvatura das bordas, normais, oscilação sutil e dispersão cromática (RGB). Nenhuma placa tem FBO individual.
- O material usa quase só pixels refratados do cenário, com leve cor derivada do tema e reflexão direcional sutil. **Retiradas as camadas CSS marrons opacas e os efeitos wireframe** que cobriam o material.
- Texto/títulos/botões permanecem DOM legível sobre o WebGL, sem refratar letras e sem bloquear a interação com assistentes de acessibilidade.
- Refração em resolução controlada com teto de 1400 × 900 pixels no FBO, DPR máximo de 1,5 no canvas e cena desligada fora de vista; mobile e movimento reduzido continuam na alternativa leve.
- A experiência é de autoria original, **inspirada pela linguagem visual**, não uma reconstrução literal ou equivalência ao pipeline Hydra/WebGL proprietário da referência.
- **QA visual pendente** no navegador do proprietário: visibilidade das fitas através do vidro, color fringing nas bordas, nitidez do título e FPS. Build automatizado não comprova essas propriedades de renderização.
