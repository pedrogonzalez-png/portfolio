import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import type { ViewUpdate } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { codeGrammarExtensions, detectCodeGrammar } from "./codeLanguages";

interface CodeMirrorProps {
  content: string;
  fileName?: string;
  readOnly?: boolean;
}

// Grammars are loaded on demand. Viewport decorations supply the Changli
// syntax colors independently of deprecated legacy CodeMirror packages.
// This decorates text; it never executes contents of a repository.
const tokenRegex = /\/\/[^\n]*|\/\*[^\n]*?(?:\*\/|$)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\x60(?:\\.|[^\x60\\])*\x60|\b(?:const|let|var|function|class|extends|implements|interface|type|import|export|from|default|return|if|else|for|while|switch|case|break|continue|async|await|try|catch|throw|new|this|super|public|private|protected|readonly|as|typeof|instanceof|void|in|of|yield|static|enum|keyof|declare|namespace|abstract|override)\b|\b(?:true|false|null|undefined|NaN|Infinity)\b|\b\d+(?:\.\d+)?\b|#[\da-fA-F]{3,8}\b|<\/?[a-zA-Z][\w-]*|(?:--)?[\w-]+(?=\s*:)/g;
const keywordPattern = /^(?:const|let|var|function|class|extends|implements|interface|type|import|export|from|default|return|if|else|for|while|switch|case|break|continue|async|await|try|catch|throw|new|this|super|public|private|protected|readonly|as|typeof|instanceof|void|in|of|yield|static|enum|keyof|declare|namespace|abstract|override)$/;

function tokenClass(value: string): string {
  if (value.startsWith("//") || value.startsWith("/*")) return "cm-syntax-comment";
  if (value.startsWith('"') || value.startsWith("'") || value.startsWith(String.fromCharCode(96))) return "cm-syntax-string";
  if (value.startsWith("<")) return "cm-syntax-tag";
  if (keywordPattern.test(value)) return "cm-syntax-keyword";
  if (/^(true|false|null|undefined|NaN|Infinity)$/.test(value)) return "cm-syntax-atom";
  if (/^\d/.test(value) || value.startsWith("#")) return "cm-syntax-number";
  return "cm-syntax-property";
}

const matcher = new MatchDecorator({
  regexp: tokenRegex,
  decoration: (match) => Decoration.mark({ class: tokenClass(match[0]) }),
});

const tokenColors = ViewPlugin.fromClass(class {
  decorations;
  constructor(view: EditorView) {
    this.decorations = matcher.createDeco(view);
  }
  update(update: ViewUpdate) {
    this.decorations = matcher.updateDeco(update, this.decorations);
  }
}, { decorations: (plugin) => plugin.decorations });

const changliTheme = EditorView.theme({
  "&": { backgroundColor: "#170e12", color: "#f7e7d8", fontSize: "13px", height: "100%" },
  ".cm-content": { fontFamily: "ui-monospace, monospace", padding: "1rem", minHeight: "250px" },
  ".cm-gutters": { backgroundColor: "#211418", color: "#bc8d77", border: "none" },
  ".cm-activeLineGutter": { backgroundColor: "rgba(201,106,66,.14)" },
  ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, monospace" },
  ".cm-syntax-comment": { color: "#947f87", fontStyle: "italic" },
  ".cm-syntax-string": { color: "#dfbd8e" },
  ".cm-syntax-tag": { color: "#e9a1a7" },
  ".cm-syntax-keyword": { color: "#ed8a66", fontWeight: "600" },
  ".cm-syntax-atom": { color: "#cdb1ed" },
  ".cm-syntax-number": { color: "#eab85b" },
  ".cm-syntax-property": { color: "#f2c3a4" },
});

export function CodeMirror({ content, fileName = "", readOnly = true }: CodeMirrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;
    let cancelled = false;
    let view: EditorView | null = null;

    const mount = async () => {
      let grammarExtensions: Extension[] = [];
      try {
        grammarExtensions = await codeGrammarExtensions(fileName);
      } catch {
        grammarExtensions = [];
      }
      if (cancelled) return;
      const state = EditorState.create({
        doc: content,
        extensions: [
          EditorState.readOnly.of(readOnly),
          EditorView.editable.of(!readOnly),
          lineNumbers(),
          highlightActiveLineGutter(),
          keymap.of(defaultKeymap),
          ...grammarExtensions,
          ...(detectCodeGrammar(fileName) === "markdown" ? [EditorView.lineWrapping] : []),
          tokenColors,
          changliTheme,
        ],
      });
      view = new EditorView({ state, parent });
    };

    void mount();
    return () => {
      cancelled = true;
      view?.destroy();
    };
  }, [readOnly, content, fileName]);

  return <div ref={containerRef} className="terminal-codemirror"
    data-language={detectCodeGrammar(fileName)}
    aria-label={"Conteúdo readonly: " + (fileName || "arquivo")} />;
}
