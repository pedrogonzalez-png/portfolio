# Estante de CDs de vidro — Hyprland Themes

## Onde fica
Na página dedicada \`/hyprland-themes\`, aberta ao clicar no projeto
**Hyprland Themes** no carrossel do portfólio. A transição de entrada e
o visualizador dos layouts publicados continuam como estavam.

## Onde inserir suas mídias

**Só precisa editar:**
\`src/config/themeShelfMedia.ts\`

São cinco entradas, uma por tema:
- \`changli\`
- \`hiyuki\`
- \`emilia\`
- \`furina\`
- \`hotline-miami\`

Cada entrada possui três campos:
- **cover**: print/arte de capa da caixa de CD; idealmente quadrada, WebP/JPG/PNG.
- **video**: gravação MP4 opcional. É exibida **apenas na caixa selecionada**,
  sem som, em loop e em linha com a capa. Usuários que preferem movimento reduzido
  não recebem reprodução automática.
- **poster**: frame estático opcional do vídeo (fallback visual).

Exemplo para depois, quando os arquivos existirem:

\`\`\`ts
changli: {
  cover: "/media/themes/changli/cover.webp",
  video: "/media/themes/changli/preview.mp4",
  poster: "/media/themes/changli/poster.webp",
},
\`\`\`

Coloque os arquivos em:
\`\`\`
public/
  media/
    themes/
      changli/
        cover.webp
        preview.mp4
        poster.webp
      hiyuki/
        cover.webp
        preview.mp4
        poster.webp
      emilia/
      furina/
      hotline-miami/
\`\`\`

Arquivos em \`public/\` são servidos a partir de \`/\` no Vite.
O exemplo acima é **só o formato de caminho**: os arquivos ainda não existem.
É possível colocar URLs HTTPS diretamente nos campos, mas o servidor remoto
precisa permitir reprodução/exibição no navegador.

**Enquanto os campos estão vazios**, a caixa mostra arte abstrata gerada
por CSS, sem fazer requisição por uma mídia inexistente. Não utilizamos vídeos
de terceiros como substitutos.

## Interação
- Cinco caixas em perspectiva circular, sempre com uma no centro;
  clique em outra caixa para centralizá-la.
- Botões **Tema anterior** e **Próximo tema** (também setas esquerda/direita).
- A cor emitida pelo vidro e pela prateleira segue os acentos oficiais do tema.
- A seleção altera normalmente a prévia de desktop publicada logo abaixo
  (Changli, Hiyuki, Emilia, Furina, Hotline Miami), bem como as variantes já
  suportadas. Não há editor de widgets/cor reintroduzido.
- A estante usa React e CSS, não outra cena Three.js; mobile e
  \`prefers-reduced-motion\` mantêm alternativas utilizáveis.

## Limites e validação
- A galeria agora é uma vitrine de mídia visual, mas **nenhuma captura ou gravação
  foi fornecida ainda**; assim, não há vídeo ou screenshot real neste commit.
- Alterações isoladas à página Hyprland. O carrossel de projetos, Abismo, site-3D,
  roteamento, transição de desintegração e arquivos dos repositórios originais
  não foram modificados.
- Revisar a aparência num navegador real depois de adicionar as mídias;
  testes automatizados e CI verificam o básico, não substituem QA visual.


## Fundo da prévia de desktop

A mídia do CD selecionado também aparece **atrás dos widgets** na prévia logo abaixo da estante. Em Changli, o vídeo é aplicado no desktop reproduzido em código; nos demais temas, no visualizador com widgets Quickshell publicados.

- Vídeos em loop e sem som; PNGs exibidos como fundo do tema correspondente.
- Os widgets continuam por cima e os arquivos originais não são movidos.
- Ao sair de um tema, seu vídeo deixa de fazer parte da prévia.
- Sem mídias disponíveis ou em caso de erro, o fundo CSS existente continua como alternativa.


## Prévia limpa (decisão mais recente)

O quadro grande abaixo dos CDs exibe somente o arquivo do tema selecionado, sem widgets, dock, barras ou cartões sobrepostos. A proporção 21:9/16:9 continua selecionável. A coleção Quickshell publicada permanece preservada como dados, mas não é renderizada sobre a mídia; o seletor de variantes foi retirado por não alterar essa visualização.
