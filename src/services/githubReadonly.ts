/**
 * Read-only GitHub adapter. Repository IDs are resolved strictly against the
 * manual portfolio manifest; user input never becomes an arbitrary URL.
 */
import { PLACEHOLDER_PROJECTS } from "../components/PlaceholderCatalog";

export interface RepoEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

export interface RepoSnapshot {
  repoId: string;
  repoFullName: string;
  branch: string;
  treeSha: string;
  entries: RepoEntry[];
  truncated: boolean;
}

export interface CommitSummary {
  sha: string;
  subject: string;
  author: string;
  date: string;
}

const API = "https://api.github.com";
const MAX_TREE_ENTRIES = 4000;
const MAX_FILE_BYTES = 128 * 1024;
const MAX_OUTPUT = 14000;
const cache = new Map<string, { deadline: number; promise: Promise<unknown> }>();

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.deadline > Date.now()) return hit.promise as Promise<T>;
  const promise = fn().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { deadline: Date.now() + 5 * 60_000, promise });
  return promise;
}

export function approvedRepos() {
  return PLACEHOLDER_PROJECTS.filter((repo) => repo.explorerApproved && repo.status !== "hidden");
}

export function resolveRepo(input: string) {
  const name = input.trim().toLowerCase();
  return approvedRepos().find((repo) =>
    [repo.id, repo.repoFullName, repo.repoFullName.split("/")[1]].some((alias) => alias.toLowerCase() === name),
  ) ?? null;
}

export function normalizeRepoPath(current: string, requested: string): string {
  if (requested.includes("\\") || Array.from(requested).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) || requested.includes("://")) {
    throw new Error("Caminho inválido.");
  }
  const clean = requested.trim();
  if (!clean || clean === ".") return current;
  const segments = clean.startsWith("/") ? [] : current.split("/").filter(Boolean);
  for (const segment of clean.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (!segments.length) throw new Error("Acesso fora da raiz do repositório bloqueado.");
      segments.pop();
    } else {
      if (segment === "." || segment === "..") throw new Error("Caminho inválido.");
      segments.push(segment);
    }
  }
  if (segments.join("/").length > 500) throw new Error("Caminho muito longo.");
  return segments.join("/");
}

