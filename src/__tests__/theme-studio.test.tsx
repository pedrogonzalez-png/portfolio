import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES, THEME_STORAGE_KEY } from "../stores/themes";
import { ThemeStudio } from "../components/ThemeStudio";

beforeEach(() => window.localStorage.clear());
afterEach(() => { window.localStorage.clear(); vi.restoreAllMocks(); });

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <span data-testid="active-theme">{theme.name}</span>
      <button type="button" onClick={() => setTheme("invalid-theme")}>Tema inválido</button>
      <button type="button" onClick={() => setTheme("hiyuki")}>Trocar Hiyuki</button>
    </>
  );
}
describe("M4 official palettes", () => {
  it("uses five real original schemes with immutable palettes", () => {
    expect(OFFICIAL_THEMES.map((t) => t.name)).toEqual(["Changli","Hiyuki","Emilia","Furina","Hotline Miami"]);
    expect(OFFICIAL_THEMES.map((t) => t.palette.accentPrimary))
      .toEqual(["#C96A42","#C96A85","#B787FF","#9dc7ff","#f10d6e"]);
    expect(OFFICIAL_THEMES.every((t) => Object.isFrozen(t.palette))).toBe(true);
  });
  it("applies globally, remembers theme and ignores unsupported IDs", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Trocar Hiyuki" }));
    expect(screen.getByTestId("active-theme")).toHaveTextContent("Hiyuki");
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary")).toBe("#C96A85");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("hiyuki");
    fireEvent.click(screen.getByRole("button", { name: "Tema inválido" }));
    expect(screen.getByTestId("active-theme")).toHaveTextContent("Hiyuki");
  });
  it("loads saved ID and falls back to Changli for corrupt data", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "furina");
    const { unmount } = render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("active-theme")).toHaveTextContent("Furina");
    unmount();
    localStorage.setItem(THEME_STORAGE_KEY, "tampered");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("active-theme")).toHaveTextContent("Changli");
  });
  it("keeps preview isolated until visitor clicks Apply", () => {
    render(<ThemeProvider><Probe /><ThemeStudio onClose={() => {}} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: /Hiyuki/ }));
    expect(screen.getByTestId("active-theme")).toHaveTextContent("Changli");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("changli");
    fireEvent.click(screen.getByRole("button", { name: "Aplicar Hiyuki" }));
    expect(screen.getByTestId("active-theme")).toHaveTextContent("Hiyuki");
  });
});
