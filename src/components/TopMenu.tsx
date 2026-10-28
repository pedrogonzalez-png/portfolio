import { Link } from "react-router-dom";
import { useTheme } from "../stores/ThemeProvider";
import { useAccessibility } from "./AccessibilityProvider";

export function TopMenu() {
  const { setTheme, theme } = useTheme();
  const { reducedMotion } = useAccessibility();

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "0.75rem 1.5rem",
        background: "rgba(17, 10, 11, 0.7)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "3.5rem",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "var(--color-text)",
            textDecoration: "none",
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 500,
            transition: "color 0.2s",
          }}
          aria-label="Início"
        >
          PORTFÓLIO
        </Link>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {/* Tema */}
        <div style={{ display: "flex", gap: "0.5" }}>
          {["changli"].map((id) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.3rem",
                border: "none",
                background: theme.id === id ? "var(--color-accent-primary)" : "transparent",
                color: "var(--color-text)",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              aria-label={theme.id === id ? "Tema atual: Changli" : "Selecionar tema"}
            >
              {id === "changli" && "C"}
            </button>
          ))}
        </div>

        {/* Áudio */}
        <button
          disabled
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "0.3rem",
            border: "none",
            background: reducedMotion ? "transparent" : "var(--color-bg)",
            color: "var(--color-text)",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
          aria-label="Áudio ainda não implementado"
        >
          🔇
        </button>
      </div>
    </nav>
  );
}