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
  source?: "snapshot" | "live";
  generatedAt?: string;
}

export interface CommitSummary {
  sha: string;
  subject: string;
  author: string;
  date: string;
  parents?: string[];
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

/** A build-generated public index, never a source of additional repo permissions. */
type ApprovedIndex = { schemaVersion: number; generatedAt: string; repos: RepoSnapshot[] };
const INDEX_PATH = new URL("github-index.json", document.baseURI).toString();

export function validatedStaticSnapshot(data: unknown, repoId: string, repoFullName: string): RepoSnapshot | null {
  if (!data || typeof data !== "object") return null;
  const index = data as Partial<ApprovedIndex>;
  if (index.schemaVersion !== 1 || !Array.isArray(index.repos) ||
      typeof index.generatedAt !== "string") return null;
  const generatedAt = Date.parse(index.generatedAt);
  if (!Number.isFinite(generatedAt) || generatedAt > Date.now() + 86_400_000 ||
      Date.now() - generatedAt > 90 * 86_400_000) return null;

  const raw = index.repos.find((item) => item?.repoId === repoId && item?.repoFullName === repoFullName);
  if (!raw || typeof raw.branch !== "string" || !/^[a-zA-Z0-9._/-]{1,130}$/.test(raw.branch) ||
      raw.branch.includes("..") || raw.branch.startsWith("/") || raw.branch.endsWith("/") ||
      typeof raw.treeSha !== "string" || !/^[a-f0-9]{40}$/.test(raw.treeSha) ||
      typeof raw.truncated !== "boolean" || !Array.isArray(raw.entries) ||
      raw.entries.length > MAX_TREE_ENTRIES) return null;

  const entries: RepoEntry[] = [];
  for (const item of raw.entries) {
    if (!item || (item.type !== "blob" && item.type !== "tree") ||
        typeof item.path !== "string" || item.path.startsWith("/") ||
        item.path.split("/").some((part) => !part || part === "." || part === "..") ||
        typeof item.sha !== "string" || !/^[a-f0-9]{40}$/.test(item.sha) ||
        (item.size !== undefined && (!Number.isSafeInteger(item.size) || item.size < 0))) return null;
    entries.push({ path: item.path, type: item.type, sha: item.sha, size: item.size });
  }
  return {
    repoId, repoFullName, branch: raw.branch, treeSha: raw.treeSha,
    truncated: raw.truncated, entries,
    generatedAt: index.generatedAt, source: "snapshot",
  };
}

async function loadPublishedIndex(): Promise<unknown> {
  return cached("public:index", async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(INDEX_PATH, { signal: controller.signal });
        if (!response.ok || !response.headers?.get("content-type")?.includes("application/json")) return null;
        return await response.json() as unknown;
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      // Local Vite dev, a missed static file, or offline mode: use live API.
      return null;
    }
  });
}

export async function getRepoTree(repoId: string): Promise<RepoSnapshot> {
  const repo = ensureAllowed(repoId);
  return cached("tree:" + repo.id, async () => {
    const fromIndex = validatedStaticSnapshot(await loadPublishedIndex(), repo.id, repo.repoFullName);
    if (fromIndex) return fromIndex;
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
      source: "live" as const,
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

export async function readRepoFile(repoId: string, path: string): Promise<{ content: string; url: string; size: number; blobSha: string }> {
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
  return { content, url, size: result.size, blobSha: entry.sha };
}

export async function realGitLog(repoId: string, page = 1): Promise<{ commits: CommitSummary[]; branch: string }> {
  if (!Number.isInteger(page) || page < 1 || page > 10) throw new Error("Página do histórico fora do intervalo permitido.");
  const repo = ensureAllowed(repoId);
  const snapshot = await getRepoTree(repo.id);
  const result = await cached("log:" + repo.id + ":" + snapshot.branch + ":" + page, () => getJson<Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } | null };
    parents?: { sha: string }[];
  }>>("/repos/" + repo.repoFullName + "/commits?sha=" + encodeURIComponent(snapshot.branch) + "&per_page=12&page=" + page));
  return {
    branch: snapshot.branch,
    commits: result.map((item) => ({
      sha: item.sha,
      subject: item.commit.message.split("\n")[0],
      author: item.commit.author?.name ?? "Não informado",
      date: item.commit.author?.date ?? "Data não disponível",
      parents: (item.parents ?? []).map((parent) => parent.sha).filter((sha) => /^[a-f0-9]{40}$/.test(sha)),
    })),
  };
}


