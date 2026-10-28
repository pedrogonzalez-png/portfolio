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

## M4 — primeiro bloco (28/10/2026)

- Cinco esquemas oficiais exatos (defaults, dark, light) copiados do repositório Hyprland-Themes, cada qual identificado por caminho e SHA em src/data/official-theme-schemes.json.
- ThemeProvider aplica tokens globais e persiste a escolha em localStorage, com fallback Changli para IDs inválidos ou armazenamento bloqueado.
- Partículas do nome, iluminação, poeira e vidros agora usam cores da paleta, atualizadas sem desmontar o carrossel ou reiniciar as câmeras. Destaques CSS globais seguem os tokens.
- Acesso à galeria pelo botão Temas e pelo detalhe Hyprland-Themes. Prévia é local; Aplicar confirma a troca. Os cinco oficiais permanecem imutáveis.
- M4 continua IN_PROGRESS: duplicação e edição personalizada, auditoria visual de todos os tons/contrastes e teste manual no navegador. M5 (widgets/wallpapers) ainda não foi implementado.

## M4 — segundo bloco: cópias pessoais + editor (28/10/2026)

- Duplicar qualquer tema oficial ou cópia, sem alterar os originais. A nova cópia mantém SHA e identidade do JSON oficial de origem.
- Editor simples: nome, três acentos, fundo, superfície e texto, com prévia isolada. **Salvar** persiste; **Aplicar** altera a aparência global. Editar o tema atualmente aplicado não o modifica até o usuário reaplicar, inclusive após recarregar.
- Storage provisório de M4: localStorage para paletas pequenas, até 12 cópias, validando ID, origem, hex e integridade. Falha de armazenamento comunica erro sem marcar como salvo. IndexedDB para widgets, imagens e layouts segue reservado a M5/M6.
- Os cinco oficiais permanecem imutáveis. Sem widgets, wallpaper e exportação nesta etapa. M4 ainda IN_PROGRESS até teste visual e auditoria de contraste.

## M4 — terceiro bloco: contraste e desktop simulado ampliado (28/10/2026)

- Análise indicativa de contraste sRGB/WCAG 2.x na **prévia local**, com quatro pares de cores usuais: texto sobre fundo, texto sobre superfície, texto secundário sobre superfície (meta 4,5:1) e acento sobre fundo usado como elemento gráfico (meta 3:1). Mostra proporção calculada, status e aviso. Não é uma certificação de acessibilidade de todos os componentes do site nem bloqueia salvar uma paleta.
- Nas cópias pessoais, botão opcional **Sugerir texto legível** escolhe branco ou preto maximizando a pior razão de contraste entre fundo e superfície. O ajuste modifica somente o rascunho; Salvar e Aplicar seguem etapas independentes.
- **Abrir desktop ampliado** ativa uma simulação DOM/CSS 2D proporcional, com opções de aspecto 3440×1440 e 1920×1080, barra, dock e janelas visuais com três painéis alternáveis (Visão geral, Paleta e Sobre). Tudo é deliberadamente demonstrativo; nenhuma mídia, widget, card de personagem, wallpaper MP4 ou QML real foi implementado ainda.
- Prévia ampliada herda alterações do rascunho em tempo real; muda apenas o Theme Studio, sem alterar o Arch real, o portfolio 3D, a seleção aplicada ou dados salvos. Mobile vertical tem aviso de orientação que pode ser dispensado.
- Desktop simulado é um **andaime visual para a etapa de widgets/layouts**, não conclusão do editor de desktop previsto em M5. M4 permanece IN_PROGRESS até QA manual e aceitação.
