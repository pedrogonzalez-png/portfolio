import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDesktopVersion, deleteDesktopVersion, readDesktopLayout,
  readDesktopVersions, restoreDesktopVersion, writeDesktopLayout,
  type StoredDesktopLayout,
} from "../services/desktopPersistence";

const makeLayout = (x = 20): StoredDesktopLayout => ({
  schemaVersion: 1,
  screenMode: "ultrawide",
  clockVisible: true,
  clockPosition: { x, y: 7 },
  savedAt: Date.now(),
  cards: [{
    id: "card-test-1", name: "Changli.png", position: { x: 12, y: 14 },
    image: new Blob(["safe PNG bytes"], { type: "image/png" }),
  }],
});

type Request = { result?: unknown; onsuccess?: () => void };
type Transaction = {
  oncomplete: null | (() => void);
  onabort: null | (() => void);
  onerror: null | (() => void);
  abort: () => void;
  objectStore: (_name: string) => {
    get: (key: string) => Request;
    put: (value: unknown, key: string) => void;
    delete: (key: string) => void;
  };
};

// Mock keeps a transaction-local write set, so aborts roll back exactly
// as real IndexedDB would; request callbacks can enqueue additional writes.
const records = new Map<string, unknown>();
let rejectPut: ((key: string) => boolean) | null = null;
const makeDb = () => ({
  objectStoreNames: { contains: () => true },
  createObjectStore: vi.fn(),
  close: vi.fn(),
  transaction: () => {
    let aborted = false;
    let finished = false;
    const working = new Map(records);
    const jobs: Array<() => void> = [];
    const tx: Transaction = {
      oncomplete: null, onerror: null, onabort: null,
      abort: () => { if (finished || aborted) return; aborted = true; tx.onabort?.(); },
      objectStore: () => ({
        get: (key: string) => {
          const request: Request = {};
          jobs.push(() => { request.result = working.get(key); request.onsuccess?.(); });
          return request;
        },
        put: (value: unknown, key: string) => {
          if (rejectPut?.(key)) throw new Error("Quota exceeded");
          working.set(key, value);
        },
        delete: (key: string) => { working.delete(key); },
      }),
    };
    queueMicrotask(() => {
      while (jobs.length && !aborted) jobs.shift()?.();
      if (!aborted) {
        records.clear();
        for (const [key, value] of working) records.set(key, value);
        finished = true;
        tx.oncomplete?.();
      }
    });
    return tx;
  },
});

beforeEach(() => {
  records.clear();
  rejectPut = null;
  vi.stubGlobal("indexedDB", {
    open: () => {
      const request: { result: ReturnType<typeof makeDb>; onsuccess?: () => void } = {
        result: makeDb(),
      };
      queueMicrotask(() => request.onsuccess?.());
      return request;
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("M6 named layout versions", () => {
  it("creates a named snapshot of committed data without changing the active layout", async () => {
    await writeDesktopLayout(makeLayout(18));
    const version = await createDesktopVersion("default", "Antes dos testes");
    expect(version.name).toBe("Antes dos testes");
    expect(await readDesktopVersions("default")).toEqual([version]);
    expect((await readDesktopLayout())?.clockPosition.x).toBe(18);
    expect(records.get("version:default:" + version.id)).toMatchObject({ name: "Antes dos testes" });
  });

  it("restores a version and atomically snapshots the overwritten layout for rollback", async () => {
    await writeDesktopLayout(makeLayout(18));
    const old = await createDesktopVersion("default", "Meu marco");
    await writeDesktopLayout(makeLayout(50));
    const restored = await restoreDesktopVersion("default", old.id);
    expect(restored.clockPosition.x).toBe(18);
    expect((await readDesktopLayout())?.clockPosition.x).toBe(18);
    const versions = await readDesktopVersions("default");
    expect(versions).toHaveLength(2);
    expect(versions[1].name).toBe("Antes de restaurar");
    const safety = records.get("version:default:" + versions[1].id) as { layout: StoredDesktopLayout };
    expect(safety.layout.clockPosition.x).toBe(50);
    expect(safety.layout.cards[0].image.size).toBeGreaterThan(0);
  });

  it("does not overwrite the layout when the atomic backup write fails", async () => {
    await writeDesktopLayout(makeLayout(18));
    const version = await createDesktopVersion("default", "Seguro");
    await writeDesktopLayout(makeLayout(50));
    rejectPut = (key) => key.startsWith("version:default:");
    await expect(restoreDesktopVersion("default", version.id)).rejects.toThrow();
    expect((await readDesktopLayout())?.clockPosition.x).toBe(50);
    expect(await readDesktopVersions("default")).toHaveLength(1);
  });

  it("keeps slots isolated and only deletes the requested named version", async () => {
    await writeDesktopLayout(makeLayout(20), "default");
    await writeDesktopLayout(makeLayout(70), "layout-2");
    const a = await createDesktopVersion("default", "Principal");
    const b = await createDesktopVersion("layout-2", "Alternativa");
    expect((await readDesktopVersions("default")).map((v) => v.id)).toEqual([a.id]);
    await deleteDesktopVersion("layout-2", b.id);
    expect(await readDesktopVersions("layout-2")).toHaveLength(0);
    expect(await readDesktopVersions("default")).toHaveLength(1);
    expect((await readDesktopLayout("layout-2"))?.clockPosition.x).toBe(70);
  });

  it("never silently deletes older versions when five slots are full", async () => {
    await writeDesktopLayout(makeLayout());
    for (let i = 0; i < 5; i += 1) await createDesktopVersion("default", "Marco " + i);
    await expect(createDesktopVersion("default", "Sexta versão")).rejects.toThrow("Limite de 5");
    const versions = await readDesktopVersions("default");
    await expect(restoreDesktopVersion("default", versions[0].id)).rejects.toThrow("até 5");
    expect(versions).toHaveLength(5);
    expect((await readDesktopLayout())?.clockPosition.x).toBe(20);
  });

  it("rejects corrupted version data without corrupting existing layouts", async () => {
    await writeDesktopLayout(makeLayout(31));
    const version = await createDesktopVersion("default", "Válida");
    records.set("version:default:" + version.id, { layout: { schemaVersion: 999 } });
    await expect(restoreDesktopVersion("default", version.id)).rejects.toThrow("corrompida");
    expect((await readDesktopLayout())?.clockPosition.x).toBe(31);
    await expect(createDesktopVersion("default", "")).rejects.toThrow("1 a 32");
  });
});
