# THE CORE — modelos 3D de hardware com licença CC0

Estes arquivos pertencem à **visualização educativa** do laboratório. Não são reproduções oficiais do PC do autor e não devem servir como prova de compatibilidade física, elétrica, BIOS ou mecânica. As marcas de fabricantes e nomes das peças no catálogo são independentes da geometria visual.

## Origem e licença

Todos os modelos listados abaixo foram obtidos da [Innerscene Free Parts Library](https://www.innerscene.com/tools/library) sob a declaração **CC0 1.0 / domínio público**, com autorização para cópia, modificação e redistribuição, inclusive comercial. Veja os [termos da biblioteca](https://www.innerscene.com/tools/library/terms).

| Arquivo local em public/assets/the-core | Modelo original | Página oficial e declaração CC0 | Observações |
|---|---|---|---|
| gpu-generic-cc0.glb | Graphics card with fans | https://www.innerscene.com/tools/library/3d-parts/graphics-card-with-fans-6af50057 | Placa genérica com **três ventoinhas**, ~306 x 130 x 59 mm; não é a RX 7600 Gigabyte de duas ventoinhas |
| case-mid-tower-cc0.glb | Closed mid-tower PC case | https://www.innerscene.com/tools/library/3d-parts/closed-mid-tower-pc-case-1374583e | Gabinete ATX genérico ~232 x 476 x 492 mm, painel de vidro do lado -X, frente -Y e topo +Z na origem |
| motherboard-atx-cc0.glb | ATX motherboard | https://www.innerscene.com/tools/library/3d-parts/atx-motherboard-7794769f | ATX genérica ~305 x 252 x 44 mm, **soquete LGA e DDR5**; não corresponde às placas B550/AM4 ou B650/AM5 do catálogo educativo |
| psu-atx-cc0.glb | ATX power supply | https://www.innerscene.com/tools/library/3d-parts/atx-power-supply-675d6448 | PSU genérica 150 x 143 x 88 mm, com etiqueta visual **750W**; não é a Cooler Master GX 700W Gold |
| ram-ddr5-cc0.glb | DDR5 RAM stick | https://www.innerscene.com/tools/library/3d-parts/ddr5-ram-stick-376e4682 | DIMM DDR5 com detalhes de contatos e dissipador; usada **somente** quando a memória DDR5 é selecionada no catálogo. DDR4 permanece procedural |

URLs de importação originais:

- https://www.innerscene.com/api/library/graphics-card-with-fans-6af50057/download
- https://www.innerscene.com/api/library/closed-mid-tower-pc-case-1374583e/download
- https://www.innerscene.com/api/library/atx-motherboard-7794769f/download
- https://www.innerscene.com/api/library/atx-power-supply-675d6448/download
- https://www.innerscene.com/api/library/ddr5-ram-stick-376e4682/download

Os três primeiros modelos foram otimizados com texturas WebP de até 1024 px, sem Draco/Meshopt: GPU 1.726.448 bytes, gabinete 2.625.552 bytes e placa-mãe 1.740.864 bytes (~6,1 MB combinados). Na iteração M0.7, PSU e DDR5 passam pela otimização do glTF Transform com quantização portável (sem decodificador Draco/Meshopt) e texturas WebP de até 1024 px. Todos os GLBs são armazenados e servidos pelo próprio site.

## Regras de integração

- **Não apresentar o modelo visual genérico como peça física exata.** A escolha de CPU/placa-mãe/RAM continua sendo testada pelo sistema educativo de dados; a renderização não valida fisicamente o encaixe, soquete ou conectores da malha.
- **Não ocultar os componentes instalados.** A frente e a lateral com vidro mostram a montagem; o casco visual desabilita os seus raycasts para preservar cliques de GPU, CPU, placa-mãe e memória.
- A geometria procedural original permanece como fallback para erros de rede, ausência/remoção dos GLBs ou falha de parsing.
- O renderizador adapta a orientação e as dimensões para o espaço *estilizado* existente do THE CORE. Isso não equivale a uma escala CAD 1:1.
- A cena principal continua preservando a interação, as cores de tema, e os módulos de Montagem, Overclock e Linux.
- O custo da transferência deve ser monitorado; a próxima etapa poderá usar modelos GLB mais leves com licença compatível e variantes para dispositivos móveis.

## Como substituir depois

Troque o arquivo GLB correspondente, revisando licença, orientação, escala e teste de carregamento em CoreHighFidelityAsset.tsx (gabinete/placa-mãe) ou GpuAsset.tsx (GPU). Sempre execute build, testes e smoke desktop/mobile antes de fazer merge na main.

## M0.7 — PSU e DDR5 (05/11/2026)

- Os novos arquivos são CC0, importados da mesma biblioteca e otimizados para WebGL; a procedência e os links originais estão acima.
- `CorePeripheralAsset.tsx` controla carregamento, orientação, escala, fallback procedural e marcadores de diagnóstico `data-psu-model` / `data-ram-model`.
- O modelo DDR5 só aparece quando o usuário escolhe DDR5; no perfil inicial DDR4 mantém-se a representação procedural para não sugerir falsamente que DDR5 cabe no soquete DDR4.
- Fonte visual genérica com etiqueta 750W não comprova identidade com o modelo GX 700W do perfil educativo. O motor de montagem continua independente dos GLBs.
- O water cooler 360 mm de três ventoinhas, ventoinhas adicionais, tubos/cabos e monitor Hyprland continuam procedurais enquanto não existir modelo CC0 adequado: não substituir o radiador por um modelo 240 mm só para dizer que há GLB.
- `scripts/smoke-core-assets.mjs` valida PSU no perfil inicial e memória no perfil AM5/DDR5 no Chromium de verdade.

## M0.8 — Refrigeração e cable management (05/11/2026)

- `CoreCoolingAssembly.tsx`: nova montagem procedural de **AIO conceitual de 360 mm**, com três ventoinhas orientadas para o topo do gabinete, tanques, canaletas, aletas de radiador via `InstancedMesh`, pump block, encaixes metálicos e tubos com acabamento trançado.
- `CoreCableHarness.tsx`: chicotes de alimentação com cabos individualizados, organizadores/comb clips, abraçadeiras e conectores ilustrativos. **Não** representam pinagem, potência certificada nem rota elétrica real.
- Quando o usuário remove a CPU, a bomba/tubos desaparecem; o radiador permanece como componente da cena. Quando remove a PSU, o chicote de alimentação desaparece.
- A bomba ainda abre a bancada de Overclock ao clicar. GPU, placa-mãe e monitor continuam apontando para seus módulos originais.
- Cores de efeitos seguem a paleta atual; `prefers-reduced-motion` pausa as ventoinhas, preservando a navegação.
- O radiador é procedural por escolha: modelos de 240 mm não são substitutos visuais corretos para os três fans do conjunto de 360 mm.
- O computador segue sendo uma **maquete educativa e estilizada**, não uma réplica CAD do equipamento real.
- Workflow experimental da branch agora exige typecheck, lint, testes e browser smoke de GLBs antes da aprovação visual do autor.

**Limite desta etapa:** a qualidade visual deve ser conferida em navegador desktop e celular; não há medição de FPS, temperatura ou fluxo de ar real.

## M0.9 — Correção da cena após avaliação visual (05/11/2026)

**Motivo:** a avaliação real do usuário mostrou linhas orbitais cruzando a máquina e o monitor, chicotes grossos na frente da placa, monitor suspenso e painéis opacos do gabinete/placa-mãe GLB ocultando peças.

- A **versão exibida por padrão** agora usa o gabinete procedural **aberto (cutaway)** e a placa-mãe educativa procedural, porque o gabinete CC0 importado é **fechado** e a placa genérica LGA/DDR5 não é visualmente consistente com o perfil AM4/DDR4. Os dois GLBs permanecem no repositório como recursos licenciados para usos futuros e comparação, mas **não são renderizados por padrão**.
- O teto sólido foi substituído por trilhos, deixando o AIO de 360 mm visível.
- Os chicotes foram reduzidos de espessura, receberam trajetos para **trás** da placa e os cabos diagonais duplicados da GPU/PSU foram removidos.
- O monitor foi baixado e passou a ter uma extensão de apoio ao lado do pedestal.
- Os anéis orbitais e o núcleo energético foram movidos para trás dos objetos, impedindo interseção na frente do gabinete e do monitor.
- O módulo de montagem continua educativo; GPU, PSU e memória DDR5 continuam usando GLB quando aplicável.
- Os scripts de smoke no Chromium passaram a verificar explicitamente `data-case-model="cutaway"` e `data-board-model="educational"`, sem exigir os antigos GLBs opacos.

**Limitação:** aparência e colisões visuais ainda dependem da avaliação em navegador. O build e os testes automatizados não substituem revisão de imagem em desktop e celular. Sem merge automático.

## M1.0 — Polimento fino baseado no protótipo aprovado (06/11/2026)

**Objetivo:** aumentar a legibilidade e o acabamento das peças já presentes, sem alterar módulos, lógica de montagem, paletas, persistência ou comportamento da câmera.

- `CoreVisualParts.tsx`: a placa-mãe educacional ganhou moldura da PCB, socket/retentor, radiadores VRM segmentados, encaixes DIMM, slots PCIe com travas e capacitores, com detalhes visíveis por várias perspectivas. Ventoinhas ganharam difusor e cubo metálico com capas. Novo componente `MemoryStick` cria RAM DDR4 procedural com dissipador usinado, detalhes de contato e luz de acento.
- `CoreSurfaceDetails.tsx`: textura silk-screen da PCB mais organizada e monitor Hyprland renderizado em canvas 1,5× para aumentar nitidez quando ampliado. Terminal, barra superior e dock ganharam microdetalhes preservando cores globais e dados didáticos instalados.
- `CoreCoolingAssembly.tsx`: isolamento e parafusos do radiador, flange/braçadeiras da bomba, aro e marcações, conexões e mangueiras mais controladas. Radiador continua sendo AIO **procedural de 360 mm**.
- `DetailedComputer.tsx`: RAM DDR4 substituída pelos novos dissipadores; GPU CC0 permanece self-hosted com trilhos/marcação externa que não dependem do fallback; monitor reposicionado à frente do gabinete, bezel fino, suporte e ventilação traseira; perfis de vedação da carcaça e frontal com ventoinhas recolocado **dentro** do chassi.
- `CoreCableHarness.tsx`: mantém fios embutidos atrás da placa e os organizadores existentes, para não recriar as colisões visuais de M0.8.
- `CoreHighFidelityAsset.tsx`: mantido como repositório de carregamento dos GLBs de gabinete fechado e motherboard genérica, mas **não ativado** no layout cutaway, para preservar acesso visual às peças e não apresentar uma malha LGA como AM4.
- `scripts/smoke-core-assets.mjs`: registra a vista inicial e uma segunda imagem de órbita 3/4 para facilitar a inspeção de colisões, além do perfil DDR5 e carregamento dos GLBs de GPU/PSU.

**Limitações preservadas:** modelos demonstrativos (não CAD); water cooler não tem identidade comercial validada; GPU GLB genérica de 3 ventoinhas não é réplica fiel da RX 7600; PCB e slot DDR4 procedural são ilustrativos; não representam compatibilidade mecânica ou elétrica. Sem números de benchmark. **Nenhuma mudança na main sem aprovação explícita do usuário.**

## M1.1 — Vista superior e órbitas (06/11/2026)

- Evidência: captura traseira em ângulo alto com três ventoinhas do radiador visualmente atravessadas por uma tela metálica e arcos holográficos cruzando a face fechada do chassi.
- Causa da grade: `PerforatedMesh` do topo estava em `y=1.315,z=-0.38`, à frente de parte dos rotores; reposicionada como tira estreita de ventilação na zona do topo sem impellers (`y=1.293,z=0.345`).
- Causa das órbitas: coordenadas absolutas no mundo `z=-4.1`/`-4.4` eram "fundos" somente da perspectiva inicial. Com `OrbitControls`, a câmera podia girar para trás delas, tornando-as primeiro plano.
- `CameraBackplate` move e orienta os elementos decorativos a cada frame com a matriz da câmera: distância camera-local de 19,5 unidades e escala visual 1,45, ficando fora do volume do PC em qualquer azimute. O posicionamento continua sendo atualizado com redução de movimento ativada, mesmo que a animação dos anéis pause.
- `scripts/smoke-core-assets.mjs` agora também captura `the-core-rear-view.png` após movimento de órbita, além da vista inicial e de três quartos. Fotografias não são métricas CAD nem substituem avaliação humana.
- A `main` permanece intacta; merge somente com aprovação visual explícita.
