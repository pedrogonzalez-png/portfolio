/**
 * Safe, deliberately constrained Markdown preview.
 * React escapes repository content: never inject raw HTML, remote images,
 * scripts or untrusted links.
 */
import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const pieces = text.split(/(\*\*[^*]+\*\*|\x60[^\x60]+\x60)/g);
  return pieces.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("\x60") && part.endsWith("\x60")) return <code key={index}>{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}

export function SafeMarkdownPreview({ content }: { content: string }) {
  const lines = content.split(/\r?\n/).slice(0, 1400);
  const blocks: ReactNode[] = [];
  let inFence = false;
  let code = "";
  let fenceLanguage = "";
  let buffer: string[] = [];

  const flush = (key: number) => {
    if (!buffer.length) return;
    blocks.push(<p key={"p" + key}>{inline(buffer.join(" ").trim())}</p>);
    buffer = [];
  };

  lines.forEach((line, index) => {
    const fence = /^\s*(\x60{3}|~{3})([^\x60]*)$/.exec(line);
    if (fence) {
      flush(index);
      if (!inFence) {
        inFence = true;
        code = "";
        fenceLanguage = fence[2].trim().slice(0, 50);
      } else {
        blocks.push(<figure key={"f" + index}><figcaption>{fenceLanguage || "Código"}</figcaption><pre><code>{code}</code></pre></figure>);
        inFence = false;
        code = "";
      }
      return;
    }
    if (inFence) { code += line + "\n"; return; }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flush(index);
      const level = heading[1].length;
      const text = inline(heading[2]);
      blocks.push(level <= 2 ? <h2 key={index}>{text}</h2> :
        level === 3 ? <h3 key={index}>{text}</h3> : <h4 key={index}>{text}</h4>);
      return;
    }
    if (/^\s*---+\s*$/.test(line)) {
      flush(index);
      blocks.push(<hr key={index} />);
      return;
    }
    const bullet = /^\s*([-*+]|\d+\.)\s+(.+)$/.exec(line);
    if (bullet) {
      flush(index);
      blocks.push(<p className="md-bullet" key={index}><span aria-hidden="true">• </span>{inline(bullet[2])}</p>);
      return;
    }
    const quote = /^\s*>\s*(.*)$/.exec(line);
    if (quote) {
      flush(index);
      blocks.push(<blockquote key={index}>{inline(quote[1])}</blockquote>);
      return;
    }
    if (!line.trim()) flush(index);
    else buffer.push(line);
  });
  flush(lines.length);
  if (inFence) blocks.push(<figure key="unfinished-code"><pre><code>{code}</code></pre></figure>);

  return (
    <article className="safe-markdown" aria-label="Prévia segura de Markdown">
      {blocks}
      {content.split(/\r?\n/).length > lines.length && <p className="explorer-help">Prévia limitada a 1.400 linhas. O código-fonte permanece disponível na aba Código.</p>}
    </article>
  );
}
