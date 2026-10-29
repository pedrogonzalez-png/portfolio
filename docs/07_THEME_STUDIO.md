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

## M4 → M5 — primeiro relógio real + primeiros cards de personagem (28/10/2026)

- Inspecionamos os QMLs no commit pinado 8fbb6716cba628a13103e665e9538021683a7250 da referência pctrade/end4-pC: ClockWidget.qml, DigitalClock.qml, ImageCardWidget.qml. O relógio web usa horário e data locais reais (Intl.DateTimeFormat pt-BR), atualiza a cada segundo e herda a paleta; é adaptação React/CSS do estilo digital, não QML executado.
- Cards de personagem não são widgets: cada card recebe sua própria imagem PNG/JPG/WebP, selecionada pelo visitante, ID único e URL blob local. Imagens com até 8 MB cada, máximo temporário de 20 cards por sessão; SVG e arquivos incompatíveis são recusados. Não há imagens inventadas ou uploads para servidores.
- Relógio e cards têm alças independentes com arraste via pointer (mouse/touch) ou movimentação por setas; Shift + seta aumenta o passo; remoção individual. Posicionamento percentual limitado à área da prévia.
- IMPORTANTE: arquivos importados, relógio e posições existem apenas durante a sessão da prévia. URL.revokeObjectURL libera as imagens ao remover ou fechar o editor; não há IndexedDB, salvamento/exportação de mídia, layout por wallpaper, grid, grupos, snap ou undo/redo. Não afirmar persistência ou conclusão dessas funções.
- Esta implementação inicia elementos reais do desktop simulado; M4/M5 ainda IN_PROGRESS até QA no navegador e persistência dos elementos em marco posterior. Os cinco temas oficiais continuam imutáveis, assim como o Arch real e o portfolio 3D.

## Correção de navegação: somente pelo projeto Hyprland-Themes (28/10/2026)

- O Theme Studio completo pertence ao projeto **Hyprland-Themes** no carrossel de Projetos. Quando o card estiver centralizado, clicar nele abre o Studio diretamente. Clicar no card lateral continua apenas a centralizá-lo.
- O botão global **✦ Temas** foi removido do cabeçalho: o tema aplicado continua indicado visualmente, mas o editor completo não compete com a navegação do portfólio.
- Os cards Abismo e site-3D preservam seu fluxo de detalhes.
- A janela do Studio usa cobertura opaca do fundo para não deixar os cards do carrossel confundirem sua hierarquia visual. As cores aplicadas continuam globais, mas o acesso à edição é contextual ao projeto.

## M5 — armazenamento local do desktop (28/10/2026)

- O desktop simulado agora oferece **Salvar organização** e **Restaurar última organização salva**. Ao abrir a prévia, tenta recuperar automaticamente um único layout local do navegador. Esta primeira persistência é **global para a prévia** (não separada por wallpaper, tema ou resolução), com o formato de tela salvo como parte da organização. Múltiplos perfis e versões continuam futuros.
- Dados persistidos em **IndexedDB, versão 1**: posição e presença do relógio, formato 3440×1440/1920×1080, e imagens originais (Blob) dos cards com nome, ID e posição. As imagens não são convertidas para base64 nem enviadas a servidores; URLs blob usadas na tela são **recriadas** na recuperação e revogadas na remoção/fechamento.
- **Salvamento explícito, não automático:** arrastar, importar, remover ou mudar formato marca alterações como não salvas. Fechar sem salvar mantém apenas a organização anterior; Restaurar substitui mudanças da sessão. A aplicação do tema permanece separada.
- A interface só informa sucesso quando o IndexedDB confirma a transação. Falha por espaço, permissão ou IndexedDB ausente gera mensagem visível e preserva a edição em memória. Validação estrita de versão, tipo, limite de 20 imagens de até 8 MB, dimensões, IDs e posições rejeita registros corrompidos.
- Continuam ausentes: projetos de layout múltiplo, perfil por wallpaper, organização em grupos, undo/redo, exportação/backup de mídia, upload e integração com Quickshell real. O navegador pode apagar dados do site; persistência não equivale a backup portátil. O M5 permanece IN_PROGRESS até QA real no Arch e essas funcionalidades adicionais.

## M5 — múltiplas organizações e desfazer/refazer de posições (28/10/2026)

