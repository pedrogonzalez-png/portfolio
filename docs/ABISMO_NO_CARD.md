# Abismo jogável dentro do card do portfólio

A página inicial possui um carrossel de três projetos. Quando **Abismo** estiver no centro, clicar no card abre a área jogável **dentro do mesmo card expandido**, sem modal ou rota separada. O menu Hyprland-Themes continua com página própria e seu efeito de desintegração original.

## Colocar o jogo real no card

O código do Abismo fica no repositório original [jogo-site](https://github.com/pedrogonzalez-png/jogo-site). O portfólio **não reimplementa** o Phaser. Ele abre uma cópia compilada do jogo dentro de um iframe no **mesmo domínio**.

Na pasta do portfólio execute:

```bash
npm ci
npm run sync:abismo
npm run dev
```

Depois vá à seção de projetos e clique no card **Abismo**. O comando `sync:abismo` baixa uma **revisão fixada** do repositório original em um diretório temporário, executa `npm ci` e `vite build --base=/abismo/`, e coloca o resultado em `public/abismo/`.

- Build do Abismo: `c6f7d13b340a6a8a57f8d6e2d883f93711dae8a7`.
- Pasta gerada: `public/abismo/` — ignorada pelo Git, não modifique manualmente.
- Manifesto: `public/abismo/ready.json` — gerado **somente após build bem-sucedido**.
- Iframe: `/abismo/index.html` — carregado **só depois de clicar em jogar** e confirmar o manifesto.
- Fechar jogo desmonta o iframe e interrompe o Phaser; reiniciar recria o iframe.
- Os saves do IndexedDB pertencem ao próprio jogo e são persistidos no navegador na mesma origem. Uma mudança de domínio pode resultar em uma área de armazenamento diferente.

### Se o portal exibir "O jogo ainda não foi instalado"

O arquivo compilado não está presente. Execute `npm run sync:abismo`, depois aperte **Verificar novamente** no card. É necessário ter Git, Node compatível com o Vite 8 do Abismo e acesso à rede para a primeira sincronização. Não é necessário alterar `jogo-site`.

### Publicar o jogo junto com o portfólio

O diretório `public/abismo` é gerado localmente e **não foi commitado**. Para incluir a demo em um deploy (por exemplo, Vercel), configure o build do deploy para executar **`npm run sync:abismo && npm run build`**; o ambiente de CI/deploy deve ter Git, npm e acesso ao GitHub para compilar a revisão fixada. Sem isso, a interface informará que o jogo não está instalado em vez de mostrar uma demo falsa.

O repositório do Abismo permanece independente e inalterado. A revisão fixada evita atualização automática inesperada do jogo, e pode ser atualizada no script `scripts/sync-abismo.mjs` após validação. O portfólio pode continuar compilando sem a demo; o jogo só é incluído no build quando sincronizado.

### Limites desta primeira integração

A interface hospeda o jogo Phaser **real** em um iframe com proporção 16:9, mas a apresentação não altera nem finaliza a jogabilidade. Ainda é necessário confirmar manualmente no navegador o carregamento, uso de teclado/mouse, áudio, desempenho e saves. O tamanho de 1280×720 é escalado pelo Phaser. O visitante não pode editar a composição do portfólio.
