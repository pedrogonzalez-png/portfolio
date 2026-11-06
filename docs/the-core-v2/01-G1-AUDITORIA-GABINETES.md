# THE CORE v2 — G1 | Auditoria inicial de gabinetes 3D
**Atualização:** 2026-11-06  
**Status:** pesquisa de candidatos; **nenhum asset 3D aprovado**  
**Branch:** `feat/the-core-rebuild-realista-v2`  
**Versão anterior:** `feat/the-core-vertical-slice-m0` (PR #51; não alterar).

## Decisão

A experiência deve usar **um gabinete com geometria convincente mesmo em luz neutra e sem peças internas**, preferencialmente com estrutura / vidro / tampas separáveis, compatível com apresentação de placa-mãe ATX e **AIO 360 mm no topo**. A direção do produto é um PC preto, sóbrio e realista, com iluminação neutra e ênfase no hardware em vez de hologramas.

Não confundir:
- **Referência de projeto físico:** um gabinete real, com dimensões verificadas.
- **Modelo 3D redistribuível:** um arquivo com direitos de uso/redistribuição claros e qualidade visual aprovada.
- **Asset já importado:** não é automaticamente aprovado para G1 por ter licença CC0.

## Candidato A — Corsair 5000D AIRFLOW (preto): REFERÊNCIA FÍSICA PREFERIDA

- Fonte oficial: https://www.corsair.com/br/pt/p/null/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-pc-case-black-cc-9011210-ww
- Fabricante declara medidas externas de **520 mm (altura) × 245 mm (largura) × 520 mm (profundidade)**.
- ATX/E-ATX, placa de vídeo até **420 mm** e radiador **360 mm no topo**, na frente ou na lateral; três ventoinhas de 120 mm possíveis no teto.
- Referência visual: estrutura interna com bandeja da placa, PSU shroud, áreas de passagem de cabos, filtro frontal e painéis removíveis.
- Material do fabricante **não equivale** à licença para incorporar fotos, modelos ou CAD proprietário ao repositório.
- Modelo encontrado de terceiros, com nome Corsair 5000D, sob licença comercial de marketplace: https://www.cgtrader.com/3d-models/electronics/computer/5000d-glass-mid-tower-atx-pc-case-by-corsair . **Não aprovar**: é o 5000D Glass (não necessariamente AIRFLOW), formato entregue e eventual redistribuição livre do GLB em um site aberto exigem verificação de licença.
- Outro asset encontrado: https://www.turbosquid.com/pt_br/3d-models/3d-corsair-5000-series-2103004 , página menciona **uso editorial**; **excluir** como ativo do portfólio até comprovar direitos.

**Veredito:** **aprovado como referência de proporções e qualidade esperada**, **não aprovado como asset 3D**. O projeto não deve chamar um modelo original genérico de “5000D” nem usar marca/logotipo numa réplica não licenciada.

## Candidato B — Innerscene Open mid-tower PC case: GLB CC0 A INSPECIONAR

- Página/declaração de licença: https://www.innerscene.com/tools/library/3d-parts/open-mid-tower-pc-case-089c34c8
- Visualizador interativo: https://www.innerscene.com/v/1yxaqRkBULkBMNqS6J2b2j
- Segundo o publicador: **20,4 MB**, GLB, licença **CC0**, geometria modelada em metros; gabinete de **230 × 470 × 490 mm** (corpo), com porta lateral de vidro aberta 32°. Envelope com vidro aberto aproximadamente **477 × 476 × 492 mm**.
- Declara bandeja ATX com nove espaçadores, PSU shroud, passagens de cabo, filtros, 3 × 120 mm frontais e ventoinha traseira de 120 mm.
- **Não existe evidência suficiente na descrição para afirmar suporte real a radiador 360 mm no topo**. Consta apenas trilho de montagem das ventoinhas.
- A porta lateral já está aberta no GLB. Verificar se a malha contém objetos/pivôs separáveis para fechar a porta, ocultá-la ou animá-la.
- A licença CC0 permite cópia e redistribuição conforme declaração do publicador, mas não atesta realismo, normal mapping, encaixes ou qualidade PBR.

**Veredito:** **candidato experimental** com licença declarada adequada; render e geometria **ainda não validados**. Não trocar pelo gabinete atual sem inspeção em quatro ângulos.

### Limite da verificação nesta rodada

A página e o visualizador são acessíveis, mas a obtenção programática do GLB pelo ambiente de pesquisa retornou uma limitação de acesso ao download; portanto **não inspecionamos fisicamente a malha, node tree, materiais, pivôs, render sob luz neutra ou dimensões extraídas do arquivo**. Não afirmamos que o GLB já foi baixado ou importado. Cabe abrir o visualizador, avaliar a aparência e depois obter o GLB por uma rota autorizada para a inspeção local.

## Candidato C — Nightshark, Sketchfab: licença CC BY, requisitos pendentes

- Fonte: https://sketchfab.com/3d-models/gaming-pc-case-5f9261fef2874bf9ae39dd0f4029e978
- Página declara **378,7 mil triângulos**, download disponível e licença Creative Commons Attribution.
- Aparência de gabinete moderno, com descrição de asset criado pelo autor dylanheyes.
- **Não verificados:** topo 360 mm, proporções, rigidez geométrica, separação de vidro/partes, orientação, uso de marcas e desempenho mobile.
- Exige documentação de atribuição e análise de eventuais direitos de marca embutidos no asset.

**Veredito:** alternativa **condicional**; maior número de polígonos não prova maior realismo ou correção de montagem.

## Excluídos na fase de triagem

| Origem | Motivo |
|---|---|
| `case-mid-tower-cc0.glb` já presente | Malha de gabinete fechado que ocultou os componentes; histórico de aprovação visual negativo |
| Sketchfab Basic PC case | O próprio autor descreve o modelo como simples e com detalhes básicos: https://sketchfab.com/3d-models/basic-pc-case-2869fb18575d49128a3115d42d5d3826 |
| Gabinete/frente procedural M0.x–M1.x | Repetidas correções visuais não atingiram o realismo requerido |
| Arquivos de marketplaces com direitos não verificados | Distribuir diretamente um `.glb` em `public/assets` expõe o arquivo de origem; não presumir que “royalty-free” permite redistribuição como asset extraível |
| Modelos cujo teto não comporte 360 mm | Contradizem o requisito estabelecido para o showcase |

## Matriz de decisão preliminar

| Candidato | Realismo demonstrado | Licença para GLB público | Suporte 360 topo | Status |
|---|---|---|---|---|
| Corsair 5000D AIRFLOW físico | Referência real com fotos | **Não há GLB aprovado** | **Sim — fabricante** | Referência |
| Innerscene aberto | **Não inspecionado** | **CC0 declarado** | **Não comprovado** | Testar |
| Nightshark CC BY | **Não inspecionado** | **CC BY declarado; creditar** | **Não comprovado** | Reserva |

## Próximos passos reais — não confundir pesquisa com render pronto

1. Avaliar visualmente os candidatos nos visualizadores originais e selecionar 1 para inspeção aprofundada.
2. Baixar somente um asset com licença que permita o modo de publicação escolhido.
3. Em Blender ou viewer com inspeção de glTF, registrar: topologia, triângulos, materiais, nomes de objetos, pivôs e dimensões.
4. Renderizar **frente ¾, lado aberto, topo e traseira** em estúdio neutro e sem outras peças, com close-up de moldura, filtros, suportes e PSU shroud.
5. Verificar que **360 mm no topo** e motherboard ATX podem ocupar o espaço da cena sem colisões; não inferir essa compatibilidade pelo nome do asset.
6. Mostrar ao autor o render e a comparação com a referência. **A aprovação visual do gabinete precede a integração M2.**
7. Caso todos os candidatos falhem, preparar **modelagem original detalhada em Blender**, baseada em dimensões e relações de montagem verificadas, sem importar mesh proprietária.

## Fontes consultadas

- Corsair 5000D Airflow — ficha oficial: https://www.corsair.com/br/pt/p/null/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-pc-case-black-cc-9011210-ww
- Corsair comparativo 4000/5000 Series: https://forum.corsair.com/blog/cases/4000-5000-series-case-comparison/
- Innerscene GLB CC0 + viewer: https://www.innerscene.com/tools/library/3d-parts/open-mid-tower-pc-case-089c34c8 e https://www.innerscene.com/v/1yxaqRkBULkBMNqS6J2b2j
- Sketchfab Nightshark: https://sketchfab.com/3d-models/gaming-pc-case-5f9261fef2874bf9ae39dd0f4029e978
- Sketchfab Basic PC: https://sketchfab.com/3d-models/basic-pc-case-2869fb18575d49128a3115d42d5d3826
- CGTrader 5000D: https://www.cgtrader.com/3d-models/electronics/computer/5000d-glass-mid-tower-atx-pc-case-by-corsair
- TurboSquid 5000 Series: https://www.turbosquid.com/pt_br/3d-models/3d-corsair-5000-series-2103004

**Sem implementação 3D, sem merge.** Este é um inventário de triagem de direitos e adequação, não uma validação da malha.
