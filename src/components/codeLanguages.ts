import type { Extension } from "@codemirror/state";

export type CodeGrammar = "javascript" | "typescript" | "jsx" | "tsx" |
  "css" | "html" | "json" | "markdown" | "plaintext";

export function detectCodeGrammar(fileName: string): CodeGrammar {
  const name = fileName.toLowerCase().split("/").pop() ?? "";
  if (/\.tsx$/.test(name)) return "tsx";
  if (/\.jsx$/.test(name)) return "jsx";
  if (/\.ts$|\.mts$|\.cts$/.test(name)) return "typescript";
  if (/\.js$|\.mjs$|\.cjs$/.test(name)) return "javascript";
  if (/\.css$/.test(name)) return "css";
  if (/\.html?$/.test(name)) return "html";
  if (/\.jsonc?$/.test(name) || name === ".prettierrc" || name === ".eslintrc") return "json";
  if (/\.md$|\.markdown$/.test(name)) return "markdown";
  return "plaintext";
}

/**
 * Load parser grammars on-demand; the terminal itself stays lazy. JSON files
 * use JS-compatible parser + a constrained token style; parsing JSON is never
 * an opportunity to evaluate its contents.
 */
export async function codeGrammarExtensions(fileName: string): Promise<Extension[]> {
  const grammar = detectCodeGrammar(fileName);
  switch (grammar) {
    case "javascript":
    case "typescript":
    case "jsx":
    case "tsx":
    case "json": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return [javascript({
        typescript: grammar === "typescript" || grammar === "tsx",
        jsx: grammar === "jsx" || grammar === "tsx",
      })];
    }
    case "css": {
      const { css } = await import("@codemirror/lang-css");
      return [css()];
    }
    case "html": {
      const { html } = await import("@codemirror/lang-html");
      return [html()];
    }
    case "markdown": {
      const { markdown } = await import("@codemirror/lang-markdown");
      return [markdown()];
    }
    default:
      return [];
  }
}
