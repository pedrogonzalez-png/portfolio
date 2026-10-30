import { useEffect, useRef } from "react";
import { useTheme } from "../stores/themeContext";

type Particle = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  seed: number;
};

/**
 * Mobile/non-WebGL counterpart to the desktop Scene3D particle heading.
 * Uses the SAME accessible h1, computed font, words and theme colors.
 * The visible text is hidden only after Canvas has painted real dots.
 */
export function MobileParticleName({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const heading = document.getElementById("hero-name");
    const label = heading?.querySelector<HTMLElement>(".hero-title-fallback");
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || !heading || !label) return;

    let disposed = false;
    let width = 0;
    let height = 0;
    let dots: Particle[] = [];
    let frame = 0;
    let lastFrame = 0;
    let pointerX = -10000;
    let pointerY = -10000;
    let movedAt = 0;
    let pulsedAt = -10000;
    let pulseX = -10000;
    let pulseY = -10000;
    let inside = false;
    let idleTriggered = false;

    const animate = !reducedMotion;
    const bronze = theme.palette.accentPrimary;
    const gold = theme.palette.accentYellow;

    const render = (now: number) => {
      if (disposed) return;
      if (animate && lastFrame && now - lastFrame < 30) {
        frame = window.requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      const age = now - pulsedAt;
      const pulse = animate && age >= 0 && age < 1100
        ? Math.sin(Math.PI * age / 1100) ** 2 : 0;

      for (const dot of dots) {
        const distance = Math.hypot(dot.targetX - pulseX, dot.targetY - pulseY);
        const proximity = Math.max(0, 1 - distance / 115);
        const strength = pulse * proximity * proximity;
        const theta = dot.seed * Math.PI * 2;
        const desiredX = dot.targetX + Math.cos(theta) * strength * 54;
        const desiredY = dot.targetY + Math.sin(theta) * strength * 44;
        const easing = animate ? 0.22 : 1;
        dot.x += (desiredX - dot.x) * easing;
        dot.y += (desiredY - dot.y) * easing;

        context.globalAlpha = 0.73 + dot.seed * 0.27;
        context.fillStyle = dot.seed > .43 ? gold : bronze;
        context.beginPath();
        context.arc(dot.x, dot.y, width < 500 ? 1.05 : 1.3, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      if (animate && inside && !idleTriggered && now - movedAt > 950
          && now - pulsedAt > 950) {
        pulseX = pointerX;
        pulseY = pointerY;
        pulsedAt = now;
        idleTriggered = true;
      }
      if (animate) frame = window.requestAnimationFrame(render);
    };

    const resize = () => {
      if (disposed) return;
      const bounds = heading.getBoundingClientRect();
      width = Math.round(bounds.width);
      height = Math.round(bounds.height);
      if (width < 100 || height < 18) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const raster = document.createElement("canvas");
      raster.width = width;
      raster.height = height;
      const sample = raster.getContext("2d", { willReadFrequently: true });
      if (!sample) return;

      // Exactly the heading already used on desktop; no duplicated name,
      // no second font size, no hard-coded alternate text.
      const computed = window.getComputedStyle(heading);
      sample.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
      sample.textAlign = "center";
      sample.textBaseline = "middle";
      sample.fillStyle = "white";
      sample.fillText(label.textContent?.trim() || "", width / 2, height / 2, width * .94);
      const pixels = sample.getImageData(0, 0, width, height).data;
      const stride = width < 500 ? 2 : 3;
      const sampled: Particle[] = [];
      for (let y = 0; y < height; y += stride) {
        for (let x = 0; x < width; x += stride) {
          if (pixels[(y * width + x) * 4 + 3] < 160) continue;
          const index = sampled.length;
          const seed = Math.abs(Math.sin((index + 1) * 78.233) * 43758.5453) % 1;
          const angle = index * 2.39996;
          const spread = animate ? (8 + seed * 27) : 0;
          sampled.push({
            targetX: x, targetY: y, seed,
            x: x + Math.cos(angle) * spread,
            y: y + Math.sin(angle) * spread,
          });
        }
      }
      if (!sampled.length) return;

      dots = sampled;
      window.cancelAnimationFrame(frame);
      lastFrame = 0;
      render(performance.now());
      // Important: includes a stronger selector than the reduced-motion rule
      // that previously caused TWO overlapping headings on mobile.
      heading.classList.add("particles-ready", "has-mobile-particles");
    };

    const coordinate = (event: PointerEvent) => {
      const bounds = heading.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      return { x, y, valid: x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height };
    };
    const move = (event: PointerEvent) => {
      if (!animate) return;
      const { x, y, valid } = coordinate(event);
      if (!valid) { inside = false; return; }
      const now = performance.now();
      if (!inside || Math.hypot(x - pointerX, y - pointerY) > 4) {
        movedAt = now;
        idleTriggered = false;
      }
      if ((!inside || Math.hypot(x - pointerX, y - pointerY) > 55)
          && now - pulsedAt > 400) {
        pulseX = x; pulseY = y; pulsedAt = now;
      }
      inside = true;
      pointerX = x;
      pointerY = y;
    };
    const touch = (event: PointerEvent) => {
      if (!animate) return;
      const { x, y, valid } = coordinate(event);
      if (!valid) return;
      pulseX = x; pulseY = y;
      pulsedAt = performance.now();
      idleTriggered = true;
    };
    const leave = () => { inside = false; };

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(heading);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", touch, { passive: true });
    window.addEventListener("blur", leave);
    resize();
    document.fonts?.ready.then(() => { if (!disposed) resize(); }).catch(() => {});

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", touch);
      window.removeEventListener("blur", leave);
      heading.classList.remove("particles-ready", "has-mobile-particles");
    };
  }, [reducedMotion, theme.palette.accentPrimary, theme.palette.accentYellow]);

  return <canvas ref={canvasRef} className="mobile-particle-name" data-particle-name="mobile" aria-hidden="true" />;
}
