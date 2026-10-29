import { MAX_IMAGE_BYTES, MAX_SESSION_CARDS } from "./desktopElements";
import type { DesktopPosition } from "./desktopElements";

/**
 * Desktop image bytes are stored entirely inside the visitor's browser.
 * Four independent browser-only layout slots. The original "default" record
 * remains readable without migrating or deleting any existing image Blobs.
 */
export type DesktopScreenMode = "ultrawide" | "standard";
export interface StoredDesktopCard {
  id: string;
  name: string;
  position: DesktopPosition;
  image: Blob;
}
export interface StoredDesktopLayout {
  schemaVersion: 1;
  screenMode: DesktopScreenMode;
  clockVisible: boolean;
  clockPosition: DesktopPosition;
  cards: StoredDesktopCard[];
  savedAt: number;
}

const DATABASE = "portfolio-theme-studio-desktop-v1";
const STORE = "layouts";
export const DESKTOP_LAYOUT_SLOTS = [
  { id: "default", label: "Principal" },
  { id: "layout-2", label: "Layout 2" },
  { id: "layout-3", label: "Layout 3" },
  { id: "layout-4", label: "Layout 4" },
] as const;
export type DesktopLayoutSlot = (typeof DESKTOP_LAYOUT_SLOTS)[number]["id"];
function ensureSlot(slot: string): DesktopLayoutSlot {
  if (!DESKTOP_LAYOUT_SLOTS.some((entry) => entry.id === slot)) {
    throw new Error("Slot de layout não autorizado.");
  }
  return slot as DesktopLayoutSlot;
}
const VERSION = 1;
const VALID_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function validPosition(position: unknown): position is DesktopPosition {
  if (!position || typeof position !== "object") return false;
  const value = position as Partial<DesktopPosition>;
  return typeof value.x === "number" && Number.isFinite(value.x) &&
    typeof value.y === "number" && Number.isFinite(value.y) &&
    value.x >= 0 && value.x <= 84 && value.y >= 0 && value.y <= 76;
}

function validCard(value: unknown): value is StoredDesktopCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<StoredDesktopCard>;
  return typeof card.id === "string" && /^card-[\w-]{1,100}$/.test(card.id) &&
    typeof card.name === "string" && card.name.length > 0 && card.name.length <= 255 &&
    /\.(png|jpe?g|webp)$/i.test(card.name) && validPosition(card.position) &&
    card.image instanceof Blob &&
    card.image.size > 0 && card.image.size <= MAX_IMAGE_BYTES &&
    VALID_MIME.has(card.image.type) &&
    ((card.image.type === "image/png" && /\.png$/i.test(card.name)) ||
      (card.image.type === "image/jpeg" && /\.jpe?g$/i.test(card.name)) ||
      (card.image.type === "image/webp" && /\.webp$/i.test(card.name)));
}

export function isStoredDesktopLayout(value: unknown): value is StoredDesktopLayout {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<StoredDesktopLayout>;
  return data.schemaVersion === 1 &&
    (data.screenMode === "ultrawide" || data.screenMode === "standard") &&
    typeof data.clockVisible === "boolean" && validPosition(data.clockPosition) &&
    typeof data.savedAt === "number" && Number.isFinite(data.savedAt) &&
    data.savedAt > 0 && Array.isArray(data.cards) &&
    data.cards.length <= MAX_SESSION_CARDS &&
    data.cards.every(validCard) &&
    new Set(data.cards.map((card: StoredDesktopCard) => card.id)).size === data.cards.length;
}

export type DesktopLayoutNames = Record<DesktopLayoutSlot, string>;
export function defaultDesktopLayoutNames(): DesktopLayoutNames {
  return Object.fromEntries(DESKTOP_LAYOUT_SLOTS.map((slot) =>
    [slot.id, slot.label])) as DesktopLayoutNames;
}
export function validateDesktopLayoutName(value: string): string {
  const name = value.trim();
  if (!name || name.length > 32 || Array.from(name).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))
    throw new Error("Nome do layout deve ter de 1 a 32 caracteres, sem controles.");
  return name;
}

