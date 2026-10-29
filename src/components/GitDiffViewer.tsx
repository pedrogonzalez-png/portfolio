import { useEffect, useState } from "react";
import type { GitChangeDetail, GitChangedFile } from "../services/githubReadonly";

import { diffLineKind } from "../services/gitDiffLines";

/** Pure, safe React diff viewer: no HTML insertion, patch execution or remote assets. */
export function GitDiffViewer({ detail, onClose }: { detail: GitChangeDetail; onClose: () => void }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => { setSelected(0); }, [detail]);
  const file: GitChangedFile | undefined = detail.files[selected];
  return (
    <section className="git-diff-viewer" aria-label="Visualizador de diff Git">
      <header className="git-diff-heading">
        <div className="git-diff-title">
          <span className="git-diff-eyebrow">{detail.kind === "commit" ? "COMMIT REAL" : "COMPARAÇÃO REAL"} · READONLY</span>
          <strong>{detail.title}</strong>
          <code>{detail.refLabel}</code>
        </div>
        <div className="git-diff-actions">
          <span className="git-stat-add">+{detail.additions}</span>
          <span className="git-stat-remove">−{detail.deletions}</span>
          <a href={detail.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <button type="button" onClick={onClose} aria-label="Fechar visualizador de diff">✕</button>
        </div>
      </header>
      <p className="git-diff-caption">
        Exibindo {detail.files.length} de {detail.fileCount} arquivo(s) retornado(s) pela API.
        {detail.truncated && " Exibição parcial; consulte o GitHub para o conteúdo completo."}
      </p>
      <div className="git-diff-layout">
        <nav className="git-diff-files" aria-label="Arquivos alterados">
          {detail.files.map((changed, index) => (
            <button type="button" key={changed.filename}
              className={index === selected ? "is-selected" : ""}
              aria-current={index === selected ? "true" : undefined}
              onClick={() => setSelected(index)}>
              <span className="git-file-name">{changed.filename}</span>
              <span className="git-file-summary">
                {changed.status} <b className="git-stat-add">+{changed.additions}</b>
                <b className="git-stat-remove">−{changed.deletions}</b>
              </span>
            </button>
          ))}
          {!detail.files.length && <p>Nenhum arquivo textual informado pela API.</p>}
        </nav>
        <div className="git-diff-patch" aria-label="Alterações do arquivo">
          {file ? (
            <>
              <div className="git-diff-filename">{file.filename} · {file.status}</div>
              {file.patch === null ? <p className="explorer-help">
                Patch textual indisponível para este arquivo (pode ser binário ou grande).
                Consulte o commit no GitHub.
              </p> : (
                <pre className="git-patch-code">{file.patch.split("\n").map((line, index) => (
                  <span className={"git-patch-line git-patch-" + diffLineKind(line)} key={index}>
                    <span className="git-line-number" aria-hidden="true">{index + 1}</span>
                    <code>{line || " "}</code>
                  </span>
                ))}</pre>
              )}
              {file.patchTruncated && <p className="explorer-help">
                Patch limitado a 6.000 caracteres. O restante está disponível no GitHub.
              </p>}
            </>
          ) : <p className="explorer-help">Selecione um arquivo para examinar as alterações.</p>}
        </div>
      </div>
    </section>
  );
}
