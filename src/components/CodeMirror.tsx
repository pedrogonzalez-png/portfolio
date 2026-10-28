import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { EditorState, type EditorStateConfig } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { useEffect, useRef } from "react";

interface CodeMirrorProps {
  content: string;
  readOnly?: boolean;
}

export function CodeMirror({ content, readOnly = true }: CodeMirrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const startState = EditorState.create({
      doc: content,
      extensions: [
        basicSetup(),
        keymap.of([...defaultKeymap]),
        markdown(),
        EditorView.updateListener.of((update) => {
          if (!readOnly && update.docChanged) {
            // Não permitir edição para readonly — opcionalmente visível se readOnly = false
          }
        }),
      ].filter(Boolean) as EditorStateConfig["extensions"],
    });

    const view = new EditorView({ state: startState, parent: containerRef.current });
    viewRef.current = view;

    return () => view.destroy();
  }, [content, readOnly]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({ changes: { from: 0, to: viewRef.current.state.doc.length, insert: content } });
    }
  }, [content]);

  return <div ref={containerRef} style={{ border: "1px solid #444", borderRadius: "0.5rem", overflow: "hidden" }} />;
}