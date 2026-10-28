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
