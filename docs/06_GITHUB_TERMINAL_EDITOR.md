# 06 — Terminal Linux simulado, explorer de código, Git e histórico 3D

## Experiência [DECIDIDO]

O terminal é parte do mundo visual (objeto 3D), mas pode ser aberto pelo menu/atalho a qualquer momento. O design evoca Kitty/Arch/Fish no estilo cromático do tema selecionado. Diferentemente de um terminal fake, o visitante pode explorar **pastas e arquivos reais** dos repositórios GitHub **públicos e aprovados** pelo dono, diretamente no site, sem obrigar link externo.

Abrir `code src/main.js` revela painel adjacente estilo VS Code: syntax highlighting, numeração de linhas, abas, árvore de diretórios e Markdown seguro. Terminal, explorador e visualizador compartilham `repo + branch/ref + current path`.

## Política de acesso

- Somente leitura, **sem shell real, sem processo do sistema, sem acesso ao dispositivo, sem `eval`, sem execução de scripts**.
- Catálogo explicitamente aprovado: nenhum repo fora da allowlist, mesmo que seja público. `dotfiles-Arch` excluído.
- Comandos retornam resultados de um filesystem **virtual mapeado** à árvore real do repo selecionado; sanitizar e normalizar caminhos (`..`, symlinks, encodings). Nunca aceitar URLs arbitrárias fornecidas em terminal para `fetch`.
- Aplicar limite de tamanho/tempo/resposta em busca e arquivos; arquivos binários exibidos como preview autorizado ou mensagem amigável.
- Deixar evidente que o terminal é uma simulação readonly e que dados vêm do GitHub público, com data/branch/commit do snapshot.

## Comandos definidos [DECIDIDO / sintaxe proposta]

| Comando | Resultado |
|---|---|
| `help` | lista e exemplos dos comandos disponíveis |
| `whoami` | apresentação fictícia do terminal / informações do portfólio, não identidade real do visitante |
| `pwd` | caminho virtual atual |
| `ls [-la] [path]` | arquivos/diretórios do repo atual |
| `cd path`, `cd ..` | navegação entre pastas permitidas |
| `tree [path]` | árvore com limites de profundidade e paginação |
| `cat path` | conteúdo textual da fonte real, com limites |
| `find [path] [name]` | busca de nomes nos índices permitidos |
| `grep pattern [path]` | busca textual no conjunto disponível; resultados parciais rotulados se não indexados |
| `code path` | abre visualizador readonly e sincroniza seleção |
| `repos` | mostra lista de repos aprovados |
| `open repo-id` | altera repo corrente; exige ID da allowlist |
| `goto projects|skills|about|contact` | navega seções do portfólio, não executa programa |
| `neofetch` | saída decorativa estilo Linux com informações públicas do portfólio, sem afirmar ser estado real do PC |
| `git log` | commits reais do repo/ref e carregamento paginado |
| `git show SHA` | metadados/diff real de commit acessível |
| `git diff A B [-- path]` | diff real apenas se dados disponíveis pelo GitHub; nunca fabricar |
| `clear`, `history` | utilidades locais |

Qualquer comando desconhecido responde com erro gentil e `help`. **Não implementar** `sudo`, `rm`, `curl` arbitrário, `git push`, `npm install`, `ssh`, escrita de arquivos, pipe de shell real. Parser de comandos finito, seguro e testado; suportar strings entre aspas nas opções necessárias.

## Navegador/editor de código [DECIDIDO]

- Árvore de diretórios real, estado expandido recolhível; breadcrumbs, busca local, abas fecháveis, seletor de repo/ref, botão para URL original GitHub, copiar caminho/código.
- CodeMirror 6 em readonly, temas integrados à paleta do portfólio, syntax highlighting por extensão carregado sob demanda, números de linha e desempenho para grandes arquivos (limites configuráveis).
- Markdown seguro renderizado em preview com sanitização rigorosa; imagens do repo somente se permitidas e em URL pública verificada. HTML/JS de Markdown nunca executa.
- Conteúdo fiel ao arquivo real: título com repo, path, SHA/ref, timestamp de atualização; não inventar arquivos para preencher UI.
- Mobile: terminal e editor em abas/stack, sem dividir largura em duas colunas estreitas; teclado touch e ações quick command.

