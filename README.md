# Portfólio interativo 3D

Portfólio React/TypeScript com identidade visual inspirada na paleta Changli, experiências interativas reais e uma galeria dos temas Hyprland.

**Estado atual:** aplicação funcional em desenvolvimento. O conteúdo pessoal da apresentação e do contato ainda contém textos provisórios. Não tratar um build aprovado como validação visual em todos os dispositivos.

## O que o visitante encontra

- **Introdução:** título animado com partículas, interface escura e navegação pelo menu superior.
- **Projetos:** carrossel 3D circular com navegação por rolagem, teclado e gesto horizontal.
- **Abismo:** jogo Phaser carregado isoladamente no card, com Voltar, reiniciar e tela cheia.
- **site-3D:** aplicação React/Vite original carregada isoladamente no card, com Voltar, recarregar e tela cheia.
- **Hyprland-Themes:** página própria com galeria de cinco temas oficiais; a navegação a partir do card possui transição de desintegração.
- **Terminal:** exploração de repositórios públicos selecionados, histórico Git e visualização de código.
- **Mobile:** o portfólio é navegável em retrato; as três experiências abrem em uma camada horizontal. Quando não é possível bloquear a orientação física do celular, o conteúdo é rotacionado por CSS.

A antiga árvore de conhecimentos e o editor de temas customizáveis foram retirados da experiência pública. A galeria de temas exibe **presets prontos**; o usuário pode alterar a cor de destaque, não construir layouts do zero.

## Tecnologias

React 19, TypeScript, Vite, React Three Fiber / Three.js, GSAP, CSS e Vitest. Os dois projetos embutidos são compilados a partir de **repositórios originais independentes**; não foram recriados dentro do portfólio.

## Rodar no Linux

Pré-requisitos: Git, Node.js 22+ e npm.

```bash
git clone https://github.com/pedrogonzalez-png/portfolio.git
cd portfolio
npm ci
npm run sync:abismo
npm run sync:site3d
npm run dev
```

Abra a URL exibida pelo Vite (normalmente `http://localhost:5173/`). Os comandos `sync` são necessários na primeira instalação ou quando a revisão fixada dos projetos mudar. Sem eles, os cards avisam que a build está ausente; eles nunca exibem um HTML falso no lugar do jogo ou do site-3D.

### Pendrive Ventoy formatado em exFAT

O exFAT não suporta os symlinks normalmente criados pelo npm. Para rodar o portfólio diretamente do pendrive:

```bash
cd /run/media/pedro/Ventoy/portfolio
npm install --no-bin-links
node ./node_modules/vite/bin/vite.js
```

A instalação das dependências é feita uma vez por cópia do projeto. Os scripts `sync` usam diretórios temporários do sistema para compilar os projetos originais e depois instalam as builds em `public/`.

## Scripts

| Comando | Função |
| --- | --- |
| `npm run dev` | Servidor Vite de desenvolvimento |
| `npm run sync:abismo` | Instala a build fixada do jogo em `public/abismo/` |
| `npm run sync:site3d` | Instala a build fixada do site em `public/site-3d/` |
| `npm run build` | Verificação TypeScript e build do portfólio |
| `npm run build:vercel` | Sincroniza ambos os projetos e gera a build completa |
| `npm run typecheck` | Validação TypeScript |
| `npm run test` | Testes automatizados |
| `npm run lint` | ESLint |

## Publicação no Vercel

O arquivo `vercel.json` configura `npm run build:vercel` e a saída `dist/`. A publicação deve produzir os dois manifests:

- `/abismo/ready.json`
- `/site-3d/ready.json`

Consulte [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) para diagnosticar a publicação. Os vídeos do site-3D podem tornar o deploy pesado.

## Estrutura útil

```text
src/app/pages.tsx                 # Home e rota /hyprland-themes
src/components/ProjectPanel.tsx   # Carrossel circular
src/components/AbismoGameCard.tsx # Iframe do jogo
src/components/Site3DCard.tsx     # Iframe da galeria
src/components/LandscapeExperience.tsx # Layout horizontal no celular
src/components/HyprlandShowcase.tsx    # Presets Hyprland
src/components/Terminal.tsx       # Terminal e ferramentas de código
scripts/sync-abismo.mjs
scripts/sync-site3d.mjs
```

## Documentação e escopo

Os arquivos numerados `docs/01_…` a `docs/11_…`, além dos relatórios de marcos, são **registros históricos do planejamento**. Eles podem citar recursos que foram descartados depois, como a árvore de habilidades, o construtor de temas e outros protótipos. **Este README, o código da `main` e os guias de integração/deploy representam o comportamento atual.**

Os repositórios originais são mantidos separados:

- [Abismo / jogo-site](https://github.com/pedrogonzalez-png/jogo-site)
- [site-3D](https://github.com/pedrogonzalez-png/site-3D)
- [Hyprland-Themes](https://github.com/pedrogonzalez-png/Hyprland-Themes)

As prévias e as artes de terceiros precisam respeitar seus respectivos direitos de uso.
