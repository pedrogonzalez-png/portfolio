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
# portfolio
