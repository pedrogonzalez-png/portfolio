import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";

interface CodeMirrorProps {
  content: string;
  readOnly?: boolean;
}

export function CodeMirror({ content, readOnly = true }: CodeMirrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const state = EditorState.create({
      doc: content,
      extensions: [
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        keymap.of(defaultKeymap),
        markdown(),
        EditorView.theme({
          "&": { backgroundColor: "#170e12", color: "#f7e7d8", fontSize: "13px" },
          ".cm-content": { fontFamily: "ui-monospace, monospace", padding: "1rem" },
          ".cm-gutters": { backgroundColor: "#211418", color: "#bc8d77", border: "none" },
        }),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => {
      viewRef.current = null;
      view.destroy();
    };
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === content) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    });
  }, [content]);

  return <div ref={containerRef} style={{ border: "1px solid rgba(227,179,122,.22)", borderRadius: "0.75rem", overflow: "hidden" }} />;
}