- Agora existem **quatro slots fixos de layout** no mesmo IndexedDB: Principal, Layout 2, Layout 3 e Layout 4. Cada um guarda seus próprios Blobs, posição/visibilidade de relógio, posições dos cards e modo de tela. O registro antigo sob a chave `default` é o novo slot Principal **sem migrar ou apagar o conteúdo**; o formato de dados continua `schemaVersion: 1`.
- Trocar de organização carrega a versão salva do slot escolhido, ou uma prévia vazia caso esse slot ainda não exista. A troca é **bloqueada enquanto há edição não salva**, com mensagem que orienta Salvar organização ou Restaurar; uma falha de leitura preserva o slot e elementos atuais. Restaurar afeta apenas o slot ativo.
- **Desfazer/Refazer movimento** funciona nas posições do relógio e dos cards. Até 30 etapas de posição são guardadas **somente em memória**; cada gesto de arraste registra uma etapa, e cada ajuste com setas registra outra. Atalhos Ctrl+Z / Ctrl+Shift+Z (ou Ctrl+Y), com controles de botão acessíveis. Mudanças na quantidade de elementos (adicionar/remover cards ou relógio) limpam esse histórico para não tentar ressuscitar URLs Blob revogadas. O histórico também é limpo ao trocar/restaurar o layout.
- Desfazer/Refazer **não salva automaticamente**. Use Salvar organização para persistir o resultado final no slot escolhido.
- Não foram implementados: nomes arbitrários de layouts, versões históricas, arraste entre monitores, layout por wallpaper, backup portátil, undo/redo de inclusão/exclusão de mídia e integração com Quickshell real. M5 continua **IN_PROGRESS** até validação visual no Arch/Chromium e avanços do roadmap.

## M5/M6 — nomes das organizações + backup portátil de slot (28/10/2026)

- **Renomeação:** cada um dos quatro slots fixos agora tem nome de exibição próprio (1–32 caracteres, sem controle), salvo no mesmo IndexedDB sob chaves `name:default`, `name:layout-2` etc. O nome novo não altera a chave do layout e **não mexe nos Blobs antigos**. Dados ausentes/corrompidos retornam aos rótulos Principal/Layout 2–4.
- **Backup portátil antecipado de M6:** botão `Exportar backup do layout` descarrega apenas o **slot ativo previamente salvo**, com todas as imagens Blob originais e posições/relógio/resolução. Formato binário versionado `.ptsbackup` próprio da aplicação: assinatura, cabeçalho UTF-8 limitado e Blobs sequenciais, sem Base64, sem envio a servidor. Arquivo não é um ZIP genérico e só pode ser importado por esta versão do Theme Studio.
- **Importação segura:** valida assinatura, versão, comprimentos, ausência de bytes extras, MIME/nomes, limites de cards/bytes e schema antes de mostrar uma confirmação. O visitante deve clicar em `Confirmar importação e substituir` para gravar no slot selecionado. Cancelar ou falhar na validação **não altera o layout salvo**. Não importa automaticamente nem sobrescreve os outros três slots.
- Salvar nome do layout é ação separada de salvar o conteúdo. Exportar exige que as edições e o nome do slot estejam salvos. Não há exportação/importação em lote dos quatro layouts, backup de temas customizados, compressão nem sincronização entre dispositivos. A edição de mídias e wallpapers, versionamento de layouts e toda a funcionalidade M5/M6 seguem IN_PROGRESS até QA visual e testes de integração no navegador.

## M6 — versões nomeadas por organização (29/10/2026)

**Status: IN_PROGRESS — implementação e testes automatizados; QA visual no Arch pendente.**

Foi acrescentada a seção **Versões do layout** dentro do desktop simulado. Cada um dos quatro slots pode guardar até **cinco versões nomeadas** de seu **último estado salvo**, incluindo as imagens Blob, relógio, coordenadas e proporção. Não são gravadas alterações não salvas. Versões têm botão de restauração com confirmação explícita e exclusão individual, também com confirmação.

**Restauração segura:** numa **única transação IndexedDB**, o sistema grava a versão de segurança "Antes de restaurar" do layout atual e substitui o slot ativo pelo estado escolhido. Se faltar espaço, houver registro corrompido ou forem atingidas cinco versões, a transação aborta e o layout anterior permanece. Para restaurar com cinco versões, é preciso excluir explicitamente uma primeiro; o sistema jamais descarta históricos em silêncio.