## Git history [DECIDIDO]

- **Linha do tempo dentro do editor**, lista de commits, autor, data, assunto, diff contextual e visualização lado a lado quando possível.
- **Grafo 3D opcional** de nós brilhantes representa commits com arestas de parent SHAs reais. Não criar ligações cronológicas falsas nem posicionar merge como cadeia simples.
- Alternância: **Marcos importantes** (curadoria explícita; não inferir importância só por título) e **Histórico completo acessível**, com paginação lazy. Evitar prometer todo histórico de todos os branches se API não entregou esses dados: mostrar ref e cobertura consultada.
- Comandos `git log`, `git show`, `git diff` sincronizados com painel visual. Não renderizar diffs monstruosos integralmente; cap/virtualização.
- Fechar grafo 3D ao perder foco/abrir jogo; não gastar GPU em duas cenas 3D simultaneamente.

## Estratégia GitHub e rate-limit

A API REST GitHub sem autenticação costuma limitar o cliente por IP a **60 requisições/hora** e pode aplicar limites secundários. Portanto não fazer uma consulta por partícula, por linha de código ou por cada card. Preferir:

1. **Índice estático construído no CI** (`approved-repos-manifest`, árvores, metadados, thumbnails próprias, marcos aprovados), atualizado em builds controlados com token do CI nunca entregue ao navegador.
2. Conteúdos/commits reais sob demanda, com cache e backoff; URLs geradas somente para owner/repos/paths aprovados.
3. Estados `loading`, `offline`, `rate-limited`, `not-found`, `too-large` e aviso de snapshot desatualizado.
4. Em escala de tráfego maior, serviço cache readonly autorizado em hospedagem serverless. Isto é possível evolução técnica, **não exigência inicial**.
5. Não guardar tokens de usuário e não pedir login no GitHub para acessar portfólio público.

## Exemplos de sessão (saída ilustrativa, não inventar arquivos)

```text
visitor@portfolio:~$ repos
# lista dos repositórios expressamente aprovados
visitor@portfolio:~$ open jogo-site
visitor@portfolio:jogo-site/$ ls
# usa índice real do repo
visitor@portfolio:jogo-site/$ code src/main.js
# abre código real de entrada do Phaser no painel lateral
visitor@portfolio:jogo-site/$ git log
# commits reais da branch/ref atual, paginados
```

## Aceite

- Abrir um arquivo real do Abismo pelo terminal e pelo explorer gera a **mesma versão** de conteúdo.
- Repo não aprovado ou path fora da allowlist falha sem request arbitrário; `dotfiles-Arch` não aparece.
- `git log` e grafos representam dados reais; histórico grande tem paginação e avisos de cobertura.
- Teclas/scroll no editor não movimentam cena 3D por trás; Escape e foco restaurados.
- Estilos e acentos seguem mudança de tema; código permanece legível.

## Estado da visualização Git (28/10/2026)

O histórico paginado agora mostra grafo 2D com SHAs de parentesco reais retornados pela API. Arestas só existem quando pai e filho estão na página carregada, sem inventar relações. A seleção de sete marcos técnicos foi verificada por SHA e arquivos alterados, mas segue **provisória e não aprovada pelo proprietário**. O grafo 3D e curadoria final são futuros.

## Integração terminal e diff visual (28/10/2026)

Comandos `git log [página]`, `git show <SHA>` e `git diff <SHA-A> <SHA-B>` agora ativam a aba Histórico visual da mesma seleção de repositório, incluindo página ou resultado consultado. A mesma resposta tipada alimenta o resumo do console e o diff do painel, sem fabricar alterações. O visualizador separa arquivos, status, números de linhas da visualização, adições, remoções e contexto. Exibição limitada a 16 arquivos e 6.000 caracteres de patch por arquivo, com aviso de conteúdo parcial e link oficial. Testes de integração e XSS ainda não substituem revisão visual manual.
