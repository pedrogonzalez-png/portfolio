import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeCdShelf } from "../components/ThemeCdShelf";
import { HyprlandShowcase } from "../components/HyprlandShowcase";
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

  it("maps each official theme to its already-published image or video", () => {
    expect(THEME_SHELF_MEDIA.changli.video).toBe("/assets/hyprland/temas/videos-fundo/changli.mp4");
    expect(THEME_SHELF_MEDIA.hiyuki.video).toBe("/assets/hyprland/temas/videos-fundo/hyuki.mp4");
    expect(THEME_SHELF_MEDIA.emilia.cover).toBe("/assets/hyprland/temas/foto-fundo/emilia.png");
    expect(THEME_SHELF_MEDIA.furina.cover).toBe("/assets/hyprland/temas/foto-fundo/furina.png");
    expect(THEME_SHELF_MEDIA["hotline-miami"].cover).toBe("/assets/hyprland/temas/foto-fundo/tony.png");
    expect(Object.keys(THEME_SHELF_MEDIA)).toHaveLength(5);
  });

  it("plays only the selected theme's video, or shows its PNG when selected", () => {
    const { container, rerender } = render(
      <ThemeCdShelf themes={OFFICIAL_THEMES} selectedId="hiyuki" onChoose={() => {}} />,
    );
    expect(container.querySelectorAll("video")).toHaveLength(1);
    expect(container.querySelector("video source"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.hiyuki.video);
    expect(container.querySelectorAll(".theme-cd-artwork img")).toHaveLength(3);

    rerender(<ThemeCdShelf themes={OFFICIAL_THEMES} selectedId="furina" onChoose={() => {}} />);
    expect(container.querySelectorAll("video")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Furina" }).querySelector("img"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.furina.cover);

    rerender(<ThemeCdShelf themes={OFFICIAL_THEMES} selectedId="changli" onChoose={() => {}} />);
    expect(container.querySelectorAll("video")).toHaveLength(1);
    expect(container.querySelector("video source"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.changli.video);
  });

  it("renders the selected theme's media behind its desktop widgets", () => {
    const { container } = render(<HyprlandShowcase />);
    const stage = () => container.querySelector(".preset-stage")!;

    expect(stage().querySelector(".changli-wallpaper-layer video"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.changli.video);
    expect(stage().querySelector(".changli-slot")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Hiyuki" }));
    expect(stage().querySelector(".changli-wallpaper-layer video")).toBeNull();
    expect(stage().querySelector(".real-desktop-preview video.real-desktop-wallpaper"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.hiyuki.video);
    expect(stage().querySelector(".preset-desktop-widgets")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Emilia" }));
    expect(stage().querySelector("video")).toBeNull();
    expect(stage().querySelector(".real-desktop-preview img.real-desktop-wallpaper"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.emilia.cover);

    fireEvent.click(screen.getByRole("button", { name: "Furina" }));
    expect(stage().querySelector(".real-desktop-preview img.real-desktop-wallpaper"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA.furina.cover);

    fireEvent.click(screen.getByRole("button", { name: "Hotline Miami" }));
    expect(stage().querySelector(".real-desktop-preview img.real-desktop-wallpaper"))
      .toHaveAttribute("src", THEME_SHELF_MEDIA["hotline-miami"].cover);
  });
});
