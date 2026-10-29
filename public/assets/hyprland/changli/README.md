# Changli — imagens e wallpaper local

Esta pasta recebe **somente os arquivos que você escolher adicionar**. Não há download remoto nem upload pelo visitante.

Coloque os arquivos aqui com os nomes abaixo, ou use quaisquer nomes e ajuste `src/data/changliDesktop.ts`:

| Campo em `changliDesktop.media` | Exemplo de caminho |
| --- | --- |
| `backgroundVideo` | `/assets/hyprland/changli/background.mp4` |
| `backgroundImage` | `/assets/hyprland/changli/background.webp` |
| `profileBanner` | `/assets/hyprland/changli/profile-banner.webp` |
| `profileAvatar` | `/assets/hyprland/changli/avatar.webp` |
| `featureArtwork` | `/assets/hyprland/changli/feature.webp` |
| `rightPortrait` | `/assets/hyprland/changli/right-portrait.webp` |
| `brandArtwork` | `/assets/hyprland/changli/brand.webp` |

**Exemplo**: crie `public/assets/hyprland/changli/background.mp4` e edite:

```ts
media: {
  backgroundVideo: "/assets/hyprland/changli/background.mp4",
  backgroundImage: "/assets/hyprland/changli/background.webp",
  // ...
}
```

O campo de vídeo é opcional. Se estiver vazio, o desktop usa o fundo gerado em CSS. Quando preenchido, o vídeo fica atrás de todos os widgets, em `object-fit: cover`, com `autoPlay muted loop playsInline`. A imagem estática pode funcionar como fundo alternativo e `poster`.

As demais imagens ficam nas mesmas posições e máscaras arredondadas do layout de referência. Os cards, notas, tarefas, medidores, clima, calendários, relógios e timers são **elementos React + CSS**; não são imagens recortadas da captura.

O relógio e o calendário usam a data/hora local do navegador, os relógios mundiais usam os fusos corretos. Métricas de CPU/RAM/Disco e dados meteorológicos são **dados demonstrativos configurados** em `src/data/changliDesktop.ts`, não dados em tempo real do Arch ou de uma API. Os controles de música/temporizadores são ilustrativos porque os visitantes só podem escolher a cor e o tema; não podem editar seus widgets.

A área está desenhada para as posições relativas do screenshot 1914 × 862. Para alterar coordenadas, ajuste as propriedades `x,y,w,h` dos `Slot` em `src/components/desktop/ChangliDesktop.tsx`. Nenhuma mídia precisa estar presente para o layout funcionar.
