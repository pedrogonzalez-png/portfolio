import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  sanitizeQuickshellProfiles, type SanitizedDesktopLayouts,
} from "../services/quickshellLayoutImport";
import {
  WIDGET_LAYOUT_STORAGE_KEY, WIDGET_LAYOUT_CHANGED, readLocalWidgetLayouts,
} from "../services/widgetLayoutLocal";

/** Settings-only: never transmits the user's raw Quickshell JSON anywhere. */
export function WidgetLayoutSettings() {
  const [localProfiles, setLocalProfiles] = useState<SanitizedDesktopLayouts | null>(readLocalWidgetLayouts);
  const [status, setStatus] = useState("");

  const importLayouts = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      if (!file.name.endsWith(".json") || file.size > 1024*1024) {
        throw new Error("Selecione um JSON do Quickshell com até 1 MB.");
      }
      const raw: unknown = JSON.parse(await file.text());
      const sanitized = sanitizeQuickshellProfiles(raw);
      window.localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(sanitized));
      setLocalProfiles(sanitized);
      window.dispatchEvent(new Event(WIDGET_LAYOUT_CHANGED));
      setStatus(sanitized.profiles.length + " perfil(is) importado(s). Somente coordenadas e tipos salvos neste navegador.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Arquivo de layout inválido.");
    }
  };

  const exportClean = () => {
    if (!localProfiles) return;
    const blob = new Blob([JSON.stringify(localProfiles,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="widget-layouts-publico.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),3000);
    setStatus("Snapshot higienizado gerado. Revise-o antes de compartilhar ou publicar.");
  };

  return (
    <section className="hypr-layout-import" aria-label="Configurar layouts importados do Quickshell">
      <div>
        <strong>Posições reais dos widgets no Hyprland</strong>
        <p>Importe <code>~/.config/quickshell/end4-pC/wallpaper_widget_layouts.json</code>.
          A importação é local: caminhos, notas, textos, imagens e conteúdo pessoal são descartados;
          somente coordenadas e nomes de widgets aprovados ficam no navegador.</p>
      </div>
      <label>Selecionar arquivo de posições
        <input type="file" accept=".json,application/json" aria-label="Importar posições do Quickshell"
          onChange={(event)=>void importLayouts(event)}/>
      </label>
      {localProfiles && <button type="button" onClick={exportClean}>
        Exportar snapshot público sem dados privados
      </button>}
      {status && <p role="status">{status}</p>}
      <small>O site não lê seu PC remotamente e não envia o arquivo ao GitHub.
        Para permitir que todos os visitantes vejam as posições, envie somente
        o snapshot higienizado para revisão e publicação no repositório.</small>
    </section>
  );
}
