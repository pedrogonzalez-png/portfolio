# Galeria Hyprland — estante de CDs e prévia de mídia

A página `/hyprland-themes` apresenta dez CDs. Ao selecionar uma caixa,
a prévia grande abaixo mostra **somente** o vídeo ou a imagem correspondente,
sem widgets, barra do sistema, dock ou texto sobre a mídia.

## Mídias existentes

Os arquivos estão em `public/assets/hyprland/temas/` e são mapeados em
`src/config/themeShelfMedia.ts`, sem renomear ou mover o conteúdo:

| Tema | Arquivo |
| --- | --- |
| Changli | `videos-fundo/changli.mp4` |
| Hiyuki | `videos-fundo/hyuki.mp4` |
| Emilia | `foto-fundo/emilia.png` |
| Furina | `foto-fundo/furina.png` |
| Hotline Miami | `foto-fundo/tony.png` |
| Hsin | `videos-fundo/hsin.mp4` |
| Shorekeeper | `videos-fundo/shorekeeper.mp4` |
| Wuthering | `videos-fundo/wutering.mp4` |
| Doom | `foto-fundo/doom.png` |
| Kyoraku | `foto-fundo/kyoraku.png` |

Os cinco vídeos dos CDs permanecem carregados para permitir ver um quadro
estático enquanto não selecionados. Somente o CD selecionado reproduz;
vídeos são mudos e em loop. Com redução de movimento ativa, não há autoplay.
Se a mídia da prévia falhar, permanece um fundo alternativo em CSS.

## Navegação e apresentação

- Roda do mouse sobre a estante: avança/retrocede entre CDs.
- Arraste horizontal por toque: navega no celular; arraste vertical ainda
  pode rolar a página.
- Setas do teclado, controles anterior/próximo e clique no CD continuam válidos.
- Há dez edições e até cinco capas visíveis de cada vez na composição circular.
- A opção 21:9/16:9 foi **removida**. A prévia utiliza somente a proporção
  ultrawide fixa `3440 / 1440`; o conteúdo usa `object-fit: cover`.

## Cores exatas fornecidas pelo proprietário

Em 02/11/2026 foram recebidos dez esquemas Quickshell JSON:
`changli(1).json`, `hiyuki(1).json`, `emilia(1).json`,
`furina(1).json`, `hotline-miami(1).json`, `hsin.json`,
`shorekeeper.json`, `wuwa.json`, `doom.json` e `kiyoraku.json`.

`src/config/themeShelfMedia.ts` contém os valores de **dark** usados pela
galeria (superfícies, texto, contorno e os acentos primário/secundário/
terciário), preservando o valor exato de `defaults.*` de cada esquema.
`wuwa.json` é o tema identificado na galeria como Wuthering, e
`kiyoraku.json` como Kyoraku. A aparência do vidro, iluminação,
contornos e elementos da galeria acompanha a seleção.

Esses tokens são aplicados **somente à galeria**, sem modificar as cinco
paletas oficiais globais nem a aparência dos demais projetos.

## Escopo da alteração

A estante não é editor de temas ou desktop real. Os layouts Quickshell
arquivados continuam nos dados do projeto, mas não são exibidos sobre a prévia.
Abismo, site-3D, carrossel principal e transição de acesso ao Hyprland
continuam independentes.
