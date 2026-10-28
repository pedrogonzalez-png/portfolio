# MANIFESTO M2-01 — Atualização do catálogo de projetos
# PR: M2-01 (Manifesto — apenas documentação; sem URLs falsas)
# Data de atualização: 2026-10-27
# Status: DOCUMENTAÇÃO APENAS — nenhum PR-M2-02 iniciado

## Fontes

- docs/05_PROJETOS_EXECUCAO.md (política catálogo, projetos candidatos)
- docs/01_PRODUTO_ESCOPO.md (exclusão expressa de dotfiles-Arch)
- docs/11_PENDENCIAS_REFERENCIAS.md (status de conclusão dos repos verificados em 27/10/2026)
- docs/10_ROADMAP_CRITERIOS_ACEITE.md (gate obrigatório M2)

## Candidatos aprovados (featured / constelação 3D)

Todos permanecem com `status: draft` e `isFinalizedConfirmed: false` até confirmação explícita do proprietário. Nenhuma URL `demoUrl` inserida.

| Projeto | ID | Repo | Status | Confirmado? | Demo URL |
|---------|----|------|--------|-------------|----------|
| Abismo | abismo | `pedrogonzalez-png/jogo-site` | draft | ❌ Não | `null` |
| site-3D | site-3d | `pedrogonzalez-png/site-3D` | draft | ❌ Não | `null` |
| Hyprland-Themes | hyprland-themes | `pedrogonzalez-png/Hyprland-Themes` | draft | ❌ Não | `null` |

Observação: todos os três foram apontados como candidatos desejados pelo proprietário (`featured: true`), mas nenhum tem conclusão confirmada. Nenhum deve ser publicado como `approved` sem a confirmação expressa.

## Exclusão expressa (não alterada)

`dotfiles-Arch` — definitivamente EXCLUÍDO do catálogo `featured` e do catálogo `explorer` (decisão explícita conforme docs 01, 05, 11).

## Repositórios verificados em 27/10/2026 (não alterados)

- `pedrogonzalez-png/jogo-site` — `package.json`: Phaser `^4.2.1`, Vite `^8.3.0`, JS ESM; `README.md` e `GEMINI.md` indicam que QA exaustivo ainda é pendente.
- `pedrogonzalez-png/site-3D` — React `^19.2.8`, Vite `^8.2.0`, JSX; roleta com vídeos `intro/idle`; `README.md` ainda é template padrão.
- `pedrogonzalez-png/Hyprland-Themes` — cinco temas oficiais (`changli.json`, `hiyuki.json`, `emilia.json`, `furina.json`, `hotline-miami.json`); sem assets de wallpaper distribuídos.

Nenhum arquivo desses repositórios foi alterado pelo portfólio.

## Nenhuma URL de demo inserida

Conforme instrução: sem URLs falsas. Os campos `demoUrl` permanecem `null` até que o proprietário confirme:
- Quais projetos estão finalizados
- Onde estão hospedados (Vercel provisório? outro host?)
- Qual a origem (`sandbox` iframe vs rota incorporada)

## Nenhuma funcionalidade do M2 implementada neste PR

Este PR contém APENAS a atualização do manifesto/documentação. Não inclui:
- Nenhum componente `ProjectPanel`, `EmbeddedDemo`, `IsolationController`
- Nenhum iframe ou rota incorporada
- Nenhuma integração de jogo real
- Nenhum acesso a repositórios públicos não aprovados
- Nenhum conteúdo pessoal inventado
- Nenhum MP4 de wallpaper no 3D principal
- Nenhum Theme Studio, terminal, editor de código ou grafo 3D
- Nenhum marketplace, login, multiplayer, IA, minijogos extras, auto-catálogo, exportador Linux

## Próximos passos após revisão (não executados sem autorização)

1. Confirmar `isFinalizedConfirmed` para cada candidato.
2. Confirmar host/domínio e URLs de deploy.
3. Se confirmados: atualizar `demoUrl` e avançar para PR-M2-02 (UI expandida).
4. Se não confirmados: manter `draft` e apenas documentar; nenhuma URL publicada.
