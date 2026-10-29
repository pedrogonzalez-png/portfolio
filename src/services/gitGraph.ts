import type { CommitSummary } from "../services/githubReadonly";

export interface VisibleCommitEdge {
  from: number;
  to: number;
  parentIndex: number;
}
/** Edges exist ONLY for explicit parent SHAs visible on this loaded page. */
export function visibleCommitEdges(commits: readonly CommitSummary[]): VisibleCommitEdge[] {
  const bySha = new Map(commits.map((commit, index) => [commit.sha, index]));
  return commits.flatMap((commit, from) => (commit.parents ?? []).flatMap((sha, parentIndex) => {
    const to = bySha.get(sha);
    return to !== undefined && to !== from ? [{ from, to, parentIndex }] : [];
  }));
}
