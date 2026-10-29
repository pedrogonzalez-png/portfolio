/**
 * M3 — bounded literal grep over REAL GitHub files in the approved manifest.
 * This deliberately is not a remote regex engine or an arbitrary URL fetch.
 * Searching the whole repository is partial by design to preserve GitHub quota.
 */
import { getRepoTree, normalizeRepoPath, readRepoFile, resolveRepo } from "./githubReadonly";

export type GrepMatch = {
  path: string;
  line: number;
  text: string;
};

export type GrepResult = {
  repoFullName: string;
  branch: string;
  pattern: string;
  root: string;
  matches: GrepMatch[];
  scannedFiles: number;
  totalCandidates: number;
  skippedFiles: number;
  partial: boolean;
};

const MAX_FILES_PER_SEARCH = 6;
const MAX_BYTES_PER_FILE = 48 * 1024;
const MAX_MATCHES = 24;
const MAX_LINE_LENGTH = 180;

// Only ordinary source/document files, never binary assets or user-supplied URLs.
const TEXT_FILE = /\.(?:js|jsx|mjs|cjs|ts|tsx|css|scss|html|json|md|txt|py|sh|fish|qml|yml|yaml|toml|rs|go|java|xml|ini|conf)$/i;

export function literalLineMatches(text: string, needle: string, limit = MAX_MATCHES): Array<{ line: number; text: string }> {
  const lower = needle.toLocaleLowerCase("en");
  if (!lower) return [];
  const results: Array<{ line: number; text: string }> = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length && results.length < limit; i += 1) {
    const line = lines[i];
    if (line.toLocaleLowerCase("en").includes(lower)) {
      const snippet = line.trim().slice(0, MAX_LINE_LENGTH);
      results.push({ line: i + 1, text: snippet });
    }
  }
  return results;
}

export async function searchRepoText(repoId: string, pattern: string, root = ""): Promise<GrepResult> {
  const approved = resolveRepo(repoId);
  if (!approved) throw new Error("Repositório não autorizado. Use repos para ver os permitidos.");
  const needle = pattern.trim();
  if (needle.length < 2 || needle.length > 80 || Array.from(needle).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) {
    throw new Error("Busca inválida. Use texto literal de 2 a 80 caracteres.");
  }
  const path = normalizeRepoPath("", root || ".");
  const snapshot = await getRepoTree(approved.id);
  if (path && !snapshot.entries.some((entry) => entry.path === path)) {
    throw new Error("Caminho não encontrado no índice: " + path);
  }
  const candidates = snapshot.entries.filter((entry) =>
    entry.type === "blob" &&
    (!path || entry.path === path || entry.path.startsWith(path + "/")) &&
    TEXT_FILE.test(entry.path) &&
    !entry.path.split("/").some((section) => section === "node_modules" || section === ".git") &&
    (entry.size === undefined || entry.size <= MAX_BYTES_PER_FILE),
  ).sort((a, b) => a.path.localeCompare(b.path));

  const result: GrepResult = {
    repoFullName: snapshot.repoFullName,
    branch: snapshot.branch,
    pattern: needle,
    root: path,
    matches: [],
    scannedFiles: 0,
    totalCandidates: candidates.length,
    skippedFiles: 0,
    partial: snapshot.truncated || candidates.length > MAX_FILES_PER_SEARCH,
  };

  for (const entry of candidates.slice(0, MAX_FILES_PER_SEARCH)) {
    if (result.matches.length >= MAX_MATCHES) {
      result.partial = true;
      break;
    }
    try {
      const file = await readRepoFile(approved.id, entry.path);
      result.scannedFiles += 1;
      const remaining = MAX_MATCHES - result.matches.length;
      const matches = literalLineMatches(file.content, needle, remaining);
      result.matches.push(...matches.map((match) => ({ path: entry.path, ...match })));
      if (result.matches.length === MAX_MATCHES) result.partial = true;
    } catch (error) {
      // Quota, offline and transient failures must be surfaced, not disguised as no matches.
      const message = error instanceof Error ? error.message : "";
      if (/Limite de acesso|Sem conexão|Tempo de resposta|indisponível/i.test(message)) throw error;
      result.skippedFiles += 1;
      result.partial = true;
    }
  }
  return result;
}

export function formatGrepResult(result: GrepResult): string {
  const header = "GitHub / " + result.repoFullName + " / " + result.branch +
    "\nBusca literal: " + result.pattern + "  ·  local: " + (result.root || "/") +
    "\nArquivos examinados: " + result.scannedFiles + "/" + result.totalCandidates +
    " candidato(s) (máximo " + MAX_FILES_PER_SEARCH + " por busca)";
  const matches = result.matches.length
    ? result.matches.map((match) => match.path + ":" + match.line + ": " + match.text).join("\n")
    : "Nenhuma ocorrência encontrada nos arquivos examinados.";
  const footer = result.partial
    ? "\n[RESULTADO PARCIAL — limite de arquivos/linhas, índice incompleto ou falha de leitura. Refine: grep \"termo\" src/pasta.]"
    : "\n[Busca limitada aos arquivos de texto indexados com até 48 KB cada.]";
  return header + "\n\n" + matches + footer +
    (result.skippedFiles ? "\n[" + result.skippedFiles + " arquivo(s) não puderam ser lidos.]" : "");
}
