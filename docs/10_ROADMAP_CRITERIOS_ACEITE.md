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
