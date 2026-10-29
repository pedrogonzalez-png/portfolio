import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Terminal } from "../components/Terminal";
import * as github from "../services/githubReadonly";
import { isRetryableGitHubError } from "../services/githubRetry";

vi.mock("../components/RepositoryExplorer", () => ({
  RepositoryExplorer: ({ onOpenFile, onRetryFile, error }: {
    onOpenFile: (path: string) => void; onRetryFile?: () => void; error: string;
  }) => <section aria-label="Explorador de teste">
    <button type="button" onClick={() => onOpenFile("src/main.js")}>Abrir arquivo de teste</button>
    {error && <p role="alert">{error}</p>}
    {onRetryFile && <button type="button" onClick={onRetryFile}>Repetir leitura</button>}
  </section>,
}));

const abismo: github.RepoSnapshot = {
  repoId: "abismo", repoFullName: "pedrogonzalez-png/jogo-site",
  branch: "main", treeSha: "a".repeat(40), entries: [], truncated: false,
};
const second: github.RepoSnapshot = {
  ...abismo, repoId: "site-3d", repoFullName: "pedrogonzalez-png/site-3D",
};
afterEach(() => vi.restoreAllMocks());

describe("terminal focus and error recovery", () => {
  it("retries a transient GitHub failure, with a short screen-reader status", async () => {
    const spy = vi.spyOn(github, "getRepoTree")
      .mockRejectedValueOnce(new Error("Sem conexão com o GitHub. Verifique sua internet."))
      .mockResolvedValueOnce(abismo);
    render(<Terminal onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "open jogo-site" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Tentar comando novamente" })).toBeInTheDocument());
    expect(screen.getByRole("status").textContent).toContain("Falha no comando open jogo-site");
    fireEvent.click(screen.getByRole("button", { name: "Tentar comando novamente" }));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByLabelText("Explorador de teste")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Tentar comando novamente" })).not.toBeInTheDocument();
  });

  it("ignores a stale file rejection after switching repositories", async () => {
    const getRepo = vi.spyOn(github, "getRepoTree").mockImplementation(async (repo) =>
      repo === "abismo" ? abismo : second);
    let rejectOld: ((reason: Error) => void) | undefined;
    vi.spyOn(github, "readRepoFile").mockImplementation(() => new Promise((_resolve,reject) => {
      rejectOld = reject;
    }));
    render(<Terminal onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "open jogo-site" }));
    await waitFor(() => expect(screen.getByLabelText("Explorador de teste")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Abrir arquivo de teste" }));
    const input = screen.getByRole("textbox", { name: "Comando do terminal virtual" });
    fireEvent.change(input, { target: { value: "open site-3d" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(getRepo).toHaveBeenCalledWith("site-3d"));
    await waitFor(() => expect(screen.getByRole("log").textContent).toContain("pedrogonzalez-png/site-3D"));
    rejectOld?.(new Error("Sem conexão com o GitHub. Verifique sua internet."));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Repetir leitura" })).not.toBeInTheDocument());
    expect(screen.queryByText("Sem conexão com o GitHub. Verifique sua internet.")).not.toBeInTheDocument();
  });

  it("contains keyboard focus in the modal and restores the opener on close", async () => {
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(() =>
      [{ width: 20, height: 20 }] as unknown as DOMRectList);
    const opener = document.createElement("button");
    opener.textContent = "Abrir modal";
    document.body.append(opener);
    opener.focus();
    const onClose = vi.fn();
    const { unmount } = render(<Terminal onClose={onClose} />);
    const input = screen.getByRole("textbox", { name: "Comando do terminal virtual" });
    expect(input).toHaveFocus();
    const first = screen.getByRole("button", { name: "Fechar terminal" });
    const last = screen.getByRole("button", { name: "git log" });
    first.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(first).toHaveFocus();
    opener.focus();
    expect(first).toHaveFocus();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});

describe("retryable error classifier", () => {
  it("recognizes transient problems but never permission/path errors", () => {
    expect(isRetryableGitHubError(new Error("GitHub indisponível (HTTP 503)."))).toBe(true);
    expect(isRetryableGitHubError(new Error("Limite de acesso do GitHub atingido."))).toBe(true);
    expect(isRetryableGitHubError(new Error("Repositório não autorizado."))).toBe(false);
    expect(isRetryableGitHubError(new Error("Arquivo não encontrado."))).toBe(false);
  });
});
