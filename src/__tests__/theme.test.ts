/**
 * M0 — Teste de tema Changli tokens.
 * Valida que tokens derivados do tema oficial Changli existem.
 */
import { describe, it, expect } from "vitest";
import { changliTokens } from "../styles/changli";

describe("Marco 0 — Tema Changli", () => {
  it("should have all required surface tokens", () => {
    expect(changliTokens.bg).toBe("#110A0B");
    expect(changliTokens.surface).toBe("#1A0F10");
    expect(changliTokens.surfaceContainer).toBe("#302020");
    expect(changliTokens.surfaceContainerHigh).toBe("#3A2020");
  });

  it("should have text tokens", () => {
    expect(changliTokens.text).toBe("#F7E7D8");
    expect(changliTokens.textVariant).toBe("#D7B7A5");
  });

  it("should have accent tokens", () => {
    expect(changliTokens.accentPrimary).toBe("#C96A42");
    expect(changliTokens.accentRed).toBe("#E17F72");
    expect(changliTokens.accentYellow).toBe("#E3B37A");
  });
});