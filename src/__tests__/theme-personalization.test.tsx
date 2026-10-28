import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { useTheme } from "../stores/themeContext";
import { OFFICIAL_THEMES, THEME_STORAGE_KEY } from "../stores/themes";
import {
  APPLIED_CUSTOM_SNAPSHOT_KEY, CUSTOM_THEME_STORAGE_KEY, MAX_CUSTOM_THEMES,
  duplicateTheme, readCustomThemes, validCustomTheme, writeCustomThemes,
} from "../services/customThemes";
import { ThemeStudio } from "../components/ThemeStudio";

beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute("data-theme"); });
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

function Probe() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme.id + "|" + theme.palette.accentPrimary}</span>;
}
function openStudio() {
  return render(<ThemeProvider><Probe /><ThemeStudio onClose={() => {}} /></ThemeProvider>);
}
function officialOption(name: string) {
  return within(screen.getByRole("group", { name: "Cinco temas oficiais" }))
    .getByRole("button", { name: new RegExp(name) });
}

describe("M4 duplicate and edit personal theme", () => {
  it("duplicates an official scheme without changing its palette or the applied theme", () => {
    openStudio();
    fireEvent.click(officialOption("Hiyuki"));
    fireEvent.click(screen.getByRole("button", { name: "Duplicar Hiyuki" }));
    const [copy] = readCustomThemes();
    expect(copy).toMatchObject({
      kind: "custom", basedOnThemeId: "hiyuki", palette: { accentPrimary: "#C96A85" },
    });
    expect(copy.id).toMatch(/^custom-/);
    expect(screen.getByRole("group", { name: "Temas personalizados" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Editar meu tema" })).toBeInTheDocument();
    expect(screen.getByTestId("active-theme")).toHaveTextContent("changli|#C96A42");
    expect(OFFICIAL_THEMES[1].palette.accentPrimary).toBe("#C96A85");
  });

  it("keeps edits as preview until Save, then applies only on Apply", () => {
    const { unmount } = openStudio();
    fireEvent.click(officialOption("Emilia"));
    fireEvent.click(screen.getByRole("button", { name: "Duplicar Emilia" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Nome do meu tema" }),
      { target: { value: "Meu Roxo" } });
    fireEvent.change(screen.getByLabelText("Cor principal"),
      { target: { value: "#7154ee" } });
    expect(screen.getByTestId("active-theme")).toHaveTextContent("changli|#C96A42");
    expect(readCustomThemes()[0].palette.accentPrimary).toBe("#B787FF");
    expect(screen.getByRole("button", { name: "Salve antes de aplicar" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(readCustomThemes()[0].name).toBe("Meu Roxo");
    expect(readCustomThemes()[0].palette.accentPrimary).toBe("#7154ee");
    expect(screen.getByTestId("active-theme")).toHaveTextContent("changli|#C96A42");
    fireEvent.click(screen.getByRole("button", { name: "Aplicar Meu Roxo" }));
    expect(screen.getByTestId("active-theme")).toHaveTextContent("#7154ee");
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary")).toBe("#7154ee");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(readCustomThemes()[0].id);
    unmount();
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("active-theme")).toHaveTextContent("#7154ee");
  });

  it("saving a change to the active custom theme does not silently apply it, even on reload", () => {
    const { unmount } = openStudio();
    fireEvent.click(officialOption("Changli"));
    fireEvent.click(screen.getByRole("button", { name: "Duplicar Changli" }));
    fireEvent.click(screen.getByRole("button", { name: /Aplicar Changli · Minha versão/ }));
    expect(screen.getByTestId("active-theme")).toHaveTextContent("#C96A42");
    fireEvent.change(screen.getByLabelText("Cor principal"), { target: { value: "#123abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(readCustomThemes()[0].palette.accentPrimary).toBe("#123abc");
    expect(screen.getByTestId("active-theme")).toHaveTextContent("#C96A42");
    expect(localStorage.getItem(APPLIED_CUSTOM_SNAPSHOT_KEY)).toContain("#C96A42");
    unmount();
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("active-theme")).toHaveTextContent("#C96A42");
  });

  it("rejects forged data, official overwrite attempts, and more than 12 copies", () => {
    const fake = { ...OFFICIAL_THEMES[0], kind: "custom", id: "changli" };
    expect(validCustomTheme(fake)).toBe(false);
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify([fake]));
    expect(readCustomThemes()).toEqual([]);
    const created = Array.from({ length: MAX_CUSTOM_THEMES }, (_, i) =>
      duplicateTheme(OFFICIAL_THEMES[0], Array.from({ length: i }, (_, j) => ({
        ...OFFICIAL_THEMES[0], kind: "custom" as const,
        id: "custom-placeholder-" + String(j).padStart(8, "0"),
      }))));
    expect(created).toHaveLength(MAX_CUSTOM_THEMES);
    expect(() => duplicateTheme(OFFICIAL_THEMES[0], created)).toThrow(/Limite de 12/);
    expect(() => writeCustomThemes([fake as typeof created[0]])).toThrow();
  });

  it("does not show success if browser storage rejects writes", () => {
    openStudio();
    fireEvent.click(officialOption("Furina"));
    const original = Storage.prototype.setItem;
    const failing = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, key: string, value: string) {
      if (key === CUSTOM_THEME_STORAGE_KEY) throw new Error("QuotaExceeded");
      return original.call(this, key, value);
    });
    fireEvent.click(screen.getByRole("button", { name: "Duplicar Furina" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Não foi possível salvar/);
    expect(screen.queryByRole("group", { name: "Temas personalizados" })).not.toBeInTheDocument();
    failing.mockRestore();
  });
});
