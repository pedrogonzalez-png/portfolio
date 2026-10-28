import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { RepositoryExplorer, type EditorTab, type GitNavigation } from "./RepositoryExplorer";
import {
  approvedRepos,
  directoryEntries,
  getRepoTree,
  normalizeRepoPath,
  readRepoFile,
  getGitCommitDetail,
  getGitCompareDetail,
  realGitLog,
  summarizeGitChange,
  resolveRepo,
} from "../services/githubReadonly";
import type { RepoSnapshot } from "../services/githubReadonly";
import { isRetryableGitHubError } from "../services/githubRetry";
import "../styles/terminal.css";

type TerminalLine = { command: string; output: string; error?: boolean };

const HELP = [
  "Terminal virtual — somente leitura; nenhum comando roda no seu computador.",
  "help | repos | open <id> | pwd | ls [path] | cd <path> | tree [path]",
  "cat <arquivo> | code <arquivo> | find <nome> | git log [página 1-10]",
  "git show <SHA> | git diff <SHA-A> <SHA-B> | whoami | neofetch",
  "goto projects|about|contact | history | clear",
  "Exemplo: open jogo-site → ls src → code src/main.js",
].join("\n");

function parseCommand(command: string): string[] {
  const matches = command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  if (matches.length > 12 || command.length > 550) throw new Error("Comando muito longo.");
  return matches.map((word) => {
    if ((word.startsWith('"') && word.endsWith('"')) ||
      (word.startsWith("'") && word.endsWith("'"))) return word.slice(1, -1);
    return word;
  });
}

function limitOutput(text: string): string {
  if (text.length <= 12500) return text;
  return text.slice(0, 12500) + "\n[Saída truncada — abra o arquivo em code para leitura completa.]";
}

