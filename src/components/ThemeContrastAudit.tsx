import { auditThemeContrast } from "../services/themeContrast";
import type { ThemePalette } from "../stores/themes";

export function ThemeContrastAudit({ palette, onFixText }: {
  palette: ThemePalette; onFixText?: () => void;
}) {
  const checks = auditThemeContrast(palette);
  const failed = checks.filter((check) => !check.passes).length;
  return (
    <section className="theme-contrast-audit" aria-label="Análise de contraste da prévia">
      <header className="theme-contrast-header">
        <div>
          <strong>Legibilidade das cores</strong>
          <p>Comparações WCAG para esta prévia. Não certificam a acessibilidade do site inteiro.</p>
        </div>
        <span className={failed ? "theme-contrast-warning" : "theme-contrast-ok"}>
          {failed ? failed + " combinação(ões) abaixo da meta" : "4 combinações atendem às metas"}
        </span>
      </header>
      <div className="theme-contrast-grid">
        {checks.map((check) => (
          <div className="theme-contrast-check" key={check.id}>
            <span className="theme-contrast-sample"
              style={{ color: check.foreground, backgroundColor: check.background }}
              aria-hidden="true">Aa</span>
            <span className="theme-contrast-detail">
              <span>{check.label}</span>
              <strong>{check.ratio.toFixed(2)}:1</strong>
              <small>{check.passes ? "Dentro da meta" : "Abaixo da meta"} · meta {check.threshold}:1</small>
            </span>
          </div>
        ))}
      </div>
      {failed > 0 && onFixText && (
        <div className="theme-contrast-footer">
          <p>O ajuste altera apenas a cor principal do texto na cópia, sem salvar nem aplicar.</p>
          <button type="button" onClick={onFixText}>Sugerir texto legível</button>
        </div>
      )}
    </section>
  );
}
