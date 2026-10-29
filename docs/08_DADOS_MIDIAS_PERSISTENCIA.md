# 08 — Modelos de dados, armazenamento, mídia e integridade

> **Modelos abaixo são contratos propostos**, não código já existente. O Antigravity pode ajustar nomes/campos com migrações documentadas e testes, preservando comportamento aprovado.

## 1. Entidades propostas

### Theme

```ts
interface Theme {
  id: string;
  name: string;
  kind: 'official' | 'custom';
  basedOnThemeId?: string;
  palette: ColorTokens;
  activeWallpaperProfileId?: string;
  createdAt: string; updatedAt: string;
  schemaVersion: number;
}
```

- Temas oficiais: origem de JSON versionado; **não persistir edições** sobre eles.
- Temas customizados: IDs estáveis UUID, nomes livres e cópia de tokens de origem; aplicação global usa paleta resolvida.
- `ColorTokens` preserva semântica próxima ao JSON end4-pC: superfícies, on-surface, outline, accents, terminal e mapping dos defaults; não usar nomes de cores de personagem como chaves programáticas rígidas.

### MediaAsset

```ts
interface MediaAsset {
  id: string;
  hash?: string;
  kind: 'image' | 'video';
  mimeType: string;
  originalName: string;
  bytes: number;
  width?: number; height?: number; durationSeconds?: number;
  source: 'bundled' | 'user';
  createdAt: string;
  blobKey?: string; // somente para mídias importadas
}
```

- **Biblioteca compartilhada:** asset existe 1 vez, referenciado por múltiplos temas, wallpapers, cards e snapshots. Deduplicação por hash de conteúdo quando viável, não apenas por nome; hashing de arquivos grandes pode ser trabalhado fora da thread principal.
- Metadados e blobs armazenados separadamente; **object URLs** temporárias devem ser revogadas ao desmontar componente.
- Mídias da galeria são referências estáticas/licenciadas; não copiar para IndexedDB sem necessidade.

### Element, Group e Layout

```ts
type ElementKind = 'imageCard' | 'widget' | 'structural';
interface DesktopElement {
  id: string; kind: ElementKind; componentType: string;
  title?: string; parentGroupId?: string;
  x: number; y: number; width: number; height: number; zIndex: number;
  rotationDeg?: number; opacity?: number;
  visible: boolean; locked: boolean;
  mediaAssetId?: string;
  settings: Record<string, unknown>; // validado por schema de cada componente
}
interface DesktopGroup {
  id: string; childIds: string[];
  resizeMode: 'proportional' | 'reflow';
  visible: boolean; locked: boolean;
  transform: {x:number;y:number;scale:number;rotationDeg:number};
}
interface LayoutProfile {
  id: string; themeId: string; wallpaperAssetId: string | null;
  baseViewport: {width:number;height:number};
  elements: DesktopElement[]; groups: DesktopGroup[];
  responsiveOverrides: Record<string, Partial<LayoutProfile>>;
  updatedAt: string;
}
```

**Atenção:** tipo recursivo acima é ilustrativo; ao implementar criar tipo de override **não recursivo** e normalizar entidades no storage para não serializar auto-referências ou repetir mídias. Coordenadas armazenadas no espaço lógico do canvas; arredondamentos/constraints aplicados no render, não destrutivamente nos dados-base.

### VersionSnapshot

```ts
interface VersionSnapshot {
  id: string; themeId: string;
  label?: string; kind: 'auto'|'manual';
  createdAt: string; schemaVersion: number;
  themeState: unknown;  // JSON validado/versionado
  referencedAssetIds: string[];
}
```

Snapshots **não contêm cópias de blobs**. Cada asset referenciado por versão manual deve ser preservado; referências atualizadas transacionalmente. Rotinas de GC de mídia só apagam itens **sem referências em temas, perfis, notas anexadas e snapshots protegidos**.

### RepositoryManifest

```ts
interface RepositoryManifestEntry {
  id: string; repoFullName: string;
  approvedForExplorer: boolean; approvedAsFeatured: boolean;
  ownerConfirmedFinalized: boolean;
  defaultRef: string; lastIndexedCommitSha?: string;
  milestones?: Array<{sha:string; label:string}>;
}
```

- Manifesto fornecido/revisado manualmente pelo proprietário. Bloquear inclusões implícitas.
- Manter **versão de índice** separada do `latest` para saber exatamente quais arquivos/commits o terminal está exibindo.
- Data de indexação e last SHA visíveis quando relevantes.

## 2. Armazenamento local

Banco Dexie/IndexedDB em tabelas normalizadas, por exemplo: `themes`, `media`, `mediaBlobs`, `layouts`, `versions`, `widgetData`, `preferences`, `migrations`. Event log de Undo/Redo pode viver primariamente em memória, com checkpoints persistentes. Nome final e índices exigem revisão antes de implementar.

### Transações e segurança

- Nova mídia: validar MIME por conteúdo quando possível; medir metadata; gravar blob e metadata; se escrita falhar, não criar referências órfãs.
- Novo card: referenciar asset existente e ID único; não duplicar blob.
- Excluir card: remover instância; asset mantido até GC aprovado.
- Excluir asset: consultar dependências em **todos** os temas/perfis/versões, bloquear caso haja referência; oferecer substituição/desvinculação com preview, nunca remoção silenciosa.
- Troca de wallpaper: gravar estado atual validado → carregar/criar destino → confirmar recuperação antes de liberar autosave; evitar sobrescrever destino com layout intermediário.
- Restaurar snapshot: capturar versão atual → validar formato e mídias → restaurar transacionalmente; se alguma mídia faltando, parar com aviso e pedir relink, não apagar itens indiscriminadamente.
- Autosave `debounce` sem mentir sobre sucesso: `pending → saving → saved` ou `error`. Em erro de quota manter última versão válida.

