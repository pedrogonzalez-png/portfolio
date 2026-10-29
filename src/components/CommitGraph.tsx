import type { CommitSummary } from "../services/githubReadonly";
import { visibleCommitEdges } from "../services/gitGraph";

export function CommitGraph({ commits }: { commits: readonly CommitSummary[] }) {
  const height = commits.length * 88;
  return (
    <svg className="git-graph" width="62" height={height} viewBox={"0 0 62 " + height}
      aria-hidden="true" focusable="false">
      {visibleCommitEdges(commits).map((edge) => {
        const y1 = edge.from * 88 + 44;
        const y2 = edge.to * 88 + 44;
        const x2 = edge.parentIndex ? 45 : 20;
        const d = edge.parentIndex ? "M20 " + y1 + " C" + x2 + " " + y1 +
          " " + x2 + " " + y2 + " 20 " + y2 : "M20 " + y1 + " L20 " + y2;
        return <path key={edge.from + "-" + edge.to + "-" + edge.parentIndex}
          d={d} className={edge.parentIndex ? "git-edge git-edge-merge" : "git-edge"} />;
      })}
      {commits.map((commit, i) =>
        <g key={commit.sha}>
          <circle cx="20" cy={i * 88 + 44} r="6.5" className="git-graph-node"/>
          <circle cx="20" cy={i * 88 + 44} r="2.5" className="git-graph-node-core"/>
        </g>)}
    </svg>
  );
}