/** Names use separate keys in the original store; the old "default" Blob is untouched. */
export async function readDesktopLayoutNames(): Promise<DesktopLayoutNames> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const names = defaultDesktopLayoutNames();
    let failed = false;
    try {
      const transaction = db.transaction(STORE, "readonly");
      const store = transaction.objectStore(STORE);
      for (const slot of DESKTOP_LAYOUT_SLOTS) {
        const request = store.get("name:" + slot.id);
        request.onsuccess = () => {
          const name: unknown = request.result;
          if (typeof name === "string") {
            try { names[slot.id] = validateDesktopLayoutName(name); }
            catch { /* Invalid labels get safe default labels. */ }
          }
        };
      }
      transaction.oncomplete = () => { db.close(); if (!failed) resolve(names); };
      const fail = () => {
        db.close();
        if (!failed) { failed = true; reject(new Error("Falha ao ler nomes dos layouts.")); }
      };
      transaction.onerror = fail;
      transaction.onabort = fail;
    } catch {
      db.close();
      reject(new Error("Falha ao ler nomes dos layouts."));
    }
  });
}

export async function writeDesktopLayoutName(slot: DesktopLayoutSlot, value: string): Promise<string> {
  const key = ensureSlot(slot);
  const name = validateDesktopLayoutName(value);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = () => {
      db.close();
      if (!settled) { settled = true; reject(new Error("Falha ao salvar nome do layout.")); }
    };
    try {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(name, "name:" + key);
      transaction.oncomplete = () => { db.close(); if (!settled) { settled = true; resolve(name); } };
      transaction.onerror = fail;
      transaction.onabort = fail;
    } catch { fail(); }
  });
}

function databaseUnavailable(): Error {
  return new Error("IndexedDB indisponível. Verifique as permissões deste navegador.");
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(databaseUnavailable());
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try { request = indexedDB.open(DATABASE, VERSION); }
    catch { reject(databaseUnavailable()); return; }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(databaseUnavailable());
    request.onblocked = () => reject(new Error("Banco de dados bloqueado por outra aba. Feche as outras abas e tente novamente."));
  });
}

export async function readDesktopLayout(slot: DesktopLayoutSlot = "default"): Promise<StoredDesktopLayout | null> {
  const key = ensureSlot(slot);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (message: string) => {
      if (!settled) { settled = true; reject(new Error(message)); }
    };
    try {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get(key);
      request.onsuccess = () => {
        if (settled) return;
        const result: unknown = request.result;
        if (result === undefined) { settled = true; resolve(null); }
        else if (isStoredDesktopLayout(result)) { settled = true; resolve(result); }
        else fail("Organização salva inválida. Seus dados não foram substituídos.");
      };
      request.onerror = () => fail("Falha ao ler organização no IndexedDB.");
      transaction.onerror = () => fail("Falha ao acessar organização no IndexedDB.");
      transaction.onabort = () => fail("Leitura da organização interrompida.");
      transaction.oncomplete = () => db.close();
    } catch {
      db.close();
      fail("Falha ao abrir organização salva.");
    }
  });
}

export async function writeDesktopLayout(layout: StoredDesktopLayout, slot: DesktopLayoutSlot = "default"): Promise<void> {
  const key = ensureSlot(slot);
  if (!isStoredDesktopLayout(layout)) throw new Error("Organização inválida. Nada foi salvo.");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = () => {
      if (!settled) {
        settled = true;
        reject(new Error("Não foi possível salvar no IndexedDB (espaço ou permissão). Seu layout atual continua visível."));
      }
    };
    try {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(layout, key);
      transaction.oncomplete = () => { db.close(); if (!settled) { settled = true; resolve(); } };
      transaction.onerror = () => { db.close(); fail(); };
      transaction.onabort = () => { db.close(); fail(); };
    } catch {
      db.close();
      fail();
    }
  });
}


/**
 * M6: named, per-slot versions, saved as separate records in the EXISTING
 * IndexedDB object store. No schema upgrade is required; the old "default"
 * and "layout-2..4" records and their Blobs are never migrated or deleted.
 * A restoration writes the restored layout and a safety checkpoint atomically.
 */
export interface DesktopLayoutVersion {
  id: string;
  name: string;
  createdAt: number;
}
export const MAX_DESKTOP_VERSIONS = 5;
const versionListKey = (slot: DesktopLayoutSlot) => "versions:" + slot;
const versionKey = (slot: DesktopLayoutSlot, id: string) => "version:" + slot + ":" + id;

