# THE CORE — modelos 3D de hardware com licença CC0

Estes arquivos pertencem à **visualização educativa** do laboratório. Não são reproduções oficiais do PC do autor e não devem servir como prova de compatibilidade física, elétrica, BIOS ou mecânica. As marcas de fabricantes e nomes das peças no catálogo são independentes da geometria visual.

## Origem e licença

Todos os modelos listados abaixo foram obtidos da [Innerscene Free Parts Library](https://www.innerscene.com/tools/library) sob a declaração **CC0 1.0 / domínio público**, com autorização para cópia, modificação e redistribuição, inclusive comercial. Veja os [termos da biblioteca](https://www.innerscene.com/tools/library/terms).

| Arquivo local em public/assets/the-core | Modelo original | Página oficial e declaração CC0 | Observações |
|---|---|---|---|
| gpu-generic-cc0.glb | Graphics card with fans | https://www.innerscene.com/tools/library/3d-parts/graphics-card-with-fans-6af50057 | Placa genérica com **três ventoinhas**, ~306 x 130 x 59 mm; não é a RX 7600 Gigabyte de duas ventoinhas |
| case-mid-tower-cc0.glb | Closed mid-tower PC case | https://www.innerscene.com/tools/library/3d-parts/closed-mid-tower-pc-case-1374583e | Gabinete ATX genérico ~232 x 476 x 492 mm, painel de vidro do lado -X, frente -Y e topo +Z na origem |
| motherboard-atx-cc0.glb | ATX motherboard | https://www.innerscene.com/tools/library/3d-parts/atx-motherboard-7794769f | ATX genérica ~305 x 252 x 44 mm, **soquete LGA e DDR5**; não corresponde às placas B550/AM4 ou B650/AM5 do catálogo educativo |

URLs de importação originais:

- https://www.innerscene.com/api/library/graphics-card-with-fans-6af50057/download
- https://www.innerscene.com/api/library/closed-mid-tower-pc-case-1374583e/download
- https://www.innerscene.com/api/library/atx-motherboard-7794769f/download

As texturas dos dois últimos GLBs são redimensionadas e comprimidas em WebP durante a importação, sem alterar os dados geométricos com Draco/Meshopt. O formato é GLB, armazenado localmente no repositório e servido pelo próprio site.

## Regras de integração

- **Não apresentar o modelo visual genérico como peça física exata.** A escolha de CPU/placa-mãe/RAM continua sendo testada pelo sistema educativo de dados; a renderização não valida fisicamente o encaixe, soquete ou conectores da malha.
- **Não ocultar os componentes instalados.** A frente e a lateral com vidro mostram a montagem; o casco visual desabilita os seus raycasts para preservar cliques de GPU, CPU, placa-mãe e memória.
- A geometria procedural original permanece como fallback para erros de rede, ausência/remoção dos GLBs ou falha de parsing.
- O renderizador adapta a orientação e as dimensões para o espaço *estilizado* existente do THE CORE. Isso não equivale a uma escala CAD 1:1.
- A cena principal continua preservando a interação, as cores de tema, e os módulos de Montagem, Overclock e Linux.
- O custo da transferência deve ser monitorado; a próxima etapa poderá usar modelos GLB mais leves com licença compatível e variantes para dispositivos móveis.

## Como substituir depois

Troque o arquivo GLB correspondente, revisando licença, orientação, escala e teste de carregamento em CoreHighFidelityAsset.tsx (gabinete/placa-mãe) ou GpuAsset.tsx (GPU). Sempre execute build, testes e smoke desktop/mobile antes de fazer merge na main.
