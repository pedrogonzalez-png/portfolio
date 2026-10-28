import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SimulatedDesktop } from "../components/SimulatedDesktop";
import { OFFICIAL_THEMES } from "../stores/themes";
import * as storage from "../services/desktopPersistence";
import type { StoredDesktopLayout } from "../services/desktopPersistence";

vi.mock("../services/desktopPersistence", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/desktopPersistence")>();
  return { ...actual, readDesktopLayout: vi.fn(), writeDesktopLayout: vi.fn() };
});

const palette = OFFICIAL_THEMES[0].palette;
const renderDesktop = () => render(<SimulatedDesktop palette={palette} themeName="Changli" />);
let persisted: StoredDesktopLayout | null = null;
let sequence = 0;
beforeEach(() => {
  persisted = null;
  sequence = 0;
  vi.mocked(storage.readDesktopLayout).mockImplementation(async () => persisted);
  vi.mocked(storage.writeDesktopLayout).mockImplementation(async (layout) => {
    persisted = layout;
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true, writable: true,
    value: vi.fn(() => "blob:restore-image-" + ++sequence),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true, writable: true,
    value: vi.fn(),
  });
});
afterEach(() => vi.clearAllMocks());

describe("desktop organization persists across reopening the Theme Studio preview", () => {
  it("saves cards as Blobs, card/clock positions and selected screen ratio, then restores", async () => {
    const first = renderDesktop();
    await screen.findByText(/Nenhuma organização salva ainda/);
    fireEvent.change(screen.getByLabelText("Selecionar imagens para cards"), {
      target: { files: [new File(["valid-local-media"], "Hiyuki.png", { type: "image/png" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    fireEvent.keyDown(screen.getByRole("button", { name: /Mover relógio digital/ }), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("button", { name: /Mover card Hiyuki.png/ }), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "1920 × 1080" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar organização" }));
    await screen.findByText(/Organização salva neste navegador/);
    expect(storage.writeDesktopLayout).toHaveBeenCalledTimes(1);
    expect(persisted).not.toBeNull();
    expect(persisted!.cards[0].image).toBeInstanceOf(Blob);
    expect(persisted!.cards[0].position.x).toBe(10);
    expect(persisted!.clockPosition.y).toBe(9);
    expect(persisted!.clockVisible).toBe(true);
    expect(persisted!.screenMode).toBe("standard");
    first.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);

    const second = renderDesktop();
    await screen.findByText(/Organização recuperada do navegador/);
    const card = screen.getByRole("img", { name: "Imagem do card: Hiyuki.png" });
    expect(card).toHaveAttribute("src", "blob:restore-image-2");
    const handle = screen.getByRole("button", { name: /Mover card Hiyuki.png/ });
    expect((handle.closest(".desktop-editable-element") as HTMLElement).style.left).toBe("10%");
    expect(screen.getByRole("group", { name: "Widget relógio digital" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1920 × 1080" })).toHaveAttribute("aria-pressed", "true");
    second.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("restores the last saved state on demand without silently auto-saving edits", async () => {
    const first = renderDesktop();
    await screen.findByText(/Nenhuma organização salva ainda/);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar organização" }));
    await screen.findByText(/Organização salva neste navegador/);
    fireEvent.click(screen.getByRole("button", { name: "Remover relógio" }));
    expect(screen.queryByRole("group", { name: "Widget relógio digital" })).not.toBeInTheDocument();
    expect(persisted?.clockVisible).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar última organização salva" }));
    await screen.findByText(/Organização recuperada do navegador/);
    expect(screen.getByRole("group", { name: "Widget relógio digital" })).toBeInTheDocument();
    first.unmount();
  });

  it("never reports success if IndexedDB write fails, and keeps the current editor visible", async () => {
    vi.mocked(storage.writeDesktopLayout).mockRejectedValueOnce(new Error("Espaço insuficiente no IndexedDB."));
    renderDesktop();
    await screen.findByText(/Nenhuma organização salva ainda/);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar organização" }));
    await screen.findByText(/Espaço insuficiente no IndexedDB/);
    expect(screen.getByRole("group", { name: "Widget relógio digital" })).toBeInTheDocument();
    expect(persisted).toBeNull();
    expect(screen.queryByText(/Organização salva neste navegador/)).not.toBeInTheDocument();
  });

  it("does not overwrite edits made while the initial async restoration is pending", async () => {
    let finish!: (layout: StoredDesktopLayout | null) => void;
    vi.mocked(storage.readDesktopLayout).mockImplementationOnce(() =>
      new Promise<StoredDesktopLayout | null>((resolve) => { finish = resolve; }));
    renderDesktop();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    finish({
      schemaVersion: 1, screenMode: "standard", clockVisible: false,
      clockPosition: { x: 8, y: 8 }, cards: [], savedAt: Date.now(),
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Salvar organização" })).toBeEnabled());
    expect(screen.getByRole("group", { name: "Widget relógio digital" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3440 × 1440" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Alterações não salvas/)).toBeInTheDocument();
  });
});