Os dados existentes usam a **mesma database, store e versão de schema**, com chaves novas prefixedas por `versions:` / `version:`. O layout principal `default`, os três slots adicionais e seus Blobs permanecem inalterados. A funcionalidade exige IndexedDB local; limpar os dados do navegador apaga essas versões e não equivale a backup portátil. O formato `.ptsbackup` existente continua útil para arquivo externo, e não mudou.

Evidências: `src/__tests__/desktop-versions.test.ts` (isolamento dos slots, transações atômicas, limite/corrupção, restauração), `src/__tests__/desktop-versions-ui.test.tsx` (confirmação, bloqueio de mudanças não salvas). **Ainda ausentes:** perfis por wallpaper, snapshots automáticos periódicos, várias resoluções independentes, biblioteca compartilhada de mídia, MP4 e integração Linux real. Não declarar M5/M6 concluídos.


## M6 — Prévia visual Changli conectada aos arquivos públicos do autor (29/10/2026)

**Ajuste solicitado a partir de uma captura da prévia anterior:** a janela genérica "Visão geral / Paleta / Sobre", os cartões abstratos e as três bolinhas de dock foram **removidos** do desktop ampliado. Esse mockup não correspondia ao Arch personalizado do proprietário.

**Fontes reais e verificadas no GitHub:**
- `pedrogonzalez-png/dotfiles-Arch/wallpapers/changli.png` — imagem original do wallpaper estático, usada como fundo da simulação. Arquivo é referenciado por URL pública, **não copiado** ao repositório do portfólio.
- `pedrogonzalez-png/dotfiles-Arch/wallpapers/changli.mp4` — wallpaper animado original, com cerca de 36 MB. **Opt-in**: nenhum `<video>` é montado nem baixado até o visitante clicar em **Ativar wallpaper animado**. Falha de vídeo volta à imagem.
- `pedrogonzalez-png/Hyprland-Themes/end4-pC/changli.json` — fonte dos tons oficiais do Changli já incorporados ao `src/data/official-theme-schemes.json`.
- `pedrogonzalez-png/dotfiles-Arch/quickshell/ii/modules/ii/bar/BarContent.qml` e `.../dock/Dock.qml` — referência estrutural da barra e dock, representados por **HTML/CSS, não QML executado**.

Implementação em `src/components/desktop/RealDesktopPreview.tsx` e `src/styles/real-desktop-preview.css`, montada em `SimulatedDesktop.tsx`. A imagem usa cover e respeita ultrawide/16:9; a barra superior usa relógio local real, os indicadores de workspace são apenas ilustrativos, e o dock não finge abrir apps. Os **cards importados, relógio movível, layouts, versões e backup** continuam ativos na camada do editor.

**Limitações transparentes:** isto é uma **prévia visual** do Changli usando mídia e cores originais do autor, e não um espelhamento em tempo real do Arch/Hyprland/Quickshell, nem reprodução pixel-perfect do QML em produção. Outro tema selecionado **não recebe** indevidamente o wallpaper Changli; fica com a própria paleta até haver mídia aprovada para ele. A origem pública das imagens é informada na interface. Se o GitHub estiver indisponível, mostra mensagem e fallback — não afirma que carregou o wallpaper.

Evidências: `src/__tests__/real-desktop-preview.test.tsx` verifica URL real, carregamento opcional de vídeo, fallback em erros e isolamento de outros temas. `src/__tests__/theme-contrast-desktop.test.tsx` verifica ausência dos painéis genéricos antigos. **QA visual no Arch ainda pendente**. Nenhuma configuração real foi alterada nos repositórios de origem.

## M6 — Hyprland viewer + Configurações, widgets QML e posição real (29/10/2026)

**Decisão do proprietário:** o desktop animado e o que já foi desenvolvido aparecem na seção **Hyprland**; todo o restante (editor de cores, criação de cópias, layouts, cards, widgets editáveis, histórico, versões e backup) fica na aba **Configurações**. O Theme Studio agora abre na aba Hyprland, com uma galeria de prévia para os cinco temas oficiais originais e cópias personalizadas existentes no navegador. A paleta aplicada ao portfólio não é alterada até o clique em **Aplicar** nas configurações.

