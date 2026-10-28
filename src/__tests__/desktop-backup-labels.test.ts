import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesktopBackup, parseDesktopBackup } from "../services/desktopBackup";
import { readDesktopLayoutNames, writeDesktopLayoutName, validateDesktopLayoutName } from "../services/desktopPersistence";
import type { StoredDesktopLayout } from "../services/desktopPersistence";

function layout(): StoredDesktopLayout {
  return {
    schemaVersion: 1, screenMode: "ultrawide", clockVisible: true,
    clockPosition: { x: 27, y: 18 }, savedAt: 1793179900000,
    cards: [
      { id: "card-changli-001", name: "Changli.png", position: { x: 14, y: 21 },
        image: new Blob(["PNG sample bytes"], { type: "image/png" }) },
      { id: "card-hiyuki-002", name: "Hiyuki.webp", position: { x: 56, y: 27 },
        image: new Blob(["WEBP bytes"], { type: "image/webp" }) },
    ],
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("portable binary layout backup", () => {
  it("round-trips two original image Blobs, positions and clock", async () => {
    const source = layout();
    const archive = createDesktopBackup(source);
    expect(archive.type).toBe("application/octet-stream");
    expect(archive.size).toBeGreaterThan(40);
    const imported = await parseDesktopBackup(archive);
    expect(imported.screenMode).toBe("ultrawide");
    expect(imported.clockPosition).toEqual({ x: 27, y: 18 });
    expect(imported.cards.map((card) => [card.id, card.position.x, card.image.type]))
      .toEqual([
        ["card-changli-001", 14, "image/png"],
        ["card-hiyuki-002", 56, "image/webp"],
      ]);
    expect(imported.cards[0].image.size).toBe(source.cards[0].image.size);
    expect(imported.cards[1].image.size).toBe(source.cards[1].image.size);
  });

  it("rejects truncated backups, unexpected trailing bytes and broken signatures", async () => {
    const valid = createDesktopBackup(layout());
    await expect(parseDesktopBackup(valid.slice(0, valid.size - 1))).rejects.toThrow(/truncado/);
    await expect(parseDesktopBackup(new Blob([valid, "x"]))).rejects.toThrow(/adicionais/);
    await expect(parseDesktopBackup(new Blob(["INVALID CONTENT"]))).rejects.toThrow(/backup válido/);
  });

  it("rejects unsupported schema and oversized/forged image metadata", async () => {
    const sample = createDesktopBackup(layout());
    const original = await parseDesktopBackup(sample);
    expect(original.cards).toHaveLength(2);
    const bad = { ...layout(), cards: [{ ...layout().cards[0], image: new Blob(["abc"], { type: "text/html" }) }] };
    expect(() => createDesktopBackup(bad)).toThrow(/inválido/);
    const tooMany = { ...layout(), cards: Array.from({ length: 21 }, (_, index) => ({
      ...layout().cards[0], id: "card-test-" + index,
    })) };
    expect(() => createDesktopBackup(tooMany)).toThrow(/inválido/);
  });
});

describe("persistent layout names compatible with legacy IndexedDB", () => {
  it("rejects blank, overlong and control-character names", () => {
    expect(validateDesktopLayoutName("  Minha Changli  ")).toBe("Minha Changli");
    expect(() => validateDesktopLayoutName("")).toThrow(/1 a 32/);
    expect(() => validateDesktopLayoutName("x".repeat(33))).toThrow(/1 a 32/);
    expect(() => validateDesktopLayoutName("oops\nname")).toThrow(/sem controles/);
  });

  it("writes only name-prefixed keys and preserves legacy layout Blobs", async () => {
    const stored = new Map<string, unknown>([["default", layout()]]);
    const db = {
      objectStoreNames: { contains: () => true },
      createObjectStore: vi.fn(), close: vi.fn(),
      transaction: () => {
        const transaction: {
          oncomplete: null | (() => void);
          onerror: null | (() => void);
          onabort: null | (() => void);
          objectStore: () => {
            get: (key: string) => { result?: unknown; onsuccess?: () => void };
            put: (value: unknown, key: string) => void;
          };
        } = {
          oncomplete: null, onerror: null, onabort: null,
          objectStore: () => ({
            get: (key) => {
              const request: { result?: unknown; onsuccess?: () => void } = {};
              queueMicrotask(() => {
                request.result = stored.get(key);
                request.onsuccess?.();
                if (++reads === 4) { reads = 0; transaction.oncomplete?.(); }
              });
              return request;
            },
            put: (value, key) => queueMicrotask(() => {
              stored.set(key, value);
              transaction.oncomplete?.();
            }),
          }),
        };
        let reads = 0;
        return transaction;
      },
    };
    vi.stubGlobal("indexedDB", {
      open: () => {
        const request: { result: typeof db; onsuccess?: () => void } = { result: db };
        queueMicrotask(() => request.onsuccess?.());
        return request;
      },
    });
    expect((await readDesktopLayoutNames()).default).toBe("Principal");
    await writeDesktopLayoutName("layout-2", "Minhas cores");
    const names = await readDesktopLayoutNames();
    expect(names["layout-2"]).toBe("Minhas cores");
    expect(stored.get("default")).toEqual(layout());
    expect(stored.get("name:layout-2")).toBe("Minhas cores");
  });

  it("refuses name writes when IndexedDB is unavailable", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(writeDesktopLayoutName("default", "Seguro")).rejects.toThrow(/IndexedDB indisponível/);
  });
});