export interface GitChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string | null;
  patchTruncated: boolean;
}
export interface GitChangeDetail {
  kind: "commit" | "comparison";
  title: string;
  refLabel: string;
  url: string;
  additions: number;
  deletions: number;
  fileCount: number;
  files: GitChangedFile[];
  truncated: boolean;
}
type GitHubFile = { filename: string; status: string; additions?: number; deletions?: number; patch?: string };

function extractGitFiles(files: GitHubFile[] | undefined): {
  files: GitChangedFile[]; count: number; truncated: boolean;
} {
  const all = files ?? [];
  const filesShown = all.slice(0, 16).map((file) => {
    const patch = file.patch ?? null;
    return {
      filename: file.filename,
      status: file.status,
      additions: file.additions ?? 0,
      deletions: file.deletions ?? 0,
      patch: patch === null ? null : patch.slice(0, 6000),
      patchTruncated: patch !== null && patch.length > 6000,
    };
  });
  return {
    files: filesShown,
    count: all.length,
    truncated: all.length > filesShown.length || filesShown.some((file) => file.patchTruncated),
  };
}

export async function getGitCommitDetail(repoId: string, sha: string): Promise<GitChangeDetail> {
  const repo = ensureAllowed(repoId);
  if (!/^[a-f0-9]{7,40}$/i.test(sha)) throw new Error("SHA inválido.");
  const commit = await cached("commitdetail:" + repo.id + ":" + sha, () => getJson<{
    sha: string;
    html_url?: string;
    commit: { message: string };
    stats?: { additions: number; deletions: number };
    files?: GitHubFile[];
  }>("/repos/" + repo.repoFullName + "/commits/" + sha));
  const result = extractGitFiles(commit.files);
  return {
    kind: "commit",
    title: commit.commit.message.split("\n")[0],
    refLabel: commit.sha,
    url: "https://github.com/" + repo.repoFullName + "/commit/" + commit.sha,
    additions: commit.stats?.additions ?? 0,
    deletions: commit.stats?.deletions ?? 0,
    fileCount: result.count,
    files: result.files,
    truncated: result.truncated,
  };
}

export async function getGitCompareDetail(repoId: string, a: string, b: string): Promise<GitChangeDetail> {
  const repo = ensureAllowed(repoId);
  if (![a,b].every((sha) => /^[a-f0-9]{7,40}$/i.test(sha))) throw new Error("SHAs inválidos.");
  const compare = await cached("comparedetail:" + repo.id + ":" + a + ":" + b, () =>
    getJson<{ status: string; files?: GitHubFile[] }>(
      "/repos/" + repo.repoFullName + "/compare/" + a + "..." + b,
    ));
  const result = extractGitFiles(compare.files);
  return {
    kind: "comparison",
    title: "Comparação Git (" + compare.status + ")",
    refLabel: a + "..." + b,
    url: "https://github.com/" + repo.repoFullName + "/compare/" + a + "..." + b,
    additions: result.files.reduce((sum, file) => sum + file.additions, 0),
    deletions: result.files.reduce((sum, file) => sum + file.deletions, 0),
    fileCount: result.count,
    files: result.files,
    truncated: result.truncated,
  };
}

export function summarizeGitChange(detail: GitChangeDetail): string {
  return [
    detail.kind === "commit" ? "Commit real: " + detail.refLabel : "Comparação real: " + detail.refLabel,
    detail.title,
    detail.fileCount + " arquivo(s) retornado(s), +" + detail.additions + " / -" + detail.deletions,
    detail.truncated ? "Trecho limitado; consulte a fonte para o diff completo." : "",
    "Visualização sincronizada na aba Histórico, à direita.",
    "GitHub: " + detail.url,
  ].filter(Boolean).join("\n");
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
