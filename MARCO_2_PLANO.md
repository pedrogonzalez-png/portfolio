# PLANO M2 — Projetos demonstráveis
# Status: PLANEJAMENTO (não iniciado — aguarda revisão após M1)
# Autorização M1: confirmada pelo proprietário
# Restrição: NÃO AVANÇAR PARA M3 antes de conclusão/revisão M2

## Referência canônica

- docs/05_PROJETOS_EXECUCAO.md (política catálogo, Abismo, site-3D, Hyprland-Themes, integração, segurança)
- docs/10_ROADMAP_CRITERIOS_ACEITE.md (M2 — definição, gate, aceite)
- docs/03_STACK_ARQUITETURA.md (lazy loading, host isolado, CSP)
- docs/09_QUALIDADE_TESTES.md (matriz mínima de teste)

## Escopo M2 (DECIDIDO — apenas isto)

1. **Host isolado + lazy loading:** painel de projeto expande; conteúdo carrega sob demanda (iframe isolado ou rota incorporada); não importa módulos Phaser/React do jogo na raiz do portfólio.
2. **Abismo (jogo-site):** confirmar se `isFinalizedConfirmed` (ainda `false` — manter `draft` até proprietário confirmar); verificar build (`npm run build` no repo); testar `dev`/`preview` manual; documentar se iframe ou rota própria é viável.
3. **Site-3D:** confirmar `isFinalizedConfirmed`; verificar build; testar roleta + vídeos; documentar codecs e tamanho antes de deploy.
4. **UI de projeto expandido:** painel gira/alinha (mimic da constelação M1); estado de foco; botão de retorno; loading/erro; `ESC` retorna ao host (não captura do jogo).
5. **Isolamento:** scroll da cena 3D suspenso enquanto demo ativa; áudio do portfólio reduzido/pausado; ao fechar, restaurar contexto.
6. **Segurança:** não embutir código executável; conteúdo GitHub do terminal permanece readonly; nenhuma alteração em `jogo-site` ou `site-3D` sem aprovação.

## Fora de escopo M2 (VETADO ou M3+)

- ❌ Theme Studio (M4/M5)
- ❌ Terminal / explorer / CodeMirror / git log / grafo 3D (M3)
- ❌ Novos minijogos, multiplayer, IA (doc 01 — VETADO)
- ❌ Auto-catálogo GitHub (doc 11 — VETADO)
- ❌ Exportador instalável Linux (doc 11 — VETADO)
- ❌ Alterar config Arch real do proprietário (doc 01 — VETADO)

## Critérios de aceitação M2 (doc 10 — copiados literalmente)

- [ ] Abismo inicia: vê menu do jogo e joga, sem página externa, no desktop suportado.
- [ ] Abismo salva: save persiste conforme comportamento do jogo (IndexedDB na origem do jogo, NÃO compartilhado entre origens).
- [ ] Teclas de jogo: não disparam scroll/atalhos globais enquanto jogo ativo.
- [ ] Site-3D abre: roleta, seleção e vídeos funcionam sem arrastar câmera.
- [ ] Fechar demos: retorno suave ao painel/local; sem áudio/vídeo oculto consumindo recursos.
- [ ] GitHub links: URL real para repo correspondente; projeto não aprovado fica oculto.

## Gate obrigatório (doc 05 — NÃO PULAR)

Antes de publicar qualquer projeto como `featured`:
- [ ] Proprietário confirma quais candidatos estão finalizados (`Abismo`? `site-3D`? `Hyprland-Themes`?).
- [ ] Se NÃO confirmados: manter como `draft` no catálogo; não publicar URL pública; apenas mostrar placeholder com aviso honesto.
- [ ] Se sim: `isFinalizedConfirmed = true`; atualizar `lastReviewed`; validar `demoUrl`.

> Aviso: os repositórios `jogo-site` e `site-3D` foram verificados em 27/10/2026. Nenhum deles tem `status: approved`. Ambos permanecem `draft` até confirmação.

## Plano de PRs (pequenos, sequenciais)

1. **PR-M2-01: Manifesto de aprovação atualizado** (apenas documentação — confirmar status atual dos 3 candidatos; `dotfiles-Arch` excluído; sem URLs falsas).
2. **PR-M2-02: Painel expandido + UI de projeto** (estrutura visual; sem iframe ainda; apenas layout e estados de transição).
3. **PR-M2-03: Host isolado para Abismo** (iframe ou rota; verificar build do jogo separadamente; documentar riscos de `sandbox`/same-origin; não importar Phaser no portfólio).
4. **PR-M2-04: Host isolado para site-3D** (mesmo padrão; verificar vídeos; lazy load; código e vídeos permanecem no projeto original).
5. **PR-M2-05: Validação manual + testes** (playwright quando disponível; verificação manual de teclado, foco, retorno, som suspenso, memória/GPU; não inventar screenshots — apenas registrar se executado).

Cada PR contém: escopo/referência ao doc, arquivos alterados, testes executados/pendentes, como rodar, impactos, limitações, link para demo (quando existente).

## Testes planejados (evidências reais, não inventadas)

- Manual: abrir cada painel → verificar transição; abrir demo → verificar isolamento; ESC/Voltar → verificar retorno; teclado no jogo → verificar que não move câmera; mobile → verificar aviso vertical (Theme Studio) e adaptação.
- Script: `npm run build` no repositório `jogo-site` (não reescrever o jogo — apenas verificar se build funciona); mesmo para `site-3D`.
- Playwright: quando disponível, testes de navegação e foco (não simular jogabilidade — apenas verificar que a página não quebra).
- Se algum teste não for executado: registrar `NÃO EXECUTADO — ambiente/rede/limite` com razão clara.

## Dependências bloqueantes (não avançar sem resolver)

- [PENDING] Confirmação do proprietário: quais projetos estão `finalized`?
- [PENDING] URLs de deploy confirmadas (Vercel provisório? outro host?) — necessário para iframe/rota.
- [PENDING] Licença de assets (wallpapers, vídeos, personagens) — bloqueia M5, mas deve ser registrado em M2.
- [PENDING] Status de conclusão real de Abismo e site-3D (não assumir por `README` template).

## Preservações obrigatórias (não alterar)

- ✅ `dotfiles-Arch` excluído (doc 01, 05, 11).
- ✅ 3 candidatos (`Abismo`, `site-3D`, `Hyprland-Themes`) — ainda `draft`.
- ✅ Nenhum conteúdo pessoal inventado (nome, bio, skills, links).
- ✅ Nenhum MP4 como wallpaper no 3D principal.
- ✅ Nenhuma alteração nos repos originais (`jogo-site/`, `site-3D/`, `Hyprland-Themes/`).
- ✅ Nenhuma funcionalidade de M3/M4/M5/M6/M7 antecipada.
- ✅ Nenhum marketplace, login, multiplayer, IA, minijogos extras, auto-catálogo.

## Evidências exigidas na entrega M2

1. Arquivos criados/modificados (lista real).
2. Funcionalidades implementadas (comparar com critérios M2 acima).
3. Resultados de `npm run build` no portfólio + no `jogo-site` + no `site-3D` (separados).
4. Testes manuais executados (sim/não; se não, razão).
5. Capturas de tela (se navegador disponível; se não, registrar).
6. Problemas encontrados (ex.: `sandbox`, `same-origin`, `fullscreen` bloqueado, `reduced-motion`, mobile vertical).
7. Comparação com critérios de aceitação.
8. Confirmação: M3 NÃO iniciado; M4/M5/M6/M7 NÃO iniciados.
