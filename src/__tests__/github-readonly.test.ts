import { afterEach, describe, expect, it, vi } from "vitest";
import {
  directoryEntries, getRepoTree, normalizeRepoPath, readRepoFile, resolveRepo, validatedStaticSnapshot,
} from "../services/githubReadonly";

afterEach(() => vi.unstubAllGlobals());

describe("GitHub readonly allowlist", () => {
  it("allows only approved repository names and aliases", () => {
    expect(resolveRepo("jogo-site")?.id).toBe("abismo");
    expect(resolveRepo("site-3d")?.repoFullName).toBe("pedrogonzalez-png/site-3D");
    expect(resolveRepo("dotfiles-Arch")).toBeNull();
    expect(resolveRepo("https://github.com/someone/other")).toBeNull();
    expect(resolveRepo("../../dotfiles-Arch")).toBeNull();
  });

  it("normalizes internal paths but blocks escaping the repo root", () => {
    expect(normalizeRepoPath("src/scenes", "../main.js")).toBe("src/main.js");
    expect(normalizeRepoPath("src/scenes", "/README.md")).toBe("README.md");
    expect(normalizeRepoPath("src", "..")).toBe("");
    expect(() => normalizeRepoPath("", "../../secrets")).toThrow("raiz");
    expect(() => normalizeRepoPath("src", "..\\private")).toThrow("inválido");
    expect(() => normalizeRepoPath("", "evil\u0000path")).toThrow("inválido");
    expect(() => normalizeRepoPath("", "https://example.com")).toThrow("inválido");
  });

  it("never makes a request for excluded repositories", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(getRepoTree("dotfiles-Arch")).rejects.toThrow("não autorizado");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses real tree SHAs for directory listing and file content", async () => {
    const sha = "a".repeat(40);
    const treeSha = "b".repeat(40);
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/github-index.json")) return { ok: false, status: 404 };
      let payload: unknown;
      if (url.endsWith("/repos/pedrogonzalez-png/jogo-site")) {
        payload = { default_branch: "main" };
      } else if (url.includes("/git/trees/main?recursive=1")) {
        payload = {
          sha: treeSha, truncated: false, tree: [
            { path: "src", type: "tree", sha: "c".repeat(40) },
            { path: "src/main.js", type: "blob", sha, size: 17 },
          ],
        };
      } else if (url.endsWith("/git/blobs/" + sha)) {
        payload = { encoding: "base64", content: "Y29uc29sZS5sb2coJ2hpJyk=", size: 17 };
      } else {
        throw new Error("Unexpected GitHub request: " + url);
      }
      return { ok: true, json: async () => payload };
    });
    vi.stubGlobal("fetch", fetchMock);
    const snapshot = await getRepoTree("abismo");
    expect(snapshot.repoFullName).toBe("pedrogonzalez-png/jogo-site");
    expect(snapshot.entries).toHaveLength(2);
    expect(directoryEntries(snapshot, "src").map((entry) => entry.path)).toEqual(["src/main.js"]);
    const file = await readRepoFile("abismo", "src/main.js");
    expect(file.content).toBe("console.log('hi')");
    expect(file.url).toContain("/pedrogonzalez-png/jogo-site/blob/main/src/main.js");
    await expect(readRepoFile("abismo", "src/other.js")).rejects.toThrow("não encontrado");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});


describe("generated public index security", () => {
  const sha = "a".repeat(40);
  const valid = {
    schemaVersion: 1, generatedAt: new Date().toISOString(),
    repos: [{
      repoId: "abismo", repoFullName: "pedrogonzalez-png/jogo-site",
      branch: "main", treeSha: sha, truncated: false,
      entries: [{ path: "src/main.js", type: "blob", sha, size: 42 }],
    }],
  };
  it("accepts only the exact allowlisted repo and labels snapshot provenance", () => {
    expect(validatedStaticSnapshot(valid, "abismo", "pedrogonzalez-png/jogo-site"))
      .toMatchObject({ source: "snapshot", entries: [{ path: "src/main.js" }] });
    expect(validatedStaticSnapshot(valid, "dotfiles-Arch", "pedrogonzalez-png/dotfiles-Arch")).toBeNull();
    expect(validatedStaticSnapshot(valid, "abismo", "attacker/fake")).toBeNull();
  });
  it("rejects malformed, outdated or traversal-capable snapshots", () => {
    expect(validatedStaticSnapshot({ ...valid, generatedAt: "2001-01-01T00:00:00Z" },
      "abismo", "pedrogonzalez-png/jogo-site")).toBeNull();
    expect(validatedStaticSnapshot({ ...valid, repos: [{ ...valid.repos[0],
      entries: [{ path: "../private", type: "blob", sha }] }] },
      "abismo", "pedrogonzalez-png/jogo-site")).toBeNull();
  });
});
