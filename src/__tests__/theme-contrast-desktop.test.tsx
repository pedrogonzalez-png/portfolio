import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES } from "../stores/themes";
import { contrastRatio, auditThemeContrast, suggestReadableText } from "../services/themeContrast";
import { readCustomThemes } from "../services/customThemes";
import { ThemeStudio } from "../components/ThemeStudio";

beforeEach(() => localStorage.clear());
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

function ActiveTheme() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme.id}</span>;
}

function startStudio() {
  return render(<ThemeProvider><ActiveTheme/><ThemeStudio onClose={() => {}} /></ThemeProvider>);
}

describe("WCAG color contrast math and preview", () => {
  it("uses sRGB luminance with accurate WCAG ratios", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#112233", "#112233")).toBe(1);
    expect(contrastRatio("#767676", "#FFFFFF")).toBeGreaterThan(4.5);
    expect(() => contrastRatio("invalid", "#FFFFFF")).toThrow();
  });

  it("reports failing text combinations and suggests a color with best minimum contrast", () => {
    const palette = { ...OFFICIAL_THEMES[0].palette, text: OFFICIAL_THEMES[0].palette.bg };
    const audit = auditThemeContrast(palette);
    expect(audit.find((check) => check.id === "body")).toMatchObject({ passes: false, ratio: 1 });
    expect(suggestReadableText(palette)).toBe("#FFFFFF");
    expect(audit).toHaveLength(4);
  });

  it("keeps legibility suggestion in draft until explicit Save and Apply", () => {
    startStudio();
    const options = within(screen.getByRole("group", { name: "Cinco temas oficiais" }));
    fireEvent.click(options.getByRole("button", { name: /Hiyuki/ }));
    fireEvent.click(screen.getByRole("button", { name: "Duplicar Hiyuki" }));
    const originalSavedText = readCustomThemes()[0].palette.text;
    fireEvent.change(screen.getByLabelText("Texto"), {
      target: { value: OFFICIAL_THEMES[1].palette.bg },
    });
    const contrast = screen.getByRole("region", { name: "Análise de contraste da prévia" });
    expect(within(contrast).getByText(/combinação\(ões\) abaixo da meta/)).toBeInTheDocument();
    fireEvent.click(within(contrast).getByRole("button", { name: "Sugerir texto legível" }));
    expect(screen.getByLabelText("Texto")).toHaveValue("#FFFFFF");
    expect(readCustomThemes()[0].palette.text).toBe(originalSavedText);
    expect(screen.getByTestId("active-theme")).toHaveTextContent("changli");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
  });
});

describe("expanded 2D desktop simulation", () => {
  it("opens and closes an interactive preview without changing the applied theme", () => {
    startStudio();
    const options = within(screen.getByRole("group", { name: "Cinco temas oficiais" }));
    fireEvent.click(options.getByRole("button", { name: /Emilia/ }));
    expect(screen.queryByRole("region", { name: "Desktop simulado" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abrir desktop ampliado" }));
    const desktop = screen.getByRole("region", { name: "Desktop simulado" });
    expect(within(desktop).getByRole("button", { name: "3440 × 1440" }))
      .toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(desktop).getByRole("button", { name: "1920 × 1080" }));
    expect(within(desktop).getByRole("button", { name: "1920 × 1080" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(desktop.querySelector(".theme-desktop-standard")).not.toBeNull();

    fireEvent.click(within(desktop).getByRole("button", { name: "Paleta" }));
    expect(within(desktop).getByRole("group", { name: "Janela de prévia: Paleta" }))
      .toBeInTheDocument();
    expect(within(desktop).getByText(OFFICIAL_THEMES[2].palette.accentPrimary))
      .toBeInTheDocument();
    fireEvent.click(within(desktop).getByRole("button", { name: "Sobre" }));
    expect(within(desktop).getByText(/Cards de personagens, widgets reais/))
      .toBeInTheDocument();

    expect(screen.getByTestId("active-theme")).toHaveTextContent("changli");
    fireEvent.click(screen.getByRole("button", { name: "Recolher desktop simulado" }));
    expect(screen.queryByRole("region", { name: "Desktop simulado" })).not.toBeInTheDocument();
  });
});