**Fontes verificadas:** `Hyprland-Themes/end4-pC/{changli,hiyuki,emilia,furina,hotline-miami}.json`; `dotfiles-Arch/wallpapers/changli.png`, `changli.mp4`, `hsin.png`, `hsin.mp4`, `hutuki.mp4` e `hypr/custom/scripts/mpvpaper_thumbnails/hutuki.mp4.jpg`; `Hyprland-Themes/overrides/end4-pC/services/WallpaperLayouts.qml` e QML dos widgets, barra e dock públicos. O viewer respeita mídia original disponível e não atribui wallpapers inventados a Emilia, Furina ou Hotline Miami. **Hsin** aparece como prévia adicional porque existe wallpaper público, mas sua **paleta original não foi encontrada publicada**: usa provisoriamente as cores de Changli com um aviso explícito. Não cadastrar Hsin como esquema oficial sem JSON comprovado.

**Aparência dos widgets:** galeria simplificada de relógio, clima, calendário, mídia, visualizador, recursos, notas, tarefas, imagem/card, temporizador, relógio mundial e texto. O `WallpaperLayouts.qml` lista **21 tipos/slots** com `enable`, `x`, `y`, `size`, `cardWidth`, `cardHeight` e outras propriedades; as prévias **não inventam dados de CPU, clima, conteúdo pessoal ou imagens privadas**.

**Posicionamento real:** os perfis são armazenados no Linux do usuário em `~/.config/quickshell/end4-pC/wallpaper_widget_layouts.json` e **esse arquivo não está versionado no GitHub**. O site não consegue ler um arquivo no PC remoto de um visitante, portanto não exibe posições falsas como se fossem reais. O visitante pode importar esse JSON localmente e o parser `src/services/quickshellLayoutImport.ts` extrai **apenas ID do tema, tipo de widget e geometria numérica**. Descarta caminhos privados, nomes de wallpapers completos, conteúdos de notas, imagens, URLs locais e propriedades desconhecidas. A projeção presume a tela de referência de **3440×1440** para converter pixels em porcentagens; não promete reconstituição perfeita de QML. Após importar, pode exportar `widget-layouts-publico.json` seguro.

**Publicação para outros visitantes:** `src/data/published-widget-layouts.json` está intencionalmente vazio enquanto o proprietário não fornecer o snapshot saneado. Somente após ele revisar e fornecer o JSON é correto publicá-lo no GitHub; o site poderá então renderizar as posições também para visitantes anônimos. A importação atual salva dados higienizados só no navegador local sob `portfolio.hyprland.sanitized.layout.v1`, sem backend ou upload automático.

**Custos e acessibilidade:** MP4 só monta após clique explícito, e apenas na aba Hyprland. A área de Configurações usa wallpaper estático. Mantidas proporções 3440×1440 / 1920×1080, botão de pausa, fallback para indisponibilidade de mídia e seletor acessível.

**Evidência:** `src/__tests__/quickshell-layout-import.test.ts`, `src/__tests__/hyprland-showcase.test.tsx`, além dos testes existentes de temas e configurações, com CI para TypeScript, testes, build e lint. **QA visual real e importação do arquivo privado ainda pendentes.**

## M6 — Editor funcional de widgets e Hiyuki corrigida (29/10/2026)

**Pedido:** o catálogo de widgets da aba Hyprland deixou de ser apenas uma vitrine. O visitante pode **arrastar do catálogo para a tela, clicar para adicionar, arrastar com mouse/touch para reposicionar, usar setas do teclado para movimentar (Shift + seta = passo maior), redimensionar com +/− e remover com × ou Delete**. A tela passa a ter mínimo de 960px e o comando **Ampliar desktop** abre uma visualização maior. Continuam disponíveis as proporções 3440×1440/1920×1080.

**Persistência:** o layout editável é **uma cópia do visitante, separada por tema**, guardada em `localStorage` sob `portfolio.viewer.widgets.v1:<tema>` com limite de 24 widgets. Nunca altera o arquivo original `wallpaper_widget_layouts.json` nem o snapshot público sanitizado `portfolio.hyprland.sanitized.layout.v1`. Se não existir cópia do visitante, a prévia parte das coordenadas QML importadas (se houver) ou da tela vazia. O visitante pode limpar sua cópia ou restaurar a referência mediante confirmação. O conteúdo dos widgets é uma representação funcional de **edição e posicionamento**, mas não execução do Quickshell real: não são fornecidos CPU, clima, notas privadas nem player conectado.

