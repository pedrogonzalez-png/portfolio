/**
 * M0 — Teste de base: verifica que o ambiente inicializa.
 * Serve como validação de que o build/types/lint funcionam.
 */
import { describe, it, expect } from "vitest";

describe("Marco 0 — Ambiente inicial", () => {
  it("should have placeholder tokens defined", () => {
    const tokens = {
      bg: "#110A0B",
      text: "#F7E7D8",
      accentPrimary: "#C96A42",
    };
    expect(tokens.bg).toBe("#110A0B");
    expect(tokens.text).toBe("#F7E7D8");
    expect(tokens.accentPrimary).toBe("#C96A42");
  });
});