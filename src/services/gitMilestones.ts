import data from "../data/git-milestones.json";
import { resolveRepo } from "./githubReadonly";

export interface TechnicalMilestone {
  repoId: string;
  sha: string;
  title: string;
  description: string;
  category: "visual" | "feature" | "tests" | "reliability";
  status: "provisional";
}
export function technicalMilestonesForRepo(repoId: string): TechnicalMilestone[] {
  const approved = resolveRepo(repoId);
  if (!approved) return [];
  const seen = new Set<string>();
  return data.milestones.filter((item): item is TechnicalMilestone => {
    if (item.repoId !== approved.id || !/^[a-f0-9]{40}$/.test(item.sha) ||
        item.status !== "provisional" || seen.has(item.sha)) return false;
    seen.add(item.sha);
    return true;
  });
}
