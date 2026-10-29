import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SimulatedDesktop } from "../components/SimulatedDesktop";
import { OFFICIAL_THEMES } from "../stores/themes";
import * as store from "../services/desktopPersistence";
import type { DesktopLayoutVersion, StoredDesktopLayout } from "../services/desktopPersistence";

vi.mock("../services/desktopPersistence", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/desktopPersistence")>();
  return {
    ...actual,
    readDesktopLayout: vi.fn(),
    writeDesktopLayout: vi.fn(),
    readDesktopVersions: vi.fn(),
    createDesktopVersion: vi.fn(),
    restoreDesktopVersion: vi.fn(),
    deleteDesktopVersion: vi.fn(),
  };
});

let saved: StoredDesktopLayout | null = null;
let versions: DesktopLayoutVersion[] = [];
const renderDesktop = () => render(
  <SimulatedDesktop palette={OFFICIAL_THEMES[0].palette} themeName="Changli" />,
);

beforeEach(() => {
  saved = {
    schemaVersion: 1, screenMode: "ultrawide", clockVisible: true,
    clockPosition: { x: 62, y: 7 }, cards: [], savedAt: Date.now(),
  };
  versions = [];
  vi.mocked(store.readDesktopLayout).mockImplementation(async () => saved);
  vi.mocked(store.writeDesktopLayout).mockImplementation(async (layout) => { saved = layout; });
  vi.mocked(store.readDesktopVersions).mockImplementation(async () => [...versions]);
  vi.mocked(store.createDesktopVersion).mockImplementation(async (_slot, name) => {
    const version = { id: "v-test-100000", name, createdAt: Date.now() };
    versions.push(version);
    return version;
  });
  vi.mocked(store.restoreDesktopVersion).mockImplementation(async () => {
    const old = saved!;
    versions.push({ id: "v-safe-100000", name: "Antes de restaurar", createdAt: Date.now() });
    saved = { ...old, clockPosition: { x: 12, y: 15 } };
    return saved;
  });
  vi.mocked(store.deleteDesktopVersion).mockImplementation(async (_slot, id) => {
    versions = versions.filter((item) => item.id !== id);
  });
});
afterEach(() => vi.clearAllMocks());

describe("M6 Theme Studio named version UI", () => {
  it("creates a version only after the organization has been saved", async () => {
    renderDesktop();
    await screen.findByText(/Nenhuma versão nomeada/);
    fireEvent.change(screen.getByLabelText("Nome da nova versão"), {
      target: { value: "Minha organização Changli" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Remover relógio" }));
    fireEvent.click(screen.getByRole("button", { name: "Criar versão do layout salvo" }));
    await screen.findByText(/Salve a organização e seu nome antes/);
    expect(store.createDesktopVersion).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Salvar organização" }));
    await screen.findByText(/Organização salva neste navegador/);
    fireEvent.click(screen.getByRole("button", { name: "Criar versão do layout salvo" }));
    await waitFor(() => expect(store.createDesktopVersion).toHaveBeenCalledWith(
      "default", "Minha organização Changli",
    ));
    expect(screen.getByText("Minha organização Changli")).toBeInTheDocument();
  });

  it("requires explicit confirmation before restoring and shows a safety checkpoint", async () => {
    versions = [{ id: "v-first-100000", name: "Antes", createdAt: Date.now() }];
    renderDesktop();
    await screen.findByText("Antes");
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
    expect(store.restoreDesktopVersion).not.toHaveBeenCalled();
    expect(screen.getByRole("group", { name: "Confirmar ação da versão" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar restauração segura" }));
    await waitFor(() => expect(store.restoreDesktopVersion).toHaveBeenCalledWith(
      "default", "v-first-100000",
    ));
    expect(screen.getByText("Antes de restaurar")).toBeInTheDocument();
    expect(screen.getByText(/estado anterior foi guardado/)).toBeInTheDocument();
  });

  it("does not delete without confirmation and cancel preserves all versions", async () => {
    versions = [{ id: "v-first-100000", name: "Base", createdAt: Date.now() }];
    renderDesktop();
    await screen.findByText("Base");
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(store.deleteDesktopVersion).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão da versão" }));
    await waitFor(() => expect(store.deleteDesktopVersion).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Base")).not.toBeInTheDocument();
  });
});
