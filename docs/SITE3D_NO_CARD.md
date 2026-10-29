# Site 3D dentro do próprio card

O projeto real [pedrogonzalez-png/site-3D](https://github.com/pedrogonzalez-png/site-3D)
é uma aplicação **React + Vite** com seleção de personagens e vídeos WebM.
Ele é compilado em uma pasta isolada e exibido somente ao abrir seu card central
no carrossel do portfólio. Não há cópia da interface nem reescrita do código original.

## Instalação local

A partir da raiz do portfólio, com Git, Node.js 22+ e npm disponíveis:

```bash
npm ci
npm run sync:site3d
npm run dev
```

Abra **Projetos → site-3D → Explorar**. Para habilitar o Abismo também:

```bash
npm run sync:abismo
```

## Publicação

O deploy precisa preparar a build original antes da compilação do portfólio:

```bash
npm run sync:site3d && npm run build
```

Caso os dois projetos sejam publicados:

```bash
npm run sync:abismo && npm run sync:site3d && npm run build
```

O script clona uma revisão fixada (`40aca5535d0b2366d1b9899df3ca58a815fb3d81`)
em diretório temporário, instala as dependências usando `npm ci`, usa
`vite build --base=/site-3d/` e copia `dist/` para `public/site-3d/`.
O repositório original não é modificado. Os arquivos resultantes são ignorados
pelo Git; `git clone` ou `git pull` sozinhos não os instala.

O componente `src/components/Site3DCard.tsx` checa o manifesto JSON
`/site-3d/ready.json` antes de montar o iframe. Quando a build está ausente,
informa o comando de instalação em vez de mostrar a página principal do portfólio.
O iframe é desmontado após a animação de saída do card. **Voltar**, **Recarregar**
e tela cheia mantêm a navegação dentro do portfólio.

## Limitações

- O site original contém vídeos WebM grandes; verifique o limite de tamanho
  e banda do provedor de hospedagem. A build deve ser produzida no deploy.
- A área interna é responsiva ao espaço do iframe, mas a origem do projeto
  utiliza dimensões de viewport próprias; o layout em janelas muito pequenas
  depende da implementação original.
- Vídeos podem obedecer às restrições de reprodução automática do navegador.
- A revisão fixa não acompanha automaticamente mudanças futuras no repositório.
- O workflow `Site 3D embed smoke test` verifica o build e os assets; não
  substitui uma inspeção visual e de interação no navegador real.
