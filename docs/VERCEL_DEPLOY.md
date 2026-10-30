# Hospedagem do portfólio completo no Vercel

O repositório `portfolio` **não** contém os arquivos compilados do Abismo e
site-3D. Eles são gerados em `public/abismo/` e `public/site-3d/` pelos
scripts de sincronização e ignorados pelo Git. Fazer `npm run build` sem
sincronizar os projetos publica apenas o portfólio e faz os dois cards
exibirem a mensagem de que a build local está ausente.

## Configuração automática (recomendada)

`vercel.json` define:
- Preset: `vite`
- Build Command: `npm run build:vercel`
- Output Directory: `dist`
- Rewrite da rota direta `/hyprland-themes` para o roteador React.

`npm run build:vercel` faz:

```bash
npm run sync:abismo
npm run sync:site3d
npm run build
```

Cada script compila o **repositório original** em uma pasta temporária,
sem alterá-lo, usando um commit fixado; somente o conteúdo final é incluído
no `dist/` do Vite e publicado pelo Vercel.

**Não** adicione `public/abismo`, `public/site-3d`, `dist` ou
`node_modules` ao Git. Esses artefatos devem continuar gerados no build.

## Como verificar após o redeploy

Em `https://SEU-DOMINIO.vercel.app`, abra:
- `/abismo/ready.json` — precisa retornar JSON com `build: "abismo"`.
- `/site-3d/ready.json` — precisa retornar JSON com `build: "site-3d"`.
- `/abismo/index.html` e `/site-3d/index.html` devem carregar o bundle.

O HTML da home no lugar de `ready.json` **não** conta: os cards rejeitam
este fallback por segurança. Também é possível verificar em DevTools → Network.

Se a página estiver desatualizada, abra Vercel → Deployments e confirme
que o último deploy da branch `main` concluiu **Ready** e executou
`npm run build:vercel`. Para aplicar a configuração após a atualização do
repositório, use **Redeploy** se nenhum deploy automático foi iniciado.

## Limites e atenção à mídia

O repositório do site-3D possui dezenas de vídeos WebM e imagens; a
compilação transfere arquivos pesados e o uso de banda pode ser alto. Caso
o Vercel falhe por limites de tamanho, tempo, recursos ou transferência,
consulte os logs da tentativa; não remova a proteção `ready.json` e não
substitua vídeos por placeholders silenciosamente. Uma CDN/storage externa
para vídeo pode ser necessária conforme o plano e o volume total.

No desenvolvimento local (inclusive no pendrive Ventoy), o fluxo permanece
igual: `npm run sync:abismo`, `npm run sync:site3d` (uma vez por revisão),
seguido de `npm run dev` (ou `node ./node_modules/vite/bin/vite.js` em exFAT).
