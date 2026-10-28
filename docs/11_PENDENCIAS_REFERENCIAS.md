# 11 — Pendências reais, fontes e limites do conhecimento

## O que já está definitivamente escolhido

- Portfólio 3D cinematográfico, partícula-nome, reação ao cursor imóvel, constelação de hologramas, scroll magnético suave, expansão do próprio painel, árvore de skills, Sobre/Contato, menu top, terminal/vis/code real, commits e grafo 3D opcional, som adaptativo opt-in, mobile adaptativo.
- Tema Changli padrão + quatro oficiais Hiyuki/Emilia/Furina/Hotline Miami; troca de paleta global; wallpapers MP4 só no Theme Studio.
- Projetos-alvo Abismo jogável, site-3D experimentável, Hyprland-Themes galeria/Studio. `dotfiles-Arch` excluído. Aprovação manual de outros repositórios; só finalizados na constelação.
- Theme Studio visual de desktop Linux: imagens independentes de personagem são cards, demais instrumentos são widgets, grande imagem do fundo é wallpaper. Gallery+import local; cards múltiplos; pos. híbrido; adicionar elementos arrastando ou clicando; editor mobile paisagem recomendado/vertical permitido.
- Widgets visualmente fiéis com funções locais simples; modo original + avançado opt-in; agrupamento proportional/reflow; layout híbrido por wallpaper; adaptação por resolução com overrides; biblioteca mídia compartilhada; autosave/versionamento automático+manual; export/import local; exclusão segura de arquivos referenciados.
- IA/assistente retirada; novos minijogos adiados; sem arquitetura de Linux funcional no browser.

## Perguntas em aberto realmente importantes — NÃO BLOQUEAR trabalho independente

| Pendente | Por que importa | Quando resolver |
|---|---|---|
| Nome **exato de exibição** e cargo | texto do hero e SEO | antes do M1 publicar |
| Texto Sobre Mim e contato (links/autorização de email) | conteúdo final verdadeiro | antes de M7; placeholders marcados antes |
| Projetos realmente **finalizados** | regra de constelação | antes de featured público no M2 |
| Lista de repos permitidos no terminal além dos candidatos | evitar publicação automática | antes do M3 indexar |
| URLs de deploy do Abismo e site-3D | demos precisam rodar sob host aprovado | M2 |
| Licenças/arquivos de wallpapers, personagens, vídeos e música | direitos/autorização e desempenho | antes de usar assets em M2/M5 |
| Host/dominio escolhido | regras de rotas/cross-origin/storage de saves | M0/M2 |
| Detalhes de perfis/cor individuais dos widgets | visitante interrompeu seleção de herança de cores; não está aprovado | M6 se fizer falta; default herdar tema |
| Exportar tema instalável para Linux real | **não** confirmado, diferente de exportar backup portátil | não incluir no plano inicial |
| Teclas do Abismo/mobile/estado de conclusão | garantir uso real e evitar sobrescritas | M2 antes de anúncio final |
| Lista exata de skills dominadas e evidências | árvore não deve mentir | M1/M7 |

Não transformar estes pontos em dezenas de perguntas para o usuário. Usar placeholders honestos e avançar em tarefas não bloqueadas. **O proprietário pediu explicitamente que o escopo pare de crescer.**

## Repositórios reais verificados em 27/10/2026 (fontes GitHub)

### `https://github.com/pedrogonzalez-png/jogo-site`

- `package.json`: Phaser `^4.2.1`, Vite `^8.3.0`, JS ESM, teste `node --test`.
- `src/main.js`: Phaser.AUTO 1280×720, Arcade physics, BootScene, MainMenuScene, GameScene.
- `README.md`, `GEMINI.md`: regras do Abismo, documentos, pendências de QA; não reescrever com React.
- Antes de modificá-lo, ler `docs/ANTIGRAVITY_LEIA_PRIMEIRO.md`, GDD e plano QA deste repo. Status final não verificado.

### `https://github.com/pedrogonzalez-png/site-3D`

- `package.json`: React `^19.2.8`, Vite `^8.2.0`.
- `src/App.jsx`: seleção por roleta em arco com wheel, conteúdo de personagem, vídeos intro/idle, campo de busca.
- `src/charactersData.js`: assets de imagens e vídeo `.webm` importados. README template; finalização/licenças dependem de auditoria. Não declarar que roda Three.js/WebGL.

### `https://github.com/pedrogonzalez-png/Hyprland-Themes`

- `end4-pC/{changli,hiyuki,emilia,furina,hotline-miami}.json`: paletas oficiais (incluem `dark`, `light`, acentos, cores de terminal).
- `README.md`: cinco temas, instaladores, Fastfetch, alterações do Quickshell, aviso de que wallpapers e artes de personagens **não são distribuídos** no repo.
- `overrides/end4-pC/services/WallpaperLayouts.qml`: perfis de layout por wallpaper, lista de widgets, propriedades `x/y/z`, dimensões, rotação, ativação/restauração e proteção de autosave em caso de restauração incompleta.
- `overrides/end4-pC/modules/ii/wallpaperSelector/AnimatedWallpaperGrid.qml`: recursos nativos para wallpapers animados.
- Commit base pinado do end4-pC: `8fbb6716cba628a13103e665e9538021683a7250` (confirmado no README do repo do proprietário). Comparar QML nessa ref e patch do repo próprio.
- `https://github.com/pctrade/end4-pC/tree/8fbb6716cba628a13103e665e9538021683a7250/modules/ii/background/widgets`: diretórios e widgets reais; clock `cookie/digital/daily/pixel`, media, calendar, weather, resources, images, usercard, todo, notes, timers, customtext etc.
- Captura de tela fornecida: `../referencias/desktop-linux-referencia.png`.

## Referências públicas técnicas (acessadas em 27/10/2026)

- React Three Fiber v9 + React 19: `https://r3f.docs.pmnd.rs/getting-started/installation`.
- Vite deployment e GitHub Pages base: `https://vite.dev/guide/static-deploy`.
- GitHub REST unauthenticated limit: `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` (limite primário usual 60 requisições/hora por IP; sujeito a políticas de GitHub).
- MDN quotas/eviction/storage persist: `https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria`.
- Referências de estética, NÃO para copiar: `https://oryzo.ai/`, `https://www.igloo.inc/`, `https://activetheory.net/`.

## Honestidade de status

Este pacote registra requisitos e verificações estáticas de arquivos públicos do GitHub. **Não foram executados builds, testes nem demos dos projetos neste trabalho documental; não foi criado código do portfólio.** Interfaces e APIs propostas só existem como especificação. O agente precisa comprovar sua implementação no ambiente real e no navegador.

## Regras de revisão da especificação

- Qualquer alteração de comportamento aprovado só mediante decisão explícita do proprietário; anotar em changelog de requisitos.
- Questões técnicas podem receber decisão pragmática se preservarem experiência e respeitarem critérios de aceite; documentar justificativa.
- Não interpretar recomendações que o assistente apresentou mas o usuário não selecionou como decisões aprovadas (por exemplo: exportador instalável de Linux, paletas individuais por widget, novas mini-games).
- Não colocar conteúdo particular ou dados pessoais do Linux sem consentimento; screenshots só como material de referência interna até autorização.
