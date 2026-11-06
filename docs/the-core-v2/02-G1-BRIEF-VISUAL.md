# THE CORE v2 — G1 | Brief de qualidade visual do gabinete
**Estado:** proposta de referência, pendente de aprovação do autor.  
**Base física sugerida:** Corsair 5000D AIRFLOW preto **como referência de layout**, não como asset 3D liberado.  
**Protótipo v1:** mantido sem alteração.

## Decisão visual proposta

Uma torre ATX preta, de aspecto industrial discreto e **fotorrealismo de produto**, apresentada num estúdio neutro de iluminação branca. A identidade Changli/vermelho deve existir em detalhes da interface e em RGB discreto, não alterar o material da torre nem tornar a malha um objeto holográfico.

A lateral envidraçada pode ser fechada na apresentação de produto e **ocultada/aberta com controle dedicado** na inspeção, sem desaparecer o chassi. Os componentes são posicionados por **ancoragens** e não por tamanho adaptado/escala não uniforme da malha.

## Referência dimensional: NÃO confundir com uma réplica aprovada

Dados do Corsair 5000D AIRFLOW preto, segundo sua ficha oficial:
- Largura: **245 mm** (eixo X sugerido na cena).
- Altura: **520 mm** (eixo Y sugerido).
- Profundidade: **520 mm** (eixo Z sugerido).
- Placa-mãe: ATX, Micro-ATX, Mini-ITX, E-ATX (limitações verificadas em manual oficial).
- GPU até **420 mm** (espaço máximo publicado; montagem específica ainda precisa inspeção).
- Radiador até **360 mm** no topo/frente/lateral; topo aceita **3 ventoinhas de 120 mm**.
- Fonte ATX sob cobertura inferior e cabos roteados atrás da bandeja.

A implementação pode usar um **gabinete genérico, originalmente modelado e coerente**, desde que claramente não seja rotulado ou representado como réplica oficial Corsair. Nenhuma dimensão física deve ser tratada como tolerância ou certificação.

Fonte: https://www.corsair.com/br/pt/p/null/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-pc-case-black-cc-9011210-ww

## Vistas exigidas para o gate G1

### V1 — Produto frontal ¾
- Silhueta real, frente com mesh perfurado, entrada de ar e trilhos visíveis sem parecer grade desenhada sobre fans.
- Painel lateral fechado com reflexos reais controlados, sem fios ou efeitos de background sobrepostos.
- Proporção de pés, teto e bordas convencem sem logo.

### V2 — Interno lateral (sem vidro)
- Bandeja de placa-mãe ATX, espaçadores, fixação de GPU/slots PCIe, passagem de cabos e PSU shroud.
- Orifícios de cabeamento, espaço traseiro e ancoragens desenhados como parte do chassi, não encaixados à força.
- Preparação para AMD AM4 + DDR4 no catálogo inicial; gabinete sozinho não define a marca da placa.

### V3 — Topo
- Três posições de fan de 120 mm e/ou radiador 360mm com medidas de espaçamento plausíveis.
- Tampa/filtro superior **não encostam nas pás**; em close-up mostrar moldura, filtro e plano dos rotores em camadas diferentes.
- I/O superior com botões/portas e parafusos coerentes.

### V4 — Traseira
- Recorte de I/O da placa-mãe, exaustão, sete slots PCIe e abertura ATX da PSU.
- Pés, parafusos e bordas modeladas — sem grandes faces vazias, detalhe falso que flutua ou textura de garagem.
- Sem arcos holográficos à frente do chassi durante o giro.

### V5 — Close de material
- Comparar metal pintado, vidro, mesh, borracha, conector e alumínio.
- Texturas PBR verificadas: metalness, roughness, normal, ambient occlusion. Vidro com espessura e material críveis.
- Luz neutra, sem bloom ou neon. Se parecer plástico genérico, REPROVAR.

## Contrato de asset (a validar durante inspeção)

Organização proposta de nós GLB: 
`ChassisFrame`, `SideGlass`, `RearServicePanel`, `FrontMesh`, `TopMesh`, `MotherboardTray`, `PSUShroud`, `TopFanMounts`, `FrontFanMounts`, `Feet`, `RearIO`, `ExpansionSlots`.

- Uso de nomes é **meta de exportação/adaptação**, não descrição de assets já existentes.
- Origem/pivôs devem permitir abrir/remover vidro e tampas.
- Adotar X largura, Y altura e Z profundidade; frente do gabinete +Z na cena. Documentar a transformação a partir da origem do GLB.
- Escala em **metros**, com transformação uniforme; sem deformar `scale.x/y/z` separadamente para caber no display.
- As posições de encaixe serão declaradas como anchors em dados, com unidades documentadas.
- A orientação geral da câmera não pode exigir que o objeto flutue acima da base nem esconda componentes.

## Materiais propostos

| Elemento | Material-alvo | Reprovar se |
|---|---|---|
| Estrutura | Aço preto fosco pintado | Preto totalmente sem relevo / highlight plástico |
| Painel frontal | Mesh perfurado de geometria ou alpha com sombra adequada | Textura plana por cima das ventoinhas |
| Vidro | Temperado ligeiramente fumê, espessura crível | Riscos artificiais ou vidro impede seleção |
| Bandeja ATX | Aço com slots e bordas dobradas | Painel simples retangular sem montagens |
| PSU shroud | Metal pintado e ventilações discretas | Buraco preto sem construção |
| Parafusos/suportes | Níquel/anodizado controlado | Aros brilhantes exagerados ou volumes flutuantes |

## Critérios de aprovação visual

- [ ] Render **V1 frontal ¾** sob luz neutra.
- [ ] Render **V2 lateral aberto** sob luz neutra.
- [ ] Render **V3 topo** mostrando espaço verdadeiro para 360mm.
- [ ] Render **V4 traseira** sem peças falsas.
- [ ] Render **V5 close-up** de materiais.
- [ ] Vidro/capas/montagens são separáveis ou possuem estratégia claramente documentada.
- [ ] O modelo não muda proporção ao mudar o canvas de 16:9 para ultrawide.
- [ ] Autor julga a aparência realista **antes da integração** com GPU e placa-mãe.
- [ ] Licença de cada asset e marcas revisada, incluindo redistribuição de GLB autônomo no site.

## Gate

**Somente com asset inspecionado e aprovação visual explícita o trabalho de implementação avança para G2.** Até então este brief pode orientar pesquisa e produção de referência, mas não ativa novo componente em produção nem substitui o projeto v1.
