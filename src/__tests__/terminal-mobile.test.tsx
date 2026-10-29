import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Terminal } from "../components/Terminal";
import * as github from "../services/githubReadonly";

vi.mock("../components/RepositoryExplorer", () => ({
  RepositoryExplorer: () => <section aria-label="Explorador mock">Explorador real selecionado</section>,
}));

const snapshot: github.RepoSnapshot = {
  repoId: "abismo", repoFullName: "pedrogonzalez-png/jogo-site",
  branch: "main", treeSha: "b".repeat(40), entries: [], truncated: false,
};

afterEach(() => vi.restoreAllMocks());

describe("terminal mobile panels", () => {
  it("switches console / Git explorer and reveals explorer after opening a repo", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("760"), media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    }));
    const spy = vi.spyOn(github, "getRepoTree").mockResolvedValue(snapshot);
    try {
      render(<Terminal onClose={() => {}} />);
      expect(screen.queryByRole("tab", { name: "Arquivos e Git" })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "open jogo-site" }));
      await waitFor(() => expect(spy).toHaveBeenCalledWith("abismo"));
      await waitFor(() => expect(screen.getByRole("tab", { name: "Arquivos e Git" }))
        .toHaveAttribute("aria-selected", "true"));
      const workspace = document.querySelector(".terminal-workspace");
      expect(workspace).toHaveAttribute("data-mobile-view", "explorer");
      fireEvent.click(screen.getByRole("tab", { name: "Console" }));
      expect(workspace).toHaveAttribute("data-mobile-view", "console");
      expect(screen.getByRole("textbox", { name: "Comando do terminal virtual" })).toHaveFocus();
    } finally { spy.mockRestore(); }
  });
});
