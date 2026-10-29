import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChangliDesktop } from "../components/desktop/ChangliDesktop";
import { changliDesktop } from "../data/changliDesktop";

const slots = [
  "notes","profile","feature","todo","brand","player",
  "calendar","world-clock","portrait","weather","timers",
] as const;

describe("Changli — coded reference screenshot", () => {
  it("recreates all main screenshot regions with deterministic locations", () => {
    const {container}=render(<ChangliDesktop/>);
    for(const name of slots) {
      const slot=container.querySelector('[data-changli-slot="' + name + '"]') as HTMLElement|null;
      expect(slot).not.toBeNull();
      expect(slot!.style.left).toMatch(/%$/);
      expect(slot!.style.top).toMatch(/%$/);
      expect(slot!.style.width).toMatch(/%$/);
      expect(slot!.style.height).toMatch(/%$/);
    }
    expect(container.querySelectorAll(".changli-stat-tile")).toHaveLength(3);
    expect(container.querySelectorAll(".changli-timer")).toHaveLength(3);
    expect(screen.getByText(/WUTHERING/)).toBeInTheDocument();
  });

  it("does not reference any external image URL or require unavailable local media", () => {
    expect(Object.values(changliDesktop.media)).toEqual(["","","","","","",""]);
    const {container}=render(<ChangliDesktop/>);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelectorAll("[data-media-placeholder]").length).toBeGreaterThan(3);
    expect(container.querySelector(".changli-wallpaper-gradient")).not.toBeNull();
  });

  it("renders semantic date/calendar and world-clock panels, not captured screenshots", () => {
    const {container}=render(<ChangliDesktop/>);
    expect(container.querySelector(".changli-calendar-grid")).not.toBeNull();
    expect(container.querySelector(".changli-world-grid")?.children.length).toBe(4);
    expect(container.querySelector(".changli-notes-stack")?.children.length).toBe(3);
    expect(container.querySelector(".changli-todo")?.children.length).toBe(4);
    expect(screen.getByLabelText(/Exemplo visual de widget de clima/)).toBeInTheDocument();
  });

  it("honors accent selection without offering visitors widget editing", () => {
    const {container}=render(<ChangliDesktop accent="#123abc"/>);
    const desktop=container.querySelector(".changli-desktop") as HTMLElement;
    expect(desktop.style.getPropertyValue("--changli-accent")).toBe("#123abc");
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.querySelectorAll("input")).toHaveLength(0);
  });
});
