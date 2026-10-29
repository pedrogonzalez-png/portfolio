import { isStoredDesktopLayout } from "./desktopPersistence";
import type { StoredDesktopCard, StoredDesktopLayout } from "./desktopPersistence";
import { MAX_IMAGE_BYTES, MAX_SESSION_CARDS } from "./desktopElements";

/**
 * Portable binary backup: magic[8] + little-endian JSON header length[4]
 * + UTF-8 header + original image Blobs in declared order.
 * The parser reads bounded slices and never executes uploaded content.
 */
const MAGIC = "PTSBAK01";
const HEADER_LIMIT = 32768;
const MAX_BACKUP_BYTES = MAX_SESSION_CARDS * MAX_IMAGE_BYTES + HEADER_LIMIT + 12;
export const BACKUP_EXTENSION = ".ptsbackup";

interface CardManifest {
  id: string;
  name: string;
  position: StoredDesktopCard["position"];
  mime: string;
  size: number;
}
interface BackupHeader {
  format: "portfolio-theme-studio-layout";
  version: 1;
  layout: Omit<StoredDesktopLayout, "cards">;
  cards: CardManifest[];
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function readBytes(blob: Blob, start: number, end: number): Promise<ArrayBuffer> {
  const slice = blob.slice(start, end);
  if (typeof slice.arrayBuffer === "function") return slice.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("Falha ao ler bytes do arquivo."));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o backup."));
    reader.readAsArrayBuffer(slice);
  });
}


export function createDesktopBackup(layout: StoredDesktopLayout): Blob {
  if (!isStoredDesktopLayout(layout)) throw new Error("O layout está inválido e não pode ser exportado.");
  const header: BackupHeader = {
    format: "portfolio-theme-studio-layout",
    version: 1,
    layout: {
      schemaVersion: layout.schemaVersion, screenMode: layout.screenMode,
      clockVisible: layout.clockVisible, clockPosition: { ...layout.clockPosition },
      savedAt: layout.savedAt,
    },
    cards: layout.cards.map((card) => ({
      id: card.id, name: card.name, position: { ...card.position },
      mime: card.image.type, size: card.image.size,
    })),
  };
  const headerBytes = encoder.encode(JSON.stringify(header));
  if (headerBytes.length > HEADER_LIMIT) throw new Error("Metadados grandes demais para o backup.");
  const prefix = new Uint8Array(12);
  prefix.set(encoder.encode(MAGIC), 0);
  new DataView(prefix.buffer).setUint32(8, headerBytes.length, true);
  const archive = new Blob([prefix, headerBytes, ...layout.cards.map((card) => card.image)],
    { type: "application/octet-stream" });
  if (archive.size > MAX_BACKUP_BYTES) throw new Error("Backup excedeu o limite permitido.");
  return archive;
}

/** Reject malformed offsets, forged MIME/types, trailing bytes and oversized files. */
export async function parseDesktopBackup(file: Blob): Promise<StoredDesktopLayout> {
  if (file.size < 12 || file.size > MAX_BACKUP_BYTES) throw new Error("Tamanho de backup inválido.");
  const prefix = new Uint8Array(await readBytes(file, 0, 12));
  if (decoder.decode(prefix.slice(0, 8)) !== MAGIC)
    throw new Error("Arquivo não é um backup válido do Theme Studio.");
  const headerSize = new DataView(prefix.buffer).getUint32(8, true);
  if (headerSize === 0 || headerSize > HEADER_LIMIT || headerSize + 12 > file.size)
    throw new Error("Cabeçalho do backup inválido.");
  let raw: unknown;
  try {
    raw = JSON.parse(decoder.decode(await readBytes(file, 12, headerSize + 12)));
  } catch {
    throw new Error("Metadados do backup ilegíveis.");
  }
  if (!raw || typeof raw !== "object") throw new Error("Metadados de backup inválidos.");
  const header = raw as Partial<BackupHeader>;
  if (header.format !== "portfolio-theme-studio-layout" || header.version !== 1 ||
      !header.layout || !Array.isArray(header.cards) ||
      header.cards.length > MAX_SESSION_CARDS) {
    throw new Error("Versão ou estrutura do backup incompatível.");
  }
  const cards: StoredDesktopCard[] = [];
  let offset = headerSize + 12;
  for (const rawCard of header.cards) {
    if (!rawCard || typeof rawCard !== "object")
      throw new Error("Card inválido no backup.");
    const item = rawCard as Partial<CardManifest>;
    if (!Number.isSafeInteger(item.size) || typeof item.size !== "number" ||
        item.size <= 0 || item.size > MAX_IMAGE_BYTES ||
        typeof item.mime !== "string") throw new Error("Imagem inválida no backup.");
    const end = offset + item.size;
    if (end > file.size) throw new Error("Backup truncado: faltam bytes da imagem.");
    const image = file.slice(offset, end, item.mime);
    cards.push({
      id: item.id as string, name: item.name as string,
      position: item.position as StoredDesktopCard["position"], image,
    });
    offset = end;
  }
  if (offset !== file.size) throw new Error("Backup contém dados adicionais inesperados.");
  const parsed = { ...header.layout, cards } as StoredDesktopLayout;
  if (!isStoredDesktopLayout(parsed)) throw new Error("Dados de layout ou imagens inválidos.");
  return parsed;
}