**Hiyuki — correção da mídia:** o proprietário informou o wallpaper específico `https://moewalls.com/anime/hiyuki-entrust-your-wishes-to-me-wuthering-waves-live-wallpaper/`. A referência anterior a `hutuki.mp4` / `hutuki.mp4.jpg` foi removida da prévia Hiyuki por **não representar a imagem escolhida**. O endereço MoeWalls fornecido é uma página e não um arquivo MP4 validado, portanto **não se inventa nem se embute um vídeo de terceiros**. A aba Hyprland mostra o link oficial indicado e o botão **Carregar wallpaper da Hiyuki**, que aceita arquivo local MP4/WebM/JPG/PNG/WebP (até 150 MB), exibindo essa mídia apenas na sessão do navegador via object URL, sem upload e sem publicar conteúdo de terceiros no GitHub.

Evidências: `src/components/DesktopWidgetEditor.tsx`, `src/services/visitorDesktopWidgets.ts`, `src/__tests__/desktop-widget-editor.test.tsx`, `src/__tests__/hyprland-showcase.test.tsx`. QA visual mouse/touch em navegador real ainda pendente. **Não declarar a réplica Quickshell pixel-perfect.**

## M6 — snapshot real do Quickshell recebido e integrado (29/10/2026)

**Concluído em branch de revisão — pendente conferência visual no Arch.** O proprietário enviou `wallpaper_widget_layouts.json` da pasta real `~/.config/illogical-impulse/` (o caminho anterior para `~/.config/quickshell/end4-pC/` era incorreto no PC dele).

O arquivo completo contém **19 perfis de wallpapers** e **268 widgets habilitados** entre os perfis, divididos em **Changli 4, Hiyuki 3, Emilia 3, Furina 2, Hsin 1, Hotline Miami 1 e 5 wallpapers não classificáveis automaticamente**. Os cinco últimos ficam na categoria **Outros wallpapers**, não são atribuídos a personagens sem evidência.

A publicação em `src/data/published-widget-layouts.json` preserva somente `themeId`, IDs genéricos de variante, rótulos neutros, nomes permitidos dos widgets, coordenadas normalizadas com base no monitor **3440×1440**, largura/altura disponíveis, `sizeMode`, `vertical` e `z`. **Nenhum caminho pessoal, nome de arquivo de imagem, nota, nome de usuário ou mídia original foi copiado para o GitHub.** Os cards que têm `cardWidth` e `cardHeight` preservam suas dimensões proporcionais exatas; demais widgets usam dimensões aproximadas quando o JSON não registra o tamanho físico (a aparência QML real depende do runtime).

O importador `quickshellLayoutImport.ts` antes utilizava `Map<theme,widgets>`, **sobrescrevendo versões anteriores**. Agora preserva uma variante por wallpaper e valida até 100 perfis sanitizados, inclusive `z`, `sizeMode` e orientação. No Hyprland, um seletor **Organização original por wallpaper** permite alternar layouts do mesmo tema, e o botão **Outros wallpapers** apresenta os perfis sem identificação segura. O editor do visitante guarda sua própria cópia em uma chave local **por tema + variante**, sem reescrever o snapshot público do autor.

Evidências automatizadas: `src/__tests__/real-published-layouts.test.tsx` valida 19 perfis, 268 widgets, variantes, geometria, camadas e ausência de caminhos pessoais, além dos testes de importação e edição. **Ainda pendente:** verificar escala, tamanho aproximado dos widgets não-card, assets e alinhamento da visualização com o desktop real em 3440×1440. Não afirmar réplica exata de QML, pois apenas a geometria cadastrada é real.

## Decisão final posterior — apenas coleção de temas prontos e escolha de cor (29/10/2026)

