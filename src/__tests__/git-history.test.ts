import { describe, expect, it } from "vitest";
import { visibleCommitEdges } from "../components/CommitGraph";
import { technicalMilestonesForRepo } from "../services/gitMilestones";
import type { CommitSummary } from "../services/githubReadonly";

const node = (sha: string, parents: string[] = []): CommitSummary => ({
  sha, parents, subject: sha, author: "test", date: "2026-10-28T00:00:00Z",
});
describe("SHA-based commit graph", () => {
  const a = "a".repeat(40), b = "b".repeat(40), c = "c".repeat(40), d = "d".repeat(40);
  it("only connects real parent references visible on this page", () => {
    expect(visibleCommitEdges([node(a,[c]),node(b,[d]),node(c),node(d)]))
      .toEqual([{from:0,to:2,parentIndex:0},{from:1,to:3,parentIndex:0}]);
    expect(visibleCommitEdges([node(a),node(b)])).toEqual([]);
  });
  it("shows multiple parent edges for merges without inventing missing parents", () => {
    expect(visibleCommitEdges([node(a,[b,c,d]),node(b),node(c)]))
      .toEqual([{from:0,to:1,parentIndex:0},{from:0,to:2,parentIndex:1}]);
  });
});
describe("explicit technical milestones", () => {
  it("never features excluded repositories or invented SHAs", () => {
    expect(technicalMilestonesForRepo("abismo")).toHaveLength(2);
    expect(technicalMilestonesForRepo("site-3d")).toHaveLength(2);
    expect(technicalMilestonesForRepo("hyprland-themes")).toHaveLength(3);
    expect(technicalMilestonesForRepo("dotfiles-Arch")).toHaveLength(0);
    for (const id of ["abismo","site-3d","hyprland-themes"]) {
      for (const item of technicalMilestonesForRepo(id)) {
        expect(item.sha).toMatch(/^[a-f0-9]{40}$/);
        expect(item.status).toBe("provisional");
      }
    }
  });
});
