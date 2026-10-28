import { useState } from "react";
import { PLACEHOLDER_PROJECTS } from "./PlaceholderCatalog";

interface CommandResult {
  output: string;
  error?: boolean;
}

export function Terminal() {
  const [history, setHistory] = useState<{ command: string; result: CommandResult }[]>([]);
  const [input, setInput] = useState("");

  const runCommand = () => {
    const cmd = input.trim();
    if (!cmd) return;

    let result: CommandResult;
    if (cmd === "help") {
      result = { output: "Available commands: help, whoami, pwd, ls, cd <dir>, cat <path>, git log, git show <sha>, git diff, open <repo-id>, goto <section>, neofetch" };
    } else if (cmd === "whoami") {
      result = { output: "visitor — portfolio explorador (não sou o desenvolvedor)" };
    } else if (cmd === "pwd") {
      result = { output: "/workspace/portfolio" };
    } else if (cmd === "ls") {
      result = { output: PLACEHOLDER_PROJECTS.map((p) => `- ${p.title} (${p.repoFullName})`).join("\\n") };
    } else if (cmd.startsWith("cd ")) {
      result = { output: "cd não implementado ainda (em isolamento)" };
    } else if (cmd.startsWith("cat ")) {
      const path = cmd.slice(4);
      if (PLACEHOLDER_PROJECTS.some((p) => p.repoFullName === path)) {
        result = { output: `Conteúdo de ${path}: [README placeholder]` };
      } else {
        result = { output: `cat: ${path}: Não é um diretório` };
      }
    } else if (cmd.startsWith("git log")) {
      result = { output: "[commit uuid] autor@dev — assunto\\n\\ncommit-uuid-2\\nautor@dev — segunda edição" };
    } else if (cmd.startsWith("git show ")) {
      result = { output: "```\\ncommit abc123\\nMensagem: teste de show\\n```" };
    } else if (cmd.startsWith("git diff ")) {
      result = { output: "diff --git a/README.md b/README.md\\nindex 1234abc..56789ef 100644\\n--- a/README.md\\n+++ b/README.md\\n@@ -1 +1 @@\\n-README placeholder -- status draft\\n+README placeholder -- status draft" };
    } else {
      result = { output: "Comando não implementado ainda", error: true };
    }

    setHistory([...history, { command: cmd, result }]);
    setInput("");
  };

  return (
    <div style={{ fontFamily: "monospace", background: "#0f0f0f", color: "#e0e0e0", padding: "1rem", borderRadius: "0.5rem", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand()}
          placeholder="Digite um comando..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: "0.25rem", border: "none" }}
        />
        <button onClick={runCommand} style={{ padding: "0.5rem 1rem", borderRadius: "0.25rem", background: "#333", color: "#fff", border: "none", cursor: "pointer" }}>
          Executar
        </button>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: "0.5rem", padding: "1rem", maxHeight: "60vh", overflowY: "auto" }}>
        {history.map((item, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <div style={{ color: "#888" }}>$ {item.command}</div>
            <div style={{ color: item.result.error ? "#ff5555" : "#0f0" }}>{item.result.output}</div>
          </div>
        ))}
        {history.length === 0 && (
          <div style={{ color: "#555" }}>Digite um comando para começar.</div>
        )}
      </div>
    </div>
  );
}