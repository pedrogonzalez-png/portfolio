import { describe, expect, it } from "vitest";
import { sanitizeQuickshellProfiles, validatePublishedLayouts, WIDGET_KINDS } from "../services/quickshellLayoutImport";

describe("Quickshell per-wallpaper widget layout import", () => {
  const fixture = () => ({
    version: 1,
    profiles: {
      "/home/pedro/.config/wallpapers/changli.mp4": {
        clock: { enable: true, placementStrategy: "free", x: 1720, y: 360, size: 12 },
        weather: { enable: false, x: 430, y: 123 },
        imageCard: { enable: true, x: 516, y: 720, cardWidth: 276, cardHeight: 120,
          path: "/home/pedro/Private/do-not-publish.png", note: "SECRETS" },
        notes: { enable: true, x: 820, y: 240, text: "private personal note" },
      },
      "/home/pedro/.config/wallpapers/hsin.png": {
        clock: { enable: true, x: 300, y: 400 },
      },
    },
  });

  it("identifies all QML widget kinds from the public WallpaperLayouts service", () => {
    expect(WIDGET_KINDS).toContain("imageCard6");
    expect(WIDGET_KINDS).toContain("visualizer");
    expect(WIDGET_KINDS).toContain("resources");
    expect(WIDGET_KINDS).toContain("todo");
    expect(WIDGET_KINDS.length).toBe(21);
  });

  it("maps wallpaper profiles to themes using numeric positions, dropping private fields", () => {
    const result = sanitizeQuickshellProfiles(fixture());
    expect(result.profiles.map(p=>p.themeId)).toEqual(["changli", "hsin"]);
    const changli = result.profiles[0];
    expect(changli.widgets.map(x=>x.kind)).toEqual(["clock","notes","imageCard"]);
    expect(changli.widgets[0].x).toBeCloseTo(50);
    expect(changli.widgets[0].y).toBeCloseTo(25);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("home/pedro");
    expect(serialized).not.toContain("SECRETS");
    expect(serialized).not.toContain("personal note");
    expect(serialized).not.toContain("Private");
    expect(serialized).not.toContain("do-not-publish");
    expect(validatePublishedLayouts(result)).toEqual(result);
  });

  it("rejects invalid/corrupted JSON or suspicious public position records", () => {
    expect(() => sanitizeQuickshellProfiles({})).toThrow("profiles");
    expect(() => sanitizeQuickshellProfiles({profiles:{foo:{clock:{enable:true,x:1,y:1}}}}))
      .toThrow("Nenhum perfil");
    expect(() => validatePublishedLayouts({
      schemaVersion:1,source:"sanitized-quickshell",
      profiles:[{themeId:"changli",widgets:[{kind:"clock",x:Infinity,y:0,width:15,height:10}]}],
    })).toThrow("Geometria");
    expect(() => validatePublishedLayouts({
      schemaVersion:1,source:"sanitized-quickshell",
      profiles:[{themeId:"changli",widgets:[{kind:"script",x:10,y:10,width:10,height:10}]}],
    })).toThrow("Geometria");
  });

  it("preserves Hiyuki's public filename variant hutuki", () => {
    const result = sanitizeQuickshellProfiles({profiles:{
      "/mnt/jogos/wallpapers/hutuki.mp4":{clock:{enable:true,x:250,y:400}},
    }});
    expect(result.profiles[0].themeId).toBe("hiyuki");
  });

  it("limits imported profiles, refuses oversized data in the UI and never stores paths", () => {
    const files = Object.fromEntries(Array.from({length:101},(_,i)=>[
      "/home/private/changli-"+i+".png",{clock:{enable:true,x:1,y:1}},
    ]));
    expect(()=>sanitizeQuickshellProfiles({profiles:files})).toThrow("limite");
  });
});
