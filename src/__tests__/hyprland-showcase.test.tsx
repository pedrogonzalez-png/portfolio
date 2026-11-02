import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HyprlandShowcase } from "../components/HyprlandShowcase";
import { GALLERY_THEMES, THEME_SHELF_MEDIA } from "../config/themeShelfMedia";

describe("Hyprland media-only exhibition", () => {
  it("shows ten CDs, no widgets or desktop chrome", () => {
    const {container}=render(<HyprlandShowcase />);
    expect(screen.getByRole("navigation", {name:"Escolher tema pronto"}).querySelectorAll("button")).toHaveLength(10);
    expect(container.querySelector(".preset-stage .preset-widget")).toBeNull();
    expect(container.querySelector(".preset-stage [data-changli-slot]")).toBeNull();
    expect(container.querySelector(".preset-stage .real-desktop-topbar")).toBeNull();
    expect(container.querySelector(".preset-stage .real-desktop-dock")).toBeNull();
    expect(screen.queryByRole("combobox", {name:"Outras composições prontas"})).toBeNull();
  });
  it("switches selected media, preserving the theme selection", () => {
    const changed=vi.fn();
    const {container}=render(<HyprlandShowcase onChoose={changed}/>);
    const stage=()=>container.querySelector(".preset-stage")!;
    expect(stage().querySelector("video.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.changli.video);
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    expect(changed).toHaveBeenCalledWith(GALLERY_THEMES[1]);
    expect(stage().querySelector("video.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.hiyuki.video);
    fireEvent.click(screen.getByRole("button",{name:"Emilia"}));
    expect(stage().querySelector("img.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.emilia.cover);
    expect(stage().querySelector("video")).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Furina"}));
    expect(stage().querySelector("img.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.furina.cover);
    fireEvent.click(screen.getByRole("button",{name:"Hotline Miami"}));
    expect(stage().querySelector("img.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA["hotline-miami"].cover);
  });
  it("has a fallback if the image fails", () => {
    const {container}=render(<HyprlandShowcase selectedId="emilia"/>);
    fireEvent.error(container.querySelector(".preset-stage img")!);
    expect(container.querySelector(".preset-stage .preset-media-fallback")).not.toBeNull();
    expect(container.querySelector(".preset-stage img")).toBeNull();
  });
  it("shows one fixed ultrawide preview without aspect-ratio controls", () => {
    const {container}=render(<HyprlandShowcase/>);
    expect(container.querySelector(".preset-stage-ultrawide")).not.toBeNull();
    expect(screen.queryByRole("group",{name:"Proporção da prévia"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"21:9"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"16:9"})).not.toBeInTheDocument();
  });
});
