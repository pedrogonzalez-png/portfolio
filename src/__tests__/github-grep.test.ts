import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatGrepResult, literalLineMatches, searchRepoText } from "../services/githubGrep";
import { getRepoTree, readRepoFile, type RepoSnapshot } from "../services/githubReadonly";

vi.mock("../services/githubReadonly", async (importOriginal) => {
  const real = await importOriginal<typeof import("../services/githubReadonly")>();
  return {
    ...real,
    getRepoTree: vi.fn(),
    readRepoFile: vi.fn(),
  };
});

const mockTree = vi.mocked(getRepoTree);
const mockFile = vi.mocked(readRepoFile);
const SHA = "a".repeat(40);

const snapshot = (paths: string[], truncated = false): RepoSnapshot => ({
  repoId: "abismo",
  repoFullName: "pedrogonzalez-png/jogo-site",
  branch: "main",
  treeSha: SHA,
  truncated,
  entries: [
    { path: "src", type: "tree", sha: SHA },
    ...paths.map((path) => ({ path, type: "blob" as const, sha: SHA, size: 1024 })),
  ],
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFile.mockImplementation(async (_id, path) => ({
    content: "const title = 'Phaser';\n// Phaser is a game engine\nexport default title;",
    size: 80, blobSha: SHA, url: "https://github.com/example/blob/main/" + path,
  }));
});

describe("M3 safe bounded grep", () => {
  it("matches literal text case-insensitively and includes line numbers", () => {
    expect(literalLineMatches("Phaser\n[PHASER]\nNot here", "[phaser]"))
      .toEqual([{ line: 2, text: "[PHASER]" }]);
    expect(literalLineMatches("x\nx\nx", "x", 2)).toHaveLength(2);
  });

  it("blocks excluded repositories before any GitHub request", async () => {
    await expect(searchRepoText("dotfiles-Arch", "token")).rejects.toThrow("não autorizado");
    expect(mockTree).not.toHaveBeenCalled();
    expect(mockFile).not.toHaveBeenCalled();
  });

  it("rejects path traversal and empty or abusive query lengths", async () => {
    await expect(searchRepoText("abismo", "Phaser", "../../secrets")).rejects.toThrow("raiz");
    await expect(searchRepoText("abismo", "x")).rejects.toThrow("2 a 80");
    await expect(searchRepoText("abismo", "a".repeat(81))).rejects.toThrow("2 a 80");
    expect(mockFile).not.toHaveBeenCalled();
  });

  it("searches a single file within its actual path and returns traceable results", async () => {
    mockTree.mockResolvedValue(snapshot(["src/GameScene.ts", "src/Other.ts"]));
    const found = await searchRepoText("abismo", "phaser", "src/GameScene.ts");
    expect(found.partial).toBe(false);
    expect(found.scannedFiles).toBe(1);
    expect(found.matches).toEqual([
      { path: "src/GameScene.ts", line: 1, text: "const title = 'Phaser';" },
      { path: "src/GameScene.ts", line: 2, text: "// Phaser is a game engine" },
    ]);
    expect(mockFile).toHaveBeenCalledTimes(1);
    expect(formatGrepResult(found)).toContain("src/GameScene.ts:2");
  });

  it("limits broad search to six text files and visibly marks partial results", async () => {
    mockTree.mockResolvedValue(snapshot([
      "src/0.ts", "src/1.ts", "src/2.ts", "src/3.ts",
      "src/4.ts", "src/5.ts", "src/6.ts", "src/7.ts",
    ]));
    const found = await searchRepoText("abismo", "Phaser", "src");
    expect(found.scannedFiles).toBe(6);
    expect(found.totalCandidates).toBe(8);
    expect(found.partial).toBe(true);
    expect(formatGrepResult(found)).toContain("RESULTADO PARCIAL");
    expect(mockFile).toHaveBeenCalledTimes(6);
  });

  it("never reads binary or oversized candidate files", async () => {
    const sample = snapshot(["src/Game.ts", "src/video.mp4", "src/big.json"]);
    sample.entries.find((entry) => entry.path === "src/big.json")!.size = 90000;
    mockTree.mockResolvedValue(sample);
    const found = await searchRepoText("abismo", "Phaser", "src");
    expect(found.scannedFiles).toBe(1);
    expect(mockFile).toHaveBeenCalledWith("abismo", "src/Game.ts");
    expect(mockFile).toHaveBeenCalledTimes(1);
  });

  it("surfaces quota failures rather than claiming zero matches", async () => {
    mockTree.mockResolvedValue(snapshot(["src/Game.ts"]));
    mockFile.mockRejectedValue(new Error("Limite de acesso do GitHub atingido."));
    await expect(searchRepoText("abismo", "Phaser", "src"))
      .rejects.toThrow("Limite de acesso");
  });

  it("does not invent matches when the indexed tree is incomplete", async () => {
    mockTree.mockResolvedValue(snapshot(["src/Game.ts"], true));
    mockFile.mockResolvedValue({ content: "No match here", size: 13, blobSha: SHA, url: "" });
    const result = await searchRepoText("abismo", "Phaser", "src");
    expect(result.matches).toHaveLength(0);
    expect(result.partial).toBe(true);
    expect(formatGrepResult(result)).toContain("RESULTADO PARCIAL");
  });
});