function checkedVersionList(value: unknown): DesktopLayoutVersion[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_DESKTOP_VERSIONS) {
    throw new Error("Histórico de versões inválido. Nenhum dado foi substituído.");
  }
  const list: DesktopLayoutVersion[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") throw new Error("Histórico de versões inválido.");
    const record = item as Partial<DesktopLayoutVersion>;
    if (typeof record.id !== "string" || !/^v-[a-z0-9-]{6,80}$/i.test(record.id) ||
        typeof record.name !== "string" || typeof record.createdAt !== "number" ||
        !Number.isFinite(record.createdAt) || record.createdAt <= 0) {
      throw new Error("Metadados de versão inválidos. Nada foi sobrescrito.");
    }
    validateDesktopLayoutName(record.name);
    list.push({ id: record.id, name: record.name, createdAt: record.createdAt });
  }
  if (new Set(list.map((item) => item.id)).size !== list.length) {
    throw new Error("IDs de versão repetidos. Nenhum dado foi substituído.");
  }
  return list;
}

function newVersionId(): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().replace(/[^a-z0-9-]/gi, "")
    : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return "v-" + random;
}

export async function readDesktopVersions(slot: DesktopLayoutSlot): Promise<DesktopLayoutVersion[]> {
  const key = ensureSlot(slot);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let outcome: DesktopLayoutVersion[] = [];
    let failed = false;
    const fail = (cause: unknown) => {
      if (failed) return;
      failed = true;
      db.close();
      reject(cause instanceof Error ? cause : new Error("Falha ao ler versões do layout."));
    };
    try {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(versionListKey(key));
      request.onsuccess = () => {
        try { outcome = checkedVersionList(request.result); }
        catch (cause) { fail(cause); }
      };
      tx.oncomplete = () => { db.close(); if (!failed) resolve(outcome); };
      tx.onerror = () => fail(new Error("Falha ao acessar versões do layout."));
      tx.onabort = () => fail(new Error("Leitura das versões interrompida."));
    } catch (cause) { fail(cause); }
  });
}

/** Save the last COMMITTED layout, not unsaved state in the React editor. */
export async function createDesktopVersion(slot: DesktopLayoutSlot, name: string): Promise<DesktopLayoutVersion> {
  const key = ensureSlot(slot);
  const label = validateDesktopLayoutName(name);
  const db = await openDatabase();
  return new Promise<DesktopLayoutVersion>((resolve, reject) => {
    const record: DesktopLayoutVersion = { id: newVersionId(), name: label, createdAt: Date.now() };
    let failed = false;
    const fail = (cause: unknown) => {
      if (failed) return;
      failed = true;
      reject(cause instanceof Error ? cause : new Error("Falha ao criar versão. Layout mantido."));
    };
    try {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const listRequest = store.get(versionListKey(key));
      const layoutRequest = store.get(key);
      let list: DesktopLayoutVersion[] | null = null;
      let layout: StoredDesktopLayout | null = null;
      let ready = 0;
      const write = () => {
        if (++ready !== 2 || failed) return;
        try {
          if (!isStoredDesktopLayout(layout)) throw new Error("Salve a organização antes de criar uma versão.");
          if (!list) throw new Error("Lista de versões inválida.");
          if (list.length >= MAX_DESKTOP_VERSIONS) {
            throw new Error("Limite de 5 versões atingido. Exclua uma versão antes de criar outra.");
          }
          store.put({ ...record, layout }, versionKey(key, record.id));
          store.put([...list, record], versionListKey(key));
        } catch (cause) { tx.abort(); fail(cause); }
      };
      listRequest.onsuccess = () => {
        try { list = checkedVersionList(listRequest.result); write(); }
        catch (cause) { tx.abort(); fail(cause); }
      };
      layoutRequest.onsuccess = () => { layout = layoutRequest.result as StoredDesktopLayout | null; write(); };
      tx.oncomplete = () => { db.close(); if (!failed) resolve(record); };
      tx.onerror = () => fail(new Error("IndexedDB não conseguiu gravar a versão (quota ou permissão)."));
      tx.onabort = () => fail(new Error("Criação da versão interrompida; nada foi salvo."));
    } catch (cause) { db.close(); fail(cause); }
  }).finally(() => db.close());
}

