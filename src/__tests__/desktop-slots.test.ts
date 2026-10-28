import { describe, expect, it } from "vitest";
import { DESKTOP_LAYOUT_SLOTS, readDesktopLayout, writeDesktopLayout } from "../services/desktopPersistence";
import type { StoredDesktopLayout, DesktopLayoutSlot } from "../services/desktopPersistence";

const valid: StoredDesktopLayout = {
  schemaVersion: 1, screenMode: "ultrawide", clockVisible: false,
  clockPosition: { x: 62, y: 7 }, cards: [], savedAt: Date.now(),
};

describe("fixed legacy-compatible layout slots", () => {
  it("keeps the original default key and permits exactly three additional slots", () => {
    expect(DESKTOP_LAYOUT_SLOTS.map((slot) => slot.id))
      .toEqual(["default", "layout-2", "layout-3", "layout-4"]);
    expect(DESKTOP_LAYOUT_SLOTS[0].label).toBe("Principal");
  });
  it("rejects arbitrary IndexedDB keys before attempting storage", async () => {
    const forged = "sensitive-source" as DesktopLayoutSlot;
    await expect(readDesktopLayout(forged)).rejects.toThrow(/não autorizado/);
    await expect(writeDesktopLayout(valid, forged)).rejects.toThrow(/não autorizado/);
  });
});
