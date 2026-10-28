import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";

interface CodeMirrorProps {
  content: string;
  fileName?: string;
  readOnly?: boolean;
}

export function CodeMirror({ content, fileName = "", readOnly = true }: CodeMirrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const isMarkdown = /\.md(?:own)?$/i.test(fileName);
    const state = EditorState.create({
      doc: content,
      extensions: [
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        lineNumbers(),
        highlightActiveLineGutter(),
        keymap.of(defaultKeymap),
        ...(isMarkdown ? [markdown(), EditorView.lineWrapping] : []),
        EditorView.theme({
          "&": { backgroundColor: "#170e12", color: "#f7e7d8", fontSize: "13px", height: "100%" },
          ".cm-content": { fontFamily: "ui-monospace, monospace", padding: "1rem", minHeight: "250px" },
          ".cm-gutters": { backgroundColor: "#211418", color: "#bc8d77", border: "none" },
          ".cm-activeLineGutter": { backgroundColor: "rgba(201,106,66,.14)" },
          ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, monospace" },
        }),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    return () => view.destroy();
  }, [readOnly, content, fileName]);

  return <div ref={containerRef} className="terminal-codemirror" aria-label={"Conteúdo readonly: " + (fileName || "arquivo")} />;
}
