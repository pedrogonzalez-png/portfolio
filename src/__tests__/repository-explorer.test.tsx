import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as github from "../services/githubReadonly";

vi.mock("../components/CodeMirror", () => ({
  CodeMirror: ({ content }: { content: string }) => <pre data-testid="readonly-source">{content}</pre>,
}));

import { RepositoryExplorer, type EditorTab } from "../components/RepositoryExplorer";

const snapshot: github.RepoSnapshot = {
  repoId: "abismo",
  repoFullName: "pedrogonzalez-png/jogo-site",
  branch: "main",
  treeSha: "a".repeat(40),
  truncated: false,
  entries: [
    { path: "README.md", type: "blob", sha: "b".repeat(40) },
    { path: "src", type: "tree", sha: "c".repeat(40) },
    { path: "src/main.js", type: "blob", sha: "d".repeat(40) },
    { path: "src/scenes", type: "tree", sha: "e".repeat(40) },
    { path: "src/scenes/GameScene.js", type: "blob", sha: "f".repeat(40) },
  ],
};
const opened: EditorTab = {
  path: "src/main.js",
  content: "console.log('Código real');",
  url: "https://github.com/pedrogonzalez-png/jogo-site/blob/main/src/main.js",
  repo: "pedrogonzalez-png/jogo-site",
  blobSha: "d".repeat(40),
};

function renderExplorer(options: { tabs?: EditorTab[]; activePath?: string | null; onOpenFile?: (path: string) => void } = {}) {
  const onOpenFile = options.onOpenFile ?? vi.fn();
  const onCloseTab = vi.fn();
  const onSelectTab = vi.fn();
  render(
    <RepositoryExplorer
      snapshot={snapshot}
      tabs={options.tabs ?? []}
      activePath={options.activePath ?? null}
      onOpenFile={onOpenFile}
      onCloseTab={onCloseTab}
      onSelectTab={onSelectTab}
      busy={false}
      error=""
    />,
  );
  return { onOpenFile, onCloseTab, onSelectTab };
}

describe("readonly GitHub explorer UI", () => {
  it("shows source tree from the authorized snapshot and opens a real indexed file", () => {
    const onOpenFile = vi.fn();
    renderExplorer({ onOpenFile });
    fireEvent.click(screen.getByRole("button", { name: /main\.js/ }));
    expect(onOpenFile).toHaveBeenCalledWith("src/main.js");
    fireEvent.click(screen.getByRole("button", { name: /scenes/ }));
    expect(screen.getByRole("button", { name: /GameScene\.js/ })).toBeInTheDocument();
  });

  it("searches by file name and never invents results", () => {
    renderExplorer();
    const input = screen.getByRole("textbox", { name: /Buscar nome de arquivo/ });
    fireEvent.change(input, { target: { value: "GameScene" } });
    expect(screen.getByRole("button", { name: "src/scenes/GameScene.js" })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "does-not-exist" } });
    expect(screen.getByText(/Nenhum arquivo encontrado/)).toBeInTheDocument();
  });

  it("renders existing tabs with the exact blob SHA and permits closing", () => {
    const { onCloseTab, onSelectTab } = renderExplorer({ tabs: [opened], activePath: opened.path });
    expect(screen.getByTestId("readonly-source")).toHaveTextContent(opened.content);
    expect(screen.getByText(/blob dddddddddd/)).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("group", { name: "Arquivos abertos" })).getByRole("button", { name: "main.js" }));
    expect(onSelectTab).toHaveBeenCalledWith(opened.path);
    fireEvent.click(screen.getByRole("button", { name: /Fechar aba src\/main\.js/ }));
    expect(onCloseTab).toHaveBeenCalledWith(opened.path);
  });

  it("shows a real commit timeline without fabricated entries", async () => {
    const spy = vi.spyOn(github, "realGitLog").mockResolvedValue({
      branch: "main",
      commits: [{
        sha: "1".repeat(40),
        subject: "Actual commit from GitHub",
        author: "Developer",
        date: "2026-10-27T11:00:00Z",
      }],
    });
    try {
      renderExplorer();
      fireEvent.click(screen.getByRole("button", { name: "Histórico" }));
      await waitFor(() => expect(screen.getByText("Actual commit from GitHub")).toBeInTheDocument());
      expect(spy).toHaveBeenCalledWith("abismo", 1);
    } finally {
      spy.mockRestore();
    }
  });
});