**Esta decisão substitui e cancela os fluxos de criação/edição discutidos nos marcos M4–M6**: o visitante NÃO pode duplicar/criar/nomear tema, editar widgets, arrastá-los, alterar ou salvar layouts, carregar arquivos de wallpapers, importar JSON de Quickshell, restaurar históricos ou personalizar imagens. Tudo isso saiu da interface pública. Os arquivos de dados e os módulos antigos ficam no repositório para referência histórica, mas não são expostos nem chamados pela nova experiência. Nenhuma configuração do Arch do autor deve ser modificada.

O projeto Hyprland-Themes agora abre uma **exposição inserida na própria página abaixo da constelação**, sem modal nem card flutuante sobre o site. São apresentados **cinco temas oficiais existentes** (Changli, Hiyuki, Emilia, Furina, Hotline Miami) e as composições originais disponíveis por tema, usando o snapshot público com coordenadas dos widgets. Os outros perfis já publicados continuam preservados como dados, mas não são apresentados como temas oficiais enquanto não forem identificados/confirmados.

**Transição:** ao trocar tema ou composição, o desktop de saída se desintegra **da direita para a esquerda** em uma camada com recorte animado, fragmentos luminosos de diferentes cores, revelando o novo desktop ao fundo. A abertura da exposição usa uma revelação horizontal integrada à seção, em vez de popup. Sem animação caso `prefers-reduced-motion: reduce`; nenhuma sobreposição interativa bloqueia mouse/teclado. A animação é CSS/DOM, não um espelhamento QML nem um efeito WebGL já implementado.

**Única personalização do visitante:** `Cor de destaque` (input color), persistida em `localStorage["portfolio.theme.accent.v1"]` e aplicada no CSS global, com botão para restaurar a cor oficial. Isso não altera os cinco JSON oficiais nem gera cópias ou temas personalizados. O ThemeProvider agora só aplica temas de `OFFICIAL_THEMES`; registros de temas personalizados antigos não são apagados, apenas deixam de ser usados pelo fluxo do usuário.

**Limites de fidelidade:** os wallpapers públicos Changli e outros verificados são referenciados conforme disponibilidade; o vídeo Hiyuki correto no MoeWalls não foi copiado, pois não existe URL direta validada e autorizada. Cards usam símbolos quando as imagens originais são privadas. Widgets QML têm posicionamento documentado, mas seus corpos visuais são aproximações HTML/CSS, não componentes QML executados.

**Verificação:** testes atuais cobrem ausência de interfaces de criação/edição, opção de cor, cinco presets, alternância de variantes, efeito de desintegração e fallback para movimento reduzido. Validação visual em navegador real ainda pendente.

## Correção de navegação — página exclusiva Hyprland-Themes (29/10/2026)

**Substitui a seção inline descrita acima.** A exposição de cinco temas prontos passa a existir em **`/hyprland-themes`**, rota própria no React Router, acessível diretamente por URL ou pelo projeto Hyprland-Themes no carrossel. **Não** aparece como card, modal, janela ou seção inserida na home. O retorno `Voltar aos projetos` navega para `/#projetos`, sem retirar o histórico de navegação do navegador. A página tem área principal própria com largura ampliada e animação de entrada por revelação da direita para a esquerda.

Continuam válidos: transição de desintegração da direita para a esquerda **entre temas**, cinco presets oficiais readonly e apenas seleção de cor de destaque. Widgets e layouts originais são somente visualização. Testes de rota cobrem acesso direto, entrada pelo carrossel e retorno. QA manual em produção deve confirmar que o servidor/CDN oferece fallback de SPA ao abrir `/hyprland-themes` diretamente (BrowserRouter).

## Changli — reprodução de referência 1914 × 862 em código (29/10/2026)

O proprietário enviou uma captura do **desktop Changli completo** e pediu que a página exclusiva `/hyprland-themes` exibisse **a mesma composição de widgets construída em React/CSS**, com a mídia adicionada por ele depois. Esta implementação é **posterior e prevalece** sobre as versões anteriores do Changli genérico. Em `src/components/HyprlandShowcase.tsx`, a renderização de `theme.id === "changli"` usa `src/components/desktop/ChangliDesktop.tsx`; **outros temas oficiais mantêm a implementação atual**, inclusive as transições de desintegração da direita para a esquerda.

