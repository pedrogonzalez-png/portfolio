import { MAX_IMAGE_BYTES, MAX_SESSION_CARDS } from "./desktopElements";
import type { DesktopPosition } from "./desktopElements";

/**
 * Desktop image bytes are stored entirely inside the visitor's browser.
 * This is one intentionally simple global preview layout, not wallpaper-
 * or monitor-specific layout versioning (planned in a later milestone).
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
const KEY = "default";
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

export async function readDesktopLayout(): Promise<StoredDesktopLayout | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (message: string) => {
      if (!settled) { settled = true; reject(new Error(message)); }
    };
    try {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get(KEY);
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

export async function writeDesktopLayout(layout: StoredDesktopLayout): Promise<void> {
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
      transaction.objectStore(STORE).put(layout, KEY);
      transaction.oncomplete = () => { db.close(); if (!settled) { settled = true; resolve(); } };
      transaction.onerror = () => { db.close(); fail(); };
      transaction.onabort = () => { db.close(); fail(); };
    } catch {
      db.close();
      fail();
    }
  });
}
