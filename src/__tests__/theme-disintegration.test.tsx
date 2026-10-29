import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ThemeDisintegration } from "../components/desktop/ThemeDisintegration";

describe("organic disintegration is not a straight sliding curtain", () => {
  const mount = () => render(
    <ThemeDisintegration oldAccent="#c96a42" oldSecondary="#edaa77"
      newAccent="#627dbf" onFinished={vi.fn()}>
      <div data-testid="old-desktop">OLD DESKTOP CONTENT</div>
    </ThemeDisintegration>,
  );

  it("breaks the actual old DOM into independently delayed masked cells", () => {
    const { container } = mount();
    const cells = Array.from(container.querySelectorAll<SVGRectElement>(".preset-fracture-cell"));
    expect(cells).toHaveLength(720);
    const mask = container.querySelector(".preset-fractured-desktop") as HTMLElement;
    expect(mask).not.toBeNull();
    expect(mask.style.maskImage).toContain("preset-fracture-mask-");
    expect(mask.style.clipPath).toBe("");
    const id = container.querySelector("mask")!.id;
    expect(mask.style.maskImage).toContain(id);
    // The right half begins disappearing before the left half, not in
    // one straight vertical edge where every row has the same timing.
    const toDelay = (cell: SVGRectElement) => parseInt(cell.style.animationDelay, 10);
    const left = cells.filter(c => Number(c.getAttribute("x")) < 0.25);
    const right = cells.filter(c => Number(c.getAttribute("x")) > 0.75);
    const avg = (arr: SVGRectElement[]) =>
      arr.reduce((sum, c) => sum + toDelay(c), 0) / arr.length;
    expect(avg(right)).toBeLessThan(avg(left) - 500);
    const delaysOfSameColumn = cells.filter((c) => Number(c.getAttribute("x")) < 0.01)
      .map(toDelay);
    expect(new Set(delaysOfSameColumn).size).toBeGreaterThan(8);
  });

  it("detaches hundreds of differently colored shards spread across the scene", () => {
    const {container} = mount();
    const shards = Array.from(container.querySelectorAll<HTMLElement>(".preset-fragment"));
    expect(shards).toHaveLength(260);
    const colors = new Set(shards.map(s=>s.style.getPropertyValue("--frag-color")));
    expect(colors.size).toBe(4);
    const x = shards.map(s=>parseFloat(s.style.getPropertyValue("--frag-x")));
    expect(Math.min(...x)).toBeLessThan(10);
    expect(Math.max(...x)).toBeGreaterThan(90);
    expect(container.querySelector(".preset-dissolve-dust")).toBeNull();
    expect(container.querySelector(".preset-dissolve-out")).toBeNull();
  });

  it("keeps old desktop content until the full disintegration completes", () => {
    const finish = vi.fn();
    const {container} = render(
      <ThemeDisintegration oldAccent="#c96a42" oldSecondary="#f8aa70"
        newAccent="#8b88d3" onFinished={finish}>
        <div>Previous scene</div>
      </ThemeDisintegration>,
    );
    expect(container).toHaveTextContent("Previous scene");
    fireEvent.animationEnd(container.querySelector(".preset-fragment")!);
    expect(finish).not.toHaveBeenCalled();
    fireEvent.animationEnd(container.querySelector(".preset-disintegration-lifetime")!);
    expect(finish).toHaveBeenCalledOnce();
  });
});
