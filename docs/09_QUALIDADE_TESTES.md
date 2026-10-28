# 09 — Qualidade, acessibilidade, mobile, performance e segurança

## Princípio geral

Este portfólio só estará pronto quando for **usável, rápido, correto e acessível**, além de bonito. Uma animação perfeita não compensa página travada, conteúdo ilegível, demo que não carrega ou tema que perde dados. Testar com dispositivos reais, não apenas build/CI.

## Alvos de desempenho [PROPOSTO, medir e ajustar]

- Desktop razoável: buscar experiência próxima a **60 FPS** durante exploração, medindo frametime e evitando quedas perceptíveis em transições. Não prometer em todos dispositivos.
- Mobile intermediário: atingir interações confortáveis; adaptar alvo efetivo próximo a **30–60 FPS** conforme capacidade e bateria; priorizar responsividade sobre efeito visual.
- Evitar long tasks, layout thrashing e retenção de vídeos/iframes quando invisíveis; medir memória e GPU periodicamente em perfis de desenvolvimento.
- Orçamentos iniciais a calibrar com testes: DPR máximo adaptativo; LOD progressivo; partículas instanciadas; textura compressa; importação lazy do Phaser/site-3D; assets sem preload indiscriminado.
- Testar cold load com network throttling e cache vazia; hero legível antes da cena completa; não bloquear contato/GitHub enquanto WebGL carrega.

## Estratégia de graceful degradation

1. WebGL robusto disponível: cena completa, partículas densas ajustadas, vidro e reações.
2. GPU modesta/mobile: reduzir partículas/postprocessing/reflexos, qualidade de blur/sombras e resolução interna, preservando texto e navegação.
3. Reduced motion: câmera com transições mínimas ou navegação alternativa direta, intro estática e efeitos menos intensos; **todo conteúdo permanece acessível**.
4. Sem WebGL/context lost: HTML funcional com hero, projetos, skills, GitHub links e contato. Theme Studio pode continuar como UI 2D.
5. Offline/rate-limit GitHub: mensagens honestas, índice cacheado quando válido, links originais e estados de erro sem tela em branco.
6. Browser sem suporte MP4/codec: aviso e imagem/poster estático alternativo; não travar editor.

## Acessibilidade

- Semântica HTML para links/menu/terminal/editor; não depender só de canvas para nomes/descrições/contato.
- Foco visível, tab sequence estável, labels, atalhos documentados, escape/back consistente, role/dialog e focus trap apenas dentro de modais quando adequado.
- Não capturar scroll/teclas de terminal, CodeMirror, Abismo, site-3D ou Theme Studio para mover câmera 3D.
- Contraste de texto normal alvo WCAG AA na UI sempre que viável, mesmo ao personalizar paleta; alertar sobre combinações ilegíveis.
- `prefers-reduced-motion`, som opt-in, controle de volume, botão de mutar evidente; evitar flashes rápidos e efeito que cause náusea.
- Mobile com alvos tocáveis generosos, editor pode ser usado com telefone deitado, mas vertical não bloqueado; aviso apenas dentro do criador.
- Zoom do navegador: controles e textos sobrevivem 200% quando praticável; não travar viewport.
- Imagens têm alt text de conteúdo ou são decorativas corretamente marcadas.

## Matriz de dispositivos

| Cenário | Validar |
|---|---|
| Desktop 3440x1440 | constelação e Theme Studio sem esticar elementos |
| Desktop 1920x1080 | foco legível, cards e UI adaptados |
| Notebook 1366x768 | overlay não transborda; terminal utilizável |
| Android retrato | portfólio funciona; editor alerta que horizontal é melhor |
| Android paisagem | editor com painéis recolhíveis, toque e drag sem conflito |
| iOS Safari retrato/paisagem | storage, vídeos, gestos, aviso e fallback quando codecs limitados |
| `prefers-reduced-motion` | navegação sem animações obrigatórias |
| Sem suporte WebGL | acesso a conteúdo/contact |
| Rede lenta/offline parcial | estados de loading/erro e retries sem bloqueio |

## Plano de testes automatizados

- **Unitários (Vitest):** parser terminal permitido/negado, normalização de caminhos, tema tokens e contraste básico, geometria dos layouts e overrides responsivos, referência de mídia, dedupe, migrações schema, cálculo de grupos proportional/reflow, undo/redo, troca de perfis de wallpaper.
- **Componentes (React Testing Library):** cinco temas imutáveis, cópia editável, painel de propriedades, gerenciador camadas, modal de exclusão de mídia referenciada, aviso mobile, estados de erro.
- **E2E (Playwright):** scroll/abertura/retorno de painel; trocar tema sem resetar câmera; abrir Abismo/site-3D em mock/controlado e verificar isolamento de wheel/keyboard; terminal `ls/cd/cat/code`; snapshots/version/export/import; mobile orientações; fallback sem WebGL.
- **Visuais:** screenshots comparativos com desktop original do proprietário, por tema e widget; tolerâncias de diferenças documentadas. Não usar snapshot generativo como única evidência de fidelidade.
- **Acessibilidade:** axe em menus, modais, forms, editor, overlays de demo, leitura por teclado; testes manuais com leitor de tela.
- **Segurança:** XSS via Markdown/nomes de arquivos, path traversal em comandos/import ZIP, mime spoofing, iframe CSP, URLs maliciosas, oversized repos/arquivos/assets, quotas IndexedDB.

## Lista de testes manuais indispensáveis

1. Da página inicial até o contato sem mouse, apenas teclado.
2. Cursor parado sobre letras gera desagregação só quando desejado; não pisca repetidamente.
3. Abismo realmente jogável com controle e salvamento adequado na origem, quando disponível; se não, registrar **não testado** ou **falhou**.
4. site-3D executa roleta de personagem, busca e vídeos reais; scroll interno não afeta a câmera do portfólio.
5. Tema Changli → Hiyuki muda partículas, vidro, menus, editor e skills; jogo aberto não é reiniciado indevidamente.
6. Criar tema, importar duas imagens, criar quatro cards e três widgets, organizar e salvar; recarregar browser preserva.
7. Trocar wallpaper recupera layout, depois mudar resolução e retornar mantém overrides.
8. Criar versão nomeada, alterar layout, restaurar versão; arquivo de mídia ainda existe.
9. Tentar excluir arquivo compartilhado ainda referenciado: bloqueio e dependências visíveis.
10. Simular quota excedida durante autosave: alerta, sem afirmar sucesso e sem corromper última versão.
11. Sem WebGL/reduced motion: currículo, links e projetos continuam acessíveis.

## Logging e evidências

- Erros operacionais sem expor dados do visitante; coleta de analytics **não é requisito**. Não registrar conteúdo das notas ou mídias importadas.
- Para cada marco, o agente deve apresentar comandos executados, resultados, screenshots/testes, lista de arquivos alterados, riscos e pendências. Se não executou em ambiente real, escrever **NÃO EXECUTADO**.
- Alertas de links 404, GitHub rate limit, asset quebrado, demo offline ou falha de índice devem ser observáveis em desenvolvimento.

## Segurança de dependências e CI

- Lockfile versionado, `npm ci`, ESLint/typecheck/build/tests, verificação de vulnerabilidades e auditoria razoável de scripts de instalação.
- CI não deve editar ou publicar repositórios antigos por default; permissões mínimas GitHub Actions.
- Jamais inserir GitHub PAT em frontend, arquivos `.env` enviados ao GitHub ou logs.
- Atualizar libs somente com compatibilidade confirmada; React 19 e R3F v9 são a escolha de base, não alpha R3F/WebGPU.
