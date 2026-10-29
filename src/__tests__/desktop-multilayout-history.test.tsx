import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SimulatedDesktop } from "../components/SimulatedDesktop";
import * as storage from "../services/desktopPersistence";
import type { StoredDesktopLayout } from "../services/desktopPersistence";
import {
  checkpointPositions, emptyPositionHistory, redoPositions,
  snapshotPositions, undoPositions, HISTORY_LIMIT,
} from "../services/desktopHistory";
import { OFFICIAL_THEMES } from "../stores/themes";

vi.mock("../services/desktopPersistence", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/desktopPersistence")>();
  return { ...actual, readDesktopLayout: vi.fn(), writeDesktopLayout: vi.fn() };
});

const palette = OFFICIAL_THEMES[0].palette;
const draw = () => render(<SimulatedDesktop palette={palette} themeName="Changli" />);
const records = new Map<string, StoredDesktopLayout>();

const stored = (clockVisible = true): StoredDesktopLayout => ({
  schemaVersion: 1, clockVisible, clockPosition: { x: 42, y: 19 },
  screenMode: "standard", cards: [], savedAt: Date.now(),
});

beforeEach(() => {
  records.clear();
  vi.mocked(storage.readDesktopLayout).mockImplementation(async (slot = "default") =>
    records.get(slot) ?? null);
  vi.mocked(storage.writeDesktopLayout).mockImplementation(async (layout, slot = "default") => {
    records.set(slot, layout);
  });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true,
    value: vi.fn(() => "blob:theme-test-card") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true,
    value: vi.fn() });
});
afterEach(() => vi.restoreAllMocks());

describe("M5 independent desktop layout slots", () => {
  it("recovers the original default record as Principal and saves other slots separately", async () => {
    records.set("default", stored(true));
    draw();
    await screen.findByText(/Organização recuperada do navegador/);
    expect(screen.getByRole("group", { name: "Widget relógio digital" })).toBeInTheDocument();
    expect(screen.getByLabelText("Organização do desktop")).toHaveValue("default");

    fireEvent.change(screen.getByLabelText("Organização do desktop"), {
      target: { value: "layout-2" },
    });
    await screen.findByText(/Layout vazio. Monte sua organização/);
    expect(screen.queryByRole("group", { name: "Widget relógio digital" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    fireEvent.keyDown(screen.getByRole("button", { name: /Mover relógio digital/ }), { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("button", { name: "Salvar organização" }));
    await screen.findByText(/Organização salva neste navegador/);
    expect(records.get("layout-2")?.clockPosition.y).toBe(9);
    expect(records.get("default")?.clockPosition.y).toBe(19);

    fireEvent.change(screen.getByLabelText("Organização do desktop"), {
      target: { value: "default" },
    });
    await waitFor(() => expect(screen.getByLabelText("Organização do desktop")).toHaveValue("default"));
    const handle = screen.getByRole("button", { name: /Mover relógio digital/ });
    expect((handle.closest(".desktop-editable-element") as HTMLElement).style.top).toBe("19%");

    fireEvent.change(screen.getByLabelText("Organização do desktop"), {
      target: { value: "layout-2" },
    });
    await waitFor(() => expect(screen.getByLabelText("Organização do desktop")).toHaveValue("layout-2"));
    expect((screen.getByRole("button", { name: /Mover relógio digital/ })
      .closest(".desktop-editable-element") as HTMLElement).style.top).toBe("9%");
  });

  it("blocks switching when there are unsaved edits, but restoring permits switching", async () => {
    draw();
    await screen.findByText(/Nenhuma organização salva ainda/);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    fireEvent.change(screen.getByLabelText("Organização do desktop"), { target: { value: "layout-3" } });
    expect(screen.getByLabelText("Organização do desktop")).toHaveValue("default");
    expect(screen.getByText(/Salve ou restaure as alterações atuais antes/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restaurar última organização salva" }));
    await screen.findByText(/Layout vazio restaurado/);
    fireEvent.change(screen.getByLabelText("Organização do desktop"), { target: { value: "layout-3" } });
    await waitFor(() => expect(screen.getByLabelText("Organização do desktop")).toHaveValue("layout-3"));
  });

  it("preserves the current slot and contents on a loading error", async () => {
    records.set("default", stored(true));
    vi.mocked(storage.readDesktopLayout).mockImplementation(async (slot = "default") => {
      if (slot === "layout-4") throw new Error("Falha temporária de leitura.");
      return records.get(slot) ?? null;
    });
    draw();
    await screen.findByText(/Organização recuperada do navegador/);
    fireEvent.change(screen.getByLabelText("Organização do desktop"), { target: { value: "layout-4" } });
    await screen.findByText("Falha temporária de leitura.");
    expect(screen.getByLabelText("Organização do desktop")).toHaveValue("default");
    expect(screen.getByRole("group", { name: "Widget relógio digital" })).toBeInTheDocument();
  });
});

describe("undo/redo of element positions", () => {
  it("undoes and redoes keyboard movement, without saving automatically", async () => {
    draw();
    await screen.findByText(/Nenhuma organização salva ainda/);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    const handle = screen.getByRole("button", { name: /Mover relógio digital/ });
    const moving = handle.closest(".desktop-editable-element") as HTMLElement;
    expect(moving.style.top).toBe("7%");
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(moving.style.top).toBe("9%");
    fireEvent.click(screen.getByRole("button", { name: /Desfazer movimento/ }));
    expect(moving.style.top).toBe("7%");
    fireEvent.click(screen.getByRole("button", { name: /Refazer movimento/ }));
    expect(moving.style.top).toBe("9%");
    fireEvent.keyDown(handle, { key: "z", ctrlKey: true });
    expect(moving.style.top).toBe("7%");
    fireEvent.keyDown(handle, { key: "z", ctrlKey: true, shiftKey: true });
    expect(moving.style.top).toBe("9%");
    expect(storage.writeDesktopLayout).not.toHaveBeenCalled();
  });

  it("only records positions and invalidates history when card media is removed", async () => {
    draw();
    await screen.findByText(/Nenhuma organização salva ainda/);
    fireEvent.change(screen.getByLabelText("Selecionar imagens para cards"), {
      target: { files: [new File(["bytes"], "Emilia.png", { type: "image/png" })] },
    });
    const handle = screen.getByRole("button", { name: /Mover card Emilia.png/ });
    const frame = handle.closest(".desktop-editable-element") as HTMLElement;
    expect(frame.style.left).toBe("8%");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(frame.style.left).toBe("10%");
    fireEvent.click(screen.getByRole("button", { name: /Desfazer movimento/ }));
    expect(frame.style.left).toBe("8%");
    fireEvent.click(screen.getByRole("button", { name: /Remover card Emilia.png/ }));
    expect(screen.getByRole("button", { name: /Desfazer movimento/ })).toBeDisabled();
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it("keeps at most 30 snapshots and invalidates redo after a fresh gesture", () => {
    const start = snapshotPositions({ x: 1, y: 2 }, []);
    let history = emptyPositionHistory();
    for (let i = 0; i < HISTORY_LIMIT + 6; i++)
      history = checkpointPositions(history, snapshotPositions({ x: i, y: 2 }, []));
    expect(history.past).toHaveLength(HISTORY_LIMIT);
    const undone = undoPositions(history, start);
    expect(undone.snapshot?.clock.x).toBe(HISTORY_LIMIT + 5);
    expect(undone.history.future).toHaveLength(1);
    const resumed = checkpointPositions(undone.history, start);
    expect(resumed.future).toHaveLength(0);
    expect(redoPositions(resumed, start).snapshot).toBeNull();
  });
});