async function getJson<T>(path: string): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 9000);
  try {
    const response = await fetch(API + path, {
      headers: { Accept: "application/vnd.github+json" },
      signal: ctrl.signal,
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error("Limite de acesso do GitHub atingido. Tente mais tarde ou abra o repositório diretamente.");
      }
      if (response.status === 404) throw new Error("Recurso não encontrado no GitHub.");
      throw new Error("GitHub indisponível (HTTP " + response.status + ").");
    }
    return await response.json() as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("Tempo de resposta do GitHub excedido.");
    if (error instanceof TypeError) throw new Error("Sem conexão com o GitHub. Verifique sua internet.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function ensureAllowed(repoId: string) {
  const repo = resolveRepo(repoId);
  if (!repo) throw new Error("Repositório não autorizado. Use 'repos' para ver a lista permitida.");
  return repo;
}

export async function getRepoTree(repoId: string): Promise<RepoSnapshot> {
  const repo = ensureAllowed(repoId);
  return cached("tree:" + repo.id, async () => {
    const metadata = await getJson<{ default_branch: string }>(
      "/repos/" + repo.repoFullName,
    );
    const branch = metadata.default_branch;
    if (!branch || branch.length > 130) throw new Error("Branch não identificada.");
    const tree = await getJson<{
      sha: string;
      truncated: boolean;
      tree: { path: string; type: string; sha: string; size?: number }[];
    }>("/repos/" + repo.repoFullName + "/git/trees/" + encodeURIComponent(branch) + "?recursive=1");

    return {
      repoId: repo.id,
      repoFullName: repo.repoFullName,
      branch,
      treeSha: tree.sha,
      truncated: Boolean(tree.truncated) || tree.tree.length > MAX_TREE_ENTRIES,
      entries: tree.tree.slice(0, MAX_TREE_ENTRIES)
        .filter((entry): entry is RepoEntry =>
          (entry.type === "blob" || entry.type === "tree") &&
          typeof entry.path === "string" &&
          /^[a-f0-9]{40}$/.test(entry.sha)),
    };
  });
}

export function directoryEntries(snapshot: RepoSnapshot, path: string): RepoEntry[] {
  if (path && !snapshot.entries.some((entry) => entry.path === path && entry.type === "tree")) {
    throw new Error("Diretório não encontrado: " + path);
  }
  const prefix = path ? path + "/" : "";
  return snapshot.entries.filter((item) => {
    if (!item.path.startsWith(prefix)) return false;
    const rest = item.path.slice(prefix.length);
    return rest.length > 0 && !rest.includes("/");
  }).sort((a, b) => a.type === b.type ? a.path.localeCompare(b.path) : a.type === "tree" ? -1 : 1);
}

export async function readRepoFile(repoId: string, path: string): Promise<{ content: string; url: string; size: number }> {
  const repo = ensureAllowed(repoId);
  const snapshot = await getRepoTree(repo.id);
  const entry = snapshot.entries.find((item) => item.path === path && item.type === "blob");
  if (!entry) throw new Error("Arquivo não encontrado ou não indexado: " + path);
  if ((entry.size ?? 0) > MAX_FILE_BYTES) throw new Error("Arquivo muito grande para o visualizador (limite 128 KB).");
  const result = await cached("blob:" + entry.sha, () => getJson<{
    encoding: string; content: string; size: number;
  }>("/repos/" + repo.repoFullName + "/git/blobs/" + entry.sha));
  if (result.size > MAX_FILE_BYTES || result.encoding !== "base64") {
    throw new Error("Arquivo binário, grande demais ou codificação não suportada.");
  }
  const bytes = Uint8Array.from(atob(result.content.replace(/\s/g, "")), (char) => char.charCodeAt(0));
  if (bytes.some((byte) => byte === 0)) throw new Error("Arquivo binário: exibição de texto indisponível.");
  const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const url = "https://github.com/" + repo.repoFullName + "/blob/" + encodeURIComponent(snapshot.branch) + "/" +
    path.split("/").map(encodeURIComponent).join("/");
  return { content, url, size: result.size };
}

export async function realGitLog(repoId: string): Promise<{ commits: CommitSummary[]; branch: string }> {
  const repo = ensureAllowed(repoId);
  const snapshot = await getRepoTree(repo.id);
  const result = await cached("log:" + repo.id + ":" + snapshot.branch, () => getJson<Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } | null };
  }>>("/repos/" + repo.repoFullName + "/commits?sha=" + encodeURIComponent(snapshot.branch) + "&per_page=12"));
  return {
    branch: snapshot.branch,
    commits: result.map((item) => ({
      sha: item.sha,
      subject: item.commit.message.split("\n")[0],
      author: item.commit.author?.name ?? "Não informado",
      date: item.commit.author?.date ?? "Data não disponível",
    })),
  };
}

export async function realGitShow(repoId: string, sha: string): Promise<string> {
  const repo = ensureAllowed(repoId);
  if (!/^[a-f0-9]{7,40}$/i.test(sha)) throw new Error("SHA inválido.");
  const commit = await getJson<{
    sha: string; commit: { message: string };
    files?: { filename: string; status: string; patch?: string }[];
  }>("/repos/" + repo.repoFullName + "/commits/" + sha);
  const files = (commit.files ?? []).slice(0, 12)
    .map((file) => file.filename + " (" + file.status + ")\n" + (file.patch ?? "[diff textual indisponível]"))
    .join("\n\n");
  return (commit.sha + "\n" + commit.commit.message + "\n\n" + files).slice(0, MAX_OUTPUT) +
    (files.length > MAX_OUTPUT ? "\n[Saída truncada]" : "");
}

export async function realGitDiff(repoId: string, a: string, b: string): Promise<string> {
  const repo = ensureAllowed(repoId);
  if (![a, b].every((sha) => /^[a-f0-9]{7,40}$/i.test(sha))) throw new Error("SHAs inválidos.");
  const comparison = await getJson<{ status: string; files?: { filename: string; patch?: string }[] }>(
    "/repos/" + repo.repoFullName + "/compare/" + a + "..." + b,
  );
  const output = "Comparação real: " + a + "..." + b + " (" + comparison.status + ")\n\n" +
    (comparison.files ?? []).slice(0, 12)
      .map((file) => file.filename + "\n" + (file.patch ?? "[patch não fornecido]")).join("\n\n");
  return output.slice(0, MAX_OUTPUT) + (output.length > MAX_OUTPUT ? "\n[Saída truncada]" : "");
}
