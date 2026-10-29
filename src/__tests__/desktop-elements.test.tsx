import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { SimulatedDesktop } from "../components/SimulatedDesktop";
import { OFFICIAL_THEMES } from "../stores/themes";
import {
  isSupportedCardImage, moveDesktopPosition, positionWithinDesktop,
  MAX_IMAGE_BYTES,
} from "../services/desktopElements";

const palette = OFFICIAL_THEMES[0].palette;
const renderDesktop = () => render(<SimulatedDesktop palette={palette} themeName="Changli" />);

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true, writable: true,
    value: vi.fn(() => "blob:portfolio-test-" + Math.random()),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true, writable: true, value: vi.fn(),
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("actual local-time desktop widget", () => {
  it("shows visitor-local time and date, refreshes on the minute, and removes cleanly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 28, 12, 34, 10));
    renderDesktop();
    expect(screen.queryByRole("group", { name: "Widget relógio digital" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    const clock = screen.getByRole("group", { name: "Widget relógio digital" });
    expect(within(clock).getByText("12:34")).toBeInTheDocument();
    expect(clock).toHaveTextContent("outubro");
    act(() => vi.advanceTimersByTime(60_000));
    expect(within(clock).getByText("12:35")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remover relógio" }));
    expect(screen.queryByRole("group", { name: "Widget relógio digital" })).not.toBeInTheDocument();
  });
  it("allows keyboard repositioning without changing the theme palette", () => {
    renderDesktop();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar relógio digital" }));
    const move = screen.getByRole("button", { name: /Mover relógio digital/ });
    const parent = move.closest(".desktop-editable-element") as HTMLElement;
    expect(parent.style.left).toBe("62%");
    fireEvent.keyDown(move, { key: "ArrowLeft" });
    expect(parent.style.left).toBe("60%");
    fireEvent.keyDown(move, { key: "ArrowDown", shiftKey: true });
    expect(parent.style.top).toBe("12%");
  });
});

describe("independent imported character cards", () => {
  it("adds separate cards, moves and removes one independently", () => {
    const { unmount } = renderDesktop();
    const files = [
      new File(["image-data-1"], "Hiyuki.png", { type: "image/png" }),
      new File(["image-data-2"], "Changli.webp", { type: "image/webp" }),
    ];
    const input = screen.getByLabelText("Selecionar imagens para cards");
    fireEvent.change(input, { target: { files } });
    expect(screen.getByRole("img", { name: "Imagem do card: Hiyuki.png" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Imagem do card: Changli.webp" })).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    const handle = screen.getByRole("button", { name: /Mover card Changli.webp/ });
    const parent = handle.closest(".desktop-editable-element") as HTMLElement;
    expect(parent.style.left).toBe("23%");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(parent.style.left).toBe("25%");
    fireEvent.click(screen.getByRole("button", { name: "Remover card Hiyuki.png" }));
    expect(screen.queryByRole("img", { name: "Imagem do card: Hiyuki.png" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Imagem do card: Changli.webp" })).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("rejects SVG/unsupported files and oversized imports", () => {
    renderDesktop();
    const input = screen.getByLabelText("Selecionar imagens para cards");
    fireEvent.change(input, {
      target: { files: [new File(["<svg/>"], "danger.svg", { type: "image/svg+xml" })] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/recusada/);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(isSupportedCardImage(new File(["data"], "wrong.png", { type: "text/plain" }))).toBe(false);
    const oversized = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.jpg", { type: "image/jpeg" });
    expect(isSupportedCardImage(oversized)).toBe(false);
  });
});

describe("bounded desktop editing controls", () => {
  it("clamps positions and ignores non-arrow keys", () => {
    expect(positionWithinDesktop({ x: -42, y: 900 })).toEqual({ x: 0, y: 76 });
    expect(moveDesktopPosition({ x: 20, y: 30 }, "ArrowLeft")).toEqual({ x: 18, y: 30 });
    expect(moveDesktopPosition({ x: 20, y: 30 }, "Escape")).toEqual({ x: 20, y: 30 });
    expect(moveDesktopPosition({ x: 83, y: 76 }, "ArrowRight", 5)).toEqual({ x: 84, y: 76 });
  });
});
