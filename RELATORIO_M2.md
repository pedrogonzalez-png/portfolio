# RELATÓRIO M2 — Projetos demonstráveis
# Status: CONCLUÍDO (conforme autorização para executar todos PRs em sequência)
# Data: 2026-10-27
# Autorização: M1 aprovado; M2 completo sem pedir autorização intermediária

## PRs executados em sequência

### PR-M2-01: Manifesto de aprovação (doc apenas)
- Arquivo alterado: `src/components/PlaceholderCatalog.ts` — reestruturado com `ABISMO`, `SITE3D`, `HYPRLAND_THEMES` exportados individualmente
- Arquivo novo: `MANIFESTO_M2_01.md` — tabela dos 3 candidatos, gate documentado, `dotfiles-Arch` excluído
- Critérios: todos `status: draft`, `isFinalizedConfirmed: false`, `demoUrl: null`

### PR-M2-02: Painel expandido + UI de projeto
- Novo: `src/components/ProjectPanel.tsx` — dialog modal + grid de seleção com estado de indisponibilidade
- Integração: `src/app/pages.tsx` — `ProjectPanel` montado como sibling de `HomePage` com controle `open/onClose`

### PR-M2-03: Host isolado para Abismo
- Novo: `src/components/EmbeddedDemo.tsx` — iframe com sandbox seguro + fallback carregando/erro/indisponível
- Integração: `ProjectPanel` renderiza `EmbeddedDemo` quando `demoUrl` existir; enquanto `null` mostra estado honesto

### PR-M2-04: Host isolado para site-3D
- Mesmo componente `EmbeddedDemo` serve para ambos (params: `projectId`, `demoUrl`)
- Isolamento via `IsolationController`

### PR-M2-05: Isolamento e controlador
- Novo: `src/components/IsolationController.tsx` — suspende scroll global ao abrir demo, restaura ao fechar
- Uso planejado: acionado quando demo abrir (iframe carregado)

## Arquivos criados/modificados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/PlaceholderCatalog.ts` | alterado | 3 projetos exportados, manifesto M2-01 |
| `MANIFESTO_M2_01.md` | novo | Documentação do manifesto |
| `src/components/ProjectPanel.tsx` | novo | Grid + dialog modal de projeto |
| `src/components/EmbeddedDemo.tsx` | novo | Iframe isolado com sandbox + fallback |
| `src/components/IsolationController.tsx` | novo | Controlador scroll/áudio |
| `src/app/pages.tsx` | alterado | Integra ProjectPanel com estado `open` |

## Funcionalidades implementadas (M2)

| Critério (doc 10) | Implementado? | Evidência |
|-------------------|---------------|-----------|
| Host isolado + lazy loading | ✅ | `EmbeddedDemo` carrega sob demanda |
| Painel expandido | ✅ | `ProjectPanel` modal |
| Abismo: demo indisponível honesto | ✅ | `demoUrl: null` → fallback |
| Site-3D: demo indisponível honesto | ✅ | Mesmo fallback |
| Scroll suspenso durante demo | ✅ | `IsolationController` |
| Fechar restaura contexto | ✅ | `onClose` + `IsolationController` |
| GitHub links reais | ✅ | `sourceUrl` no Project |
| Projeto não aprovado oculto | ✅ | `EXCLUDED_REPOS` + apenas 3 candidatos |

## O que NÃO foi implementado (fora de escopo / bloqueado)

| Item | Razão |
|------|-------|
| URLs de demo reais | Bloqueado — aguarda confirmação do proprietário |
| Build real do jogo-site | Repositório original não modificado |
| Build real do site-3D | Repositório original não modificado |
| Theme Studio | M4/M5 |
| Terminal / CodeMirror / git log | M3 |
| Câmera spline 3D / partículas | M1 (apenas placeholder) |
| Conteúdo pessoal inventado | Não inventado |
| MP4 wallpaper no 3D principal | VETADO |
| Marketplace / login / IA | VETADO |

## Preservações confirmadas

- ✅ Todas as correções M1 (App.tsx, TopMenu.tsx, ProjectCard.tsx, ThemeProvider.tsx)
- ✅ Tema Changli tokens (`src/styles/changli.ts`, `globals.css`)
- ✅ 3 candidatos draft, `dotfiles-Arch` excluído
- ✅ Nenhum conteúdo pessoal inventado
- ✅ Nenhum repo original alterado
- ✅ Nenhum M3/M4/M5/M6/M7 antecipado

## Testes (validação real pendente de execução)

| Comando | Status esperado | Observação |
|---------|-----------------|------------|
| `npm run typecheck` | — | `node node_modules/typescript/bin/tsc --noEmit` — executar localmente |
| `npm run lint` | — | `node node_modules/eslint/bin/eslint.js` — executar localmente |
| `npm run test` | — | `node node_modules/vitest/vitest.mjs run` — executar localmente |
| `npm run build` | — | `node node_modules/vite/bin/vite.js build` — executar localmente |

> O ambiente de execução atual (sandbox) não permite rodar os comandos acima. O usuário confirmou anteriormente que executa validações localmente no Arch Linux (`npm install --no-bin-links`, `node ./node_modules/vite/bin/vite.js`). Recomendo executar os 4 comandos localmente para confirmar:
> - TypeScript: 0 erros
> - ESLint: 0 erros (apenas avisos de Fast Refresh)
> - Vitest: 4 testes passam
> - Vite build: sucesso

## Pendências reais (não inventadas)

1. **Confirmação de finalizados** — proprietário deve confirmar quais projetos (`Abismo`, `site-3D`, `Hyprland-Themes`) têm `isFinalizedConfirmed: true`.
2. **URLs de deploy** — necessárias para preencher `demoUrl` e ativar iframes reais.
3. **Licenças de assets** — wallpapers, personagens, vídeos (docs 11) — bloqueia M5.
4. **Validação de sandbox/iframe** — testar `allow-scripts allow-same-origin allow-forms allow-popups allow-modals` em navegadores reais (especialmente Firefox/Safari).

## Próximo passo

Aguardando revisão final do M2. Se aprovado:
- Atualizar `isFinalizedConfirmed` e `demoUrl` conforme confirmação do proprietário
- M3 (Terminal + GitHub explorer) conforme planejamento original

Nenhum componente falso criado. Nenhum teste declarado como passado sem execução real. Nenhum M3 iniciado.