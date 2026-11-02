import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeCdShelf } from "../components/ThemeCdShelf";
import { THEME_SHELF_MEDIA } from "../config/themeShelfMedia";
import { OFFICIAL_THEMES } from "../stores/themes";

afterEach(() => vi.restoreAllMocks());

describe("illuminated jewel-case theme exhibition", () => {
  it("renders five accessible glass CD covers and one selected center case", () => {
    const changed = vi.fn();
    const { container } = render(
      <ThemeCdShelf themes={OFFICIAL_THEMES} selectedId="changli" onChoose={changed}/>,
    );
    const shelf = screen.getByRole("navigation", { name: "Escolher tema pronto" });
    expect(shelf.querySelectorAll("button")).toHaveLength(5);
    expect(container.querySelectorAll(".theme-cd-glass-frame")).toHaveLength(5);
    expect(container.querySelectorAll(".theme-cd-shelf-plank")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Changli" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Changli" })).toHaveAttribute("data-cd-slot", "0");
    fireEvent.click(screen.getByRole("button", { name: "Hiyuki" }));
    expect(changed).toHaveBeenCalledWith(OFFICIAL_THEMES[1]);
  });

  it("navigates around the rack using arrows and preserves theme identity", () => {
    const changed = vi.fn();
    const { rerender } = render(
      <ThemeCdShelf themes={OFFICIAL_THEMES} selectedId="changli" onChoose={changed}/>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tema anterior" }));
    expect(changed).toHaveBeenCalledWith(OFFICIAL_THEMES[4]);
    rerender(<ThemeCdShelf themes={OFFICIAL_THEMES}
      selectedId="hotline-miami" onChoose={changed}/>);
    expect(screen.getByRole("button", { name: "Hotline Miami" }))
      .toHaveAttribute("data-cd-slot", "0");
    fireEvent.click(screen.getByRole("button", { name: "Próximo tema" }));
    expect(changed).toHaveBeenLastCalledWith(OFFICIAL_THEMES[0]);
    fireEvent.keyDown(screen.getByRole("navigation", { name: "Escolher tema pronto" }),
      { key: "ArrowLeft" });
    expect(changed).toHaveBeenLastCalledWith(OFFICIAL_THEMES[3]);
  });

  it("starts with intentional empty media slots and no broken image or invented video", () => {
    const { container } = render(
      <ThemeCdShelf themes={OFFICIAL_THEMES} selectedId="hiyuki" onChoose={() => {}}/>,
    );
    expect(Object.keys(THEME_SHELF_MEDIA)).toHaveLength(5);
    expect(Object.values(THEME_SHELF_MEDIA).every(
      (item) => item.cover === "" && item.video === "" && item.poster === "",
    )).toBe(true);
    expect(container.querySelectorAll(".theme-cd-artwork img")).toHaveLength(0);
    expect(container.querySelectorAll("video")).toHaveLength(0);
    expect(screen.getAllByText("INSIRA SUA CAPA / VÍDEO")).toHaveLength(5);
  });
});
