# Direção visual: Wuthering Waves, sem reproduzir uma interface oficial

**Escopo:** revisão editorial apenas do portfólio principal. Abismo, site-3D, Hyprland-Themes, o carrossel, as transições, as entradas em paisagem, o terminal e a cena original de partículas não foram modificados.

## Fontes primárias e verificáveis

1. [Site oficial de Wuthering Waves — Kuro Games](https://wutheringwaves.kurogames.com/pt-BR/). Referência de identidade de um RPG de ação pós-apocalíptico.
2. [Entrevista com Solon Li e equipe, Unreal Engine, 13 maio 2024](https://www.unrealengine.com/developer-interviews/exploring-the-post-apocalyptic-charm-of-asg-open-worlds-in-wuthering-waves?lang=pt). A equipe afirma que busca **contraste nítido**, **cores complementares**, **gradação cinematográfica** e que trabalhou especialmente com **gradientes**, iluminação estável e tratamento de cor.
3. [Google Fonts: Manrope](https://fonts.google.com/specimen/Manrope) e [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk): famílias existentes e publicamente documentadas. **Não há evidência aqui de que sejam as fontes oficiais de Wuthering Waves.** Manrope foi escolhida como alternativa de leitura; o display Space Grotesk original é preservado.
4. [MDN — Using CSS gradients](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Images/Using_gradients): tipos de gradientes, sobreposição de campos radiais e paradas de cor.
5. [W3C/WCAG 2.2 — Contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): referência de 4.5:1 para texto comum e 3:1 para texto grande; nenhum certificado de conformidade é reivindicado sem auditoria completa.

## Dados de cor reais do projeto

As cores do portfólio **não foram copiadas de screenshots** nem inventadas como uma suposta paleta oficial de Wuthering Waves. São as cores existentes no arquivo versionado `src/data/official-theme-schemes.json`, derivadas do tema Changli selecionado pelo proprietário:

| Papel | Token | Valor |
| --- | --- | --- |
| Fundo | `--color-bg` | `#110A0B` |
| Superfície | `--color-surface` | `#1A0F10` |
| Texto | `--color-text` | `#F7E7D8` |
| Acento primário | `--color-accent-primary` | `#C96A42` |
| Acento secundário | `--color-accent-red` | `#E17F72` |
| Acento de luz | `--color-accent-yellow` | `#E3B37A` |

O CSS usa `color-mix()`, `linear-gradient()` e `radial-gradient()` para criar iluminação focal, contorno fosco e gradação tonal com **esses valores existentes**, sem inserir imagens de terceiros.

## Decisões do projeto, não fatos atribuídos à Kuro Games

- **Tipografia:** Manrope para textos e rótulos, Space Grotesk preservado em títulos por compatibilidade com a geometria do nome/partículas.
- **Gradientes:** a lógica é inspirada no processo de gradação descrito pela equipe da Kuro; os ângulos, níveis de mistura, opacidade e aplicação em CSS são decisões técnicas **nossas**, não uma reprodução exata do jogo.
- **Acabamento:** mais material fosco e hierarquia editorial, menos brilhos homogêneos de aparência genérica.
- **Conteúdo:** frases de marketing vagas foram substituídas por tecnologias verificadas nos repositórios do proprietário (Phaser, React, Hyprland). O site não declara que os trabalhos estão finalizados.
- **Sem novas funcionalidades:** nenhuma nova área de IA foi adicionada ou excluída. O pedido de “tirar a cara de IA” refere-se à apresentação visual genérica, não à remoção do terminal ou dos projetos.

## Preservação e limites

A camada `src/styles/wuwa-art-direction.css` atua dentro de `.hyprland-route-home` e **não altera transform, transition, animation, display, size ou positions do carrossel**, evitando quebrar correções mobile anteriores. A página independente de Hyprland-Themes, os iframes, o terminal e as configurações do projeto externo não recebem substituições de layout.

A estética é uma **interpretação autoral baseada em fontes**; não há logotipo, imagens de personagem ou material de jogo copiado. Qualquer afirmação sobre tipografia “oficial” ou códigos de cor “exatos” do jogo seria especulação e foi evitada.
