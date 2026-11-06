# THE CORE v2 — G1 | Inspeção real do gabinete CC0 Innerscene
**Data da execução:** 2026-11-06  
**Estado:** **REPROVADO como modelo visual final**; arquivo válido e reutilizável somente como referência de estrutura ou teste.  
**Aprovação do autor para modelo final:** ainda não solicitada; não houve integração com a cena principal.

## Prova de execução — dados obtidos de arquivo GLB verdadeiro

- Fonte original: https://www.innerscene.com/tools/library/3d-parts/open-mid-tower-pc-case-089c34c8
- Endpoint de download do publicador: https://www.innerscene.com/api/library/open-mid-tower-pc-case-089c34c8/download
- Licença declarada pelo publicador: CC0. Verificar também https://www.innerscene.com/tools/library/terms
- Tamanho baixado: **21.397.532 bytes**.
- SHA-256 do arquivo baixado: `3c3c94cd948f91285110e57324067c7f827efa278b2f210ea8cae137e282bde7`.
- Assinatura GLB `glTF` v2, bytes e tamanho declarados coerentes no cabeçalho: **PASSOU**.
- Geometria carregada por `GLTFLoader` do Three.js em Chromium (não imagens imaginadas): **PASSOU**.
- **54 Meshes**, **23.944 triângulos** aproximados, **30 materiais**.
- Bounding box observada do GLB após transformação para Y-up: X **0,476760 m**, Y **0,475800 m**, Z **0,491600 m**. Inclui vidro aberto; não equivale ao corpo fechado.
- Hierarquia inclui nós com nomes como `Tempered_glass_side_door_(open)`, `Motherboard_tray`, `PSU_shroud`, `Top_fan-mount_rails`, `Front_fan_1_blades`, `Rear_fan_frame`, `Rubber_feet` e `Side_panel_hinge_knuckles`.
- **Observação:** nós com nomes distintos ajudam a editar, mas não comprovam pivôs mecânicos corretos, tampas removíveis em boa qualidade ou animações prontas. Posicionamento das peças será verificado separadamente caso esse asset volte a ser utilizado.

### Evidência reprodutível

- Execução: https://github.com/pedrogonzalez-png/portfolio/actions/runs/42144144329
- Artefato temporário da execução: `the-core-v2-g1-case-candidate-audit` (4 PNGs + `audit.json`, sem incluir o GLB).
- Preview e capturas originados de `the-core-v2-g1-viewer.html`, `scripts/the-core-v2/render-g1-case.mjs` e workflow `.github/workflows/the-core-v2-g1-render.yml`.
- Os rótulos das câmeras `front`/`rear` indicam direções **no render de teste**; a orientação anatômica do asset não foi comprovada por análise de pivôs de peças externas. Usá-los como ângulos de auditoria, não como laudo CAD.
- O arquivo GLB foi baixado **somente no runner de auditoria**, não foi incluído em `public/assets` do repositório nem integrado à UI do portfólio.

## Julgamento visual

### Aparência observada
- O modelo possui silhueta básica de torre, bandeja ATX, tampas e separação de nós úteis para estudar hierarquia.
- **Não** atinge o alvo de apresentação fotorrealista: as partes internas e o painel da PSU apresentam baixa riqueza de forma/material, a porta lateral aberta domina o enquadramento e algumas superfícies grandes parecem planas sob luz de estúdio.
- A sensação de volume e a qualidade de materiais PBR são insuficientes para substituir o protótipo atual com garantia de melhoria perceptível.
- Há um único ventilador interno muito evidente na parte inferior/lateral em algumas vistas; não se pode validar o encaixe de um AIO real com ele nem deduzir a disposição final do radiador.
- A área do topo não demonstrou, por render ou por medida das ancoragens, **folga para radiador de 360 mm + espessura de ventoinhas**.
- Rótulos e materiais apresentados pelo preview não foram comparados com fotografia CAD do próprio modelo; o render é usado para **triagem estética**, não certificação de engenharia.

### Veredito da auditoria
**REPROVADO no gate de realismo G1.**
Apesar de GLB válido, CC0 declarado e hierarquia separada, não houve comprovação de aparência suficiente nem do radiador 360 mm. **Não avançar com este asset para integração, G2 ou `main`.**

## Alternativas — pesquisa, não aprovadas

| Referência / fonte | Atrativo | Limitação |
|---|---|---|
| Corsair 5000D AIRFLOW físico | Proporções e layout realista, suporta radiador 360 no topo; documentação oficial: https://www.corsair.com/br/pt/p/pc-cases/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-pc-case-black-cc-9011210-ww | **Não há um GLB redistribuível de fidelidade aprovada**; marca e modelos oficiais não autorizados por fotos do site |
| Sketchfab **Gaming PC Case / Nightshark** de dylanheyes | Malha publicada com 378,7k triângulos e licença CC BY declarada: https://sketchfab.com/3d-models/gaming-pc-case-5f9261fef2874bf9ae39dd0f4029e978 | Não baixado nem renderizado; não comprova suporte a 360 mm no topo; exigir atribuição e verificação de marcas |
| Grab3D Gaming PC | GLB CC0 com pivôs distintos e texturas, mas o próprio publicador descreve como *Lightweight Stylized*: https://grab3d.com/models/electronics/gaming-pc/ | O estilo não é objetivo de fotorrealismo e o asset já contém outras peças; descartar como base de gabinete isolado sem inspeção |
| Criação original detalhada em Blender, medidas reais publicadas | Maior controle sobre tampas, PSU shroud e montagem do 360 mm, sem necessidade de usar malha de terceiros | Exige trabalho de modelagem real: não substituí-lo por blocos procedurais do Three.js nem afirmar que já foi feito |

## Próximo gate

**G1-b — prova da estrutura realista (ainda pendente):**
1. Avaliar mais um modelo externo com licença verificada, caso possa ser baixado de forma legítima e exportado em glTF.
2. Caso não haja asset satisfatório, desenvolver uma malha original detalhada no Blender com referência dimensional verificada, sem uso de CAD proprietário.
3. Quatro vistas em luz neutra + close de materiais e dos trilhos de radiador 360, sem GPU/RAM/hologramas.
4. Autor aprova **visualmente** a silhueta e o interior do gabinete antes de avançar para G2.

## Segurança do processo
- Nenhum merge na `main`.
- Nenhum GLB importado ao site em G1.
- Teste de lint do script corrigido no commit `d105cf6f` (CI voltou a passar).
- O build pode passar sem entregar realismo: critérios visuais continuam independentes da CI.
