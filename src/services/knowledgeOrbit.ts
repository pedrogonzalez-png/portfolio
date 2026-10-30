import type { KnowledgeNode } from "../data/knowledge";
import type { SpatialCoordinate } from "../components/KnowledgeWorld";

/** Place relevant skills on two balanced, non-overlapping rows. */
export function arrangeOrbitSkills(nodes: readonly KnowledgeNode[]): { id: string; position: SpatialCoordinate }[] {
  const topCount = Math.ceil(nodes.length / 2);
  const bottomCount = nodes.length - topCount;
  const row = (count: number, y: number) =>
    Array.from({ length: count }, (_, index) => ({
      x: count === 1 ? 50 : 24 + (52 * index) / (count - 1),
      y,
    }));
  const positions = [...row(topCount, 17), ...row(bottomCount, 84)];
  return nodes.map((node, index) => ({ id: node.id, position: positions[index] }));
}