export function Terminal({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<TerminalLine[]>([
    { command: "", output: "ARCH / PORTFOLIO\nExplorador GitHub readonly. Digite help ou repos para começar." },
  ]);
  const [input, setInput] = useState("");
  const [repoId, setRepoId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RepoSnapshot | null>(null);
  const [mobileView, setMobileView] = useState<"console" | "explorer">("console");
  const [isNarrow, setIsNarrow] = useState(false);
  const [gitNavigation, setGitNavigation] = useState<GitNavigation | null>(null);
  const navigationId = useRef(0);
  const [cwd, setCwd] = useState("");
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [explorerBusy, setExplorerBusy] = useState(false);
  const [explorerError, setExplorerError] = useState("");
  const [failedFilePath, setFailedFilePath] = useState<string | null>(null);
  const [retryCommand, setRetryCommand] = useState<string | null>(null);
  const [assistiveStatus, setAssistiveStatus] = useState("Terminal virtual somente leitura. Digite help para conhecer os comandos.");
  const [busy, setBusy] = useState(false);
  const [previous, setPrevious] = useState<string[]>([]);
  const [previousIndex, setPreviousIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const fileBusyRef = useRef(false);
  const fileRequestId = useRef(0);
  const aliveRef = useRef(true);
  const currentRepoRef = useRef<string | null>(null);
  const narrowRef = useRef(false);
  const explorerPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const sync = () => {
      narrowRef.current = media.matches;
      setIsNarrow(media.matches);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isNarrow) return;
    if (mobileView === "explorer") explorerPanelRef.current?.focus();
    else inputRef.current?.focus();
  }, [mobileView, isNarrow]);

  useEffect(() => {
    aliveRef.current = true;
    const priorFocus = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const focusables = (): HTMLElement[] => {
      if (!dialogRef.current) return [];
      return Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )).filter((element) =>
        element.getClientRects().length > 0 &&
        element.getAttribute("aria-hidden") !== "true" &&
        !element.closest("[hidden], [inert], [aria-hidden='true']"),
      );
    };
    const onKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const candidates = focusables();
      if (!candidates.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !dialogRef.current.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !dialogRef.current.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };
    const keepFocusInDialog = (event: FocusEvent) => {
      if (!dialogRef.current || dialogRef.current.contains(event.target as Node)) return;
      const next = focusables()[0] ?? dialogRef.current;
      next.focus();
    };
    window.addEventListener("keydown", onKeys);
    document.addEventListener("focusin", keepFocusInDialog);
    return () => {
      aliveRef.current = false;
      fileRequestId.current += 1;
      document.removeEventListener("focusin", keepFocusInDialog);
      window.removeEventListener("keydown", onKeys);
      document.body.style.overflow = oldOverflow;
      priorFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [history]);

  const runCommand = async (raw: string) => {
    const command = raw.trim();
    if (!command || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setInput("");
    setRetryCommand(null);
    setAssistiveStatus("Executando comando: " + command);
    let revealExplorer = false;
    setPrevious((items) => [...items.slice(-49), command]);
    setPreviousIndex(-1);
    try {
      const args = parseCommand(command);
      const [verb, ...rest] = args;
      let output = "";
      if (verb === "clear") {
        setHistory([]); return;
      }
      if (verb === "help") {
        output = HELP;
      } else if (verb === "whoami") {
        output = "visitor — convidado do portfólio, não uma sessão real do Arch Linux.";
      } else if (verb === "neofetch") {
        output = "OS: Portfolio (simulado)\nShell: readonly-fish (simulado)\nTheme: Changli\nFonte: GitHub público (somente repositórios autorizados)";
      } else if (verb === "repos") {
        output = approvedRepos().map((repo) => repo.id + "  " + repo.repoFullName + "  [" + repo.status + "]").join("\n");
      } else if (verb === "history") {
        output = previous.concat(command).slice(-30).map((cmd, index) => (index + 1) + "  " + cmd).join("\n");
      } else if (verb === "open") {
        if (!rest[0] || rest.length !== 1) throw new Error("Uso: open <repo-id>");
        const approved = resolveRepo(rest[0]);
        if (!approved) throw new Error("Repositório não autorizado. Digite repos.");
        const tree = await getRepoTree(approved.id);
        currentRepoRef.current = approved.id;
        setRepoId(approved.id);
        setSnapshot(tree);
        fileRequestId.current += 1;
        fileBusyRef.current = false;
        setExplorerBusy(false);
        setFailedFilePath(null);
        setGitNavigation(null);
        revealExplorer = true;
        setCwd("");
        setTabs([]);
        setActivePath(null);
        setExplorerError("");
        output = "Aberto: " + tree.repoFullName + "\nBranch: " + tree.branch +
          "\nTree SHA: " + tree.treeSha + "\n" +
          tree.entries.length + " entradas indexadas" +
          (tree.truncated ? " (ÍNDICE PARCIAL)" : "") + "\nDigite ls ou tree.";
      } else if (verb === "goto") {
        const destination = rest[0];
        const target = destination === "projects" ? "projetos" :
          destination === "about" || destination === "contact" ? "sobre" : "";
        if (!target) throw new Error("Uso: goto projects|about|contact");
        onClose();
        requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }));
        output = "Indo para " + target;
      } else if (verb === "pwd") {
        output = repoId ? "/" + repoId + "/" + (cwd ? cwd + "/" : "") : "/workspace";
      } else if (verb === "ls" || verb === "cd" || verb === "cat" ||
        verb === "code" || verb === "tree" || verb === "find") {
        if (!repoId) throw new Error("Escolha um repositório antes: repos → open <id>");
        const tree = snapshot ?? await getRepoTree(repoId);
        const pathArg = rest.filter((arg) => arg !== "-la" && arg !== "-l")[0] ?? ".";
        if (verb === "find") {
          const needle = rest.join(" ").toLowerCase();
          if (!needle) throw new Error("Uso: find <nome>");
          const matches = tree.entries.filter((entry) => entry.path.toLowerCase().includes(needle)).slice(0, 65);
          output = matches.map((entry) => entry.path).join("\n") || "Nenhum nome encontrado no índice.";
          if (tree.truncated) output += "\n[Aviso: índice parcial do GitHub.]";
        } else {
          const path = normalizeRepoPath(cwd, pathArg);
          if (verb === "cd") {
            directoryEntries(tree, path);
            setCwd(path);
            output = "/" + repoId + (path ? "/" + path : "");
          } else if (verb === "ls") {
            const entries = directoryEntries(tree, path);
            output = entries.map((entry) => (entry.type === "tree" ? "📁 " : "   ") +
              entry.path.slice(path ? path.length + 1 : 0)).join("\n") || "[Pasta vazia]";
            if (tree.truncated) output += "\n[Aviso: índice parcial.]";
          } else if (verb === "tree") {
            const prefix = path ? path + "/" : "";
            const entries = tree.entries.filter((entry) => entry.path === path || entry.path.startsWith(prefix)).slice(0, 90);
            output = entries.map((entry) => (entry.type === "tree" ? "📁 " : "   ") + entry.path).join("\n") || "[Nenhuma entrada]";
            if (entries.length === 90 || tree.truncated) output += "\n[Árvore limitada; conteúdo parcial.]";
          } else {
            const file = await readRepoFile(repoId, path);
            if (verb === "code") {
              setTabs((current) => [...current.filter((tab) => tab.path !== path), {
                path, content: file.content, url: file.url, repo: tree.repoFullName, blobSha: file.blobSha,
              }].slice(-7));
              setActivePath(path);
              setExplorerError("");
              revealExplorer = true;
              output = "Arquivo real aberto: " + path + " (" + file.size + " bytes)\nGitHub: " + file.url;
            } else {
              output = "GitHub / " + tree.repoFullName + " / " + tree.branch + " / " + path +
                "\n\n" + limitOutput(file.content);
            }
          }
        }
      } else if (verb === "git") {
        if (!repoId) throw new Error("Escolha primeiro: open <repo-id>");
        const sub = rest[0];
        if (sub === "log") {
          if (rest.length > 2) throw new Error("Uso: git log [página 1-10]");
          const page = rest[1] === undefined ? 1 : Number(rest[1]);
          if (!Number.isInteger(page) || page < 1 || page > 10) {
            throw new Error("Página inválida. Use git log 1 até git log 10.");
          }
          const data = await realGitLog(repoId, page);
          setGitNavigation({ id: ++navigationId.current, kind: "log", page });
          revealExplorer = true;
          output = "Commits reais de " + data.branch + " · página " + page +
            " (até 12 resultados; índice limitado a 10 páginas):\n" +
            data.commits.map((c) => c.sha.slice(0, 10) + "  " + c.date.slice(0, 10) +
              "  " + c.author + " — " + c.subject).join("\n");
        } else if (sub === "show") {
          if (!rest[1]) throw new Error("Uso: git show <SHA>");
          const detail = await getGitCommitDetail(repoId, rest[1]);
          setGitNavigation({ id: ++navigationId.current, kind: "detail", detail });
          revealExplorer = true;
          output = summarizeGitChange(detail);
        } else if (sub === "diff") {
          if (!rest[1] || !rest[2]) throw new Error("Uso: git diff <SHA-A> <SHA-B>");
          const detail = await getGitCompareDetail(repoId, rest[1], rest[2]);
          setGitNavigation({ id: ++navigationId.current, kind: "detail", detail });
          revealExplorer = true;
          output = summarizeGitChange(detail);
        } else {
          throw new Error("Uso: git log | git show <SHA> | git diff <A> <B>");
        }
      } else {
        throw new Error("Comando não reconhecido. Digite help. Shell real não disponível.");
      }
      if (aliveRef.current) {
        setHistory((lines) => [...lines.slice(-75), { command, output: limitOutput(output) }]);
        setAssistiveStatus("Comando concluído: " + command + (revealExplorer ? ". Resultado disponível no explorador." : "."));
      }
    } catch (error) {
      if (aliveRef.current) {
        const message = error instanceof Error ? error.message : "Erro ao consultar o GitHub.";
        setHistory((lines) => [...lines.slice(-75), { command, output: message, error: true }]);
        setRetryCommand(isRetryableGitHubError(error) ? command : null);
        setAssistiveStatus("Falha no comando " + command + ". " + message);
      }
    } finally {
      busyRef.current = false;
      if (aliveRef.current) {
        setBusy(false);
        if (revealExplorer && narrowRef.current) {
          setMobileView("explorer");
          explorerPanelRef.current?.focus();
        } else if (!narrowRef.current || mobileView === "console") {
          inputRef.current?.focus();
        }
      }
    }
  };

  const openExplorerFile = async (path: string) => {
    if (!repoId || !snapshot || fileBusyRef.current) return;
    if (tabs.some((tab) => tab.path === path)) {
      setActivePath(path);
      return;
    }
    const requestedRepo = repoId;
    const requestId = ++fileRequestId.current;
    fileBusyRef.current = true;
    setExplorerBusy(true);
    setExplorerError("");
    setFailedFilePath(null);
    try {
      const file = await readRepoFile(requestedRepo, path);
      if (!aliveRef.current || requestId !== fileRequestId.current ||
          requestedRepo !== currentRepoRef.current) return;
      setTabs((current) => [...current.filter((tab) => tab.path !== path), {
        path, content: file.content, url: file.url, repo: snapshot.repoFullName, blobSha: file.blobSha,
      }].slice(-7));
      setActivePath(path);
      setAssistiveStatus("Arquivo carregado: " + path);
    } catch (cause) {
      if (!aliveRef.current || requestId !== fileRequestId.current ||
          requestedRepo !== currentRepoRef.current) return;
      const message = cause instanceof Error ? cause.message : "Falha ao carregar arquivo do GitHub.";
      setExplorerError(message);
      setFailedFilePath(isRetryableGitHubError(cause) ? path : null);
      setAssistiveStatus("Falha ao carregar " + path + ". " + message);
    } finally {
      if (aliveRef.current && requestId === fileRequestId.current) {
        fileBusyRef.current = false;
        setExplorerBusy(false);
      }
    }
  };
  const closeTab = (path: string) => {
    setTabs((current) => {
      const next = current.filter((tab) => tab.path !== path);
      setActivePath((previous) => previous === path ? (next.at(-1)?.path ?? null) : previous);
      return next;
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void runCommand(input);
  };
  const onInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" && previous.length) {
      event.preventDefault();
      const next = previousIndex < 0 ? previous.length - 1 : Math.max(0, previousIndex - 1);
      setPreviousIndex(next); setInput(previous[next]);
    } else if (event.key === "ArrowDown" && previousIndex >= 0) {
      event.preventDefault();
      const next = previousIndex + 1;
      setPreviousIndex(next < previous.length ? next : -1);
      setInput(next < previous.length ? previous[next] : "");
    }
  };

  return (
    <div className="terminal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div ref={dialogRef} className="terminal-dialog" role="dialog" aria-modal="true"
        aria-labelledby="terminal-title" aria-describedby="terminal-a11y-help" tabIndex={-1}>
        <header className="terminal-header">
          <div>
            <span className="terminal-dot" aria-hidden="true" />
            <strong id="terminal-title">KITTY / PORTFÓLIO</strong>
            <span className="terminal-readonly">GITHUB · SOMENTE LEITURA</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar terminal">✕</button>
        </header>
        <p id="terminal-a11y-help" className="terminal-assistive-status">
          Explorador GitHub somente leitura. Escape fecha o terminal; Tab percorre os controles.
        </p>
        <p className="terminal-assistive-status" role="status" aria-atomic="true">{assistiveStatus}</p>
        {snapshot && (
          <div className="terminal-mobile-tabs" role="tablist" aria-label="Painéis do terminal"
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" &&
                  event.key !== "Home" && event.key !== "End") return;
              event.preventDefault();
              const next = event.key === "Home" || event.key === "ArrowLeft" ? "console" : "explorer";
              setMobileView(next);
              const id = next === "console" ? "terminal-tab-console" : "terminal-tab-explorer";
              document.getElementById(id)?.focus();
            }}>
            <button id="terminal-tab-console" type="button"
              role="tab" aria-selected={mobileView === "console"} aria-controls="terminal-panel-console"
              onClick={() => setMobileView("console")}>Console</button>
            <button id="terminal-tab-explorer" type="button"
              role="tab" aria-selected={mobileView === "explorer"} aria-controls="terminal-panel-explorer"
              onClick={() => setMobileView("explorer")}>Arquivos e Git</button>
          </div>
        )}
        <div className={"terminal-workspace" + (snapshot ? " terminal-workspace--split" : "")}
          data-mobile-view={mobileView}>
          <section className="terminal-shell" id="terminal-panel-console"
            role={isNarrow && snapshot ? "tabpanel" : undefined}
            aria-labelledby={isNarrow && snapshot ? "terminal-tab-console" : undefined}
            aria-label={!isNarrow || !snapshot ? "Console de comandos" : undefined}>
            <div className="terminal-transcript" ref={transcriptRef} role="log" aria-live="off" aria-busy={busy}>
              {history.map((line, index) => (
                <div className="terminal-line" key={index}>
                  {line.command && <div className="terminal-command">visitor@portfolio:{repoId ?? "~"}$ {line.command}</div>}
                  <pre className={line.error ? "terminal-error" : "terminal-output"}>{line.output}</pre>
                </div>
              ))}
            </div>
            <form className="terminal-prompt" onSubmit={onSubmit}>
              <label htmlFor="terminal-input">{repoId ?? "~"} $</label>
              <input id="terminal-input" ref={inputRef} value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onInputKey} autoComplete="off" spellCheck={false}
                placeholder={busy ? "Consultando GitHub..." : "help, repos, open jogo-site..."}
                disabled={busy} aria-label="Comando do terminal virtual"/>
              <button type="submit" disabled={busy || !input.trim()}>{busy ? "..." : "Executar"}</button>
            </form>
            {retryCommand && (
              <div className="terminal-retry">
                <span>Erro temporário de conexão com o GitHub.</span>
                <button type="button" disabled={busy} onClick={() => void runCommand(retryCommand)}>
                  Tentar comando novamente
                </button>
              </div>
            )}
            <div className="terminal-quick">
              {["help", "repos", "open jogo-site", "ls", "git log"].map((command) => (
                <button type="button" key={command} disabled={busy} onClick={() => void runCommand(command)}>{command}</button>
              ))}
            </div>
          </section>
          {snapshot && (
            <div className="terminal-explorer-viewport" id="terminal-panel-explorer"
              ref={explorerPanelRef} tabIndex={-1}
              role={isNarrow ? "tabpanel" : undefined}
              aria-labelledby={isNarrow ? "terminal-tab-explorer" : undefined}>
            <RepositoryExplorer
              snapshot={snapshot}
              tabs={tabs}
              activePath={activePath}
              onSelectTab={setActivePath}
              onCloseTab={closeTab}
              onOpenFile={(path) => { void openExplorerFile(path); }}
              busy={explorerBusy}
              error={explorerError}
              gitNavigation={gitNavigation}
              onRetryFile={failedFilePath ? () => { void openExplorerFile(failedFilePath); } : undefined}
            />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
