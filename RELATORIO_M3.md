# RELATÓRIO M3 — Revisão técnica (28/10/2026)

## Situação: IN_PROGRESS — terminal e GitHub reais integrados; M3 completo ainda não aprovado

O relatório anterior chamava o M3 de concluído, apesar de `cat`, `git log` e `git diff` retornarem texto fictício e o Terminal não estar na home. Essa inconsistência foi corrigida nesta branch.

## Implementado nesta rodada

- `src/services/githubReadonly.ts`: acesso **somente de leitura** à API pública do GitHub, limitado à allowlist do `PlaceholderCatalog`. Descobre branch padrão e árvore real, lê blobs pelo SHA, lista commits e carrega diffs/commits sob demanda. Cache de 5 minutos, limite de árvores e arquivos (128 KB), timeout, mensagens para 404/403/offline e índices parciais.
- `src/components/Terminal.tsx`: terminal simulado com saída de **fontes reais**, não shell do sistema; `git log [página]` permite até dez páginas. `repos`, `open`, `ls`, `cd`, `pwd`, `cat`, `code`, `tree`, `find`, `git log/show/diff`, `help`, `whoami`, `neofetch`, `history`, `clear` e `goto`.
- `src/app/pages.tsx` e `TopMenu.tsx`: terminal acessível por botão e `Ctrl+\``, carregamento lazy; modal com Escape, restauração de foco, bloqueio de rolagem e viewer lateral `CodeMirror`.
- `src/styles/terminal.css`: aparência Kitty/Changli e adaptação para telas menores.
- `src/components/RepositoryExplorer.tsx`: árvore de arquivos, busca local por nome, breadcrumbs, abas fecháveis e timeline de commits reais.
- `src/components/SafeMarkdownPreview.tsx`: renderização segura limitada de Markdown, usando apenas texto/JSX escapado.
- `src/components/CodeMirror.tsx` e `codeLanguages.ts`: gramáticas lazy por extensão, realce de tokens Changli, numeração de linhas, fallback para texto simples. Dependências declaradas no `package.json` e `package-lock.json`.
- `src/services/githubReadonly.ts`: leitura retorna também o SHA do blob e histórico paginado.
- Testes `src/__tests__/github-readonly.test.ts`, `repository-explorer.test.tsx`, `markdown-preview.test.tsx` e `code-languages.test.ts` para allowlist, traversal, SHA, árvore, busca, abas, timeline, proteção contra XSS e gramáticas por extensão.

## Bloqueios / ainda não implementado

- **Árvore lateral, busca, breadcrumbs e até sete abas readonly: implementados nesta revisão**, com acesso por clique e comando `code` ao mesmo conteúdo da API GitHub.
- **Preview Markdown básico seguro: implementado**, sem injeção de HTML/JS ou imagens externas; suporta títulos, parágrafos, listas simples, citações, separadores, blocos de código e negrito/inline-code. Não promete compatibilidade completa com GitHub Flavored Markdown.
- **Linha do tempo de commits reais: implementada parcialmente**, com paginação limitada a dez páginas, doze commits por página, detalhamento `git show` sob demanda. A curadoria manual de marcos e sincronização completa com o terminal ainda não foram feitas.
- **Gramáticas sob demanda implementadas** para JavaScript, TypeScript, JSX/TSX, CSS, HTML e Markdown, com realce de tokens no tema Changli e numeração de linhas. JSON recebe realce básico usando parser compatível com JavaScript (não é um validador de JSON estrito). A revisão visual da coloração e cobertura das gramáticas permanece pendente.
- Grafo de commits 3D e objeto terminal integrado à cena 3D; dependem de maturidade da UI.
- Índice estático gerado **opcionalmente no CI** a partir da mesma allowlist JSON do catálogo (`src/data/approved-repos.json`) com até 4.000 entradas por projeto. O navegador prioriza o índice validado (máximo 90 dias) e recorre à API GitHub quando ausente, expirado ou inválido. Não inclui conteúdo de arquivos, apenas caminhos e SHAs, e não libera repositórios adicionais. CI não deve falhar se a API de terceiros estiver indisponível.
- Teste manual completo no navegador do proprietário, rede offline/rate limit real e acessibilidade com leitor de tela.
- Qualquer demo de Abismo/site-3D continua sem URL publicada autorizada; M2 ainda tem gate pendente.

## Segurança e preservações

- Nenhum `eval`, `fetch` de URLs arbitrárias digitadas pelo visitante, execução do shell, autenticação ou token no navegador.
- Não liberar `dotfiles-Arch` nem qualquer repositório fora da allowlist.
- Nenhum repositório de projeto original alterado; nenhum conteúdo de pessoa inventado.
- Carrossel 3D, vidro e nome de partículas preservados na branch do PR #3.

## Validação

GitHub Actions é a fonte de evidência para TypeScript, testes, build e lint. Não considerar `DONE` até CI verde **e** validação manual do fluxo no navegador.

## Próxima tarefa M3

Conferir visualmente árvore, abas, Markdown, syntax highlighting e histórico no Arch. Em seguida, verificar que o índice gerado está presente no build implantado e revisar acessibilidade, históricos e curadoria. Não marcar M3 `DONE` antes da validação manual.
