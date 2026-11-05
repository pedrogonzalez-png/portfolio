/**
 * THE CORE — dados reduzidos do protótipo vertical.
 * Catálogo didático, NÃO é um inventário exato do PC do autor.
 * Sem medições de FPS/temperatura fictícias ou compatibilidade garantida.
 */
export type Category = "cpu" | "motherboard" | "memory" | "gpu" | "psu";
export type Part = {
  id: string;
  category: Category;
  name: string;
  description: string;
  socket?: "AM4" | "AM5";
  memoryType?: "DDR4" | "DDR5";
};
export type Build = Record<Category, string | null>;
export const CATEGORIES: readonly { id: Category; label: string }[] = [
  { id: "cpu", label: "Processador" },
  { id: "motherboard", label: "Placa-mãe" },
  { id: "memory", label: "Memória" },
  { id: "gpu", label: "Placa de vídeo" },
  { id: "psu", label: "Fonte" },
];
export const PARTS: readonly Part[] = [
  { id: "r5-5600", category: "cpu", name: "Ryzen 5 5600", description: "CPU AMD · 6 núcleos / 12 threads", socket: "AM4" },
  { id: "r5-7600", category: "cpu", name: "Ryzen 5 7600", description: "CPU AMD · 6 núcleos / 12 threads", socket: "AM5" },
  { id: "b550", category: "motherboard", name: "B550 (exemplo)", description: "Plataforma AM4 · conferir BIOS do modelo", socket: "AM4", memoryType: "DDR4" },
  { id: "b650", category: "motherboard", name: "B650 (exemplo)", description: "Plataforma AM5", socket: "AM5", memoryType: "DDR5" },
  { id: "ddr4", category: "memory", name: "DDR4", description: "Módulo de memória DDR4", memoryType: "DDR4" },
  { id: "ddr5", category: "memory", name: "DDR5", description: "Módulo de memória DDR5", memoryType: "DDR5" },
  { id: "rx7600", category: "gpu", name: "Radeon RX 7600", description: "GPU dedicada · referência do autor" },
  { id: "rx6600", category: "gpu", name: "Radeon RX 6600", description: "GPU dedicada · opção demonstrativa" },
  { id: "gx700", category: "psu", name: "Cooler Master GX 700W Gold", description: "Fonte · referência do autor" },
];
export const PART_BY_ID = Object.fromEntries(PARTS.map((part) => [part.id, part])) as Record<string, Part | undefined>;
/** Os componentes B550, DDR4 e fonte são um PERFIL EDUCATIVO, não a ficha real integral do autor. */
export const INITIAL_BUILD: Build = {
  cpu: "r5-5600",
  motherboard: "b550",
  memory: "ddr4",
  gpu: "rx7600",
  psu: "gx700",
};
export type BuildReport = { ready: boolean; issues: string[] };
export function checkBuild(build: Build): BuildReport {
  const issues: string[] = [];
  for (const { id, label } of CATEGORIES) {
    if (!build[id] || PART_BY_ID[build[id]]?.category !== id) {
      issues.push("Falta componente: " + label + ".");
    }
  }
  const cpu = build.cpu ? PART_BY_ID[build.cpu] : undefined;
  const board = build.motherboard ? PART_BY_ID[build.motherboard] : undefined;
  const memory = build.memory ? PART_BY_ID[build.memory] : undefined;
  if (cpu?.socket && board?.socket && cpu.socket !== board.socket)
    issues.push("CPU " + cpu.socket + " não encaixa na placa-mãe " + board.socket + ".");
  if (memory?.memoryType && board?.memoryType && memory.memoryType !== board.memoryType)
    issues.push("Memória " + memory.memoryType + " não é compatível com os slots " + board.memoryType + ".");
  return { ready: issues.length === 0, issues };
}
export function installPart(build: Build, partId: string | null, category: Category): Build {
  if (partId !== null && PART_BY_ID[partId]?.category !== category) return build;
  return { ...build, [category]: partId };
}