/**
 * Restore and FIRST capture the current committed layout as a new safety
 * version, in the SAME IndexedDB transaction. If quota/validation fails,
 * neither the checkpoint nor the active layout can change.
 */
export async function restoreDesktopVersion(slot: DesktopLayoutSlot, id: string): Promise<StoredDesktopLayout> {
  const key = ensureSlot(slot);
  if (!/^v-[a-z0-9-]{6,80}$/i.test(id)) throw new Error("ID de versão inválido.");
  const db = await openDatabase();
  return new Promise<StoredDesktopLayout>((resolve, reject) => {
    let result: StoredDesktopLayout | null = null;
    let failed = false;
    const fail = (cause: unknown) => {
      if (failed) return;
      failed = true;
      reject(cause instanceof Error ? cause : new Error("Falha ao restaurar. Layout anterior preservado."));
    };
    try {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const listRequest = store.get(versionListKey(key));
      const activeRequest = store.get(key);
      const versionRequest = store.get(versionKey(key, id));
      let list: DesktopLayoutVersion[] | null = null;
      let active: StoredDesktopLayout | null = null;
      let target: unknown;
      let ready = 0;
      const write = () => {
        if (++ready !== 3 || failed) return;
        try {
          if (!list?.some((item) => item.id === id)) throw new Error("Versão não encontrada neste layout.");
          const record = target as { layout?: unknown } | null;
          if (!record || !isStoredDesktopLayout(record.layout)) {
            throw new Error("Versão corrompida ou incompleta. Organização preservada.");
          }
          result = record.layout;
          if (!isStoredDesktopLayout(active)) {
            throw new Error("Organização atual indisponível. Restauração segura cancelada.");
          }
          if (list.length >= MAX_DESKTOP_VERSIONS) {
            throw new Error("Para restaurar com segurança, exclua uma versão: são permitidas até 5.");
          }
          const backup: DesktopLayoutVersion = {
            id: newVersionId(), name: "Antes de restaurar", createdAt: Date.now(),
          };
          store.put({ ...backup, layout: active }, versionKey(key, backup.id));
          store.put([...list, backup], versionListKey(key));
          store.put(result, key);
        } catch (cause) { tx.abort(); fail(cause); }
      };
      listRequest.onsuccess = () => {
        try { list = checkedVersionList(listRequest.result); write(); }
        catch (cause) { tx.abort(); fail(cause); }
      };
      activeRequest.onsuccess = () => { active = activeRequest.result as StoredDesktopLayout | null; write(); };
      versionRequest.onsuccess = () => { target = versionRequest.result; write(); };
      tx.oncomplete = () => { db.close(); if (!failed && result) resolve(result); };
      tx.onerror = () => fail(new Error("Restauração falhou no IndexedDB. Organização anterior preservada."));
      tx.onabort = () => fail(new Error("Restauração cancelada; organização anterior preservada."));
    } catch (cause) { db.close(); fail(cause); }
  }).finally(() => db.close());
}

/** Delete only the chosen named snapshot, never the active layout. */
export async function deleteDesktopVersion(slot: DesktopLayoutSlot, id: string): Promise<void> {
  const key = ensureSlot(slot);
  if (!/^v-[a-z0-9-]{6,80}$/i.test(id)) throw new Error("ID de versão inválido.");
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    let failed = false;
    const fail = (cause: unknown) => {
      if (failed) return;
      failed = true;
      reject(cause instanceof Error ? cause : new Error("Falha ao excluir versão."));
    };
    try {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const request = store.get(versionListKey(key));
      request.onsuccess = () => {
        try {
          const list = checkedVersionList(request.result);
          if (!list.some((item) => item.id === id)) throw new Error("Versão não encontrada.");
          store.delete(versionKey(key, id));
          store.put(list.filter((item) => item.id !== id), versionListKey(key));
        } catch (cause) { tx.abort(); fail(cause); }
      };
      tx.oncomplete = () => { db.close(); if (!failed) resolve(); };
      tx.onerror = () => fail(new Error("Falha no IndexedDB. Versão não excluída."));
      tx.onabort = () => fail(new Error("Exclusão cancelada. Versão preservada."));
    } catch (cause) { db.close(); fail(cause); }
  }).finally(() => db.close());
}
