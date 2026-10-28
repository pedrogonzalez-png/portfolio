import { useEffect, useMemo, useState } from "react";
import { CodeMirror } from "./CodeMirror";
import { SafeMarkdownPreview } from "./SafeMarkdownPreview";
import type { RepoEntry, RepoSnapshot } from "../services/githubReadonly";
import { directoryEntries, realGitLog, realGitShow } from "../services/githubReadonly";
import type { CommitSummary } from "../services/githubReadonly";
import { CommitGraph } from "./CommitGraph";
import { technicalMilestonesForRepo } from "../services/gitMilestones";

export type EditorTab = {
  path: string;
  content: string;
  url: string;
  repo: string;
  blobSha: string;
};

type Props = {
  snapshot: RepoSnapshot;
  tabs: EditorTab[];
  activePath: string | null;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onOpenFile: (path: string) => void;
  busy: boolean;
  error: string;
};

const MAX_TREE_RENDER = 180;

function GitTimeline({ repoId, branch, repoFullName }: { repoId: string; branch: string; repoFullName: string }) {
  const [page, setPage] = useState(1);
  const [commits, setCommits] = useState<CommitSummary[]>([]);
  const [mode, setMode] = useState<"full" | "milestones">("full");
  const [detail, setDetail] = useState<{ sha: string; output: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const milestones = technicalMilestonesForRepo(repoId);

  useEffect(() => { setPage(1); setMode("full"); setDetail(null); }, [repoId, branch]);
  useEffect(() => {
    if (mode !== "full") return;
    let cancelled = false;
    setLoading(true);
    setError("");
    realGitLog(repoId, page).then((result) => {
      if (!cancelled) setCommits(result.commits);
    }).catch((cause: unknown) => {
      if (!cancelled) {
        setCommits([]);
        setError(cause instanceof Error ? cause.message : "Erro ao consultar o GitHub.");
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [repoId, page, mode]);

  const viewCommit = async (sha: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const output = await realGitShow(repoId, sha);
      setDetail({ sha, output });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o commit.");
    } finally { setBusy(false); }
  };

  return (
    <section className="explorer-timeline" aria-label="Histórico de commits">
      <div className="explorer-panel-title">
        HISTÓRICO REAL <span>{branch} · {mode === "full" ? "página " + page : "seleção provisória"}</span>
      </div>
      <div className="git-mode-switch" role="group" aria-label="Tipo de histórico">
        <button type="button" aria-pressed={mode === "full"} onClick={() => { setMode("full"); setDetail(null); }}>Histórico completo</button>
        <button type="button" aria-pressed={mode === "milestones"} onClick={() => { setMode("milestones"); setDetail(null); }}>Marcos selecionados</button>
      </div>
      {error && <p role="alert" className="terminal-error">{error}</p>}
      {mode === "milestones" ? (
        <>
          <p className="explorer-help">Candidatos técnicos selecionados por SHA e diff real. A seleção <strong>ainda não foi aprovada pelo proprietário</strong>.</p>
          <ol className="git-milestones">
            {milestones.map((item) => (
              <li key={item.sha}>
                <span className="git-milestone-type">{item.category}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <div className="git-milestone-actions">
                  <button type="button" disabled={busy} onClick={() => void viewCommit(item.sha)}>Ver diff · {item.sha.slice(0, 9)}</button>
                  <a href={"https://github.com/" + repoFullName + "/commit/" + item.sha}
                    target="_blank" rel="noopener noreferrer">Verificar no GitHub ↗</a>
                </div>
              </li>
            ))}
          </ol>
          {!milestones.length && <p>Nenhum marco selecionado para este repositório.</p>}
        </>
      ) : loading ? <p role="status">Consultando histórico...</p> : (
        <>
          <p className="explorer-help">Arestas só conectam SHAs pai/filho devolvidos pelo GitHub e presentes nesta página. Merges usam uma segunda trilha. Não são criadas ligações entre páginas incompletas.</p>
          <div className="git-history-visual">
            <CommitGraph commits={commits}/>
            <ol className="explorer-commits">
              {commits.map((commit) => (
                <li key={commit.sha}>
                  <button type="button" disabled={busy} onClick={() => void viewCommit(commit.sha)}>
                    <code>{commit.sha.slice(0, 9)}</code>
                    <span>{commit.subject}</span>
                    <small>{commit.author} · {commit.date.slice(0, 10)}</small>
                    {(commit.parents?.length ?? 0) > 1 && <small>Merge com {commit.parents?.length} pais</small>}
                    {(commit.parents ?? []).some((sha) => !commits.some((candidate) => candidate.sha === sha)) &&
                      <small>Pai fora desta página</small>}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          {!commits.length && <p>Nenhum commit disponível nesta página.</p>}
          <div className="explorer-pagination">
            <button type="button" disabled={page === 1 || loading} onClick={() => { setPage((value) => value - 1); setDetail(null); }}>← Anterior</button>
            <span>{page}</span>
            <button type="button" disabled={commits.length < 12 || loading || page >= 10} onClick={() => { setPage((value) => value + 1); setDetail(null); }}>Próxima →</button>
          </div>
        </>
      )}
      {detail && (
        <section className="explorer-commit-detail" aria-label="Detalhes do commit">
          <div className="terminal-filebar">
            <strong>Commit {detail.sha.slice(0, 10)}</strong>
            <a href={"https://github.com/" + repoFullName + "/commit/" + detail.sha}
              target="_blank" rel="noopener noreferrer">Fonte GitHub ↗</a>
            <button type="button" onClick={() => setDetail(null)} aria-label="Fechar detalhes do commit">✕</button>
          </div>
          <pre>{detail.output}</pre>
        </section>
      )}
    </section>
  );
}

export function RepositoryExplorer({
  snapshot, tabs, activePath, onSelectTab, onCloseTab, onOpenFile, busy, error,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["src"]));
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"files" | "history">("files");
  const [markdownPreview, setMarkdownPreview] = useState(false);
  const current = tabs.find((tab) => tab.path === activePath) ?? null;

  useEffect(() => { setExpanded(new Set(["src"])); setSearch(""); setView("files"); }, [snapshot.repoId]);
  useEffect(() => { setMarkdownPreview(false); }, [activePath]);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? snapshot.entries.filter((entry) =>
      entry.type === "blob" && entry.path.toLowerCase().includes(query),
    ).slice(0, 65) : [];
  }, [search, snapshot]);

  const toggleFolder = (path: string) => {
    setExpanded((before) => {
      const next = new Set(before);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  let count = 0;
  const children = (path: string, depth = 0): React.ReactNode => {
    if (depth > 9 || count >= MAX_TREE_RENDER) return null;
    let entries: RepoEntry[];
    try { entries = directoryEntries(snapshot, path); }
    catch { return null; }
    return (
      <ul className="explorer-tree-list">
        {entries.map((entry) => {
          if (count >= MAX_TREE_RENDER) return null;
          count += 1;
          const isFolder = entry.type === "tree";
          const isExpanded = isFolder && expanded.has(entry.path);
          const label = entry.path.slice(path ? path.length + 1 : 0);
          return (
            <li key={entry.path}>
              <button
                type="button"
                className={"explorer-tree-item" + (activePath === entry.path ? " is-active" : "")}
                onClick={() => isFolder ? toggleFolder(entry.path) : onOpenFile(entry.path)}
                aria-expanded={isFolder ? isExpanded : undefined}
                title={entry.path}
              >
                <span aria-hidden="true">{isFolder ? (isExpanded ? "▾" : "▸") : "·"}</span>
                <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span>
                <span>{label}</span>
              </button>
              {isFolder && isExpanded && children(entry.path, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section className="terminal-explorer" aria-label="Explorador de repositório">
      <div className="explorer-toolbar">
        <div className="explorer-repo">
          <strong title={snapshot.repoFullName}>{snapshot.repoFullName}</strong>
          <span>{snapshot.branch} · SHA {snapshot.treeSha.slice(0, 9)}{snapshot.truncated ? " · PARCIAL" : ""}</span>
        </div>
        <div className="explorer-modes" aria-label="Visualização">
          <button type="button" aria-pressed={view === "files"} onClick={() => setView("files")}>Arquivos</button>
          <button type="button" aria-pressed={view === "history"} onClick={() => setView("history")}>Histórico</button>
        </div>
      </div>
      {view === "history" ? <GitTimeline repoId={snapshot.repoId} branch={snapshot.branch} repoFullName={snapshot.repoFullName} /> : (
        <div className="explorer-layout">
          <aside className="explorer-sidebar" aria-label="Árvore de arquivos">
            <label htmlFor="explorer-search">LOCALIZAR ARQUIVO</label>
            <input id="explorer-search" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome ou caminho..." aria-label="Buscar nome de arquivo" />
            <div className="explorer-tree" role="group" aria-label="Arquivos do GitHub">
              {search.trim() ? (
                <ul className="explorer-search-results">
                  {matches.map((entry) => (
                    <li key={entry.path}>
                      <button type="button" onClick={() => onOpenFile(entry.path)} title={entry.path}>{entry.path}</button>
                    </li>
                  ))}
                  {!matches.length && <li>Nenhum arquivo encontrado no índice.</li>}
                </ul>
              ) : children("")}
              {!search.trim() && count >= MAX_TREE_RENDER && <p className="explorer-help">Árvore limitada a {MAX_TREE_RENDER} itens visíveis. Use a busca para localizar outros.</p>}
              {snapshot.truncated && <p className="explorer-help">Índice parcial do GitHub: alguns arquivos podem faltar.</p>}
            </div>
          </aside>
          <div className="explorer-editor" aria-label="Editor de código">
            <div className="explorer-tabs" role="group" aria-label="Arquivos abertos">
              {tabs.map((tab) => (
                <div className={"explorer-tab" + (tab.path === activePath ? " active" : "")} key={tab.path}>
                  <button type="button" title={tab.path} aria-current={tab.path === activePath ? "page" : undefined}
                    onClick={() => onSelectTab(tab.path)}>{tab.path.split("/").at(-1)}</button>
                  <button type="button" aria-label={"Fechar aba " + tab.path} onClick={() => onCloseTab(tab.path)}>×</button>
                </div>
              ))}
            </div>
            {error && <p role="alert" className="terminal-error explorer-message">{error}</p>}
            {busy && <p role="status" className="explorer-message">Carregando arquivo do GitHub...</p>}
            {current ? (
              <>
                <div className="explorer-file-meta">
                  <div className="explorer-breadcrumbs" aria-label="Caminho do arquivo">
                    {current.path.split("/").map((segment, i) => <span key={i}>{i > 0 && <b aria-hidden="true"> / </b>}{segment}</span>)}
                  </div>
                  <div className="explorer-file-actions">
                    {/\.md(?:own)?$/i.test(current.path) && (
                      <button type="button" onClick={() => setMarkdownPreview((previous) => !previous)}>
                        {markdownPreview ? "Código" : "Prévia Markdown"}
                      </button>
                    )}
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(current.path)}>Copiar caminho</button>
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(current.content)}>Copiar código</button>
                    <a href={current.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                  </div>
                </div>
                <p className="explorer-source">{current.repo} · {snapshot.branch} · blob {current.blobSha.slice(0, 10)} · readonly</p>
                <div className="terminal-codewrap">
                  {markdownPreview && /\.md(?:own)?$/i.test(current.path)
                    ? <SafeMarkdownPreview content={current.content} />
                    : <CodeMirror content={current.content} fileName={current.path} />}
                </div>
              </>
            ) : (
              <div className="explorer-empty">
                <strong>Explorar arquivos reais</strong>
                <p>Abra uma pasta à esquerda ou use <code>code src/main.js</code> no terminal.</p>
                <p>Conteúdos carregados sob demanda. Nenhum arquivo pode ser alterado aqui.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
