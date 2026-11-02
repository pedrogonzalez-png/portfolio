import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeCdShelf } from "../components/ThemeCdShelf";
import { HyprlandShowcase } from "../components/HyprlandShowcase";
import { GALLERY_THEMES, GALLERY_PALETTES, THEME_SHELF_MEDIA } from "../config/themeShelfMedia";

afterEach(() => vi.restoreAllMocks());

describe("illuminated jewel-case theme exhibition", () => {
  it("renders ten CDs, with only the nearest five visible", () => {
    const changed=vi.fn();
    const {container}=render(
      <ThemeCdShelf themes={GALLERY_THEMES} selectedId="changli" onChoose={changed}/>,
    );
    const shelf=screen.getByRole("navigation",{name:"Escolher tema pronto"});
    expect(shelf.querySelectorAll("button")).toHaveLength(10);
    expect(container.querySelectorAll(".theme-cd-glass-frame")).toHaveLength(10);
    expect(container.querySelectorAll(".theme-cd-case[data-cd-hidden='true']")).toHaveLength(5);
    expect(screen.getByText("ACERVO / 10 EDIÇÕES")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Changli"})).toHaveAttribute("aria-pressed","true");
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    expect(changed).toHaveBeenCalledWith(GALLERY_THEMES[1]);
  });

  it("keeps keyboard and wraparound arrow navigation for all ten themes",()=>{
    const changed=vi.fn();
    const {rerender}=render(
      <ThemeCdShelf themes={GALLERY_THEMES} selectedId="changli" onChoose={changed}/>,
    );
    fireEvent.click(screen.getByRole("button",{name:"Tema anterior"}));
    expect(changed).toHaveBeenLastCalledWith(GALLERY_THEMES[9]);
    rerender(<ThemeCdShelf themes={GALLERY_THEMES}
      selectedId="kyoraku" onChoose={changed}/>);
    fireEvent.click(screen.getByRole("button",{name:"Próximo tema"}));
    expect(changed).toHaveBeenLastCalledWith(GALLERY_THEMES[0]);
    fireEvent.keyDown(screen.getByRole("navigation",{name:"Escolher tema pronto"}),
      {key:"ArrowLeft"});
    expect(changed).toHaveBeenLastCalledWith(GALLERY_THEMES[8]);
  });

  it("maps all ten entries to the already-published media files",()=>{
    expect(GALLERY_THEMES).toHaveLength(10);
    expect(Object.keys(THEME_SHELF_MEDIA)).toHaveLength(10);
    const files=[
      "videos-fundo/changli.mp4","videos-fundo/hyuki.mp4","foto-fundo/emilia.png",
      "foto-fundo/furina.png","foto-fundo/tony.png","videos-fundo/hsin.mp4",
      "videos-fundo/shorekeeper.mp4","videos-fundo/wutering.mp4",
      "foto-fundo/doom.png","foto-fundo/kyoraku.png",
    ];
    GALLERY_THEMES.forEach((theme,index)=>{
      const media=THEME_SHELF_MEDIA[theme.id as keyof typeof THEME_SHELF_MEDIA];
      expect(media.video||media.cover).toBe("/assets/hyprland/temas/"+files[index]);
    });
  });

  it("applies supplied colors from all ten dark Quickshell schemes", () => {
    const values: Record<string,readonly [string,string,string]> = {
      changli: ["#ca5230","#e17f72","#e3b37a"],
      hiyuki: ["#C96A85","#C18CB4","#A0B2DF"],
      emilia: ["#b787ff","#576fff","#91a9ff"],
      furina: ["#9dc7ff","#92dbea","#e9ce9b"],
      "hotline-miami": ["#f10d6e","#f1b696","#e7aec3"],
      hsin: ["#d94639","#a93341","#e7e9ef"],
      shorekeeper: ["#738ae8","#73b4e8","#738de8"],
      wuthering: ["#4a5cb4","#a875e0","#d98da0"],
      doom: ["#e89073","#a9e873","#e8bd73"],
      kyoraku: ["#d49900","#c1e839","#e89b31"],
    };
    expect(GALLERY_THEMES).toHaveLength(10);
    for (const theme of GALLERY_THEMES) {
      const palette=GALLERY_PALETTES[theme.id as keyof typeof GALLERY_PALETTES];
      const [primary,secondary,tertiary]=values[theme.id];
      expect([palette.accentPrimary,palette.accentRed,palette.accentYellow])
        .toEqual([primary,secondary,tertiary]);
      expect(theme.palette).toBe(palette);
    }
    const {container}=render(
      <ThemeCdShelf themes={GALLERY_THEMES} selectedId="hsin" onChoose={()=>{}}/>,
    );
    expect(container.querySelector(".theme-cd-stage"))
      .toHaveStyle({"--cd-spotlight":"#d94639","--cd-rim":"#e7e9ef"});
    expect(container.querySelector('button[aria-label="Hsin"]'))
      .toHaveStyle({"--cd-case-color":"#d94639"});
  });

  it("mounts every video cover and enables autoplay only for selected CD",()=>{
    const {container,rerender}=render(
      <ThemeCdShelf themes={GALLERY_THEMES} selectedId="hiyuki" onChoose={()=>{}}/>,
    );
    expect(container.querySelectorAll(".theme-cd-case video")).toHaveLength(5);
    const hiyuki=container.querySelector('button[aria-label="Hiyuki"] video')!;
    expect(hiyuki).toHaveAttribute("autoplay");
    expect(hiyuki.querySelector("source")).toHaveAttribute("src",THEME_SHELF_MEDIA.hiyuki.video);
    const changli=container.querySelector('button[aria-label="Changli"] video')!;
    expect(changli).not.toHaveAttribute("autoplay");

    rerender(<ThemeCdShelf themes={GALLERY_THEMES} selectedId="furina" onChoose={()=>{}}/>);
    expect(container.querySelectorAll(".theme-cd-case video")).toHaveLength(5);
    expect(container.querySelectorAll(".theme-cd-case video[autoplay]")).toHaveLength(0);
    expect(container.querySelector('button[aria-label="Furina"] img'))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.furina.cover);
  });

  it("rotates the shelf from wheel gestures without relying on page scrolling",()=>{
    const changed=vi.fn();
    const clock=vi.spyOn(Date,"now").mockReturnValue(1000);
    const {container,rerender}=render(
      <ThemeCdShelf themes={GALLERY_THEMES} selectedId="changli" onChoose={changed}/>,
    );
    fireEvent.wheel(container.querySelector(".theme-cd-stage")!,{deltaY:120});
    expect(changed).toHaveBeenLastCalledWith(GALLERY_THEMES[1]);
    rerender(<ThemeCdShelf themes={GALLERY_THEMES} selectedId="hiyuki" onChoose={changed}/>);
    clock.mockReturnValue(1400);
    fireEvent.wheel(container.querySelector(".theme-cd-stage")!,{deltaY:-120});
    expect(changed).toHaveBeenLastCalledWith(GALLERY_THEMES[0]);
  });

  it("rotates horizontally on a touch swipe but ignores tiny movements",()=>{
    const changed=vi.fn();
    const {container}=render(
      <ThemeCdShelf themes={GALLERY_THEMES} selectedId="changli" onChoose={changed}/>,
    );
    const nav=container.querySelector(".theme-cd-shelf")!;
    fireEvent.touchStart(nav,{touches:[{clientX:240}]});
    fireEvent.touchEnd(nav,{changedTouches:[{clientX:115}]});
    expect(changed).toHaveBeenCalledWith(GALLERY_THEMES[1]);
    changed.mockClear();
    fireEvent.touchStart(nav,{touches:[{clientX:240}]});
    fireEvent.touchEnd(nav,{changedTouches:[{clientX:232}]});
    expect(changed).not.toHaveBeenCalled();
  });

  it("shows only actual media in the large preview, with no desktop widgets",()=>{
    const {container}=render(<HyprlandShowcase/>);
    const stage=()=>container.querySelector(".preset-stage")!;
    expect(stage().querySelector("video.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.changli.video);
    expect(stage().querySelector(".changli-desktop")).toBeNull();
    expect(stage().querySelector(".preset-desktop-widgets")).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Hiyuki"}));
    expect(stage().querySelector("video.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.hiyuki.video);
    fireEvent.click(screen.getByRole("button",{name:"Emilia"}));
    expect(stage().querySelector("img.preset-media-wallpaper"))
      .toHaveAttribute("src",THEME_SHELF_MEDIA.emilia.cover);
    expect(stage().querySelector(".preset-widget")).toBeNull();
  });
});
