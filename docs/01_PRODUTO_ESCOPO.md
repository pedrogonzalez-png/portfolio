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
