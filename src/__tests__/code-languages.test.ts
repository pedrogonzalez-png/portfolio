import { describe, expect, it } from "vitest";
import { codeGrammarExtensions, detectCodeGrammar } from "../components/codeLanguages";

describe("language detection in readonly source explorer", () => {
  it.each([
    ["src/main.js", "javascript"],
    ["src/Game.ts", "typescript"],
    ["src/Game.tsx", "tsx"],
    ["src/widget.jsx", "jsx"],
    ["src/styles/app.css", "css"],
    ["public/index.html", "html"],
    ["package.json", "json"],
    [".prettierrc", "json"],
    ["README.md", "markdown"],
    ["assets/unknown.qmld", "plaintext"],
  ] as const)("maps %s to %s", (fileName, expected) => {
    expect(detectCodeGrammar(fileName)).toBe(expected);
  });

  it("loads JS/TS/CSS/HTML/Markdown grammars lazily and falls back on plain text", async () => {
    for (const name of ["main.js", "main.tsx", "style.css", "index.html", "README.md", "config.json"]) {
      const extensions = await codeGrammarExtensions(name);
      expect(extensions.length).toBeGreaterThan(0);
    }
    await expect(codeGrammarExtensions("texture.bin")).resolves.toEqual([]);
  });
});