A reprodução usa **11 regiões absolutas** seguindo a captura (notas, perfil, arte grande à esquerda, To-Do, marca Wuthering Waves, player, calendário, relógios mundiais, retrato à direita, clima e temporizadores), além dos **3 medidores** em coluna. Tudo é HTML/React com CSS de vidro translúcido, desfoque, bordas suaves, tons quentes e animação de fundo eventual. O calendário e os relógios utilizam a data/hora do navegador e fusos reais. Dados de CPU/RAM/Disco e meteorologia são **demonstrativos e explicitamente não conectados** a hardware ou API; player e timers são representações visuais readonly (o visitante só pode selecionar tema/cor).

**Nenhuma imagem da captura ou MP4 foi incorporado** ao projeto. O fundo CSS funciona sem assets; os slots de mídia exibem placeholders até o usuário fornecer os arquivos. Todos os caminhos são configuráveis em **`src/data/changliDesktop.ts`**, sob `changliDesktop.media`. As sete chaves são `backgroundVideo`, `backgroundImage`, `profileBanner`, `profileAvatar`, `featureArtwork`, `rightPortrait` e `brandArtwork`. As mídias futuras ficam em `public/assets/hyprland/changli/` e o guia com nomes e exemplos está em `public/assets/hyprland/changli/README.md`. Arquivos vazios não provocam requisições 404. O vídeo é **local**, reproduzido como `muted/loop/autoplay/playsInline` atrás de todos os widgets, com `backgroundImage` como poster/fallback. Sem URLs de wallpaper de terceiros, sem upload do visitante.

**Fidelidade visual:** a estrutura, as posições proporcionais e os vidros foram reconstruídos a partir da captura, mas o resultado **não pode ser pixel-perfect até o usuário fornecer as imagens e o vídeo** e até a validação real em 3440×1440. Para outras resoluções, os widgets escalam com a largura do canvas e o modo 16:9 ainda está disponível. Os layouts QML anteriores permanecem no dataset histórico intacto; a seleção de variantes Changli ficou oculta porque este novo layout é **a composição de referência única** decidida pelo proprietário. A criação/edição de temas por visitantes continua desabilitada.

Arquivos de implementação: `src/components/desktop/ChangliDesktop.tsx`, `src/styles/changli-desktop.css`, `src/data/changliDesktop.ts`, `src/components/HyprlandShowcase.tsx`, `src/styles/preset-theme-gallery.css`. Testes: `src/__tests__/changli-desktop-reference.test.tsx` e atualização dos testes de galeria. QA visual em navegador Arch pendente.

## Correção do efeito de troca — desintegração de verdade (29/10/2026)

A animação anterior `preset-wipe` usava `clip-path: inset(...)` e apagava o desktop inteiro como uma **cortina reta**, mesmo com 90 partículas decorativas. Isso **não** corresponde ao efeito solicitado.

A troca agora usa `ThemeDisintegration.tsx` e `theme-disintegration.css`:
- O desktop **novo** está inteiramente montado por trás desde o início.
- O desktop **antigo** é preservado numa camada HTML com máscara SVG dinâmica e **720 células independentes**, cada uma desaparecendo com atraso e duração distintos. A ordenação favorece o lado direito primeiro, mas ruído e variações por linha abrem **buracos espalhados**, sem uma borda vertical contínua.
- **260 fragmentos coloridos** surgem aproximadamente nas mesmas regiões e se desprendem, giram, dispersam-se e somem. São utilizadas quatro tonalidades derivadas das paletas envolvidas, incluindo luz quente; não é um efeito de partículas uniformes.
- Transição completa em cerca de 1,85 s, com limpeza via `animationend`. A máscara usa `mask-image: url(#...)`, suportada pelos navegadores modernos. Não exige screenshot de DOM, downloads externos ou novos pacotes.
- Para `prefers-reduced-motion`, a troca é imediata; não renderizamos as camadas animadas.
- A galeria permanece readonly e os wallpapers locais opcionais de Changli continuam sem alterações. Não substituir por `clip-path: inset(...)` novamente.

**Validação:** testes verificam 720 máscaras, variação dos tempos por linha, preferência temporal da direita para a esquerda, 260 peças em quatro tonalidades, remoção do DOM ao terminar, e ausência do `preset-wipe` antigo. A inspeção visual com GPU no navegador real ainda deve ser feita antes de considerar o efeito artisticamente finalizado.
