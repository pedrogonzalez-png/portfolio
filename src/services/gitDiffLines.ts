export function diffLineKind(line: string): "add" | "remove" | "hunk" | "context" {
  if (line.startsWith("@@")) return "hunk";
  if (line.startsWith("+") && !line.startsWith("+++")) return "add";
  if (line.startsWith("-") && !line.startsWith("---")) return "remove";
  return "context";
}