## 3. Versionamento/migrações

- Incrementar `schemaVersion` em alterações incompatíveis. Manter migrations puras testáveis e backup/recovery.
- Temas oficiais carregados do repositório possuem versão de paleta; tema customizado baseado em oficial **não deve mudar silenciosamente** se paleta original sofrer atualização futura.
- Versões automáticas: retenção configurável por armazenamento; manuais são protegidas contra GC automático, mas usuário pode apagá-las.
- Export zip contém `manifest.json` com versão/formato, tokens, perfis, widgets, grupos, assets listados e, quando selecionado, blobs de mídia. Não incluir dados privados do navegador, credenciais ou histórico de URL.
- Import valida schema/limites, hash, path traversal, mídia, inconsistências. Em conflito de IDs, gerar novos IDs para cópias; informar o que foi importado. Não executar nenhum JS/SVG/HTML do pacote.

## 4. UX de armazenamento

- Após importar MP4 grande, mostrar tamanho, duração e previsão do espaço ocupado; sem prometer que quota será suficiente.
- Mostrar resumo local: temas, arquivos, espaço aproximado e possibilidade de limpar **somente itens não utilizados**.
- Oferecer botão Exportar para backup antes de limpeza/importação destrutiva; não pedir login.
- `navigator.storage.estimate()` e `navigator.storage.persist()` podem ajudar, mas não garantem quota nem retenção em todos os browsers; explicar que dados locais podem ser apagados.
- Não enviar mídia pessoal do visitante para analytics, GitHub, serviços de nuvem ou compartilhamento remoto automaticamente.

## 5. Segurança de conteúdo e código

- Conteúdos GitHub são **dados não confiáveis**: tratar strings como texto; Markdown sanitizado; CSP, política para imagens remotas e links externos seguros.
- Não renderizar SVG de usuário sem sanitização/isolation; na primeira versão importação de mídia somente JPEG/PNG/WebP/MP4.
- Arquivos do explorador (`.js`, `.html`, `.sh`) jamais rodam dentro da página. Exibição via CodeMirror readonly.
- Iframes de projetos em origins aprovadas com permissões mínimas; revisar responsabilidades de áudio, fullscreen, cross-origin e storage; jamais usar `allow-same-origin` + `allow-scripts` em documento não confiável hospedado na mesma origem sem isolamento arquitetural.
- Secrets GitHub/API em CI ou server-side protegido, nunca no bundle React nem em comandos do terminal simulado.

## 6. Pseudofluxos críticos

```text
Criar card:
 selecionar asset existente | importar novo
 -> validar/registrar asset uma vez
 -> criar ID da instância e propriedades padrão
 -> adicionar ao layout ativo
 -> autosave transacional, criar evento Undo

Trocar wallpaper:
 snapshot seguro do layout A
 -> selecionar B
 -> se B tem perfil próprio: restaurar B
 -> senão: usuário escolhe manter layout base/cópia
 -> validar posições e referências
 -> mostrar B / confirmar autosave

Restaurar versão:
 snapshot de segurança do estado presente
 -> confirmar conteúdo/mídias da versão alvo
 -> restaurar atomically / rollback em erro
 -> manter versões manuais + assets referenciados

Aplicar tema ao portfólio:
 validar theme.palette -> resolver tokens semânticos
 -> persistir activeThemeId
 -> transição das cores CSS/uniforms Three.js
 -> manter scroll, câmera, projetos e wallpaper próprio do Studio
```

## Persistência — versões nomeadas locais (M6, 29/10/2026)

O armazenamento `portfolio-theme-studio-desktop-v1` continua com o `layouts` store e schema original. Cada slot recebe um registro `versions:<slot>` com metadados validados (ID, nome, data) e até cinco registros independentes `version:<slot>:<id>` com imagens Blob originais. O layout salvo permanece na chave `<slot>`; não há migração destrutiva.

Criação só usa estado **já salvo**, com confirmação na UI para restaurar e excluir. Na restauração, a mesma transação `readwrite` guarda primeiro o layout corrente como versão de segurança e só então grava o layout restaurado. Erros, quota e exceder o limite fazem rollback integral. Não são excluídas versões automaticamente. Testes simulam commit e abort de transação, isolamento e validação de registros. Não equivale a armazenamento seguro fora do navegador — o usuário precisa exportar `.ptsbackup` para backup externo.

## Perfis públicos de widgets (M6, 29/10/2026)

O QML `WallpaperLayouts.qml` usa um JSON **local** por wallpaper (`wallpaper_widget_layouts.json`); nenhum sincronizador automático está autorizado. O viewer do portfólio aceita importação **local**, limitada a 1 MiB, extrai somente 21 IDs de widgets aprovados e campos numéricos `x,y,width,height,cardWidth,cardHeight` de até 100 perfis. Não preserva `path`, `text`, notas, tokens ou conteúdo pessoal. Os perfis higienizados podem ser guardados em `localStorage["portfolio.hyprland.sanitized.layout.v1"]` e exportados manualmente. Não há envio silencioso ao repositório.

Para publicar posições para todos, o proprietário precisa revisar o arquivo gerado `widget-layouts-publico.json` e aprovar sua inclusão em `src/data/published-widget-layouts.json`. Essa versão começa com `profiles: []`, porque as posições pessoais atuais **não estão acessíveis no GitHub** e não devem ser inventadas. Coordenadas QML livres são aproximadas à proporção de 3440×1440 e o editor de quatro layouts IndexedDB permanece separado e não é modificado por essa importação.
