# THE CORE — Rebuild Realista v2
**Status:** PLANO / aguardando autorização para implementação  
**Data:** 2026-11-06  
**Branch de planejamento:** `feat/the-core-vertical-slice-m0`  
**PR existente:** https://github.com/pedrogonzalez-png/portfolio/pull/51  
**Regra:** este documento **não aprova implementação**, alteração da `main`, merge ou substituição da versão atual sem revisão.

## 1. Decisão de produto

Transformar o laboratório `THE CORE / Saberes` em um **showcase e simulador de montagem de PC visualmente realista**, tomando a qualidade e legibilidade do **BuildCores** como referência funcional/visual (https://www.buildcores.com/). Não copiar código, interface nem modelos proprietários. Manter identidade do portfólio apenas no entorno, tipografia, microinterações e paleta; o hardware não será exageradamente tingido de vermelho/azul.

**Estética aprovada como direção:**
- Primeiro, silhuetas críveis, dimensões e montagem fisicamente plausíveis.
- Segundo, materiais PBR legíveis sob iluminação neutra (metal pintado, alumínio, plástico, vidro, PCB, borracha).
- Terceiro, iluminação de apresentação cinematográfica **discreta**.
- Por último, UI e HUD. O PC é o protagonista; órbitas/partículas são opcionais e ausentes no modo de inspeção.
- Modelo realista antes de efeitos; **não** adicionar mais caixas, adesivos/labels ou superfícies procedurais como substituto do formato real.

**Não é escopo:** clonar BuildCores, reproduzir seu acervo, criar comparação comercial de preços, inventar desempenho/temperatura, validar segurança elétrica, afirmar medidas de compatibilidade CAD sem dados.

## 2. Diagnóstico comprovado no repositório

A versão v1 usa `src/features/the-core/DetailedComputer.tsx` com estruturas procedurais, `CoreVisualParts.tsx`, `CoreCoolingAssembly.tsx`, `CoreCableHarness.tsx` e `CoreSurfaceDetails.tsx`. `CoreScene.tsx` controla câmeras/órbitas/plataforma. O catálogo educativo e as regras de montagem ficam em `coreModel.ts`.

No registro `public/assets/the-core/README.md` há cinco GLBs genéricos:
- GPU de **três ventoinhas**, mas a ficha de demonstração afirma RX 7600; não corresponde ao modelo de referência do usuário;
- gabinete **fechado**, não expõe bem a montagem;
- motherboard **LGA/DDR5**, incoerente com perfil inicial **B550/AM4/DDR4**;
- fonte genérica rotulada **750W** usada para representar a **GX 700W**;
- módulo DDR5 que não substitui DDR4.

Mesmo com texturas e geometria detalhadas, essa mistura não possui linguagem de construção/material consistente. **Corrigir a aparência das peças e os encaixes, não apenas iluminação.**

### 2.1 Inventário que não deve ser inferido

O catálogo de demonstração usa `r5-5600/b550/ddr4/rx7600/gx700`. **B550 e DDR4 são exemplos educativos**, não prova do fabricante exato da motherboard, RAM, gabinete e AIO. Só afirmar réplica fiel de uma peça se houver referência de fabricante/modelo e medidas verificáveis. Caso contrário rotular `representação genérica da classe` e evitar marcas/logos não licenciados em geometria de terceiros.

## 3. Escopo de reutilização

| Estado | Arquivos/sistemas | Decisão |
|---|---|---|
| PRESERVAR | `coreModel.ts`, checkBuild, installPart | Lógica educativa e casos AM4/AM5 e DDR4/DDR5 |
| PRESERVAR | `CoreExperience.tsx`, HUD/módulos, navegação do portfólio | Montagem, Overclock, Linux, abrir/fechar, teclado/touch |
| PRESERVAR | Layout e integração de temas, redução de movimento, persistência | Contratos de UX e acessibilidade |
| REAPROVEITAR COM ADAPTAÇÃO | `CoreScene.tsx` | Controles de câmera, luz, enquadramento e fallback |
| REAVALIAR | `GpuAsset.tsx`, `CoreHighFidelityAsset.tsx`, `CorePeripheralAsset.tsx` | Loader/caches reutilizáveis; não reaproveitar escalas/rotações arbitrárias |
| DESATIVAR NA V2 | `DetailedComputer.tsx`, `CoreVisualParts.tsx`, `CoreCoolingAssembly.tsx`, `CoreCableHarness.tsx`, `CoreSurfaceDetails.tsx` como geometria principal | Deixar a v1 intacta, apenas referência/rollback |
| REDUZIR/RETIRAR DA INSPEÇÃO | órbitas, núcleo, plataforma emissiva, etiquetas frontais | Fora do modo de inspeção; ambientação restrita ao modo hero |
| AUDITAR ANTES DE USAR | cinco GLBs genéricos existentes | Não serem promovidos por serem CC0; realismo e coerência prevalecem |

**Não apagar a v1 agora.** Implementação eventual deve ser isolada por novo componente/seleção de cena, sem mudar o catálogo nem bloquear rollback.

## 4. Diretrizes de visual-alvo

### 4.1 Gabinete — prioridade máxima

- Modelo de torre ATX realista, com lados, topo, tampa traseira, pés, filtro de ar, trilhos, parafusos, portas e tampa de fonte separados.
- Portas e vidro com espessura e materiais adequados; opção de ocultar vidro/painel para inspeção sem deixar peças flutuantes.
- Câmara PSU, espaço atrás da motherboard e passagem de cabos; estrutura não atravessa RAM, GPU nem radiador.
- Se for modelo genérico, escolher um gabinete de visual neutro e dimensões plausíveis; não prometer fidelidade ao gabinete físico do usuário sem identificação.

### 4.2 Placa-mãe

- Para o perfil inicial, **AM4 + DDR4** (B550 de exemplo). Substituir o GLB LGA/DDR5 incoerente.
- PCB, sistema de retenção da CPU, VRM, dissipadores, slots DIMM, PCIe x16, M.2, conectores SATA/ATX, I/O e furos de fixação com aparência e posicionamento consistentes.
- A placa precisa parecer materialmente uma PCB sob luz neutra; não usar traços aleatórios como substituto dos conectores reais.
- Perfis AM5/DDR5 exigem modelo/variante correspondente. Nunca mostrar DDR5 fisicamente inserida em slot DDR4.

### 4.3 GPU

- O perfil do usuário é Radeon RX 7600 Gigabyte, mas o catálogo só informa `rx7600`: validar variante exata antes de afirmar réplica.
- Preferir modelo com quantidade real de ventoinhas, espessura, shroud, heatsink, bracket e saídas de vídeo coerentes.
- Se só houver GPU genérica, declarar isso na interface e **não aplicar rótulo de modelo exato no chassi**.
- Inspeção independente e posição no PCIe da motherboard, sem GPU atravessar a tampa.

### 4.4 AIO 360 mm, RAM, PSU e monitor

- Radiador **360 mm com três ventoinhas**, BOM de fixações, bomba e duas mangueiras com curvas/diâmetros críveis. Evitar substituir por 240 mm.
- Memória DDR4 inicial com contatos, slots e dissipadores verdadeiros visualmente; DDR5 separada.
- PSU com corpo de ATX, gabinete, grelha, fixação e cabos na traseira; logotipo/wattagem só quando licença e modelo forem compatíveis.
- Monitor: proporções e suporte plausíveis, desktop Arch/Hyprland em textura de boa resolução, nenhuma interseção com gabinete; tela mantida clicável.

### 4.5 Materiais e luz

- Adotar **glTF 2.0 PBR metallic/roughness** com mapas base color, roughness, metalness, normal, AO e emissive somente onde fizer sentido.
- Estúdio: fundo neutro, luz principal suave, fill e recorte; reflexos moderados no vidro e arestas sem bloom excessivo.
- Testar primeiro com luz **branca/neutra**; se não parecer realista sem efeitos, peça é reprovada.
- Evitar metalness alto em plástico e refletores emissivos no PCB; manter color management consistente.

Referências técnicas:
- glTF PBR (Khronos): https://www.khronos.org/gltf/pbr
- Blender glTF export: https://docs.blender.org/manual/en/5.3/addons/scene_gltf2.html

## 5. Estratégia de ativos: HÍBRIDA, com verificação obrigatória

**Preferência:** GLB/glTF detalhado, comercialmente utilizável, para peças principais; procedural restrito a ferragens, cabos, animação de ventoinha, highlights e seleção.

Antes de importar, cada candidato deverá ter:
- link de origem, autor/publicador, licença e permissões comerciais redistribuíveis **verificadas individualmente** (inclusive marcas/texturas);
- medidas físicas plausíveis, eixos normalizados, pivôs e coordenadas das ancoragens;
- capturas de frente, lateral, topo e traseira sob luz neutra;
- contagem de triângulos/materiais/texturas e tamanho comprimido;
- compatibilidade visual com a mesma família de peças (não juntar 5 modelos realistas incompatíveis);
- representação assinalada **EXATA / GENÉRICA COERENTE / NÃO APTA**.

**Registro sugerido:** `docs/the-core-v2/ASSET_AUDIT.md` (planejado, não criar na fase documental).

Modelos CC0 Innerscene continuam como referência técnica e podem ser usados se passarem no visual; licença e disponibilidade: https://www.innerscene.com/tools/library/terms . **CC0 não garante realismo, medidas corretas nem autorização de uso de marcas.**

Sem asset adequado, modelar o componente específico no Blender com referências verificadas ou marcar item como pendente. **Não inserir um bloco genérico e chamá-lo de finalizado.**

## 6. Contrato de integração proposto (não implementado)

Arquitetura preferida:
- `CoreSceneV2.tsx`: cena e câmeras com isolamento da interface v1;
- `HardwareAssemblyV2.tsx`: conjunto com sistema de ancoragens em unidade métrica ou milímetros convertidos explicitamente;
- `HardwareAsset.tsx`: GLB loader, estados load/error, variantes e liberação de recursos;
- `hardwareManifest.ts`: id do catálogo -> visual compatível, fonte/licença/medidas/LOD/anchors;
- `HardwarePresentation.tsx`: modo showcase e modo inspect, luz e vidro;
- `HardwareInteractions.tsx`: seleção, highlight, explode view e transições; sem alterar lógica da compatibilidade.

**Regra rígida de escalas:** nada de `normalize()` que deforme cada eixo do GLB para caber num volume estilizado. Converter unidades uniformemente e usar medidas reais ou assumidas como **aproximadas** quando for um demonstrativo.

**Modos separados:**
- `SHOWCASE`: PC montado com enquadramento cinematográfico discreto;
- `INSPECT`: iluminação neutra, órbitas desativadas, destaque apenas na peça selecionada, vidro opcionalmente escondido;
- `ASSEMBLY`: remoção/inserção nos anchors com erros explicados em texto;
- `OVERCLOCK/LINUX`: UI e lógica preservadas sem simulações falsas.

## 7. Etapas sequenciais (milestones) e portões de aprovação

### M2-G0 — Congelar referência e contratos (SEM implementação)
- [x] Registrar diagnóstico da v1 e escopo da reconstrução neste documento.
- [ ] Aprovar pelo autor o visual-alvo, layout geral e o nível de fidelidade (genérico realista vs réplica específica).
- [ ] Definir imagens de referência para: frente, lado aberto, traseira, topo e interior, sem copiar modelos de terceiros.
- [ ] Registrar versão atual/rollback e aceite dos critérios abaixo.
**Gate:** não começar código 3D antes da aprovação de M2-G0.

### M2-G1 — Auditoria de assets e prova de gabinete
- [ ] Selecionar/obter gabinete GLB adequado, licenciado e com medidas e pivot verificados.
- [ ] Comparar candidato em render neutro, isolado, 4 perspectivas, sem HUD e sem órbitas.
- [ ] Mostrar uma foto/render original de referência ao lado do modelo em escala semelhante.
- [ ] Autor aprova a silhueta do gabinete **antes** da primeira integração.
**Gate:** se parecer maquete, trocar/modelar outro gabinete em vez de polir materiais.

### M2-G2 — Conjunto completo estático realista (sem lógica)
- [ ] Placa-mãe AM4/DDR4 plausível; GPU RX 7600 adequada ou claramente genérica; AIO 360; RAM DDR4; PSU.
- [ ] Cada peça alinhada a fixações reais, sem interseções.
- [ ] Câmeras: ¾ frontal, interior lateral, topo, traseira, close de GPU, close de placa.
- [ ] Testes na luz neutra e com efeitos desligados.
**Gate:** o autor aprova a máquina inteira estática antes da interatividade.

### M2-G3 — Integração dos módulos sem regressão
- [ ] Usar o catálogo e as regras do `coreModel.ts`, sem reescrever seus casos.
- [ ] Encaixar/remover CPU, RAM, GPU, motherboard e PSU; aviso de incompatibilidade preservado.
- [ ] Câmera mouse/touch, foco/seleção, controle de vidro, atalhos e modo redução de movimento.
- [ ] Overclock e Linux intactos; fluxo de abrir/fechar e persistência funcionando.
- [ ] Fallback claro para asset ausente, sem rótulo de réplica exata em modelo genérico.
**Gate:** regressões funcionais = bloqueio.

### M2-G4 — Materiais, performance e apresentação
- [ ] Materiais PBR ajustados sob luz neutra.
- [ ] Sombras e reflexos discretos, RGB controlado, HUD não obstrui peças.
- [ ] LOD de GPU/case/board e texturas com resoluções por dispositivo quando necessário.
- [ ] Comprimir/otimizar GLBs, mas nunca sacrificar silhuetas.
- [ ] Medir VRAM, chamadas de desenho, tempo de carregamento, FPS, quedas de frame e tamanho total no desktop e mobile. **Os números serão medidos, nunca inventados.**
- [ ] Testar caso real ultrawide 3440×1440 e layout celular, inclusive sem WebGL robusto.
**Gate:** aprovação de UX e desempenho em equipamentos-alvo.

### M2-G5 — Validação e revisão para merge
- [ ] Comparações antes/depois e referência em mesmos ângulos, iluminação e zoom.
- [ ] Testes automatizados: typecheck, lint, unit/integration, build, smoke Chromium desktop+mobile, GLB load/fail, compatibilidade.
- [ ] Testes manuais da câmera em 360° e alto/baixo, sem painel ou objeto cruzando incorretamente.
- [ ] Direitos/licenças registrados no repositório; nada vindo de extração de modelos proprietários.
- [ ] Aprovação explícita do autor para fazer merge.
**Gate:** sem aprovação, manter só na branch experimental.

## 8. Definição de pronto — critérios visuais verificáveis

Qualquer componente é **REPROVADO** se:
1. A silhueta não parece uma peça de PC real quando vista sem rótulos;
2. Um conector, slot, vidro, cabo ou ventoinha atravessa outro objeto indevidamente;
3. Escala/quantidade de ventoinhas/tipo de slot contradizem a configuração anunciada;
4. Luz neutra expõe aspecto de blocos/placeholder;
5. O realismo depende de bloom, neon ou texto cobrindo superfícies;
6. A câmera traseira/superior revela faces vazias;
7. Um modelo genérico é anunciado como réplica exata;
8. Licença do modelo ou das marcas/texturas não foi verificada;
9. O modelo bloqueia clicks, acessibilidade, celular ou desmontagem.

Aprovar um componente exige **4 vistas + 1 close-up** do próprio asset, comparadas com a referência escolhida. Aprovar o PC completo exige inspeção 360° em desktop e prova em mobile. Separar aprovação visual de CI: compilar **não significa** ficar convincente.

## 9. Entregáveis por milestone

| Marco | Entrega verificável | Aprovação |
|---|---|---|
| G0 | Documento, referências, matriz de critérios | Autor autoriza iniciar |
| G1 | Gabinete GLB isolado com 4 vistas e licença | Autor aprova gabinete |
| G2 | Build completo estático, sem efeitos | Autor aprova realismo |
| G3 | Demo interativa em branch de teste | Autor aprova funcionalidade |
| G4 | Qualidade visual + métricas reais de desempenho | Autor aprova experiência |
| G5 | PR pronta com testes e evidência, plano de rollback | Autor decide merge |

## 10. Primeiro passo ao receber autorização

**Não começar modelando 8 peças de uma vez.** Escolher **um** gabinete de referência e conferir medidas/ativos disponíveis para o perfil AM4/DDR4/RX7600 + AIO 360. Mostrar quatro vistas e seus detalhes em luz neutra. Só com aprovação do gabinete escolher motherboard e demais componentes. Se nenhum asset satisfizer a qualidade-alvo/licença, parar a integração e preparar a modelagem no Blender — **nunca cair no fallback de caixas apenas para avançar a checklist**.

## Referências auditáveis

- BuildCores: https://www.buildcores.com/
- PBR glTF — Khronos: https://www.khronos.org/gltf/pbr
- Blender glTF: https://docs.blender.org/manual/en/5.3/addons/scene_gltf2.html
- Innerscene terms (CC0 vs direitos de marcas): https://www.innerscene.com/tools/library/terms
- Inventário existente: `public/assets/the-core/README.md`
- Regras educativas existentes: `src/features/the-core/coreModel.ts`
