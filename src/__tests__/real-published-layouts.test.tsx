import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HyprlandShowcase } from "../components/HyprlandShowcase";
import { OFFICIAL_THEMES } from "../stores/themes";
import { validatePublishedLayouts, sanitizeQuickshellProfiles } from "../services/quickshellLayoutImport";
import published from "../data/published-widget-layouts.json";

beforeEach(() => window.localStorage.clear());
afterEach(() => { window.localStorage.clear(); vi.restoreAllMocks(); });

const data = validatePublishedLayouts(published);
const count = (theme:string) => data.profiles.filter(p=>p.themeId===theme).length;

describe("M6 real Quickshell wallpaper profiles — sanitized publication", () => {
  it("preserves 19 different wallpaper profiles and all 268 enabled widgets", () => {
    expect(data.profiles).toHaveLength(19);
    expect(data.profiles.reduce((sum,p)=>sum+p.widgets.length,0)).toBe(268);
    expect(count("changli")).toBe(4);
    expect(count("hiyuki")).toBe(3);
    expect(count("emilia")).toBe(3);
    expect(count("furina")).toBe(2);
    expect(count("hsin")).toBe(1);
    expect(count("hotline-miami")).toBe(1);
    expect(count("outros")).toBe(5);
  });

  it("never exposes a local filesystem path, image filename or personal note", () => {
    const plain=JSON.stringify(data);
    for(const fragment of ["/home/","/mnt/","Downloads","Pictures",
      ".mp4",".jpeg",".jpg",".png","wallpaperflare","upscayl","/home/pedro/"]) {
      expect(plain).not.toContain(fragment);
    }
  });

  it("retains measured card dimensions and scene layers, including the background visualizer", () => {
    const changli = data.profiles.find(p=>p.themeId==="changli")!;
    const card=changli.widgets.find(w=>w.kind==="imageCard")!;
    expect(card.x).toBeCloseTo(2964/3440*100,3);
    expect(card.y).toBeCloseTo(72/1440*100,3);
    expect(card.width).toBeCloseTo(433/3440*100,3);
    expect(card.height).toBeCloseTo(920/1440*100,3);
    expect(card.z).toBe(62);
    expect(card.sizeMode).toBe("2x2");
    const visualizer=changli.widgets.find(w=>w.kind==="visualizer")!;
    expect(visualizer.z).toBe(-1000);
    expect(visualizer.height).toBeCloseTo(260/1440*100,3);
  });

  it("switches original variants without editing the published widget data", () => {
    const before=JSON.stringify(data.profiles);
    const {container}=render(
      <HyprlandShowcase themes={OFFICIAL_THEMES} selectedId="changli" onChoose={vi.fn()}/>,
    );
    const select=screen.getByRole("combobox",{name:"Outras composições prontas"});
    expect(select.querySelectorAll("option")).toHaveLength(4);
    const first=container.querySelector(".preset-widget") as HTMLElement;
    const initial=first.style.left;
    fireEvent.change(select,{target:{value:"changli-2"}});
    expect((container.querySelector(".preset-widget") as HTMLElement).style.left).not.toBe(initial);
    expect(screen.queryByRole("button",{name:"Adicionar Relógio"})).not.toBeInTheDocument();
    expect(JSON.stringify(data.profiles)).toBe(before);
  });

  it("imports two versions of the same named theme instead of silently replacing the first", () => {
    const raw = {profiles:{
      "/wallpapers/changli-one.mp4":{clock:{enable:true,x:100,y:200,z:13}},
      "/wallpapers/changli-two.mp4":{clock:{enable:true,x:300,y:400,z:17}},
    }};
    const sanitized = sanitizeQuickshellProfiles(raw);
    expect(sanitized.profiles.map(p=>p.variantId)).toEqual(["changli-1","changli-2"]);
    expect(sanitized.profiles[0].widgets[0].x).not.toBe(sanitized.profiles[1].widgets[0].x);
    expect(validatePublishedLayouts(sanitized)).toEqual(sanitized);
  });

  it("rejects malformed duplicate profiles and concealed file paths", () => {
    const duplicates={schemaVersion:1,source:"sanitized-quickshell",profiles:[
      {themeId:"changli",variantId:"changli-1",widgets:[]},
      {themeId:"changli",variantId:"changli-1",widgets:[]},
    ]};
    expect(()=>validatePublishedLayouts(duplicates)).toThrow("repetida");
    expect(()=>validatePublishedLayouts({schemaVersion:1,source:"sanitized-quickshell",profiles:[
      {themeId:"changli",variantId:"changli-1",label:"/home/private",widgets:[]},
    ]})).toThrow("Rótulo");
  });
});
