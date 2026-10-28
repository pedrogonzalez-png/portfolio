import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import * as github from "../services/githubReadonly";
import { RepositoryExplorer } from "../components/RepositoryExplorer";

vi.mock("../components/CodeMirror", () => ({
  CodeMirror: ({ content }: { content: string }) => <pre>{content}</pre>,
}));

const snapshot: github.RepoSnapshot = {
  repoId: "abismo", repoFullName: "pedrogonzalez-png/jogo-site",
  branch: "main", treeSha: "a".repeat(40), truncated: false, entries: [],
};
const detail: github.GitChangeDetail = {
  kind: "comparison", title: "Comparison (ahead)", refLabel: "a".repeat(7) + "..." + "b".repeat(7),
  url: "https://github.com/pedrogonzalez-png/jogo-site/compare/aaaaaaa...bbbbbbb",
  additions: 2, deletions: 1, fileCount: 1, truncated: false,
  files: [{ filename:"src/game.js", status:"modified", additions:2, deletions:1,
    patch:"@@ -1 +1 @@\n-before\n+after", patchTruncated:false }],
};

function makeExplorer(navigation: { id: number; kind: "log"; page: number } | { id: number; kind:"detail"; detail: github.GitChangeDetail }) {
  return (
    <RepositoryExplorer snapshot={snapshot} tabs={[]} activePath={null}
      onSelectTab={() => {}} onCloseTab={() => {}} onOpenFile={() => {}}
      busy={false} error="" gitNavigation={navigation}/>
  );
}

describe("terminal → visual Git navigation", () => {
  it("opens the exact real history page requested by git log N", async () => {
    const spy = vi.spyOn(github, "realGitLog").mockResolvedValue({ branch: "main", commits: [] });
    try {
      render(makeExplorer({ id: 1, kind: "log", page: 2 }));
      await waitFor(() => expect(spy).toHaveBeenCalledWith("abismo", 2));
      expect(screen.getByRole("region", { name: "Histórico de commits" })).toBeInTheDocument();
    } finally { spy.mockRestore(); }
  });
  it("shows a supplied Git diff from the same response without refetching the comparison", async () => {
    const spy = vi.spyOn(github, "realGitLog").mockResolvedValue({ branch: "main", commits: [] });
    try {
      render(makeExplorer({ id: 2, kind: "detail", detail }));
      await waitFor(() => expect(screen.getByRole("region", { name: "Visualizador de diff Git" })).toBeInTheDocument());
      expect(screen.getByText("Comparison (ahead)")).toBeInTheDocument();
      expect(screen.getByText(/src\/game\.js/)).toBeInTheDocument();
      expect(screen.getByText(/Fonte GitHub/)).not.toBeInTheDocument();
    } finally { spy.mockRestore(); }
  });
});
