import { afterEach, describe, expect, it, vi } from "vitest";
import { OFFICIAL_THEMES } from "../stores/themes";
import { isStoredDesktopLayout, readDesktopLayout, writeDesktopLayout } from "../services/desktopPersistence";
import type { StoredDesktopLayout } from "../services/desktopPersistence";

const makeLayout = (): StoredDesktopLayout => ({
  schemaVersion: 1, screenMode: "ultrawide", clockVisible: true,
  clockPosition: { x: 62, y: 7 }, savedAt: 1793180000000,
  cards: [{
    id: "card-hiyuki-12345",
    name: "Hiyuki.png",
    position: { x: 23, y: 22 },
    image: new Blob(["safe-image"], { type: "image/png" }),
  }],
});

afterEach(() => vi.unstubAllGlobals());

describe("Desktop IndexedDB schema", () => {
  it("accepts versioned Blob and element positions without serializing temporary object URLs", () => {
    const layout = makeLayout();
    expect(isStoredDesktopLayout(layout)).toBe(true);
    expect(layout.cards[0].image).toBeInstanceOf(Blob);
    expect(JSON.stringify(layout)).not.toContain("blob:");
    expect(OFFICIAL_THEMES).toHaveLength(5);
  });

  it("rejects corrupt records, forged images, duplicate ids, and out-of-bounds positions", () => {
    const good = makeLayout();
    expect(isStoredDesktopLayout({ ...good, schemaVersion: 3 })).toBe(false);
    expect(isStoredDesktopLayout({ ...good, clockPosition: { x: Infinity, y: 2 } })).toBe(false);
    expect(isStoredDesktopLayout({ ...good, cards: [...good.cards, good.cards[0]] })).toBe(false);
    expect(isStoredDesktopLayout({ ...good, cards: [{
      ...good.cards[0], image: "https://example.test/image.svg",
    }] })).toBe(false);
    expect(isStoredDesktopLayout({ ...good, cards: [{
      ...good.cards[0], name: "fake.svg",
    }] })).toBe(false);
    expect(isStoredDesktopLayout({ ...good, cards: [{
      ...good.cards[0], position: { x: 900, y: 23 },
    }] })).toBe(false);
  });

  it("refuses writes when IndexedDB is unavailable, without reporting success", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(writeDesktopLayout(makeLayout())).rejects.toThrow(/IndexedDB indisponível/);
    await expect(readDesktopLayout()).rejects.toThrow(/IndexedDB indisponível/);
  });

  it("writes and reads a browser-only record through IndexedDB transactions", async () => {
    const records = new Map<string, StoredDesktopLayout>();
    const db = {
      objectStoreNames: { contains: () => true },
      createObjectStore: vi.fn(),
      close: vi.fn(),
      transaction: (_name: string, _mode: string) => {
        const transaction: {
          oncomplete: null | (() => void);
          onerror: null | (() => void);
          onabort: null | (() => void);
          objectStore: (_key: string) => {
            get: (key: string) => { result?: StoredDesktopLayout; onsuccess?: () => void };
            put: (value: StoredDesktopLayout, key: string) => void;
          };
        } = {
          oncomplete: null, onerror: null, onabort: null,
          objectStore: () => ({
            get: (key: string) => {
              const request: { result?: StoredDesktopLayout; onsuccess?: () => void } = {};
              queueMicrotask(() => {
                request.result = records.get(key);
                request.onsuccess?.();
                transaction.oncomplete?.();
              });
              return request;
            },
            put: (value: StoredDesktopLayout, key: string) => {
              queueMicrotask(() => {
                records.set(key, value);
                transaction.oncomplete?.();
              });
            },
          }),
        };
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
    const layout = makeLayout();
    await writeDesktopLayout(layout);
    expect(records.get("default")?.cards[0].image).toBeInstanceOf(Blob);
    const restored = await readDesktopLayout();
    expect(restored?.screenMode).toBe("ultrawide");
    expect(restored?.clockPosition).toEqual({ x: 62, y: 7 });
    expect(restored?.cards[0].name).toBe("Hiyuki.png");
    expect(restored?.cards[0].image.size).toBe(layout.cards[0].image.size);
    expect(db.close).toHaveBeenCalledTimes(2);
  });
});
